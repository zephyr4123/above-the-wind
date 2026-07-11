import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/archive.css"; // UI infra: --archive-* token 单一真相源
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
