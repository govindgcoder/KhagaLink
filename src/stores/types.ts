export type View = "Home" | "Project";

export interface CsvFileConfig {
  path: string;
  is_visible: boolean;
}

export interface GraphWidgetConfig {
  id: string;
  x_col_idx: number;
  y_col_idx: number;
  name: string;
  csv_path: string;
}

export interface Project {
  name: string;
  path: string;
  created_at: string;
  csv_files: CsvFileConfig[];
  csv_graphs: GraphWidgetConfig[];
}

export interface GraphWidget {
  id: string;
  x_col_idx: number;
  y_col_idx: number;
  name: string;
  csv_path?: string;
  data: { x: number; y: number }[];
}

export interface MapConfig {
  latCol: number;
  longCol: number;
  enabled: boolean;
}

export interface QuaternionConfig {
  wCol: number;
  xCol: number;
  yCol: number;
  zCol: number;
  enabled: boolean;
}

export interface CSVmetadata {
  headers: string[];
  total_rows: number;
}