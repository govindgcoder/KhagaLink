import "react";
import { useEffect, useState } from "react";
import ProjectLoader from "./projectLoader";
import ProjectCreator from "./projectCreator";
import Settings from "./Settings";
import About from "./About";
import { useGlobalStore, useProjectStore } from "../stores/useStore";

type HomeProps = {
  onNavigate?: (view: string) => void;
};

const normalizePath = (p: string) =>
  p
    .replace(/\\/g, "/")
    .replace(/\/+$/, "")
    .replace(/\/project\.json$/, "");

export default function Home({ onNavigate }: HomeProps) {
  const [isNewProject, setIsNewProject] = useState(false);
  const [isLoadProject, setIsLoadProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const [path, setPath] = useState("");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

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
    if (onNavigate) {
      onNavigate("Project");
    }
    const normalizedPath = normalizePath(pathURL);
    await loadProject(normalizedPath);
    loadView("Project");
  };

  const loadView = useProjectStore((state) => state.load_view);

  const handleSettings = () => {
    setShowSettings(true);
    setShowAbout(false);
    setIsNewProject(false);
    setIsLoadProject(false);
  };

  const handleAbout = () => {
    setShowAbout(true);
    setShowSettings(false);
    setIsNewProject(false);
    setIsLoadProject(false);
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

  return !useGlobalStore.persist?.hasHydrated?.() ||
    !useProjectStore.persist?.hasHydrated?.() ? (
    <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
      Loading...
    </div>
  ) : (
    <div className="min-h-screen w-full text-[var(--text-primary)] flex flex-col md:flex-row">
      <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[--background-color] backdrop-blur-sm px-5 py-6 flex md:min-h-screen flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4">
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
              className="w-full rounded-xl px-4 py-3 bg-[var(--secondary-color)] hover:opacity-60 transition-all text-left font-medium"
            >
              Load Existing Project
            </button>
            <div className="w-full">
              <div className="invisible md:visible w-full h-0.5 bg-[var(--border-color)]/40"></div>
            </div>
            <button
              onClick={handleSettings}
              className="w-full rounded-xl px-4 py-3 bg-[--tertiary-color] hover:bg-[var(--accent-color)]/20 border border-[var(--border-color)] text-[var(--text-secondary)] text-left font-medium"
            >
              Settings
            </button>
            <button
              onClick={handleAbout}
              className="w-full rounded-xl px-4 py-3 bg-[--tertiary-color] hover:bg-[var(--accent-color)]/20 border border-[var(--border-color)] text-[var(--text-secondary)] text-left font-medium"
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

        {showSettings && <Settings onBack={() => setShowSettings(false)} />}
        {showAbout && <About onBack={() => setShowAbout(false)} />}
        {!showSettings && !showAbout && (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
