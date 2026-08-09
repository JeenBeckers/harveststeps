"use client";

import { useApp } from "@/lib/store";

export function BookmarksView() {
  const { state, actions, canEdit } = useApp();

  return (
    <section className="hv-dash">
      <div className="hv-content-narrow hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Snelkoppelingen
        </p>
        <h1 className="hv-display" style={{ fontSize: "36px", marginBottom: "10px" }}>
          Bookmarks
        </h1>
        <p style={{ color: "var(--hv-fg-muted)", maxWidth: "560px", marginBottom: "30px" }}>
          Handige applicaties en links voor de Harvest back-office. Alleen zichtbaar voor gebruikers van HarvestSteps, niet voor
          harvesters.
        </p>

        <div className="hv-sys-list" style={{ marginBottom: "20px" }}>
          {state.bookmarks.map((b) => (
            <div key={b.id} className="hv-sys-row">
              <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: "13px", color: "var(--hv-fg)", textDecoration: "none" }}>
                <span style={{ textDecoration: "underline", textDecorationColor: "var(--hv-sienna-700)" }}>{b.name}</span>
                <span style={{ display: "block", fontSize: "10.5px", color: "var(--hv-fg-subtle)", marginTop: "2px" }}>{b.url}</span>
              </a>
              {canEdit && (
                <button className="hv-icon-btn" title="Bookmark verwijderen" onClick={() => actions.removeBookmark(b.id)}>
                  ×
                </button>
              )}
            </div>
          ))}
          {state.bookmarks.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--hv-fg-muted)", fontStyle: "italic" }}>Nog geen bookmarks toegevoegd.</p>
          )}
        </div>

        {canEdit && (
          <>
            <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 14px" }}>
              Bookmark toevoegen
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px" }}>
              <input
                className="hv-input"
                placeholder="Naam (bv. NELA)"
                value={state.newBookmarkName}
                onChange={(e) => actions.setNewBookmarkName(e.target.value)}
              />
              <input
                className="hv-input"
                placeholder="Link (bv. nela.harvest.nl)"
                value={state.newBookmarkUrl}
                onChange={(e) => actions.setNewBookmarkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") actions.addBookmark();
                }}
              />
              <button className="hv-btn" style={{ alignSelf: "flex-start" }} onClick={actions.addBookmark}>
                Bookmark toevoegen
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
