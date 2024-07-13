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

function formatCookie(chromeCookie: chrome.cookies.Cookie): Cookie {
  const displayExpiration = chromeCookie.session
    ? "Session"
    : unixTimeToDate(chromeCookie.expirationDate || 0).toISOString();

  return {
    id: crypto.randomUUID(),
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
  const {
    cookies: chromeCookies,
    searchText,
    refreshCookie,
  } = useCookieContext();

  const _cookies = use(chromeCookies);
  const { currentURL } = useCurrentURL();

  const formattedCookies = useMemo(
    () => _cookies.map(formatCookie),
    [_cookies]
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
    const url = new URL(currentURL ?? "http://example.com");
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
      url: generateCookieURL(cookie.chromeCookie),
      name: cookie.chromeCookie.name,
      storeId: cookie.chromeCookie.storeId,
    });
    await chrome.cookies.set(setCookie);
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
    createCookie: createCookie,
    updateCookie: updateCookie,
    removeCookie: removeCookie,
    refreshCookie: refreshCookie,
  };
}

export interface CookieContext {
  cookies: Promise<chrome.cookies.Cookie[]>;
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
  const [currentURL, _setCurrentURL] = useState(() => getCurrentURL());

  async function refreshCurrentURL() {
    _setCurrentURL(getCurrentURL());
  }

  async function setCurrentURL(url: string) {
    _setCurrentURL(Promise.resolve(url));
  }

  const [cookies, setCookies] = useState(() => {
    return currentURL.then((url) =>
      url ? getCookies(url) : Promise.resolve([])
    );
  });

  const loadCookies = useCallback(() => {
    setCookies(
      currentURL.then((url) => {
        return url ? getCookies(url) : Promise.resolve([]);
      })
    );
  }, [currentURL]);

  useEffect(() => {
    chrome.cookies.onChanged.addListener(loadCookies);
    return () => {
      console.log('XXXXXXXXXXXXXXXXXXXXXXXX');
      
      chrome.cookies.onChanged.removeListener(loadCookies);
    };
  }, [loadCookies]);

  function refreshCookies() {
    loadCookies();
  }

  const [searchText, setSearchText] = useState("");

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
