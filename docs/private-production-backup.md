# Prepared private backup retention flow

This flow is prepared, not active. No durable production backup has been created by this change.

The user's earlier approval covered a plaintext production dump on an ephemeral runner without artifact upload. This separate flow needs explicit approval for encrypted-only GitHub artifact transit and final retention in the user's private ChatGPT Library. No plaintext dump or recovery private key is ever uploaded to GitHub.

1. Generate a dedicated RSA-4096 recovery key pair outside the checkout. Retain the private key in the user's private durable storage before committing only its public key as `backend/backup-recipient-public.pem`.
2. Run the reviewed backup revision with confirmation `SAVE-ENCRYPTED-BACKUP`. It makes a fresh consistent dump and verifies a restore into an isolated PostgreSQL 18 DB before encryption.
3. The helper encrypts the verified archive and reports with AES-256-GCM; its random data key is wrapped using RSA-OAEP-SHA256. The complete envelope header is authenticated. GitHub receives only the encrypted envelope and its SHA-256, with one-day retention for transit. Plaintext temporary files are removed in cleanup.
4. Download and verify the encrypted SHA-256, save the envelope and recovery key to separate private durable items, and decrypt the envelope privately. Verify the dump SHA-256 against the checksum inside the archive. Never claim durable retention until both required items are successfully saved.
5. Keep the recovery private key away from GitHub and public sharing. Losing it makes the encrypted backup unusable. Before a production migration create a fresh verified retained backup for the exact target database/revision; an old or ephemeral verification result cannot grant migration approval.

The workflow is manual-only and requires a public key file not present in this PR, so it cannot currently perform a production backup upload. After explicit approval, the branch can be updated to execute the prepared flow through the available GitHub connector. It never runs migration or seed.

Local tests cover plaintext roundtrip, ciphertext/header tamper rejection, wrong-key rejection and preservation of existing output files. Production restore verification and durable encrypted-file retention remain separate evidence requirements.
