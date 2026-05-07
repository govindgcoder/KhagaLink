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

import { load } from "@tauri-apps/plugin-store";

// settings page - theme configuration
export default function Settings({ onBack }: SettingsProps) {
  const [activeTheme, setActiveTheme] = useState("default");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const initSettings = async () => {
      const store = await load("settings.json", {
        defaults: {},
        autoSave: false,
      });
      const saved = await store.get<{ value: string }>("gemini-api-key");
      if (saved) {
        setApiKey(saved as unknown as string);
      }
    };
    initSettings();
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

  const handleSaveKey = async () => {
    const store = await load("settings.json", {
      defaults: {},
      autoSave: false,
    });
    await store.set("gemini-api-key", apiKey);
    await store.save();
    alert("API key set successfully!");
  };

  return (
    <div className="w-full max-w-6xl">
      <button
        onClick={onBack}
        className="mb-8 text-[var(--accent-color)] hover:text-[var(--accent-muted)] text-sm font-medium transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] mb-10">
        Settings
      </h1>

      {/* Themes */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-medium text-[var(--text-primary)]">
          Themes
        </h2>

        <div className="flex flex-wrap gap-6">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`
                group w-72 rounded-2xl cursor-pointer border transition-all duration-200
                overflow-hidden hover:scale-[1.01]
                ${
                  activeTheme === key
                    ? "border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/10"
                    : "border-[var(--border-color)] hover:border-[var(--accent-color)]/40"
                }
              `}
              style={{
                backgroundColor: theme.colors["--secondary-color"],
              }}
            >
              <div className="p-4 flex flex-col gap-4">
                <div
                  className="w-full aspect-video rounded-xl"
                  style={{
                    backgroundColor: theme.colors["--accent-color"],
                  }}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-primary)] font-medium">
                      {theme.name}
                    </span>

                    {key === "default" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {theme.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-xl">
        <h2 className="mb-5 text-xl font-medium text-[var(--text-primary)]">
          Configure your Gemini API key:
        </h2>
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--secondary-color)]/40">
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="****"
              className="flex-1 bg-[var(--secondary-color)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-colors"
            />

            <button
              onClick={handleSaveKey}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-muted)] text-white font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
