import { CalendarPlus, Clock3, XCircle } from "lucide-react";
import { requestClassRescheduleAction } from "@/app/actions/class";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatRescheduleRequestTime,
  getRescheduleRequestKind,
} from "@/lib/class-events";
import type { Batch, ClassRescheduleRequest } from "@/lib/course-data";
import { getAdminAvailabilityData, getMentorScheduleData } from "@/lib/data";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { getBookedSlots } from "@/lib/slot-availability";

type OriginalClassOption = { value: string; label: string };

export async function ClassReschedulePanel({
  studentTimeZone,
  batch,
  pendingRequest,
  latestRejectedRequest,
  originalClassOptions,
}: {
  studentTimeZone: string;
  batch: Batch;
  pendingRequest?: ClassRescheduleRequest;
  latestRejectedRequest?: ClassRescheduleRequest;
  originalClassOptions: OriginalClassOption[];
}) {
  const [mentorSchedule, availability] = await Promise.all([
    getMentorScheduleData(),
    getAdminAvailabilityData(),
  ]);
  const rescheduleOptions = getStudentRescheduleOptions(studentTimeZone, {
    bookedSlots: getBookedSlots(mentorSchedule.batches, mentorSchedule.students),
    requests: mentorSchedule.rescheduleRequests,
    excludedPauses: batch.pauses,
    excludedPauseTimeZone: batch.timeZone,
    availabilityBucket: availability.bucket,
  });

  return (
    <div className="premium-card rounded-xl p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <CalendarPlus className="h-5 w-5" />
        </span>
        <div>
          <p className="font-mono text-xs uppercase text-accent">Reschedule</p>
          <h2 className="mt-1 font-heading text-2xl font-bold">Move or add a class</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Move one regular class to another day, or request an additional make-up class.
            Only tutor times that are still free are shown.
          </p>
        </div>
      </div>

      {pendingRequest ? (
        <div className="mt-5 rounded-2xl border border-accent-warm/35 bg-accent-warm/10 p-4 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent-warm/30 bg-accent-warm/10 text-[color:var(--accent-warm)]">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase text-[color:var(--accent-warm)]">
                  Waiting for mentor approval
                </p>
                <StatusBadge
                  status="pending"
                  label={getRescheduleRequestKind(pendingRequest) === "rescheduled" ? "Move request" : "Make-up request"}
                />
              </div>
              <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">
                Request sent for {formatRescheduleRequestTime(pendingRequest, studentTimeZone)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Your request is not active yet. Keep following your current class schedule until your mentor approves it.
              </p>
              {pendingRequest.reason ? (
                <p className="mt-3 rounded-xl border border-border/70 bg-bg-card/70 p-3 text-sm text-text-muted">
                  Your note: {pendingRequest.reason}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <>
          {latestRejectedRequest ? (
            <div className="mt-5 rounded-2xl border border-danger/35 bg-danger/10 p-4 shadow-[0_0_30px_rgba(251,113,133,0.1)]">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-[color:var(--danger)]">
                  <XCircle className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs uppercase text-[color:var(--danger)]">Last request not approved</p>
                    <StatusBadge status="rejected" />
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">
                    {formatRescheduleRequestTime(latestRejectedRequest, studentTimeZone)} is not scheduled
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Choose another free slot below, or ask your mentor to adjust the class.
                  </p>
                  {latestRejectedRequest.adminNote ? (
                    <p className="mt-3 rounded-xl border border-border/70 bg-bg-card/70 p-3 text-sm text-text-muted">
                      Mentor note: {latestRejectedRequest.adminNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          <form action={requestClassRescheduleAction} className="mt-5 space-y-3">
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <label className="cursor-pointer rounded-xl border border-accent/30 bg-accent/5 p-3">
                <input type="radio" name="requestType" value="reschedule" defaultChecked className="mr-2" />
                <span className="font-bold">Move a class</span>
                <span className="mt-1 block text-xs text-text-muted">
                  After approval, the original occurrence disappears and this time replaces it.
                </span>
              </label>
              <label className="cursor-pointer rounded-xl border border-border bg-bg-elevated p-3">
                <input type="radio" name="requestType" value="makeup" className="mr-2" />
                <span className="font-bold">Add a make-up</span>
                <span className="mt-1 block text-xs text-text-muted">
                  Adds one extra class without changing your normal schedule.
                </span>
              </label>
            </fieldset>
            <label className="block">
              <span className="mb-2 block font-mono text-xs uppercase text-text-muted">Regular class to move</span>
              <select name="originalDate" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                <option value="">Not needed for an additional make-up</option>
                {originalClassOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs uppercase text-text-muted">New class time</span>
              <select name="slot" required className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                <option value="">Choose a free tutor time</option>
                {rescheduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <textarea
              name="reason"
              placeholder="Reason, for example: missed class / travel / school event"
              className="min-h-20 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <button className="button-motion w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
              Send Class Request
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export function ClassReschedulePanelSkeleton() {
  return (
    <div className="premium-card min-h-[25rem] animate-pulse rounded-xl p-5" aria-label="Loading available class times">
      <div className="h-11 w-11 rounded-xl bg-white/[0.06]" />
      <div className="mt-5 h-6 w-52 rounded bg-white/[0.06]" />
      <div className="mt-3 h-4 w-full rounded bg-white/[0.04]" />
      <div className="mt-8 space-y-3">
        <div className="h-20 rounded-xl bg-white/[0.04]" />
        <div className="h-12 rounded-xl bg-white/[0.04]" />
        <div className="h-12 rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  );
}
