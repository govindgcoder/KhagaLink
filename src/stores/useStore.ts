import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

type view = "Home" | "Project";

const normalizePath = (p: string) =>
  p
    .replace(/\\/g, "/")
    .replace(/\/+$/, "")
    .replace(/\/project\.json$/, "");

interface CsvFileConfig {
  path: string;
  is_visible: boolean;
}

interface GraphWidgetConfig {
  id: string;
  x_col_idx: number;
  y_col_idx: number;
  name: string;
  csv_path: string;
}

interface Project {
  name: string;
  path: string;
  created_at: string;
  csv_files: CsvFileConfig[];
  csv_graphs: GraphWidgetConfig[];
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
  csv_path?: string;
  data: { x: number; y: number }[];
}

interface MapConfig {
  latCol: number;
  longCol: number;
  enabled: boolean;
}

interface QuaternionConfig {
  wCol: number;
  xCol: number;
  yCol: number;
  zCol: number;
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
  loadProject: (path: string) => Promise<boolean>;
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
  disconnectHardware: () => Promise<void>;
  telemetryHeaders: string[];

  telemetryMapConfig: MapConfig;
  setMapConfig: (config: Partial<MapConfig>) => void;
  latestPosition: { lat: number; lng: number } | null;

  telemetryQuatConfig: QuaternionConfig;
  setQuatConfig: (config: Partial<QuaternionConfig>) => void;
  latestQuaternion: { w: number; x: number; y: number; z: number };

  packetTimestamps: number[];
  packetSequenceNumbers: number[];
  dataRate: number;
  lossRate: number;
  lastSeq: number;
}

interface CSVmetadata {
  headers: string[];
  total_rows: number;
}

let unlistenTelemetry: (() => void) | null = null;
let unlistenDisconnect: (() => void) | null = null;

export const useGlobalStore = create<ProjectList>()(
  persist(
    (set, get) => ({
      // initial state
      projects: [],

      addProject: (project: Project) => {
        const normalizedPath = normalizePath(project.path);

        console.log(
          `[DEBUG] useGlobalStore.addProject: adding/updating project at ${normalizedPath}`,
        );

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
      /* create a new project array without the given project based on it's path */
      deleteProject: async (path: string) => {
        await invoke("delete_project", { path: path });
        set({
          projects: get().projects.filter((project) => project.path !== path),
        });
      },

      validateProjectPaths: async (projects: Project[]) => {
        const invalidPaths: string[] = [];
        for (const project of projects) {
          const response = await invoke("check_path_exists", {
            path: project.path,
          });
          if (response == false) {
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

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      current_view: "Home",
      load_view: (view: view) => {
        if (view === "Home") {
          set({ current_project: null, current_view: view });
        } else {
          set({ current_view: view });
        }
      },

      current_project: null,
      error: null,

      currentCSVmetadata: null,

      telemetryHeaders: [],
      telemetryMapConfig: { latCol: 0, longCol: 0, enabled: false },
      latestPosition: null,

      telemetryQuatConfig: {
        wCol: 0,
        xCol: 0,
        yCol: 0,
        zCol: 0,
        enabled: false,
      },
      latestQuaternion: { w: 1, x: 0, y: 0, z: 0 },

      packetTimestamps: [],
      packetSequenceNumbers: [],
      dataRate: 0,
      lossRate: 0,
      lastSeq: -1,

      createProject: async (path: string, name: string) => {
        try {
          const normalizedPath = path
            .replace(/\\/g, "/")
            .replace(/\/+$/, "")
            .replace(/\/project\.json$/, "");

          const existingProject = useGlobalStore
            .getState()
            .projects.find((project) => {
              const normalized = project.path
                .replace(/\\/g, "/")
                .replace(/\/+$/, "")
                .replace(/\/project\.json$/, "");
              return normalized === normalizedPath;
            });

          if (existingProject) {
            set({ current_project: existingProject, error: null });
            alert("A project already exists here!");
            return;
          }

          const response = await invoke("create_project", {
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
          set({
            currentCSVmetadata: null,
            currentCSVrows: null,
            csvGraphs: [],
          });

          const normalizedPath = path
            .replace(/\\/g, "/")
            .replace(/\/+$/, "")
            .replace(/\/project\.json$/, "");
          const jsonPath = `${normalizedPath}/project.json`;
          console.log("[DEBUG] Loading project file:", jsonPath);
          const project = await invoke<Project>("load_project", {
            path: jsonPath,
          });

          const csvGraphConfigs = project.csv_graphs || [];
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
          };

          set({
            current_project: projectWithCorrectPath,
            csvGraphs: loadedCsvGraphs,
          });

          useGlobalStore.getState().addProject(projectWithCorrectPath);
          return true;
        } catch (err) {
          console.error("Failed to load project: ", err);
          set({ error: err });
          return false;
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
      telemetryGraphs: [],

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
        console.log(
          `[DEBUG - STORE] updateGraphData Called -> id: ${id}, xCol: ${xCol}, yCol: ${yCol}, context: ${context}, path: ${path}`,
        );

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
        } else {
          set({
            telemetryGraphs: get().telemetryGraphs.map((g) =>
              g.id === id ? { ...g, x_col_idx: xCol, y_col_idx: yCol } : g,
            ),
          });
        }

        if (!path || path === "LIVE") {
          console.log(
            `[DEBUG - STORE] Aborting Rust fetch. Path is either empty or LIVE.`,
          );
          return;
        }

        try {
          console.log(
            `[DEBUG - STORE] Invoking Rust 'get_graph_data' with path: ${path}`,
          );
          const data = await invoke<{ x: number; y: number }[]>(
            "get_graph_data",
            {
              path,
              xCol,
              yCol,
              maxPoints: 2000,
            },
          );

          console.log(
            `[DEBUG - STORE] Rust returned successfully! Data length: ${data.length}`,
          );
          if (data.length > 0) {
            console.log(`[DEBUG - STORE] First point preview:`, data[0]);
          }

          if (context === "csv") {
            set({
              csvGraphs: get().csvGraphs.map((g) =>
                g.id === id ? { ...g, data } : g,
              ),
            });
          } else {
            set({
              telemetryGraphs: get().telemetryGraphs.map((g) =>
                g.id === id ? { ...g, data } : g,
              ),
            });
          }
          console.log(`[DEBUG - STORE] Zustand state updated with new data.`);
        } catch (e) {
          console.error("[DEBUG - STORE] CRITICAL ERROR from Rust:", e);
        }
      },

      setMapConfig: (mapCfg: Partial<MapConfig>) => {
        set({ telemetryMapConfig: { ...get().telemetryMapConfig, ...mapCfg } });
      },

      setQuatConfig: (quatCfg: Partial<QuaternionConfig>) => {
        set({
          telemetryQuatConfig: { ...get().telemetryQuatConfig, ...quatCfg },
        });
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
        if (unlistenDisconnect) {
          unlistenDisconnect();
          unlistenDisconnect = null;
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
              const now = Date.now();
              const WINDOW_MS = 5000;

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
                  },
                });
              }

              const seq = parsedValues[0];

              set((state) => {
                const timestamps = [...state.packetTimestamps, now].filter(
                  (t) => now - t < WINDOW_MS,
                );
                const dataRate = (timestamps.length / WINDOW_MS) * 1000;

                const seqNums = [...state.packetSequenceNumbers];
                if (!isNaN(seq)) {
                  seqNums.push(seq);
                }
                const lastFewSeqs = seqNums.slice(-100);
                const totalExpected =
                  lastFewSeqs.length > 0
                    ? lastFewSeqs[lastFewSeqs.length - 1] - lastFewSeqs[0] + 1
                    : 1;
                const lostCount = Math.max(
                  0,
                  totalExpected - lastFewSeqs.length,
                );
                const lossRate =
                  totalExpected > 0 ? (lostCount / totalExpected) * 100 : 0;

                return {
                  packetTimestamps: timestamps,
                  packetSequenceNumbers: seqNums.slice(-100),
                  dataRate,
                  lossRate,
                  lastSeq: !isNaN(seq) ? seq : state.lastSeq,
                };
              });

              const MAX_POINTS = 5000;

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

          unlistenDisconnect = await listen("telemetry-disconnected", () => {
            get().disconnectHardware();
          });
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
      disconnectHardware: async () => {
        try {
          await invoke("stop_telemetry_stream");

          if (unlistenTelemetry) {
            unlistenTelemetry();
            unlistenTelemetry = null;
          }
          set({
            telemetryHeaders: [],
            telemetryGraphs: get().telemetryGraphs.map((g) => ({
              ...g,
              data: [],
            })),
            latestPosition: null,
            latestQuaternion: { w: 1, x: 0, y: 0, z: 0 },
            packetTimestamps: [],
            packetSequenceNumbers: [],
            dataRate: 0,
            lossRate: 0,
            lastSeq: -1,
          });

          alert("Disconnected successfully.");
        } catch (err) {
          console.error("Disconnect failed:", err);
          alert(`Disconnect Error: ${err}`);
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
