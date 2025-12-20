import { useState } from "react";
import { useProjectStore } from "../stores/useProjectStore";
import { open } from "@tauri-apps/plugin-dialog";

export default function CsvVisualizer() {
	const [path, setPath] = useState("");
	const [offset, setOffset] = useState(0);
	const PAGE_SIZE = 50;

	const metadata = useProjectStore((state) => state.currentCSVmetadata);

	const loadCSVmetadata = useProjectStore((state) => state.loadCSVmetadata);
	
	const currentCSVrows = useProjectStore((state) => state.currentCSVrows);
	
	const loadCSVrows = useProjectStore((state) => state.loadCSVrows);
	// if (!metadata) {
	// 	return <div>No CSV loaded</div>;
	// }

	const handleView = () => {
		if (!path) return;
		loadCSVmetadata(path);
		loadCSVrows(path, 0, 50)
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

	return (
		<div className="p-4 border mt-4">
			<h2 className="text-xl font-bold">CSV Analysis</h2>
			<div style={{ display: "flex", gap: "8px" }}>
				<input
					type="text"
					value={path}
					readOnly
					placeholder="Select a folder..."
				/>
				<button onClick={handleBrowse}>Browse</button>
				<button onClick={handleView}>View</button>
			</div>
			<p>Total Rows: {metadata == null ? 0 : metadata.total_rows}</p>

			<h3 className="font-bold mt-2">Columns:</h3>
			<ul className="list-disc pl-5">
				{metadata
					? metadata.headers.map((header, index) => (
							<li key={index}>{header}</li>
						))
					: null}
			</ul>
			<div style={{"display":"flex", "justifyContent":"space-between"}}>
				<button onClick={handlePrev}>Previous</button>
				<button onClick={handleNext}>Next</button>
			</div>
			<table>
				<thead>
					<tr>
						{metadata?.headers.map((header, index) => (
							<th key={index}>{header}</th>
						))}
					</tr>
				</thead>
				<tbody>
				{currentCSVrows?.map((row, index)=>(
					<tr key={index}>
						{row.map((cell, index)=>(
							<td key={index}>{cell}</td>
						))}
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}
