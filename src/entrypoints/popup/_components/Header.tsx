import { Suspense, useState } from "react";
import { useCookie, useSearchText } from "../_providers/cookie-provider";
import { CookieForm, CookieFormMode } from "./CookieForm";

const Open = { None: 0, Add: 1, Search: 2 } as const;
type Open = (typeof Open)[keyof typeof Open];

export function Header() {
  const { currentURL, cookies } = useCookie();
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
      <div className="text-xs text-gray-400 truncate flex gap-2">
        <span>count {cookies.length}</span>
        <span className="truncate">{currentURL ?? "ALL"}</span>
      </div>
    </header>
  );
}

function HeaderContent(props: { toggleOpen: (open: Open) => void }) {
  const { searchText, setSearchText } = useSearchText();
  return (
    <div className="flex items-center gap-2">
      <input
        value={searchText ?? ""}
        onChange={(e) => setSearchText(e.currentTarget.value)}
        type="text"
        placeholder="Search cookies..."
        className="grow block rounded-xl border border-slate-300 p-2 leading-4 placeholder:text-gray-400"
      />

      <button
        type="button"
        onClick={async () => props.toggleOpen(Open.Add)}
        className="flex items-center justify-center rounded-full border border-blue-700 bg-blue-500 p-2"
      >
        <div className="size-4 i-ph-plus text-white" />
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
        placeholder="Search cookies..."
        className="w-full rounded-xl border border-slate-300 bg-slate-100 p-2 leading-4 dark:border-slate-600 dark:bg-slate-700"
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
