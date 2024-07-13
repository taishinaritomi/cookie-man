import "./popup.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PopupView } from "./app/Popup/View";

const app = document.getElementById("app");
if (app) {
  createRoot(app).render(
    <StrictMode>
      <PopupView />
    </StrictMode>
  );
}
