import { Suspense, useState } from "react";
import { Tooltip } from "../../../components/base/tooltip";
import {
  useCookie,
  useIsAllCookies,
  useSearchText,
} from "../_providers/cookie-provider";
import { CookieForm, CookieFormMode } from "./CookieForm";

const Open = { None: 0, Add: 1, Search: 2 } as const;
type Open = (typeof Open)[keyof typeof Open];

export function Header() {
  const [open, setOpen] = useState<Open>(Open.None);

  function toggleOpen(open: Open) {
    setOpen((current) => (current === open ? Open.None : open));
  }

  return (
    <header className="flex flex-col gap-2">
      <Suspense>
        <HeaderContent toggleOpen={toggleOpen} />
      </Suspense>

      <Suspense>
        {open === Open.Add && <HeaderAddCookie setOpen={setOpen} />}
        {open === Open.Search && <HeaderSearchCookie />}
      </Suspense>
    </header>
  );
}

function HeaderContent(props: { toggleOpen: (open: Open) => void }) {
  const { searchText, setSearchText } = useSearchText();
  const { isAllCookies, setIsAllCookies } = useIsAllCookies();
  return (
    <div className="flex items-center gap-2">
      <Tooltip
        message={isAllCookies ? "view current url cookies" : "view all cookies"}
      >
        <button
          type="button"
          onClick={() => setIsAllCookies((isAllCookies) => !isAllCookies)}
          className="flex items-center justify-center rounded-full"
        >
          <div className="size-5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center dark:border-slate-600 dark:bg-slate-700">
            {isAllCookies && (
              <div className="size-3 bg-purple-500 rounded-full dark:bg-purple-600" />
            )}
          </div>
        </button>
      </Tooltip>

      <input
        value={searchText ?? ""}
        onChange={(e) => setSearchText(e.currentTarget.value)}
        type="text"
        placeholder="Search cookies"
        className="grow block rounded border border-slate-300 bg-slate-100 p-2 leading-4 dark:border-slate-600 dark:bg-slate-700"
      />

      <button
        type="button"
        onClick={async () => props.toggleOpen(Open.Add)}
        className="flex items-center justify-center rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="size-4 i-ph-plus text-slate-500 dark:text-slate-400" />
      </button>
    </div>
  );
}

function HeaderSearchCookie() {
  const { setSearchText } = useSearchText();

  return (
    <div>
      <input
        onInput={async (e) => setSearchText(e.currentTarget.value)}
        type="text"
        placeholder="Search cookies"
        className="w-full rounded border border-slate-300 bg-slate-100 p-2 leading-4 dark:border-slate-600 dark:bg-slate-700"
      />
    </div>
  );
}

function HeaderAddCookie(props: { setOpen: (open: Open) => void }) {
  const { defaultCookie, createCookie } = useCookie();

  return (
    <div className="rounded border border-slate-300 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-700">
      <CookieForm
        cookie={defaultCookie}
        mode={CookieFormMode.Create}
        onSave={(newCookie) => {
          createCookie(newCookie);
          props.setOpen(Open.None);
        }}
        onCancel={() => props.setOpen(Open.None)}
      />
    </div>
  );
}
