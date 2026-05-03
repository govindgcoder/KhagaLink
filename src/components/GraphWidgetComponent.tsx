import { useProjectStore, GraphWidget } from "../stores/useStore";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useRef } from "react";

interface GraphWidgetProps {
  widget: GraphWidget;
  headers: string[] | undefined;
  currentCsvPath: string | undefined;
  context: string;
}

function GraphWidgetComponent({
  widget,
  headers,
  currentCsvPath,
  context,
}: GraphWidgetProps) {
  const updateGraphData = useProjectStore((state) => state.updateGraphData);
  const removeGraphWidget = useProjectStore((state) =>
    context === "csv" ? state.removeCsvGraph : state.removeTelemetryGraph,
  );

  console.log(
    `[DEBUG - WIDGET] RENDER -> ID: ${widget.id} | Data Length: ${widget.data.length}`,
  );

  const handleAxisChange = (axis: "x" | "y", newIndex: number) => {
    console.log(
      `[DEBUG - WIDGET] Dropdown Changed -> Axis: ${axis}, New Index: ${newIndex}`,
    );
    if (!currentCsvPath) {
      console.log(
        `[DEBUG - WIDGET] Aborting Axis Change - No CSV Path provided.`,
      );
      return;
    }

    const newX = axis === "x" ? newIndex : widget.x_col_idx;
    const newY = axis === "y" ? newIndex : widget.y_col_idx;

    updateGraphData(widget.id, newX, newY, currentCsvPath, context);
  };

  useEffect(() => {
    console.log(
      `[DEBUG - WIDGET] useEffect Fired -> Path: ${currentCsvPath}, Data Length: ${widget.data.length}`,
    );
    if (
      currentCsvPath &&
      currentCsvPath !== "LIVE" &&
      widget.data.length === 0
    ) {
      console.log(
        `[DEBUG - WIDGET] useEffect is triggering updateGraphData...`,
      );
      updateGraphData(
        widget.id,
        widget.x_col_idx,
        widget.y_col_idx,
        currentCsvPath,
        context,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCsvPath]);

  const chartWidth = Math.max(window.innerWidth * 0.4, widget.data.length * 10);

  const scrollRef = useRef<HTMLDivElement>(null);

  // smart Auto-Scroll for Telemetry
  useEffect(() => {
    if (context === "telemetry" && scrollRef.current) {
      const container = scrollRef.current;

      // Check if the user's scrollbar is near the right edge (within 150 pixels)
      const isNearRightEdge =
        container.scrollWidth - container.scrollLeft - container.clientWidth <
        100;

      if (isNearRightEdge) {
        // Wait for the browser to finish drawing the new point, then scroll
        requestAnimationFrame(() => {
          container.scrollLeft = container.scrollWidth;
        });
      }
    }
  }, [widget.data.length, context]); // Run this every time a new data point is added

  return (
    <div className="bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col gap-4 shadow-lg h-[400px] shrink-0">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="flex gap-4 items-center text-xs">
          <span className="text-emerald-400 font-bold font-mono">X-Axis:</span>
          <select
            className="text-slate-50 border border-slate-700 rounded px-2 py-1 bg-[var(--primary-color)]"
            value={widget.x_col_idx}
            onChange={(e) => handleAxisChange("x", Number(e.target.value))}
          >
            {headers?.map((header, idx) => (
              <option key={idx} value={idx}>
                {header}
              </option>
            ))}
          </select>

          <span className="text-violet-400 font-bold font-mono ml-4">
            Y-Axis:
          </span>
          <select
            className="text-slate-50 border border-slate-700 rounded px-2 py-1"
            value={widget.y_col_idx}
            onChange={(e) => handleAxisChange("y", Number(e.target.value))}
          >
            {headers?.map((header, idx) => (
              <option key={idx} value={idx}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => removeGraphWidget(widget.id)}
          className="text-red-400 hover:bg-red-500/20 text-xs px-3 py-1 rounded transition-colors"
        >
          Remove
        </button>
      </div>

      <div className="flex-1 w-full min-h-0">
        {widget.data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 font-mono">
            Select columns to load data...
          </div>
        ) : (
          <div className="w-full h-full overflow-x-auto">
            <div
              ref={scrollRef}
              className="overflow-x-auto"
              style={{
                height: "100%",
                scrollbarWidth: "thin",
                scrollbarColor: "#6c71c4 transparent",
              }}
            >
              <LineChart width={chartWidth} height={280} data={widget.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
                <XAxis
                  type={context === "telemetry" ? "number" : "category"}
                  dataKey="x"
                  domain={
                    context === "telemetry" ? ["dataMin", "dataMax"] : undefined
                  }
                  stroke="#6c71c4"
                  tick={{ fill: "#6c71c4", fontSize: 12 }}
                  tickFormatter={
                    context === "telemetry"
                      ? (tick) => tick.toFixed(2)
                      : undefined
                  }
                />
                <YAxis
                  type="number"
                  domain={["auto", "auto"]}
                  stroke="#6c71c4"
                  tick={{ fill: "#6c71c4", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1e",
                    borderColor: "#2d2d35",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#8b5cf6" }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(GraphWidgetComponent);
