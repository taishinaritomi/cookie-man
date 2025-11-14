import "../../globals.css";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Browser } from "wxt/browser";
import { GlobalProvider } from "../../components/globals/global-provider";
import { Aside } from "./_components/aside";
import { Main } from "./_components/main";

export function Popup() {
  const [selectedTab, setSelectedTab] = useState<Browser.tabs.Tab | null>(null);

  return (
    <div className="w-[700px] h-[600px] bg-gray-50 dark:bg-gray-950">
      <div className="w-60 fixed h-screen border-gray-300 dark:border-gray-600 border-r">
        <Aside selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </div>
      <div className="ml-60">
        <Main selectedTab={selectedTab} />
      </div>
    </div>
  );
}

const popup = document.getElementById("popup");

if (popup) {
  createRoot(popup).render(
    <GlobalProvider>
      <Popup />
    </GlobalProvider>,
  );
}
