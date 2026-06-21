import { AnimatedPage } from "@/components/ui/animated";
import { ReferralCenter } from "@/components/portal/referral-center";
import { getStudentReferralData } from "@/lib/data";

export default async function ReferralsPage() {
  const referrals = await getStudentReferralData();
  return (
    <AnimatedPage>
      <ReferralCenter referrals={referrals} />
    </AnimatedPage>
  );
}
