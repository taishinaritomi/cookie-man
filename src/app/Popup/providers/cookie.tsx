import { alphabetSort, booleanSort } from "@/utils/array";
import { createCookieURL, getCurrentURL } from "@/utils/chrome";
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

function formatCookie(chromeCookie: chrome.cookies.Cookie): Cookie {
  const displayExpiration = chromeCookie.session
    ? "Session"
    : unixTimeToDate(chromeCookie.expirationDate || 0).toISOString();

  return {
    id: crypto.randomUUID(),
    chromeCookie,
    displayURL: createCookieURL(chromeCookie),
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

const _initURL = getCurrentURL();

function useCurrentURL() {
  const initURL = use(_initURL);

  if (!initURL) throw new Error("No current tab");

  const [currentURL, _setCurrentURL] = useState(initURL);

  async function refreshCurrentURL() {
    const url = await getCurrentURL();
    if (url) _setCurrentURL(url);
  }

  async function setCurrentURL(url: string) {
    _setCurrentURL(url);
  }

  return { currentURL, setCurrentURL, refreshCurrentURL } as const;
}

function useCookies(url: string | null) {
  const [_cookies, _setCookies] = useState(() => {
    return url ? getCookies(url) : Promise.resolve([]);
  });

  const loadCookies = useCallback(() => {
    _setCookies(url ? getCookies(url) : Promise.resolve([]));
  }, [url]);

  useEffect(() => {
    chrome.cookies.onChanged.addListener(loadCookies);
    return () => {
      chrome.cookies.onChanged.removeListener(loadCookies);
    };
  }, [loadCookies]);

  function refreshCookies() {
    loadCookies();
  }

  const cookies = use(_cookies);

  return { cookies, refreshCookies };
}

export interface CookieContext {
  cookies: Cookie[];
  currentURL: string;
  setCurrentURL(url: string): void;
  refreshCurrentURL(): void;
  refreshCookie(): void;
  defaultCookie: Cookie;
  searchText: string;
  setSearchText(text: string): void;

  createCookie(setCookie: SetCookie): void;
  updateCookie(cookie: Cookie, setCookie: SetCookie): void;
  removeCookie(cookie: Cookie): void;
}

const CookieContext = createContext<CookieContext | null>(null);

export function useCookie() {
  const context = useContext(CookieContext);
  if (!context)
    throw new Error("useCookie must be used within a CookieProvider");
  return context;
}

export function CookieProvider(props: PropsWithChildren) {
  const { currentURL, setCurrentURL, refreshCurrentURL } = useCurrentURL();
  const { cookies: _cookies, refreshCookies } = useCookies(currentURL);
  const [searchText, setSearchText] = useState("");

  const formattedCookies = useMemo(
    () => _cookies.map(formatCookie),
    [_cookies],
  );

  const cookies = useMemo(() => {
    const matchedCookie = formattedCookies.map((cookie) => {
      return Object.assign({}, cookie, {
        match: searchText ? cookie.searchName.includes(searchText) : false,
      });
    });

    return sortCookies(matchedCookie);
  }, [formattedCookies, searchText]);

  const defaultCookie = useMemo(() => {
    const url = new URL(currentURL || "http://localhost");
    url.port = "";

    return {
      id: crypto.randomUUID(),
      chromeCookie: {
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
      },
      displayExpiration: "Session",
      displayURL: "",
      match: false,
      searchName: "",
    } satisfies Cookie;
  }, [currentURL]);

  async function createCookie(setCookie: SetCookie) {
    await chrome.cookies.set(setCookie);
  }

  async function updateCookie(cookie: Cookie, setCookie: SetCookie) {
    await chrome.cookies.remove({
      url: createCookieURL(cookie.chromeCookie),
      name: cookie.chromeCookie.name,
      storeId: cookie.chromeCookie.storeId,
    });
    await chrome.cookies.set(setCookie);
  }

  async function removeCookie(cookie: Cookie) {
    await chrome.cookies.remove({
      url: createCookieURL(cookie.chromeCookie),
      name: cookie.chromeCookie.name,
      storeId: cookie.chromeCookie.storeId,
    });
  }

  return (
    <CookieContext
      value={{
        currentURL: currentURL,
        setCurrentURL: setCurrentURL,
        refreshCurrentURL: refreshCurrentURL,
        cookies: cookies,
        defaultCookie: defaultCookie,
        refreshCookie: refreshCookies,
        searchText: searchText,
        setSearchText: setSearchText,
        createCookie: createCookie,
        updateCookie: updateCookie,
        removeCookie: removeCookie,
      }}
    >
      {props.children}
    </CookieContext>
  );
}
