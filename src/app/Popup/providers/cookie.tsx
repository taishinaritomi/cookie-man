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
import {
  generateCookieURL,
  generatePrettyCookieURL,
  getCurrentURL,
} from "@/utils/chrome";

export interface Cookie {
  id: string;
  displayURL: string;
  chromeCookie: chrome.cookies.Cookie;
}

export type CookieSameSite = chrome.cookies.Cookie["sameSite"];

export type SetCookie = chrome.cookies.SetDetails;
export type UpdateSetCookie = Partial<
  Omit<SetCookie, "url" | "storeId"> & { hostOnly: boolean; session: boolean }
>;

function formatCookie(chromeCookie: chrome.cookies.Cookie): Cookie {
  return {
    id: crypto.randomUUID(),
    chromeCookie,
    displayURL: generatePrettyCookieURL(chromeCookie),
  };
}

async function getCookies(url: string | null) {
  const start = performance.now();
  const cookies = await chrome.cookies.getAll({ url: url ?? undefined });
  console.log("getCookies", performance.now() - start);
  return cookies;
}

export function useSearchText() {
  const { searchText, setSearchText } = useCookieContext();
  return { searchText, setSearchText };
}

export function useIsAllCookies() {
  const { isAllCookies, setIsAllCookies } = useCookieContext();
  return { isAllCookies, setIsAllCookies };
}

export function useCookie() {
  const {
    currentURL: _currentURL,
    cookies: _cookies,
    refreshCookie,
    updateCookies,
  } = useCookieContext();

  // const cookies = use(_cookies);
  // const currentURL = use(_currentURL);

  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);

  useEffect(() => {
    _currentURL.then((v) => setCurrentURL(v));
  }, [_currentURL]);

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
    await chrome.cookies.set(setCookie);
  }

  async function updateCookie(id: string, updateCookie: UpdateSetCookie) {
    const cookie = cookies.find((c) => c.id === id);

    if (cookie && currentURL) {
      await chrome.cookies.remove({
        url: generateCookieURL(cookie.chromeCookie),
        name: cookie.chromeCookie.name,
        storeId: cookie.chromeCookie.storeId,
      });

      const setCookie: SetCookie = {
        url: generateCookieURL(cookie.chromeCookie),
        name: updateCookie.name ?? cookie.chromeCookie.name,
        value: updateCookie.value ?? cookie.chromeCookie.value,
        domain: updateCookie.hostOnly
          ? undefined
          : (updateCookie.domain ?? cookie.chromeCookie.domain),
        path: updateCookie.path ?? cookie.chromeCookie.path,
        expirationDate: updateCookie.session
          ? undefined
          : (updateCookie.expirationDate ?? cookie.chromeCookie.expirationDate),
        storeId: cookie.chromeCookie.storeId,
        secure: updateCookie.secure ?? cookie.chromeCookie.secure,
        httpOnly: updateCookie.httpOnly ?? cookie.chromeCookie.httpOnly,
        sameSite: updateCookie.sameSite ?? cookie.chromeCookie.sameSite,
      };

      const newCookie = await chrome.cookies.set(setCookie);

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
    removeCookie,
    refreshCookie,
  };
}

interface CookieContext {
  currentURL: Promise<string | null>;
  cookies: Promise<Cookie[]>;
  updateCookies: Dispatch<SetStateAction<Cookie[]>>;
  refreshCookie(): void;
  searchText: string;
  setSearchText(text: string): void;
  openCookieId: string | null;
  setOpenCookieId: Dispatch<SetStateAction<string | null>>;
  isAllCookies: boolean;
  setIsAllCookies: Dispatch<SetStateAction<boolean>>;
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
  const [isAllCookies, setIsAllCookies] = useState(false);

  const [currentURL] = useState(() => getCurrentURL());

  const cookies = useMemo(async () => {
    const _cookies = await getCookies(isAllCookies ? null : await currentURL);

    return { cookies: _cookies.map(formatCookie), time: performance.now() };
  }, [isAllCookies, currentURL]);

  const [updatedCookies, setUpdatedCookies] = useState<{
    cookies: Cookie[];
    time: number;
  } | null>(null);

  const [openCookieId, setOpenCookieId] = useState<string | null>(null);

  const refreshCookies = useCallback(async () => {
    const _currentURL = await currentURL;
    const cookies = _currentURL ? await getCookies(_currentURL) : [];
    setUpdatedCookies({
      cookies: cookies.map(formatCookie),
      time: performance.now(),
    });
  }, [currentURL]);

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
        keys: ["chromeCookie.name", "chromeCookie.domain", "chromeCookie.path"],
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
  //   chrome.cookies.onChanged.addListener(loadCookies);
  //   return () => {
  //     chrome.cookies.onChanged.removeListener(loadCookies);
  //   };
  // }, [loadCookies]);

  return (
    <CookieContext
      value={{
        currentURL,
        cookies: sortedCookies,
        updateCookies,
        refreshCookie: refreshCookies,
        searchText: searchText,
        setSearchText: setSearchText,
        openCookieId,
        setOpenCookieId,
        isAllCookies,
        setIsAllCookies,
      }}
    >
      {props.children}
    </CookieContext>
  );
}
