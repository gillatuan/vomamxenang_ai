# Fix: rotate exposed production backup recovery key

The hosted production backup workflow deliberately refuses to encrypt new backups with the former key pair: the private key was committed to the repository. Removing it from the latest commit **does not** undo exposure in Git history.

## Operator step — run on your own trusted machine, not in CI or ChatGPT

1. Preserve any old private key *outside the Git repository*, solely for restoring historic archives. Restrict access to it.
2. Generate a **new** RSA 3072-bit key pair on your own machine. Never commit or upload the private key.

```bash
umask 077
mkdir -p "$HOME/vmx-backup-recovery"
chmod 700 "$HOME/vmx-backup-recovery"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 \
  -out "$HOME/vmx-backup-recovery/production-2026-new-private.pem"
openssl pkey -in "$HOME/vmx-backup-recovery/production-2026-new-private.pem" \
  -pubout -out "$HOME/vmx-backup-recovery/production-2026-new-public.pem"
```

3. Open the **GitHub repository → Settings → Environments → Production → Environment secrets**. Create or update **`BACKUP_RECIPIENT_PUBLIC_PEM`** with the **complete contents of the NEW PUBLIC key** from `production-2026-new-public.pem`. Do not paste the private key anywhere online. Keep the private key securely offline in at least two access-controlled places.
4. After merging the cleanup PR, run **Hosted encrypted backup for seed 013** on `main`. The workflow validates the new public key, rejects the old one, checks isolated restore, and encrypts the complete backup.
5. Download the encrypted artifact to independent private storage. Verify that you can decrypt it using your NEW private key on a trusted machine with the repository's `backend/scripts/backup-envelope.cjs` before continuing.
6. Only after confirming independent encrypted backup retention and recovery capability, invoke the separate protected apply workflow for seed 013.

## Repository and credential remediation

The cleanup PR untracks sensitive files from the current Git tree and ignores future backup artifacts. **It does not purge historical commits**, cached clones or forks; treat the old key and any plaintext backups as publicly exposed. If historical backups contain credential values, rotate affected database/application secrets. Coordinate a Git history rewrite with all collaborators, invalidate old clones, and follow GitHub's sensitive-data-removal procedure. Do not force-push a history rewrite casually during production releases.

The rotation must not be simulated by generating a private key in CI, putting a private key into an Actions artifact, or disabling the backup gate.

If the backup recovery key is not rotated yet, the blocked job is the expected safe behavior. No production writes occur.
