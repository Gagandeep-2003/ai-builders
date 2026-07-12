import { AlertTriangle, CheckCircle2, Clock3, LockKeyhole, Plus } from "lucide-react";
import { addAvailabilitySlotAction } from "@/app/actions/admin";
import { DeleteAvailabilitySlotForm } from "@/components/admin/delete-availability-slot-form";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminAvailabilityData, getAdminData } from "@/lib/data";
import {
  formatSlotMinutes,
  getAvailabilitySlots,
  getBookedSlots,
  parseSlotMinutes,
  summarizeAvailability,
  type AvailabilitySlot,
  type BookedSlot,
} from "@/lib/slot-availability";

const dayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const statusStyles: Record<AvailabilitySlot["status"], string> = {
  available: "border-accent/35 bg-accent/10 text-accent",
  booked: "border-rose-300/35 bg-rose-400/10 text-rose-100",
  blocked: "border-amber-300/35 bg-amber-300/10 text-amber-100",
};

const statusIcons = {
  available: CheckCircle2,
  booked: LockKeyhole,
  blocked: AlertTriangle,
};

function getSlotLabel(status: AvailabilitySlot["status"]) {
  if (status === "available") return "Available";
  if (status === "booked") return "Booked";
  return "Overlap";
}

function getConflictName(conflict: BookedSlot) {
  return conflict.studentNames.length > 0 ? conflict.studentNames.join(", ") : conflict.batchName;
}

function SlotTile({ slot, managedSlotId }: { slot: AvailabilitySlot; managedSlotId?: string }) {
  const Icon = statusIcons[slot.status];

  return (
    <article className={`group relative overflow-hidden rounded-xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${statusStyles[slot.status]}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-current/30" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-base font-bold text-text-primary">{slot.timeLabel}</p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em]">{getSlotLabel(slot.status)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {managedSlotId ? (
            <DeleteAvailabilitySlotForm
              slotId={managedSlotId}
              label={`${slot.dayLabel} ${slot.timeLabel}`}
            />
          ) : null}
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-current/20 bg-bg-base/30">
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </div>

      {slot.conflicts.length > 0 ? (
        <div className="mt-4 space-y-2">
          {slot.conflicts.map((conflict) => (
            <div key={conflict.id} className="rounded-lg border border-white/10 bg-bg-base/30 px-3 py-2">
              <p className="truncate text-xs font-semibold text-text-primary">{getConflictName(conflict)}</p>
              <p className="mt-1 text-[0.68rem] text-text-muted">
                {conflict.istDayLabel} {conflict.timeLabel} IST · {conflict.sourceLabel}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-text-secondary">Clean one-hour slot in your tracked bucket.</p>
      )}
    </article>
  );
}

export default async function AdminSlotsPage() {
  const [data, availability] = await Promise.all([getAdminData(), getAdminAvailabilityData()]);
  const bookedSlots = getBookedSlots(data.batches, data.students);
  const slotsByDay = getAvailabilitySlots(bookedSlots, availability.bucket);
  const summary = summarizeAvailability(slotsByDay);
  const managedSlotIds = new Map(
    availability.managedSlots.map((slot) => [
      `${slot.dayIndex}-${slot.startTime}`,
      slot.id,
    ]),
  );
  const summaryCards = [
    { label: "Available", value: summary.available, detail: "Open one-hour options", tone: "text-accent", Icon: CheckCircle2 },
    { label: "Booked", value: summary.booked, detail: "Exact slot already taken", tone: "text-rose-100", Icon: LockKeyhole },
    { label: "Overlaps", value: summary.blocked, detail: "Blocked by partial clash", tone: "text-amber-100", Icon: AlertTriangle },
    { label: "Tracked", value: summary.total, detail: "Slots in your bucket", tone: "text-sky-100", Icon: Clock3 },
  ];
  const trackedBookingIds = new Set(
    slotsByDay.flatMap((day) => day.slots.flatMap((slot) => slot.conflicts.map((conflict) => conflict.id))),
  );
  const outsideBucket = bookedSlots.filter((slot) => !trackedBookingIds.has(slot.id));

  return (
    <AnimatedPage>
      <PageHeader
        title="Slot Availability"
        subtitle="Track your fixed IST teaching bucket against booked batch timings before assigning a new student."
      />

      <section className="premium-card rounded-xl p-6">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Availability controls</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Add or remove your available slots</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Times here are your teaching availability in IST. Student reschedule options will automatically use this same bucket.
            </p>
            {availability.usesFallback ? (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                Database table not found yet, so this page is showing the fallback slot list. Run
                <span className="font-mono"> supabase/admin-availability-slots-migration.sql </span>
                once to enable saving changes.
              </div>
            ) : null}
          </div>

          <form action={addAvailabilitySlotAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="space-y-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">Day</span>
              <select name="dayOfWeek" className="h-12 w-full rounded-xl border border-border bg-bg-elevated px-4 text-sm text-text-primary outline-none transition focus:border-accent/60">
                {dayOptions.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">Start time IST</span>
              <input name="startTime" type="time" step="1800" required className="h-12 w-full rounded-xl border border-border bg-bg-elevated px-4 text-sm text-text-primary outline-none transition focus:border-accent/60" />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">End time IST</span>
              <input name="endTime" type="time" step="1800" className="h-12 w-full rounded-xl border border-border bg-bg-elevated px-4 text-sm text-text-primary outline-none transition focus:border-accent/60" />
            </label>
            <button type="submit" className="button-motion mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-semibold text-bg-base">
              <Plus className="h-4 w-4" />
              Add slot
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {availability.managedSlots
            .slice()
            .sort((first, second) => first.dayIndex - second.dayIndex || parseSlotMinutes(first.startTime) - parseSlotMinutes(second.startTime))
            .map((slot) => {
              const dayLabel = dayOptions.find((day) => day.value === slot.dayIndex)?.label ?? "Slot";
              const timeLabel = `${formatSlotMinutes(parseSlotMinutes(slot.startTime))} - ${formatSlotMinutes(parseSlotMinutes(slot.endTime))}`;

              return (
                <DeleteAvailabilitySlotForm
                  key={slot.id}
                  slotId={slot.id}
                  label={`${dayLabel} ${timeLabel}`}
                  variant="chip"
                />
              );
            })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, detail, tone, Icon }) => (
          <article key={label} className="premium-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
                <p className="mt-3 font-heading text-4xl font-black">{value}</p>
                <p className="mt-1 text-sm text-text-secondary">{detail}</p>
              </div>
              <span className={`grid h-11 w-11 place-items-center rounded-xl border border-current/20 bg-white/[0.03] ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {slotsByDay.map((day) => {
          const availableCount = day.slots.filter((slot) => slot.status === "available").length;
          return (
            <div key={day.dayIndex} className="premium-card rounded-xl p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase text-accent">IST bucket</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold">{day.label}</h2>
                </div>
                <span className="rounded-full border border-border bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-text-secondary">
                  {availableCount}/{day.slots.length} open
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {day.slots.map((slot) => (
                  <SlotTile
                    key={slot.id}
                    slot={slot}
                    managedSlotId={managedSlotIds.get(`${slot.dayIndex}-${String(Math.floor(slot.startMinutes / 60)).padStart(2, "0")}:${String(slot.startMinutes % 60).padStart(2, "0")}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {outsideBucket.length > 0 ? (
        <section className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-text-muted">Booked outside this bucket</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Other active class times</h2>
            </div>
            <p className="text-sm text-text-secondary">{outsideBucket.length} weekly slots</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {outsideBucket.map((slot) => (
              <article key={slot.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                <p className="font-heading font-bold">{getConflictName(slot)}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {slot.istDayLabel} {slot.timeLabel} IST
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {slot.sourceLabel} · {slot.sourceTimeZone}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </AnimatedPage>
  );
}
