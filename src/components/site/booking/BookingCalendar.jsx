const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useMemo, useState } from "react";

import { getBookingAvailability, submitBooking } from "@/lib/server-fns";
import { dateKey, istNow, mondayOf, slotsForDate } from "@/lib/booking";
import CalendarPane from "@/components/site/booking/CalendarPane";
import SlotPanel from "@/components/site/booking/SlotPanel";

export default function BookingCalendar() {
  const now = useMemo(() => istNow(), []);
  const [cursor, setCursor] = useState({ year: now.year, month: now.month });
  const [mode, setMode] = useState("monthly");
  const [weekStart, setWeekStart] = useState(() => mondayOf(now.year, now.month, now.day));
  const [selected, setSelected] = useState(null);
  const [slot, setSlot] = useState(null);
  const [booked, setBooked] = useState(() => new Set());
  const [step, setStep] = useState("pick");
  const [form, setForm] = useState({ name: "", contact: "", notes: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const refresh = useCallback(async () => {
    try {
      const result = await getBookingAvailability();
      setBooked(new Set(result.booked ?? []));
    } catch {
      setBooked(new Set());
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const slots = selected ? slotsForDate(selected.key, booked, now) : [];

  const pick = (cell) => {
    setStatus({ state: "idle", message: "" });
    setStep("pick");
    setSlot(null);
    setSelected((prev) => (prev?.key === cell.key ? null : cell));
  };

  const move = (dir) => {
    setStatus({ state: "idle", message: "" });

    if (mode === "weekly") {
      const next = new Date(weekStart);
      next.setUTCDate(next.getUTCDate() + dir * 7);
      setWeekStart(next);
      setCursor({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
      return;
    }

    const next = new Date(Date.UTC(cursor.year, cursor.month + dir, 1));
    setCursor({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  };

  const switchMode = (next) => {
    if (next === mode) return;
    if (next === "weekly" && selected) {
      setWeekStart(mondayOf(selected.year, selected.month, selected.day));
    }
    setMode(next);
    setSelected(null);
    setSlot(null);
    setStep("pick");
    setStatus({ state: "idle", message: "" });
  };

  const book = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "" });

    try {
      const result = await submitBooking({
        data: {
          name: form.name,
          contact: form.contact,
          notes: form.notes,
          date: selected.key,
          slot,
          honeypot: "",
        },
      });

      if (!result.ok) {
        setStatus({ state: "error", message: result.message });
        return;
      }

      setStep("done");
      setStatus({ state: "idle", message: "" });
      db.analytics.track({ eventName: "demo_booking_confirmed" });
      refresh();
    } catch {
      setStatus({ state: "error", message: "Something went wrong on our side. Please try once more." });
    }
  };

  const reset = () => {
    setSelected(null);
    setSlot(null);
    setStep("pick");
    setForm({ name: "", contact: "", notes: "" });
    setStatus({ state: "idle", message: "" });
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      <CalendarPane
        mode={mode}
        onMode={switchMode}
        cursor={cursor}
        weekStart={weekStart}
        selectedKey={selected?.key ?? null}
        onPick={pick}
        onPrev={() => move(-1)}
        onNext={() => move(1)}
        now={now}
      />

      {selected && (
        <div className="w-full shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300 lg:w-[300px]">
          <SlotPanel
            selected={selected}
            slots={slots}
            slot={slot}
            onSlot={(next) => {
              setSlot((prev) => (prev === next ? null : next));
              setStatus({ state: "idle", message: "" });
            }}
            step={step}
            form={form}
            setForm={setForm}
            onSubmit={book}
            status={status}
            onBack={() => {
              setStep("pick");
              setStatus({ state: "idle", message: "" });
            }}
            onBook={() => setStep("details")}
            onReset={reset}
            isToday={selected.key === dateKey(now.year, now.month, now.day)}
          />
        </div>
      )}
    </div>
  );
}