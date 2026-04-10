import { useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";

export default function ProjectLoader() {
	const [path, setPath] = useState("");
	
	const loadProject = useProjectStore((state) => state.loadProject);

	const handleLoadProject = (pathURL: string) => {
		if (!pathURL) {
			alert("Please select a project file");
			return;
		}
		loadProject(pathURL);
		loadView("Project");
	};
	
	const loadView = useProjectStore((state) => state.load_view);

	const handleBrowse = async () => {
		try {
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select one folder",
			});
			if (selected) {
				setPath(selected);
			}
		} catch (err) {
			console.log("Failed to open dialog: ", err);
		}
	};

	return (
		<div className="p-6 border border-slate-600 rounded-lg max-w-lg mx-auto bg-slate-800">
			<fieldset className="space-y-6">
				<label className="block mb-2 text-slate-200">Path:</label>
				<div className="flex gap-4 items-center">
					<input
						type="text"
						value={path}
						readOnly
						placeholder="Select a folder..."
						className="border border-slate-600 bg-slate-700 text-slate-100 rounded px-2 py-1 flex-grow"
					/>
					<button
						onClick={handleBrowse}
						className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition-colors"
					>
						Browse
					</button>
				</div>

				<button
					onClick={()=>handleLoadProject}
					className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-colors"
				>
					Create Project
				</button>
			</fieldset>
		</div>
	);
}