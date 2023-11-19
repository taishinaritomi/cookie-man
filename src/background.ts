const handler = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentUrl = currentTab?.url;
  if (currentUrl) {
    const cookies = await chrome.cookies.getAll({ url: currentUrl });
    if (cookies.length !== 0) {
      await chrome.action.setBadgeBackgroundColor({ color: "#a16207" });
      await chrome.action.setBadgeText({ text: cookies.length.toString() });
      return;
    }
  }
  await chrome.action.setBadgeText({ text: "" });
};

chrome.tabs.onActivated.addListener(handler);
chrome.cookies.onChanged.addListener(handler);
