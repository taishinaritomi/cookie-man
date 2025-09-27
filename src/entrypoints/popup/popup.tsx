import "../../globals.css";

import { createRoot } from "react-dom/client";
import { GlobalProvider } from "@/components/globals/global-provider";
import { Popup } from "../../app/Popup/Index";

const popup = document.getElementById("popup");

if (popup) {
  createRoot(popup).render(
    <GlobalProvider>
      <Popup />
    </GlobalProvider>,
  );
}
