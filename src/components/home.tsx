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
		if (isNewProject) return;
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
						<div
							className={`w-120 bg-[var(--primary-color)] rounded-xl px-6 flex flex-col transition-all duration-300 ease-in-out
								${isNewProject ? "h-120 justify-center items-center" : "h-50 justify-end"}
							`}
							onClick={!isNewProject ? handleNewProjectUI : undefined}
							style={{ cursor: isNewProject ? "default" : "pointer" }}
						>
							<div className="relative w-full h-full flex flex-col items-center justify-center">
								{isNewProject && (
									<button
										className="absolute top-4 right-4 z-10"
										onClick={(e) => {
											e.stopPropagation();
											setIsNewProject(false);
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-8 h-8"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								)}
								<p
									className={`text-4xl transition-all duration-200
										${isNewProject ? "mt-12 mb-6" : "mt-24"}
									`}
								>
									Create a new Project
								</p>
								<div
									className={`transition-all duration-500 overflow-hidden w-full
										${isNewProject ? "opacity-100 max-h-[500px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none"}
									`}
								>
									{isNewProject && (
										<ProjectCreator />
									)}
								</div>
							</div>
						</div>

						<div className="w-110 h-50 bg-[var(--secondary-color)] rounded-xl px-6 pt-18 flex items-end">
							<p className="text-4xl my-8 text-gray-300">
								Load an existing Project
							</p>
						</div>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "8px",
						flexDirection: "column",
					}}
				></div>
				<div>
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
											handleDeleteProject(project.path)
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
			</div>
		)
	);
}
