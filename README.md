# 🚀💻 KhagaLink

![Version](https://img.shields.io/badge/version-0.0.2-violet) ![Stack](https://img.shields.io/badge/tech-React_|_Tauri_|_Rust-red) ![License](https://img.shields.io/badge/license-MIT-green)

> **Flight Data Visualization & Telemetry Dashboard for Model Rocketry.**

(In-Development!)

## 📖 About

**KhagaLink** is a desktop application designed to streamline the analysis of model rocketry flight data. Built with performance and cross-platform compatibility in mind using **Tauri** and **React**, it is envisioned as a central hub for mission replay, sensor data analysis, and real-time telemetry monitoring.

A project for my model rocketry club: [_VeloCET_](http://velo.cet.ac.in)

Currently in active development, KhagaLink aims to bridge the gap between raw CSV logs and actionable flight insights, eventually evolving into a full-featured Ground Control Station (GCS) with AI-assisted data interpretation.

## ✨ Key Features (planned for v0.1)

- **📂 Project Management System:** Organize flight data by distinct projects/launches.
- **📊 CSV Ingestion Engine:** Rapid parsing of high-frequency sensor logs (accelerometer, gyroscope, barometer).
- **📈 Interactive Visualization:** Graphs for post-flight analysis of altitude, velocity, and acceleration.
- **🎨 Modern UI/UX:** A clean, dark-mode friendly interface designed for clarity during field operations.

## 🛠 Tech Stack

- **Frontend:** React (TypeScript), CSS
- **Backend / Native:** Tauri (Rust)
- **Data Visualization:** Recharts / Chart.js (?)
- **State Management:** Zustand

## 🗺 Development Roadmap

I am currently targeting **v0.1**. Below is the strategic plan for future releases:

### Phase 1: Core Foundation

- [ ] **v0.1:** Project list system, CSV upload, Basic Graph Visualizer, UI/UX Polish.
- [ ] **v0.5:** Real-time Telemetry via WebSockets (ESP32/STM32 Integration).

### Phase 2: Advanced Flight Operations

- [ ] **v0.6:** Full Telemetry Management (Signal strength monitoring, packet loss handling).
- [ ] **v0.7:** 3D Trajectory Visualizer.

### Phase 3: AI & Intelligence

- [ ] **v0.8:** Integrated LLM Chatbot for documentation and basic queries.
- [ ] **v0.9:** RAG (Retrieval-Augmented Generation) functionality to allow the AI to "chat" with your flight data logs for anomaly detection.
- [ ] **v1.0:** Complete Suite Release (Stable GCS + Post-flight Analysis).

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS)
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (Required for Tauri)

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/govindgcoder/KhagaLink.git](https://github.com/govindgcoder/KhagaLink.git)
    cd khagalink
    ```

2.  **Install dependencies (under work)**

    ```bash
    npm install
    ```

3.  **Run in Development Mode**
    ```bash
    npm run tauri dev
    ```

## 🏗 Architecture

- **Frontend:** Handles all user interactions and rendering of charts.
- **Tauri Core (Rust):** Manages file system access (reading CSVs), handles WebSocket connections for telemetry, and ensures high-performance system integration.

## 🤝 Development

This project is developed primarily for the VeloCET payload team. Suggestions are welcome!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
