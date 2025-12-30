import "react";
import { useEffect, useState } from "react";
import ProjectLoader from "./projectLoader";
import ProjectCreator from "./projectCreator";
import { useGlobalStore, useProjectStore } from "../stores/useStore";

export default function Home() {
	const [isNewProject, setIsNewProject] = useState(false);
	const [isLoadProject, setIsLoadProject] = useState(false);

	const [path, setPath] = useState("");

	const projectList = useGlobalStore((state) => state.projects);

	const deleteProject = useGlobalStore((state) => state.deleteProject);

	const loadProject = useProjectStore((state) => state.loadProject);

	useEffect(() => {
		useGlobalStore.getState().validateProjectPaths();
	}, []);

	const handleLoadProject = (pathURL: string) => {
		if (!pathURL) {
			alert("Please select a project file");
			return;
		}
		loadProject(pathURL);
		loadView("Project");
	};

	const loadView = useProjectStore((state) => state.load_view);

	const handleNewProjectUI = () => {
		if (isNewProject) return;
		setIsNewProject(!isNewProject);
	};

	const handleLoadProjectUI = () => {
		if (isLoadProject) return;
		setIsLoadProject(!isLoadProject);
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
			<div className="py-10 px-14 mt-4 " style={{ minWidth: "800px" }}>
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
							onClick={
								!isNewProject ? handleNewProjectUI : undefined
							}
							style={{
								cursor: isNewProject ? "default" : "pointer",
							}}
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
									{isNewProject && <ProjectCreator />}
								</div>
							</div>
						</div>

						<div
							className={`w-120 bg-[var(--secondary-color)] rounded-xl px-6 flex flex-col transition-all duration-300 ease-in-out
								${isLoadProject ? "h-100 justify-center items-center" : "h-50 justify-end"}
							`}
							onClick={
								!isLoadProject ? handleLoadProjectUI : undefined
							}
							style={{
								cursor: isLoadProject ? "default" : "pointer",
							}}
						>
							<div className="relative w-full h-full flex flex-col items-center justify-center">
								{isLoadProject && (
									<button
										className="absolute top-4 right-4 z-10"
										onClick={(e) => {
											e.stopPropagation();
											setIsLoadProject(false);
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
										${isLoadProject ? "mt-12 mb-6" : "mt-24"}
									`}
								>
									Load an existing Project
								</p>
								<div
									className={`transition-all duration-500 overflow-hidden w-full
										${isLoadProject ? "opacity-100 max-h-[500px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none"}
									`}
								>
									{isLoadProject && <ProjectLoader />}
								</div>
							</div>
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
					<div className="border border-black mt-12 p-4 flex gap-4 flex-wrap">
						{projectList.length > 0 ? (
							projectList.map((project) => (
								<div
									className="
									h-40 min-w-3xs w-fit
									px-16
									flex items-center bg-violet-400
									rounded-2xl
									text-3xl
									"
								>
									{project.name}
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
