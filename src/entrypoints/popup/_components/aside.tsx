import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { Browser } from "wxt/browser";
import { browser } from "#imports";
import { useEffectUntil } from "../../../hooks/effect";
import { useCurrentTab, useSearchTabs, useTabs } from "../../../hooks/tab";
import { cls } from "../../../utils/cls";

const manifest = browser.runtime.getManifest();

type AsideProps = {
  selectedTab: Browser.tabs.Tab | null;
  setSelectedTab: (tab: Browser.tabs.Tab | null) => void;
};

export function Aside({ selectedTab, setSelectedTab }: AsideProps) {
  const [searchText, setSearchText] = useState("");

  const all = useTabs();
  const search = useSearchTabs(all, searchText);
  const tabs = useMemo(() => [null, ...search] as const, [search]);

  const currentTab = useCurrentTab();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    getScrollElement: () => scrollRef.current,
    count: tabs.length,
    estimateSize: () => 66,
    overscan: 10,
    scrollPaddingEnd: 8,
  });

  useEffectUntil(() => {
    const tab = currentTab ?? null;

    if (tab === null) return false;

    const index = tabs.findIndex((t) => {
      if (t === null) return false;

      return t.id === tab.id;
    });

    if (index === -1) return false;

    setSelectedTab(tab);
    virtualizer.scrollToIndex(index);

    return true;
  }, [virtualizer, tabs, setSelectedTab, currentTab]);

  return (
    <aside className="bg-gray-50 dark:bg-gray-950 flex h-full flex-col justify-between">
      <div className="p-2  flex flex-col gap-2">
        <div className="sticky">
          <input
            defaultValue={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="Search tabs..."
            className={cls(
              "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 placeholder:text-gray-400",
            )}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-scroll overscroll-y-contain p-2 h-full"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((item) => {
            const tab = tabs[item.index] as Browser.tabs.Tab | null;
            const isSelected = tab?.id === selectedTab?.id;

            return (
              <button
                type="button"
                className={cls(
                  "p-3 text-left w-full rounded-xl border border-black/0 flex flex-col gap-1",
                  isSelected &&
                    "bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
                )}
                key={item.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${item.size}px`,
                  transform: `translateY(${item.start}px)`,
                }}
                onClick={() => {
                  setSelectedTab(tab);
                }}
              >
                <div className="flex items-center gap-2">
                  {tab?.favIconUrl && (
                    <img src={tab.favIconUrl} className="size-4" alt="" />
                  )}

                  {tab === null && (
                    <span className="i-ph-globe-bold size-4 text-blue-500" />
                  )}

                  <div className="font-semibold text-sm truncate">
                    {tab !== null ? tab.title : "All"}
                  </div>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {tab !== null ? tab.url : "Search for all cookies."}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center p-1 text-xs text-gray-400 font-medium">
        {manifest.name} {manifest.version}
      </div>
    </aside>
  );
}
