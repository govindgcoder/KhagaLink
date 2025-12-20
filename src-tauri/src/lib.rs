// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
        tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![create_project, get_csv_metadata, get_csv_rows])
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

use std::error::Error;

#[derive(Debug, Serialize)]
pub struct CSVmetadata {
    pub headers: Vec<String>,
    pub total_rows: usize,
}

//reads files, get the headers, count rows
fn read_metadata(path:&str)->Result<CSVmetadata, Box<dyn Error>>{
    let mut rdr = csv::Reader::from_path(path)?;

    let headers: Vec<String> = rdr.headers()?.iter().map(|h| h.to_string()).collect();

    let total_rows = rdr.records().count();

    Ok(
        CSVmetadata{
            headers, total_rows
        }
    )
}

#[tauri::command]
fn get_csv_metadata(path:String)->Result<CSVmetadata, String>{
    match read_metadata(&path){
        Ok(data)=>Ok(data),
        Err(e)=>Err(e.to_string()),
    }
}

// to get a window of csv rows
fn read_csv_rows(path:&str, start_index:usize, window_size:usize)->Result<Vec<Vec<String>>, String>{	
	let mut rdr = csv::Reader::from_path(path).map_err(|e| e.to_string())?;
	let mut rows: Vec<Vec<String>> = Vec::new();

	let chunk = rdr.records().skip(start_index).take(window_size);

	for result in chunk {
		let record = result.map_err(|e| e.to_string())?;
		let row_vec: Vec<String> = record.iter().map(|field| field.to_string()).collect();

		rows.push(row_vec);
	}
	Ok(rows)
}
//the bridge
#[tauri::command]
fn get_csv_rows(path:String, start_index:usize, window_size:usize)->Result<Vec<Vec<String>>,String>{
	match read_csv_rows(&path, start_index, window_size){
		Ok(rows)=>Ok(rows),
		Err(e) => Err(e),
	}
}