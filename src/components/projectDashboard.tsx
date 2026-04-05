import { useState, useEffect } from "react";
import CsvVisualizer from "./csvVisualizer";
import Telemetry from "./telemetry"
import { useProjectStore } from "../stores/useStore";

export default function ProjectDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const currentProject = useProjectStore((state) => state.current_project);
    const loadView = useProjectStore((state) => state.load_view);

    const [selectedTab, setSelectedTab] = useState("csv");

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsSidebarOpen(false);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const handleToggleSideBar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleExit = () => {
        loadView("Home");
    }

    return (
        <div className="size-full">
            <div className="project-dashboard-layout bg-[var(--secondary-color)] p-4 w-screen h-screen flex">
                <div
                    id="sidebar"
                    className={`h-full ${isSidebarOpen ? "w-42" : "w-12"} bg-[var(--secondary-color)] transition-all duration-150 ease-in-out mr-3`}
                >
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-start py-2">
                                <button
                                    type="button"
                                    className="mx-1 p-1 rounded hover:bg-white/10 active:scale-95 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/30"
                                    onClick={handleExit}
                                    aria-label="Exit Project"
                                >
                                     
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                                                    </button>
                                <p className="text-2xl truncate">
                                    {currentProject&&isSidebarOpen ? currentProject.name : ""}
                                </p>
                               
                            </div>
                            <div className="mt-8 flex flex-col gap-3 px-1">
                                <button
                                    type="button"
                                    className="
                                    bg-[var(--background-color)]
                             w-full text-xl rounded py-2 hover:bg-white/5 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20"
                                    onClick={() => setSelectedTab("csv")}
                                >
                                    csv
                                </button>
                                <button
                                    type="button"
                                    className={`
                                    bg-[var(--background-color)]
                         w-full text-xl rounded py-2 hover:bg-white/5 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20`}
                                    onClick={() => setSelectedTab("tele")}
                                >
                                    tele
                                </button>
                            </div>
                            
                        </div>
                        
                        <div className="w-full h-full" onClick={handleToggleSideBar}>
                            
                        </div>
                    </div>
                </div>
                <div
                    id="main-csv-content"
                    className="w-full bg-[var(--background)] flex-1 transition-colors duration-150 ease-in-out min-w-0"
                >
                    {selectedTab == "csv" ?
                    <CsvVisualizer /> :
                    <Telemetry/>}
                </div>
            </div>
        </div>
    );
}
