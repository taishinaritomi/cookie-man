// import * as Accordion from "@radix-ui/react-accordion";

import { Accordion } from "@base-ui-components/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import { type Cookie, removeCookie, updateCookie } from "../../../libs/browser";
import { cls } from "../../../utils/cls";
import { CookieForm, CookieFormMode } from "./cookie-form";

type CookieListProps = {
  cookies: Cookie[];
};

export function CookieList({ cookies }: CookieListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [accordions, setAccordions] = useState<string[]>([]);

  const virtualizer = useWindowVirtualizer({
    count: cookies.length,
    estimateSize: () => 64,
    overscan: 50,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    scrollPaddingEnd: 8,
  });

  const items = virtualizer.getVirtualItems();

  const transformY =
    (items[0]?.start ?? 0) - (parentRef.current?.offsetTop ?? 0);

  return (
    <div ref={parentRef}>
      {cookies.length === 0 && <NoCookie />}
      {cookies.length > 0 && (
        <Accordion.Root
          value={accordions}
          onValueChange={(value) => setAccordions(value)}
          multiple
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${transformY ? transformY + 8 : 0}px)`,
            }}
            className="flex flex-col gap-2 pb-2"
          >
            {items.map((item) => {
              const cookie = cookies[item.index];

              if (!cookie) return null;

              return (
                <div
                  key={cookie.id}
                  data-index={item.index}
                  ref={virtualizer.measureElement}
                >
                  <CookieItem
                    cookie={cookie}
                    onClose={() => {
                      setAccordions((prev) => {
                        return prev.filter((id) => id !== cookie.id);
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Accordion.Root>
      )}
    </div>
  );
}

function NoCookie() {
  return (
    <div className="my-8 flex items-center justify-center">
      <p className="text-xs">No Cookie</p>
    </div>
  );
}

type CookieItemProps = {
  cookie: Cookie;
  onClose?: () => void;
};

function CookieItem({ cookie, onClose }: CookieItemProps) {
  return (
    <Accordion.Item
      value={cookie.id}
      className={cls(
        "border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-slate-800 group",
      )}
    >
      <Accordion.Trigger className={cls("p-2 rounded-xl truncate w-full")}>
        <div className="flex items-center gap-2">
          <div
            className={
              "transition-transform size-4 rotate-0  group-data-[state=open]:rotate-90 i-ph-caret-right text-slate-500 dark:text-slate-400 shrink-0"
            }
          />
          <div className="flex flex-col gap-1 overflow-hidden text-left">
            <p
              className={cls(
                "font-bold text-base pl-1 truncate",
                cookie.browserCookie.name ? "" : "opacity-50",
              )}
            >
              {cookie.browserCookie.name || "unknown"}
            </p>

            <p className="truncate text-slate-500 dark:text-slate-400">
              {cookie.displayURL}
            </p>
            {cookie.browserCookie.partitionKey?.topLevelSite}
          </div>
        </div>
      </Accordion.Trigger>

      <Accordion.Panel
        className={cls("p-3 border-t border-slate-300 dark:border-slate-600")}
      >
        <CookieForm
          cookie={cookie}
          mode={CookieFormMode.Edit}
          onUpdate={(newCookie) => updateCookie(cookie, newCookie)}
          onRemove={() => removeCookie(cookie)}
          onCancel={() => onClose?.()}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
