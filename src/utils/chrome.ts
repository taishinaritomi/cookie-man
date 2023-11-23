/*
  https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/popup.js#L70
  TODO: When .domain.com(hostOnly: true) is deleted, .domain.com(hostOnly: false) is also deleted.
*/
export function createCookieURL(chromeCookie: chrome.cookies.Cookie) {
  const protocol = chromeCookie.secure ? "https:" : "http:";
  return `${protocol}//${chromeCookie.domain}${chromeCookie.path}`;
}

export async function getCurrentURL() {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return currentTab?.url;
}
