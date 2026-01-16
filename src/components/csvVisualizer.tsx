import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";

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
            className="p-8 flex flex-col gap-4 h-full bg-[var(--background-color)] rounded-xl "
            style={{ minWidth: "800px" }}
        >
            <h2 className="text-xl font-semibold mb-4">CSV Analysis</h2>
            <div className="flex gap-2 ">
                <input
                    type="text"
                    value={path}
                    hidden
                    readOnly
                    placeholder="Select a folder..."
                />
                <button
                    onClick={handleBrowse}
                    style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontFamily: "'Arial', sans-serif",
                    }}
                >
                    Add New CSV
                </button>
            </div>

            <div>
                {currentProject?.csv_files.map((file, index) => {
                    return (
                        <div
                            key={index}
                            className={`m-4 p-4 flex ${file.path === path ? "bg-blue-500 text-white" : "bg-blue-300"}`}
                        >
                            <button
                                className="w-full"
                                onClick={() => setPath(file.path)}
                            >
                                {file.path.replace(/^.*[\\\/]/, "")}
                            </button>
                            <button
                                onClick={() => delCsvFromList(file.path)}
                                className="bg-red-500 px-3 py-1 rounded font-mono"
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>

            <p
                className="mt-2"
                style={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "16px",
                    color: "#555",
                }}
            >
                Total Rows: {metadata == null ? 0 : metadata.total_rows} |
                Columns: {metadata ? metadata.headers.length : 0}
            </p>

            {/*<ul className="list-disc pl-5">
				{metadata
					? metadata.headers.map((header, index) => (
							<li key={index}>{header}</li>
						))
					: null}
			</ul>*/}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                    onClick={handlePrev}
                    style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontFamily: "'Arial', sans-serif",
                    }}
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontFamily: "'Arial', sans-serif",
                    }}
                >
                    Next
                </button>
            </div>
            <div
                className="flex overflow-y-auto h-full"
                style={{
                    maxHeight: "70vh",
                    overflow: "auto",
                    border: "1px solid black",
                    borderRadius: "4px",
                    padding: "8px",
                }}
            >
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            {metadata?.headers.map((header, index) => (
                                <th
                                    key={index}
                                    style={{
                                        border: "1px solid black",
                                        padding: "8px",
                                        textAlign: "left",
                                    }}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentCSVrows?.map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, index) => (
                                    <td
                                        key={index}
                                        style={{
                                            border: "1px solid black",
                                            padding: "8px",
                                        }}
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
    );
}
