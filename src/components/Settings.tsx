import { useEffect, useState } from "react";

type SettingsProps = {
  onBack: () => void;
};

const themes = {
  default: {
    name: "VeloViolet",
    description: "cool scifi accent",
    colors: {
      "--background-color": "#2d3142",
      "--accent-color": "#7c6cff",
      "--secondary-color": "#2f3847",
      "--accent-muted": "#5a4fcf",
      "--text-primary": "#f5f7ff",
      "--text-secondary": "#a9b0c3",
      "--border-color": "#3b3f5c",
    },
  },
  warm: {
    name: "YepItsYellow",
    description: "warm yellowish tint",
    colors: {
      "--background-color": "#3d3522",
      "--accent-color": "#f5c842",
      "--secondary-color": "#473a28",
      "--accent-muted": "#c9a436",
      "--text-primary": "#fff5e0",
      "--text-secondary": "#c9b896",
      "--border-color": "#5a4d30",
    },
  },
};

export default function Settings({ onBack }: SettingsProps) {
  const [activeTheme, setActiveTheme] = useState("default");

  useEffect(() => {
    const saved = localStorage.getItem("khagalink-theme");
    if (saved && themes[saved as keyof typeof themes]) {
      setActiveTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes];
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    applyTheme(themeName);
    localStorage.setItem("khagalink-theme", themeName);
  };

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-6 text-[var(--accent-color)] hover:text-[var(--accent-muted)] text-lg font-medium"
      >
        ← back
      </button>

      <h1 className="text-4xl mb-8 text-[var(--text-primary)] tracking-wide">
        settings
      </h1>

      <div className="mb-8">
        <h2 className="text-xl mb-4 text-[var(--text-primary)]">themes</h2>
        <div className="flex flex-wrap gap-6">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`w-72 h-44 rounded-xl cursor-pointer border-2 transition-all ${
                activeTheme === key
                  ? "border-[var(--accent-color)]"
                  : "border-[var(--border-color)] hover:border-[var(--accent-color)]/50"
              }`}
              style={{ backgroundColor: theme.colors["--secondary-color"] }}
            >
              <div className="w-full h-full px-3 py-5 flex flex-col">
                <div
                  className="w-full aspect-video rounded-lg mb-4"
                  style={{ backgroundColor: theme.colors["--accent-color"] }}
                />
                <div>
                  <span className="mt-4 text-[var(--text-primary)] font-medium block">
                    {theme.name}
                    {key === "default" && " (default)"}
                  </span>
                  <span className="mt-2 text-[var(--text-secondary)] text-sm">
                    {theme.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
