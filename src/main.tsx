import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/App";
import "@/index.css";

const storedTheme = localStorage.getItem("office-work-tracker-theme") ?? "dark";
document.documentElement.classList.toggle("dark", storedTheme !== "light");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
