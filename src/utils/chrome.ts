/*
  https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/popup.js#L70
  TODO: When .domain.com(hostOnly: true) is deleted, .domain.com(hostOnly: false) is also deleted.
*/
export function generateCookieURL(chromeCookie: chrome.cookies.Cookie) {
  const protocol = chromeCookie.secure ? "https:" : "http:";

  return `${protocol}//${chromeCookie.domain}${chromeCookie.path}`;
}

export function generatePrettyCookieURL(chromeCookie: chrome.cookies.Cookie) {
  const protocol = chromeCookie.secure ? "https" : "http";
  let separator = "://";

  if (!chromeCookie.hostOnly && chromeCookie.domain.startsWith(".")) {
    separator = "://*";
  }

  return `${protocol}${separator}${chromeCookie.domain}${chromeCookie.path}`;
}

export async function getCurrentURL() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return currentTab?.url;
}
