import { useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";

const normalizePath = (p: string) =>
  p
    .replace(/\\/g, "/")
    .replace(/\/+$/, "")
    .replace(/\/project\.json$/, "");

interface ProjectLoaderProps {
  onClose: () => void;
}

export default function ProjectLoader({ onClose }: ProjectLoaderProps) {
  const [path, setPath] = useState("");

  const loadProject = useProjectStore((state) => state.loadProject);
  const loadView = useProjectStore((state) => state.load_view);

  const handleLoadProject = async (path: string) => {
    if (!path) {
      alert("Please select a project file");
      return;
    }
    const normalizedPath = normalizePath(path);
    const success = await loadProject(normalizedPath);
    if (!success) {
      alert(
        "Failed to load project. The folder may not contain a valid project.",
      );
      return;
    }
    loadView("Project");
    onClose();
  };

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select one folder",
      });
      if (selected) {
        setPath(selected);
      }
    } catch (err) {
      console.log("Failed to open dialog: ", err);
    }
  };

  return (
    <div className="p-6 rounded-lg max-w-lg mx-auto bg-slate-800">
      <h3 className="text-xl mb-6 font-semibold text-violet-300">
        Load an existing Project
      </h3>
      <fieldset className="space-y-6">
        <label className="block mb-2 text-slate-200">Path:</label>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={path}
            readOnly
            placeholder="Select a folder..."
            className="border border-slate-600 bg-slate-700 text-slate-100 rounded px-2 pt-1 flex-grow"
          />
          <button
            onClick={handleBrowse}
            className="bg-[var(--primary-color)] text-white px-4 pt-1 rounded hover:bg-indigo-500 transition-colors"
          >
            Browse
          </button>
        </div>

        <button
          onClick={() => handleLoadProject(path)}
          className="mt-2 bg-green-600 text-white px-6 py-1 rounded-lg hover:bg-green-500 transition-colors"
        >
          Load Project
        </button>
      </fieldset>
    </div>
  );
}
