import { formatINR } from "@/lib/money";

function MoneyField({ id, label, value, onChange, hint, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "0"}
        className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Group({ title, children, note }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-4">
      <legend className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{title}</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">{children}</div>
      {note && <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{note}</p>}
    </fieldset>
  );
}

export default function TaxForm({ form, onChange }) {
  const set = (key, value) => onChange({ ...form, [key]: value });
  const monthly = Math.round((Number(form.gross_salary) || 0) / 12);

  return (
    <div className="space-y-4">
      <Group title="Salary" note="Take the numbers from your payslip or Form 16. Everything here is for the full year.">
        <div className="sm:col-span-2">
          <label htmlFor="tax-monthly" className="text-sm font-medium">
            Monthly gross salary
          </label>
          <input
            id="tax-monthly"
            type="number"
            min="0"
            step="1"
            value={monthly || ""}
            onChange={(event) => set("gross_salary", String((Number(event.target.value) || 0) * 12))}
            placeholder="45000"
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            We fill the annual figure below from this: {formatINR(monthly * 12)} a year.
          </p>
        </div>
        <MoneyField
          id="tax-gross"
          label="Annual gross salary (₹)"
          value={form.gross_salary}
          onChange={(value) => set("gross_salary", value)}
          placeholder="540000"
        />
        <MoneyField
          id="tax-basic"
          label="Annual basic salary (₹)"
          value={form.basic_salary}
          onChange={(value) => set("basic_salary", value)}
          hint="Usually 40% to 50% of gross. Needed for HRA and NPS limits."
        />
        <MoneyField
          id="tax-hra"
          label="HRA received (₹)"
          value={form.hra_received}
          onChange={(value) => set("hra_received", value)}
          hint="Only counts in the old regime."
        />
        <MoneyField
          id="tax-bonus"
          label="Annual bonus or variable pay (₹)"
          value={form.bonus}
          onChange={(value) => set("bonus", value)}
          hint="Taxed exactly like salary. Leave it blank if you do not get one."
        />
      </Group>

      <Group
        title="Other income"
        note="Interest from savings, freelance work, rent you receive. It is added to your taxable income in both regimes."
      >
        <div className="sm:col-span-2">
          <MoneyField
            id="tax-other-income"
            label="Other annual income (₹)"
            value={form.other_income}
            onChange={(value) => set("other_income", value)}
            hint="A bank pays about ₹3,500 interest on ₹1 lakh in a savings account. 80TTA covers part of it in the old regime."
          />
        </div>
      </Group>

      <Group title="Rent" note="Rent is only useful in the old regime, and only if you actually pay it.">
        <MoneyField
          id="tax-rent"
          label="Annual rent paid (₹)"
          value={form.rent_paid}
          onChange={(value) => set("rent_paid", value)}
        />
        <label className="flex items-start gap-2.5 self-end text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.metro)}
            onChange={(event) => set("metro", event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
          />
          <span>
            I live in Delhi, Mumbai, Kolkata or Chennai
            <span className="block text-xs text-muted-foreground">Metro cities get 50% of basic, others 40%.</span>
          </span>
        </label>
      </Group>

      <Group title="Retirement contributions" note="Employer NPS is allowed in both regimes. Your own PF and NPS count only in the old regime.">
        <MoneyField
          id="tax-pf"
          label="Your PF contribution (₹)"
          value={form.employee_pf}
          onChange={(value) => set("employee_pf", value)}
          hint="Part of the ₹1.5 lakh 80C limit."
        />
        <MoneyField
          id="tax-nps-self"
          label="Your NPS — Section 124(3) / 80CCD(1B) (₹)"
          value={form.employee_nps}
          onChange={(value) => set("employee_nps", value)}
          hint="Voluntary NPS under Section 124(3) (Direct Tax Code) / 80CCD(1B), capped at ₹50,000. Old regime only."
        />
        <MoneyField
          id="tax-nps-employer"
          label="Employer NPS (₹)"
          value={form.employer_nps}
          onChange={(value) => set("employer_nps", value)}
          hint="Section 80CCD(2), up to 14% of basic."
        />
      </Group>

      <Group title="Other deductions" note="Old regime only, except employer NPS. Keep the proofs: none of this is automatic.">
        <MoneyField
          id="tax-80c"
          label="Other 80C (₹)"
          value={form.other_80c}
          onChange={(value) => set("other_80c", value)}
          hint="ELSS, PPF, life insurance, tuition fees."
        />
        <MoneyField
          id="tax-80d"
          label="Health insurance premium (₹)"
          value={form.health_insurance}
          onChange={(value) => set("health_insurance", value)}
          hint="Section 80D."
        />
        <MoneyField
          id="tax-home"
          label="Home loan interest (₹)"
          value={form.home_loan_interest}
          onChange={(value) => set("home_loan_interest", value)}
          hint="Section 24(b), self-occupied home only."
        />
        <MoneyField
          id="tax-other"
          label="Anything else (₹)"
          value={form.other_deductions}
          onChange={(value) => set("other_deductions", value)}
          hint="80TTA on savings interest, 80E on education loans."
        />
      </Group>
    </div>
  );
}