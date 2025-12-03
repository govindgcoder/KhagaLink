import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface Project {
    name: string;
    created_at: string;
    csv_files: any[];
}

interface ProjectState {
    current_project: Project | null;
    error: any | null;
    createProject: (path: string, name: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    current_project: null,
    error: null,

    createProject: async (path: string, name: string) => {
        try {
            const response = await invoke("createProject", {
                path: path,
                name: name,
            });

            const new_project: Project = {
                name: name,
                created_at: new Date().toString(),
                csv_files: [],
            };

            set({ current_project: new_project, error: null });
            console.log(response);
        } catch (err) {
            console.error("Failed to create a new project", err);
            set({ error: err });
        }
    },
}));
