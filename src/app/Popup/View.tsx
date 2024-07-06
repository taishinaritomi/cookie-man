import { Suspense } from "react";
import { CookieList } from "./components/CookieList";
import { Header } from "./components/Header";
import { CookieProvider } from "./providers/cookie";

export function PopupView() {
  return (
    <div className="flex w-[400px] h-screen flex-col gap-2 p-2 pr-1">
      <Suspense fallback="cccccccccccccc">
        <CookieProvider>
          <Header />
          <CookieList />
        </CookieProvider>
      </Suspense>
    </div>
  );
}
