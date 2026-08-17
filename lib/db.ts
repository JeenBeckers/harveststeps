import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { seedPersistedState } from "./seed";
import type { FeatureRequest, FeatureRequestEvent, FeatureRequestSpec, FeatureRequestStatus, PersistedAppState } from "./types";

export type Role = "viewer" | "editor" | "admin";

export type FeatureRequestImage = {
  mimeType: string;
  /** De afbeelding als base64; bytea-parameters worden niet ondersteund via de Neon HTTP-driver. */
  dataBase64: string;
};

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
  await sql`
    CREATE TABLE IF NOT EXISTS feature_requests (
      id serial PRIMARY KEY,
      title text NOT NULL,
      problem text NOT NULL,
      desired_outcome text NOT NULL,
      in_scope text NOT NULL,
      out_of_scope text NOT NULL,
      area text NOT NULL,
      priority varchar(20) NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'concept',
      requested_by_email varchar(255) NOT NULL,
      reviewer_email varchar(255),
      review_comment text,
      github_issue_url text,
      pr_url text,
      preview_url text,
      flag_key varchar(80) UNIQUE,
      is_live boolean NOT NULL DEFAULT false,
      live_toggled_by varchar(255),
      live_toggled_at timestamptz,
      rollback_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS feature_request_images (
      feature_request_id integer PRIMARY KEY REFERENCES feature_requests(id) ON DELETE CASCADE,
      mime_type varchar(40) NOT NULL,
      data_base64 text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS feature_request_events (
      id serial PRIMARY KEY,
      feature_request_id integer NOT NULL REFERENCES feature_requests(id),
      event text NOT NULL,
      actor_email varchar(255) NOT NULL,
      detail text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  schemaEnsured = true;

  await ensureSeedUser();
  await ensureSeedAppState();
  await ensureSeedAdminPromoted();
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
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, 'admin')
    ON CONFLICT (email) DO NOTHING
  `;
}

/** Promotes SEED_ADMIN_EMAIL to admin if no admin exists yet (covers accounts seeded before the admin role existed). */
async function ensureSeedAdminPromoted(): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT count(*)::int AS count FROM users WHERE role = 'admin'`;
  if ((rows[0] as { count: number }).count > 0) return;

  const email = process.env.SEED_ADMIN_EMAIL;
  if (!email) return;
  await sql`UPDATE users SET role = 'admin' WHERE email = ${email.toLowerCase().trim()}`;
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
  const rows = await sql`SELECT count(*)::int AS count FROM users WHERE role IN ('editor', 'admin')`;
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
  const data = rows[0].data as Partial<PersistedAppState>;
  return { ...data, bookmarks: data.bookmarks ?? [] } as PersistedAppState;
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function createFeatureRequest(
  spec: FeatureRequestSpec,
  requestedByEmail: string,
  image: FeatureRequestImage | null = null
): Promise<FeatureRequest> {
  await ensureSchema();
  const sql = getSql();
  const flagKey = `${slugify(spec.title)}-${Date.now().toString(36)}`;
  const rows = await sql`
    INSERT INTO feature_requests
      (title, problem, desired_outcome, in_scope, out_of_scope, area, priority, status, requested_by_email, flag_key)
    VALUES
      (${spec.title}, ${spec.problem}, ${spec.desiredOutcome}, ${spec.inScope}, ${spec.outOfScope}, ${spec.area}, ${spec.priority}, 'concept', ${requestedByEmail}, ${flagKey})
    RETURNING *
  `;
  const id = rows[0].id as number;
  if (image) {
    await sql`
      INSERT INTO feature_request_images (feature_request_id, mime_type, data_base64)
      VALUES (${id}, ${image.mimeType}, ${image.dataBase64})
    `;
  }
  await addFeatureRequestEvent(id, "created", requestedByEmail, null);
  return rowToFeatureRequest({ ...rows[0], has_image: Boolean(image) });
}

export async function listFeatureRequests(): Promise<FeatureRequest[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT f.*, (i.feature_request_id IS NOT NULL) AS has_image
    FROM feature_requests f
    LEFT JOIN feature_request_images i ON i.feature_request_id = f.id
    ORDER BY f.created_at DESC
  `;
  return rows.map(rowToFeatureRequest);
}

export async function getFeatureRequestById(id: number): Promise<FeatureRequest | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT f.*, (i.feature_request_id IS NOT NULL) AS has_image
    FROM feature_requests f
    LEFT JOIN feature_request_images i ON i.feature_request_id = f.id
    WHERE f.id = ${id}
  `;
  if (rows.length === 0) return null;
  return rowToFeatureRequest(rows[0]);
}

export async function requestFeatureReview(id: number, reviewerEmail: string, actorEmail: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE feature_requests
    SET reviewer_email = ${reviewerEmail}, status = 'ter_review', updated_at = now()
    WHERE id = ${id}
  `;
  await addFeatureRequestEvent(id, "review_requested", actorEmail, reviewerEmail);
}

export async function submitFeatureReview(id: number, comment: string, actorEmail: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE feature_requests
    SET review_comment = ${comment}, status = 'concept', updated_at = now()
    WHERE id = ${id}
  `;
  await addFeatureRequestEvent(id, "reviewed", actorEmail, comment);
}

export async function pushFeatureRequestToBuild(id: number, githubIssueUrl: string, actorEmail: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE feature_requests
    SET github_issue_url = ${githubIssueUrl}, status = 'aangevraagd', updated_at = now()
    WHERE id = ${id}
  `;
  await addFeatureRequestEvent(id, "pushed", actorEmail, githubIssueUrl);
}

export async function updateFeatureRequestStatus(
  id: number,
  status: FeatureRequestStatus,
  patch: { prUrl?: string; previewUrl?: string; detail?: string } = {}
): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE feature_requests
    SET status = ${status},
        pr_url = COALESCE(${patch.prUrl ?? null}, pr_url),
        preview_url = COALESCE(${patch.previewUrl ?? null}, preview_url),
        updated_at = now()
    WHERE id = ${id}
  `;
  const detail = patch.detail || patch.prUrl || patch.previewUrl || null;
  await addFeatureRequestEvent(id, `status:${status}`, "github-action", detail);
}

export async function toggleFeatureRequestLive(
  id: number,
  isLive: boolean,
  actorEmail: string,
  reason: string | null
): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE feature_requests
    SET is_live = ${isLive},
        status = ${isLive ? "live" : "uitgeschakeld"},
        live_toggled_by = ${actorEmail},
        live_toggled_at = now(),
        rollback_reason = ${isLive ? null : reason},
        updated_at = now()
    WHERE id = ${id}
  `;
  await addFeatureRequestEvent(id, isLive ? "live" : "rolled_back", actorEmail, reason);
}

export async function getFeatureFlag(flagKey: string): Promise<boolean> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT is_live FROM feature_requests WHERE flag_key = ${flagKey}`;
  if (rows.length === 0) return false;
  return Boolean(rows[0].is_live);
}

export async function getFeatureRequestImage(id: number): Promise<FeatureRequestImage | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT mime_type, data_base64 FROM feature_request_images WHERE feature_request_id = ${id}
  `;
  if (rows.length === 0) return null;
  return { mimeType: rows[0].mime_type as string, dataBase64: rows[0].data_base64 as string };
}

export async function listFeatureRequestEvents(id: number): Promise<FeatureRequestEvent[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM feature_request_events WHERE feature_request_id = ${id} ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    id: r.id as number,
    featureRequestId: r.feature_request_id as number,
    event: r.event as string,
    actorEmail: r.actor_email as string,
    detail: (r.detail as string) ?? null,
    createdAt: r.created_at as string,
  }));
}

async function addFeatureRequestEvent(
  featureRequestId: number,
  event: string,
  actorEmail: string,
  detail: string | null
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO feature_request_events (feature_request_id, event, actor_email, detail)
    VALUES (${featureRequestId}, ${event}, ${actorEmail}, ${detail})
  `;
}

function rowToFeatureRequest(r: Record<string, unknown>): FeatureRequest {
  return {
    id: r.id as number,
    title: r.title as string,
    problem: r.problem as string,
    desiredOutcome: r.desired_outcome as string,
    inScope: r.in_scope as string,
    outOfScope: r.out_of_scope as string,
    area: r.area as string,
    priority: r.priority as string,
    status: r.status as FeatureRequestStatus,
    requestedByEmail: r.requested_by_email as string,
    reviewerEmail: (r.reviewer_email as string) ?? null,
    reviewComment: (r.review_comment as string) ?? null,
    githubIssueUrl: (r.github_issue_url as string) ?? null,
    prUrl: (r.pr_url as string) ?? null,
    previewUrl: (r.preview_url as string) ?? null,
    flagKey: (r.flag_key as string) ?? null,
    isLive: Boolean(r.is_live),
    liveToggledBy: (r.live_toggled_by as string) ?? null,
    liveToggledAt: (r.live_toggled_at as string) ?? null,
    rollbackReason: (r.rollback_reason as string) ?? null,
    hasImage: Boolean(r.has_image),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}
