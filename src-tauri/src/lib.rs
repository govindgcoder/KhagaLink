// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// tauri app entry point - initializes and runs the application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
        tauri::Builder::default()
        .manage(TelemetryState {
            is_running: Arc::new(AtomicBool::new(false)),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![create_project, get_csv_metadata, get_csv_rows, load_project, save_project, delete_project, check_path_exists, get_graph_data, start_telemetry_stream, stop_telemetry_stream, analyze_csv, extract_ai_samples])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use csv::StringRecord;
use serde::{Deserialize, Serialize};

// graph data structure for project serialization
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GraphData {
    pub id: String,
    pub x_col_idx: usize,
    pub y_col_idx: usize,
    pub name: String,
    pub csv_path: String,
}

// project structure - main data model
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub name: String,
    pub path: String,
    pub created_at: String,
    pub csv_files: Vec<CsvFileConfig>,
    pub csv_graphs: Vec<GraphData>,
}
// csv file configuration for project
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CsvFileConfig {
    pub path: String,
    pub is_visible: bool,
}

use std::path::Path;
use std::{fs, result};
use chrono::Local;

// creates a new project with project.json file
#[tauri::command]
fn create_project(path: String, name: String) -> Result<String, String> {
    let local_date = Local::now().date_naive().format("%d-%m-%Y");
    let new_project = Project {
        name: name.clone(),
        path: path.clone(),
        created_at: local_date.to_string(),
        csv_files: vec![],
        csv_graphs: vec![],
    };
    let json_data = serde_json::to_string_pretty(&new_project).map_err(|e| e.to_string())?;

    let folder_path = Path::new(&path);

    let file_path = folder_path.join("project.json");

    fs::write(&file_path, json_data).map_err(|e| e.to_string())?;

    Ok("Project created successfully".to_string())
}

use std::error::Error;

// csv metadata response structure
#[derive(Debug, Serialize)]
pub struct CSVmetadata {
    pub headers: Vec<String>,
    pub total_rows: usize,
}

// reads csv file and extracts headers and row count
fn read_metadata(path:&str)->Result<CSVmetadata, Box<dyn Error>>{
    let mut rdr = csv::ReaderBuilder::new().flexible(true).from_path(path)?;

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


// retrieves graph data points from csv for charting
#[tauri::command]
fn get_graph_data(path: String, x_col: usize, y_col: usize, max_points: usize) -> Result<Vec<GraphPoint>, String> {
    let mut rdr = csv::ReaderBuilder::new()
        .flexible(true)
        .from_path(&path)
        .map_err(|e| e.to_string())?;

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

// returns csv headers and total row count
#[tauri::command]
fn get_csv_metadata(path:String)->Result<CSVmetadata, String>{
    match read_metadata(&path){
        Ok(data)=>Ok(data),
        Err(e)=>Err(e.to_string()),
    }
}

// reads a window of rows from csv for pagination
fn read_csv_rows(path:&str, start_index:usize, window_size:usize)->Result<Vec<Vec<String>>, String>{
    let mut rdr = csv::ReaderBuilder::new().flexible(true).from_path(path).map_err(|e| e.to_string())?;
	let mut rows: Vec<Vec<String>> = Vec::new();

	let chunk = rdr.records().skip(start_index).take(window_size);

	for result in chunk {
		let record = result.map_err(|e| e.to_string())?;
		let row_vec: Vec<String> = record.iter().map(|field| field.to_string()).collect();

		rows.push(row_vec);
	}
	Ok(rows)
}
// returns a window of csv rows for display
#[tauri::command]
fn get_csv_rows(path:String, start_index:usize, window_size:usize)->Result<Vec<Vec<String>>,String>{
	match read_csv_rows(&path, start_index, window_size){
		Ok(rows)=>Ok(rows),
		Err(e) => Err(e),
	}
}

// loads project.json and deserializes to Project struct
#[tauri::command]
fn load_project(path: String)-> Result<Project, String>{
	let json_data = fs::read_to_string(path).map_err(|e| e.to_string())?;
	let project_data: Project = serde_json::from_str(&json_data).map_err(|e| e.to_string())?;
    Ok(project_data)
}

// serializes and saves project to project.json
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
	Path::new(&path).exists()
}

// for rust serial - telemetry system
use std::time::Duration;
use std::thread::{self, current};
use std::io::Read;
use tauri::{Emitter, State};
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



    let is_running_clone = Arc::clone(&state.is_running);

    state.is_running.store(true, Ordering::Relaxed);

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

        // Emit disconnect event to frontend
        let _ = app_handle.emit("telemetry-disconnected", "Stream terminated");
        println!("Telemetry thread shut down gracefully.");
    });

    Ok(format!("Successfully connected to {}", port_name))
}

#[tauri::command]
fn stop_telemetry_stream(state: State<'_, TelemetryState>) -> Result<String, String> {
    state.is_running.store(false, Ordering::Relaxed);
    Ok("Disconnect signal sent.".to_string())
}

#[derive(Serialize)]
#[derive(Default)]
pub struct ColSummary{
    pub name: String,
    pub sum: f64,
    pub min: f64,
    pub max: f64,
    pub mean: f64,
    pub sum_of_squares: f64,
    pub std_dev: f64,
    pub missing_count: usize,
}

#[tauri::command]
fn analyze_csv(path: String) -> Result<Vec<ColSummary>, String> {
    let mut rdr = csv::ReaderBuilder::new().flexible(true).from_path(path).map_err(|e| e.to_string())?;
    let headers = rdr.headers().map_err(|e| e.to_string())?.clone();
    let mut col_summaries: Vec<ColSummary> = headers.iter().map(|x| ColSummary {
        name: x.to_string(),
        min: f64::INFINITY,
        max: f64::NEG_INFINITY,
        ..Default::default()
    }).collect();
    let mut no_of_rows: usize = 0;
    for record in rdr.records() {
        no_of_rows+=1;
        let result_val = record.map_err(|e| e.to_string());
        let mut result: StringRecord = StringRecord::default();
        match result_val {
            Ok(val) => result = val,
            Err(e) => {eprintln!("Error getting StringRecord!"); continue;}
        }
        for (i, record_val) in result.iter().enumerate() {
            if let Some(current_col ) = col_summaries.get_mut(i) {
                let mut val: f64 = 0.0;

                match record_val.trim().parse::<f64>() {
                    Ok(val_float) => val = val_float,
                    Err(e) => {eprintln!("Error parsing column vals!: {}",e.to_string()); current_col.missing_count+=1; continue;},
                }
                current_col.sum+=val;
                current_col.sum_of_squares+=val*val;
                if current_col.min > val {current_col.min = val;}
                if current_col.max < val {current_col.max = val;}

            }
        }
    }

    for col in &mut col_summaries {
        let div: f64 = (no_of_rows-col.missing_count) as f64;
        if div==(0.0 as f64) {col.mean = 0.0; continue;}
        col.mean = col.sum / div;
        let variance = col.sum_of_squares/div - col.mean.powi(2);
        col.std_dev = variance.clamp(0.0, f64::INFINITY).sqrt();
    }


    Ok(col_summaries)

}

#[tauri::command]
fn extract_ai_samples(path: String, cols: Vec<usize>, sample_size: usize, total_rows: usize) -> Result<Vec<Vec<f64>>, String> {
    let mut rdr = csv::ReaderBuilder::new()
        .flexible(true)
        .from_path(path)
        .map_err(|e| e.to_string())?;

    let step_size = if sample_size > 0 && total_rows > sample_size {
        total_rows / sample_size
    } else {
        1
    };

    let mut samples = Vec::with_capacity(sample_size + (cols.len() * 2));

    let mut min_vals = vec![f64::INFINITY; cols.len()];
    let mut max_vals = vec![f64::NEG_INFINITY; cols.len()];
    let mut min_rows: Vec<Vec<f64>> = vec![Vec::new(); cols.len()];
    let mut max_rows: Vec<Vec<f64>> = vec![Vec::new(); cols.len()];

    for (row_idx, result) in rdr.records().enumerate() {
        let record = match result {
            Ok(rec) => rec,
            Err(_) => continue,
        };

        let mut current_row_data = Vec::with_capacity(cols.len());
        for &col_idx in &cols {
            let val = record.get(col_idx)
                .unwrap_or("0")
                .trim()
                .parse::<f64>()
                .unwrap_or(0.0);
            current_row_data.push(val);
        }

        for i in 0..cols.len() {
            let val = current_row_data[i];
            if val < min_vals[i] {
                min_vals[i] = val;
                min_rows[i] = current_row_data.clone();
            }
            if val > max_vals[i] {
                max_vals[i] = val;
                max_rows[i] = current_row_data.clone();
            }
        }

        if row_idx % step_size == 0 && samples.len() < sample_size {
            samples.push(current_row_data.clone());
        }
    }

    for row in min_rows {
        if !row.is_empty() {
            samples.push(row);
        }
    }
    for row in max_rows {
        if !row.is_empty() {
            samples.push(row);
        }
    }

    Ok(samples)
}
