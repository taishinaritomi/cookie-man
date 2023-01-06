import { createEffect, createSignal } from 'solid-js';
import { alphabetSort, booleanSort } from '@/utils/array';
import { unixTimeToDate } from '@/utils/date';

// Types
export type ChromeCookie = chrome.cookies.Cookie;
export type CookieSetDetails = chrome.cookies.SetDetails;
export type CookieSameSite = ChromeCookie['sameSite'];
export type Cookie = {
  match: boolean;
  searchName: string;
  displayUrl: string;
  displayExpiration: string;
  chromeCookie: ChromeCookie;
};

// States

const [cookies, setCookies] = createSignal<Cookie[]>([]);
const [currentUrl, setCurrentUrl] = createSignal<string | null>(null);
export const [isOpenAddCookie, setIsOpenAddCookie] =
  createSignal<boolean>(false);
export const [searchInput, setSearchInput] = createSignal<string | null>(null);
export { cookies, currentUrl };

// Effects

createEffect(() => {
  if (searchInput() !== null) {
    setCookies((cookies) => searchCookiesSort(cookies));
  }
});

// Mutators

const chromeCookieFormat = (chromeCookie: ChromeCookie): Cookie => {
  const displayExpiration = chromeCookie.session
    ? 'Session'
    : unixTimeToDate(chromeCookie.expirationDate || 0).toISOString();
  const displayUrl = chromeCookie.hostOnly
    ? getChromeCookieUrl(chromeCookie)
    : getChromeCookieUrl(chromeCookie).replace('://.', '://*.');
  return {
    chromeCookie,
    displayUrl,
    displayExpiration,
    match: false,
    searchName: chromeCookie.name.toLowerCase(),
  };
};

const getSearchText = (text: string): [text: string, isName: boolean] => {
  const isName = !text.startsWith('#');
  return isName ? [text, isName] : [text.slice(1), isName];
};

/*
  https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/popup.js#L70
  TODO:　When .domain.com(hostOnly: true) is deleted, .domain.com(hostOnly: false) is also deleted.
*/
const getChromeCookieUrl = (chromeCookie: ChromeCookie) => {
  const protocol = chromeCookie.secure ? 'https:' : 'http:';
  return `${protocol}//${chromeCookie.domain}${chromeCookie.path}`;
};

const searchCookiesSort = (cookies: Cookie[]) => {
  const [searchText, isName] = getSearchText(searchInput() || '');
  const newCookie = cookies
    .map((cookie) => {
      const match = searchText
        ? isName
          ? cookie.searchName.includes(searchText)
          : cookie.displayUrl.includes(searchText)
        : false;
      return Object.assign({}, cookie, { match });
    })
    .sort(alphabetSort('searchName'))
    .sort(booleanSort('match'));
  return newCookie;
};

const refreshCookies = async () => {
  const chromeCookies = await chrome.cookies.getAll({
    url: currentUrl() || undefined,
  });
  const currentCookies = chromeCookies.map((chromeCookie) => {
    return chromeCookieFormat(chromeCookie);
  });
  setCookies(() => searchCookiesSort(currentCookies));
};

export const initCookies = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentUrl = currentTab?.url;
  if (currentUrl) {
    setCurrentUrl(currentUrl);
    searchInput() && setSearchInput('');
    setIsOpenAddCookie(false);
    await refreshCookies();
  }
};

export const reloadCookies = async () => {
  await Promise.all([initCookies(), new Promise((r) => setTimeout(r, 150))]);
};

export const searchCookies = () => {
  setCookies((cookies) => searchCookiesSort(cookies));
};

export const addCookie = async (setDetails: CookieSetDetails) => {
  await chrome.cookies.set(setDetails);
  await refreshCookies();
};

export const updateCookie = async (
  oldCookie: Cookie,
  setDetails: CookieSetDetails,
) => {
  await chrome.cookies.remove({
    url: getChromeCookieUrl(oldCookie.chromeCookie),
    name: oldCookie.chromeCookie.name,
    storeId: oldCookie.chromeCookie.storeId,
  });
  await chrome.cookies.set(setDetails);
  await refreshCookies();
};

export const removeCookie = async ({ chromeCookie }: Cookie) => {
  await chrome.cookies.remove({
    url: getChromeCookieUrl(chromeCookie),
    name: chromeCookie.name,
    storeId: chromeCookie.storeId,
  });
  await refreshCookies();
};
