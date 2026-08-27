"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { fromDateInputValue, toDateInputValue } from "@/lib/dates";
import type { Harvester } from "@/lib/types";

/**
 * Small edit form for the three fields shown in the harvester list: name, client and start date.
 * The draft lives here instead of in the app state, so cancelling is simply unmounting the modal.
 */
export function HarvesterEditModal({ harvester, onClose }: { harvester: Harvester; onClose: () => void }) {
  const { actions } = useApp();
  const [name, setName] = useState(harvester.name);
  const [client, setClient] = useState(harvester.client);
  // An unparseable stored value ("—", or a blank) leaves the date field empty until one is picked.
  const [start, setStart] = useState(() => toDateInputValue(harvester.start));
  const [error, setError] = useState("");

  const save = () => {
    const nm = name.trim();
    const cl = client.trim();
    if (!nm) {
      setError("Vul een naam in.");
      return;
    }
    if (!cl) {
      setError("Vul een klant in.");
      return;
    }
    const startDisplay = fromDateInputValue(start);
    if (!startDisplay) {
      setError("Kies een geldige startdatum.");
      return;
    }
    actions.updateHarvesterDetails(harvester.id, { name: nm, client: cl, start: startDisplay });
    onClose();
  };

  return (
    <div className="hv-modal-overlay" onClick={onClose}>
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal__body">
          <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
            Harvester bewerken
          </p>
          <h2 style={{ fontSize: "27px", marginBottom: "20px" }}>{harvester.name}</h2>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Naam
          </p>
          <input
            className="hv-input hv-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Voor- en achternaam"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Klant
          </p>
          <input
            className="hv-input hv-field"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="bv. ABN AMRO"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Startdatum
          </p>
          <input className="hv-input hv-field" type="date" value={start} onChange={(e) => setStart(e.target.value)} />

          {error && <p style={{ fontSize: "12.5px", color: "var(--hv-danger)", margin: "0 0 4px" }}>{error}</p>}
        </div>
        <div className="hv-modal__footer">
          <button className="hv-btn hv-btn--ghost" onClick={onClose}>
            Annuleren
          </button>
          <button className="hv-btn" onClick={save}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
