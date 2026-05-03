type AboutProps = {
  onBack: () => void;
};

export default function About({ onBack }: AboutProps) {
  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-6 text-[var(--accent-color)] hover:text-[var(--accent-muted)] text-lg font-medium"
      >
        ← back
      </button>

      <h1 className="text-4xl mb-2 text-[var(--text-primary)] tracking-wide">
        Khagalink
      </h1>
      <h2 className="text-xl mb-6 text-[var(--text-secondary)]">
        A csv visualizer and telemetry dashboard for embedded systems.
      </h2>
      <p className="text-[var(--text-secondary)] mb-8">by govindgcoder</p>

      <div className="max-w-3xl space-y-6 text-[var(--text-secondary)]">
        <p>
          <strong className="text-[var(--text-primary)]">
            Rust-powered desktop telemetry dashboard.
          </strong>{" "}
          KhagaLink is a a complete project dashboard bridging raw data logs and
          actionable insights. It combines a React frontend for visualization
          with a native Rust backend for low-latency serial communication,{" "}
          <span className="italic font-thin">
            {" "}
            built specifically for hobbist projects.
          </span>
        </p>

        <div className="border-l-4 border-[var(--accent-color)] pl-4 py-2 my-6 bg-[var(--secondary-color)]/50 rounded-r-lg">
          <p className="italic text-[var(--text-primary)]">
            Maintained by a solo developer. If this tool saves you an hour of
            wrestling with Python scripts or stops your laptop from crashing
            over a massive CSV, consider dropping a ⭐ on the repo!
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            why a native desktop app?
          </h3>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Web-based tools lack reliable, low-level serial port access</li>
            <li>
              Native Rust backends ensure zero-latency data processing during
              live field operations
            </li>
            <li>
              Offline-first architecture guarantees functionality on launch days
              without internet access
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            features (v1.0.0)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                project management
              </h4>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                <li>create new projects with custom naming</li>
                <li>load existing projects via native file dialogs</li>
                <li>saving and deleting projects</li>
                <li>persistent storage via localStorage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                telemetry
              </h4>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                <li>direct COM port serial connection</li>
                <li>configurable baud rates</li>
                <li>live streaming of newline-delimited packets</li>
                <li>native CSV packet parsing</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            tech stack
          </h3>
          <div className="flex flex-wrap gap-2 ml-2">
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              React 19
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Tauri 2 (Rust)
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Zustand 5
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Tailwind CSS 4
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Recharts
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Leaflet
            </span>
            <span className="px-3 py-1 bg-[var(--secondary-color)] rounded-full text-sm">
              Three.js
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)]/70 mt-8 pt-4 border-t border-[var(--border-color)]">
          MIT LICENSE.
        </p>
      </div>
    </div>
  );
}
