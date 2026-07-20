import { PasswordChangePanel } from "@/components/portal/password-change-panel";
import { PasskeyBetaPanel } from "@/components/portal/passkey-beta-panel";
import { ProfileContactForm } from "@/components/portal/profile-contact-form";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentProfileData } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { requireStudentAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [data, profile] = await Promise.all([getStudentProfileData(), requireStudentAccess()]);

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

        <ProfileContactForm
          parentName={data.student.parentName}
          parentEmail={data.student.parentEmail}
          country={data.student.country || ""}
        />
      </section>

      {profile.role === "student" ? (
        <PasskeyBetaPanel userId={profile.id} studentName={data.student.fullName} />
      ) : null}

      <PasswordChangePanel
        latestPasswordRequest={latestPasswordRequest}
        approvedRequest={approvedRequest}
        hasOpenRequest={hasOpenRequest}
      />
    </AnimatedPage>
  );
}
