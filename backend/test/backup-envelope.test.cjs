const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { encrypt, decrypt } = require('../scripts/backup-envelope.cjs');
test('encrypted backup roundtrip and tamper rejection', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vmx-envelope-'));
  const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const input = path.join(dir, 'input'), encoded = path.join(dir, 'encoded'), decoded = path.join(dir, 'decoded');
  const data = Buffer.concat([Buffer.from('PRIVATE-FIXTURE-NEVER-UPLOAD-IN-CLEAR'), crypto.randomBytes(128 * 1024)]);
  try {
    await fs.writeFile(input, data);
    await encrypt(input, encoded, keys.publicKey);
    const cipher = await fs.readFile(encoded);
    assert.equal(cipher.includes(Buffer.from('PRIVATE-FIXTURE-NEVER-UPLOAD-IN-CLEAR')), false);
    await decrypt(encoded, decoded, keys.privateKey);
    assert.deepEqual(await fs.readFile(decoded), data);
    await assert.rejects(encrypt(input, encoded, keys.publicKey));
    assert.deepEqual(await fs.readFile(encoded), cipher);
    await assert.rejects(decrypt(encoded, decoded, keys.privateKey));
    assert.deepEqual(await fs.readFile(decoded), data);
    const tampered = Buffer.from(cipher); tampered[tampered.length - 20] ^= 1;
    await fs.writeFile(path.join(dir, 'tampered'), tampered);
    await assert.rejects(decrypt(path.join(dir, 'tampered'), path.join(dir, 'failed'), keys.privateKey));
    await assert.rejects(fs.stat(path.join(dir, 'failed')));
    const wrong = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    await assert.rejects(decrypt(encoded, path.join(dir, 'wrong'), wrong.privateKey));
    const headerTampered = Buffer.from(cipher); headerTampered[15] ^= 1;
    await fs.writeFile(path.join(dir, 'bad-header'), headerTampered);
    await assert.rejects(decrypt(path.join(dir, 'bad-header'), path.join(dir, 'bad-out'), keys.privateKey));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
