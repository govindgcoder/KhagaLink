import { useState, useRef } from "react";
import { useProjectStore } from "../stores/useStore";

export default function Telemetry() {
    const [port, setPort] = useState("");
    const [baudRate, setBaudRate] = useState(9600);
    const dialogRef = useRef(null);

    const connectToHardware = useProjectStore(
        (state) => state.connectToHardware,
    );

    const openModal = () => dialogRef.current?.showModal();

    // Explicitly call the native .close() method
    const closeModal = () => dialogRef.current?.close();

    const handleConnect = () => {
        connectToHardware(port, baudRate);
        closeModal();
    };

    return (
        <div
            className="p-8 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl overflow-y-auto hide-scrollbar"
            style={{
                msOverflowStyle: "none", // IE and Edge
                scrollbarWidth: "none", // Firefox
            }}
        >
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
                        <label className="text-sm text-slate-400">
                            Baud Rate
                        </label>
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
            
            <div className="flex w-full gap-4">
                <div className="flex flex-col flex-5 w-full h-full p-4 border border-slate-800 rounded">
                    sad
                </div>
                <div className="flex flex-col flex-2 w-full h-full p-4 border border-slate-900 rounded">
                    sad
                </div>
            </div>
            
        </div>
    );
}
