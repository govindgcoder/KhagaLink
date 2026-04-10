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
  onConfigChange: (config: Partial<{
    wCol: number;
    xCol: number;
    yCol: number;
    zCol: number;
    enabled: boolean;
  }>) => void;
}

interface CylinderProps {
  quaternion: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
}

function Cylinder({ quaternion }: CylinderProps) {
  const meshRef = useRef<THREE.Mesh>(null);

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
      <cylinderGeometry args={[0.75, 0.75, 5, 16]} />
      <meshStandardMaterial color="#8b5cf6" />
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
    <div className="flex flex-col gap-2 my-4">
      <div className="flex flex-wrap gap-2 items-center text-xs bg-gray-600 justify-evenly">
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

      <Canvas style={{ height: "200px" }} camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Cylinder quaternion={quat} />
      </Canvas>
    </div>
  );
}