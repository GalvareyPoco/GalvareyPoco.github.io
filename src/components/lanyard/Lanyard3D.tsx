/* eslint-disable react/no-unknown-property */
// 3D badge on a lanyard you can grab and throw around.
// Physics rig adapted from React Bits' Lanyard (https://reactbits.dev/components/lanyard),
// © David Haz, MIT + Commons Clause. The card itself is drawn here instead of loaded from a model,
// so it carries Galvarey's photo and name and follows the site's color theme.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import { drawBack, drawFront, drawStrap, type BadgeInfo } from "./badgeTexture";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    // The constructor's options argument is optional, so `args` is too.
    meshLineMaterial: Omit<ThreeElement<typeof MeshLineMaterial>, "args"> & { args?: ConstructorParameters<typeof MeshLineMaterial> };
  }
}

const CARD_W = 1.6;
const CARD_H = 2.25;

type Props = { info: BadgeInfo; accent: string; accent2: string; onReady?: () => void };

export default function Lanyard3D({ info, accent, accent2, onReady }: Props) {
  const [isMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const wrap = useRef<HTMLDivElement>(null);
  const grabbing = useRef(false);

  // Touch: once the card is grabbed, stop the page from scrolling under the finger.
  // pointerdown (where the card sets `grabbing`) fires before touchstart, so preventDefault still works.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      if (grabbing.current) e.preventDefault();
    };
    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("touchmove", block);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 25 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true, antialias: !isMobile }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0);
          onReady?.();
        }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} info={info} accent={accent} accent2={accent2} grabbing={grabbing} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

type Lerped = RapierRigidBody & { lerped?: THREE.Vector3 };

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Shape geometry with UVs normalized to 0..1 across the card, so a full canvas maps onto each face. */
function faceGeometry(shape: THREE.Shape) {
  const g = new THREE.ShapeGeometry(shape, 8);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / CARD_W + 0.5, pos.getY(i) / CARD_H + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

function canvasTexture(canvas: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function Band({
  isMobile,
  info,
  accent,
  accent2,
  grabbing,
}: {
  isMobile: boolean;
  info: BadgeInfo;
  accent: string;
  accent2: string;
  grabbing: React.RefObject<boolean>;
}) {
  // On wide screens the canvas spans the whole hero, so hang the badge over the right-hand column.
  const viewport = useThree((s) => s.viewport);
  const anchorX = viewport.aspect > 1.2 ? viewport.width * 0.22 : 0;
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<Lerped>(null!);
  const j2 = useRef<Lerped>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const [vec] = useState(() => new THREE.Vector3());
  const [ang] = useState(() => new THREE.Vector3());
  const [rot] = useState(() => new THREE.Vector3());
  const [dir] = useState(() => new THREE.Vector3());

  const segmentProps: RigidBodyProps = { type: "dynamic", canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const shape = useMemo(() => roundedRect(CARD_W, CARD_H, 0.12), []);
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 8 });
    g.translate(0, 0, -0.02);
    return g;
  }, [shape]);
  const face = useMemo(() => faceGeometry(shape), [shape]);

  // Textures are drawn on canvases; the photo loads asynchronously, so redraw when it arrives.
  const [faces, setFaces] = useState<{ front: THREE.Texture; back: THREE.Texture; strap: THREE.Texture } | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.decoding = "async";
    img.src = info.photo;
    const build = (photo: HTMLImageElement | null) => {
      if (!alive) return;
      setFaces((prev) => {
        prev?.front.dispose();
        prev?.back.dispose();
        prev?.strap.dispose();
        return {
          front: canvasTexture(drawFront(info, photo, accent, accent2)),
          back: canvasTexture(drawBack(info, accent, accent2)),
          strap: canvasTexture(drawStrap(info.name, accent), true),
        };
      });
    };
    Promise.all([img.decode().then(() => img).catch(() => null), document.fonts?.ready]).then(([photo]) => build(photo));
    return () => {
      alive = false;
    };
  }, [info, accent, accent2]);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = "chordal";
    return c;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_H / 2 + 0.3, 0],
  ]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useEffect(() => {
    if (!dragged) return;
    const release = () => {
      drag(false);
      grabbing.current = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [dragged, grabbing]);

  const lerped = (b: Lerped) => (b.lerped ??= new THREE.Vector3().copy(b.translation()));

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (!fixed.current || !band.current) return;
    for (const ref of [j1, j2]) {
      const l = lerped(ref.current);
      const d = Math.max(0.1, Math.min(1, l.distanceTo(ref.current.translation())));
      // Clamped so a slow frame (big delta) can't overshoot and blow the strap up to NaN.
      l.lerp(ref.current.translation(), Math.min(1, delta * d * 50));
    }
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(lerped(j2.current));
    curve.points[2].copy(lerped(j1.current));
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
  });

  return (
    <>
      <group position={[anchorX, 4.2, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.02]} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              // Keep receiving moves while the pointer is over the hero text above the canvas.
              (e.target as unknown as Element).setPointerCapture(e.pointerId);
              grabbing.current = true;
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={body}>
              <meshPhysicalMaterial color="#0b0f17" roughness={0.35} metalness={0.6} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.2} />
            </mesh>
            {faces && (
              <>
                <mesh geometry={face} position={[0, 0, 0.031]}>
                  <meshPhysicalMaterial map={faces.front} roughness={0.55} metalness={0.15} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.15} />
                </mesh>
                <mesh geometry={face} position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}>
                  <meshPhysicalMaterial map={faces.back} roughness={0.55} metalness={0.15} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.15} />
                </mesh>
              </>
            )}
            {/* Metal clip: a plate on the card plus the ring the strap goes through. */}
            <mesh position={[0, CARD_H / 2 + 0.02, 0]}>
              <boxGeometry args={[0.36, 0.16, 0.08]} />
              <meshStandardMaterial color="#c7ccd6" metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[0, CARD_H / 2 + 0.2, 0]}>
              <torusGeometry args={[0.1, 0.025, 12, 24]} />
              <meshStandardMaterial color="#c7ccd6" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1, 1]}
          useMap={faces ? 1 : 0}
          map={faces?.strap}
          repeat={[-4, 1]}
          lineWidth={1.3}
        />
      </mesh>
    </>
  );
}
