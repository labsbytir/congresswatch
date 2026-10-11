## Description

<!-- Provide a brief summary of the changes introduced in this pull request. -->

## Related Issue

<!-- Link to the issue this PR fixes or addresses: Closes #123 -->

## Type of Change

- [ ] :bug: Bug fix (non-breaking change which fixes an issue)
- [ ] :sparkles: New feature (non-breaking change which adds functionality)
- [ ] :zap: Performance improvement or edge optimization
- [ ] :package: Database migration (Cloudflare D1 schema change)
- [ ] :books: Documentation update
- [ ] :wrench: CI/CD or tooling configuration

## Database / Migration Changes

- [ ] No database changes required
- [ ] Added a new migration in `migrations/` and verified with `npx wrangler d1 migrations list DB --local`

## Checklist

- [ ] My code follows the code style and standards of this project
- [ ] I have run local validation: `npm run typecheck` passes without errors
- [ ] I have tested these changes locally using local emulator mode (`wrangler dev`)
- [ ] I have added or updated necessary documentation
- [ ] I have not committed any secrets, API keys, or `.dev.vars` files
