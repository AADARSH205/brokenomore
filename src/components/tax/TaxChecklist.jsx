import { Check } from "lucide-react";

const ITEMS = [
  {
    id: "80c",
    title: "Fill the 80C limit of ₹1.5 lakh",
    body: "Employee PF already counts. ELSS, PPF, a term plan or children's tuition fees can top it up. Old regime only.",
  },
  {
    id: "nps",
    title: "Use the extra ₹50,000 of NPS",
    body: "Section 80CCD(1B) sits on top of 80C. The money is locked until you are 60, so only use what you will not need.",
  },
  {
    id: "80d",
    title: "Claim health insurance under 80D",
    body: "Your own premium, and your parents' if you pay it. Keep the policy receipt and the premium paid statement.",
  },
  {
    id: "hra",
    title: "Collect rent receipts for HRA",
    body: "Landlord's name, address, rent and their PAN if rent is above ₹1 lakh a year. Old regime only.",
  },
  {
    id: "home",
    title: "Add home loan interest under 24(b)",
    body: "Only the interest part, only for a self-occupied home, and only up to ₹2 lakh a year.",
  },
  {
    id: "proofs",
    title: "Send proofs to payroll before the deadline",
    body: "Declarations in April, proofs by January. Miss the date and the tax comes back as a March deduction.",
  },
];

/** A checklist the person ticks off. Saved with the tax details, so it survives a reload. */
export default function TaxChecklist({ value = [], onChange }) {
  const done = new Set(value);

  const toggle = (id) => {
    const next = done.has(id) ? value.filter((item) => item !== id) : [...value, id];
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">Tax-saving checklist</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done.size} of {ITEMS.length} done
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Tick what you have actually done. Press Save details above to keep it.
      </p>
      <ul className="mt-3 space-y-2">
        {ITEMS.map((item) => {
          const checked = done.has(item.id);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-secondary/50">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">{item.body}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}