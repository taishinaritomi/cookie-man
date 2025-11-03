import { useForm } from "react-hook-form";
import {
  CheckBox,
  SelectBox,
  Textarea,
  TextBox,
} from "../../../components/base/form";
import type { Cookie, SetCookie, UpdateSetCookie } from "../../../libs/browser";
import { cls } from "../../../utils/cls";
import { unixTimeToDate } from "../../../utils/date";

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
  onSave?: (c: SetCookie) => void;
  onCancel?: () => void;
  onRemove?: () => void;
};

type CookieFormProps = CreateCookieFormProps | EditCookieFormProps;

export function CookieForm(props: CookieFormProps) {
  const expirationDate = props.cookie.browserCookie.expirationDate
    ? unixTimeToDate(props.cookie.browserCookie.expirationDate).toISOString()
    : "Session";

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: props.cookie.browserCookie.name,
      value: props.cookie.browserCookie.value,
      domain: props.cookie.browserCookie.domain,
      path: props.cookie.browserCookie.path,
      expirationDate,
      sameSite: props.cookie.browserCookie.sameSite,
      secure: props.cookie.browserCookie.secure,
      httpOnly: props.cookie.browserCookie.httpOnly,
      hostOnly: props.cookie.browserCookie.hostOnly,
      session: props.cookie.browserCookie.session,
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (props.mode === CookieFormMode.Create) {
      props.onSave?.({
        url: "",
        name: data.name,
        value: data.value,
        domain: data.domain,
        path: data.path,
        expirationDate:
          data.expirationDate === "Session"
            ? undefined
            : new Date(data.expirationDate).getTime() / 1000,
        sameSite: "no_restriction",
        secure: data.secure,
        httpOnly: data.httpOnly,
      });
    }

    if (props.mode === CookieFormMode.Edit) {
      props.onUpdate?.({
        name: data.name,
        value: data.value,
        domain: data.domain,
        path: data.path,
        expirationDate:
          data.expirationDate === "Session"
            ? undefined
            : new Date(data.expirationDate).getTime() / 1000,
        sameSite: data.sameSite,
        secure: data.secure,
        httpOnly: data.httpOnly,
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Name</p>
          <TextBox {...register("name")} />
        </div>

        {/* Value */}
        <div className="flex w-full flex-col gap-1">
          <p className="px-2 text-sm font-bold">Value</p>
          <Textarea rows={3} {...register("value")} />
        </div>

        {/* Domain & Path */}
        <div className="flex gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Domain</p>
            <TextBox {...register("domain")} />
          </div>
          <div className="flex w-full flex-col gap-1">
            <p className="px-2 text-sm font-bold">Path</p>
            <TextBox {...register("path")} />
          </div>
        </div>

        {/* Expires / Max-Age */}
        <div className="flex flex-col gap-1">
          <p className="px-2 text-sm font-bold">Expires / Max-Age</p>
          <TextBox {...register("expirationDate")} disabled={!expirationDate} />
        </div>

        {/* SameSite */}
        <div className="w-min">
          <label className="flex cursor-pointer items-center gap-2">
            <p className="text-sm font-bold">SameSite</p>

            <SelectBox
              {...register("sameSite")}
              options={[
                { value: "unspecified", label: "Unspecified" },
                { value: "no_restriction", label: "No Restriction" },
                { value: "lax", label: "Lax" },
                { value: "strict", label: "Strict" },
              ]}
            />
          </label>
        </div>

        {/* CheckBox */}
        <div className="flex gap-3">
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox {...register("secure")} />
            <p className="font-bold">Secure</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox {...register("httpOnly")} />
            <p className="font-bold">HttpOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox {...register("hostOnly")} />
            <p className="font-bold">HostOnly</p>
          </label>
          <label className="flex items-center gap-1 hover:cursor-pointer">
            <CheckBox {...register("session")} />
            <p className="font-bold">Session</p>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {props.mode === CookieFormMode.Edit && (
            <button
              type="button"
              onClick={() => props.onRemove?.()}
              className="block rounded-xl border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-950"
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
            onClick={() => {
              props.onCancel?.();
              reset();
            }}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2 text-sm font-bold transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-950"
          >
            Cancel
          </button>

          <button
            type="submit"
            className={cls(
              "px-6 py-2 text-sm rounded-xl text-white font-bold transition-all bg-blue-500 border border-blue-500 enabled:hover:bg-blue-600 disabled:opacity-30",
            )}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
