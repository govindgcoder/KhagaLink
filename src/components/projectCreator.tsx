import { useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";

interface ProjectCreatorProps {
  onClose: () => void;
}

export default function ProjectCreator({ onClose }: ProjectCreatorProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  const createProject = useProjectStore((state) => state.createProject);
  const loadView = useProjectStore((state) => state.load_view);

  const handleCreate = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }
    if (!path) {
      alert("Please select a folder");
      return;
    }
    await createProject(path, name);
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
        Create a new Project
      </h3>
      <fieldset className="space-y-2">
        <label className="block mb-2 text-slate-200">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-600 bg-slate-700 text-slate-100 rounded px-2 py-1 w-full"
        />

        <label className="block mb-2 text-slate-200">Path:</label>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={path}
            readOnly
            placeholder="Select a folder..."
            className="border border-slate-600 bg-slate-700 text-slate-100 rounded px-2 py-1 flex-grow"
          />
          <button
            onClick={handleBrowse}
            className="bg-[var(--primary-color)] text-white px-4 py-1 rounded hover:bg-indigo-500 transition-colors"
          >
            Browse
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-green-600 text-white px-6 py-1 rounded-lg hover:bg-green-500 transition-colors"
        >
          Create Project
        </button>
      </fieldset>
    </div>
  );
}
