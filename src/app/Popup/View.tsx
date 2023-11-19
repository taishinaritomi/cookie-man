import { CookieList } from "./components/CookieList";
import { Header } from "./components/Header";
import { CookieProvider } from "./providers/cookie";

export function PopupView() {
  return (
    <CookieProvider>
      <div class="w-[400px] p-2 pt-3 flex flex-col gap-3 pr-1">
        <Header />
        <CookieList />
      </div>
    </CookieProvider>
  );
}
