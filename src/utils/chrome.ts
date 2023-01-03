export type ChromeCookie = chrome.cookies.Cookie;
export type CookieSetDetails = chrome.cookies.SetDetails;

export const getCurrentUrl = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab?.url;
};

/*
  https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/popup.js#L70
  TODO:　When .domain.com(hostOnly: true) is deleted, .domain.com(hostOnly: false) is also deleted.
*/
export const getChromeCookieUrl = (chromeCookie: ChromeCookie) => {
  const protocol = chromeCookie.secure ? 'https:' : 'http:';
  return `${protocol}//${chromeCookie.domain}${chromeCookie.path}`;
};

export const getCurrentChromeCookies = async (url: string) => {
  return await chrome.cookies.getAll({ url });
};

export const setChromeCookie = async (
  setDetails: chrome.cookies.SetDetails,
) => {
  return await chrome.cookies.set(setDetails);
};

export const removeChromeCookie = async (chromeCookie: ChromeCookie) => {
  return await chrome.cookies.remove({
    url: getChromeCookieUrl(chromeCookie),
    name: chromeCookie.name,
    storeId: chromeCookie.storeId,
  });
};
