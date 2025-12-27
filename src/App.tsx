import { useProjectStore } from "./stores/useStore";
import Home from "./components/home";
import ProjectDashboard from "./components/projectDashboard";

function App() {
	const current_view = useProjectStore((state) => state.current_view);

	if (current_view == "Home") {
		return (
			<div>
				<Home />
			</div>
		);
	} else {
		return (
			<div>
				<ProjectDashboard />
			</div>
		);
	}
}
export default App;
