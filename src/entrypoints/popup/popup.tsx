import "../../globals.css";

import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { GlobalProvider } from "../../components/globals/global-provider";
import { Aside } from "./_components/Aside";
import { CookieList } from "./_components/CookieList";
import { Header } from "./_components/Header";
import { CookieProvider } from "./_providers/cookie-provider";

export function Popup() {
  return (
    <div className="w-[700px] h-[600px]">
      <Suspense>
        <CookieProvider>
          <div className="w-[240px] fixed h-screen border-gray-300 dark:border-gray-600 border-r">
            <Aside />
          </div>
          <div className="ml-[240px]">
            <div className="flex flex-col gap-2 p-2 pr-1 w-full">
              <Header />
              <Suspense>
                <CookieList />
              </Suspense>
            </div>
          </div>
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
