const handler = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const cookies = await chrome.cookies.getAll({ url: currentTab?.url });
  const cookiesLengthBadge =
    cookies.length === 0 ? '' : cookies.length.toString();
  await chrome.action.setBadgeText({ text: cookiesLengthBadge });
  await chrome.action.setBadgeBackgroundColor({ color: '#a16207' });
};

chrome.tabs.onActivated.addListener(handler);
chrome.cookies.onChanged.addListener(handler);
