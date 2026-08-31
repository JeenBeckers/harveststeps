"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import type { Harvester } from "@/lib/types";

/**
 * The free-text "Notities" field on the harvester detail screen. The draft lives here and only
 * reaches the app state on save, so typing does not re-render the whole journey on every key.
 * Mount it with `key={harvester.id}`, so switching harvester starts from that harvester's notes.
 */
export function HarvesterNotes({ harvester }: { harvester: Harvester }) {
  const { actions, canEdit } = useApp();
  const saved = harvester.notes || "";
  const [draft, setDraft] = useState(saved);
  const [savedOnce, setSavedOnce] = useState(false);
  const dirty = draft !== saved;

  const save = () => {
    actions.setHarvesterNotes(harvester.id, draft);
    setSavedOnce(true);
  };

  return (
    <section style={{ marginTop: "36px", maxWidth: "760px" }}>
      <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
        Notities
      </p>
      {canEdit ? (
        <>
          <textarea
            className="hv-input"
            style={{ minHeight: "110px", lineHeight: 1.5, resize: "vertical" }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Eigen aantekeningen over deze harvester…"
            aria-label="Notities"
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <button className="hv-btn hv-btn--sm" disabled={!dirty} onClick={save}>
              Notities opslaan
            </button>
            <span style={{ fontSize: "11px", color: "var(--hv-fg-subtle)" }}>
              {dirty ? "Nog niet opgeslagen" : savedOnce ? "Opgeslagen" : ""}
            </span>
          </div>
        </>
      ) : (
        // Saving is an editor/admin action here, like every other change in this app, so a viewer
        // reads the notes as plain text instead of getting a field that cannot be saved.
        <p
          style={{
            fontSize: "12.5px",
            color: saved ? "var(--hv-fg)" : "var(--hv-fg-subtle)",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {saved || "Nog geen notities."}
        </p>
      )}
    </section>
  );
}
