import { AdminReferralsBoard } from "@/components/admin/admin-referrals-board";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminReferralData } from "@/lib/data";

export default async function AdminReferralsPage() {
  const referrals = await getAdminReferralData();
  const pending = referrals.filter((referral) => referral.status === "pending").length;
  const contacted = referrals.filter((referral) => referral.status === "contacted").length;
  const due = referrals.filter((referral) => referral.status === "enrolled").length;
  const paid = referrals.filter((referral) => referral.status === "rewarded").length;

  return (
    <AnimatedPage>
      <PageHeader
        title="$100 Referrals"
        subtitle="Move every introduction from first contact to enrolment, first paid class, and confirmed $100 student payout."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["New leads", pending],
          ["In conversation", contacted],
          ["$100 due", due],
          ["Bonuses paid", `$${paid * 100}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="premium-card rounded-lg p-5">
            <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>
      <AdminReferralsBoard referrals={referrals} />
    </AnimatedPage>
  );
}
