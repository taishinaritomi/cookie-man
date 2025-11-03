// import * as Accordion from "@radix-ui/react-accordion";

import { Accordion } from "@base-ui-components/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import type { Cookie } from "../../../libs/browser";
import { CookieItem } from "./cookie-item";

type CookieListProps = {
  cookies: Cookie[];
  onRefetch: () => void;
};

export function CookieList({ cookies, onRefetch }: CookieListProps) {
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
                    onRefetch={() => onRefetch()}
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
