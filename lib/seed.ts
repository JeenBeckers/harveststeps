import { DEFAULT_DEPTS, DEFAULT_SYSTEMS, ESM_LEAD, HARVESTERS, TEMPLATE } from "./constants";
import { buildStops } from "./logic";
import type { AppState, PersistedAppState } from "./types";

export function seedPersistedState(): PersistedAppState {
  return {
    hid: "iris",
    view: "reis",
    systems: DEFAULT_SYSTEMS.map((x) => ({ ...x })),
    depts: DEFAULT_DEPTS.map((d) => ({ id: d.id, name: d.name, members: d.members.slice() })),
    template: TEMPLATE.map((t) => ({ ...t, involved: t.involved.slice(), sys: t.sys.slice(), tasks: t.tasks.map((k) => ({ ...k })) })),
    data: HARVESTERS.map((h) => ({
      id: h.id,
      name: h.name,
      age: String(h.age),
      role: h.role,
      client: h.client,
      start: h.start,
      recruiter: h.recruiter,
      stops: h.reached < 0 ? [] : buildStops(h.reached, h.partial, h.recruiter, TEMPLATE, DEFAULT_DEPTS),
    })),
  };
}

export function seedState(): AppState {
  const persisted = seedPersistedState();
  return {
    ...persisted,
    loading: true,
    sid: null,
    fStatus: "Alle",
    fOwner: "Alle",
    newDept: "",
    newSys: "",
    modal: { open: false, mode: "harvester", editId: null, name: "", dept: "ESM", guide: ESM_LEAD, sys: ["slack"], tasks: [], taskDraft: "", position: 1 },
    hmodal: { open: false, name: "", age: "", role: "", client: "", start: "", recruiter: "Wessal Wafa", startNow: true },
  };
}
