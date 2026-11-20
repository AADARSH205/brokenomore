// Small display helpers so every screen writes dates the same way.
export function getLastReviewedDate() {
  const date = new Date();
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDay(key, options = {}) {
  if (!key) return "—";
  const date = new Date(`${String(key).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(date);
}

export function formatDayShort(key) {
  return formatDay(key, { year: undefined });
}

export function weekdayName(key) {
  const date = new Date(`${String(key).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(date);
}

export function ordinal(day) {
  const value = Number(day) || 1;
  const suffix =
    value % 10 === 1 && value !== 11
      ? "st"
      : value % 10 === 2 && value !== 12
        ? "nd"
        : value % 10 === 3 && value !== 13
          ? "rd"
          : "th";
  return `${value}${suffix}`;
}