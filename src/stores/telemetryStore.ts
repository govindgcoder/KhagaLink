import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { GraphWidget, MapConfig, QuaternionConfig } from "./types";

let unlistenTelemetry: (() => void) | null = null;
let unlistenDisconnect: (() => void) | null = null;

interface TelemetryState {
  telemetryGraphs: GraphWidget[];
  addTelemetryGraph: () => void;
  removeTelemetryGraph: (id: string) => void;
  updateTelemetryGraphData: (id: string, xCol: number, yCol: number) => void;

  telemetryHeaders: string[];
  telemetryDataLog: string[][];
  connectToHardware: (port: string, baud: number) => Promise<void>;
  isConnected: boolean;
  disconnectHardware: () => Promise<void>;

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

export const useTelemetryStore = create<TelemetryState>()((set, get) => ({
  telemetryGraphs: [],
  isConnected: false,

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
      telemetryGraphs: get().telemetryGraphs.filter((graph) => graph.id !== id),
    });
  },

  updateTelemetryGraphData: (id: string, xCol: number, yCol: number) => {
    set({
      telemetryGraphs: get().telemetryGraphs.map((g) =>
        g.id === id ? { ...g, x_col_idx: xCol, y_col_idx: yCol } : g,
      ),
    });
  },

  telemetryHeaders: [],
  telemetryDataLog: [],

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
      const response = await invoke("start_telemetry_stream", {
        portName: port,
        baudRate: baud,
      });
      set({ isConnected: true });
      alert(response);

      unlistenTelemetry = await listen<string>("telemetry-packet", (event) => {
        const now = Date.now();
        const WINDOW_MS = 5000;

        const stringVals = event.payload.split(",");
        const parsedValues = stringVals.map((num) => parseFloat(num.trim()));

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
          const lostCount = Math.max(0, totalExpected - lastFewSeqs.length);
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
          const inferredHeaders = parsedValues.map((_, i) => `Field ${i}`);
          set({ telemetryHeaders: inferredHeaders });
        }

        set((state) => {
          const updatedGraphs = state.telemetryGraphs.map(
            (graph: GraphWidget) => {
              const currentX = parsedValues[graph.x_col_idx] || 0;
              const currentY = parsedValues[graph.y_col_idx] || 0;

              const newData = [
                ...graph.data,
                { x: currentX, y: currentY },
              ].slice(-MAX_POINTS);

              return { ...graph, data: newData };
            },
          );

          return {
            telemetryGraphs: updatedGraphs,
            telemetryDataLog: [...state.telemetryDataLog, stringVals].slice(
              -10000,
            ),
          };
        });
      });

      unlistenDisconnect = await listen("telemetry-disconnected", () => {
        get().disconnectHardware();
      });
    } catch (err) {
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
        telemetryDataLog: [],
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
      set({ isConnected: false });
    } catch (err) {
      alert(`Disconnect Error: ${err}`);
    }
  },

  telemetryMapConfig: { latCol: 0, longCol: 0, enabled: false },
  setMapConfig: (mapCfg: Partial<MapConfig>) => {
    set({ telemetryMapConfig: { ...get().telemetryMapConfig, ...mapCfg } });
  },
  latestPosition: null,

  telemetryQuatConfig: {
    wCol: 0,
    xCol: 0,
    yCol: 0,
    zCol: 0,
    enabled: false,
  },
  setQuatConfig: (quatCfg: Partial<QuaternionConfig>) => {
    set({
      telemetryQuatConfig: { ...get().telemetryQuatConfig, ...quatCfg },
    });
  },
  latestQuaternion: { w: 1, x: 0, y: 0, z: 0 },

  packetTimestamps: [],
  packetSequenceNumbers: [],
  dataRate: 0,
  lossRate: 0,
  lastSeq: -1,
}));
