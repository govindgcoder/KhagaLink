// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
        tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![create_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub name: String,
    pub created_at: String,
    pub csv_files: Vec<CsvFileConfig>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CsvFileConfig {
    pub url: String,
    pub is_visible: bool,
}

use std::fs;
#[tauri::command]
fn create_project(path: String, name: String) -> Result<String, String> {
    let new_project = Project {
        name: name,
        created_at: "2025-11-3".to_string(),
        csv_files: vec![],
    };
    let json_data = serde_json::to_string_pretty(&new_project).map_err(|e| e.to_string())?;

    fs::write(&path, json_data).map_err(|e| e.to_string())?;

    Ok("Project created successfully".to_string())
}
