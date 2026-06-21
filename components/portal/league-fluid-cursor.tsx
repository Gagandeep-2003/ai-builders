"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useFBO, useGLTF } from "@react-three/drei";
import { easing } from "maath";

const LENS_PROPS = {
  scale: 0.25,
  ior: 1.15,
  thickness: 5,
  transmission: 1,
  roughness: 0,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
};

function ArenaColorField() {
  return (
    <>
      <color attach="background" args={["#07130f"]} />
      <mesh position={[-4.8, 2.4, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshBasicMaterial color="#ff8a34" />
      </mesh>
      <mesh position={[3.8, 1.1, 0.5]}>
        <circleGeometry args={[6.5, 64]} />
        <meshBasicMaterial color="#6ee7b7" />
      </mesh>
      <mesh position={[0.8, -3.7, 1]}>
        <circleGeometry args={[6.2, 64]} />
        <meshBasicMaterial color="#5b8cff" />
      </mesh>
    </>
  );
}

function FluidLens({
  pointer,
  active,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  active: React.RefObject<boolean>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF("/assets/3d/lens.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const buffer = useFBO({ samples: 4 });
  const { viewport: viewportSize } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, camera } = state;
    const currentViewport = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = (pointer.current.x * currentViewport.width) / 2;
    const destY = (pointer.current.y * currentViewport.height) / 2;

    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
    easing.damp3(
      ref.current.scale,
      active.current
        ? [LENS_PROPS.scale, LENS_PROPS.scale, LENS_PROPS.scale]
        : [0.001, 0.001, 0.001],
      0.18,
      delta,
    );

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(<ArenaColorField />, scene)}
      <mesh
        ref={ref}
        scale={0.001}
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
        />
      </mesh>
      <mesh scale={[viewportSize.width, viewportSize.height, 1]} visible={false}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
    </>
  );
}

export default function LeagueFluidCursor() {
  const [enabled, setEnabled] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const active = useRef(false);

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
    const zone = document.querySelector(".league-fluid-cursor-zone");
    zone?.classList.add("fluid-cursor-ready");
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
      active.current = event.target instanceof Element
        ? Boolean(event.target.closest(".league-fluid-cursor-zone"))
        : false;
    };
    const handlePointerLeave = () => {
      active.current = false;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      zone?.classList.remove("fluid-cursor-ready");
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        dpr={[1, 1.35]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <FluidLens pointer={pointer} active={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/3d/lens.glb");
