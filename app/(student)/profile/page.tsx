import { changeApprovedPasswordAction, requestPasswordChangeAction } from "@/app/actions/profile";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const data = await getStudentDashboardData();

  const rows = [
    ["Name", data.student.fullName],
    ["Email", data.student.email],
    ["Batch", data.batch.name],
    ["Schedule", `${data.batch.days} · ${data.batch.timeSlot}`],
    ["Parent", data.student.parentName],
    ["Parent Email", data.student.parentEmail],
    ["Country", data.student.country || "Not set"],
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
        subtitle="Profile details are view-only for students. Admins manage enrollment and parent contact information."
      />
      <section className="premium-card rounded-xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
              <p className="mt-2 font-heading text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
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
