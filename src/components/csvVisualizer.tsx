import { useState } from "react";
import { useProjectStore } from "../stores/useProjectStore";
import { open } from "@tauri-apps/plugin-dialog";

export default function CsvVisualizer() {
    const [path, setPath] = useState("");

    const metadata = useProjectStore((state) => state.currentCSVmetadata);

    const loadCSVmetadata = useProjectStore((state) => state.loadCSVmetadata);
    // if (!metadata) {
    //     return <div>No CSV loaded</div>;
    // }
    
    const handleView = () => {
        loadCSVmetadata(path);
    }
    
    const handleBrowse = async () => {
        try {
            const selected = await open({
                directory: false,
                multiple: false,
                title: "Select a csv file",
            });
            if (selected) {
                setPath(selected);
            }
            
        } catch (err) {
            console.log("Failed to open dialog: ", err);
        }
    };

    return (
        <div className="p-4 border mt-4">
            <h2 className="text-xl font-bold">CSV Analysis</h2>
            <div style={{ display: "flex", gap: "8px" }}>
                <input
                    type="text"
                    value={path}
                    readOnly
                    placeholder="Select a folder..."
                />
                <button onClick={handleBrowse}>Browse</button>
                <button onClick={handleView}>View</button>
            </div>
            <p>Total Rows: {metadata == null ? 0 : metadata.total_rows}</p>

            <h3 className="font-bold mt-2">Columns:</h3>
            <ul className="list-disc pl-5">
                {metadata
                    ? metadata.headers.map((header, index) => (
                          <li key={index}>{header}</li>
                      )) : null}
            </ul>
        </div>
    );
}
