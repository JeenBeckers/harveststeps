"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedState } from "./seed";
import { buildStops, deptGuide, makeStop, resolveOwner } from "./logic";
import type {
  AppState,
  CurrentUser,
  Harvester,
  HarvesterModalState,
  ModalTaskDraft,
  PersistedAppState,
  StopModalState,
  View,
} from "./types";
import { ESM_LEAD } from "./constants";

type Actions = {
  setView: (v: View) => void;
  pickHarvester: (id: string) => void;
  openStop: (sid: string) => void;
  toggleTask: (hid: string, sid: string, tid: string) => void;
  startJourney: () => void;
  openAddStop: () => void;
  openAddTemplateStop: () => void;
  openEditStop: (stopId: string) => void;
  openEditTemplate: (templateId: string) => void;
  closeModal: () => void;
  setModalName: (v: string) => void;
  pickModalDept: (dept: string) => void;
  pickModalGuide: (guide: string) => void;
  toggleModalSys: (key: string) => void;
  setModalTaskDraft: (v: string) => void;
  addModalTask: () => void;
  patchModalTask: (i: number, patch: Partial<ModalTaskDraft>) => void;
  removeModalTask: (i: number) => void;
  submitModal: () => void;
  openAddHarvester: () => void;
  closeHModal: () => void;
  setHName: (v: string) => void;
  setHAge: (v: string) => void;
  setHRole: (v: string) => void;
  setHClient: (v: string) => void;
  setHStart: (v: string) => void;
  pickHRecruiter: (v: string) => void;
  toggleHStartNow: () => void;
  submitHModal: () => void;
  setFStatus: (v: string) => void;
  setFOwner: (v: string) => void;
  resetFilters: () => void;
  removeTemplateStop: (id: string) => void;
  setNewDept: (v: string) => void;
  addDept: () => void;
  removeDept: (id: string) => void;
  setDeptDraft: (id: string, v: string) => void;
  addDeptMember: (id: string) => void;
  removeDeptMember: (id: string, member: string) => void;
  setNewSys: (v: string) => void;
  addSys: () => void;
  removeSys: (key: string) => void;
  logout: () => void;
};

const AppContext = createContext<{
  state: AppState;
  actions: Actions;
  deptDrafts: Record<string, string>;
  me: CurrentUser | null;
  canEdit: boolean;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [deptDrafts, setDeptDrafts] = useState<Record<string, string>>({});
  const [me, setMe] = useState<CurrentUser | null>(null);
  const hydratedRef = useRef(false);
  const canEditRef = useRef(false);
  canEditRef.current = me?.role === "editor";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, stateRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/state"),
        ]);
        if (cancelled) return;
        if (meRes.ok) {
          const meBody = await meRes.json();
          setMe(meBody);
        } else if (meRes.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (stateRes.ok) {
          const persisted: PersistedAppState = await stateRes.json();
          setState((s) => ({ ...s, ...persisted, loading: false }));
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || !canEditRef.current) return;
    const payload: PersistedAppState = {
      data: state.data,
      template: state.template,
      depts: state.depts,
      systems: state.systems,
      hid: state.hid,
      view: state.view,
    };
    const t = setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data, state.template, state.depts, state.systems, state.hid, state.view]);

  const logout = useCallback(() => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/login";
    });
  }, []);

  const setView = useCallback((v: View) => setState((s) => ({ ...s, view: v })), []);

  const pickHarvester = useCallback((id: string) => {
    setState((s) => ({ ...s, hid: id, sid: null, view: "reis" }));
  }, []);

  const openStop = useCallback((sid: string) => setState((s) => ({ ...s, sid })), []);

  const toggleTask = useCallback((hid: string, sid: string, tid: string) => {
    if (!canEditRef.current) return;
    setState((s) => ({
      ...s,
      data: s.data.map((h) =>
        h.id !== hid
          ? h
          : {
              ...h,
              stops: h.stops.map((st) =>
                st.id !== sid
                  ? st
                  : { ...st, tasks: st.tasks.map((t) => (t.id !== tid ? t : { ...t, done: !t.done })) }
              ),
            }
      ),
    }));
  }, []);

  const startJourney = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const me2 = s.data.find((x) => x.id === s.hid);
      if (!me2) return s;
      return {
        ...s,
        sid: null,
        data: s.data.map((x) => (x.id !== s.hid ? x : { ...x, stops: buildStops(0, 0, me2.recruiter, s.template, s.depts) })),
      };
    });
  }, []);

  const openAddStop = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const me2 = s.data.find((x) => x.id === s.hid);
      const guide = deptGuide("ESM", me2?.recruiter || "", s.depts);
      return { ...s, modal: { open: true, mode: "harvester", editId: null, name: "", dept: "ESM", guide, sys: [], tasks: [], taskDraft: "" } };
    });
  }, []);

  const openAddTemplateStop = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => ({
      ...s,
      modal: { open: true, mode: "template", editId: null, name: "", dept: "ESM", guide: deptGuide("ESM", "Wessal Wafa", s.depts), sys: [], tasks: [], taskDraft: "" },
    }));
  }, []);

  const openEditStop = useCallback((stopId: string) => {
    if (!canEditRef.current) return;
    setState((s) => {
      const h = s.data.find((x) => x.id === s.hid);
      const stop = h?.stops.find((x) => x.id === stopId);
      if (!stop) return s;
      return {
        ...s,
        modal: {
          open: true,
          mode: "stop",
          editId: stop.id,
          name: stop.name,
          dept: stop.dept,
          guide: stop.guide,
          sys: stop.sys.slice(),
          tasks: stop.tasks.map((t) => ({ id: t.id, label: t.label, owner: t.owner, done: t.done })),
          taskDraft: "",
        },
      };
    });
  }, []);

  const openEditTemplate = useCallback((templateId: string) => {
    if (!canEditRef.current) return;
    setState((s) => {
      const t = s.template.find((x) => x.id === templateId);
      if (!t) return s;
      const guide = deptGuide(t.dept, "Wessal Wafa", s.depts);
      return {
        ...s,
        modal: {
          open: true,
          mode: "edit",
          editId: t.id,
          name: t.name,
          dept: t.dept,
          guide,
          sys: t.sys.slice(),
          tasks: t.tasks.map((x) => ({ label: x.label, owner: resolveOwner(x.owner, ESM_LEAD, guide), done: false })),
          taskDraft: "",
        },
      };
    });
  }, []);

  const closeModal = useCallback(() => setState((s) => ({ ...s, modal: { ...s.modal, open: false } })), []);

  const patchModal = useCallback((patch: Partial<StopModalState>) => setState((s) => ({ ...s, modal: { ...s.modal, ...patch } })), []);

  const setModalName = useCallback((v: string) => patchModal({ name: v }), [patchModal]);
  const setModalTaskDraft = useCallback((v: string) => patchModal({ taskDraft: v }), [patchModal]);

  const pickModalDept = useCallback((dept: string) => {
    setState((s) => {
      const h = s.data.find((x) => x.id === s.hid);
      return { ...s, modal: { ...s.modal, dept, guide: deptGuide(dept, h?.recruiter || "", s.depts) } };
    });
  }, []);

  const pickModalGuide = useCallback((guide: string) => patchModal({ guide }), [patchModal]);

  const toggleModalSys = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      modal: { ...s.modal, sys: s.modal.sys.indexOf(key) >= 0 ? s.modal.sys.filter((k) => k !== key) : s.modal.sys.concat([key]) },
    }));
  }, []);

  const addModalTask = useCallback(() => {
    setState((s) => {
      if (!s.modal.taskDraft.trim()) return s;
      return {
        ...s,
        modal: { ...s.modal, tasks: s.modal.tasks.concat([{ label: s.modal.taskDraft.trim(), owner: s.modal.guide, done: false }]), taskDraft: "" },
      };
    });
  }, []);

  const patchModalTask = useCallback((i: number, patch: Partial<ModalTaskDraft>) => {
    setState((s) => ({ ...s, modal: { ...s.modal, tasks: s.modal.tasks.map((t, j) => (j !== i ? t : { ...t, ...patch })) } }));
  }, []);

  const removeModalTask = useCallback((i: number) => {
    setState((s) => ({ ...s, modal: { ...s.modal, tasks: s.modal.tasks.filter((_, j) => j !== i) } }));
  }, []);

  const submitModal = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const m = s.modal;
      const h = s.data.find((x) => x.id === s.hid);
      const nm = (m.name || "").trim() || "Nieuwe halte";
      const tasksIn = m.tasks.length ? m.tasks : [{ label: "Halte voorbereiden", owner: m.guide, done: false }];
      const tasks = tasksIn.map((t) => ({ id: t.id, label: (t.label || "").trim() || "Actie", owner: t.owner, done: !!t.done }));

      if (m.mode === "harvester" && h) {
        const nid = "c" + Date.now();
        const stop = makeStop(
          { phase: "Individueel", name: nm, dept: m.dept, esm: true, guide: m.guide, involved: [m.dept, "Begeleider"], sys: m.sys, custom: true, tasks },
          0,
          h.recruiter,
          nid,
          s.depts
        );
        stop.id = nid;
        stop.tasks.forEach((t, j) => { t.id = nid + "t" + j; });
        return {
          ...s,
          sid: nid,
          data: s.data.map((x) => (x.id !== s.hid ? x : { ...x, stops: x.stops.concat([stop]) })),
          modal: { ...s.modal, open: false },
        };
      }
      if (m.mode === "stop") {
        return {
          ...s,
          data: s.data.map((x) =>
            x.id !== s.hid
              ? x
              : {
                  ...x,
                  stops: x.stops.map((stp) =>
                    stp.id !== m.editId
                      ? stp
                      : {
                          ...stp,
                          name: nm,
                          dept: m.dept,
                          guide: m.guide,
                          sys: m.sys.slice(),
                          tasks: tasks.map((t, j) => ({ id: t.id || m.editId + "n" + j + Date.now(), label: t.label, owner: t.owner, done: t.done })),
                        }
                  ),
                }
          ),
          modal: { ...s.modal, open: false },
        };
      }
      if (m.mode === "edit") {
        return {
          ...s,
          template: s.template.map((x) =>
            x.id !== m.editId ? x : { ...x, name: nm, dept: m.dept, sys: m.sys.slice(), tasks: tasks.map((t) => ({ label: t.label, owner: t.owner })) }
          ),
          modal: { ...s.modal, open: false },
        };
      }
      // mode === "template"
      return {
        ...s,
        template: s.template.concat([
          { id: "tpl" + Date.now(), phase: "Programma", name: nm, dept: m.dept, esm: true, crit: false, note: "", involved: [m.dept], sys: m.sys.slice(), tasks: tasks.map((t) => ({ label: t.label, owner: t.owner })) },
        ]),
        modal: { ...s.modal, open: false },
      };
    });
  }, []);

  const openAddHarvester = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const recruitDept = s.depts.find((d) => d.name === "Recruitment");
      const recruiters = recruitDept && recruitDept.members.length ? recruitDept.members : [];
      return { ...s, hmodal: { open: true, name: "", age: "", role: "", client: "", start: "", recruiter: recruiters[0] || "Wessal Wafa", startNow: true } };
    });
  }, []);

  const closeHModal = useCallback(() => setState((s) => ({ ...s, hmodal: { ...s.hmodal, open: false } })), []);

  const patchHModal = useCallback((patch: Partial<HarvesterModalState>) => setState((s) => ({ ...s, hmodal: { ...s.hmodal, ...patch } })), []);

  const setHName = useCallback((v: string) => patchHModal({ name: v }), [patchHModal]);
  const setHAge = useCallback((v: string) => patchHModal({ age: v }), [patchHModal]);
  const setHRole = useCallback((v: string) => patchHModal({ role: v }), [patchHModal]);
  const setHClient = useCallback((v: string) => patchHModal({ client: v }), [patchHModal]);
  const setHStart = useCallback((v: string) => patchHModal({ start: v }), [patchHModal]);
  const pickHRecruiter = useCallback((v: string) => patchHModal({ recruiter: v }), [patchHModal]);
  const toggleHStartNow = useCallback(() => setState((s) => ({ ...s, hmodal: { ...s.hmodal, startNow: !s.hmodal.startNow } })), []);

  const submitHModal = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const hm = s.hmodal;
      const nm = (hm.name || "").trim();
      if (!nm) return s;
      const id = "h" + Date.now();
      const recruitDept = s.depts.find((d) => d.name === "Recruitment");
      const recruiters = recruitDept && recruitDept.members.length ? recruitDept.members : [];
      const rec = hm.recruiter || recruiters[0] || "Wessal Wafa";
      const newHarvester: Harvester = {
        id,
        name: nm,
        age: (hm.age || "").trim() || "—",
        role: (hm.role || "").trim() || "Young professional",
        client: (hm.client || "").trim() || "Nog te matchen",
        start: (hm.start || "").trim() || "—",
        recruiter: rec,
        stops: hm.startNow ? buildStops(0, 0, rec, s.template, s.depts) : [],
      };
      return { ...s, data: s.data.concat([newHarvester]), hid: id, sid: null, view: "reis", hmodal: { ...s.hmodal, open: false } };
    });
  }, []);

  const setFStatus = useCallback((v: string) => setState((s) => ({ ...s, fStatus: v })), []);
  const setFOwner = useCallback((v: string) => setState((s) => ({ ...s, fOwner: v })), []);
  const resetFilters = useCallback(() => setState((s) => ({ ...s, fStatus: "Alle", fOwner: "Alle" })), []);

  const removeTemplateStop = useCallback((id: string) => {
    if (!canEditRef.current) return;
    setState((s) => ({ ...s, template: s.template.filter((x) => x.id !== id) }));
  }, []);

  const setNewDept = useCallback((v: string) => setState((s) => ({ ...s, newDept: v })), []);
  const addDept = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const n = (s.newDept || "").trim();
      if (!n || s.depts.some((d) => d.name.toLowerCase() === n.toLowerCase())) return s;
      return { ...s, depts: s.depts.concat([{ id: "d" + Date.now(), name: n, members: [] }]), newDept: "" };
    });
  }, []);
  const removeDept = useCallback((id: string) => {
    if (!canEditRef.current) return;
    setState((s) => ({ ...s, depts: s.depts.filter((x) => x.id !== id) }));
  }, []);

  const setDeptDraft = useCallback((id: string, v: string) => setDeptDrafts((d) => ({ ...d, [id]: v })), []);
  const addDeptMember = useCallback((id: string) => {
    if (!canEditRef.current) return;
    setDeptDrafts((drafts) => {
      const n = (drafts[id] || "").trim();
      if (!n) return drafts;
      setState((s) => ({
        ...s,
        depts: s.depts.map((x) => (x.id !== id ? x : { ...x, members: x.members.indexOf(n) >= 0 ? x.members : x.members.concat([n]) })),
      }));
      return { ...drafts, [id]: "" };
    });
  }, []);
  const removeDeptMember = useCallback((id: string, member: string) => {
    if (!canEditRef.current) return;
    setState((s) => ({ ...s, depts: s.depts.map((x) => (x.id !== id ? x : { ...x, members: x.members.filter((y) => y !== member) })) }));
  }, []);

  const setNewSys = useCallback((v: string) => setState((s) => ({ ...s, newSys: v })), []);
  const addSys = useCallback(() => {
    if (!canEditRef.current) return;
    setState((s) => {
      const n = (s.newSys || "").trim();
      if (!n) return s;
      const key = n.toLowerCase().replace(/[^a-z0-9]/g, "") || "sys" + Date.now();
      if (s.systems.some((x) => x.key === key)) return s;
      return { ...s, systems: s.systems.concat([{ key, name: n, mono: n.slice(0, 1).toUpperCase() }]), newSys: "" };
    });
  }, []);
  const removeSys = useCallback((key: string) => {
    if (!canEditRef.current) return;
    setState((s) => ({
      ...s,
      systems: s.systems.filter((y) => y.key !== key),
      template: s.template.map((t) => ({ ...t, sys: t.sys.filter((k) => k !== key) })),
      data: s.data.map((hh) => ({ ...hh, stops: hh.stops.map((stp) => ({ ...stp, sys: stp.sys.filter((k) => k !== key) })) })),
    }));
  }, []);

  const actions: Actions = useMemo(
    () => ({
      setView,
      pickHarvester,
      openStop,
      toggleTask,
      startJourney,
      openAddStop,
      openAddTemplateStop,
      openEditStop,
      openEditTemplate,
      closeModal,
      setModalName,
      pickModalDept,
      pickModalGuide,
      toggleModalSys,
      setModalTaskDraft,
      addModalTask,
      patchModalTask,
      removeModalTask,
      submitModal,
      openAddHarvester,
      closeHModal,
      setHName,
      setHAge,
      setHRole,
      setHClient,
      setHStart,
      pickHRecruiter,
      toggleHStartNow,
      submitHModal,
      setFStatus,
      setFOwner,
      resetFilters,
      removeTemplateStop,
      setNewDept,
      addDept,
      removeDept,
      setDeptDraft,
      addDeptMember,
      removeDeptMember,
      setNewSys,
      addSys,
      removeSys,
      logout,
    }),
    [
      setView, pickHarvester, openStop, toggleTask, startJourney, openAddStop, openAddTemplateStop,
      openEditStop, openEditTemplate, closeModal, setModalName, pickModalDept, pickModalGuide,
      toggleModalSys, setModalTaskDraft, addModalTask, patchModalTask, removeModalTask, submitModal,
      openAddHarvester, closeHModal, setHName, setHAge, setHRole, setHClient, setHStart, pickHRecruiter,
      toggleHStartNow, submitHModal, setFStatus, setFOwner, resetFilters, removeTemplateStop, setNewDept,
      addDept, removeDept, setDeptDraft, addDeptMember, removeDeptMember, setNewSys, addSys, removeSys, logout,
    ]
  );

  const canEdit = me?.role === "editor";
  const value = useMemo(() => ({ state, actions, deptDrafts, me, canEdit }), [state, actions, deptDrafts, me, canEdit]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
