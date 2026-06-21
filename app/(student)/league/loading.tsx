export default function LeagueLoading() {
  return (
    <div className="league-cloud-loading" role="status" aria-label="Opening AI Builders League">
      <div className="league-cloud league-cloud-left" />
      <div className="league-cloud league-cloud-right" />
      <div className="league-cloud-core">
        <span className="league-cloud-pulse" />
        <p className="font-mono text-xs uppercase text-accent">Opening AI Builders League</p>
      </div>
    </div>
  );
}
