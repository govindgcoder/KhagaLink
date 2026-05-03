import { useState, useEffect } from "react";
import CsvVisualizer from "./csvVisualizer";
import Telemetry from "./telemetry";
import LoadingOverlay from "./LoadingOverlay";
import { useProjectStore } from "../stores/useStore";

export default function ProjectDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentProject = useProjectStore((state) => state.current_project);
  const loadView = useProjectStore((state) => state.load_view);

  const [selectedTab, setSelectedTab] = useState("csv");
  const [showLoading, setShowLoading] = useState(false);

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

  const handleTabChange = (tab: string) => {
    if (tab !== selectedTab) {
      setShowLoading(true);
      setTimeout(() => {
        setSelectedTab(tab);
        setShowLoading(false);
      }, 800);
    }
  };

  return showLoading ? (
    <LoadingOverlay text="Loading..." />
  ) : (
    <div className="size-full">
      <div className="min-h-screen w-full text-[var(--text-primary)] flex flex-col md:flex-row bg-[var(--background-color)]">
        <aside
          id="sidebar"
          className={`${
            isSidebarOpen ? "w-full md:w-72" : "w-full md:w-22"
          } shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--background-color)] backdrop-blur-sm px-4 py-6 flex md:h-screen flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4 transition-[width] duration-300 ease-in-out hide-scrollbar`}
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div className="w-full h-full flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4">
            <div
              className={`flex items-center ${
                isSidebarOpen
                  ? "justify-start w-full gap-3"
                  : "w-[52px] justify-start"
              } min-w-0`}
            >
              <button
                type="button"
                className="p-2 w-[52px] flex justify-center rounded-xl hover:bg-[rgba(255,255,255,0.1)] border border-[var(--border-color)] transition-colors duration-150 ease-in-out shrink-0"
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
                <h2 className="text-xl font-bold text-violet-400 tracking-wide truncate min-w-0">
                  {currentProject ? currentProject.name : ""}
                </h2>
              )}
            </div>

            <div className="md:mt-6 flex md:flex-col gap-3 w-full md:w-full h-full">
              {[
                { key: "csv", label: "CSV visualizer" },
                { key: "tele", label: "Telemetry" },
                { key: "ai", label: "AI Analysis" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={`rounded-xl px-4 py-3 transition-colors ${
                    isSidebarOpen
                      ? "w-full text-left"
                      : "w-[52px] flex justify-center"
                  } ${
                    isTabActive(key)
                      ? "bg-[var(--accent-color)] text-[var(--text-primary)]"
                      : "bg-[var(--secondary-color)] hover:opacity-90"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0 flex items-center justify-center">
                      {key === "tele" ? (
                        <svg
                          xmlns="http://w3.org"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="#e3e3e3"
                        >
                          <path d="M576-48v-72q109-2 186-78.5T840-384h72q0 70-26.6 131.13-26.6 61.14-71.87 106.4-45.26 45.27-106.4 71.87Q646-48 576-48Zm0-144v-72q50-1 85-35.71T696-384h72q0 80-56.16 136T576-192ZM224.5-51Q211-51 198-56t-24-16L21-225q-11-11-16-24t-5-26.5q0-14.4 5-27.45Q10-316 21-327l136-135q21-22 51-22t51 22l59 59 34-34-59-59q-22-20.93-22-50.97Q271-577 293-598l67-68q20.7-22 50.85-22Q441-688 462-666l60 60 34-34-60-60q-22-20.7-22-50.85Q474-781 496-802l136-136q11-11 24-16t27-5q14 0 27 5t24 16l153 153q11 11 16 24.05t5 27.45q0 13.5-5.02 26.71Q897.96-693.57 887-683L751-547q-20.7 22-50.85 22Q670-525 649-547l-60-60-34 34 60 60q22 21 22 51t-22 51l-68 67q-20.7 22-50.85 22Q466-322 445-344l-59-59-34 34 59 59q22 21 22 51t-22 51L276-72q-11 11-24.05 16t-27.45 5Zm.5-72 51-51-153-153-51 51 153 153Zm85-85 50-51-152-152-51 50 153 153Zm186-187 68-67-153-153-67 68 152 152Zm204-203 51-51-153-153-51 51 153 153Zm85-85 51-51-153-153-51 51 153 153ZM456-504Z" />
                        </svg>
                      ) : key == "csv" ? (
                        <svg
                          xmlns="http://w3.org"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="#e3e3e3"
                        >
                          <path d="M288-384h72v-48h-72v-96h72v-48h-72q-20.4 0-34.2 13.8Q240-548.4 240-528v96q0 20.4 13.8 34.2Q267.6-384 288-384Zm120 0h96q10.2 0 17.1-6.9 6.9-6.9 6.9-17.1v-72q0-10-6.9-17t-17.1-7h-48v-24h72v-48h-96q-10.2 0-17.1 6.9-6.9 6.9-6.9 17.1v72q0 10 6.9 17t17.1 7h48v24h-72v48Zm208 0h48l56-192h-50l-30 103-30-103h-50l56 192ZM168-192q-29.7 0-50.85-21.16Q96-234.32 96-264.04v-432.24Q96-726 117.15-747T168-768h624q29.7 0 50.85 21.16Q864-725.68 864-695.96v432.24Q864-234 842.85-213T792-192H168Zm0-72h624v-432H168v432Z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="#e3e3e3"
                        >
                          <path d="M815-245 707-353l51-51 108 108-51 51ZM685-677l-51-50 108-108 51 51-108 107Zm-410 0L167-785l51-51 108 108-51 51ZM145-245l-51-51 108-107 51 50-108 108Zm207-49 128-76 129 76-34-144 111-95-147-13-59-137-59 137-147 13 112 95-34 144ZM243-145l63-266L96-590l276-24 108-251 108 252 276 23-210 179 63 266-237-141-237 141Zm237-344Z" />
                        </svg>
                      )}
                    </div>

                    <span
                      className={`text-xs whitespace-nowrap transition-all duration-300 ${
                        isSidebarOpen
                          ? "opacity-100 max-w-[200px]"
                          : "opacity-0 max-w-0 overflow-hidden"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={handleExit}
                className={`mt-auto rounded-xl px-4 py-3 border transition-colors bg-[var(--tertiary-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--tertiary-color)]/20 ${
                  isSidebarOpen
                    ? "w-full text-left"
                    : "w-[52px] flex justify-center"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    xmlns="http://w3.org"
                    height="20"
                    width="20"
                    viewBox="0 -960 960 960"
                    fill="#e3e3e3"
                    className="shrink-0"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-160h80v160h560v-560H200v160h-80v-160q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm220-160-56-58 102-102H120v-80h346L364-622l56-58 200 200-200 200Z" />
                  </svg>

                  <span
                    className={`text-xs whitespace-nowrap transition-all duration-300 ${
                      isSidebarOpen
                        ? "opacity-100 max-w-[200px]"
                        : "opacity-0 max-w-0 overflow-hidden"
                    }`}
                  >
                    Exit
                  </span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <main
          id="main-csv-content"
          className="relative h-screen flex-1 overflow-auto bg-[var(--background-color)]"
        >
          {selectedTab === "csv" ? (
            <CsvVisualizer />
          ) : selectedTab === "tele" ? (
            <Telemetry />
          ) : (
            <>
              <div className="flex size-full justify-center items-center">
                Under Construction
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
