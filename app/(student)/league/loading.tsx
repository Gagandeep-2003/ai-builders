import { LeagueEntryTransition } from "@/components/portal/league-entry-transition";

export default function LeagueLoading() {
  return (
    <div className="relative min-h-[72vh] overflow-hidden border border-border bg-bg-base">
      <LeagueEntryTransition />
    </div>
  );
}
