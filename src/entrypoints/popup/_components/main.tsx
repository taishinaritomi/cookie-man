import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import type { Browser } from "wxt/browser";
import {
  type Cookie,
  createCookie,
  formatCookie,
  getCookies,
  getDefaultCookie,
} from "../../../libs/browser";
import { CookieForm, CookieFormMode } from "./cookie-form";
import { CookieList } from "./cookie-list";
import { Header } from "./header";

type MainProps = {
  selectedTab: Browser.tabs.Tab | null;
};

export function Main({ selectedTab }: MainProps) {
  const [searchText, setSearchText] = useState("");
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const defaultCookie = useMemo(
    () => getDefaultCookie(selectedTab?.url ?? "http://example.com"),
    [selectedTab?.url],
  );

  const searchedCookies = useMemo(() => {
    if (searchText) {
      const fuse = new Fuse(cookies, {
        keys: [
          "browserCookie.name",
          "browserCookie.domain",
          "browserCookie.path",
        ],
      });

      return fuse.search(searchText).map((r) => r.item);
    }

    return cookies;
  }, [cookies, searchText]);

  useEffect(() => {
    const cookies = getCookies(selectedTab?.url ?? null);

    cookies.then((cookies) => {
      setCookies(cookies.map((cookie) => formatCookie(cookie)));
    });
  }, [selectedTab?.url]);

  return (
    <div className="flex flex-col gap-3 p-2 pr-1 w-full">
      <Header
        cookies={searchedCookies}
        selectedTab={selectedTab}
        searchText={searchText}
        setSearchText={setSearchText}
        onAddCookie={() => setIsCreateOpen((isOpen) => !isOpen)}
      />

      <div className="flex flex-col gap-2">
        {isCreateOpen && (
          <div className="rounded-xl border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-800">
            <CookieForm
              cookie={defaultCookie}
              mode={CookieFormMode.Create}
              onSave={async (cookie) => {
                await createCookie({
                  ...cookie,
                  url: selectedTab?.url ?? "http://example.com",
                });
                setIsCreateOpen(false);
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        )}

        <CookieList cookies={searchedCookies} />
      </div>
    </div>
  );
}
