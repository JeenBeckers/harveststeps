export type View = "reis" | "dashboard" | "beheer" | "organisatie";

export type SystemDef = {
  key: string;
  name: string;
  mono: string;
};

export type Department = {
  id: string;
  name: string;
  members: string[];
};

export type TaskDef = {
  label: string;
  owner: string;
};

export type StopTask = {
  id: string;
  label: string;
  owner: string;
  done: boolean;
};

export type TemplateStop = {
  id: string;
  phase: string;
  name: string;
  dept: string;
  esm: boolean;
  crit: boolean;
  note: string;
  involved: string[];
  sys: string[];
  tasks: TaskDef[];
};

export type Stop = {
  id: string;
  phase: string;
  name: string;
  dept: string;
  esm: boolean;
  crit: boolean;
  note: string;
  eind: string;
  guide: string;
  involved: string[];
  sys: string[];
  custom: boolean;
  tasks: StopTask[];
};

export type Harvester = {
  id: string;
  name: string;
  age: string;
  role: string;
  client: string;
  start: string;
  recruiter: string;
  stops: Stop[];
};

export type StopStatus = "Afgerond" | "Bezig" | "Nog te doen" | "Niet gestart";

export type StopModalMode = "harvester" | "template" | "edit" | "stop";

export type ModalTaskDraft = {
  id?: string;
  label: string;
  owner: string;
  done: boolean;
};

export type StopModalState = {
  open: boolean;
  mode: StopModalMode;
  editId: string | null;
  name: string;
  dept: string;
  guide: string;
  sys: string[];
  tasks: ModalTaskDraft[];
  taskDraft: string;
};

export type HarvesterModalState = {
  open: boolean;
  name: string;
  age: string;
  role: string;
  client: string;
  start: string;
  recruiter: string;
  startNow: boolean;
};

export type AppState = {
  view: View;
  loading: boolean;
  hid: string;
  sid: string | null;
  fStatus: string;
  fOwner: string;
  newDept: string;
  newSys: string;
  systems: SystemDef[];
  depts: Department[];
  template: TemplateStop[];
  data: Harvester[];
  modal: StopModalState;
  hmodal: HarvesterModalState;
};
