export type View = "reis" | "dashboard" | "beheer" | "organisatie" | "gebruikers" | "bookmarks" | "verbeteringen";

export type Role = "viewer" | "editor" | "admin";

export type CurrentUser = {
  id: number;
  email: string;
  role: Role;
};

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

export type Bookmark = {
  id: string;
  name: string;
  url: string;
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

export type HarvesterStatus = "active" | "completed" | "aborted";

export type Harvester = {
  id: string;
  name: string;
  age: string;
  role: string;
  client: string;
  start: string;
  recruiter: string;
  stops: Stop[];
  status: HarvesterStatus;
  email?: string;
  apolloWelcomeSentAt?: string;
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
  position: number;
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
  email: string;
};

export type PersistedAppState = {
  data: Harvester[];
  template: TemplateStop[];
  depts: Department[];
  systems: SystemDef[];
  bookmarks: Bookmark[];
  hid: string;
  view: View;
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
  newBookmarkName: string;
  newBookmarkUrl: string;
  systems: SystemDef[];
  depts: Department[];
  template: TemplateStop[];
  data: Harvester[];
  bookmarks: Bookmark[];
  modal: StopModalState;
  hmodal: HarvesterModalState;
};

export type FeatureRequestStatus =
  | "concept"
  | "ter_review"
  | "aangevraagd"
  | "bouwen"
  | "in_review"
  | "mislukt"
  | "verborgen"
  | "live"
  | "uitgeschakeld";

export type FeatureRequestSpec = {
  title: string;
  problem: string;
  desiredOutcome: string;
  inScope: string;
  outOfScope: string;
  area: string;
  priority: string;
};

export type FeatureRequest = FeatureRequestSpec & {
  id: number;
  status: FeatureRequestStatus;
  requestedByEmail: string;
  reviewerEmail: string | null;
  reviewComment: string | null;
  githubIssueUrl: string | null;
  prUrl: string | null;
  previewUrl: string | null;
  flagKey: string | null;
  isLive: boolean;
  liveToggledBy: string | null;
  liveToggledAt: string | null;
  rollbackReason: string | null;
  hasImage: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeatureRequestEvent = {
  id: number;
  featureRequestId: number;
  event: string;
  actorEmail: string;
  detail: string | null;
  createdAt: string;
};

export type RefineMessage = {
  role: "user" | "assistant";
  text: string;
};

export type RefineResult =
  | { type: "question"; text: string }
  | { type: "spec"; spec: FeatureRequestSpec };
