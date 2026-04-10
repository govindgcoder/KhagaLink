import { useProjectStore } from "../stores/useStore";

export function DataRateWidget() {
  const dataRate = useProjectStore(s => s.dataRate);
  const lossRate = useProjectStore(s => s.lossRate);
  
  return (
    <div className="p-3 border border-slate-700 rounded">
      <div className="flex justify-between">
        <span className="text-slate-400">Data Rate</span>
        <span className="text-green-400 font-mono">{dataRate.toFixed(1)} pkt/s</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Packet Loss</span>
        <span className={`font-mono ${lossRate > 5 ? "text-red-400" : "text-green-400"}`}>
          {lossRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}