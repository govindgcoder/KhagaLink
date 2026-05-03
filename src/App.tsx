import { useState, useEffect } from "react";
import { useProjectStore } from "./stores/useStore";
import Home from "./components/home";
import ProjectDashboard from "./components/projectDashboard";
import LoadingOverlay from "./components/LoadingOverlay";

function App() {
  const current_view = useProjectStore((state) => state.current_view);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 800);
    return () => clearTimeout(timer);
  }, [current_view]);

  const handleViewChange = (view: string) => {
    if (view === "Project") {
      setShowLoading(true);
    }
  };

  if (showLoading) {
    return <LoadingOverlay text="Khagalink..." />;
  }

  if (current_view === "Home") {
    return (
      <div>
        <Home onNavigate={handleViewChange} />
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