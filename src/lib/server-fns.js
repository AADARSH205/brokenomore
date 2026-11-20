import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseContact } from "@/lib/contact";
import { site } from "@/config/site";
import { SLOTS, endTime, isBookableDate, longDate, parseKey } from "@/lib/booking";

const HOUR = 60 * 60 * 1000;

const waitlistSchema = z.object({
  contact: z.string().trim().min(3).max(160),
  source: z.string().trim().max(40).optional().default("final-cta"),
  consent: z.literal(true),
  honeypot: z.string().max(200).optional().default(""),
});

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(160),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().trim().max(20),
  notes: z.string().trim().max(500).optional().default(""),
  honeypot: z.string().max(200).optional().default(""),
});

const pilotSchema = z.object({
  company: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().max(160).regex(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, "invalid email"),
  teamSize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  notes: z.string().trim().max(1000).optional().default(""),
  honeypot: z.string().max(200).optional().default(""),
});

function confirmationHtml({ name, line }) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F7F4D5;padding:32px;color:#0A3323">
  <div style="max-width:520px;margin:0 auto;background:#fffdf3;border-radius:20px;padding:28px;border:1px solid #d9d8b8">
    <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#5b6b52;margin:0 0 12px">${site.name}</p>
    <h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">${name}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#2c4739">${line}</p>
    <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#2c4739">While you wait, the daily-number calculator and the free tax, SIP and credit tools are live on the site. No signup needed.</p>
    <p style="font-size:13px;line-height:1.6;margin:20px 0 0;color:#5b6b52">You asked us to email you about the beta. Reply to this mail any time to be removed. Nothing is charged, ever, without you saying yes.</p>
    <p style="font-size:13px;margin:16px 0 0;color:#5b6b52">— The ${site.name} team · ${site.contactEmail}</p>
  </div>
</div>`;
}

async function recentCount(db, entity, field, value, windowMs) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const page = await db.entities[entity].filter({ [field]: value, created_date: { $gte: since } }, { limit: 20 });
  const items = Array.isArray(page) ? page : (page?.items ?? []);
  return items.length;
}

export const submitWaitlist = createServerFn({ method: "POST" })
  .validator((data) => waitlistSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (data.honeypot) return { ok: true, status: "success" };

    const parsed = parseContact(data.contact);
    if (!parsed) {
      return {
        ok: false,
        message: "That does not look like an email address or a 10-digit Indian mobile number. Try again?",
      };
    }

    const db = context.getBase44().asServiceRole;

    const already = await recentCount(db, "WaitlistSignup", "contact", parsed.value, 24 * HOUR);
    if (already > 0) return { ok: true, status: "already" };

    const lastHour = await recentCount(db, "WaitlistSignup", "contact", parsed.value, HOUR);
    if (lastHour >= 3) {
      return { ok: false, message: "That is a few tries in a row. Give it an hour and try again." };
    }

    await db.entities.WaitlistSignup.create({
      contact: parsed.value,
      contact_type: parsed.type,
      source: data.source,
      consent: true,
    });

    if (parsed.type === "email") {
      try {
        await db.integrations.Core.SendEmail({
          to: parsed.value,
          subject: "You're on the BrokeNoMore Android beta list",
          html: confirmationHtml({
            name: "You're on the list.",
            line: `We will email you the moment the Android beta opens. One mail when it is ready, and nothing else unless you ask.`,
          }),
          category: "transactional",
        });
      } catch {
        // The signup is safely stored; a mail outage should not fail the form.
      }
    }

    return { ok: true, status: "created" };
  });

export const submitPilot = createServerFn({ method: "POST" })
  .validator((data) => pilotSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (data.honeypot) return { ok: true, status: "success" };

    const db = context.getBase44().asServiceRole;
    const email = data.workEmail.toLowerCase();

    const already = await recentCount(db, "PilotRequest", "work_email", email, 24 * HOUR);
    if (already > 0) return { ok: true, status: "already" };

    await db.entities.PilotRequest.create({
      company: data.company,
      work_email: email,
      team_size: data.teamSize,
      notes: data.notes,
    });

    try {
      await db.integrations.Core.SendEmail({
        to: email,
        subject: "We have your pilot request — BrokeNoMore",
        html: confirmationHtml({
          name: "Got it. We will be in touch.",
          line: `Thanks for asking about a pilot for ${data.company}. A person, not a bot, will reply to this address within two working days with what a pilot involves and what we would need from you.`,
        }),
        category: "transactional",
      });
    } catch {
      // Stored regardless; the team still sees the request.
    }

    try {
      await db.integrations.Core.SendEmail({
        to: site.contactEmail,
        subject: `Pilot request: ${data.company} (${data.teamSize})`,
        html: confirmationHtml({
          name: `New pilot request from ${data.company}`,
          line: `Work email: ${email}<br/>Team size: ${data.teamSize}<br/>Notes: ${data.notes || "none"}`,
        }),
        category: "transactional",
      });
    } catch {
      // The request is in the database either way.
    }

    return { ok: true, status: "created" };
  });

// Only the taken day-and-time pairs leave the server, never who booked them.
export const getBookingAvailability = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const page = await context
    .getBase44()
    .asServiceRole.entities.BookingRequest.filter(
      { status: { $in: ["new", "confirmed"] } },
      { limit: 500 },
    );

  const items = Array.isArray(page) ? page : (page?.items ?? []);
  return { booked: items.map((row) => `${row.date}|${row.slot}`) };
});

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data) => bookingSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (data.honeypot) return { ok: true, status: "created", date: data.date, slot: data.slot };

    const parsed = parseContact(data.contact);
    if (!parsed) {
      return {
        ok: false,
        message: "That does not look like an email address or a 10-digit Indian mobile number. Try again?",
      };
    }

    const { year, month, day } = parseKey(data.date);
    if (!isBookableDate(year, month, day)) {
      return { ok: false, message: "That day is not open. Pick a weekday in the next few weeks." };
    }
    if (!SLOTS.includes(data.slot)) {
      return { ok: false, message: "Pick one of the times listed." };
    }

    const db = context.getBase44().asServiceRole;

    const taken = await db.entities.BookingRequest.filter(
      { date: data.date, slot: data.slot, status: { $in: ["new", "confirmed"] } },
      { limit: 5 },
    );
    const takenItems = Array.isArray(taken) ? taken : (taken?.items ?? []);
    if (takenItems.length > 0) {
      return { ok: false, message: "Someone just took that slot. Pick another time." };
    }

    await db.entities.BookingRequest.create({
      name: data.name,
      contact: parsed.value,
      contact_type: parsed.type,
      date: data.date,
      slot: data.slot,
      notes: data.notes,
      status: "new",
    });

    const when = `${longDate(data.date)}, ${data.slot}–${endTime(data.slot)} IST`;

    if (parsed.type === "email") {
      try {
        await db.integrations.Core.SendEmail({
          to: parsed.value,
          subject: `Your BrokeNoMore demo: ${when}`,
          html: confirmationHtml({
            name: "Your 15 minutes are held.",
            line: `${data.name}, your walkthrough is booked for ${when}. We will send the call link to this address before the call. Reply to move it.`,
          }),
          category: "transactional",
        });
      } catch {
        // The booking is stored; a mail outage should not fail it.
      }
    }

    try {
      await db.integrations.Core.SendEmail({
        to: site.contactEmail,
        subject: `Demo booked: ${when} — ${data.name}`,
        html: confirmationHtml({
          name: `New demo booking: ${when}`,
          line: `${data.name}<br/>Contact: ${parsed.value} (${parsed.type})<br/>Notes: ${data.notes || "none"}`,
        }),
        category: "transactional",
      });
    } catch {
      // Stored either way.
    }

    return { ok: true, status: "created", date: data.date, slot: data.slot };
  });