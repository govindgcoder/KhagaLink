import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/useStore";
import { open } from "@tauri-apps/plugin-dialog";
import GraphWidgetComponent from "./GraphWidgetComponent";

export default function Telemetry() {
    return (
    <div
        className="p-8 flex gap-2 h-full bg-[var(--background-color)] rounded-xl overflow-y-auto hide-scrollbar"
        style={{    
            msOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
        }}
    >
        <div className="flex flex-col flex-2 h-full overflow-y-auto hide-scroll-bar">
            dsaodhsj
        </div>
        <div className="flex flex-col flex-1 h-full overflow-y-auto hide-scroll-bar">
            dsaodhsj
        </div>
        
    </div>);
}