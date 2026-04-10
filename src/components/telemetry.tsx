import { useState, useRef, useEffect } from "react";
import { useProjectStore } from "../stores/useStore";
import GraphWidgetComponent from "./GraphWidgetComponent";
import { MapWidget } from "./mapView";
import { OrientationWidget } from "./orientationWidget";
import { DataRateWidget } from "./DataRateWidget";

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
  const telemetryMapConfig = useProjectStore(
    (state) => state.telemetryMapConfig,
  );
  const setMapConfig = useProjectStore((state) => state.setMapConfig);

  const telemetryQuatConfig = useProjectStore((s) => s.telemetryQuatConfig);
  const setQuatConfig = useProjectStore((s) => s.setQuatConfig);

  return (
    <div className="p-8 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl">
      <dialog
        ref={dialogRef}
        className="p-0 rounded-xl overflow-hidden bg-slate-700 text-white shadow-2xl backdrop:bg-black/60 backdrop-blur-sm place-self-center"
      >
        <div className="p-6 flex flex-col gap-4 min-w-[300px]">
          <h2 className="text-xl font-bold border-b border-slate-700 pb-2">
            Connection Settings
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300">Port</label>
            <input
              type="text"
              className="bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g. COM5"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-300">Baud Rate</label>
            <select
              className="bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold transition"
              onClick={handleConnect}
            >
              Connect
            </button>
          </div>
        </div>
      </dialog>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-50">
          Telemetry Dashboard
        </h2>
        <button
          onClick={openModal}
          className={`px-6 py-2 rounded-lg text-[14px] font-medium transition ${port ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-500"}`}
        >
          {port ? `Connected: ${port} ✓` : "Configure Connection"}
        </button>
      </div>

      <div className="flex w-full gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-[5] min-h-0 p-4 border border-slate-800 rounded overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <button
              onClick={addGraphWidget}
              className="text-2xs bg-indigo-500 hover:bg-indigo-300 text-white px-4 rounded transition-all shadow-2xs"
            >
              +
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
              <div className="flex flex-col items-center gap-2 text-slate-400 mt-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Click '+' to add graphs</p>
              </div>
            )}
            <div ref={graphListEndRef} className="h-1 shrink-0" />
          </div>
        </div>
        <div className="flex flex-col flex-2 h-full p-4 border border-slate-800 rounded overflow-auto">
          
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div
              className="text-[14px] text-gray-100"
            >
              Position and Orientation
            </div>
          </div>
          
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
