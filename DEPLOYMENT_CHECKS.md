# Build and deployment verification

Checks run against the corrected project:
- TypeScript: PASS (`npm run typecheck`)
- ESLint: PASS (`npm run lint`; remaining messages are non-blocking warnings)
- Render Blueprint: configured for Node 22.16.0, `npm ci`, typecheck, lint, Next build, and `/api/health`
- Environment hygiene: `.env.local` excluded; `.env.example` contains placeholders only

Build limitation:
- A full local `next build` could not complete in this sandbox because the uploaded `node_modules` contains the Windows SWC native binary, not the Linux binary required by this environment, and network access to fetch the Linux binary was unavailable. Render's `npm ci` installs platform-appropriate optional dependencies from `package-lock.json`; the actual Render build remains the definitive build verification.

Required before deployment:
1. Set `DATABASE_URL` in Render to the intended Neon pooled PostgreSQL URL (with `sslmode=require`).
2. Apply the Drizzle schema to that same database using the command in `DEPLOYMENT.md`.
3. Run the admin setup command if an administrator account is needed.

Production caveat:
- Uploads currently use the local filesystem. Render's default filesystem is ephemeral; configure durable object storage before relying on uploaded images in production.
