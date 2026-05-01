import "react";
import { useEffect, useState } from "react";
import ProjectLoader from "./projectLoader";
import ProjectCreator from "./projectCreator";
import { useGlobalStore, useProjectStore } from "../stores/useStore";

const normalizePath = (p: string) =>
  p
    .replace(/\\/g, "/")
    .replace(/\/+$/, "")
    .replace(/\/project\.json$/, "");

export default function Home() {
  const [isNewProject, setIsNewProject] = useState(false);
  const [isLoadProject, setIsLoadProject] = useState(false);

  const [path, setPath] = useState("");

  const projectList = useGlobalStore((state) => state.projects);

  const deleteProject = useGlobalStore((state) => state.deleteProject);

  const loadProject = useProjectStore((state) => state.loadProject);

  useEffect(() => {
    useGlobalStore
      .getState()
      .validateProjectPaths(useGlobalStore.getState().projects);
  }, []);

  const handleLoadProject = async (pathURL: string) => {
    if (!pathURL) {
      alert("Please select a project file");
      return;
    }
    const normalizedPath = normalizePath(pathURL);
    await loadProject(normalizedPath);
    loadView("Project");
  };

  const loadView = useProjectStore((state) => state.load_view);

  const handleNewProjectUI = () => {
    if (isNewProject) return;
    setIsNewProject(!isNewProject);
  };

  const handleLoadProjectUI = () => {
    if (isLoadProject) return;
    setIsLoadProject(!isLoadProject);
  };

  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

  const handleMenuTrigger = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    path: string,
  ) => {
    if (e.type === "contextmenu") e.preventDefault();

    // Set position and show custom menu
    setPath(path);
    setMenu({ visible: true, x: e.pageX, y: e.pageY });
  };

  const closeMenu = () => setMenu({ ...menu, visible: false });

  // Close menu when clicking anywhere else
  useEffect(() => {
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleDeleteProject = (path: string) => {
    deleteProject(path);
    alert("project deleted");
    setPath("");
    useGlobalStore
      .getState()
      .validateProjectPaths(useGlobalStore.getState().projects);
  };

  return (
    // check whether both stores have hydrated
    // !useGlobalStore.persist?.hasHydrated?.() ||
    //   !useProjectStore.persist?.hasHydrated?.() ? (
    //   <div className="size-full justify-center items-center">Loading...</div>
    // ) : (
    //   <div className="py-10 px-14 mt-4 " style={{ minWidth: "800px" }}>
    //     {menu.visible && (
    //       <div
    //         className="absolute p-4 bg-white text-red-500"
    //         style={{ left: menu.x, top: menu.y }}
    //       >
    //         <button
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             closeMenu();
    //             handleDeleteProject(path);
    //           }}
    //         >
    //           Delete
    //         </button>
    //       </div>
    //     )}

    //     <h2 className="text-2xl ml-1 text-violet-300 font-bold">KhagaLink</h2>
    //     <h1 className="text-6xl ">Projects</h1>

    //     <div id="rows" className="flex flex-col mt-8">
    //       <div id="create-load-row" className="flex gap-8">
    //         <div
    //           className={`w-120 bg-[var(--primary-color)] rounded-xl px-6 flex flex-col transition-all duration-300 ease-in-out
    // 				${isNewProject ? "h-120 justify-center items-center" : "h-50 justify-end"}
    // 			`}
    //           onClick={!isNewProject ? handleNewProjectUI : undefined}
    //           style={{
    //             cursor: isNewProject ? "default" : "pointer",
    //           }}
    //         >
    //           <div className="relative w-full h-full flex flex-col items-center justify-center">
    //             {isNewProject && (
    //               <button
    //                 className="absolute top-4 right-4 z-10"
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   setIsNewProject(false);
    //                 }}
    //               >
    //                 <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   strokeWidth={1.5}
    //                   stroke="currentColor"
    //                   className="w-8 h-8"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     d="M6 18L18 6M6 6l12 12"
    //                   />
    //                 </svg>
    //               </button>
    //             )}
    //             <p
    //               className={`text-4xl transition-all duration-200
    // 						${isNewProject ? "mt-12 mb-6" : "mt-24"}
    // 					`}
    //             >
    //               Create a new Project
    //             </p>
    //             <div
    //               className={`transition-all duration-500 overflow-hidden w-full
    // 						${isNewProject ? "opacity-100 max-h-[500px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none"}
    // 					`}
    //             >
    //               {isNewProject && <ProjectCreator onClose={() => setIsNewProject(false)}/>}
    //             </div>
    //           </div>
    //         </div>

    //         <div
    //           className={`w-120 bg-[var(--secondary-color)] rounded-xl px-6 flex flex-col transition-all duration-300 ease-in-out
    // 				${isLoadProject ? "h-100 justify-center items-center" : "h-50 justify-end"}
    // 			`}
    //           onClick={!isLoadProject ? handleLoadProjectUI : undefined}
    //           style={{
    //             cursor: isLoadProject ? "default" : "pointer",
    //           }}
    //         >
    //           <div className="relative w-full h-full flex flex-col items-center justify-center">
    //             {isLoadProject && (
    //               <button
    //                 className="absolute top-4 right-4 z-10"
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   setIsLoadProject(false);
    //                 }}
    //               >
    //                 <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   strokeWidth={1.5}
    //                   stroke="currentColor"
    //                   className="w-8 h-8"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     d="M6 18L18 6M6 6l12 12"
    //                   />
    //                 </svg>
    //               </button>
    //             )}
    //             <p
    //               className={`text-4xl transition-all duration-200
    // 						${isLoadProject ? "mt-12 mb-6" : "mt-24"}
    // 					`}
    //             >
    //               Load an existing Project
    //             </p>
    //             <div
    //               className={`transition-all duration-500 overflow-hidden w-full
    // 						${isLoadProject ? "opacity-100 max-h-[500px] pointer-events-auto" : "opacity-0 max-h-0 pointer-events-none"}
    // 					`}
    //             >
    //               {isLoadProject && <ProjectLoader onClose={() => setIsLoadProject(false)} />}
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     <div
    //       style={{
    //         display: "flex",
    //         gap: "8px",
    //         flexDirection: "column",
    //       }}
    //     ></div>
    //     <div>
    //       <div className="border border-black mt-12 p-4 flex gap-4 flex-wrap">
    //         {projectList.length > 0 ? (
    //           projectList.map((project) => (
    //             <div
    //               className="
    // 					h-40 min-w-3xs w-fit
    // 					px-16
    // 					flex items-center bg-violet-400
    // 					rounded-2xl
    // 					text-3xl
    // 					"
    //               onContextMenu={(e) => handleMenuTrigger(e, project.path)}
    //               onClick={() => {
    //                 handleLoadProject(project.path);
    //               }}
    //             >
    //               {project.name}
    //             </div>
    //           ))
    //         ) : (
    //           <p>Start a new Project!</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // )

    !useGlobalStore.persist?.hasHydrated?.() ||
      !useProjectStore.persist?.hasHydrated?.() ? (
      <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
        Loading...
      </div>
    ) : (
      <div className="min-h-screen w-full bg-[var(--background-color)] text-[var(--text-primary)] flex flex-col md:flex-row">
        <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm px-5 py-6 flex md:min-h-screen flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-violet-400 tracking-wide">
              KhagaLink
            </h2>
            <div className="mt-6 flex md:flex-col gap-3 w-full">
              <button
                onClick={() => {
                  setIsLoadProject(false);
                  setIsNewProject(true);
                }}
                className="w-full rounded-xl px-4 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] transition-all text-left font-medium"
              >
                Create Project
              </button>

              <button
                onClick={() => {
                  setIsNewProject(false);
                  setIsLoadProject(true);
                }}
                className="w-full rounded-xl px-4 py-3 bg-[var(--secondary-color)] hover:opacity-90 transition-all text-left font-medium"
              >
                Load Existing Project
              </button>

              <button
                onClick={() => {}}
                className="w-full rounded-xl px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] text-[var(--text-secondary)] text-left font-medium"
              >
                About
              </button>
            </div>
          </div>

          <div className="hidden md:block mt-auto w-full pt-6 text-xs text-gray-400">
            v1.0, @govindgcoder
          </div>
        </aside>

        <main className="relative flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-10 overflow-auto">
          {(isNewProject || isLoadProject) && (
            <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                  setIsNewProject(false);
                  setIsLoadProject(false);
                }}
              />

              <div className="relative w-fit max-w-2xl rounded-2xl border border-slate-600 bg-slate-800 shadow-2xl">
                {isNewProject && (
                  <ProjectCreator onClose={() => setIsNewProject(false)} />
                )}

                {isLoadProject && (
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <ProjectLoader onClose={() => setIsLoadProject(false)} />
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-4xl mb-4 text-[--text-primary] tracking-wide">
            Projects
          </h1>

          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-4">
              {projectList.length > 0 ? (
                projectList.map((project) => (
                  <div
                    key={project.path}
                    className="relative h-40 min-w-60 w-fit p-4 --accent-colorflex justify-start bg-[var(--accent-color)] text-[--text-color] rounded-2xl text-xl sm:text-2xl cursor-pointer"
                    onClick={() => handleLoadProject(project.path)}
                  >
                    <span className="text-wrap">{project.name}</span>

                    <button
                      className="absolute bottom-3 right-3 rounded-full p-2 bg-black/10 hover:bg-red-500/20 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.path);
                      }}
                      aria-label={`Delete ${project.name}`}
                      title="Delete project"
                    >
                      <p className="text-[16px]">x</p>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[var(--text-secondary)]">
                  Start a new Project!
                </p>
              )}
            </div>

            <div className="mt-6 md:hidden text-xs text-gray-400">
              v1.0, @govindgcoder
            </div>
          </div>
        </main>
      </div>
    )
  );
}
