import { Suspense } from "react";
import { CookieList } from "./components/CookieList";
import { Header } from "./components/Header";
import { CookieProvider } from "./providers/cookie";

export function PopupView() {
  return (
    <div className="flex w-[400px] h-[600px] flex-col gap-2 p-2 pr-1">
      <Suspense fallback={<Loading />}>
        <CookieProvider>
          <Header />
          <Suspense fallback={"vvv"}>
            <CookieList />
          </Suspense>
        </CookieProvider>
      </Suspense>
    </div>
  );
}

function Loading() {
  return <div className="h-96" />;
}
