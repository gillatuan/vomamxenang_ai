# Managed Prisma Postgres restore verification and backup key rotation

## Background

The managed database contains the provider-specific `prisma_postgres` extension. A vanilla
`postgres:18` instance cannot restore this provider-owned component. Our isolated
verification therefore validates **application schema and data only**, and keeps the
original full custom-format dump intact for later restore on a compatible provider.

The verifier generates a `pg_restore --list` allowlist, comments out only the
`prisma_postgres` extension entry and its COMMENT, and executes `pg_restore --use-list`
with `--exit-on-error`. Any other restore failure or inventory/fingerprint mismatch
blocks publication. The `verified.json` manifest marks this as
`APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION`, not full provider recovery.

## Important: recovery key compromise

An earlier version of the public repository tracked
`backend/backup/production-recovery-key.pem`, as well as local backup materials.
**Assume historical commits exposed the old recovery key**. Do not use the old public
key for fresh backups. Keep an offline copy of the old private key until you have
safely recovered any historic backups that require it.

On a trusted operator computer, outside the repository:

```sh
mkdir -p "$HOME/vmx-recovery-keys"
chmod 700 "$HOME/vmx-recovery-keys"
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out "$HOME/vmx-recovery-keys/production-recovery-new.pem"
openssl pkey -in "$HOME/vmx-recovery-keys/production-recovery-new.pem" -pubout -out backend/backup-recipient-public.pem
```

The final command assumes the current working directory is the repository root. Do
not upload the private key to GitHub, ChatGPT, Slack, Actions artifacts or Vercel.
Securely retain a private copy in an independently protected offline location.

After securing old recovery keys, remove the tracked private-key file, recovered
plaintext dumps and other sensitive backup material from Git's current tree.
Coordinate a Git history purge, because deleting files in a new commit does not
remove them from public commit history. Rotate any other secrets contained in
past public backups.

The backup and apply workflows refuse to run until the old public key is replaced
and the tracked private-key file is absent. Review this guard before merging.

## Safe release

1. Run CI for the extension validation change.
2. After merging, rotate the backup key pair and remove tracked secrets.
3. Run the hosted encrypted backup on main. Require application-data restore
   verification to pass and save the **full encrypted dump** offsite.
4. Test decryption of the newly encrypted archive with the new private key on a
   trusted operator machine. Full provider-level disaster recovery remains
   dependent on a compatible Prisma Postgres target.
5. Only after independently retained, recoverable backup is confirmed, use
   protected apply for seed 013. Check both warehouse-day posts are PUBLISHED.

No step in this procedure modifies production until the explicit apply job.
