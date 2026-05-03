import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useProjectStore } from "../stores/useStore";

interface OrientationWidgetProps {
  wCol: number;
  xCol: number;
  yCol: number;
  zCol: number;
  headers: string[];
  onConfigChange: (
    config: Partial<{
      wCol: number;
      xCol: number;
      yCol: number;
      zCol: number;
      enabled: boolean;
    }>,
  ) => void;
}

interface TrigonalPyramidProps {
  quaternion: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
}

// pyramid mesh
function TrigonalPyramid({ quaternion }: TrigonalPyramidProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // apply quaternion rotation
  useEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.quaternion.set(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w,
    );
  }, [quaternion]);

  return (
    <mesh ref={meshRef}>
      <tetrahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color="#7653fc" />
    </mesh>
  );
}

export function OrientationWidget({
  wCol,
  xCol,
  yCol,
  zCol,
  headers,
  onConfigChange,
}: OrientationWidgetProps) {
  const quat = useProjectStore((s) => s.latestQuaternion);
  const quatConfig = useProjectStore((s) => s.telemetryQuatConfig);
  quatConfig.enabled = true;

  return (
    <div className="flex flex-col gap-2 my-2.5 p-4 border-[var(--border-color)] bg-[var(--secondary-color)] rounded-2xl">
      {/* config selectors */}
      <div className="flex flex-wrap gap-2 items-center text-xs bg-[--tertiary-color] justify-start">
        <select
          value={wCol}
          onChange={(e) => onConfigChange({ wCol: +e.target.value })}
        >
          {headers.map((h, i) => (
            <option key={i} value={i}>
              W: {h}
            </option>
          ))}
        </select>

        <select
          value={xCol}
          onChange={(e) => onConfigChange({ xCol: +e.target.value })}
        >
          {headers.map((h, i) => (
            <option key={i} value={i}>
              X: {h}
            </option>
          ))}
        </select>

        <select
          value={yCol}
          onChange={(e) => onConfigChange({ yCol: +e.target.value })}
        >
          {headers.map((h, i) => (
            <option key={i} value={i}>
              Y: {h}
            </option>
          ))}
        </select>

        <select
          value={zCol}
          onChange={(e) => onConfigChange({ zCol: +e.target.value })}
        >
          {headers.map((h, i) => (
            <option key={i} value={i}>
              Z: {h}
            </option>
          ))}
        </select>
      </div>

      {/* 3d preview */}
      <Canvas style={{ height: "200px" }} camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} />
        <TrigonalPyramid quaternion={quat} />
      </Canvas>
    </div>
  );
}
