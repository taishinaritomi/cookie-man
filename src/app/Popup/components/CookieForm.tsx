import { CheckBox } from "@/components/CheckBox";
import { TextBox } from "@/components/TextBox";
import { cls } from "@/utils/cls";
import { dateToUnixTime } from "@/utils/date";
import { useRef } from "react";
import type { Cookie, CookieSameSite, SetCookie } from "../providers/cookie";
import { useCurrentURL } from "../providers/cookie";

export function CookieForm(props: {
  cookie: Cookie;
  onSave: (c: SetCookie) => void;
  onCancel: () => void;
  isRemove?: boolean;
  onRemove?: () => void;
}) {
  const isRemove = props.isRemove || false;

  const { currentURL } = useCurrentURL();

  const nameRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLTextAreaElement>(null);
  const domainRef = useRef<HTMLInputElement>(null);
  const pathRef = useRef<HTMLInputElement>(null);
  const expirationRef = useRef<HTMLInputElement>(null);
  const sameSiteRef = useRef<HTMLSelectElement>(null);
  const httpOnlyRef = useRef<HTMLInputElement>(null);
  const hostOnlyRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<HTMLInputElement>(null);
  const secureRef = useRef<HTMLInputElement>(null);

  function onSave() {
    if (
      nameRef.current &&
      valueRef.current &&
      domainRef.current &&
      pathRef.current &&
      expirationRef.current &&
      sameSiteRef.current &&
      httpOnlyRef.current &&
      hostOnlyRef.current &&
      sessionRef.current &&
      secureRef.current
    ) {
      props.onSave({
        url: currentURL || "",
        name: nameRef.current.value || undefined,
        value: encodeURIComponent(valueRef.current.value) || undefined,
        domain: domainRef.current.value || undefined,
        path: pathRef.current.value || undefined,
        expirationDate:
          dateToUnixTime(new Date(expirationRef.current.value)) || undefined,
        storeId: props.cookie.chromeCookie.storeId,
        secure: secureRef.current.checked,
        httpOnly: httpOnlyRef.current.checked,
        sameSite: sameSiteRef.current.value as CookieSameSite,
        ...(hostOnlyRef.current.checked ? { domain: undefined } : undefined),
        ...(sessionRef.current.checked
          ? { expirationDate: undefined }
          : undefined),
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Name</p>
          <TextBox
            ref={nameRef}
            placeholder={"unknown"}
            value={props.cookie.chromeCookie.name}
            onChange={(e) => {
              e.target.value;
            }}
          />
        </div>

        {/* Value */}
        <div className="flex w-full flex-col gap-1">
          <p className="px-2 text-sm font-bold">Value</p>
          <textarea
            ref={valueRef}
            className="w-full resize-none rounded border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800"
            rows={3}
            value={decodeURIComponent(props.cookie.chromeCookie.value)}
          />
        </div>

        {/* Domain & Path */}
        <div className="flex gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Domain</p>
            <TextBox ref={domainRef} value={props.cookie.chromeCookie.domain} />
          </div>
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Path</p>
            <TextBox ref={pathRef} value={props.cookie.chromeCookie.path} />
          </div>
        </div>

        {/* Expires / Max-Age */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Expires / Max-Age</p>
          <TextBox ref={expirationRef} value={props.cookie.displayExpiration} />
        </div>

        {/* SameSite */}
        <div className="w-min">
          <label className="flex cursor-pointer items-center gap-2">
            <p className="text-sm font-bold">SameSite</p>
            <div className="relative flex items-center justify-end">
              <div className="size-4 bg-red-600" />
              <select
                ref={sameSiteRef}
                value={props.cookie.chromeCookie.sameSite}
                className="cursor-pointer appearance-none rounded border border-slate-300 bg-white p-2 pr-5 dark:border-slate-600 dark:bg-slate-800"
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
        <div className="flex gap-3">
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={secureRef}
              checked={props.cookie.chromeCookie.secure}
            />
            <p className="font-bold">Secure</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={httpOnlyRef}
              checked={props.cookie.chromeCookie.httpOnly}
            />
            <p className="font-bold">HttpOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={hostOnlyRef}
              checked={props.cookie.chromeCookie.hostOnly}
            />
            <p className="font-bold">HostOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              ref={sessionRef}
              checked={props.cookie.chromeCookie.session}
            />
            <p className="font-bold">Session</p>
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          {isRemove && (
            <button
              type="button"
              onClick={() => props.onRemove?.()}
              className="block rounded border border-slate-300 bg-white p-2 transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-900"
            >
              <div className="flex h-5 w-5 items-center justify-center">
                <div className="size-4 i-ph-trash" />
              </div>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => props.onCancel()}
            className="rounded border border-slate-300 bg-white px-6 py-2 text-sm font-bold transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className={cls(
              "px-6 py-2 text-sm rounded text-white font-bold transition-all bg-blue-500 border border-blue-500 enabled:hover:bg-blue-600 disabled:opacity-30"
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
//  <p className="whitespace-pre">{JSON.stringify(props.cookie, undefined, 2)}</p>
