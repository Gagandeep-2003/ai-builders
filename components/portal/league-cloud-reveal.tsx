const cloudPlumes = Array.from({ length: 12 }, (_, index) => index + 1);

function CloudBank({ side }: { side: "left" | "right" }) {
  return (
    <div className={`league-cloud-bank league-cloud-bank-${side}`} aria-hidden="true">
      <div className="league-cloud-mass" />
      {cloudPlumes.map((plume) => (
        <span key={plume} className={`league-cloud-plume league-cloud-plume-${plume}`} />
      ))}
    </div>
  );
}

export function LeagueCloudReveal() {
  return (
    <div
      className="league-cloud-reveal"
      role="status"
      aria-label="Opening AI Builders League"
    >
      <div className="league-cloud-backdrop" aria-hidden="true" />
      <CloudBank side="left" />
      <CloudBank side="right" />
      <div className="league-cloud-seam" aria-hidden="true" />
      <div className="league-cloud-title">
        <span className="league-cloud-title-mark" aria-hidden="true" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
          AI Builders League
        </p>
      </div>
    </div>
  );
}
