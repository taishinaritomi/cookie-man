import "../../globals.css";

import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { GlobalProvider } from "../../components/globals/global-provider";
import { CookieList } from "./_components/CookieList";
import { Header } from "./_components/Header";
import { CookieProvider } from "./_providers/cookie-provider";

export function Popup() {
  return (
    <div className="flex flex-col gap-2 p-2 pr-1 w-[400px]">
      <Suspense>
        <CookieProvider>
          <Header />
          <Suspense>
            <CookieList />
          </Suspense>
        </CookieProvider>
      </Suspense>
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
