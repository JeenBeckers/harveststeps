"use client";

import { useEffect, useRef, useState } from "react";
import type { FeatureRequestSpec, RefineMessage } from "@/lib/types";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/featureRequestImage";

const PRIORITIES = ["laag", "middel", "hoog"];

function buildFormData(spec: FeatureRequestSpec, image: File): FormData {
  const form = new FormData();
  form.append("spec", JSON.stringify(spec));
  form.append("image", image);
  return form;
}

export function NewFeatureRequestModal({
  onClose,
  onCreated,
  imageUploadEnabled = false,
}: {
  onClose: () => void;
  onCreated: () => void;
  imageUploadEnabled?: boolean;
}) {
  const [messages, setMessages] = useState<RefineMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [spec, setSpec] = useState<FeatureRequestSpec | null>(null);
  const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  /** Ruimt de vorige preview-URL op zodra er een andere (of geen) afbeelding is gekozen. */
  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image.previewUrl);
  }, [image]);

  const pickImage = (file: File | null) => {
    setImageError("");
    if (!file) {
      setImage(null);
      return;
    }
    const problem = validateImageFile(file);
    if (problem) {
      setImage(null);
      setImageError(problem);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const clearImage = () => {
    setImage(null);
    setImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    const nextMessages: RefineMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/feature-requests/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Onbekende fout.");
      if (body.type === "question") {
        setMessages((m) => [...m, { role: "assistant", text: body.text }]);
      } else if (body.type === "spec") {
        setSpec(body.spec);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon niet verwerken.");
    } finally {
      setBusy(false);
    }
  };

  const confirmSpec = async () => {
    if (!spec) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        ...(imageUploadEnabled && image
          ? { body: buildFormData(spec, image.file) }
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spec }) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Onbekende fout.");
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon niet opslaan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hv-modal-overlay" onClick={onClose}>
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal__body">
          <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
            Verbeteringen
          </p>
          <h2 style={{ fontSize: "27px", marginBottom: "16px" }}>Nieuw voorstel</h2>

          {!spec ? (
            <>
              <p style={{ fontSize: "12.5px", color: "var(--hv-fg-muted)", marginBottom: "16px" }}>
                Beschrijf wat je wilt verbeteren. Claude stelt hooguit twee verduidelijkingsvragen en helpt het
                idee klein genoeg maken voor één automatische build voordat er een spec komt.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", maxHeight: "300px", overflowY: "auto" }}>
                {messages.map((m, i) => (
                  <div key={i}>
                    <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {m.role === "user" ? "Jij" : "Claude"}
                    </span>
                    <p style={{ fontSize: "13px", margin: "2px 0 0" }}>{m.text}</p>
                  </div>
                ))}
              </div>
              <textarea
                className="hv-input"
                style={{ marginBottom: "8px", minHeight: "70px" }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={messages.length === 0 ? "Wat wil je verbeteren?" : "Jouw antwoord…"}
              />
              <button className="hv-btn" disabled={busy || !draft.trim()} onClick={send}>
                {busy ? "Bezig…" : "Versturen"}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "12.5px", color: "var(--hv-fg-muted)", marginBottom: "16px" }}>
                Controleer en pas zo nodig aan voordat je bevestigt — pas na bevestigen wordt dit geregistreerd.
              </p>
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Titel</p>
              <input className="hv-input hv-field" value={spec.title} onChange={(e) => setSpec({ ...spec, title: e.target.value })} />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Probleem</p>
              <textarea
                className="hv-input hv-field"
                style={{ minHeight: "56px" }}
                value={spec.problem}
                onChange={(e) => setSpec({ ...spec, problem: e.target.value })}
              />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Gewenste uitkomst</p>
              <textarea
                className="hv-input hv-field"
                style={{ minHeight: "56px" }}
                value={spec.desiredOutcome}
                onChange={(e) => setSpec({ ...spec, desiredOutcome: e.target.value })}
              />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>In scope</p>
              <textarea
                className="hv-input hv-field"
                style={{ minHeight: "56px" }}
                value={spec.inScope}
                onChange={(e) => setSpec({ ...spec, inScope: e.target.value })}
              />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Buiten scope</p>
              <textarea
                className="hv-input hv-field"
                style={{ minHeight: "56px" }}
                value={spec.outOfScope}
                onChange={(e) => setSpec({ ...spec, outOfScope: e.target.value })}
              />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Onderdeel van de app</p>
              <input className="hv-input hv-field" value={spec.area} onChange={(e) => setSpec({ ...spec, area: e.target.value })} />
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>Prioriteit</p>
              <div className="hv-pill-choices" style={{ marginBottom: "8px" }}>
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    className={`hv-filter${spec.priority === p ? " is-active" : ""}`}
                    onClick={() => setSpec({ ...spec, priority: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {imageUploadEnabled && (
                <>
                  <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
                    Afbeelding (optioneel)
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--hv-fg-subtle)", margin: "0 0 8px" }}>
                    Eén screenshot of wireframe — jpg, jpeg, png of gif, maximaal 5 MB.
                  </p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    className="hv-input"
                    accept={IMAGE_ACCEPT}
                    style={{ marginBottom: "8px", padding: "7px 12px" }}
                    onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
                  />
                  {image && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        style={{ maxWidth: "120px", maxHeight: "80px", borderRadius: "var(--hv-r-sm)", border: "1px solid var(--hv-border)" }}
                      />
                      <span style={{ fontSize: "11px", color: "var(--hv-fg-muted)", flex: 1, wordBreak: "break-all" }}>{image.file.name}</span>
                      <button className="hv-icon-btn" onClick={clearImage} aria-label="Afbeelding verwijderen">
                        ×
                      </button>
                    </div>
                  )}
                  {imageError && <p style={{ fontSize: "11px", color: "var(--hv-danger)", marginBottom: "8px" }}>{imageError}</p>}
                </>
              )}
            </>
          )}

          {error && <p style={{ fontSize: "11px", color: "var(--hv-danger)", marginTop: "8px" }}>{error}</p>}
        </div>
        <div className="hv-modal__footer">
          <button className="hv-btn hv-btn--ghost" onClick={onClose}>
            Annuleren
          </button>
          {spec && (
            <button className="hv-btn" disabled={busy} onClick={confirmSpec}>
              {busy ? "Bezig…" : "Bevestigen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
