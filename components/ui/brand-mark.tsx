"use client";

import MetallicPaint from "@/components/ui/metallic-paint";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/20 bg-bg-elevated", className)}>
      <span className="absolute inset-0 bg-[radial-gradient(circle,rgba(110,231,183,0.16),transparent_70%)]" />
      <span className="metallic-brand-mask">
        <MetallicPaint
          imageSrc="/metallic-field-processed.png"
          preprocessed
          seed={42}
          scale={4}
          patternSharpness={1}
          noiseScale={0.5}
          speed={0.3}
          liquid={0.75}
          mouseAnimation={false}
          brightness={2}
          contrast={0.5}
          refraction={0.01}
          blur={0.015}
          chromaticSpread={2}
          fresnel={1}
          angle={0}
          waveAmplitude={1}
          distortion={1}
          contour={0.2}
          lightColor="#b9ffe6"
          darkColor="#000000"
          tintColor="#ffffff"
        />
      </span>
    </span>
  );
}
