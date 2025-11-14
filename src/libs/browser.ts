import { type Browser, browser } from "wxt/browser";

export type CookiePrefix = "secure" | "host" | "http" | "host_http" | null;

export type CookieTag =
  | "prefix_secure"
  | "prefix_host"
  | "prefix_http"
  | "prefix_host_http"
  | "same_site_lax"
  | "same_site_strict"
  | "same_site_none"
  | "secure"
  | "session"
  | "http_only"
  | "host_only";

export interface Cookie {
  id: string;
  displayURL: string;
  cookiePrefix: CookiePrefix;
  cookieTags: CookieTag[];
  browserCookie: Browser.cookies.Cookie;
}

export type CookieSameSite = Browser.cookies.Cookie["sameSite"];

export type SetCookie = Browser.cookies.SetDetails;

export type UpdateSetCookie = Partial<
  Omit<SetCookie, "url" | "storeId"> & { hostOnly: boolean; session: boolean }
>;

/*
  https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/popup.js#L70
  TODO: When .domain.com(hostOnly: true) is deleted, .domain.com(hostOnly: false) is also deleted.
*/
export function generateCookieURL(chromeCookie: Browser.cookies.Cookie) {
  const protocol = chromeCookie.secure ? "https:" : "http:";

  return `${protocol}//${chromeCookie.domain}${chromeCookie.path}`;
}

export function generatePrettyCookieURL(chromeCookie: Browser.cookies.Cookie) {
  const protocol = chromeCookie.secure ? "https" : "http";
  let separator = "://";

  if (!chromeCookie.hostOnly && chromeCookie.domain.startsWith(".")) {
    separator = "://*";
  }

  return `${protocol}${separator}${chromeCookie.domain}${chromeCookie.path}`;
}

function generateCookiePrefix(name: string): CookiePrefix {
  if (name.startsWith("__Secure-")) return "secure";
  if (name.startsWith("__Host-")) return "host";
  if (name.startsWith("__Http-")) return "http";
  if (name.startsWith("__Host-Http-")) return "host_http";

  return null;
}

function generateCookieTags(cookie: Browser.cookies.Cookie): CookieTag[] {
  const tags: CookieTag[] = [];

  const prefix = generateCookiePrefix(cookie.name);

  if (prefix === "secure") tags.push("prefix_secure");
  if (prefix === "host") tags.push("prefix_host");
  if (prefix === "http") tags.push("prefix_http");
  if (prefix === "host_http") tags.push("prefix_host_http");
  if (cookie.secure) tags.push("secure");
  if (cookie.hostOnly) tags.push("host_only");
  if (cookie.httpOnly) tags.push("http_only");

  if (cookie.sameSite === "lax") tags.push("same_site_lax");
  if (cookie.sameSite === "strict") tags.push("same_site_strict");
  if (cookie.sameSite === "no_restriction") tags.push("same_site_none");

  if (cookie.session) tags.push("session");

  return tags;
}

export function formatCookie(browserCookie: Browser.cookies.Cookie): Cookie {
  return {
    id: crypto.randomUUID(),
    cookiePrefix: generateCookiePrefix(browserCookie.name),
    cookieTags: generateCookieTags(browserCookie),
    displayURL: generatePrettyCookieURL(browserCookie),
    browserCookie,
  };
}

export async function getCookies(url: string | null) {
  const start = performance.now();

  const cookies = await browser.cookies.getAll({ url: url ?? undefined });

  console.log("getCookies", performance.now() - start);

  return cookies;
}

export async function createCookie(setCookie: SetCookie) {
  console.log(setCookie);

  await browser.cookies.set(setCookie);
}

export async function updateCookie(
  cookie: Cookie,
  updateCookie: UpdateSetCookie,
): Promise<Cookie | null> {
  // await browser.cookies.remove({
  //   url: generateCookieURL(cookie.browserCookie),
  //   name: cookie.browserCookie.name,
  //   storeId: cookie.browserCookie.storeId,
  // });

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
      : (updateCookie.expirationDate ?? cookie.browserCookie.expirationDate),
    storeId: cookie.browserCookie.storeId,
    secure: updateCookie.secure ?? cookie.browserCookie.secure,
    httpOnly: updateCookie.httpOnly ?? cookie.browserCookie.httpOnly,
    sameSite: updateCookie.sameSite ?? cookie.browserCookie.sameSite,
  };

  console.log(setCookie);

  const result = await browser.cookies.set(setCookie);

  if (result) {
    const formatted = formatCookie(result);

    return { ...formatted, id: cookie.id } satisfies Cookie;
  }

  return null;
}

export function getDefaultCookie(currentURL: string): Cookie {
  const url = new URL(currentURL ?? "http://example.com");
  url.port = "";

  return formatCookie({
    name: "",
    storeId: "",
    value: "",
    domain: url.host,
    path: "/",
    sameSite: "lax",
    hostOnly: true,
    httpOnly: false,
    secure: false,
    session: true,
    // expirationDate: undefined,
  });
}

export async function removeCookie(cookie: Cookie) {
  await browser.cookies.remove({
    url: generateCookieURL(cookie.browserCookie),
    name: cookie.browserCookie.name,
    storeId: cookie.browserCookie.storeId,
  });
}

export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab;
}

export async function getCurrentURL() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return currentTab?.url ?? null;
}
