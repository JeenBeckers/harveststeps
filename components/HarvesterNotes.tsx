"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import type { Harvester } from "@/lib/types";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * The timestamped "Notities" log on the harvester detail screen: every save appends a new entry
 * rather than overwriting the previous one, so a history builds up. Existing entries can still be
 * edited or deleted individually. Mount with `key={harvester.id}` so switching harvester resets
 * the draft and any open edit.
 */
export function HarvesterNotes({ harvester }: { harvester: Harvester }) {
  const { actions, canEdit } = useApp();
  const notes = harvester.notes || [];
  const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const addNote = () => {
    if (!draft.trim()) return;
    actions.addHarvesterNote(harvester.id, draft);
    setDraft("");
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditDraft(text);
  };

  const saveEdit = () => {
    if (!editingId || !editDraft.trim()) return;
    actions.updateHarvesterNote(harvester.id, editingId, editDraft);
    setEditingId(null);
  };

  const removeNote = (id: string) => {
    if (!window.confirm("Deze notitie verwijderen?")) return;
    actions.deleteHarvesterNote(harvester.id, id);
  };

  return (
    <section style={{ marginTop: "36px", maxWidth: "760px" }}>
      <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
        Notities
      </p>

      {canEdit && (
        <div style={{ marginBottom: "18px" }}>
          <textarea
            className="hv-input"
            style={{ minHeight: "80px", lineHeight: 1.5, resize: "vertical" }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nieuwe notitie…"
            aria-label="Nieuwe notitie"
          />
          <div style={{ marginTop: "8px" }}>
            <button className="hv-btn hv-btn--sm" disabled={!draft.trim()} onClick={addNote}>
              Notitie opslaan
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <p style={{ fontSize: "12.5px", color: "var(--hv-fg-subtle)", margin: 0 }}>Nog geen notities.</p>
      )}

      {sorted.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sorted.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--hv-r-md)",
                background: "var(--hv-cream-200)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--hv-fg-subtle)" }}>
                  {formatTimestamp(n.createdAt)}
                  {n.updatedAt && " · bewerkt"}
                </span>
                {canEdit && editingId !== n.id && (
                  <span style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                    <button
                      className="hv-icon-btn"
                      style={{ fontSize: "11px" }}
                      onClick={() => startEdit(n.id, n.text)}
                    >
                      Bewerken
                    </button>
                    <button
                      className="hv-icon-btn"
                      style={{ fontSize: "11px", color: "var(--hv-danger)" }}
                      onClick={() => removeNote(n.id)}
                    >
                      Verwijderen
                    </button>
                  </span>
                )}
              </div>
              {editingId === n.id ? (
                <>
                  <textarea
                    className="hv-input"
                    style={{ minHeight: "70px", lineHeight: 1.5, resize: "vertical" }}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    aria-label="Notitie bewerken"
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button className="hv-btn hv-btn--sm" disabled={!editDraft.trim()} onClick={saveEdit}>
                      Opslaan
                    </button>
                    <button className="hv-btn hv-btn--ghost hv-btn--sm" onClick={() => setEditingId(null)}>
                      Annuleren
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "12.5px", color: "var(--hv-fg)", lineHeight: 1.5, whiteSpace: "pre-wrap", margin: 0 }}>
                  {n.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
