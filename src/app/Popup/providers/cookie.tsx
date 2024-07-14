import { alphabetSort, booleanSort } from "@/utils/array";
import {
  generateCookieURL,
  generatePrettyCookieURL,
  getCurrentURL,
} from "@/utils/chrome";
import { unixTimeToDate } from "@/utils/date";
import {
  type PropsWithChildren,
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Cookie {
  id: string;
  match: boolean;
  searchName: string;
  displayURL: string;
  displayExpiration: string;
  chromeCookie: chrome.cookies.Cookie;
}

export type CookieSameSite = chrome.cookies.Cookie["sameSite"];

export type SetCookie = chrome.cookies.SetDetails;
export type UpdateSetCookie = Partial<
  Omit<SetCookie, "url" | "storeId"> & { hostOnly: boolean; session: boolean }
>;

function formatCookie(chromeCookie: chrome.cookies.Cookie): Cookie {
  const displayExpiration = chromeCookie.session
    ? "Session"
    : unixTimeToDate(chromeCookie.expirationDate || 0).toISOString();

  console.log(chromeCookie);

  return {
    id: `${chromeCookie.domain}-${chromeCookie.name}`,
    chromeCookie,
    displayURL: generatePrettyCookieURL(chromeCookie),
    displayExpiration,
    match: false,
    searchName: chromeCookie.name.toLowerCase(),
  };
}

function sortCookies(cookies: Cookie[]) {
  return cookies.sort(alphabetSort("searchName")).sort(booleanSort("match"));
}

async function getCookies(_url: string) {
  const url = new URL(_url);
  const cookies = await chrome.cookies.getAll({
    url: url.toString(),
  });

  return cookies;
}

export function useCurrentURL() {
  const {
    currentURL: _currentURL,
    setCurrentURL,
    refreshCurrentURL,
  } = useCookieContext();
  const currentURL = use(_currentURL);

  return { currentURL, setCurrentURL, refreshCurrentURL };
}

export function useSearchText() {
  const { searchText, setSearchText } = useCookieContext();
  return { searchText, setSearchText };
}

export function useCookie() {
  const { cookies: _cookies, refreshCookie } = useCookieContext();

  const cookies = use(_cookies);
  const { currentURL } = useCurrentURL();

  const defaultCookie = useMemo(() => {
    const url = new URL(currentURL ?? "http://example.com");
    url.port = "";

    return formatCookie({
      name: "",
      storeId: "",
      expirationDate: undefined,
      value: "",
      domain: url.host,
      path: "/",
      sameSite: "no_restriction",
      hostOnly: true,
      httpOnly: false,
      secure: false,
      session: true,
    });
  }, [currentURL]);

  async function createCookie(setCookie: SetCookie) {
    await chrome.cookies.set(setCookie);
  }

  async function updateCookie(cookie: Cookie, setCookie: SetCookie) {
    await chrome.cookies.remove({
      url: generateCookieURL(cookie.chromeCookie),
      name: cookie.chromeCookie.name,
      storeId: cookie.chromeCookie.storeId,
    });
    await chrome.cookies.set(setCookie);
  }

  async function updateCookie2(id: string, updateCookie: UpdateSetCookie) {
    const cookie = cookies.find((c) => c.id === id);

    if (cookie && currentURL) {
      await chrome.cookies.remove({
        url: generateCookieURL(cookie.chromeCookie),
        name: cookie.chromeCookie.name,
        storeId: cookie.chromeCookie.storeId,
      });

      const setCookie: SetCookie = {
        url: currentURL,
        name: updateCookie.name ?? cookie.chromeCookie.name,
        value: updateCookie.value ?? cookie.chromeCookie.value,
        domain: updateCookie.hostOnly
          ? undefined
          : updateCookie.domain ?? cookie.chromeCookie.domain,
        path: updateCookie.path ?? cookie.chromeCookie.path,
        expirationDate: updateCookie.session
          ? undefined
          : updateCookie.expirationDate ?? cookie.chromeCookie.expirationDate,
        storeId: cookie.chromeCookie.storeId,
        secure: updateCookie.secure ?? cookie.chromeCookie.secure,
        httpOnly: updateCookie.httpOnly ?? cookie.chromeCookie.httpOnly,
        sameSite: updateCookie.sameSite ?? cookie.chromeCookie.sameSite,
      };

      console.log(cookie.chromeCookie);

      await chrome.cookies.set(setCookie);

      refreshCookie();
    }
  }

  async function removeCookie(cookie: Cookie) {
    await chrome.cookies.remove({
      url: generateCookieURL(cookie.chromeCookie),
      name: cookie.chromeCookie.name,
      storeId: cookie.chromeCookie.storeId,
    });
  }

  return {
    cookies,
    defaultCookie,
    createCookie,
    updateCookie,
    updateCookie2,
    removeCookie,
    refreshCookie,
  };
}

export interface CookieContext {
  cookies: Promise<Cookie[]>;
  currentURL: Promise<string | null>;
  setCurrentURL(url: string): void;
  refreshCurrentURL(): void;
  refreshCookie(): void;
  searchText: string;
  setSearchText(text: string): void;
}

const CookieContext = createContext<CookieContext | null>(null);

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (!context)
    throw new Error("useCookie must be used within a CookieProvider");
  return context;
}

export function CookieProvider(props: PropsWithChildren) {
  const [searchText, setSearchText] = useState("");
  const [currentURL, _setCurrentURL] = useState(() => getCurrentURL());
  const [chromeCookies, setChromeCookies] = useState(() => {
    return currentURL.then((url) => {
      return url ? getCookies(url) : Promise.resolve([]);
    });
  });

  async function refreshCurrentURL() {
    _setCurrentURL(getCurrentURL());
  }

  async function setCurrentURL(url: string) {
    _setCurrentURL(Promise.resolve(url));
  }

  const formattedCookies = useMemo(() => {
    return chromeCookies.then((chromeCookies) => {
      return chromeCookies.map(formatCookie);
    });
  }, [chromeCookies]);

  const loadCookies = useCallback(() => {
    const promise = currentURL.then((url) =>
      url ? getCookies(url) : Promise.resolve([]),
    );

    promise.then((v) => setChromeCookies(Promise.resolve(v)));
  }, [currentURL]);

  const cookies = useMemo(async () => {
    return formattedCookies.then((formattedCookies) => {
      const matchedCookie = formattedCookies.map((cookie) => {
        return Object.assign({}, cookie, {
          match: searchText ? cookie.searchName.includes(searchText) : false,
        });
      });

      return sortCookies(matchedCookie);
    });
  }, [formattedCookies, searchText]);

  useEffect(() => {
    chrome.cookies.onChanged.addListener(loadCookies);
    return () => {
      chrome.cookies.onChanged.removeListener(loadCookies);
    };
  }, [loadCookies]);

  function refreshCookies() {
    loadCookies();
  }

  return (
    <CookieContext
      value={{
        currentURL: currentURL,
        setCurrentURL: setCurrentURL,
        refreshCurrentURL: refreshCurrentURL,
        cookies: cookies,
        refreshCookie: refreshCookies,
        searchText: searchText,
        setSearchText: setSearchText,
      }}
    >
      {props.children}
    </CookieContext>
  );
}
