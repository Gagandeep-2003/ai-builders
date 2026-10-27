import type { CSSProperties, ReactNode } from "react";

export type FlyingButtonProps = {
  children?: ReactNode;
  onClick?: (event: unknown) => void;
  onFlightComplete?: () => void;
  theme?: "dark" | "light";
  size?: "small" | "medium" | "large" | "extra-large";
  radius?: number;
  altitude?: number;
  hoverTime?: number;
  jets?: number;
  thrusters?: boolean;
  trigger?: "hover" | "click";
  carryCursor?: boolean;
  ramp?: boolean;
  rampColor?: string;
  smoke?: number;
  turbulence?: number;
  wobble?: number;
  thrustColor?: string;
  smokeColor?: string;
  buttonColor?: string;
  textColor?: string;
  className?: string;
  style?: CSSProperties;
};

export default function FlyingButton(props: FlyingButtonProps): ReactNode;
