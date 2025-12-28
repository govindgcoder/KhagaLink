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
		<div className="p-6 border rounded-lg max-w-lg mx-auto">
			<fieldset className="space-y-6">
				<label className="block mb-2">Path:</label>
				<div className="flex gap-4 items-center">
					<input
						type="text"
						value={path}
						readOnly
						placeholder="Select a folder..."
						className="border border-gray-300 rounded px-2 py-1 flex-grow"
					/>
					<button
						onClick={handleBrowse}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Browse
					</button>
				</div>

				<button
					onClick={()=>handleLoadProject}
					className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
				>
					Create Project
				</button>
			</fieldset>
		</div>
	);
}