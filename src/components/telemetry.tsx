import { useState, useRef, useEffect } from "react";
import { useProjectStore } from "../stores/useStore";
import GraphWidgetComponent from "./GraphWidgetComponent";
import { MapWidget } from "./mapView";
import { OrientationWidget } from "./orientationWidget";
import { DataRateWidget } from "./DataRateWidget";

export default function Telemetry() {
  const [port, setPort] = useState("");
  const [baudRate, setBaudRate] = useState(9600);
  const [isConnected, setIsConnected] = useState(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const connectToHardware = useProjectStore((state) => state.connectToHardware);

  const openModal = () => dialogRef.current?.showModal();

  // Explicitly call the native .close() method
  const closeModal = () => dialogRef.current?.close();

  const handleConnect = () => {
    connectToHardware(port, baudRate);
    setIsConnected(true);
    closeModal();
  };

  const activeGraphs = useProjectStore((state) => state.telemetryGraphs);

  const addGraphWidget = useProjectStore((state) => state.addTelemetryGraph);

  const telemetryHeaders = useProjectStore((state) => state.telemetryHeaders);
  const telemetryMapConfig = useProjectStore(
    (state) => state.telemetryMapConfig,
  );
  const setMapConfig = useProjectStore((state) => state.setMapConfig);

  const telemetryQuatConfig = useProjectStore((s) => s.telemetryQuatConfig);
  const setQuatConfig = useProjectStore((s) => s.setQuatConfig);

  const disconnectHardware = useProjectStore(
    (state) => state.disconnectHardware,
  );
  const handleDisconnect = () => {
    disconnectHardware();
    setPort(""); // Clear port state
    setIsConnected(false);
  };

  return (
    <div className="px-8 py-4 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl">
      <dialog
        ref={dialogRef}
        className="p-0 rounded-xl overflow-hidden bg-[var(--secondary-color)] text-[var(--text-primary)] shadow-2xl backdrop:bg-black/60 backdrop-blur-sm place-self-center border border-[var(--border-color)]"
      >
        <div className="p-6 flex flex-col gap-4 min-w-[300px]">
          <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-2">
            Connection Settings
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-secondary)]">Port</label>
            <input
              type="text"
              className="bg-[var(--background-color)] text-[var(--text-primary)] p-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-colors"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g. COM5"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-secondary)]">
              Baud Rate
            </label>
            <select
              className="bg-[var(--background-color)] text-[var(--text-primary)] p-2 rounded-lg border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-colors"
              value={baudRate}
              onChange={(e) => setBaudRate(+e.target.value)}
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
              <option value={230400}>230400</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--background-color)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] rounded-lg font-semibold transition-colors text-[var(--text-primary)] shadow-md"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex w-full gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-[13] min-h-0 p-4 mb-4 border border-[var(--border-color)] bg-[var(--secondary-color)] rounded-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <button
              onClick={addGraphWidget}
              className="text-xl bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] text-[var(--text-primary)] px-4  rounded-lg transition-all shadow-sm"
            >
              +
            </button>

            <button
              onClick={port ? handleDisconnect : openModal}
              className={`px-6 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm text-[var(--text-primary)] ${
                port
                  ? "bg-green-600 hover:bg-red-500"
                  : "bg-[var(--accent-color)] hover:bg-[var(--accent-muted)]"
              }`}
            >
              {port ? `Connected: ${port} ✓` : "Configure Connection"}
            </button>
          </div>
          <div
            className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto hide-scrollbar"
            style={{
              msOverflowStyle: "none", // IE and Edge
              scrollbarWidth: "none", // Firefox
            }}
          >
            {activeGraphs.map((widget) => (
              <GraphWidgetComponent
                key={widget.id}
                widget={widget}
                headers={
                  telemetryHeaders.length > 0
                    ? telemetryHeaders
                    : ["Col 0", "Col 1", "Col 2", "Col 3", "Col 4"]
                }
                currentCsvPath={"LIVE"}
                context="telemetry"
              />
            ))}

            {activeGraphs.length === 0 && (
              <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)] mt-32">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>Click '+' to add graphs</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-[6] h-fit max-h-full  overflow-y-auto gap-1">
          <MapWidget
            latCol={telemetryMapConfig.latCol}
            longCol={telemetryMapConfig.longCol}
            headers={
              telemetryHeaders.length > 0
                ? telemetryHeaders
                : ["Field 0", "Field 1"]
            }
            onConfigChange={(config) => {
              setMapConfig({ ...config, enabled: true });
            }}
          />

          <OrientationWidget
            wCol={telemetryQuatConfig.wCol}
            xCol={telemetryQuatConfig.xCol}
            yCol={telemetryQuatConfig.yCol}
            zCol={telemetryQuatConfig.zCol}
            headers={
              telemetryHeaders.length > 0
                ? telemetryHeaders
                : ["Field 0", "Field 1"]
            }
            onConfigChange={(config) => {
              setQuatConfig({ ...config, enabled: true });
            }}
          />
          <DataRateWidget />
        </div>
      </div>
    </div>
  );
}
