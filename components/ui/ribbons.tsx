"use client";

import { Color, Polyline, Renderer, Transform, Vec3 } from "ogl";
import { useEffect, useRef } from "react";

const TRANSPARENT_BACKGROUND = [0, 0, 0, 0];

export function Ribbons({
  colors = ["#FC8EAC"],
  baseSpring = 0.03,
  baseFriction = 0.9,
  baseThickness = 30,
  offsetFactor = 0.05,
  maxAge = 500,
  pointCount = 50,
  speedMultiplier = 0.6,
  enableFade = false,
  enableShaderEffect = false,
  effectAmplitude = 2,
  backgroundColor = TRANSPARENT_BACKGROUND,
}: {
  colors?: string[];
  baseSpring?: number;
  baseFriction?: number;
  baseThickness?: number;
  offsetFactor?: number;
  maxAge?: number;
  pointCount?: number;
  speedMultiplier?: number;
  enableFade?: boolean;
  enableShaderEffect?: boolean;
  effectAmplitude?: number;
  backgroundColor?: number[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: true });
    const gl = renderer.gl;
    gl.clearColor(backgroundColor[0] ?? 0, backgroundColor[1] ?? 0, backgroundColor[2] ?? 0, backgroundColor[3] ?? 0);
    Object.assign(gl.canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
    gl.canvas.setAttribute("aria-hidden", "true");
    container.appendChild(gl.canvas);
    const scene = new Transform();
    const lines: Array<{
      spring: number;
      friction: number;
      mouseVelocity: Vec3;
      mouseOffset: Vec3;
      points: Vec3[];
      polyline: Polyline;
    }> = [];
    const vertex = `
      precision highp float;
      attribute vec3 position; attribute vec3 next; attribute vec3 prev;
      attribute vec2 uv; attribute float side;
      uniform vec2 uResolution; uniform float uDPR; uniform float uThickness;
      uniform float uTime; uniform float uEnableShaderEffect; uniform float uEffectAmplitude;
      varying vec2 vUV;
      vec4 getPosition() {
        vec4 current = vec4(position, 1.0);
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 nextScreen = next.xy * aspect; vec2 prevScreen = prev.xy * aspect;
        vec2 tangent = normalize(nextScreen - prevScreen);
        vec2 normal = vec2(-tangent.y, tangent.x); normal /= aspect;
        normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
        float dist = length(nextScreen - prevScreen);
        normal *= smoothstep(0.0, 0.02, dist);
        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        normal *= current.w * pixelWidthRatio * uThickness;
        current.xy -= normal * side;
        if(uEnableShaderEffect > 0.5) current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
        return current;
      }
      void main() { vUV = uv; gl_Position = getPosition(); }
    `;
    const fragment = `
      precision highp float;
      uniform vec3 uColor; uniform float uOpacity; uniform float uEnableFade;
      varying vec2 vUV;
      void main() {
        float fadeFactor = 1.0;
        if(uEnableFade > 0.5) fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
        gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
      }
    `;
    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      lines.forEach((line) => line.polyline.resize());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const center = (colors.length - 1) / 2;
    colors.forEach((color, index) => {
      const points = Array.from({ length: pointCount }, () => new Vec3());
      const line = {
        spring: baseSpring + (Math.random() - 0.5) * 0.05,
        friction: baseFriction + (Math.random() - 0.5) * 0.05,
        mouseVelocity: new Vec3(),
        mouseOffset: new Vec3((index - center) * offsetFactor + (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.1, 0),
        points,
        polyline: new Polyline(gl, {
          points,
          vertex,
          fragment,
          uniforms: {
            uColor: { value: new Color(color) },
            uThickness: { value: baseThickness + (Math.random() - 0.5) * 3 },
            uOpacity: { value: 1 },
            uTime: { value: 0 },
            uEnableShaderEffect: { value: enableShaderEffect ? 1 : 0 },
            uEffectAmplitude: { value: effectAmplitude },
            uEnableFade: { value: enableFade ? 1 : 0 },
          },
        }),
      };
      line.polyline.mesh.setParent(scene);
      lines.push(line);
    });
    resize();
    const mouse = new Vec3();
    const updateMouse = (event: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const point = "changedTouches" in event ? event.changedTouches[0] : event;
      mouse.set(((point.clientX - rect.left) / container.clientWidth) * 2 - 1, ((point.clientY - rect.top) / container.clientHeight) * -2 + 1, 0);
    };
    window.addEventListener("mousemove", updateMouse);
    const temporary = new Vec3();
    let frame = 0;
    let lastTime = performance.now();
    const update = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      if (document.visibilityState === "visible") {
        lines.forEach((line) => {
          temporary.copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
          line.mouseVelocity.add(temporary).multiply(line.friction);
          line.points[0].add(line.mouseVelocity);
          for (let index = 1; index < line.points.length; index++) {
            const segmentDelay = maxAge / (line.points.length - 1);
            const alpha = Number.isFinite(maxAge) && maxAge > 0 ? Math.min(1, (delta * speedMultiplier) / segmentDelay) : 0.9;
            line.points[index].lerp(line.points[index - 1], alpha);
          }
          line.polyline.mesh.program.uniforms.uTime.value = currentTime * 0.001;
          line.polyline.updateGeometry();
        });
        renderer.render({ scene });
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("mousemove", updateMouse);
      lines.forEach((line) => line.polyline.mesh.setParent(null));
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [backgroundColor, baseFriction, baseSpring, baseThickness, colors, effectAmplitude, enableFade, enableShaderEffect, maxAge, offsetFactor, pointCount, speedMultiplier]);

  return <div ref={containerRef} className="ribbons-container" aria-hidden="true" />;
}
