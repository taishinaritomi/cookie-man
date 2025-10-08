import * as Accordion from "@radix-ui/react-accordion";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { cls } from "../../../utils/cls";
import { type Cookie, useCookie } from "../_providers/cookie-provider";
import { CookieForm, CookieFormMode } from "./CookieForm";

export function CookieList() {
  const { cookies } = useCookie();
  const parentRef = useRef<HTMLDivElement | null>(null);

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
          type="multiple"
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
              const cookie = cookies[item.index] as Cookie;

              return (
                <div
                  key={cookie.id}
                  data-index={item.index}
                  ref={virtualizer.measureElement}
                >
                  <CookieItem cookie={cookie} />
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

function CookieItem(props: { cookie: Cookie }) {
  const { updateCookie, removeCookie } = useCookie();

  return (
    <Accordion.Item
      value={props.cookie.id}
      className={cls(
        "border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 group",
        // props.cookie.match && "border-slate-400 dark:border-slate-500"
      )}
    >
      <Accordion.Trigger
        className={cls(
          "p-2 rounded-xl truncate w-full",
          // props.cookie.match && "bg-slate-300 dark:bg-slate-600",
          // "rounded-b-none",
        )}
      >
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
                props.cookie.browserCookie.name ? "" : "opacity-50",
              )}
            >
              {props.cookie.browserCookie.name || "unknown"}
            </p>

            <p className="truncate text-slate-500 dark:text-slate-400">
              {props.cookie.displayURL}
            </p>
            {props.cookie.browserCookie.partitionKey?.hasCrossSiteAncestor}
          </div>
        </div>
      </Accordion.Trigger>

      <Accordion.Content
        className={cls(
          "p-3 border-t border-slate-300 dark:border-slate-600",
          // props.cookie.match && "border-slate-400 dark:border-slate-500"
        )}
      >
        <CookieForm
          cookie={props.cookie}
          mode={CookieFormMode.Edit}
          onUpdate={(c) => updateCookie(props.cookie.id, c)}
          onRemove={() => removeCookie(props.cookie)}
        />
      </Accordion.Content>
    </Accordion.Item>
  );
}
