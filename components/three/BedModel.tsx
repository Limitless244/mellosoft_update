"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import type { Group } from "three";
function ImportedBed() {
  const { scene } = useGLTF("/models/bed.glb", true);
  return <primitive object={scene} scale={1.5} />;
}
export default function BedModel({
  color,
  variant = 0,
  modelAvailable = false,
  reduced = false,
}: {
  color: string;
  variant?: number;
  modelAvailable?: boolean;
  reduced?: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock, pointer }, dt) => {
    if (!ref.current) return;
    const target =
      variant * 0.35 +
      (reduced
        ? 0
        : Math.sin(clock.elapsedTime * 0.17) * 0.12 + pointer.x * 0.1);
    ref.current.rotation.y +=
      (target - ref.current.rotation.y) * Math.min(dt * 3, 1);
    if (!reduced) ref.current.rotation.x = pointer.y * 0.025;
  });
  if (modelAvailable) return <ImportedBed />;
  return (
    <group ref={ref} position={[0, -0.35, 0]} scale={variant === 3 ? 0.82 : 1}>
      <RoundedBox args={[3.1, 0.38, 3.7]} radius={0.12} position={[0, 0.45, 0]}>
        <meshStandardMaterial
          color={variant === 1 ? "#906c4a" : color}
          roughness={0.95}
        />
      </RoundedBox>
      <RoundedBox
        args={[3.2, 1.85, 0.28]}
        radius={0.18}
        position={[0, 1.03, -1.8]}
      >
        <meshStandardMaterial color={color} roughness={1} />
      </RoundedBox>
      <RoundedBox
        args={[2.95, 0.36, 3.45]}
        radius={0.16}
        position={[0, 0.79, 0.02]}
      >
        <meshStandardMaterial color="#f9f5ed" />
      </RoundedBox>
      <RoundedBox args={[3, 0.14, 2.35]} radius={0.07} position={[0, 1, 0.62]}>
        <meshStandardMaterial color={color} roughness={1} />
      </RoundedBox>
      {[-0.76, 0.76].map((x) => (
        <RoundedBox
          key={x}
          args={[1.3, 0.23, 0.72]}
          radius={0.11}
          position={[x, 1.08, -1.06]}
          rotation={[0.1, 0, x * 0.05]}
        >
          <meshStandardMaterial color="#eee6d8" roughness={1} />
        </RoundedBox>
      ))}
      {[-1.25, 1.25].flatMap((x) =>
        [-1.45, 1.45].map((z) => (
          <mesh key={x + ":" + z} position={[x, 0.12, z]}>
            <boxGeometry args={[0.13, 0.4, 0.13]} />
            <meshStandardMaterial color="#6d4934" />
          </mesh>
        )),
      )}
      {variant === 2 && (
        <mesh position={[0, 0.45, 1.86]}>
          <boxGeometry args={[2.6, 0.025, 0.02]} />
          <meshStandardMaterial color="#785d45" />
        </mesh>
      )}
    </group>
  );
}
