const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { submitPilot } from "@/lib/server-fns";

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const EMPTY = { company: "", workEmail: "", teamSize: "", notes: "" };

export default function PilotForm() {
  const [form, setForm] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.company.trim().length < 2) {
      setState({ status: "error", message: "Add your company name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.workEmail.trim())) {
      setState({ status: "error", message: "Add a valid work email address." });
      return;
    }
    if (!form.teamSize) {
      setState({ status: "error", message: "Pick your team size so we can size the pilot." });
      return;
    }

    setState({ status: "loading", message: "" });
    try {
      const result = await submitPilot({
        data: {
          company: form.company,
          workEmail: form.workEmail,
          teamSize: form.teamSize,
          notes: form.notes,
          honeypot,
        },
      });
      if (!result.ok) {
        setState({ status: "error", message: result.message ?? "Please check the form and try again." });
        return;
      }
      setState({
        status: "success",
        message:
          result.status === "already"
            ? "We already have a request from that address. Someone will reply within two working days."
            : "Request received. A person will reply within two working days.",
      });
      try { db?.analytics?.track?.({ eventName: "pilot_submit" }); } catch { /* ignore */ }
    } catch {
      setState({ status: "error", message: "Something went wrong on our side. Please try once more." });
    }
  };

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-accent/40 bg-olive-soft/60 p-5" role="status">
        <p className="flex items-start gap-2 text-sm font-medium text-ink">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink/75">
          We will ask about your team's salary dates, what you already offer, and how many seats you need.
          No contract talk in the first call.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY);
            setState({ status: "idle", message: "" });
          }}
          className="mt-3 text-xs font-medium text-ink underline underline-offset-2"
        >
          Send another request
        </button>
      </div>
    );
  }

  const loading = state.status === "loading";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="pilot-company" className="text-sm font-medium">
          Company
        </label>
        <input
          id="pilot-company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={set("company")}
          placeholder="Acme Studios"
          className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label htmlFor="pilot-email" className="text-sm font-medium">
          Work email
        </label>
        <input
          id="pilot-email"
          type="email"
          autoComplete="email"
          value={form.workEmail}
          onChange={set("workEmail")}
          placeholder="you@company.com"
          className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label htmlFor="pilot-size" className="text-sm font-medium">
          Team size
        </label>
        <select
          id="pilot-size"
          value={form.teamSize}
          onChange={set("teamSize")}
          className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">Choose a range</option>
          {TEAM_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} people
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pilot-notes" className="text-sm font-medium">
          Anything we should know? <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="pilot-notes"
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Most of our team is in their first two years of work…"
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="pilot-website">Website</label>
        <input
          id="pilot-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? "Sending…" : "Request a pilot"}
      </button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        We use this only to reply about a pilot. No newsletter, no sequence of follow-ups.
      </p>
    </form>
  );
}