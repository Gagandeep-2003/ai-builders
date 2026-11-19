"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type FadeMaterial = THREE.Material & { opacity: number; transparent: boolean };

function makeCurve(
  from: THREE.Vector3,
  through: THREE.Vector3,
  to: THREE.Vector3,
  color: number,
  opacity = 0.45,
) {
  const curve = new THREE.QuadraticBezierCurve3(from, through, to);
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function setOpacity(group: THREE.Object3D, value: number) {
  group.visible = value > 0.002;
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      const fadeMaterial = material as FadeMaterial;
      fadeMaterial.transparent = true;
      fadeMaterial.opacity = value;
    }
  });
}

function windowFade(progress: number, start: number, peakStart: number, peakEnd: number, end: number) {
  if (progress <= start || progress >= end) return 0;
  if (progress < peakStart) return THREE.MathUtils.smoothstep(progress, start, peakStart);
  if (progress <= peakEnd) return 1;
  return 1 - THREE.MathUtils.smoothstep(progress, peakEnd, end);
}

function createLatitude(radius: number, latitude: number, material: THREE.LineBasicMaterial) {
  const points: THREE.Vector3[] = [];
  const phi = THREE.MathUtils.degToRad(latitude);
  const ringRadius = Math.cos(phi) * radius;
  const y = Math.sin(phi) * radius;
  for (let step = 0; step <= 96; step += 1) {
    const angle = (step / 96) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
}

function createLongitude(radius: number, longitude: number, material: THREE.LineBasicMaterial) {
  const points: THREE.Vector3[] = [];
  const theta = THREE.MathUtils.degToRad(longitude);
  for (let step = 0; step <= 72; step += 1) {
    const phi = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, step / 72);
    points.push(new THREE.Vector3(
      Math.cos(phi) * Math.cos(theta) * radius,
      Math.sin(phi) * radius,
      Math.cos(phi) * Math.sin(theta) * radius,
    ));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
}

export function LevelTwoWorld({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const economical = Boolean(connection?.saveData) || (navigator.hardwareConcurrency || 8) <= 4;
    const renderer = new THREE.WebGLRenderer({
      antialias: !economical,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, economical ? 1.25 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050711, 0.027);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0, 7.4);

    scene.add(new THREE.AmbientLight(0x8ca7ff, 0.55));
    const keyLight = new THREE.PointLight(0x6ee7b7, 18, 18, 1.7);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xa78bfa, 22, 16, 1.8);
    rimLight.position.set(-5, -2, 3);
    scene.add(rimLight);

    const starCount = economical ? 650 : 1500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starPalette = [new THREE.Color(0x6ee7b7), new THREE.Color(0x8bdcff), new THREE.Color(0xa78bfa)];
    for (let index = 0; index < starCount; index += 1) {
      const radius = 9 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.cos(phi);
      starPositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 9;
      const color = starPalette[index % starPalette.length].clone().multiplyScalar(0.65 + Math.random() * 0.35);
      color.toArray(starColors, index * 3);
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({ size: economical ? 0.028 : 0.034, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true }),
    );
    scene.add(stars);

    const world = new THREE.Group();
    scene.add(world);

    const surfaceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08111d,
      emissive: 0x0a3a35,
      emissiveIntensity: 0.7,
      roughness: 0.38,
      metalness: 0.72,
      transparent: true,
      opacity: 0.86,
      clearcoat: 0.7,
      clearcoatRoughness: 0.3,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(2, economical ? 36 : 64, economical ? 24 : 48), surfaceMaterial);
    world.add(globe);

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x6ee7b7) },
        strength: { value: 0.82 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float strength;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(max(0.0, 0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);
          gl_FragColor = vec4(glowColor, intensity * strength);
        }
      `,
    });
    world.add(new THREE.Mesh(new THREE.SphereGeometry(2.22, 48, 32), atmosphereMaterial));

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x75f1d0, transparent: true, opacity: 0.16 });
    const globeGrid = new THREE.Group();
    for (let latitude = -75; latitude <= 75; latitude += 15) globeGrid.add(createLatitude(2.018, latitude, gridMaterial));
    for (let longitude = 0; longitude < 180; longitude += 15) globeGrid.add(createLongitude(2.018, longitude, gridMaterial));
    world.add(globeGrid);

    const pointCount = economical ? 520 : 1150;
    const globePointPositions = new Float32Array(pointCount * 3);
    const globePointColors = new Float32Array(pointCount * 3);
    const mint = new THREE.Color(0x6ee7b7);
    const cyan = new THREE.Color(0x55dfff);
    const violet = new THREE.Color(0xa78bfa);
    for (let index = 0; index < pointCount; index += 1) {
      const y = 1 - (index / (pointCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * index;
      globePointPositions[index * 3] = Math.cos(theta) * radius * 2.045;
      globePointPositions[index * 3 + 1] = y * 2.045;
      globePointPositions[index * 3 + 2] = Math.sin(theta) * radius * 2.045;
      const color = index % 7 < 3 ? mint : index % 7 < 5 ? cyan : violet;
      color.toArray(globePointColors, index * 3);
    }
    const globePointsGeometry = new THREE.BufferGeometry();
    globePointsGeometry.setAttribute("position", new THREE.BufferAttribute(globePointPositions, 3));
    globePointsGeometry.setAttribute("color", new THREE.BufferAttribute(globePointColors, 3));
    world.add(new THREE.Points(
      globePointsGeometry,
      new THREE.PointsMaterial({ size: economical ? 0.026 : 0.034, vertexColors: true, transparent: true, opacity: 0.88, sizeAttenuation: true }),
    ));

    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x8de9ff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending });
    const orbitOne = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.009, 6, 170), orbitMaterial.clone());
    orbitOne.rotation.set(0.82, 0.2, 0.08);
    world.add(orbitOne);
    const orbitTwo = new THREE.Mesh(new THREE.TorusGeometry(3.08, 0.008, 6, 170), orbitMaterial.clone());
    orbitTwo.rotation.set(1.4, -0.28, 0.55);
    world.add(orbitTwo);

    const worldNodes = [
      new THREE.Vector3(1.44, 1.18, 1.05),
      new THREE.Vector3(-1.62, 0.52, 1.12),
      new THREE.Vector3(0.35, -1.72, 1.1),
    ];
    for (const [index, position] of worldNodes.entries()) {
      const material = new THREE.MeshBasicMaterial({ color: [0x6ee7b7, 0xa78bfa, 0xffbd67][index] });
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), material);
      node.position.copy(position);
      node.add(new THREE.PointLight(material.color, 2.5, 1.4));
      world.add(node);
    }
    world.add(makeCurve(worldNodes[0], new THREE.Vector3(0.2, 2.72, 0.3), worldNodes[1], 0x6ee7b7));
    world.add(makeCurve(worldNodes[1], new THREE.Vector3(-2.7, -0.7, 0.2), worldNodes[2], 0xa78bfa));
    world.add(makeCurve(worldNodes[2], new THREE.Vector3(2.6, -0.8, 0.25), worldNodes[0], 0xffbd67));

    const chainDimension = new THREE.Group();
    const chainNodes: THREE.Vector3[] = [];
    for (let index = 0; index < 5; index += 1) {
      const position = new THREE.Vector3((index - 2) * 1.03, Math.sin(index * 1.4) * 0.42, 0.35 + Math.cos(index) * 0.25);
      chainNodes.push(position);
      const node = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.2 + index * 0.015, 1),
        new THREE.MeshPhysicalMaterial({ color: index % 2 ? 0x8bdcff : 0x6ee7b7, emissive: 0x164b43, emissiveIntensity: 1.8, roughness: 0.2, metalness: 0.4, transparent: true }),
      );
      node.position.copy(position);
      chainDimension.add(node);
      if (index > 0) chainDimension.add(makeCurve(chainNodes[index - 1], new THREE.Vector3((index - 2.5) * 0.8, 0.8, -0.2), position, 0x77efd0, 0.7));
    }
    chainDimension.scale.setScalar(0.78);
    world.add(chainDimension);

    const graphDimension = new THREE.Group();
    const graphPositions = [
      [-1.65, 0.2, 0.4], [-0.82, 1.22, 0], [-0.5, -1.12, 0.2], [0.55, 0.55, 0.55], [1.35, 1.24, -0.1], [1.55, -0.72, 0.3], [0.3, -1.55, -0.15],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    for (const [index, position] of graphPositions.entries()) {
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(index === 3 ? 0.25 : 0.14, 0),
        new THREE.MeshBasicMaterial({ color: index === 3 ? 0xffffff : index % 2 ? 0xa78bfa : 0x72ddff, transparent: true }),
      );
      node.position.copy(position);
      graphDimension.add(node);
    }
    [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[2,6],[6,5],[5,4]].forEach(([from, to]) => {
      graphDimension.add(makeCurve(graphPositions[from], graphPositions[from].clone().lerp(graphPositions[to], 0.5).add(new THREE.Vector3(0, 0.25, -0.5)), graphPositions[to], 0xa78bfa, 0.48));
    });
    world.add(graphDimension);

    const evaluationDimension = new THREE.Group();
    const evalColors = [0xffbd67, 0x6ee7b7, 0x8bdcff];
    for (let index = 0; index < 3; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.06 + index * 0.46, 0.035 - index * 0.006, 8, 128),
        new THREE.MeshBasicMaterial({ color: evalColors[index], transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }),
      );
      ring.rotation.set(index * 0.72, index * 0.48, index * 0.36);
      evaluationDimension.add(ring);
    }
    const evalCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.52, 2),
      new THREE.MeshPhysicalMaterial({ color: 0xffd69b, emissive: 0x6b3213, emissiveIntensity: 1.5, roughness: 0.22, metalness: 0.6, transparent: true }),
    );
    evaluationDimension.add(evalCore);
    world.add(evaluationDimension);

    setOpacity(chainDimension, 0);
    setOpacity(graphDimension, 0);
    setOpacity(evaluationDimension, 0);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      if (coarsePointer || reduceMotion) return;
      pointerTarget.set((event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let compact = false;
    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      compact = width < 700;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    let smoothProgress = 0;
    let running = true;
    const targetColor = new THREE.Color();
    const emissiveTarget = new THREE.Color();
    const scaleTarget = new THREE.Vector3(1, 1, 1);

    const animate = () => {
      if (!running) return;
      frame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const rawProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
      smoothProgress = reduceMotion ? rawProgress : THREE.MathUtils.lerp(smoothProgress, rawProgress, 0.065);
      pointer.lerp(pointerTarget, 0.035);

      const progress = smoothProgress;
      let worldX = 1.35;
      let worldY = 0;
      let worldScale = 1;
      if (progress < 0.21) {
        const amount = THREE.MathUtils.smoothstep(progress, 0.08, 0.21);
        worldX = THREE.MathUtils.lerp(1.35, -1.4, amount);
        worldScale = THREE.MathUtils.lerp(1, 0.88, amount);
      } else if (progress < 0.43) {
        const amount = THREE.MathUtils.smoothstep(progress, 0.25, 0.43);
        worldX = THREE.MathUtils.lerp(-1.4, 1.45, amount);
        worldY = THREE.MathUtils.lerp(0.05, -0.12, amount);
        worldScale = THREE.MathUtils.lerp(0.88, 0.96, amount);
      } else if (progress < 0.66) {
        const amount = THREE.MathUtils.smoothstep(progress, 0.45, 0.59);
        worldX = THREE.MathUtils.lerp(1.45, -1.35, amount);
        worldY = THREE.MathUtils.lerp(-0.12, 0.16, amount);
        worldScale = THREE.MathUtils.lerp(0.96, 1.06, amount);
      } else {
        const amount = THREE.MathUtils.smoothstep(progress, 0.72, 0.98);
        worldX = THREE.MathUtils.lerp(-1.35, 0, amount);
        worldY = THREE.MathUtils.lerp(0.16, 0, amount);
        worldScale = THREE.MathUtils.lerp(1.06, 1.36, amount);
      }

      if (compact) {
        worldX *= 0.08;
        worldY += 1.05;
        worldScale *= 0.72;
      }

      world.position.x = THREE.MathUtils.lerp(world.position.x, worldX + pointer.x * 0.16, 0.045);
      world.position.y = THREE.MathUtils.lerp(world.position.y, worldY - pointer.y * 0.12, 0.045);
      scaleTarget.setScalar(worldScale);
      world.scale.lerp(scaleTarget, 0.045);
      world.rotation.y = elapsed * 0.075 + progress * Math.PI * 2.65 + pointer.x * 0.1;
      world.rotation.x = progress * 0.5 - pointer.y * 0.06;
      globeGrid.rotation.y = -elapsed * 0.026;
      orbitOne.rotation.z = elapsed * 0.08 + progress;
      orbitTwo.rotation.z = -elapsed * 0.055 - progress * 0.7;

      const chainFade = windowFade(progress, 0.11, 0.18, 0.31, 0.38);
      const graphFade = windowFade(progress, 0.33, 0.4, 0.53, 0.61);
      const evalFade = windowFade(progress, 0.53, 0.58, 0.68, 0.76);
      setOpacity(chainDimension, chainFade);
      setOpacity(graphDimension, graphFade);
      setOpacity(evaluationDimension, evalFade);
      chainDimension.rotation.y = -world.rotation.y * 1.4;
      chainDimension.rotation.z = Math.sin(elapsed * 0.6) * 0.12;
      graphDimension.rotation.z = elapsed * 0.05;
      graphDimension.rotation.y = -world.rotation.y * 0.72;
      evaluationDimension.rotation.y = -world.rotation.y * 1.12;
      evaluationDimension.rotation.z = elapsed * 0.11;
      evalCore.rotation.x = elapsed * 0.22;
      evalCore.rotation.y = elapsed * 0.3;

      if (progress < 0.34) targetColor.set(0x6ee7b7);
      else if (progress < 0.55) targetColor.set(0xa78bfa);
      else if (progress < 0.74) targetColor.set(0xffbd67);
      else targetColor.set(0x8bdcff);
      atmosphereMaterial.uniforms.glowColor.value.lerp(targetColor, 0.04);
      emissiveTarget.copy(targetColor).multiplyScalar(0.22);
      surfaceMaterial.emissive.lerp(emissiveTarget, 0.04);
      keyLight.color.lerp(targetColor, 0.035);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.18, 0.035);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.13, 0.035);
      const cameraDepth = (compact ? 8.4 : 7.4) - Math.sin(progress * Math.PI) * (compact ? 0.45 : 0.85) - (progress > 0.84 ? (progress - 0.84) * (compact ? 2.4 : 5.3) : 0);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraDepth, 0.04);
      camera.lookAt(0, 0, 0);
      stars.rotation.y = elapsed * 0.004 + progress * 0.2;
      stars.rotation.x = pointer.y * 0.025;

      renderer.render(scene, camera);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        running = false;
      } else if (!running) {
        running = true;
        clock.getDelta();
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    animate();

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
