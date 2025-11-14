import { Accordion } from "@base-ui-components/react";
import {
  type Cookie,
  type CookieTag,
  removeCookie,
  updateCookie,
} from "../../../libs/browser";
import { cls } from "../../../utils/cls";
import { CookieForm, CookieFormMode } from "./cookie-form";

type CookieItemProps = {
  cookie: Cookie;
  onRefetch: () => void;
  onClose: () => void;
};

const COOKIE_TAG_LABELS: Record<CookieTag, string> = {
  prefix_secure: "Prefix: Secure",
  prefix_host: "Prefix: Host",
  prefix_http: "Prefix: Http",
  prefix_host_http: "Prefix: Host-Http",
  same_site_lax: "SameSite: Lax",
  same_site_strict: "SameSite: Strict",
  same_site_none: "SameSite: None",
  secure: "Secure",
  session: "Session",
  http_only: "HttpOnly",
  host_only: "HostOnly",
};

export function CookieItem({ cookie, onRefetch, onClose }: CookieItemProps) {
  return (
    <Accordion.Item
      value={cookie.id}
      className={cls(
        "border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 group",
      )}
    >
      <Accordion.Trigger
        className={cls("py-3 px-4 rounded-xl truncate w-full")}
      >
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex flex-col gap-2 overflow-hidden text-left">
            <span className="font-bold text-base pl-1 truncate">
              {cookie.browserCookie.name || "-"}
            </span>

            {cookie.cookieTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cookie.cookieTags.map((tag) => {
                  return (
                    <span
                      key={tag}
                      className={cls(
                        "text-[10px] font-semibold px-2 py-1 rounded-full",
                        tag.startsWith("prefix_") &&
                          "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",

                        tag === "secure" &&
                          "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-400",

                        tag === "session" &&
                          "bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-400",

                        tag === "http_only" &&
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-400",

                        tag === "host_only" &&
                          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",

                        (tag === "same_site_strict" ||
                          tag === "same_site_lax") &&
                          "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200",

                        tag === "same_site_none" &&
                          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400",
                      )}
                    >
                      {COOKIE_TAG_LABELS[tag]}
                    </span>
                  );
                })}
              </div>
            )}

            <span className="truncate text-gray-500 dark:text-gray-400">
              {cookie.displayURL}
            </span>
          </div>

          <div
            className={
              "transition-transform size-4 rotate-0  group-data-open:rotate-90 i-ph-caret-right text-gray-500 dark:text-gray-400 shrink-0"
            }
          />
        </div>
      </Accordion.Trigger>

      <Accordion.Panel
        className={cls("p-3 border-t border-gray-300 dark:border-gray-600")}
      >
        <CookieForm
          cookie={cookie}
          mode={CookieFormMode.Edit}
          onUpdate={(newCookie) => {
            updateCookie(cookie, newCookie);
            onRefetch();
          }}
          onRemove={() => {
            removeCookie(cookie);
            onRefetch();
          }}
          onCancel={() => onClose()}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
