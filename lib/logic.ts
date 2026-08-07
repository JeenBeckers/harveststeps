import { ESM_LEAD, OWNER_MAP } from "./constants";
import type { Department, Stop, StopStatus, TaskDef, TemplateStop } from "./types";

export function initials(name: string | undefined | null): string {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function deptGuide(dept: string, recruiter: string, depts: Department[]): string {
  if (dept === "Recruitment") return recruiter;
  const d = depts.find((x) => x.name === dept);
  return d && d.members.length ? d.members[0] : recruiter || ESM_LEAD;
}

export function resolveOwner(own: string, eind: string, guide: string): string {
  if (own === "@eind") return eind;
  if (own === "@guide") return guide;
  return OWNER_MAP[own] || own;
}

type StopSeed = {
  phase: string;
  name: string;
  dept: string;
  esm: boolean;
  crit?: boolean;
  note?: string;
  guide?: string;
  involved?: string[];
  sys: string[];
  custom?: boolean;
  tasks: TaskDef[];
};

export function makeStop(t: StopSeed, i: number, recruiter: string, idPrefix: string, depts: Department[]): Stop {
  const eind = t.esm ? ESM_LEAD : recruiter;
  const guide = t.guide || deptGuide(t.dept, recruiter, depts);
  return {
    id: idPrefix + i,
    phase: t.phase,
    name: t.name,
    dept: t.dept,
    esm: t.esm,
    crit: !!t.crit,
    note: t.note || "",
    eind,
    guide,
    involved: t.involved || [t.dept],
    sys: t.sys.slice(),
    custom: !!t.custom,
    tasks: t.tasks.map((k, j) => ({
      id: idPrefix + i + "t" + j,
      label: k.label,
      owner: resolveOwner(k.owner, eind, guide),
      done: false,
    })),
  };
}

export function buildStops(
  reached: number,
  partial: number,
  recruiter: string,
  source: TemplateStop[],
  depts: Department[]
): Stop[] {
  return source.map((t, i) => {
    const s = makeStop(t, i, recruiter, "s", depts);
    s.tasks.forEach((tk, j) => {
      tk.done = i < reached ? true : i === reached ? j < partial : false;
    });
    return s;
  });
}

export function stopStatus(s: Stop): StopStatus {
  const d = s.tasks.filter((t) => t.done).length;
  if (s.tasks.length === 0) return "Nog te doen";
  if (d === s.tasks.length) return "Afgerond";
  if (d > 0) return "Bezig";
  return "Nog te doen";
}

export function currentStopOf(stops: Stop[]): Stop | null {
  return stops.find((s) => stopStatus(s) !== "Afgerond") || stops[stops.length - 1] || null;
}

export function statusClassName(status: string): string {
  if (status === "Afgerond") return "hv-status hv-status--done";
  if (status === "Bezig") return "hv-status hv-status--busy";
  return "hv-status hv-status--todo";
}

export function allMembers(depts: Department[]): string[] {
  const out: string[] = [];
  depts.forEach((d) => d.members.forEach((m) => { if (out.indexOf(m) < 0) out.push(m); }));
  return out;
}
