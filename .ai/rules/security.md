# Security Rules
- Never commit credentials/secret values; validate and whitelist external input.
- Verify authorization independently of UI visibility.
- Preserve webhook signature/raw-body requirements.
- Use least privilege for tokens/CI permissions.
- Review CORS/cookies/JWT changes for production implications.
- Do not leak financial/sensitive operational data in logs or API responses.
- Security-sensitive changes require Reviewer resolution before QA sign-off.
