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
    currentCSVmetadata: CSVmetadata | null;
    createProject: (path: string, name: string) => Promise<void>;
    loadCSVmetadata: (path: string) => Promise<void>;
}

interface CSVmetadata {
    headers: string[];
    total_rows: number;
}

export const useProjectStore = create<ProjectState>((set) => ({
    current_project: null,
    error: null,

    createProject: async (path: string, name: string) => {
        try {
            const response = await invoke("create_project", {
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
    
    currentCSVmetadata: null,
    
    loadCSVmetadata: async (path: string) => {
        try {
            const new_csv_metadata = await invoke<CSVmetadata>("get_csv_metadata", {path})
            
            set({currentCSVmetadata: new_csv_metadata, error: null})
            console.log("Recieved: ",new_csv_metadata)
        } catch (err) {
            console.log("Error in loading csv metadata: ",err)
            set({error: err})
        }
    }
    
}));
