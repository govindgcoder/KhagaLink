import { Canvas } from "@react-three/fiber";
import { useTelemetryStore } from "../stores/telemetryStore";

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

interface OrientationConeProps {
  quaternion: {
    w: number;
    x: number;
    y: number;
    z: number;
  };
}

// cone mesh
function OrientationCone({ quaternion }: OrientationConeProps) {
  return (
    <mesh quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}>
      {/* radius, height, radialSegments */}
      <coneGeometry args={[1, 2.5, 8]} />
      <meshStandardMaterial color="#7653fc" flatShading />
      <axesHelper args={[3]} />
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
  const quat = useTelemetryStore((s) => s.latestQuaternion);
  const quatConfig = useTelemetryStore((s) => s.telemetryQuatConfig);
  quatConfig.enabled = true;

  return (
    <div className="flex flex-col gap-2 my-2.5 p-4 border-[var(--border-color)] bg-[var(--secondary-color)] rounded-2xl">
      {/* config selectors */}
      <div className="flex flex-wrap justify-between items-center text-xs bg-[--tertiary-color] ">
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
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <OrientationCone quaternion={quat} />
      </Canvas>
    </div>
  );
}
