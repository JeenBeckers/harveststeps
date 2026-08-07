"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Inloggen mislukt.");
        setBusy(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="hv-login-card">
      <div className="hv-login-brand">
        <img src="/harvest-logo-dark.png" alt="Harvest" className="hv-login-logo" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
        Talentplanner · Post-master
      </p>
      <h1 style={{ fontSize: "27px", marginBottom: "22px" }}>Inloggen</h1>

      <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
        E-mailadres
      </p>
      <input
        className="hv-input hv-field"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="naam@harvest.nl"
        required
      />

      <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
        Wachtwoord
      </p>
      <input
        className="hv-input hv-field"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {error && (
        <p style={{ fontSize: "12.5px", color: "var(--hv-danger)", marginBottom: "16px" }}>{error}</p>
      )}

      <button className="hv-btn" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
        {busy ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );
}
