import { useProjectStore, GraphWidget } from "../stores/useStore";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";


interface GraphWidgetProps {
    widget: GraphWidget;
    headers: string[] | undefined;
    currentCsvPath: string | undefined; // the file to target the CSV - conencted to the rust backend
}

export default function GraphWidgetComponent({ widget, headers, currentCsvPath }: GraphWidgetProps) {
    const updateGraphData = useProjectStore((state) => state.updateGraphData);
    const removeGraphWidget = useProjectStore((state) => state.removeGraphWidget);

    // When the user changes a dropdown, fetch new data
    const handleAxisChange = (axis: "x" | "y", newIndex: number) => {
        if (!currentCsvPath) return;

        const newX = axis === "x" ? newIndex : widget.x_col_idx;
        const newY = axis === "y" ? newIndex : widget.y_col_idx;

        updateGraphData(widget.id, newX, newY, currentCsvPath);
    };
    
    // Fetch initial data on mount, or when currentCsvPath changes
        useEffect(() => {
            if (currentCsvPath && widget.data.length === 0) {
                updateGraphData(widget.id, widget.x_col_idx, widget.y_col_idx, currentCsvPath);
            }
        }, [currentCsvPath]); // We deliberately only run this when the path changes or it mounts

    return (
        <div className="bg-[var(--secondary-color)] border border-slate-800 rounded-lg p-4 flex flex-col gap-4 shadow-lg h-[500px]">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex gap-4 items-center">
                    <span className="text-emerald-400 font-bold font-mono">X-Axis:</span>
                    <select 
                        className="text-slate-50 border border-slate-700 rounded px-2 py-1 bg-[var(--primary-color)]"
                        value={widget.x_col_idx}
                        onChange={(e) => handleAxisChange("x", Number(e.target.value))}
                    >
                        {headers?.map((header, idx) => (
                            <option key={idx} value={idx}>{header}</option>
                        ))}
                    </select>

                    <span className="text-violet-400 font-bold font-mono ml-4">Y-Axis:</span>
                    <select 
                        className="text-slate-50 border border-slate-700 rounded px-2 py-1"
                        value={widget.y_col_idx}
                        onChange={(e) => handleAxisChange("y", Number(e.target.value))}
                    >
                        {headers?.map((header, idx) => (
                            <option key={idx} value={idx}>{header}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={() => removeGraphWidget(widget.id)}
                    className="text-red-400 hover:bg-red-500/20 px-3 py-1 rounded transition-colors"
                >
                    Remove
                </button>
            </div>

            <div className="flex-1 w-full h-128 min-h-0">
                {widget.data.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-slate-500 font-mono">
                        Select columns to load data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={widget.data}>
                            
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
                            
                            {/* map x keys from graph point */}
                            <XAxis 
                                dataKey="x" 
                                stroke="#6c71c4" 
                                tick={{ fill: '#6c71c4', fontSize: 12 }} 
                            />
                            
                            <YAxis 
                                stroke="#6c71c4" 
                                tick={{ fill: '#6c71c4', fontSize: 12 }} 
                            />
                            
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#2d2d35', color: '#f8fafc' }}
                                itemStyle={{ color: '#8b5cf6' }}
                            />
                            
                            {/*map the y keys*/}
                            <Line 
                                type="monotone" 
                                dataKey="y" 
                                stroke="#8b5cf6" // Primary Violet
                                strokeWidth={2} 
                                dot={false} // hid dots for performance
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}