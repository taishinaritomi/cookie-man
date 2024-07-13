import { Suspense, useState } from "react";
import { useCookie, useCurrentURL, useSearchText } from "../providers/cookie";
import { CookieForm } from "./CookieForm";

const Open = { None: 0, Add: 1, Search: 2 } as const;
type Open = (typeof Open)[keyof typeof Open];

export function Header() {
  const [open, setOpen] = useState<Open>(Open.None);

  const { setSearchText } = useSearchText();

  function toggleOpen(open: Open) {
    setOpen((current) => (current === open ? Open.None : open));
  }

  return (
    <header className="flex flex-col gap-2">
      <Suspense fallback={<div />}>
        <HeaderInputView toggleOpen={toggleOpen} />
      </Suspense>

      <Suspense fallback={<div />}>
        {open === Open.Add && <HeaderAddView setOpen={setOpen} />}
      </Suspense>

      {open === Open.Search && (
        <input
          onInput={async (e) => setSearchText(e.currentTarget.value)}
          type="text"
          placeholder="Search cookies"
          className="box-content rounded border border-slate-300 bg-slate-100 p-2 font-bold leading-4 dark:border-slate-600 dark:bg-slate-700"
        />
      )}
    </header>
  );
}

function HeaderInputView(props: { toggleOpen: (open: Open) => void }) {
  const { currentURL, setCurrentURL } = useCurrentURL();
  return (
    <div className="flex items-center gap-2">
      <input
        value={currentURL ?? ""}
        onChange={(e) => setCurrentURL(e.currentTarget.value)}
        type="text"
        className="box-content w-full rounded border border-slate-300  bg-slate-100 p-2 font-bold leading-4 dark:border-slate-600 dark:bg-slate-700"
      />

      <button
        type="button"
        onClick={async () => props.toggleOpen(Open.Add)}
        className="block rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="size-4 i-ph-plus" />
      </button>
      <button
        type="button"
        onClick={() => props.toggleOpen(Open.Search)}
        className="block rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="size-4 i-ph-bell-ringing" />
      </button>
    </div>
  );
}

function HeaderAddView(props: { setOpen: (open: Open) => void }) {
  const { defaultCookie, createCookie } = useCookie();

  return (
    <div className="rounded border border-slate-300 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-700">
      <CookieForm
        cookie={defaultCookie}
        isRemove={false}
        onSave={(newCookie) => {
          createCookie(newCookie);
          props.setOpen(Open.None);
        }}
        onCancel={() => props.setOpen(Open.None)}
      />
    </div>
  );
}
