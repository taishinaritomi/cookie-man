import type { Browser } from "wxt/browser";
import type { Cookie } from "../../../libs/browser";

type HeaderProps = {
  selectedTab: Browser.tabs.Tab | null;
  cookies: Cookie[];
  searchText: string;
  setSearchText: (text: string) => void;
  onAddCookie: () => void;
};

export function Header({
  searchText,
  setSearchText,
  onAddCookie,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={searchText ?? ""}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          type="text"
          placeholder="Search cookies..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={() => onAddCookie()}
          className="flex items-center justify-center rounded-full border border-blue-700 bg-blue-500 p-2"
        >
          <div className="size-4 i-ph-plus text-white" />
        </button>
      </div>
    </header>
  );
}
// <div className="text-xs text-gray-400 truncate flex gap-2">
//   <span>{cookies.length} cookies</span>
//   <span className="truncate">{selectedTab?.url ?? "ALL"}</span>
// </div>
