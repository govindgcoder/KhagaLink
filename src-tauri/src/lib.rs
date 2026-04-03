// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
        tauri::Builder::default()
        .manage(TelemetryState {
            is_running: Arc::new(AtomicBool::new(false)),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![create_project, get_csv_metadata, get_csv_rows, load_project, save_project, delete_project, check_path_exists, get_graph_data, start_telemetry_stream, stop_telemetry_stream])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub name: String,
    pub path: String,
    pub created_at: String,
    pub csv_files: Vec<CsvFileConfig>,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CsvFileConfig {
    pub path: String,
    pub is_visible: bool,
}

use std::path::Path;
use std::fs;

#[tauri::command]
fn create_project(path: String, name: String) -> Result<String, String> {
    let new_project = Project {
        name: name.clone(),
        path: path.clone(),
        created_at: "2025-11-3".to_string(),
        csv_files: vec![],
    };
    let json_data = serde_json::to_string_pretty(&new_project).map_err(|e| e.to_string())?;

    let folder_path = Path::new(&path);

    let file_path = folder_path.join("project.json");

    fs::write(&file_path, json_data).map_err(|e| e.to_string())?;

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

#[derive(Serialize)]
struct GraphPoint {
    x: f64,
    y: f64,
}


#[tauri::command]
fn get_graph_data(path: String, x_col: usize, y_col: usize, max_points: usize) -> Result<Vec<GraphPoint>, String> {
    let mut rdr = csv::Reader::from_path(&path).map_err(|e| e.to_string())?;

    // !!! need to be optimized later
    let records: Vec<csv::StringRecord> = rdr.records().collect::<Result<_, _>>().map_err(|e| e.to_string())?;
    let total_rows = records.len();

    let step = if total_rows > max_points {
        total_rows / max_points
    } else {
        1
    };

    let mut points = Vec::new();

    for (i, record) in records.iter().enumerate() {
        if i % step == 0 {
            // get strings, default val will be 0
            let x_str = record.get(x_col).unwrap_or("0");
            let y_str = record.get(y_col).unwrap_or("0");

            let x_val = x_str.parse::<f64>().unwrap_or(0.0);
            let y_val = y_str.parse::<f64>().unwrap_or(0.0);

            points.push(GraphPoint { x: x_val, y: y_val });
        }
    }

    Ok(points)
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

#[tauri::command]
fn load_project(path: String)-> Result<Project, String>{
	let json_data = fs::read_to_string(path).map_err(|e| e.to_string())?;
	let project_data: Project = serde_json::from_str(&json_data).map_err(|e| e.to_string())?;
    Ok(project_data)
}

#[tauri::command]
fn save_project(project: Project)-> Result<(), String>{
	let json_data = serde_json::to_string(&project).map_err(|e| e.to_string())?;
	let file_path = Path::new(&project.path).join("project.json");
    fs::write(file_path, json_data).map_err(|e| e.to_string())?;
	Ok(())
}

#[tauri::command]
fn delete_project(path: String)-> Result<(), String>{
	let file_path = Path::new(&path).join("project.json");
    fs::remove_file(file_path).map_err(|e| e.to_string())?;
	Ok(())
}

#[tauri::command]
fn check_path_exists(path: String)-> bool {
	let file_path = Path::new(&path).join("project.json");
	return file_path.exists();
}

// for rust serial
use std::time::Duration;
use std::thread;
use std::io::Read;
use tauri::{Emitter, State, Manager};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

struct TelemetryState {
    is_running: Arc<AtomicBool>,
}

#[tauri::command]
fn start_telemetry_stream(
    app_handle: tauri::AppHandle,
    state: State<'_, TelemetryState>,
    port_name: String,
    baud_rate: u32
) -> Result<String, String> {
    if state.is_running.load(Ordering::Relaxed) {
        return Err("A connection is already actively running!".to_string());
    }

    let mut port = serialport::new(&port_name, baud_rate)
        .timeout(Duration::from_millis(10))
        .open()
        .map_err(|e| format!("Access Denied: Is the port open in another app? ({})", e))?;

    state.is_running.store(true, Ordering::Relaxed);

    let is_running_clone = Arc::clone(&state.is_running);

    thread::spawn(move || {
        let mut serial_buf: Vec<u8> = vec![0; 1024];
        let mut packet_buffer = String::new();

        while is_running_clone.load(Ordering::Relaxed) {
            match port.read(serial_buf.as_mut_slice()) {
                Ok(t) if t > 0 => {
                    let chunk = String::from_utf8_lossy(&serial_buf[..t]);
                    packet_buffer.push_str(&chunk);

                    if let Some(newline_idx) = packet_buffer.find('\n') {
                        let full_packet = packet_buffer[..newline_idx].trim().to_string();
                        let _ = app_handle.emit("telemetry-packet", full_packet);
                        packet_buffer = packet_buffer[newline_idx + 1..].to_string();
                    }
                }
                Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => (),
                Err(e) => {
                    eprintln!("Serial port disconnected: {:?}", e);
                    break;
                }
                _ => {}
            }
        }

        println!("Telemetry thread shut down gracefully.");
    });

    Ok(format!("Successfully connected to {}", port_name))
}

#[tauri::command]
fn stop_telemetry_stream(state: State<'_, TelemetryState>) -> Result<String, String> {
    state.is_running.store(false, Ordering::Relaxed);
    Ok("Disconnect signal sent.".to_string())
}
