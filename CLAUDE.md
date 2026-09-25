@AGENTS.md

## Project notes

- Prisma 7 with the `prisma-client` generator: the client is generated to `src/generated/prisma` (gitignored) and imported from `@/generated/prisma/client`. Use the shared instance from `src/lib/db.ts`.
- `prisma migrate dev` does not regenerate the client; run `npx prisma generate` after schema changes (`postinstall` does it on install).
- Money fields are integer cents (`*Cents`); format with `formatCents` in `src/lib/format.ts`.
- Before pushing, run `npm run lint`, `npm run typecheck` and `npm run build`.
