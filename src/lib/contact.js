// Shared by the browser form and the server function so both agree on what a valid contact is.
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function parseContact(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  if (EMAIL.test(value)) return { type: "email", value: value.toLowerCase() };

  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.replace(/^91(?=\d{10}$)/, "");
  if (/^[6-9]\d{9}$/.test(local)) return { type: "mobile", value: `+91${local}` };

  return null;
}

export function contactHint() {
  return "Use an email address or a 10-digit Indian mobile number starting with 6, 7, 8 or 9.";
}