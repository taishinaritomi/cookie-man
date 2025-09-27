import "../../globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "../../app/Popup/Index";

const app = document.getElementById("app");

if (app) {
  createRoot(app).render(
    <StrictMode>
      <Popup />
    </StrictMode>,
  );
}
