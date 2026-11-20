// Booking rules shared by the calendar and the server: weekdays only, India time,
// a fixed set of demo slots. Pure functions, no React.

export const CALL_MINUTES = 15;

// Demo slots, India time. Each call runs 15 minutes.
export const SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Today in India, whatever the visitor's own timezone is. */
export function istNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const pick = (type) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: pick("year"),
    month: pick("month") - 1,
    day: pick("day"),
    minutes: (pick("hour") % 24) * 60 + pick("minute"),
  };
}

export function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

/** 0 = Sunday. Read in UTC so the weekday never shifts with the visitor's clock. */
export function weekday(year, month, day) {
  return new Date(Date.UTC(year, month, day)).getUTCDay();
}

export function slotMinutes(slot) {
  const [time, period] = slot.split(" ");
  const [hour, minute] = time.split(":").map(Number);
  const h = period === "PM" && hour !== 12 ? hour + 12 : period === "AM" && hour === 12 ? 0 : hour;
  return h * 60 + minute;
}

/** Weekdays, from today up to eight weeks ahead. */
export function isBookableDate(year, month, day, now = istNow()) {
  const wd = weekday(year, month, day);
  if (wd === 0 || wd === 6) return false;

  const key = dateKey(year, month, day);
  if (key < dateKey(now.year, now.month, now.day)) return false;

  const limit = Date.UTC(now.year, now.month, now.day + 56);
  return Date.UTC(year, month, day) <= limit;
}

/** Slots still open on a day: not already booked, and not within the next hour today. */
export function slotsForDate(key, booked = new Set(), now = istNow()) {
  const todayKey = dateKey(now.year, now.month, now.day);

  return SLOTS.filter((slot) => {
    if (booked.has(`${key}|${slot}`)) return false;
    if (key === todayKey && slotMinutes(slot) <= now.minutes + 60) return false;
    return true;
  });
}

export function monthLabel(year, month) {
  return `${MONTHS[month]} ${year}`;
}

export function weekLabel(start) {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const first = `${MONTHS_SHORT[start.getUTCMonth()]} ${start.getUTCDate()}`;
  const last =
    start.getUTCMonth() === end.getUTCMonth()
      ? `${end.getUTCDate()}`
      : `${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCDate()}`;
  return `${first} – ${last}`;
}

export function mondayOf(year, month, day) {
  const date = new Date(Date.UTC(year, month, day));
  const wd = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (wd === 0 ? -6 : 1 - wd));
  return date;
}

export function longDate(key) {
  const { year, month, day } = parseKey(key);
  return `${DAYS_SHORT[weekday(year, month, day)]}, ${day} ${MONTHS_SHORT[month]} ${year}`;
}

export function endTime(slot) {
  const total = slotMinutes(slot) + CALL_MINUTES;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}