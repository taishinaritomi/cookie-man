import { createEffect, createSignal } from 'solid-js';
import { alphabetSort, booleanSort } from '@/utils/array';
import type { ChromeCookie, CookieSetDetails } from '@/utils/chrome';
import {
  getChromeCookieUrl,
  getChromeCookies,
  getCurrentUrl,
  removeChromeCookie,
  setChromeCookie,
} from '@/utils/chrome';
import { unixTimeToDate } from '@/utils/date';

// Types

export type Cookie = {
  match: boolean;
  searchName: string;
  displayUrl: string;
  displayExpiration: string;
  chromeCookie: ChromeCookie;
};

export type CookieSameSite = ChromeCookie['sameSite'];

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

const getSearchText = (text: string): [text: string, isUrl: boolean] => {
  const isUrl = text.startsWith('#');
  return isUrl ? [text.slice(1), isUrl] : [text, isUrl];
};

const searchCookiesSort = (cookies: Cookie[]) => {
  const [searchText, isUrl] = getSearchText(searchInput() || '');
  const newCookie = cookies
    .map((cookie) => {
      const match = searchText
        ? isUrl
          ? cookie.displayUrl.includes(searchText)
          : cookie.searchName.includes(searchText)
        : false;
      return Object.assign({}, cookie, { match });
    })
    .sort(alphabetSort('searchName'))
    .sort(booleanSort('match'));
  return newCookie;
};

const refreshCurrentCookies = async () => {
  const chromeCookies = await getChromeCookies(currentUrl());
  const currentCookies = chromeCookies.map((chromeCookie) => {
    return chromeCookieFormat(chromeCookie);
  });
  setCookies(() => searchCookiesSort(currentCookies));
};

export const initCookies = async () => {
  const currentUrl = await getCurrentUrl();
  if (currentUrl) {
    setCurrentUrl(currentUrl);
    searchInput() && setSearchInput('');
    setIsOpenAddCookie(false);
    await refreshCurrentCookies();
  }
};

export const refreshCookies = async () => {
  await Promise.all([initCookies(), new Promise((r) => setTimeout(r, 150))]);
};

export const searchCookies = () => {
  setCookies((cookies) => searchCookiesSort(cookies));
};

export const addChromeCookie = async (setDetails: CookieSetDetails) => {
  await setChromeCookie(setDetails);
  await refreshCurrentCookies();
};

export const updateCookie = async (
  oldCookie: Cookie,
  setDetails: CookieSetDetails,
) => {
  await removeChromeCookie(oldCookie.chromeCookie);
  await setChromeCookie(setDetails);
  await refreshCurrentCookies();
};

export const removeCookie = async ({ chromeCookie }: Cookie) => {
  await removeChromeCookie(chromeCookie);
  await refreshCurrentCookies();
};
