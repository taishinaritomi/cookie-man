import { useMemo, useState } from "react";
import type { Browser } from "#imports";
import { type Cookie, getDefaultCookie } from "../../../libs/browser";
import { CookieForm, CookieFormMode } from "./cookie-form";

const Open = { None: 0, Add: 1, Search: 2 } as const;
type Open = (typeof Open)[keyof typeof Open];

type HeaderProps = {
  selectedTab: Browser.tabs.Tab | null;
  cookies: Cookie[];
  searchText: string;
  setSearchText: (text: string) => void;
};

export function Header({
  cookies,
  selectedTab,
  searchText,
  setSearchText,
}: HeaderProps) {
  const [open, setOpen] = useState<Open>(Open.None);

  function toggleOpen(open: Open) {
    setOpen((current) => (current === open ? Open.None : open));
  }

  const defaultCookie = useMemo(
    () => getDefaultCookie(selectedTab?.url ?? "http://example.com"),
    [selectedTab?.url],
  );

  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          value={searchText ?? ""}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          type="text"
          placeholder="Search cookies..."
          className="grow block rounded-xl border p-2 leading-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={async () => toggleOpen(Open.Add)}
          className="flex items-center justify-center rounded-full border border-blue-700 bg-blue-500 p-2"
        >
          <div className="size-4 i-ph-plus text-white" />
        </button>
      </div>

      {open === Open.Add && (
        <div className="rounded border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-800">
          <CookieForm
            cookie={defaultCookie}
            mode={CookieFormMode.Create}
            onSave={() => {
              // create_newCookie(newCookie);
              setOpen(Open.None);
            }}
            onCancel={() => setOpen(Open.None)}
          />
        </div>
      )}
      {open === Open.Search && (
        <div>
          <input
            onInput={async (e) => setSearchText(e.currentTarget.value)}
            type="text"
            placeholder="Search cookies..."
            className="w-full rounded-xl border border-gray-300 bg-gray-100 p-2 leading-4 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      )}
      <div className="text-xs text-gray-400 truncate flex gap-2">
        <span>count {cookies.length}</span>
        <span className="truncate">{selectedTab?.url ?? "ALL"}</span>
      </div>
    </header>
  );
}
