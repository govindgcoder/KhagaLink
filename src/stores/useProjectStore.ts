import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

type view = "Home" | "Project";

interface CsvFileConfig {
	path: string;
	is_visible: boolean;
}

interface Project {
	name: string;
	path: string;
	created_at: string;
	csv_files: CsvFileConfig[];
}

interface ProjectList {
	projects: Project[];
	addProject: (project: Project) => void;
}

interface ProjectState {
	current_view: view | null;
	load_view: (view: view) => void;
	current_project: Project | null;
	error: any | null;
	currentCSVmetadata: CSVmetadata | null;
	createProject: (path: string, name: string) => Promise<void>;
	loadCSVmetadata: (path: string) => Promise<void>;

	currentCSVrows: string[][] | null;
	loadCSVrows: (
		path: string,
		start_size: number,
		window_size: number,
	) => Promise<void>;
	loadProject: (path: string) => Promise<void>;
	addCsvToList: (path: string) => Promise<void>;
}

interface CSVmetadata {
	headers: string[];
	total_rows: number;
}

export const useGlobalStore = create<ProjectList>()(
	persist(
		(set, get) => ({
			// initial state
			projects: [],

			//action to update the state
			addProject: (project: Project) => {
				for (const existingProject of get().projects) {
					if (existingProject.path === project.path) {
						return;
					}
				}
				set({ projects: [...get().projects, project] });
			},
		}),
		{
			name: "project-list-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

export const useProjectStore = create<ProjectState>()(
	persist(
		(set, get) => ({
			current_view: "Home",
			load_view: (view: view) => set({ current_view: view }),

			current_project: null,
			error: null,

			createProject: async (path: string, name: string) => {
				try {
					const existingProject = useGlobalStore
						.getState()
						.projects.find((project) => project.path === path);

					if (existingProject) {
						set({ current_project: existingProject, error: null });
						alert("A project already exists here!");
						return;
					}

					const response = await invoke("create_project", {
						path: path,
						name: name,
					});

					const new_project: Project = {
						name: name,
						path: path.endsWith("/project.json")
							? path.replace("/project.json", "")
							: path,
						created_at: new Date().toString(),
						csv_files: [],
					};

					set({ current_project: new_project, error: null });
					useGlobalStore.getState().addProject(new_project);
					console.log(response);
				} catch (err) {
					console.error("Failed to create a new project", err);
					set({ error: err });
				}
			},

			currentCSVmetadata: null,

			loadCSVmetadata: async (path: string) => {
				try {
					const new_csv_metadata = await invoke<CSVmetadata>(
						"get_csv_metadata",
						{ path },
					);

					set({ currentCSVmetadata: new_csv_metadata, error: null });
					console.log("Recieved: ", new_csv_metadata);
				} catch (err) {
					console.log("Error in loading csv metadata: ", err);
					set({ error: err });
				}
			},

			currentCSVrows: null,

			loadCSVrows: async (
				path: string,
				start_index: number,
				window_size: number,
			) => {
				try {
					const current_rows = await invoke<string[][]>("get_csv_rows", {
						path: path,
						startIndex: start_index,
						windowSize: window_size,
					});
					set({ currentCSVrows: current_rows, error: null });
					console.log("csv rows recieved!", start_index, ":", window_size);
				} catch (err) {
					console.error("Error in loading csv rows: ", err);
					set({ error: err });
				}
			},

			loadProject: async (path: string) => {
				try {
					set({ currentCSVmetadata: null, currentCSVrows: null });
					const project = await invoke<Project>("load_project", {
						path: `${path}/project.json`,
					});
					set({ current_project: project });
				} catch (err) {
					console.error("File not found: ", err);
				}
			},

			addCsvToList: async (path: string) => {
				const current_project = get().current_project;
				if (!current_project) return;
				for (const csvPath of current_project.csv_files) {
					if (csvPath.path === path) return;
				}
				const updated_csv_files = [
					...current_project.csv_files,
					{ path: path, is_visible: true },
				];
				const updated_project = {
					...current_project,
					csv_files: updated_csv_files,
				};
				set({
					current_project: updated_project,
				});
				await invoke("save_project", {
					project: updated_project,
				});
			},
		}),
		{
			name: "project-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				current_project: state.current_project,
				// Optionally, persist other fields as needed
			}),
		},
	),
);
