/**
 * Start dates are stored — and shown everywhere — as short Dutch text ("1 sep 2026"), while an
 * `<input type="date">` speaks ISO ("2026-09-01"). These two helpers bridge the two formats, so a
 * date field can edit the existing values without changing how they are stored or rendered.
 */

const NL_MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 0 || month > 11 || day < 1) return false;
  const d = new Date(Date.UTC(year, month, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month && d.getUTCDate() === day;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "1 sep 2026" (or an already ISO value) -> "2026-09-01". Anything unparseable, like "—", becomes "". */
export function toDateInputValue(display: string): string {
  const value = (display || "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return isRealDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) ? value : "";
  const nl = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(value);
  if (!nl) return "";
  const month = NL_MONTHS.indexOf(nl[2].toLowerCase());
  const day = Number(nl[1]);
  const year = Number(nl[3]);
  if (!isRealDate(year, month, day)) return "";
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** "2026-09-01" -> "1 sep 2026". An empty or invalid value becomes "", which callers read as invalid. */
export function fromDateInputValue(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || "").trim());
  if (!m) return "";
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (!isRealDate(year, month, day)) return "";
  return `${day} ${NL_MONTHS[month]} ${year}`;
}
