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
		<div className="size-full">
			<div
				className="project-dashboard-layout bg-[var(--secondary-color)] p-4 w-screen h-screen flex"
			>
				<div id="sidebar" className={`h-full ${isSidebarOpen ? 'w-44' : 'w-12'} bg-[var(--secondary-color)] transition-all mr-3`}>
					<div className="flex flex-col justify-between h-full">
						<div className="flex items-center justify-between py-2">
							<button onClick={handleToggleSideBar}>
								{isSidebarOpen ? (
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6l6 6-6 6" />
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
				<div id="main-csv-content" className="w-full bg-[var(--background)] h-full flex-1">
					<CsvVisualizer />
				</div>
			</div>
		</div>
	);
}
