import { useState, useEffect } from "react";
import CsvVisualizer from "./csvVisualizer";
import Telemetry from "./telemetry";
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
  };

  const isTabActive = (tab: string) => selectedTab === tab;

  return (
    // <div className="size-full">
    //   <div className="project-dashboard-layout bg-[var(--secondary-color)] p-4 w-screen h-screen flex">
    //     <div
    //       id="sidebar"
    //       className={`h-full ${isSidebarOpen ? "w-48" : "w-12"} transition-all duration-150 ease-in-out mr-3`}
    //     >
    //       <div className="flex flex-col justify-between h-full">
    //         <div>
    //           <div className="flex items-start justify-between py-2">
    //             <button
    //               type="button"
    //               className="mx-1 p-1 rounded hover:bg-white/10 active:scale-95 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500"
    //               onClick={handleExit}
    //               aria-label="Exit Project"
    //             >
    //               <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 className="h-6 w-6"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth={2}
    //                   d="M15 19l-7-7 7-7"
    //                 />
    //               </svg>
    //             </button>
    //             <p className="text-xl text-wrap font-semibold truncate text-white">
    //               {currentProject && isSidebarOpen ? currentProject.name : ""}
    //             </p>
    //           </div>
    //           <div className="mt-8 flex flex-col gap-3 px-1">
    //             <button
    //               type="button"
    //               className={`w-full text-2xs rounded py-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20 ${
    //                 isTabActive("csv")
    //                   ? "bg-indigo-400 text-white"
    //                   : "bg-[var(--background-color)] hover:bg-white/5"
    //               }`}
    //               onClick={() => setSelectedTab("csv")}
    //             >
    //               csv
    //             </button>
    //             <button
    //               type="button"
    //               className={`w-full text-2xs rounded py-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20 ${
    //                 isTabActive("tele")
    //                   ? "bg-indigo-400 text-white"
    //                   : "bg-[var(--background-color)] hover:bg-white/5"
    //               }`}
    //               onClick={() => setSelectedTab("tele")}
    //             >
    //               {isSidebarOpen ? "telemetry" : "tele"}
    //             </button>
    //           </div>
    //         </div>

    //         <div
    //           className="w-full h-full cursor-pointer hover:bg-white/5"
    //           onClick={handleToggleSideBar}
    //         ></div>
    //       </div>
    //     </div>
    //     <div
    //       id="main-csv-content"
    //       className="w-full bg-[var(--background)] flex-1 transition-colors duration-150 ease-in-out min-w-0"
    //     >
    //       {selectedTab == "csv" ? <CsvVisualizer /> : <Telemetry />}
    //     </div>
    //   </div>
    // </div>

    <div className="size-full">
      <div className="min-h-screen w-full text-[var(--text-primary)] flex flex-col md:flex-row bg-[var(--background-color)]">
        <aside
          id="sidebar"
          className={`${
            isSidebarOpen ? "w-full md:w-72" : "w-full md:w-22"
          } shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--background-color)] backdrop-blur-sm px-4 py-6 flex md:min-h-screen flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4 transition-all duration-150 ease-in-out`}
        >
          <div className="w-full flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4">
            <div
              className={`flex items-center ${
                isSidebarOpen ? "justify-start gap-3" : "justify-center"
              } w-fit md:w-full`}
            >
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 shrink-0"
                onClick={handleToggleSideBar}
                aria-label="Toggle Sidebar"
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
                    d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                  />
                </svg>
              </button>
              {isSidebarOpen && (
                <h2 className="text-xl font-bold text-violet-400 tracking-wide truncate">
                  {currentProject ? currentProject.name : ""}
                </h2>
              )}
            </div>

            <div className="md:mt-6 flex flex-row md:flex-col gap-3 w-fit md:w-full">
              <button
                type="button"
                className={`rounded-xl px-4 py-3 transition-all font-medium ${
                  isSidebarOpen
                    ? "w-full text-left"
                    : "w-fit md:w-full text-center"
                } ${
                  isTabActive("csv")
                    ? "bg-[var(--accent-color)] text-white"
                    : "bg-[var(--secondary-color)] hover:opacity-90"
                }`}
                onClick={() => setSelectedTab("csv")}
              >
                csv
              </button>

              <button
                type="button"
                className={`rounded-xl px-4 py-3 transition-all font-medium ${
                  isSidebarOpen
                    ? "w-full text-left"
                    : "w-fit md:w-full text-center"
                } ${
                  isTabActive("tele")
                    ? "bg-[var(--accent-color)] text-white"
                    : "bg-[var(--secondary-color)] hover:opacity-90"
                }`}
                onClick={() => setSelectedTab("tele")}
              >
                {isSidebarOpen ? "telemetry" : "tele"}
              </button>

              <button
                type="button"
                className={`rounded-xl px-4 py-3 transition-all font-medium bg-[var(--tertiary-color)] text-[var(--text-secondary)] hover:opacity-90 ${
                  isSidebarOpen
                    ? "w-full text-left"
                    : "w-fit md:w-full text-center"
                }`}
                onClick={handleExit}
              >
                exit
              </button>
            </div>
          </div>

          <div
            className="hidden md:block mt-auto w-full flex-1 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] rounded-xl transition-colors"
            onClick={handleToggleSideBar}
            aria-label="Toggle Sidebar"
          />
        </aside>

        <main
          id="main-csv-content"
          className="relative flex-1 overflow-auto bg-[var(--background-color)]"
        >
          {selectedTab === "csv" ? <CsvVisualizer /> : <Telemetry />}
        </main>
      </div>
    </div>
  );
}
