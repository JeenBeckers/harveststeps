import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { seedPersistedState } from "./seed";
import type { PersistedAppState } from "./types";

export type Role = "viewer" | "editor";

export type DbUser = {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Connect a Postgres database (Neon) to this Vercel project via the Storage tab."
    );
  }
  return neon(url);
}

let schemaEnsured = false;

export async function ensureSchema(): Promise<void> {
  if (schemaEnsured) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      email varchar(255) NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role varchar(20) NOT NULL DEFAULT 'viewer',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id integer PRIMARY KEY DEFAULT 1,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  schemaEnsured = true;

  await ensureSeedUser();
  await ensureSeedAppState();
}

async function ensureSeedUser(): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM users`;
  const count = (rows[0] as { count: number }).count;
  if (count > 0) return;

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, 'editor')
    ON CONFLICT (email) DO NOTHING
  `;
}

async function ensureSeedAppState(): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM app_state`;
  const count = (rows[0] as { count: number }).count;
  if (count > 0) return;
  await sql`
    INSERT INTO app_state (id, data)
    VALUES (1, ${JSON.stringify(seedPersistedState())})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, role, created_at
    FROM users WHERE email = ${email.toLowerCase().trim()}
  `;
  if (rows.length === 0) return null;
  return rowToUser(rows[0]);
}

export async function findUserById(id: number): Promise<DbUser | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, role, created_at FROM users WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  return rowToUser(rows[0]);
}

export async function listUsers(): Promise<Omit<DbUser, "passwordHash">[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, role, created_at FROM users ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    id: r.id as number,
    email: r.email as string,
    role: r.role as Role,
    createdAt: r.created_at as string,
  }));
}

export async function countEditors(): Promise<number> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM users WHERE role = 'editor'`;
  return (rows[0] as { count: number }).count;
}

export async function createUser(email: string, password: string, role: Role): Promise<DbUser> {
  await ensureSchema();
  const sql = getSql();
  const passwordHash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (email, password_hash, role)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${role})
    RETURNING id, email, password_hash, role, created_at
  `;
  return rowToUser(rows[0]);
}

export async function updateUserRole(id: number, role: Role): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
}

export async function deleteUser(id: number): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function getAppState(): Promise<PersistedAppState> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT data FROM app_state WHERE id = 1`;
  if (rows.length === 0) return seedPersistedState();
  return rows[0].data as PersistedAppState;
}

export async function saveAppState(data: PersistedAppState): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO app_state (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

function rowToUser(r: Record<string, unknown>): DbUser {
  return {
    id: r.id as number,
    email: r.email as string,
    passwordHash: r.password_hash as string,
    role: r.role as Role,
    createdAt: r.created_at as string,
  };
}
