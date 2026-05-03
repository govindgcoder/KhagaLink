import { useProjectStore } from "../stores/useStore";

export function DataRateWidget() {
  const dataRate = useProjectStore((s) => s.dataRate);
  const lossRate = useProjectStore((s) => s.lossRate);
  const telemetryDataLog = useProjectStore((s) => s.telemetryDataLog);
  const telemetryHeaders = useProjectStore((s) => s.telemetryHeaders);

const handleExportCSV = () => {
    if (telemetryDataLog.length === 0) {
      alert("No telemetry data to export");
      return;
    }
    const headers = telemetryHeaders.length > 0 
      ? telemetryHeaders 
      : telemetryDataLog[0]?.map((_: string, i: number) => `Field ${i}`) 
      || [];
    const csvContent = [
      headers.join(","),
      ...telemetryDataLog.map((row: string[]) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 mb-2 border-[var(--border-color)] bg-[var(--secondary-color)] rounded-2xl">
      <div className="flex justify-between">
        <span className="text-slate-400">Data Rate</span>
        <span className="text-green-400 font-mono">
          {dataRate.toFixed(1)} pkt/s
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Packet Loss</span>
        <span
          className={`font-mono ${lossRate > 5 ? "text-red-400" : "text-green-400"}`}
        >
          {lossRate.toFixed(1)}%
        </span>
      </div>
      <button
        onClick={handleExportCSV}
        className="mt-4 w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-lg py-1 transition-colors"
      >
        Export CSV ({telemetryDataLog.length} rows)
      </button>
    </div>
  );
}
