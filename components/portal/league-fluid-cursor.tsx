"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, useFBO, useGLTF } from "@react-three/drei";
import { easing } from "maath";

const LENS_PROPS = {
  scale: 0.25,
  ior: 1.15,
  thickness: 2,
  transmission: 1,
  roughness: 0,
  chromaticAberration: 0.05,
  anisotropy: 0.01,
};

function LensScene() {
  return (
    <>
      <mesh position={[-1.4, 0.7, 0]} rotation-z={-0.28}>
        <planeGeometry args={[2.8, 0.12]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.22} />
      </mesh>
      <mesh position={[1.3, -0.4, 0.2]} rotation-z={0.34}>
        <planeGeometry args={[2.6, 0.1]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[0.8, 64]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

function documentedContainerFov(viewportHeight: number) {
  const sourceHeight = 600;
  const sourceHalfFov = THREE.MathUtils.degToRad(15 / 2);
  return THREE.MathUtils.radToDeg(
    2 * Math.atan((viewportHeight / sourceHeight) * Math.tan(sourceHalfFov)),
  );
}

function FluidLens({
  pointer,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF("/assets/3d/lens.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, camera } = state;
    const currentViewport = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = (pointer.current.x * currentViewport.width) / 2;
    const destY = (pointer.current.y * currentViewport.height) / 2;

    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    gl.setRenderTarget(buffer);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(<LensScene />, scene)}
      <mesh
        ref={ref}
        scale={LENS_PROPS.scale}
        rotation-x={Math.PI / 2}
        geometry={nodes.Cylinder?.geometry}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={LENS_PROPS.ior}
          thickness={LENS_PROPS.thickness}
          transmission={LENS_PROPS.transmission}
          roughness={LENS_PROPS.roughness}
          chromaticAberration={LENS_PROPS.chromaticAberration}
          anisotropy={LENS_PROPS.anisotropy}
          transparent
        />
      </mesh>
    </>
  );
}

export default function LeagueFluidCursor() {
  const [enabled, setEnabled] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const capable =
      finePointer.matches &&
      !reducedMotion.matches &&
      window.innerWidth >= 1024 &&
      (navigator.hardwareConcurrency ?? 8) > 4 &&
      (memory == null || memory >= 4);

    if (!capable) return;
    const schedule = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = schedule(() => setEnabled(true));
    return () => cancel(idleId);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("league-fluid-cursor-active");
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      document.documentElement.classList.remove("league-fluid-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [enabled]);

  if (!enabled) return null;
  const cameraFov = documentedContainerFov(
    typeof window === "undefined" ? 600 : window.innerHeight,
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 20], fov: cameraFov }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <FluidLens pointer={pointer} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/3d/lens.glb");
