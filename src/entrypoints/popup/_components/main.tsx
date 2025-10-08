import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import type { Browser } from "#imports";
import { type Cookie, formatCookie, getCookies } from "../../../libs/browser";
import { CookieList } from "./cookie-list";
import { Header } from "./header";

type MainProps = {
  selectedTab: Browser.tabs.Tab | null;
};

export function Main({ selectedTab }: MainProps) {
  const [searchText, setSearchText] = useState("");
  const [cookies, setCookies] = useState<Cookie[]>([]);

  useEffect(() => {
    const cookies = getCookies(selectedTab?.url ?? null);

    cookies.then((cookies) => {
      setCookies(cookies.map((cookie) => formatCookie(cookie)));
    });
  }, [selectedTab?.url]);

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

  return (
    <div className="flex flex-col gap-2 p-2 pr-1 w-full bg-gray-950">
      <Header
        cookies={searchedCookies}
        selectedTab={selectedTab}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <CookieList cookies={searchedCookies} />
    </div>
  );
}
