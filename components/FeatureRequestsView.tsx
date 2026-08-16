"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import type { FeatureRequest, FeatureRequestStatus } from "@/lib/types";
import { NewFeatureRequestModal } from "./NewFeatureRequestModal";

type ApiUser = { id: number; email: string };

const STATUS_LABELS: Record<FeatureRequestStatus, string> = {
  concept: "Concept",
  ter_review: "Ter review",
  aangevraagd: "Aangevraagd",
  bouwen: "Bouwen",
  in_review: "In review (security)",
  verborgen: "Klaar (verborgen)",
  live: "Live",
  uitgeschakeld: "Uitgeschakeld",
};

export function FeatureRequestsView() {
  const { me, canEdit, isAdmin } = useApp();
  const [requests, setRequests] = useState<FeatureRequest[] | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [reviewPickerFor, setReviewPickerFor] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<Record<number, string>>({});
  const [rollbackReasonFor, setRollbackReasonFor] = useState<number | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    fetch("/api/feature-requests")
      .then((r) => r.json())
      .then((data) => setRequests(Array.isArray(data.requests) ? data.requests : []))
      .catch(() => setError("Kon verzoeken niet laden."));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!canEdit) return;
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [canEdit]);

  const requestReview = async (id: number, reviewerEmail: string) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/feature-requests/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", reviewerEmail }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Kon geen review aanvragen.");
      setReviewPickerFor(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon geen review aanvragen.");
    } finally {
      setBusyId(null);
    }
  };

  const submitReview = async (id: number) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/feature-requests/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", comment: reviewComment[id] || "" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Kon review niet indienen.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon review niet indienen.");
    } finally {
      setBusyId(null);
    }
  };

  const push = async (id: number) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/feature-requests/${id}/push`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Kon niet pushen om te bouwen.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon niet pushen om te bouwen.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleLive = async (id: number, isLive: boolean, reason?: string) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/feature-requests/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive, reason }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Kon niet omzetten.");
      setRollbackReasonFor(null);
      setRollbackReason("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon niet omzetten.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="hv-dash">
      <div className="hv-content-narrow hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Verbeteringen
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "10px" }}>
          <h1 className="hv-display" style={{ fontSize: "36px" }}>
            Shipped &amp; Improved
          </h1>
          {canEdit && (
            <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={() => setShowNew(true)}>
              + Nieuw voorstel
            </button>
          )}
        </div>
        <p style={{ color: "var(--hv-fg-muted)", maxWidth: "620px", marginBottom: "24px" }}>
          Stel een verbetering voor, laat Claude het verscherpen tot een kleine spec, en push het om automatisch
          gebouwd te worden. Alles wordt hier geregistreerd, tot en met live zetten of terugdraaien.
        </p>

        {error && <p style={{ fontSize: "12.5px", color: "var(--hv-danger)", marginBottom: "16px" }}>{error}</p>}

        <div className="hv-sys-list">
          {requests === null && <p style={{ fontSize: "13px", color: "var(--hv-fg-muted)" }}>Laden...</p>}
          {requests?.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--hv-fg-muted)", fontStyle: "italic" }}>
              Nog geen voorstellen.
            </p>
          )}
          {requests?.map((r) => {
            const isMyReview = me?.email.toLowerCase() === r.reviewerEmail?.toLowerCase();
            return (
              <div key={r.id} className="hv-sys-row" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                <span style={{ flex: 1, minWidth: "220px" }}>
                  <span style={{ fontSize: "13.5px" }}>{r.title}</span>
                  <br />
                  <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>
                    {STATUS_LABELS[r.status]} · {r.requestedByEmail} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("nl-NL")}
                    {r.githubIssueUrl && (
                      <>
                        {" · "}
                        <a href={r.githubIssueUrl} target="_blank" rel="noreferrer">
                          issue
                        </a>
                      </>
                    )}
                    {r.previewUrl && (
                      <>
                        {" · "}
                        <a href={r.previewUrl} target="_blank" rel="noreferrer">
                          preview
                        </a>
                      </>
                    )}
                  </span>
                </span>

                {r.status === "concept" && canEdit && reviewPickerFor !== r.id && (
                  <>
                    <button className="hv-btn hv-btn--ghost hv-btn--sm" disabled={busyId === r.id} onClick={() => setReviewPickerFor(r.id)}>
                      Vraag review
                    </button>
                    <button className="hv-btn hv-btn--sm" disabled={busyId === r.id} onClick={() => push(r.id)}>
                      Pushen om te bouwen
                    </button>
                  </>
                )}
                {r.status === "concept" && canEdit && reviewPickerFor === r.id && (
                  <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {users
                      .filter((u) => u.email.toLowerCase() !== me?.email.toLowerCase())
                      .map((u) => (
                        <button key={u.id} className="hv-filter" disabled={busyId === r.id} onClick={() => requestReview(r.id, u.email)}>
                          {u.email}
                        </button>
                      ))}
                    <button className="hv-icon-btn" onClick={() => setReviewPickerFor(null)}>
                      ×
                    </button>
                  </span>
                )}

                {r.status === "ter_review" && isMyReview && (
                  <span style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      className="hv-input"
                      style={{ width: "220px" }}
                      placeholder="Opmerking (optioneel)"
                      value={reviewComment[r.id] || ""}
                      onChange={(e) => setReviewComment({ ...reviewComment, [r.id]: e.target.value })}
                    />
                    <button className="hv-btn hv-btn--sm" disabled={busyId === r.id} onClick={() => submitReview(r.id)}>
                      Voltooi review
                    </button>
                  </span>
                )}
                {r.status === "ter_review" && !isMyReview && (
                  <span style={{ fontSize: "11px", color: "var(--hv-fg-subtle)" }}>Wacht op review van {r.reviewerEmail}</span>
                )}

                {(r.status === "verborgen" || r.status === "live" || r.status === "uitgeschakeld") && isAdmin && (
                  <>
                    {!r.isLive && rollbackReasonFor !== r.id && (
                      <button className="hv-btn hv-btn--sm" disabled={busyId === r.id} onClick={() => toggleLive(r.id, true)}>
                        Live zetten
                      </button>
                    )}
                    {r.isLive && rollbackReasonFor !== r.id && (
                      <button
                        className="hv-btn hv-btn--ghost hv-btn--sm"
                        style={{ color: "var(--hv-danger)", borderColor: "var(--hv-danger)" }}
                        disabled={busyId === r.id}
                        onClick={() => setRollbackReasonFor(r.id)}
                      >
                        Terugdraaien
                      </button>
                    )}
                    {rollbackReasonFor === r.id && (
                      <span style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          className="hv-input"
                          style={{ width: "220px" }}
                          placeholder="Reden (optioneel)"
                          value={rollbackReason}
                          onChange={(e) => setRollbackReason(e.target.value)}
                        />
                        <button className="hv-btn hv-btn--sm" disabled={busyId === r.id} onClick={() => toggleLive(r.id, false, rollbackReason)}>
                          Bevestig terugdraaien
                        </button>
                        <button className="hv-icon-btn" onClick={() => setRollbackReasonFor(null)}>
                          ×
                        </button>
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {showNew && <NewFeatureRequestModal onClose={() => setShowNew(false)} onCreated={load} />}
    </section>
  );
}
