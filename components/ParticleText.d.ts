import type { CSSProperties, ReactNode } from "react";

export type ParticleTextProps = {
  text?: string;
  color?: string;
  highlightColor?: string;
  intro?: "gather" | "rain" | "spiral" | "scan";
  gatherDuration?: number;
  stagger?: number;
  scatter?: number;
  trigger?: "mount" | "hover" | "click";
  clickBurst?: boolean;
  burstStrength?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  shape?: "circle" | "square" | "line";
  highlightMode?: "motion" | "gradient";
  particleSize?: number;
  density?: number;
  glow?: boolean;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  className?: string;
  style?: CSSProperties;
};

export default function ParticleText(props: ParticleTextProps): ReactNode;
