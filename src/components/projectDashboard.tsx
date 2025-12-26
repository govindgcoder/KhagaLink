import { useState, useEffect } from "react";
import CsvVisualizer from "./csvVisualizer";

export default function ProjectDashboard() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setIsSidebarOpen(false);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const handleToggleSideBar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div style={{ height: "100vh" }}>
			<div
				className="project-dashboard-layout"
				style={{
					display: "flex",
					height: "100vh",
					gap: "1rem",
					padding: "1rem",
				}}
			>
				<div id="sidebar" style={{ height: "100vh" }}>
					{isSidebarOpen ? (
						<div
							style={{
								width: "4rem",
								height: "100vh",
								backgroundColor: "teal",
							}}
						>
							<button onClick={handleToggleSideBar}>-</button>
						</div>
					) : (
						<div
							style={{
								width: "12rem",
								height: "100vh",
								backgroundColor: "teal",
							}}
						>
							<button onClick={handleToggleSideBar}>-</button>
						</div>
					)}
				</div>
				<div id="main-csv-content" style={{ flex: 1 }}>
					<CsvVisualizer />
				</div>
			</div>
		</div>
	);
}
