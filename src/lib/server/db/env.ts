// Different Postgres integrations (Vercel's own Storage tab, the Neon
// marketplace listing, Supabase, etc.) inject the connection string under
// different env var names. Check the common ones so attaching any of them
// is enough to switch off the SQLite fallback, which can't write to disk
// on Vercel's read-only, ephemeral filesystem.
export function postgresConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.PRISMA_DATABASE_URL
  );
}
