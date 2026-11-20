import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { site, faqs } from "@/config/site";

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Questions</p>
          <h2 id="faq-heading" className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight">
            The things people ask before signing up.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Still unsure? Email{" "}
            <a
              href={`mailto:${site.contactEmail}`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              {site.contactEmail}
            </a>{" "}
            and a person will reply.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="border-border">
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}