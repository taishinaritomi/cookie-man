import { CheckBox } from "@/components/CheckBox";
import { TextBox } from "@/components/TextBox";
import { dateToUnixTime, unixTimeToDate } from "@/utils/date";
import type {
  Cookie,
  CookieSameSite,
  SetCookie,
  UpdateSetCookie,
} from "../providers/cookie";

export enum CookieFormMode {
  Create = 0,
  Edit = 1,
}

type CreateCookieFormProps = {
  mode: CookieFormMode.Create;
  cookie: Cookie;
  onSave?: (c: SetCookie) => void;
  onCancel?: () => void;
};

type EditCookieFormProps = {
  mode: CookieFormMode.Edit;
  cookie: Cookie;
  onUpdate?: (c: UpdateSetCookie) => void;
  onRemove?: () => void;
};

type CookieFormProps = CreateCookieFormProps | EditCookieFormProps;

export function CookieForm(props: CookieFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Name</p>
          <TextBox
            placeholder={"unknown"}
            value={props.cookie.chromeCookie.name}
            onChange={(e) => {
              if (props.mode === CookieFormMode.Edit) {
                props.onUpdate?.({ name: e.currentTarget.value });
              }
            }}
          />
        </div>

        {/* Value */}
        <div className="flex w-full flex-col gap-1">
          <p className="px-2 text-sm font-bold">Value</p>
          <textarea
            className="w-full resize-none rounded border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800"
            rows={3}
            defaultValue={props.cookie.chromeCookie.value}
            onChange={(e) => {
              if (props.mode === CookieFormMode.Edit) {
                props.onUpdate?.({
                  value: e.currentTarget.value,
                });
              }
            }}
          />
        </div>

        {/* Domain & Path */}
        <div className="flex gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Domain</p>
            <TextBox
              value={props.cookie.chromeCookie.domain}
              onChange={(e) => {
                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({
                    domain: e.currentTarget.value,
                  });
                }
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Path</p>
            <TextBox
              value={props.cookie.chromeCookie.path}
              onChange={(e) => {
                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({
                    path: e.currentTarget.value,
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Expires / Max-Age */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Expires / Max-Age</p>
          <TextBox
            value={
              props.cookie.chromeCookie.expirationDate
                ? unixTimeToDate(
                    props.cookie.chromeCookie.expirationDate,
                  ).toISOString()
                : "Session"
            }
            disabled={!props.cookie.chromeCookie.expirationDate}
            onChange={(e) => {
              if (props.mode === CookieFormMode.Edit) {
                props.onUpdate?.({
                  expirationDate: dateToUnixTime(
                    new Date(e.currentTarget.value),
                  ),
                });
              }
            }}
          />
        </div>

        {/* SameSite */}
        <div className="w-min">
          <label className="flex cursor-pointer items-center gap-2">
            <p className="text-sm font-bold">SameSite</p>
            <div className="relative flex items-center justify-end">
              <div className="size-3 i-ph-caret-down text-slate-800 dark:text-white absolute mr-2" />
              <select
                value={props.cookie.chromeCookie.sameSite}
                className="cursor-pointer appearance-none rounded border border-slate-300 bg-white p-2 pr-5 dark:border-slate-600 dark:bg-slate-800"
                name="sameSite"
                onChange={(e) => {
                  if (props.mode === CookieFormMode.Edit) {
                    props.onUpdate?.({
                      sameSite: e.currentTarget.value as CookieSameSite,
                    });
                  }
                }}
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
              checked={props.cookie.chromeCookie.secure}
              onChange={(e) => {
                console.log(props.mode, e);

                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({ secure: e.currentTarget.checked });
                }
              }}
            />
            <p className="font-bold">Secure</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              checked={props.cookie.chromeCookie.httpOnly}
              onChange={(e) => {
                console.log(props.mode, e);
                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({ httpOnly: e.currentTarget.checked });
                }
              }}
            />
            <p className="font-bold">HttpOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              checked={props.cookie.chromeCookie.hostOnly}
              onChange={(e) => {
                console.log(props.mode, e);
                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({ hostOnly: e.currentTarget.checked });
                }
              }}
            />
            <p className="font-bold">HostOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox
              checked={props.cookie.chromeCookie.session}
              onChange={(e) => {
                console.log(props.mode, e);
                if (props.mode === CookieFormMode.Edit) {
                  props.onUpdate?.({
                    session: e.currentTarget.checked,
                    expirationDate: e.currentTarget.checked
                      ? undefined
                      : dateToUnixTime(
                          new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
                        ),
                  });
                }
              }}
            />
            <p className="font-bold">Session</p>
          </label>
        </div>
      </div>

      {/* <div className="flex items-center justify-between">
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
      </div> */}
    </div>
  );
}

// white json
//  <p className="whitespace-pre">{JSON.stringify(props.cookie, undefined, 2)}</p>
