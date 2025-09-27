import Fuse from "fuse.js";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type Browser, browser } from "wxt/browser";
import {
  generateCookieURL,
  generatePrettyCookieURL,
} from "../../../utils/browser";

export interface Cookie {
  id: string;
  displayURL: string;
  browserCookie: Browser.cookies.Cookie;
}

export type CookieSameSite = Browser.cookies.Cookie["sameSite"];

export type SetCookie = Browser.cookies.SetDetails;
export type UpdateSetCookie = Partial<
  Omit<SetCookie, "url" | "storeId"> & { hostOnly: boolean; session: boolean }
>;

function formatCookie(browserCookie: Browser.cookies.Cookie): Cookie {
  return {
    id: crypto.randomUUID(),
    browserCookie,
    displayURL: generatePrettyCookieURL(browserCookie),
  };
}

async function getCookies(url: string | null) {
  const start = performance.now();

  const cookies = await browser.cookies.getAll({ url: url ?? undefined });

  console.log("getCookies", performance.now() - start);
  return cookies;
}

export function useSearchText() {
  const { searchText, setSearchText } = useCookieContext();
  return { searchText, setSearchText };
}

export function useCookie() {
  const {
    currentTab,
    setCurrentTab,
    cookies: _cookies,
    refreshCookie,
    updateCookies,
  } = useCookieContext();

  // const cookies = use(_cookies);
  // const currentURL = use(_currentURL);

  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);

  useEffect(() => {
    setCurrentURL(currentTab?.url ?? null);
  }, [currentTab]);

  useEffect(() => {
    _cookies.then((v) => setCookies(v));
  }, [_cookies]);

  const defaultCookie = useMemo(() => {
    const url = new URL(currentURL ?? "http://example.com");
    url.port = "";

    return formatCookie({
      name: "",
      storeId: "",
      // expirationDate: undefined,
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
    await browser.cookies.set(setCookie);
  }

  async function updateCookie(id: string, updateCookie: UpdateSetCookie) {
    const cookie = cookies.find((c) => c.id === id);

    if (cookie && currentURL) {
      await browser.cookies.remove({
        url: generateCookieURL(cookie.browserCookie),
        name: cookie.browserCookie.name,
        storeId: cookie.browserCookie.storeId,
      });

      const setCookie: SetCookie = {
        url: generateCookieURL(cookie.browserCookie),
        name: updateCookie.name ?? cookie.browserCookie.name,
        value: updateCookie.value ?? cookie.browserCookie.value,
        domain: updateCookie.hostOnly
          ? undefined
          : (updateCookie.domain ?? cookie.browserCookie.domain),
        path: updateCookie.path ?? cookie.browserCookie.path,
        expirationDate: updateCookie.session
          ? undefined
          : (updateCookie.expirationDate ??
            cookie.browserCookie.expirationDate),
        storeId: cookie.browserCookie.storeId,
        secure: updateCookie.secure ?? cookie.browserCookie.secure,
        httpOnly: updateCookie.httpOnly ?? cookie.browserCookie.httpOnly,
        sameSite: updateCookie.sameSite ?? cookie.browserCookie.sameSite,
      };

      const newCookie = await browser.cookies.set(setCookie);

      if (newCookie) {
        updateCookies((cookies) => {
          const updatedCookies = cookies.map((cookie) => {
            if (cookie.id === id) {
              const formattedCookie = formatCookie(newCookie);
              formattedCookie.id = id;

              return formattedCookie;
            }
            return cookie;
          });

          return updatedCookies;
        });
      }
    }
  }

  async function removeCookie(cookie: Cookie) {
    await browser.cookies.remove({
      url: generateCookieURL(cookie.browserCookie),
      name: cookie.browserCookie.name,
      storeId: cookie.browserCookie.storeId,
    });
  }

  return {
    currentURL,
    currentTab,
    setCurrentTab,
    cookies,
    defaultCookie,
    createCookie,
    updateCookie,
    removeCookie,
    refreshCookie,
  };
}

interface CookieContext {
  currentTab: Browser.tabs.Tab | null;
  setCurrentTab: Dispatch<SetStateAction<Browser.tabs.Tab | null>>;
  cookies: Promise<Cookie[]>;
  updateCookies: Dispatch<SetStateAction<Cookie[]>>;
  refreshCookie(): void;
  searchText: string;
  setSearchText(text: string): void;
  openCookieId: string | null;
  setOpenCookieId: Dispatch<SetStateAction<string | null>>;
}

const CookieContext = createContext<CookieContext | null>(null);

function useCookieContext() {
  const context = useContext(CookieContext);
  if (!context)
    throw new Error("useCookie must be used within a CookieProvider");
  return context;
}

export function CookieProvider(props: PropsWithChildren) {
  const [searchText, setSearchText] = useState("");
  const [currentTab, setCurrentTab] = useState<Browser.tabs.Tab | null>(null);
  // const [currentURL] = useState(() => getCurrentURL());

  const cookies = useMemo(async () => {
    const _cookies = await getCookies(currentTab?.url ?? null);

    return { cookies: _cookies.map(formatCookie), time: performance.now() };
  }, [currentTab]);

  const [updatedCookies, setUpdatedCookies] = useState<{
    cookies: Cookie[];
    time: number;
  } | null>(null);

  const [openCookieId, setOpenCookieId] = useState<string | null>(null);

  const refreshCookies = useCallback(async () => {
    const _currentURL = currentTab?.url;
    const cookies = _currentURL ? await getCookies(_currentURL) : [];
    setUpdatedCookies({
      cookies: cookies.map(formatCookie),
      time: performance.now(),
    });
  }, [currentTab?.url]);

  const sortedCookies = useMemo(async () => {
    const isUpdated = (updatedCookies?.time ?? 0) > (await cookies).time;

    const _cookies = isUpdated
      ? (updatedCookies?.cookies ?? [])
      : (await cookies).cookies;

    if (!isUpdated) {
      setUpdatedCookies(null);
    }

    if (searchText) {
      const fuse = new Fuse(_cookies, {
        keys: [
          "browserCookie.name",
          "browserCookie.domain",
          "browserCookie.path",
        ],
      });

      return fuse.search(searchText).map((r) => {
        return r.item;
      });
    }

    return _cookies;
  }, [cookies, updatedCookies, searchText]);

  async function updateCookies(value: SetStateAction<Cookie[]>) {
    if (value instanceof Function) {
      setUpdatedCookies({
        cookies: value((updatedCookies ?? (await cookies)).cookies),
        time: performance.now(),
      });
    } else {
      setUpdatedCookies({
        cookies: value,
        time: performance.now(),
      });
    }
  }

  // useEffect(() => {
  //   browser.cookies.onChanged.addListener(loadCookies);
  //   return () => {
  //     browser.cookies.onChanged.removeListener(loadCookies);
  //   };
  // }, [loadCookies]);

  return (
    <CookieContext
      value={{
        currentTab,
        setCurrentTab,
        cookies: sortedCookies,
        updateCookies,
        refreshCookie: refreshCookies,
        searchText: searchText,
        setSearchText: setSearchText,
        openCookieId,
        setOpenCookieId,
      }}
    >
      {props.children}
    </CookieContext>
  );
}
