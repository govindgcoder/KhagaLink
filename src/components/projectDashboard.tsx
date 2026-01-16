import { useState, useEffect } from "react";
import CsvVisualizer from "./csvVisualizer";
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
                                    className="mr-2 p-1 rounded hover:bg-white/10 active:scale-95 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/30"
                                    onClick={handleToggleSideBar}
                                    aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                                >
                                    {isSidebarOpen ? (
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
                                    ) : (
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
                                                d="M10 6l6 6-6 6"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <p className="text-2xl truncate">
                                    {isSidebarOpen ? (currentProject ? currentProject.name : "No project") : null}
                                </p>
                            </div>
                            <div className="mt-8 flex flex-col gap-3 px-1">
                                <button
                                    type="button"
                                    className="border border-white w-full text-xl rounded py-2 hover:bg-white/5 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20"
                                    onClick={() => setSelectedTab("csv")}
                                >
                                    csv
                                </button>
                                <button
                                    type="button"
                                    className="border border-white w-full text-xl rounded py-2 hover:bg-white/5 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20"
                                    onClick={() => setSelectedTab("tele")}
                                >
                                    tele
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="mb-2 border border-red-200 rounded transition-colors duration-150 ease-in-out hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-300"
                            onClick={handleExit}
                        >
                            {isSidebarOpen ? (
                                <div className="flex px-4 items-center gap-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        width="24"
                                        height="24"
                                        fill="#FFFFFF"
                                        style={{ opacity: 1 }}
                                    >
                                        <path d="M13 3v2h2v10h-2v2h4V3zm0 8V9H5.4l4.3-4.3l-1.4-1.4L1.6 10l6.7 6.7l1.4-1.4L5.4 11z" />
                                    </svg>
                                    <p className="text-[18px]">Exit</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center px-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        width="24"
                                        height="24"
                                        fill="#FFFFFF"
                                        style={{ opacity: 1 }}
                                    >
                                        <path d="M13 3v2h2v10h-2v2h4V3zm0 8V9H5.4l4.3-4.3l-1.4-1.4L1.6 10l6.7 6.7l1.4-1.4L5.4 11z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
                <div
                    id="main-csv-content"
                    className="w-full bg-[var(--background)] flex-1 transition-colors duration-150 ease-in-out"
                >
                    <CsvVisualizer />
                </div>
            </div>
        </div>
    );
}
