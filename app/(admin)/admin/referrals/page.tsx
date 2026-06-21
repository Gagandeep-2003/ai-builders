import { AdminReferralsBoard } from "@/components/admin/admin-referrals-board";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminReferralData } from "@/lib/data";

export default async function AdminReferralsPage() {
  const referrals = await getAdminReferralData();
  const pending = referrals.filter((referral) => referral.status === "pending").length;
  const enrolled = referrals.filter((referral) => ["enrolled", "rewarded"].includes(referral.status)).length;

  return (
    <AnimatedPage>
      <PageHeader
        title="Referrals"
        subtitle="Follow student introductions from first contact through enrolment and bonus skill-lab rewards."
      />
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total referrals", referrals.length],
          ["Waiting for contact", pending],
          ["Enrolled or rewarded", enrolled],
        ].map(([label, value]) => (
          <div key={String(label)} className="premium-card rounded-xl p-5">
            <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>
      <AdminReferralsBoard referrals={referrals} />
    </AnimatedPage>
  );
}
