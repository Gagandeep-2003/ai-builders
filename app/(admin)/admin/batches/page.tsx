import { createBatchAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminData } from "@/lib/data";
import { commonTimeZones, formatBatchSchedule } from "@/lib/time";

const weekdays = [
  ["0", "Sunday"],
  ["1", "Monday"],
  ["2", "Tuesday"],
  ["3", "Wednesday"],
  ["4", "Thursday"],
  ["5", "Friday"],
  ["6", "Saturday"],
];

export default async function AdminBatchesPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader title="Batch Management" subtitle="Manage schedules, active modules, and live class links." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Add batch</h2>
        <form action={createBatchAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="name" placeholder="Batch name" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="days" placeholder="Days, e.g. Mon / Wed" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="timeSlot" placeholder="Display label, e.g. 5:00 PM - 6:30 PM IST" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <select name="moduleId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {data.modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          <select name="timeZone" defaultValue="Asia/Kolkata" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {commonTimeZones.map((timeZone) => (
              <option key={timeZone} value={timeZone}>{timeZone}</option>
            ))}
          </select>
          <input name="startDate" type="date" defaultValue="2026-06-08" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="startTime" type="time" defaultValue="17:00" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
            <input name="endTime" type="time" defaultValue="18:30" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          </div>
          <input name="meetLink" placeholder="Meet link" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2" />
          <div className="rounded-xl border border-border/70 bg-white/[0.02] p-4 md:col-span-2">
            <p className="font-mono text-xs uppercase text-text-muted">Weekly class slots</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr]">
              <input name="slot1Label" defaultValue="Class 1" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <select name="slot1Day" defaultValue="1" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                {weekdays.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input name="slot1StartTime" type="time" defaultValue="17:00" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <input name="slot1EndTime" type="time" defaultValue="18:30" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <input name="slot1MeetLink" placeholder="Class 1 meet link" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr]">
              <input name="slot2Label" defaultValue="Class 2" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <select name="slot2Day" defaultValue="3" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                {weekdays.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input name="slot2StartTime" type="time" defaultValue="17:00" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <input name="slot2EndTime" type="time" defaultValue="18:30" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              <input name="slot2MeetLink" placeholder="Class 2 meet link" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
            </div>
          </div>
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
            Add Batch
          </button>
        </form>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="font-mono text-xs uppercase text-text-muted">
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4">Batch Name</th>
                <th className="py-3 pr-4">Days</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Timezone</th>
                <th className="py-3 pr-4">Module</th>
                <th className="py-3 pr-4">Students</th>
                <th className="py-3 pr-4">Meet Links</th>
              </tr>
            </thead>
            <tbody>
              {data.batches.map((batch) => (
                <tr key={batch.id} className="border-b border-border/40">
                  <td className="py-4 pr-4 font-medium">{batch.name}</td>
                  <td className="py-4 pr-4 text-text-secondary">{batch.days}</td>
                  <td className="py-4 pr-4 text-text-secondary">{formatBatchSchedule(batch, batch.timeZone)}</td>
                  <td className="py-4 pr-4 text-text-secondary">{batch.timeZone}</td>
                  <td className="py-4 pr-4 text-text-secondary">
                    {data.modules.find((module) => module.id === batch.moduleId)?.title ?? "Module"}
                  </td>
                  <td className="py-4 pr-4 text-text-secondary">{batch.studentsCount}</td>
                  <td className="py-4 pr-4">
                    <div className="flex min-w-64 flex-col gap-2">
                      {batch.classSlots.length > 0
                        ? batch.classSlots.map((slot) => (
                            <a
                              key={slot.id}
                              href={slot.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent underline-offset-4 hover:underline"
                            >
                              {slot.label}
                            </a>
                          ))
                        : (
                            <a
                              href={batch.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent underline-offset-4 hover:underline"
                            >
                              Batch link
                            </a>
                          )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AnimatedPage>
  );
}
