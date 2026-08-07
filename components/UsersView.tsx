"use client";

import { useEffect, useState } from "react";

type ApiUser = { id: number; email: string; role: "viewer" | "editor"; createdAt: string };

export function UsersView({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<ApiUser[] | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError("Kon gebruikers niet laden."));
  };

  useEffect(load, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Aanmaken mislukt.");
      } else {
        setEmail("");
        setPassword("");
        setRole("viewer");
        load();
      }
    } finally {
      setBusy(false);
    }
  };

  const setUserRole = async (id: number, newRole: "viewer" | "editor") => {
    setError("");
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) setError(body.error || "Wijzigen mislukt.");
    else load();
  };

  const removeUser = async (id: number) => {
    setError("");
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) setError(body.error || "Verwijderen mislukt.");
    else load();
  };

  return (
    <section className="hv-dash">
      <div className="hv-content-narrow hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Beheer
        </p>
        <h1 className="hv-display" style={{ fontSize: "36px", marginBottom: "10px" }}>
          Gebruikers
        </h1>
        <p style={{ color: "var(--hv-fg-muted)", maxWidth: "560px", marginBottom: "30px" }}>
          Bekijkers kunnen de reizen, het dashboard, de route en de organisatie zien maar niets wijzigen.
          Bewerkers mogen alles aanpassen.
        </p>

        {error && (
          <p style={{ fontSize: "12.5px", color: "var(--hv-danger)", marginBottom: "16px" }}>{error}</p>
        )}

        <div className="hv-sys-list" style={{ marginBottom: "20px" }}>
          {users === null && <p style={{ fontSize: "13px", color: "var(--hv-fg-muted)" }}>Laden...</p>}
          {users?.map((u) => (
            <div key={u.id} className="hv-sys-row">
              <span style={{ flex: 1, fontSize: "13px" }}>
                {u.email}
                {u.id === currentUserId && (
                  <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}> (jij)</span>
                )}
              </span>
              <button
                className={`hv-filter${u.role === "viewer" ? " is-active" : ""}`}
                onClick={() => setUserRole(u.id, "viewer")}
                disabled={u.role === "viewer"}
              >
                Bekijken
              </button>
              <button
                className={`hv-filter${u.role === "editor" ? " is-active" : ""}`}
                onClick={() => setUserRole(u.id, "editor")}
                disabled={u.role === "editor"}
              >
                Bewerken
              </button>
              <button
                className="hv-icon-btn"
                title="Gebruiker verwijderen"
                onClick={() => removeUser(u.id)}
                disabled={u.id === currentUserId}
              >
                ×
              </button>
            </div>
          ))}
          {users?.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--hv-fg-muted)", fontStyle: "italic" }}>
              Nog geen gebruikers.
            </p>
          )}
        </div>

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 14px" }}>
          Gebruiker toevoegen
        </p>
        <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px" }}>
          <input
            className="hv-input"
            type="email"
            placeholder="naam@harvest.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="hv-input"
            type="password"
            placeholder="Wachtwoord (minstens 8 tekens)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <div className="hv-pill-choices" style={{ marginBottom: 0 }}>
            <button type="button" className={`hv-filter${role === "viewer" ? " is-active" : ""}`} onClick={() => setRole("viewer")}>
              Bekijken
            </button>
            <button type="button" className={`hv-filter${role === "editor" ? " is-active" : ""}`} onClick={() => setRole("editor")}>
              Bewerken
            </button>
          </div>
          <button className="hv-btn" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>
            {busy ? "Bezig..." : "Gebruiker toevoegen"}
          </button>
        </form>
      </div>
    </section>
  );
}
