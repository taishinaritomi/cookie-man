import { cls } from "@/utils/cls";
import { useRef } from "react";
import {} from "react-aria-components";
import { type Cookie, useCookie } from "../providers/cookie";
import { CookieForm, CookieFormMode } from "./CookieForm";

// https://github.com/adobe/react-spectrum/blob/main/packages/%40react-spectrum/accordion/src/Accordion.tsx

export function CookieList() {
  const { cookies } = useCookie();
  return (
    <div className="flex flex-col gap-2">
      {cookies.length === 0 && <NoCookie />}
      {cookies.length > 0 &&
        cookies.map((cookie) => {
          return <CookieItem key={cookie.id} cookie={cookie} />;
        })}
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
  const { updateCookie2, removeCookie } = useCookie();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details
      ref={detailsRef}
      className={cls(
        "border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 group",
        props.cookie.match && "border-slate-400 dark:border-slate-500",
      )}
    >
      <summary
        className={cls(
          "p-2 rounded cursor-pointer",
          props.cookie.match && "bg-slate-300 dark:bg-slate-600",
          "rounded-b-none",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={
              "transition-transform size-4 rotate-0  group-open:rotate-90 i-ph-caret-right text-slate-800 dark:text-white"
            }
          />
          <div className="flex flex-col gap-1 overflow-hidden text-left">
            <p
              className={cls(
                "font-bold text-base pl-1 truncate",
                props.cookie.chromeCookie.name ? "" : "opacity-50",
              )}
            >
              {props.cookie.chromeCookie.name || "unknown"}
            </p>

            <p className="mb-1 w-fit truncate rounded-full bg-purple-500 px-2 text-white shadow">
              {props.cookie.displayURL}
            </p>
          </div>
        </div>
      </summary>

      <div
        className={cls(
          "p-3 border-t border-slate-300 dark:border-slate-600",
          props.cookie.match && "border-slate-400 dark:border-slate-500",
        )}
      >
        <CookieForm
          cookie={props.cookie}
          mode={CookieFormMode.Edit}
          onUpdate={(c) => updateCookie2(props.cookie.id, c)}
          onRemove={() => removeCookie(props.cookie)}
        />
      </div>
    </details>
  );
}
