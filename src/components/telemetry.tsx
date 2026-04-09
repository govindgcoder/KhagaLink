import { useState, useRef, useEffect } from "react";
import { useProjectStore } from "../stores/useStore";
import GraphWidgetComponent from "./GraphWidgetComponent";
import { MapWidget } from "./mapView";

export default function Telemetry() {
  const [port, setPort] = useState("");
  const [baudRate, setBaudRate] = useState(9600);
  
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const connectToHardware = useProjectStore((state) => state.connectToHardware);

  const openModal = () => dialogRef.current?.showModal();

  // Explicitly call the native .close() method
  const closeModal = () => dialogRef.current?.close();

  const handleConnect = () => {
    connectToHardware(port, baudRate);
    closeModal();
  };

  const activeGraphs = useProjectStore((state) => state.telemetryGraphs);

  const addGraphWidget = useProjectStore((state) => state.addTelemetryGraph);

  const graphListEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    graphListEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGraphs.length]);

  const telemetryHeaders = useProjectStore((state) => state.telemetryHeaders);
  const telemetryMapConfig = useProjectStore((state) => state.telemetryMapConfig);
  const setMapConfig = useProjectStore((state) => state.setMapConfig);

  return (
    <div className="p-8 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl">
      <dialog
        ref={dialogRef}
        className="p-0 rounded-xl overflow-hidden bg-slate-700 text-white shadow-2xl backdrop:bg-black/60 place-self-center"
      >
        <div className="p-6 flex flex-col gap-4 min-w-[300px]">
          <h2 className="text-xl font-bold border-b border-slate-700 pb-2">
            Connection Settings
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Port</label>
            <input
              type="text"
              className="bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g. COM5"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Baud Rate</label>
            <input
              type="text"
              className="bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={baudRate}
              onChange={(e) => setBaudRate(+e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 hover:bg-slate-700 rounded transition"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Telemetry Dashboard</h2>
        <button
          onClick={openModal}
          className={`px-6 py-2 rounded-lg font-medium transition ${port ? "bg-green-600" : "bg-blue-600 hover:bg-blue-500"}`}
        >
          {port ? `Connected: ${port}` : "Configure Connection"}
        </button>
      </div>

      <div className="flex w-full gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-[5] min-h-0 p-4 border border-slate-800 rounded overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <button
              onClick={addGraphWidget}
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded font-bold transition-all shadow-md"
            >
              + Add Graph
            </button>
          </div>
          <div
            className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-2 hide-scrollbar"
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
              <div className="text-center text-slate-500 mt-10">
                Click "+ Add Graph" to plot live data.
              </div>
            )}
            <div ref={graphListEndRef} className="h-1 shrink-0" />
          </div>
        </div>
        <div className="flex flex-col flex-2 h-full p-4 border border-slate-900 rounded">
          <MapWidget
            latCol={telemetryMapConfig.latCol}
            lngCol={telemetryMapConfig.longCol}
            headers={telemetryHeaders.length > 0 ? telemetryHeaders : ["Field 0", "Field 1"]}
            onConfigChange={(config) => {
              setMapConfig({ ...config, enabled: true });
            }}
          />
        </div>
      </div>
    </div>
  );
}
