import {
  Accordion,
  AccordionButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "solid-headless";
import { IoChevronDown } from "solid-icons/io";
import { For, mergeProps } from "solid-js";
import type { SetCookie } from "../providers/cookie";
import { useCookie, type Cookie } from "../providers/cookie";
import { CookieForm } from "./CookieForm";
import { cls } from "@/utils/cls";

export function CookieList() {
  const { cookies } = useCookie();
  return (
    <Accordion
      class="flex gap-3 flex-col"
      defaultValue={cookies()?.[0]}
      toggleable={true}
      multiple={true}
    >
      <For each={cookies()} fallback={<NoCookie />}>
        {(cookie) => <CookieItem cookie={cookie} />}
      </For>
    </Accordion>
  );
}

function NoCookie() {
  return (
    <div class="flex items-center justify-center my-8">
      <p class="text-sm font-bold">No Cookie</p>
    </div>
  );
}

type AccordionRefs = {
  button: HTMLButtonElement;
};

function CookieItem(_props: { cookie: Cookie }) {
  const { updateCookie, removeCookie } = useCookie();
  const props = mergeProps({ isRemove: true }, _props);
  const accordionRefs = {} as AccordionRefs;
  const onSave = (setCookie: SetCookie) => {
    updateCookie(props.cookie, setCookie);
  };

  const onRemove = async () => await removeCookie(props.cookie);
  const onCancel = async () => accordionRefs.button.click();

  return (
    <AccordionItem
      class={cls(
        "border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700",
        props.cookie.match && "border-slate-400 dark:border-slate-500",
      )}
      value={props.cookie}
    >
      {/* virtual AccordionButton use onCancel */}
      <AccordionButton
        class="hidden"
        ref={accordionRefs.button}
      ></AccordionButton>
      <AccordionHeader>
        {({ isSelected }) => (
          <AccordionButton
            class={cls(
              "w-full p-2 rounded",
              props.cookie.match && "bg-slate-300 dark:bg-slate-600",
              isSelected() && "rounded-b-none",
            )}
          >
            <div class="flex gap-2 items-center">
              <IoChevronDown
                size={16}
                class={cls(
                  "transition-transform -rotate-90",
                  isSelected() && "transform rotate-0",
                )}
              />
              <div class="flex flex-col gap-1 text-left overflow-hidden">
                <p
                  class={cls(
                    "font-bold text-base pl-1 truncate",
                    props.cookie.chromeCookie.name ? "" : "opacity-50",
                  )}
                >
                  {props.cookie.chromeCookie.name || "unknown"}
                </p>

                <p class="truncate text-white bg-purple-500 rounded-full px-2 mb-1 shadow w-fit">
                  {props.cookie.displayUrl}
                </p>
              </div>
            </div>
          </AccordionButton>
        )}
      </AccordionHeader>
      <AccordionPanel
        class={cls(
          "p-3 border-t border-slate-300 dark:border-slate-600",
          props.cookie.match && "border-slate-400 dark:border-slate-500",
        )}
      >
        <CookieForm
          cookie={props.cookie}
          isRemove={true}
          onCancel={onCancel}
          onRemove={onRemove}
          onSave={onSave}
        />
      </AccordionPanel>
    </AccordionItem>
  );
}
