
<div align="center">

# 🚀💻 KhagaLink

![Version](https://img.shields.io/badge/version-1.0.0-violet) 
![Stack](https://img.shields.io/badge/tech-React_|_Tauri_|_Rust-red) 
![License](https://img.shields.io/badge/license-MIT-green)
<a href="https://github.com/govindgcoder/KhagaLink/stargazers"><img src="https://img.shields.io/github/stars/govindgcoder/KhagaLink?style=social" alt="Stars" /></a>

<br/>

<img width="800" alt="KhagaLink Main Interface" src="https://github.com/user-attachments/assets/a318b053-edc1-434c-b1c4-ee805092676f" />

<br/>

**Rust-powered desktop telemetry dashboard for model rocketry missions.**

KhagaLink is a Ground Control Station (GCS) bridging raw flight logs and actionable insights. It combines a React frontend for visualization with a native Rust backend for low-latency serial communication, built specifically for ESP32 and STM32 flight computers.

<br/>

> ### ❤️ Show Your Support
> *Maintained by a solo developer. If this tool saves you an hour of wrestling with Python scripts or stops your laptop from crashing over a massive CSV, consider dropping a ⭐ on the repo! It is the absolute best way to keep this project alive and updated.*

</div>

***

### 📸 Screenshots
<div align="center">
  <img width="800" alt="KhagaLink View 1" src="https://github.com/user-attachments/assets/221d7a4d-1869-48ea-aa27-be49e08b7872" />
  <br/><br/>
  <img width="800" alt="KhagaLink View 2" src="https://github.com/user-attachments/assets/c9f3af4f-735f-4ad3-b53e-fcc7a9b2d14f" />
  <br/><br/>
  <img width="800" alt="KhagaLink View 3" src="https://github.com/user-attachments/assets/695f4855-fe24-41f0-8e4e-9cd5ec27ed65" />
</div>

***

### 🎯 Why a native desktop app?
* Web-based tools lack reliable, low-level serial port access.
* Native Rust backends ensure zero-latency data processing during live field operations.
* Offline-first architecture guarantees functionality on launch days without internet access.

***

### ✨ Features (v1.0.0)

**Project Management**
* Create new projects with custom naming and local folder storage.
* Load existing projects via native OS file dialogs.
* Delete projects via right-click context menus.
* Persistent storage utilizing `localStorage` for UI state and `project.json` for metadata.

**Real-Time Telemetry**
* Direct COM port serial connection (e.g., COM5).
* Configurable baud rates: 9600, 19200, 38400, 57600, 115200, 230400.
* Live streaming of newline-delimited packets.
* Native comma-separated value (CSV) packet parsing.

**Telemetry Dashboard Widgets**
* **Live Graphs:** Real-time line charts with configurable data columns and smart auto-panning.
* **GPS Map:** Leaflet integration displaying lat/lng position based on selected packet indices.
* **3D Orientation:** Three.js quaternion visualization mapping W/X/Y/Z columns to a 3D model.
* **Data Rate:** Real-time metrics for packets per second (Hz) and packet loss percentage.

**CSV Analysis**
* Native dialog browser for CSV file selection.
* Paginated table view (50 rows/page) with automatic header detection.
* Column intelligence displaying total rows and column counts.
* Interactive line graphs supporting any X/Y column combination.
* Smart data downsampling (max 2000 points) to maintain render performance.

***

### 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript |
| **Desktop Core** | Tauri 2 (Rust) |
| **State Management** | Zustand 5 (with persistence) |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Maps** | Leaflet + react-leaflet |
| **3D Rendering** | Three.js + @react-three/fiber |
| **Hardware IO** | Rust `serialport` crate |
| **Data Parsing** | Rust `csv` crate |

***

### 🏗️ Architecture

**Frontend (React)**
Handles all UI components, 3D rendering, and chart updates. Communicates with Tauri via `invoke()` commands and listens to `telemetry-packet` events.

**Tauri Core (Rust)**
Manages file operations (`create_project`, `load_project`, `save_project`), heavy data parsing (`get_csv_metadata`, `get_graph_data`), and spawns dedicated background threads for uninterrupted serial port listening.

***

### 🚀 Getting Started

**Prerequisites**
* Node.js (LTS)
* Rust & Cargo

**Installation**
```bash
# Clone the repository
git clone [https://github.com/govindgcoder/KhagaLink.git](https://github.com/govindgcoder/KhagaLink.git)
cd KhagaLink

# Install dependencies
npm install

# Run development server
npm run tauri dev
```

**Build for Production**
```bash
npm run tauri build
```
*Output binaries (.exe for Windows, .app for macOS) will be generated in `src-tauri/target/release/`.*

***

### 📖 Usage Guide

1. **Create a Project:** Click "Create a new Project", select a local folder, and assign a name.
2. **Load Flight Data (CSV):** Open your project, click the "+" icon to browse, and select your flight log.
3. **Analyze Data:** Use the paginated table to inspect raw values. Add Graph Widgets and select your X/Y columns to visualize trends.
4. **Connect to Flight Hardware:** Navigate to the Telemetry tab, click "Configure Connection", enter your COM port and Baud Rate, and connect.
5. **Monitor Live Data:** Add live graphs, map your GPS columns, and assign quaternion data to watch the 3D orientation model track your hardware in real time.

***

### 📁 File Structure

```text
KhagaLink/
├── src/
│   ├── components/
│   │   ├── home.tsx                 # Project list & creation
│   │   ├── projectDashboard.tsx     # Main dashboard shell
│   │   ├── csvVisualizer.tsx        # CSV table + static graphs
│   │   ├── telemetry.tsx            # Live telemetry dashboard
│   │   ├── GraphWidgetComponent.tsx # Shared charting logic
│   │   ├── mapView.tsx              # Leaflet GPS integration
│   │   ├── orientationWidget.tsx    # Three.js quaternion viz
│   │   ├── DataRateWidget.tsx       # Link statistics
│   │   ├── projectCreator.tsx
│   │   └── projectLoader.tsx
│   ├── stores/
│   │   └── useStore.ts              # Zustand state & Rust bridge
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs                   # Tauri commands & Serial threads
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

***

### 📜 License & Credits
MIT License. 

Built for the **VeloCET Payload Team** at [velo.cet.ac.in](http://velo.cet.ac.in).
