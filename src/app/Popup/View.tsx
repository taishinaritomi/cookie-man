import { CookieList } from "./components/CookieList";
import { Header } from "./components/Header";
import { CookieProvider } from "./providers/cookie";

export function PopupView() {
  return (
    <CookieProvider>
      <div class="flex w-[400px] flex-col gap-2 p-2 pr-1">
        <Header />
        <CookieList />
      </div>
    </CookieProvider>
  );
}
