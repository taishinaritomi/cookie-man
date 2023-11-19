import type { JSX, Resource } from "solid-js";
import { createContext, createResource, useContext } from "solid-js";
import { alphabetSort, booleanSort } from "@/utils/array";
import { createCookieURL } from "@/utils/chrome";
import { unixTimeToDate } from "@/utils/date";

export type Cookie = {
  match: boolean;
  searchName: string;
  displayUrl: string;
  displayExpiration: string;
  chromeCookie: chrome.cookies.Cookie;
};

export type CookieSameSite = chrome.cookies.Cookie["sameSite"];

export type SetCookie = chrome.cookies.SetDetails;

export const Context = createContext<{
  cookies: Resource<Cookie[]>;
  currentURL: Resource<string | undefined>;
  changeCurrentURL(url: string): void;
  refreshCurrentURL(): void;
  searchCookie(text: string): void;
  refreshCookie(): void;
  createCookie(setCookie: SetCookie): void;
  updateCookie(cookie: Cookie, setCookie: SetCookie): void;
  removeCookie(cookie: Cookie): void;
  defaultCookie(): Cookie;
}>();

function formatCookie(chromeCookie: chrome.cookies.Cookie): Cookie {
  const displayExpiration = chromeCookie.session
    ? "Session"
    : unixTimeToDate(chromeCookie.expirationDate || 0).toISOString();
  const displayUrl = chromeCookie.hostOnly
    ? createCookieURL(chromeCookie)
    : createCookieURL(chromeCookie).replace("://.", "://*.");
  return {
    chromeCookie,
    displayUrl,
    displayExpiration,
    match: false,
    searchName: chromeCookie.name.toLowerCase(),
  };
}

function sortCookies(cookies: Cookie[]) {
  return cookies.sort(alphabetSort("searchName")).sort(booleanSort("match"));
}

export function useCookie() {
  const context = useContext(Context);
  if (!context) throw new Error("XXXXXXXXX");
  return context;
}

export function CookieProvider(props: { children: JSX.Element }) {
  const [currentURL, { mutate: mutateCurrentURL, refetch: refetchCurrentURL }] =
    createResource(async () => {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      return currentTab?.url;
    });

  const [cookies, { mutate: mutateCookies, refetch: refetchCookies }] =
    createResource(
      () => currentURL(),
      async () => {
        const _url = currentURL();
        if (_url) {
          try {
            const url = new URL(_url);
            const chromeCookies = await chrome.cookies.getAll({
              url: url.toString(),
            });

            return sortCookies(
              chromeCookies.map((chromeCookie) => formatCookie(chromeCookie)),
            );
          } catch {}
        }
        return [];
      },
    );

  chrome.cookies.onChanged.addListener(() => refetchCookies());

  return (
    <Context.Provider
      value={{
        cookies,
        currentURL,
        changeCurrentURL(url: string) {
          mutateCurrentURL(url);
        },

        async refreshCurrentURL() {
          await refetchCurrentURL();
        },

        async searchCookie(text: string) {
          mutateCookies((cookies) => {
            if (cookies) {
              return sortCookies(
                cookies.map((cookie) => {
                  const match = text ? cookie.searchName.includes(text) : false;
                  return Object.assign({}, cookie, { match });
                }),
              );
            } else {
              return [];
            }
          });
        },

        async refreshCookie() {
          refetchCookies();
        },

        async createCookie(setCookie: SetCookie) {
          await chrome.cookies.set(setCookie);
        },

        async updateCookie(cookie: Cookie, setCookie: SetCookie) {
          await chrome.cookies.remove({
            url: createCookieURL(cookie.chromeCookie),
            name: cookie.chromeCookie.name,
            storeId: cookie.chromeCookie.storeId,
          });
          await chrome.cookies.set(setCookie);
        },

        async removeCookie({ chromeCookie }) {
          await chrome.cookies.remove({
            url: createCookieURL(chromeCookie),
            name: chromeCookie.name,
            storeId: chromeCookie.storeId,
          });
        },

        defaultCookie() {
          const url = new URL(currentURL() || "http://localhost");

          url.port = "";

          return {
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
            displayUrl: "",
            match: false,
            searchName: "",
          };
        },
      }}
    >
      {props.children}
    </Context.Provider>
  );
}
