import { Suspense, useState } from "react";
import { useCookie, useCurrentURL, useSearchText } from "../providers/cookie";
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
      <Suspense fallback={<div />}>
        <HeaderContent toggleOpen={toggleOpen} />
      </Suspense>

      <Suspense fallback={<div />}>
        {open === Open.Add && <HeaderAddCookie setOpen={setOpen} />}
        {open === Open.Search && <HeaderSearchCookie />}
      </Suspense>
    </header>
  );
}

function HeaderContent(props: { toggleOpen: (open: Open) => void }) {
  const { currentURL, setCurrentURL } = useCurrentURL();
  return (
    <div className="flex items-center gap-2">
      <input
        value={currentURL ?? ""}
        onChange={(e) => setCurrentURL(e.currentTarget.value)}
        type="text"
        className="grow block rounded border border-slate-300 bg-slate-100 p-2 leading-4 dark:border-slate-600 dark:bg-slate-700"
      />

      <button
        type="button"
        onClick={async () => props.toggleOpen(Open.Add)}
        className="flex items-center justify-center rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="size-4 i-ph-plus" />
      </button>

      <button
        type="button"
        onClick={() => props.toggleOpen(Open.Search)}
        className="flex items-center justify-center rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="size-4 i-ph-dots-three-vertical-bold" />
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
