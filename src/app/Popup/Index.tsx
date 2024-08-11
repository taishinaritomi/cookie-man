import { Suspense } from "react";
import { CookieList } from "./components/CookieList";
import { Header } from "./components/Header";
import { CookieProvider } from "./providers/cookie";

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
