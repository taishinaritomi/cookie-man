import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { type Browser, browser } from "#imports";

export function useTabs() {
  const [tabs, setTabs] = useState<Browser.tabs.Tab[]>([]);

  useEffect(() => {
    async function fetchTabs() {
      const tabs = await browser.tabs.query({});
      setTabs(tabs);
    }

    fetchTabs();

    browser.tabs.onCreated.addListener(fetchTabs);
    browser.tabs.onUpdated.addListener(fetchTabs);
    browser.tabs.onRemoved.addListener(fetchTabs);

    return () => {
      browser.tabs.onCreated.removeListener(fetchTabs);
      browser.tabs.onUpdated.removeListener(fetchTabs);
      browser.tabs.onRemoved.removeListener(fetchTabs);
    };
  }, []);

  return tabs;
}

export function useSearchTabs(tabs: Browser.tabs.Tab[], searchText: string) {
  return useMemo(() => {
    if (!searchText) return tabs;

    const fuse = new Fuse(tabs, {
      keys: ["title", "url"],
    });

    return fuse.search(searchText).map((r) => {
      return r.item;
    });
  }, [tabs, searchText]);
}

export function useCurrentTab() {
  const [currentTab, setCurrentTab] = useState<Browser.tabs.Tab | null>(null);

  useEffect(() => {
    async function fetchCurrentTab() {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      console.log(tab);

      setCurrentTab(tab ?? null);
    }

    fetchCurrentTab();

    browser.tabs.onActivated.addListener(fetchCurrentTab);
    browser.tabs.onUpdated.addListener(fetchCurrentTab);

    return () => {
      browser.tabs.onActivated.removeListener(fetchCurrentTab);
      browser.tabs.onUpdated.removeListener(fetchCurrentTab);
    };
  }, []);

  return currentTab;
}
