# 🚀💻 KhagaLink

![Version](https://img.shields.io/badge/version-0.5.0-violet) ![Stack](https://img.shields.io/badge/tech-React_|_Tauri_|_Rust-red) ![License](https://img.shields.io/badge/license-MIT-green)

> **Mission Control & Telemetry Dashboard for Model Rocketry.**

**(In Active Development)**

## 📖 About

**KhagaLink** is a high-performance desktop Ground Control Station (GCS) designed for model rocketry missions. Built with **Tauri (Rust)** and **React**, it serves as the central hub for mission configuration, post-flight analysis, and real-time telemetry monitoring.

A project for my model rocketry club: [_VeloCET_](http://velo.cet.ac.in)

KhagaLink bridges the gap between raw flight logs and actionable insights. Unlike web-based tools, it leverages a native Rust backend for low-latency serial communication and data processing, ensuring reliability during field operations.

## ✨ Key Features (Targeting v0.1 - v0.2)

- **📂 Mission Management:** Organize flight data by specific launches/projects with metadata.
- **📊 CSV Ingestion Engine:** Rapid parsing of high-frequency sensor logs (accelerometer, gyroscope, barometer) using Rust's `csv` crate.
- **📈 High-Performance Visualization:** Responsive line graphs for analyzing altitude, velocity, and acceleration data.
- **🎨 Field-Ready UI:** A clean, high-contrast interface designed for visibility on laptops during outdoor launches.

## 🛠 Tech Stack

- **Frontend:** React (TypeScript), CSS
- **Backend / Native:** Tauri (Rust)
- **Data Visualization:** Recharts
- **State Management:** Zustand
- **Hardware Interface:** Rust `serialport` (Planned)

## 🗺 Development Roadmap

I am currently finalizing **v0.1**. The roadmap prioritizes core data functionality before real-time operations.

### Phase 1: The Core (Data Analysis)

- [x] **v0.1 (The Archive):** Mission creation system, flight log (CSV) upload & parsing, JSON-based local storage.
- [x] **v0.2 (The Visuals):** Interactive line graphs for post-flight analysis. Plotting altitude, velocity, and sensor data from uploaded CSVs.

### Phase 2: The Live Link (Real-Time)

- [x] **v0.5 (Telemetry):** Native integration with **Rust Serialport**. Reading real-time data streams from flight computers (ESP32/STM32).
- [ ] **v0.6 (Live Monitor):** Real-time graphing dashboard with packet loss handling and signal strength monitoring.

### Phase 3: The Command (GCS)

- [ ] **v1.0 (Mission Control):** GPS integration using Leaflet maps to track rocket recovery location. Complete "Ground Control Station" suite.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (Required for the Tauri backend)

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/govindgcoder/KhagaLink.git](https://github.com/govindgcoder/KhagaLink.git)
    cd khagalink
    ```

2.  **Install frontend dependencies**

    ```bash
    npm install
    ```

3.  **Run in Development Mode**
    ```bash
    npm run tauri dev
    ```

## 🏗 Architecture

- **Frontend (React):** Handles the Mission Control UI and renders charts using `Recharts`.
- **Tauri Core (Rust):**
    - Manages file system access for secure CSV reading/writing.
    - **(Upcoming):** Handles the `serialport` thread to ingest USB telemetry data without blocking the UI.

## 🤝 Development

This project is developed primarily for the **VeloCET Payload Team**. Suggestions and PRs are welcome!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
