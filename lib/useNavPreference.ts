"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserPreferences } from "./types";

/** Below this width the side bar floats over the content instead of pushing it aside. */
const OVERLAY_QUERY = "(max-width: 860px)";

export type NavPreference = {
  collapsed: boolean;
  /** False until the stored preference is in, so the shell can skip the opening animation. */
  loaded: boolean;
  /** True when the side bar overlays the content (narrow screens). */
  overlay: boolean;
  toggle: () => void;
};

export function useNavPreference(enabled: boolean): NavPreference {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const toggledRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preferences");
        if (cancelled) return;
        if (res.ok) {
          const prefs: Partial<UserPreferences> = await res.json();
          // A toggle while this request was in flight wins: do not undo the fresh choice.
          if (!cancelled && !toggledRef.current) setCollapsed(Boolean(prefs?.navCollapsed));
        }
      } catch {
        // Keep the default (open) side bar when the preference cannot be read.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia(OVERLAY_QUERY);
    const sync = () => setOverlay(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [enabled]);

  const toggle = useCallback(() => {
    const next = !collapsed;
    toggledRef.current = true;
    setCollapsed(next);
    fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ navCollapsed: next } satisfies UserPreferences),
    }).catch(() => {});
  }, [collapsed]);

  return { collapsed, loaded, overlay, toggle };
}
