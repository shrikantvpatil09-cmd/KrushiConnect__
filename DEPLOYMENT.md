# Deploy KrishiConnect on Render + Neon

The deployable application is the project root (the folder containing `package.json` and `render.yaml`). Render runs it as a Node.js web service; Neon provides PostgreSQL.

## 1. Create and prepare the database

1. Create a PostgreSQL database in Neon.
2. Copy the pooled connection string and ensure it includes `sslmode=require`.
3. Create a local `.env.local` file (not included in this ZIP) containing:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   ```

4. Install dependencies and apply the Drizzle schema to the intended Neon database:

   ```bash
   npm ci
   npx drizzle-kit push --config=drizzle.config.ts
   ```

   Verify the Neon project, branch, and database before running this command. Back up production data before schema changes.

## 2. Deploy to Render

1. Push this project root to a GitHub repository. Do not commit `.env.local` or real credentials.
2. In Render, choose New + → Blueprint and connect the repository (or create a Node Web Service manually).
3. The included `render.yaml` configures the build, start command, and `/api/health` health check.
4. Add `DATABASE_URL` in Render's Environment settings using the Neon pooled connection string. `NODE_ENV` and `PG_POOL_MAX` are set by the Blueprint.
5. Deploy. Render uses Node.js `22.16.0` as pinned in `.node-version`.

## 3. Create an administrator

After the schema exists, run the admin setup script from the Render Shell (or locally against the intended database):

```bash
ADMIN_EMAIL="your-admin-email" ADMIN_PASSWORD="a-strong-unique-password" npm run admin:setup
```

The script uses `DATABASE_URL` from the process environment. Keep the password private. Do not use demo credentials in production.

## 4. Verify the service

Check these routes on the deployed Render URL:

- `/` — home page
- `/browse` — marketplace listings
- `/login` and `/register` — authentication
- `/api/health` — database connectivity health check (returns HTTP 200 only when PostgreSQL responds)

Then test registration, login/logout, listing creation/editing, messaging, purchase/rental requests, and admin-only actions. Check Render Logs if a request fails.

## Important production notes

- Database is required. Set `DATABASE_URL` in Render and apply the schema to that exact database before expecting application routes to work.
- Render's free web services can sleep when idle. First requests after idle may be slow.
- The current image upload endpoint writes to local disk. Render's filesystem is ephemeral, so uploaded files can disappear after redeploy/restart. Configure durable object storage (S3/Cloudinary) before relying on production uploads.
- Set up database backups, monitoring, rate limits, and email delivery before public launch.
- The demo seed endpoint is disabled in production.
- Never commit `.env.local`, production database URLs, admin passwords, or webhook secrets.
