import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import type {
  View,
  Project,
  CsvFileConfig,
  GraphWidgetConfig,
  GraphWidget,
  CSVmetadata,
} from "./types";

const normalizePath = (p: string) =>
  p.replace(/\\/g, "/").replace(/\/+$/, "").replace(/\/project\.json$/, "");

interface ProjectListState {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (path: string) => void;
  validateProjectPaths: (projects: Project[]) => Promise<void>;
}

export const useGlobalStore = create<ProjectListState>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (project: Project) => {
        const normalizedPath = normalizePath(project.path);
        const existingIndex = get().projects.findIndex(
          (p) => normalizePath(p.path) === normalizedPath,
        );

        let updatedProjects: Project[];
        if (existingIndex !== -1) {
          updatedProjects = get().projects.map((p, idx) =>
            idx === existingIndex ? project : p,
          );
        } else {
          updatedProjects = [...get().projects, project];
        }

        set({ projects: updatedProjects });
      },

      deleteProject: async (path: string) => {
        try {
          await invoke("delete_project", { path: path });
          set({
            projects: get().projects.filter((project) => project.path !== path),
          });
        } catch (err) {
          alert(`Failed to delete project: ${err}`);
        }
      },

      validateProjectPaths: async (projects: Project[]) => {
        const invalidPaths: string[] = [];
        for (const project of projects) {
          const response = await invoke<boolean>("check_path_exists", {
            path: project.path,
          });
          if (response === false) {
            invalidPaths.push(project.path);
          }
        }
        if (invalidPaths.length > 0) {
          set({
            projects: get().projects.filter(
              (p) => !invalidPaths.includes(p.path),
            ),
          });
        }
      },
    }),
    {
      name: "project-list-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface ProjectState {
  current_view: View | null;
  load_view: (view: View) => void;
  current_project: Project | null;
  error: Error | null;

  currentCSVmetadata: CSVmetadata | null;
  loadCSVmetadata: (path: string) => Promise<void>;

  currentCSVrows: string[][] | null;
  loadCSVrows: (
    path: string,
    start_size: number,
    window_size: number,
  ) => Promise<void>;

  loadProject: (path: string) => Promise<boolean>;
  createProject: (path: string, name: string) => Promise<void>;

  addCsvToList: (path: string) => Promise<void>;
  delCsvFromList: (path: string) => Promise<void>;

  csvGraphs: GraphWidget[];
  addCsvGraph: (csvPath?: string) => Promise<void>;
  removeCsvGraph: (id: string) => void;
  updateGraphData: (
    id: string,
    xCol: number,
    yCol: number,
    csvPath: string,
    context: string,
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      current_view: "Home",

      load_view: (view: View) => {
        if (view === "Home") {
          set({ current_project: null, current_view: view });
        } else {
          set({ current_view: view });
        }
      },

      current_project: null,
      error: null,

      currentCSVmetadata: null,

      loadCSVmetadata: async (path: string) => {
        try {
          const new_csv_metadata = await invoke<CSVmetadata>(
            "get_csv_metadata",
            { path },
          );
          set({ currentCSVmetadata: new_csv_metadata, error: null });
        } catch (err) {
          set({ error: err as Error });
        }
      },

      currentCSVrows: null,

      loadCSVrows: async (
        path: string,
        start_size: number,
        window_size: number,
      ) => {
        try {
          const current_rows = await invoke<string[][]>("get_csv_rows", {
            path: path,
            startIndex: start_size,
            windowSize: window_size,
          });
          set({ currentCSVrows: current_rows, error: null });
        } catch (err) {
          set({ error: err as Error });
        }
      },

      loadProject: async (path: string) => {
        try {
          set({
            currentCSVmetadata: null,
            currentCSVrows: null,
            csvGraphs: [],
          });

          const normalizedPath = normalizePath(path);
          const jsonPath = `${normalizedPath}/project.json`;
          const project = await invoke<Project>("load_project", {
            path: jsonPath,
          });

          const csvGraphConfigs = project.csv_graphs || [];

          const validCsvFiles = await Promise.all(
            (project.csv_files || []).map(async (csv) => {
              const exists = await invoke<boolean>("check_path_exists", {
                path: csv.path,
              });
              return exists ? csv : null;
            }),
          );
          const filteredCsvFiles = validCsvFiles.filter(
            Boolean,
          ) as CsvFileConfig[];

          const loadedCsvGraphs: GraphWidget[] = csvGraphConfigs.map(
            (g: GraphWidgetConfig) => ({
              id: g.id,
              x_col_idx: g.x_col_idx,
              y_col_idx: g.y_col_idx,
              name: g.name,
              csv_path: g.csv_path,
              data: [],
            }),
          );

          const projectWithCorrectPath = {
            ...project,
            path: normalizedPath,
            csv_graphs: csvGraphConfigs,
            csv_files: filteredCsvFiles,
          };

          if (filteredCsvFiles.length !== (project.csv_files || []).length) {
            await invoke("save_project", { project: projectWithCorrectPath });
          }

          set({
            current_project: projectWithCorrectPath,
            csvGraphs: loadedCsvGraphs,
          });

          useGlobalStore.getState().addProject(projectWithCorrectPath);

          for (const graph of loadedCsvGraphs) {
            if (graph.csv_path) {
              get().updateGraphData(
                graph.id,
                graph.x_col_idx,
                graph.y_col_idx,
                graph.csv_path,
                "csv",
              );
            }
          }
          return true;
        } catch (err) {
          set({ error: err as Error });
          return false;
        }
      },

      createProject: async (path: string, name: string) => {
        try {
          const normalizedPath = normalizePath(path);

          const existingProject = useGlobalStore
            .getState()
            .projects.find((project) => {
              const normalized = normalizePath(project.path);
              return normalized === normalizedPath;
            });

          if (existingProject) {
            set({ current_project: existingProject, error: null });
            alert("A project already exists here!");
            return;
          }

          await invoke("create_project", {
            path: normalizedPath,
            name: name,
          });

          const new_project: Project = {
            name: name,
            path: normalizedPath,
            created_at: new Date()
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-"),
            csv_files: [],
            csv_graphs: [],
          };

          set({ current_project: new_project, error: null });
          useGlobalStore.getState().addProject(new_project);
        } catch (err) {
          set({ error: err as Error });
        }
      },

      addCsvToList: async (path: string) => {
        const current_project = get().current_project;
        if (!current_project) return;

        if (!path.endsWith(".csv") && !path.endsWith(".txt")) {
          alert("Please choose a csv/txt file!");
          return;
        }

        for (const csvPath of current_project.csv_files) {
          if (csvPath.path === path) {
            alert("This file has already been selected!");
            return;
          }
        }

        const updated_project = {
          ...current_project,
          csv_files: [...current_project.csv_files, { path, is_visible: true }],
        };

        set({ current_project: updated_project });
        await invoke("save_project", { project: updated_project });
        useGlobalStore.getState().addProject(updated_project);
      },

      delCsvFromList: async (path: string) => {
        const current_project = get().current_project;
        if (!current_project) return;

        const updated_project = {
          ...current_project,
          csv_files: current_project.csv_files.filter(
            (csvPath) => csvPath.path !== path,
          ),
        };

        set({ current_project: updated_project });
        await invoke("save_project", { project: updated_project });
        useGlobalStore.getState().addProject(updated_project);
      },

      csvGraphs: [],

      addCsvGraph: async (csvPath: string = "") => {
        const current_project = get().current_project;
        const defaultCsvPath =
          csvPath || current_project?.csv_files?.[0]?.path || "";

        const newGraph: GraphWidget = {
          id: crypto.randomUUID(),
          x_col_idx: 0,
          y_col_idx: 0,
          name: "New Graph",
          csv_path: defaultCsvPath,
          data: [],
        };

        const updatedGraphs = [...get().csvGraphs, newGraph];
        set({ csvGraphs: updatedGraphs });

        if (current_project) {
          const config: GraphWidgetConfig[] = updatedGraphs.map((g) => ({
            id: g.id,
            x_col_idx: g.x_col_idx,
            y_col_idx: g.y_col_idx,
            name: g.name,
            csv_path: g.csv_path || "",
          }));
          const updatedProject = { ...current_project, csv_graphs: config };
          set({ current_project: updatedProject });
          await invoke("save_project", { project: updatedProject });
          useGlobalStore.getState().addProject(updatedProject);
        }
      },

      removeCsvGraph: (id: string) => {
        const current_project = get().current_project;
        const updatedGraphs = get().csvGraphs.filter(
          (graph) => graph.id !== id,
        );
        set({ csvGraphs: updatedGraphs });

        if (current_project) {
          const config: GraphWidgetConfig[] = updatedGraphs.map((g) => ({
            id: g.id,
            x_col_idx: g.x_col_idx,
            y_col_idx: g.y_col_idx,
            name: g.name,
            csv_path: g.csv_path || "",
          }));
          const updatedProject = { ...current_project, csv_graphs: config };
          set({ current_project: updatedProject });
          invoke("save_project", { project: updatedProject });
          useGlobalStore.getState().addProject(updatedProject);
        }
      },

      updateGraphData: async (id, xCol, yCol, path, context) => {
        if (context === "csv") {
          const current_project = get().current_project;
          set({
            csvGraphs: get().csvGraphs.map((g) =>
              g.id === id
                ? { ...g, x_col_idx: xCol, y_col_idx: yCol, csv_path: path }
                : g,
            ),
          });

          if (current_project) {
            const config: GraphWidgetConfig[] = get().csvGraphs.map((g) => ({
              id: g.id,
              x_col_idx: g.x_col_idx,
              y_col_idx: g.y_col_idx,
              name: g.name,
              csv_path: g.csv_path || "",
            }));
            const updatedProject = { ...current_project, csv_graphs: config };
            set({ current_project: updatedProject });
            invoke("save_project", { project: updatedProject });
            useGlobalStore.getState().addProject(updatedProject);
          }
        }

        if (!path || path === "LIVE") {
          return;
        }

        try {
          const data = await invoke<{ x: number; y: number }[]>(
            "get_graph_data",
            {
              path,
              xCol,
              yCol,
              maxPoints: 2000,
            },
          );

          if (context === "csv") {
            set({
              csvGraphs: get().csvGraphs.map((g) =>
                g.id === id ? { ...g, data } : g,
              ),
            });
          }
        } catch (e) {
          // Silent fail for graph data
        }
      },
    }),
    {
      name: "project-store",
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}),
    },
  ),
);