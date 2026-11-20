// The one place spending categories, payment methods and goal types are defined.
// Colours are fixed hex values so charts and badges stay in step with the palette.

export const CATEGORIES = [
  { value: "food", label: "Food", color: "#C98A2B", hint: "Eating out, delivery, tea and snacks" },
  { value: "groceries", label: "Groceries", color: "#B5763C", hint: "Kitchen and household supplies" },
  { value: "rent", label: "Rent", color: "#5B6B52", hint: "House rent and maintenance" },
  { value: "transport", label: "Transport", color: "#3F6E63", hint: "Metro, auto, fuel, cabs" },
  { value: "shopping", label: "Shopping", color: "#9C6B8E", hint: "Clothes, gadgets, home things" },
  { value: "entertainment", label: "Entertainment", color: "#A65A3A", hint: "Movies, outings, games" },
  { value: "travel", label: "Travel", color: "#4F7A5A", hint: "Tickets, stays, trips home" },
  { value: "bills", label: "Electricity & bills", color: "#6B7280", hint: "Electricity, water, internet, phone" },
  { value: "medical", label: "Medical", color: "#9C4A4A", hint: "Doctor, medicines, insurance" },
  { value: "education", label: "Education", color: "#46618A", hint: "Courses, books, exams" },
  { value: "emi", label: "EMIs", color: "#7A5C3E", hint: "Loan and card instalments" },
  { value: "subscriptions", label: "Subscriptions", color: "#7C6BA8", hint: "Streaming, apps, memberships" },
  { value: "other", label: "Other", color: "#8A8A72", hint: "Anything that does not fit above" },
];

export const CATEGORY_VALUES = CATEGORIES.map((item) => item.value);

export function categoryMeta(value) {
  return CATEGORIES.find((item) => item.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "netbanking", label: "Net banking" },
  { value: "autopay", label: "Auto-pay" },
  { value: "other", label: "Other" },
];

export function paymentLabel(value) {
  return PAYMENT_METHODS.find((item) => item.value === value)?.label ?? "Other";
}

export const GOAL_KINDS = [
  { value: "emergency", label: "Emergency fund" },
  { value: "laptop", label: "Laptop or gadget" },
  { value: "vehicle", label: "Bike or car" },
  { value: "vacation", label: "Vacation" },
  { value: "education", label: "Higher education" },
  { value: "house", label: "House down payment" },
  { value: "other", label: "Something else" },
];

export const GOAL_PRESETS = [
  { kind: "emergency", name: "Emergency fund", target: 90000, months: 12 },
  { kind: "laptop", name: "New laptop", target: 60000, months: 10 },
  { kind: "vehicle", name: "Bike or car", target: 80000, months: 18 },
  { kind: "vacation", name: "Vacation", target: 40000, months: 8 },
  { kind: "education", name: "Higher education", target: 200000, months: 24 },
  { kind: "house", name: "House down payment", target: 500000, months: 36 },
];