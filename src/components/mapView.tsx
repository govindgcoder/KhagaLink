import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });
import { useProjectStore } from "../stores/useStore";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// This child component auto-pans the map when position changes
function MapPanner({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(position);
  }, [position]);
  return null;
}

interface MapWidgetProps {
  latCol: number;
  longCol: number;
  headers: string[];
  onConfigChange: (
    config: Partial<{ latCol: number; longCol: number }>,
  ) => void;
}

export function MapWidget({
  latCol,
  longCol,
  headers,
  onConfigChange,
}: MapWidgetProps) {
  const position = useProjectStore((s) => s.latestPosition);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center text-xs bg-gray-600 justify-evenly">
        <label>Latitude:</label>
        <select onChange={(e) => onConfigChange({ latCol: +e.target.value })}>
          {headers.map((h, i) => (
            <option key={i} value={i}>
              {h}
            </option>
          ))}
        </select>
        <label>Longitude:</label>
        <select onChange={(e) => onConfigChange({ longCol: +e.target.value })}>
          {headers.map((h, i) => (
            <option key={i} value={i}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <MapContainer center={[0, 0]} zoom={13} style={{ height: "250px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {position && (
          <>
            <Marker position={[position.lat, position.lng]} />
            <MapPanner position={[position.lat, position.lng]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
