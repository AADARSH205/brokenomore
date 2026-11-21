const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { submitWaitlist } from "@/lib/server-fns";
import { contactHint, parseContact } from "@/lib/contact";

export default function WaitlistForm({ source = "final-cta" }) {
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (!parseContact(contact)) {
      setState({ status: "error", message: contactHint() });
      return;
    }
    if (!consent) {
      setState({ status: "error", message: "Tick the box so we know you are happy to hear from us." });
      return;
    }

    setState({ status: "loading", message: "" });
    try {
      const result = await submitWaitlist({ data: { contact, source, consent: true, honeypot } });
      if (!result.ok) {
        setState({ status: "error", message: result.message });
        return;
      }
      const isEmail = parseContact(contact)?.type === "email";
      setState({
        status: "success",
        message:
          result.status === "already"
            ? "You are already on the list. We will be in touch when the beta opens."
            : isEmail
              ? "You are on the list. Check your inbox for a confirmation."
              : "You are on the list. We will be in touch when the beta opens.",
      });
      try { db?.analytics?.track?.({ eventName: "waitlist_submit", properties: { source } }); } catch { /* ignore */ }
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
          Nothing is charged, and there is no spam. While you wait, the calculator and the free tools above
          are live.
        </p>
        <button
          type="button"
          onClick={() => {
            setState({ status: "idle", message: "" });
            setContact("");
            setConsent(false);
          }}
          className="mt-3 text-xs font-medium text-ink underline underline-offset-2"
        >
          Add another email or number
        </button>
      </div>
    );
  }

  const loading = state.status === "loading";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`waitlist-contact-${source}`} className="text-sm font-medium">
          Email or mobile number
        </label>
        <input
          id={`waitlist-contact-${source}`}
          name="contact"
          type="text"
          inputMode="email"
          autoComplete="email"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="you@example.com or 98765 43210"
          aria-describedby={`waitlist-hint-${source}`}
          aria-invalid={state.status === "error"}
          className="mt-1.5 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <p id={`waitlist-hint-${source}`} className="mt-1.5 text-xs text-muted-foreground">
          {contactHint()}
        </p>
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor={`waitlist-website-${source}`}>Website</label>
        <input
          id={`waitlist-website-${source}`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id={`waitlist-consent-${source}`}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
        />
        <label htmlFor={`waitlist-consent-${source}`} className="text-xs leading-relaxed text-muted-foreground">
          Yes, email me when the Android app launches. I have read the{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy policy
          </a>
          , and I can ask to be removed any time.
        </label>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? "Adding you…" : "Join Android waitlist"}
      </button>
    </form>
  );
}