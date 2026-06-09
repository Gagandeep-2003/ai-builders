import {
  changeApprovedPasswordAction,
  requestPasswordChangeAction,
  updateStudentContactAction,
} from "@/app/actions/profile";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const data = await getStudentDashboardData();

  const lockedRows = [
    ["Name", data.student.fullName],
    ["Email", data.student.email],
    ["Batch", data.batch.name],
    ["Schedule", `${data.batch.days} · ${data.batch.timeSlot}`],
    ["Timezone", data.student.timeZone],
    ["Enrolled", formatDate(data.student.enrolledAt)],
  ];
  const latestPasswordRequest = data.passwordRequests[0];
  const approvedRequest = data.passwordRequests.find(
    (request) => request.status === "approved" && !request.usedAt,
  );
  const hasOpenRequest = data.passwordRequests.some(
    (request) => ["pending", "approved"].includes(request.status) && !request.usedAt,
  );

  return (
    <AnimatedPage>
      <PageHeader
        title="Student Profile"
        subtitle="Manage your contact details, review enrollment info, and keep account access secure."
      />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="premium-card rounded-xl p-6">
          <p className="font-mono text-xs uppercase text-accent">Student identity</p>
          <h2 className="mt-2 font-heading text-3xl font-black">{data.student.fullName}</h2>
          <p className="mt-2 text-sm text-text-secondary">{data.student.email}</p>
          <div className="mt-6 grid gap-3">
            {lockedRows.slice(2).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
                <p className="mt-2 font-heading text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <form action={updateStudentContactAction} className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Editable contact</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Parent and country details</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                You can update these fields yourself. Enrollment, batch, email, and timezone remain managed by admin.
              </p>
            </div>
            <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase text-accent">
              3 editable fields
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="font-mono text-xs uppercase text-text-muted">Parent</span>
              <input
                name="parentName"
                defaultValue={data.student.parentName}
                required
                className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
              />
            </label>
            <label>
              <span className="font-mono text-xs uppercase text-text-muted">Parent Email</span>
              <input
                name="parentEmail"
                type="email"
                defaultValue={data.student.parentEmail}
                required
                className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
              />
            </label>
            <label>
              <span className="font-mono text-xs uppercase text-text-muted">Country</span>
              <input
                name="country"
                defaultValue={data.student.country || ""}
                required
                className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
              />
            </label>
          </div>

          <button className="button-motion mt-6 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
            Save Profile Details
          </button>
        </form>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Security</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Password change</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Password changes require admin approval. Submit a request here; once approved,
              this page will unlock the password update form.
            </p>
          </div>
          {latestPasswordRequest ? <StatusBadge status={latestPasswordRequest.status} /> : null}
        </div>

        {approvedRequest ? (
          <form action={changeApprovedPasswordAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="New password"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              placeholder="Confirm password"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
              Update Password
            </button>
          </form>
        ) : hasOpenRequest ? (
          <div className="mt-6 rounded-xl border border-border/70 bg-white/[0.025] p-4">
            <p className="font-heading font-bold">
              {latestPasswordRequest?.status === "pending"
                ? "Your request is waiting for admin approval."
                : "Your request has already been reviewed."}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Requested {latestPasswordRequest ? formatDate(latestPasswordRequest.requestedAt) : "recently"}.
            </p>
          </div>
        ) : (
          <form action={requestPasswordChangeAction} className="mt-6 space-y-4">
            <textarea
              name="reason"
              placeholder="Reason for password change request"
              className="min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
              Request Password Change
            </button>
          </form>
        )}
      </section>
    </AnimatedPage>
  );
}
