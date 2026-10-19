const fs = require('node:fs');
const fsp = require('node:fs/promises');
const crypto = require('node:crypto');
const { pipeline } = require('node:stream/promises');
const MAGIC = Buffer.from('VMXBK001');
async function encrypt(input, output, publicKey) {
  const key = crypto.randomBytes(32), iv = crypto.randomBytes(12);
  const header = Buffer.from(JSON.stringify({ version: 1, algorithm: 'AES-256-GCM+RSA-OAEP-SHA256', iv: iv.toString('base64'), key: crypto.publicEncrypt({ key: publicKey, oaepHash: 'sha256', padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, key).toString('base64') }));
  const length = Buffer.alloc(4); length.writeUInt32BE(header.length);
  let created = false;
  try {
    await fsp.writeFile(output, Buffer.concat([MAGIC, length, header]), { flag: 'wx', mode: 0o600 });
    created = true;
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); cipher.setAAD(header);
    await pipeline(fs.createReadStream(input), cipher, fs.createWriteStream(output, { flags: 'a', mode: 0o600 }));
    await fsp.appendFile(output, cipher.getAuthTag());
  } catch (error) { if (created) await fsp.unlink(output).catch(() => {}); throw error; }
  finally { key.fill(0); }
}
async function decrypt(input, output, privateKey) {
  const file = await fsp.open(input, 'r');
  let key, created = false;
  try {
    const size = (await file.stat()).size;
    const prefix = Buffer.alloc(12); await file.read(prefix, 0, 12, 0);
    if (!prefix.subarray(0, 8).equals(MAGIC)) throw new Error('Invalid encrypted backup');
    const length = prefix.readUInt32BE(8);
    if (length < 1 || length > 65536 || size < 12 + length + 16) throw new Error('Invalid backup header');
    const header = Buffer.alloc(length); await file.read(header, 0, length, 12);
    const meta = JSON.parse(header.toString('utf8'));
    if (meta.version !== 1 || meta.algorithm !== 'AES-256-GCM+RSA-OAEP-SHA256') throw new Error('Unsupported backup encryption');
    key = crypto.privateDecrypt({ key: privateKey, oaepHash: 'sha256', padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(meta.key, 'base64'));
    const iv = Buffer.from(meta.iv, 'base64');
    if (key.length !== 32 || iv.length !== 12) throw new Error('Invalid encryption parameters');
    const tag = Buffer.alloc(16); await file.read(tag, 0, 16, size - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv); decipher.setAAD(header); decipher.setAuthTag(tag);
    const start = 12 + length, end = size - 17;
    if (start > end) throw new Error('Empty backup payload');
    await fsp.writeFile(output, Buffer.alloc(0), { flag: 'wx', mode: 0o600 });
    created = true;
    await pipeline(fs.createReadStream(input, { start, end }), decipher, fs.createWriteStream(output, { flags: 'a', mode: 0o600 }));
  } catch (error) { if (created) await fsp.unlink(output).catch(() => {}); throw error; }
  finally { await file.close(); key?.fill(0); }
}
module.exports = { encrypt, decrypt };
if (require.main === module) {
  const [mode, input, output, keyPath] = process.argv.slice(2);
  if (!['encrypt', 'decrypt'].includes(mode) || !input || !output || !keyPath) { console.error('Usage: backup-envelope.cjs encrypt|decrypt INPUT OUTPUT KEY_FILE'); process.exit(1); }
  const key = fs.readFileSync(keyPath, 'utf8');
  ({ encrypt, decrypt })[mode](input, output, key).catch(() => { console.error('Encrypted backup operation failed; private contents withheld'); process.exitCode = 1; });
}
