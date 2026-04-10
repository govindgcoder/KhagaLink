import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
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
  deleteProject: (path: string) => void;
  validateProjectPaths: (project: Project[]) => void;
}

export interface GraphWidget {
  id: string;
  x_col_idx: number;
  y_col_idx: number;
  name: string;
  data: { x: number; y: number }[];
}

interface MapConfig {
  latCol: number;
  longCol: number;
  enabled: boolean;
}

interface QuaternionConfig {
  wCol: number; xCol: number; yCol: number; zCol: number;
  enabled: boolean;
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
  delCsvFromList: (path: string) => Promise<void>;

  csvGraphs: GraphWidget[];
  telemetryGraphs: GraphWidget[];
  addCsvGraph: () => void;
  addTelemetryGraph: () => void;
  removeCsvGraph: (id: string) => void;
  removeTelemetryGraph: (id: string) => void;
  updateGraphData: (
    id: string,
    xCol: number,
    yCol: number,
    targetCsvPath: string,
    context: string,
  ) => Promise<void>;
  connectToHardware: (port: string, baud: number) => Promise<void>;
  telemetryHeaders: string[];
  
  telemetryMapConfig: MapConfig;
  setMapConfig: (config: Partial<MapConfig>) => void;
  latestPosition: { lat: number; lng: number } | null;
  
  telemetryQuatConfig: QuaternionConfig;
  setQuatConfig: (config: Partial<QuaternionConfig>) => void;
  latestQuaternion: { w: number; x: number; y: number; z: number };
  
}

interface CSVmetadata {
  headers: string[];
  total_rows: number;
}

let unlistenTelemetry: (() => void) | null = null;

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
      /* create a new project array without the given project based on it's path */
      deleteProject: async (path: string) => {
        await invoke("delete_project", { path: path });
        set({
          projects: get().projects.filter((project) => project.path !== path),
        });
      },

      validateProjectPaths: async () => {
        for (const project of get().projects) {
          const response = await invoke("check_path_exists", {
            path: project.path,
          });
          if (response == false) {
            set({
              projects: get().projects.filter((p) => p.path !== project.path),
            });
          }
        }
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

      currentCSVmetadata: null,

      telemetryHeaders: [],
      telemetryMapConfig: {latCol: 0, longCol: 0, enabled: false},
      latestPosition: null,
      
      telemetryQuatConfig: {wCol: 0, xCol: 0, yCol: 0, zCol: 0, enabled: false},
      latestQuaternion: {w: 1, x: 0, y: 0, z: 0},

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

      loadCSVmetadata: async (path: string) => {
        try {
          const new_csv_metadata = await invoke<CSVmetadata>(
            "get_csv_metadata",
            { path },
          );

          set({ currentCSVmetadata: new_csv_metadata, error: null });
        } catch (err) {
          console.log("Error in loading csv metadata: ", err);
          set({ error: err });
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

        const updated_project = {
          ...current_project,
          csv_files: [...current_project.csv_files, { path, is_visible: true }],
        };

        set({ current_project: updated_project });
        await invoke("save_project", { project: updated_project });
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
      },

      csvGraphs: [],
      telemetryGraphs: [],

      addCsvGraph: () => {
        const newGraph: GraphWidget = {
          id: crypto.randomUUID(),
          x_col_idx: 0,
          y_col_idx: 0,
          name: "New Graph",
          data: [],
        };
        set({ csvGraphs: [...get().csvGraphs, newGraph] });
      },

      addTelemetryGraph: () => {
        const newGraph: GraphWidget = {
          id: crypto.randomUUID(),
          x_col_idx: 0,
          y_col_idx: 0,
          name: "New Graph",
          data: [],
        };
        set({ telemetryGraphs: [...get().telemetryGraphs, newGraph] });
      },

      removeTelemetryGraph: (id: string) => {
        set({
          telemetryGraphs: get().telemetryGraphs.filter(
            (graph) => graph.id !== id,
          ),
        });
      },

      removeCsvGraph: (id: string) => {
        set({
          csvGraphs: get().csvGraphs.filter((graph) => graph.id !== id),
        });
      },

      updateGraphData: async (id, xCol, yCol, path, context) => {
        const key = context === "csv" ? "csvGraphs" : "telemetryGraphs";

        // Optimistically update dropdowns
        set({
          [key]: get()[key].map((g) =>
            g.id === id ? { ...g, x_col_idx: xCol, y_col_idx: yCol } : g,
          ),
        });

        if (!path || path === "LIVE") return;

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
          set({
            [key]: get()[key].map((g) => (g.id === id ? { ...g, data } : g)),
          });
        } catch (e) {
          console.error("Graph error:", e);
        }
      },
      
      setMapConfig: (mapCfg: Partial<MapConfig>) => {
        set({ telemetryMapConfig: { ...get().telemetryMapConfig, ...mapCfg } });
      },
      
      setQuatConfig: (quatCfg: Partial<QuaternionConfig>) => {
        set({ telemetryQuatConfig: { ...get().telemetryQuatConfig, ...quatCfg } });
      },

      connectToHardware: async (port: string, baud: number) => {
        set({
          telemetryGraphs: get().telemetryGraphs.map((g) => ({
            ...g,
            data: [],
          })),
        });

        if (unlistenTelemetry) {
          unlistenTelemetry();
          unlistenTelemetry = null;
        }
        try {
          // to start the background thread by Rust
          const response = await invoke("start_telemetry_stream", {
            portName: port,
            baudRate: baud,
          });
          console.log("Hardware:", response);
          alert(response);
          // listen to this packet
          unlistenTelemetry = await listen<string>(
            "telemetry-packet",
            (event) => {
              const stringVals = event.payload.split(",");
              const parsedValues = stringVals.map((num) =>
                parseFloat(num.trim()),
              );
              
              const mapCfg = get().telemetryMapConfig;
              
              if (mapCfg.enabled) {
                const lat = parsedValues[mapCfg.latCol];
                const lng = parsedValues[mapCfg.longCol];
                if (!isNaN(lat) && !isNaN(lng)) {
                  set({ latestPosition: { lat, lng } });
                }
              }
              
              const quatCfg = get().telemetryQuatConfig;
              if (quatCfg.enabled) {
                set({
                  latestQuaternion: {
                    w: parsedValues[quatCfg.wCol] ?? 1,
                    x: parsedValues[quatCfg.xCol] ?? 0,
                    y: parsedValues[quatCfg.yCol] ?? 0,
                    z: parsedValues[quatCfg.zCol] ?? 0,
                  }
                });
              }
              
              const MAX_POINTS = 1000;

              if (get().telemetryHeaders.length === 0) {
                const inferredHeaders = parsedValues.map(
                  (_, i) => `Field ${i}`,
                );
                set({ telemetryHeaders: inferredHeaders });
              }

              set((state) => {
                //for new array
                const updatedGraphs = state.telemetryGraphs.map(
                  (graph: GraphWidget) => {
                    const currentX = parsedValues[graph.x_col_idx] || 0;
                    const currentY = parsedValues[graph.y_col_idx] || 0;

                    // Create a brand new data array
                    const newData = [
                      ...graph.data,
                      { x: currentX, y: currentY },
                    ].slice(-MAX_POINTS);

                    // Return a brand new graph object
                    return { ...graph, data: newData };
                  },
                );

                // Return a brand new state object
                return { telemetryGraphs: updatedGraphs };
              });
            },
          );
        } catch (err) {
          console.error("Hardware Connection Failed:", err);
          alert(`Hardware Error: ${err}`);
          const state = get();
          set({
            telemetryGraphs: state.telemetryGraphs.map((g) => ({
              ...g,

              data: [],
            })),
          });
        }
      },
    }),
    {
      name: "project-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        current_project: state.current_project,
        csvGraphs: state.csvGraphs,
      }),
    },
  ),
);
