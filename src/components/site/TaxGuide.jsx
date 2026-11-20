const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { TAX_CATEGORIES, TAX_ITEMS, TAX_META } from "@/data/tax-deductions";

const PAGE = 8;

export default function TaxGuide() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showOld, setShowOld] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TAX_ITEMS.filter((item) => {
      const inCategory = category === "All" || item.category === category;
      if (!inCategory) return false;
      if (!needle) return true;
      return [item.title, item.newSection, item.oldSection, item.limit, item.note, item.category]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, category]);

  const visible = expanded ? filtered : filtered.slice(0, PAGE);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Deductions worth knowing</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {TAX_META.taxYearLabel} under the {TAX_META.newAct}. Compare old vs new regime rules. Last reviewed: {TAX_META.asOf}.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
          <Switch
            id="old-sections"
            checked={showOld}
            onCheckedChange={(next) => {
              setShowOld(next);
              db.analytics.track({ eventName: "tax_toggle_old_sections" });
            }}
          />
          <label htmlFor="old-sections" className="text-xs font-medium text-foreground">
            Show old 1961 numbers
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="tax-search" className="sr-only">
            Search deductions
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="tax-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search: health insurance, NPS, education loan…"
            className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...TAX_CATEGORIES].map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "deduction" : "deductions"}
        {category !== "All" ? ` in ${category}` : ""}
        {query.trim() ? ` matching “${query.trim()}”` : ""}.
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Nothing matches that search. Try a broader word like “health” or “savings”.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] font-medium text-primary-foreground">
                  {showOld ? item.oldSection : item.newSection}
                </span>
                <span className="rounded-full bg-olive-soft px-2.5 py-1 text-[11px] font-medium text-ink">
                  {item.category}
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                  {item.regime === "both" ? "Both regimes" : "Old regime only"}
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold leading-snug">{item.title}</h4>
              <p className="mt-1.5 text-sm font-medium text-foreground/90">{item.limit}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {showOld ? `New number: ${item.newSection}` : `Earlier: ${item.oldSection}`}
                </span>
                <a
                  href={item.source}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                >
                  Source
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > PAGE && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
        >
          {expanded ? "Show less" : `Show more (${filtered.length - PAGE} more)`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-5 text-xs leading-relaxed text-muted-foreground">
        <p>{TAX_META.note}</p>
        <p className="mt-2">
          Sources:{" "}
          {TAX_META.sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? " · " : ""}
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {source.label}
              </a>
            </span>
          ))}
          . Check the current limits there before you file.
        </p>
        <p className="mt-2 font-medium text-foreground">
          Educational only. Not tax advice, and not a substitute for a chartered accountant.
        </p>
      </div>
    </div>
  );
}