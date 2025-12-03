import { useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { open } from '@tauri-apps/plugin-dialog';

export default function ProjectCreator(){
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    
    const createProject = useProjectStore((state)=> state.createProject)
    
    const handleCreate = ()=>{
        createProject(path, name)
    }
    
    const handleBrowse = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: "Select one folder"
            });
            if (selected) {
                setPath(selected)
            }
        } catch(err) {
            console.log("Failed to open dialog: ", err)
        }
    }
    
    return (
            <div className="overlay-container">
                <fieldset>
                    <label style={{ margin: "8px" }}>Name:</label>
                    <input 
                        type='text' 
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                    />
                    
                    <label style={{ margin: "8px" }}>Path:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type='text' 
                            value={path}
                            readOnly
                            placeholder="Select a folder..."
                        />
                        <button onClick={handleBrowse}>Browse</button>
                    </div>
    
                    <button 
                        onClick={handleCreate}
                        style={{ marginTop: '16px' }}
                    >
                        Create Project
                    </button>
                </fieldset>
            </div>
        );
}