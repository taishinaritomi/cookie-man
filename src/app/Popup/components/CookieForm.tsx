import { IoChevronDown, IoTrash } from "solid-icons/io";
import { createSignal, mergeProps, onMount } from "solid-js";
import type { Cookie, CookieSameSite, SetCookie } from "../providers/cookie";
import { useCookie } from "../providers/cookie";
import { CheckBox } from "@/components/CheckBox";
import { TextBox } from "@/components/TextBox";
import { cls } from "@/utils/cls";
import { dateToUnixTime } from "@/utils/date";

interface FormRefs {
  name: HTMLInputElement;
  value: HTMLTextAreaElement;
  domain: HTMLInputElement;
  path: HTMLInputElement;
  expiration: HTMLInputElement;
  sameSite: HTMLSelectElement;
  httpOnly: HTMLInputElement;
  hostOnly: HTMLInputElement;
  session: HTMLInputElement;
  secure: HTMLInputElement;
}

export function CookieForm(_props: {
  cookie: Cookie;
  onSave: (c: SetCookie) => void;
  onCancel: () => void;
  isRemove?: boolean;
  onRemove?: () => void;
}) {
  const props = mergeProps({ isRemove: true }, _props);
  const formRefs = {} as FormRefs;

  const [changed, setChanged] = createSignal(false);
  const { currentURL } = useCookie();

  const onSave = () => {
    props.onSave({
      url: currentURL() || "",
      name: formRefs.name.value || undefined,
      value: encodeURIComponent(formRefs.value.value) || undefined,
      path: formRefs.path.value || undefined,
      domain: formRefs.domain.value || undefined,
      expirationDate:
        dateToUnixTime(new Date(formRefs.expiration?.value)) || undefined,
      storeId: props.cookie.chromeCookie.storeId,
      secure: formRefs.hostOnly.checked,
      httpOnly: formRefs.httpOnly.checked,
      sameSite: formRefs.sameSite.value as CookieSameSite,
      ...(formRefs.hostOnly.checked ? { domain: undefined } : undefined),
      ...(formRefs.session.checked ? { expirationDate: undefined } : undefined),
    });
  };

  onMount(() => {
    for (const key in formRefs) {
      const ref = formRefs[key as keyof typeof formRefs];
      ref.addEventListener("change", () => setChanged(true));
      ref.addEventListener("input", () => setChanged(true));
    }
  });

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        {/* Name */}
        <div class="flex flex-col gap-1">
          <p class="px-2 text-sm font-bold">Name</p>
          <TextBox
            ref={formRefs.name}
            placeholder={"unknown"}
            value={props.cookie.chromeCookie.name}
          />
        </div>

        {/* Value */}
        <div class="flex w-full flex-col gap-1">
          <p class="px-2 text-sm font-bold">Value</p>
          <textarea
            ref={formRefs.value}
            class="w-full resize-none rounded border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800"
            rows="3"
            value={decodeURIComponent(props.cookie.chromeCookie.value)}
          />
        </div>

        {/* Domain & Path */}
        <div class="flex gap-2">
          <div class="flex w-full flex-col gap-1">
            <p class="px-2 text-sm font-bold">Domain</p>
            <TextBox
              ref={formRefs.domain}
              value={props.cookie.chromeCookie.domain}
            />
          </div>
          <div class="flex w-full flex-col gap-1">
            <p class="px-2 text-sm font-bold">Path</p>
            <TextBox
              ref={formRefs.path}
              value={props.cookie.chromeCookie.path}
            />
          </div>
        </div>

        {/* Expires / Max-Age */}
        <div class="flex flex-col gap-1">
          <p class="px-2 text-sm font-bold">Expires / Max-Age</p>
          <TextBox
            ref={formRefs.expiration}
            value={props.cookie.displayExpiration}
          />
        </div>

        {/* SameSite */}
        <div class="w-min">
          <label class="flex cursor-pointer items-center gap-2">
            <p class="text-sm font-bold">SameSite</p>
            <div class="relative flex items-center justify-end">
              <IoChevronDown class="absolute mr-2" size={12} />
              <select
                ref={formRefs.sameSite}
                value={props.cookie.chromeCookie.sameSite}
                class="cursor-pointer appearance-none rounded border border-slate-300 bg-white p-2 pr-5 dark:border-slate-600 dark:bg-slate-800"
                name="sameSite"
              >
                <option value="unspecified">Unspecified</option>
                <option value="no_restriction">No Restriction</option>
                <option value="lax">Lax</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </label>
        </div>

        {/* CheckBox */}
        <div class="flex gap-3">
          <label class="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={formRefs.secure}
              checked={props.cookie.chromeCookie.secure}
            />
            <p class="font-bold">Secure</p>
          </label>
          <label class="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={formRefs.httpOnly}
              checked={props.cookie.chromeCookie.httpOnly}
            />
            <p class="font-bold">HttpOnly</p>
          </label>
          <label class="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={formRefs.hostOnly}
              checked={props.cookie.chromeCookie.hostOnly}
            />
            <p class="font-bold">HostOnly</p>
          </label>
          <label class="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={formRefs.session}
              checked={props.cookie.chromeCookie.session}
            />
            <p class="font-bold">Session</p>
          </label>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          {props.isRemove && (
            <button
              onClick={() => props.onRemove?.()}
              class="block rounded border border-slate-300 bg-white p-2 transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-900"
            >
              <div class="flex h-5 w-5 items-center justify-center">
                {<IoTrash size={16} />}
              </div>
            </button>
          )}
        </div>
        <div class="flex items-center gap-2">
          <button
            onClick={() => props.onCancel()}
            class="rounded border border-slate-300 bg-white px-6 py-2 text-sm font-bold transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-900"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={!changed()}
            class={cls(
              "px-6 py-2 text-sm rounded text-white font-bold transition-all bg-blue-500 border border-blue-500 enabled:hover:bg-blue-600 disabled:opacity-30",
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// white json
//  <p class="whitespace-pre">{JSON.stringify(props.cookie, undefined, 2)}</p>
