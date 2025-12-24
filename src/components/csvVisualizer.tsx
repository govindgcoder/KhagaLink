import { useState } from "react";
import { useProjectStore } from "../stores/useProjectStore";
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

	const loadView = useProjectStore((state) => state.load_view);

	// if (!metadata) {
	// 	return <div>No CSV loaded</div>;
	// }

	const handleView = () => {
		if (!path) return;
		loadCSVmetadata(path);
		loadCSVrows(path, 0, 50);
	};

	const handleExit = () => {
		loadView("Home");
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
		<div
			className="p-4 border mt-4 flex flex-col gap-4 h-full"
			style={{ minWidth: "800px" }}
		>
			<div>
				<p>
					{currentProject !== null
						? currentProject.name
						: "No Project"}
				</p>
			</div>
			<button
				onClick={handleExit}
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
				Exit
			</button>
			<h2
				className="text-xl font-bold mb-4"
				style={{
					fontFamily: "'Arial', sans-serif",
					fontSize: "24px",
					color: "#333",
				}}
			>
				CSV Analysis
			</h2>
			<div className="flex gap-2">
				<input
					type="text"
					value={path}
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
					Browse
				</button>
				<button
					onClick={handleView}
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
					View
				</button>
			</div>
			<p
				className="mt-2"
				style={{
					fontFamily: "'Arial', sans-serif",
					fontSize: "16px",
					color: "#555",
				}}
			>
				Total Rows: {metadata == null ? 0 : metadata.total_rows}
			</p>

			<h3
				className="font-bold mt-4"
				style={{
					fontFamily: "'Arial', sans-serif",
					fontSize: "18px",
					color: "#333",
				}}
			>
				Columns:
			</h3>
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
