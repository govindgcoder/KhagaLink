<div align="center">

# KhagaLink

![Version](https://img.shields.io/badge/version-1.0.1-violet)
![Stack](https://img.shields.io/badge/tech-React_|_Tauri_|_Rust-red)
![License](https://img.shields.io/badge/license-MIT-green)
<a href="https://github.com/govindgcoder/KhagaLink/stargazers">
  <img src="https://img.shields.io/github/stars/govindgcoder/KhagaLink?style=social" alt="Stars" />
</a>

<br/>

<img width="800" alt="image" src="https://github.com/user-attachments/assets/47b35aaf-5d3e-4e45-908f-958d50d0419e" />

<br/>

**A fast telemetry dashboard and CSV visualizer for embedded systems.**
</div>
Built for ESP32, STM32, and custom hardware, KhagaLink pairs a React frontend with a Rust backend for smooth serial communication, live telemetry, and large CSV analysis without UI lag.


<br/>

<br/>

> Maintained by a solo developer. If KhagaLink saves you time or replaces a pile of scripts, a ⭐ helps a lot.


---

### Quick Start

1. Open the [Releases](https://github.com/govindgcoder/KhagaLink/releases) page.
2. Download the latest `.exe` on Windows.
3. Connect your device and start streaming.

Otherwise, build it yourself!

---

### Screenshots
<br/>
<br/>

<div align="center">
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/06d5d05f-b36c-490e-abc8-6e028756e3c6" />

  <br/><br/>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/0942b800-5eae-4d4c-b646-708ce8797978" />
<br/><br/>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/11b8b5fe-8841-44b7-8698-33e21322cc81" />

</div>

---

### Why it exists

Web tools are fine until the serial stream gets noisy.

KhagaLink stays responsive by moving parsing and heavy lifting into Rust, with an offline-first desktop workflow that holds up in the lab, field, or launchpad.

---

### Features

- Serial connection over COM ports with configurable baud rates
- Live telemetry streaming from newline-delimited packets
- Real-time graphing with auto-panning
- GPS map view for latitude and longitude data
- 3D quaternion visualization with Three.js
- CSV loading, pagination, and column detection
- Smart downsampling for large datasets

---

### Tech Stack

Tauri + React Stack
- Frontend: React, TS, Vite, Tailwind
- Desktop: Tauri (Rust)
- State/UI: Zustand, Recharts, Leaflet, Three.js
- Data/IO: Rust (serialport, csv)
  
---

### Getting Started

```bash
git clone https://github.com/govindgcoder/KhagaLink.git
cd KhagaLink
npm install
npm run tauri dev

Build for production:

npm run tauri build
```
### License

MIT License.
> note: in the telemetry csv, first column serves as index sequence (for data rate) and second as timestamp in seconds
> originally built as the payload lead at the college rocketry club, VeloCET
