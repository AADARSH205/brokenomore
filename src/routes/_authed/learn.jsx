import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ARTICLES } from "@/data/learn";

export const Route = createFileRoute("/_authed/learn")({
  ssr: false,
  head: () => ({ meta: [{ title: "Financial education — BrokeNoMore" }] }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financial education"
        title="Money, explained like a person"
        description="Short guides for your first few years of earning. No jargon, no fund recommendations, no promises about returns."
      />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {ARTICLES.length} guides · each one takes about four minutes
        </div>

        <Accordion type="single" collapsible className="mt-4 space-y-3">
          {ARTICLES.map((article) => (
            <AccordionItem
              key={article.slug}
              value={article.slug}
              className="rounded-2xl border border-border px-4 last:border-b"
            >
              <AccordionTrigger className="py-4 text-left hover:no-underline">
                <div>
                  <p className="font-display text-base font-semibold leading-snug">{article.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    {article.minutes} min · {article.summary}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 text-[14px] leading-relaxed text-foreground/85">
                  {article.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
                <p className="mt-4 rounded-xl bg-positive-soft px-3 py-2.5 text-[13px] font-medium text-positive">
                  {article.takeaway}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <p className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        This material is general education, not personal financial or investment advice. For advice about your own
        situation, speak to a SEBI-registered investment adviser or a chartered accountant.
      </p>
    </div>
  );
}