import { Checkbox } from "@base-ui-components/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { type Browser, browser } from "#imports";
import { useCurrentTab, useSearchTabs, useTabs } from "../../../hooks/tab";
import { cls } from "../../../utils/cls";
import { useCookie } from "../_providers/cookie-provider";

const manifest = browser.runtime.getManifest();

export function Aside() {
  const [searchText, setSearchText] = useState("");
  // const [selectedTab, setSelectedTab] = useState<Browser.tabs.Tab | null>(null);
  const { currentTab: selectedTab, setCurrentTab: setSelectedTab } =
    useCookie();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isSetup = useRef<boolean>(false);

  const tabs = useTabs();
  const currentTab = useCurrentTab();
  const searchTabs = useSearchTabs(tabs, searchText);

  const virtualizer = useVirtualizer({
    getScrollElement() {
      return scrollRef.current;
    },
    count: searchTabs.length,
    estimateSize: () => 66,
    overscan: 10,
    scrollPaddingEnd: 8,
  });

  useEffect(() => {
    if (isSetup.current) return;

    if (currentTab?.id) {
      const index = tabs.findIndex((t) => t.id === currentTab.id);

      if (index === -1) return;

      isSetup.current = true;
      setSelectedTab(currentTab);
      virtualizer.scrollToIndex(index);
    }
  }, [virtualizer, currentTab, tabs, setSelectedTab]);

  return (
    <aside className="bg-gray-50 flex h-full flex-col justify-between">
      <div className="p-2  flex flex-col gap-2">
        <div className="sticky">
          <input
            defaultValue={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="Search tabs..."
            className={cls(
              "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 placeholder:text-gray-400",
            )}
          />
        </div>

        <div className="flex items-center gap-1 text-gray-400 font-medium">
          <label className="flex items-center gap-2">
            <Checkbox.Root
              defaultChecked
              checked={selectedTab === null}
              onCheckedChange={(checked) => {
                if (checked) setSelectedTab(null);
                else {
                  if (currentTab) setSelectedTab(currentTab);
                }
              }}
              className="flex size-4 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 data-[checked]:bg-blue-600 data-[unchecked]:border data-[unchecked]:border-gray-300"
            >
              <Checkbox.Indicator className="flex text-white data-[unchecked]:hidden">
                <span className="i-ph-check-bold"></span>
              </Checkbox.Indicator>
            </Checkbox.Root>
            All Pages
          </label>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-scroll p-1 h-full overflow-hidden"
      >
        {searchTabs.length === 0 && <NoTabs />}

        {searchTabs.length !== 0 && (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((item) => {
              const tab = searchTabs[item.index] as Browser.tabs.Tab;

              return (
                <button
                  type="button"
                  className={cls(
                    "p-3 text-left w-full rounded-xl border border-black/0 flex flex-col gap-1",
                    selectedTab?.id === tab.id && "bg-gray-200 border-gray-300",
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
                    if (!tab.id) return;
                    setSelectedTab(tab);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {tab.favIconUrl && (
                      <img src={tab.favIconUrl} className="size-4" alt="" />
                    )}
                    <div className="font-semibold text-sm truncate">
                      {tab.title}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {tab.url}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="text-center p-1 text-xs text-gray-400">
        {manifest.name} {manifest.version}
      </div>
    </aside>
  );
}

function NoTabs() {
  return (
    <div className="my-4 flex items-center justify-center text-gray-400">
      <p className="text-xs">No Tabs</p>
    </div>
  );
}
