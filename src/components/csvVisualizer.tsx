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
    // addCsvToList(path);
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
        addCsvToList(selected);
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
      className="p-8 flex flex-col gap-4 min-h-0 bg-[var(--background-color)] rounded-xl overflow-y-auto hide-scrollbar"
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

      {/* CSV File Browser Widget */}
      <div className="flex flex-col p-4 border border-[var(--border-color)] bg-[var(--secondary-color)] rounded-xl gap-4">
        <div className="flex justify-between">
          <input
            type="text"
            value={path}
            hidden
            readOnly
            placeholder="Select a folder..."
          />
          <p>csv files</p>
          <button
            onClick={handleBrowse}
            className="text-xl bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] text-[var(--text-primary)] px-4 rounded-lg transition-colors shadow-sm"
          >
            +
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {currentProject?.csv_files.length === 0 && (
            <p className="text-[var(--text-secondary)] text-center py-4">
              No CSV files added. Click "+" to begin.
            </p>
          )}
          {currentProject?.csv_files.map((file, index) => (
            <div
              key={index}
              className={`p-2 flex justify-between items-center rounded-lg border transition-colors ${
                file.path === path
                  ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-[--text-primary]"
                  : "bg-[var(--background-color)] border-[var(--border-color)] text-[var(--text-primary)]"
              }`}
            >
              <button
                className="text-xs text-left flex-grow font-semibold"
                onClick={() => setPath(file.path)}
              >
                {file.path.replace(/^.*[\\\/]/, "")}
              </button>
              <button
                onClick={() => delCsvFromList(file.path)}
                className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded-md font-mono text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Table Widget */}
      <div className="flex flex-col gap-4 w-full min-w-0 p-4 border border-[var(--border-color)] bg-[var(--secondary-color)] rounded-xl">
        <div className="flex justify-between items-end shrink-0">
          <p className="font-sans text-[var(--text-secondary)] text-sm">
            Total Rows: {metadata == null ? 0 : metadata.total_rows} | Columns:{" "}
            {metadata ? metadata.headers.length : 0}
          </p>
          <div className="flex gap-2 items-center">
            <span className="text-[var(--text-secondary)] text-sm mr-2">
              Page {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
              {metadata ? Math.ceil(metadata.total_rows / PAGE_SIZE) : 1}
            </span>
            <button
              onClick={handlePrev}
              disabled={offset === 0}
              className={`bg-[var(--accent-color)] text-[var(--text-primary)] text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm ${
                offset === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--accent-muted)]"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={
                !!(metadata && offset + PAGE_SIZE >= metadata.total_rows)
              }
              className={`bg-[var(--accent-color)] text-[var(--text-primary)]  text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm ${
                metadata && offset + PAGE_SIZE >= metadata.total_rows
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--accent-muted)]"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <div
          className="border border-[var(--border-color)] rounded-xl shadow-sm overflow-auto bg-[var(--background-color)] w-full"
          style={{ height: "400px" }}
        >
          <table className="min-w-full" style={{ borderCollapse: "collapse" }}>
            <thead className="bg-[var(--secondary-color)] sticky top-0 shadow-sm z-10">
              <tr>
                {metadata?.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-[var(--border-color)] p-2 text-left text-[var(--text-primary)] whitespace-nowrap font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCSVrows?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-[var(--border-color)] p-2 text-[var(--text-secondary)] whitespace-nowrap"
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

      {/* Graphs Widget */}
      <div className="flex flex-col flex-1 min-h-0 p-4 border border-[var(--border-color)] bg-[var(--secondary-color)] rounded-xl overflow-hidden gap-4">
        <div className="flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Graphs
          </h2>
          <button
            onClick={addGraphWidget}
            className="bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] text-[var(--text-primary)] text-xs px-4 py-1.5 rounded-lg font-medium transition-all shadow-sm"
          >
            + Add Graph
          </button>
        </div>

        <div
          className="flex flex-col gap-6 pr-2 pb-2 overflow-y-auto hide-scrollbar"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
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
            <div className="text-center text-[var(--text-secondary)] mt-10 italic">
              No graphs added yet. Click "+ Add Graph" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
