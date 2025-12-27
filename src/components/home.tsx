import "react";
import { useState } from "react";
import ProjectCreator from "./projectCreator";
import { useGlobalStore, useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";

export default function Home() {
	const [isNewProject, setIsNewProject] = useState(false);
	const [path, setPath] = useState("");

	const loadProject = useProjectStore((state) => state.loadProject);

	const loadView = useProjectStore((state) => state.load_view);

	const projectList = useGlobalStore((state) => state.projects);

	const deleteProject = useGlobalStore((state) => state.deleteProject);

	const handleLoadProject = (pathURL: string) => {
		if (!pathURL) {
			alert("Please select a project file");
			return;
		}
		loadProject(pathURL);
		loadView("Project");
	};

	const handleNewProjectUI = () => {
		setIsNewProject(!isNewProject);
	};

	const handleBrowse = async () => {
		try {
			const selected = await open({
				directory: false,
				multiple: false,
				title: "Select project.json",
			});
			if (selected) {
				setPath(selected);
			}
		} catch (err) {
			console.log("Failed to open dialog: ", err);
		}
	};

	const handleDeleteProject = (path: string) => {
		deleteProject(path);
		alert("project deleted");
		setPath("");
	};

	return (
		// check whether the global store has hydrated
		!useGlobalStore.persist.hasHydrated() ? (
			<div className="size-screen justify-center items-center">
				Loading...
			</div>
		) : (
			<div className="p-8 mt-4 " style={{ minWidth: "800px" }}>
				<h2 className="text-2xl ml-1 text-violet-300 font-bold">
					KhagaLink
				</h2>
				<h1 className="text-6xl ">Projects</h1>

				<div id="rows" className="flex flex-col mt-8">
					<div id="create-load-row" className="flex gap-8">
						<div className="w-120 h-50 bg-[var(--primary-color)] rounded-xl px-6 pt-18 flex items-end">
							<p className="text-4xl my-8">Create a new Project</p>
						</div>
						<div className="w-110 h-50 bg-[var(--secondary-color)] rounded-xl px-6 pt-18 flex items-end">
							<p className="text-4xl my-8 text-gray-300">Load an existing Project</p>
						</div>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "8px",
						flexDirection: "column",
					}}
				>
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-64 self-center"
						onClick={handleNewProjectUI}
					>
						{!isNewProject ? "New Project" : "Close"}
					</button>
					<div>
						{isNewProject ? (
							<ProjectCreator></ProjectCreator>
						) : null}
					</div>
				</div>
				{!isNewProject ? (
					<div>
						<div>
							<fieldset className="space-y-4">
								<label className="block mb-2">Path:</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={path}
										readOnly
										placeholder="Select the project file..."
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
									onClick={() => handleLoadProject(path)}
									className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
								>
									Load Project
								</button>
							</fieldset>
						</div>

						<div className="border border-black mt-12 p-4 flex flex-col gap-4">
							{projectList.length > 0 ? (
								projectList.map((project) => (
									<div className="flex  items-center">
										<button
											className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 grow-10"
											onClick={() =>
												handleLoadProject(project.path)
											}
										>
											{project.name}
										</button>
										<button
											className="w-8 h-10 rounded grow-1 bg-red-300"
											onClick={() =>
												handleDeleteProject(
													project.path,
												)
											}
										>
											X
										</button>
									</div>
								))
							) : (
								<p>Start a new Project!</p>
							)}
						</div>
					</div>
				) : null}
			</div>
		)
	);
}
