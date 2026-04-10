import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";
import GraphWidgetComponent from "./GraphWidgetComponent";

export default function CsvVisualizer() {
  const [path, setPath] = useState("");
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;

  const metadata = useProjectStore((state) => state.currentCSVmetadata);

  const loadCSVmetadata = useProjectStore((state) => state.loadCSVmetadata);

  const currentProject = useProjectStore((state) => state.current_project);

  const currentCSVrows = useProjectStore((state) => state.currentCSVrows);

  const loadCSVrows = useProjectStore((state) => state.loadCSVrows);

  const addCsvToList = useProjectStore((state) => state.addCsvToList);

  const delCsvFromList = useProjectStore((state) => state.delCsvFromList);

  const activeGraphs = useProjectStore((state) => state.csvGraphs);

  const addGraphWidget = useProjectStore((state) => state.addCsvGraph);

  // if (!metadata) {
  // 	return <div>No CSV loaded</div>;
  // }

  const handleView = () => {
    if (!path) return;
    addCsvToList(path);
    loadCSVmetadata(path);
    loadCSVrows(path, 0, 50);
  };

  //to handle pagination
  const handleNext = () => {
    const newOffset = offset + PAGE_SIZE;
    // Check if at the end
    if (metadata && newOffset < metadata.total_rows) {
      setOffset(newOffset);
      loadCSVrows(path, newOffset, PAGE_SIZE);
    }
  };

  const handlePrev = () => {
    const newOffset = Math.max(0, offset - PAGE_SIZE); // to never go below 0
    setOffset(newOffset);
    loadCSVrows(path, newOffset, PAGE_SIZE);
  };

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: false,
        multiple: false,
        title: "Select a csv file",
      });
      if (selected) {
        setPath(selected);
      }
    } catch (err) {
      console.log("Failed to open dialog: ", err);
    }
  };
  // update table when another file is selected
  useEffect(() => {
    if (path) {
      handleView();
      setOffset(0);
    }
  }, [path]);

  return (
    <div
      className="p-8 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl overflow-y-auto hide-scrollbar"
      style={{
        msOverflowStyle: "none", // IE and Edge
        scrollbarWidth: "none", // Firefox
      }}
    >
      <style>{`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

      <div>
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-4 text-slate-50">
            CSV Analysis
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={path}
              hidden
              readOnly
              placeholder="Select a folder..."
            />
            <button
              onClick={handleBrowse}
              className="text-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 rounded transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {currentProject?.csv_files.length === 0 && (
            <p className="text-slate-400 text-center py-4">
              No CSV files added. Click "+" to begin.
            </p>
          )}
          {currentProject?.csv_files.map((file, index) => (
            <div
              key={index}
              className={`p-3 flex justify-between items-center rounded ${
                file.path === path
                  ? "bg-indigo-400 text-white"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              <button
                className="text-left flex-grow font-semibold"
                onClick={() => setPath(file.path)}
              >
                {file.path.replace(/^.*[\\\/]/, "")}
              </button>
              <button
                onClick={() => delCsvFromList(file.path)}
                className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded font-mono text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2 w-full min-w-0">
        <div className="flex justify-between items-end">
          <p className="font-sans text-slate-500">
            Total Rows: {metadata == null ? 0 : metadata.total_rows} | Columns:{" "}
            {metadata ? metadata.headers.length : 0}
          </p>
          <div className="flex gap-2 items-center">
            <span className="text-slate-400 text-sm mr-2">
              Page {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
              {metadata ? Math.ceil(metadata.total_rows / PAGE_SIZE) : 1}
            </span>
            <button
              onClick={handlePrev}
              disabled={offset === 0}
              className={`bg-indigo-600 text-white px-4 py-1 rounded transition-colors ${offset === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500"}`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={metadata && offset + PAGE_SIZE >= metadata.total_rows}
              className={`bg-indigo-600 text-white px-4 py-1 rounded transition-colors ${metadata && offset + PAGE_SIZE >= metadata.total_rows ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500"}`}
            >
              Next
            </button>
          </div>
        </div>

        <div
          className="border border-slate-600 rounded shadow-sm overflow-auto bg-slate-700 w-full"
          style={{ height: "400px" }}
        >
          <table className="min-w-full" style={{ borderCollapse: "collapse" }}>
            <thead className="bg-slate-600 sticky top-0 shadow-sm z-10">
              <tr>
                {metadata?.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-slate-500 p-2 text-left text-slate-100 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCSVrows?.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/10">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-slate-500 p-2 text-slate-200 whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col mt-4 border-t border-slate-600 pt-4">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-slate-50">Graphs</h2>
          <button
            onClick={addGraphWidget}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold transition-all shadow-md"
          >
            + Add Graph
          </button>
        </div>

        <div className="flex flex-col gap-6 pr-2 pb-10 overflow-auto">
          {activeGraphs.map((widget) => (
            <GraphWidgetComponent
              key={widget.id}
              widget={widget}
              headers={metadata?.headers}
              currentCsvPath={path}
              context="csv"
            />
          ))}
          {activeGraphs.length === 0 && (
            <div className="text-center text-slate-400 mt-10 italic">
              No graphs added yet. Click "+ Add Graph" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
