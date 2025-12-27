import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// to prevent the right-click context menu
// document.addEventListener('contextmenu', event => {
//   event.preventDefault();
// });


ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<div style={{ minWidth: "800px" }}>
			<App />
		</div>
	</React.StrictMode>,
);
