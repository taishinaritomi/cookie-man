import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {

async function handler() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentURL = currentTab?.url;
  if (currentURL) {
    const cookies = await browser.cookies.getAll({ url: currentURL });
    if (cookies.length !== 0) {
      await browser.action.setBadgeBackgroundColor({ color: "#a16207" });
      await browser.action.setBadgeText({ text: cookies.length.toString() });
      return;
    }
  }
  await browser.action.setBadgeText({ text: "" });
}

browser.tabs.onActivated.addListener(handler);
browser.cookies.onChanged.addListener(handler);
});
