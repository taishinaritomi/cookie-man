import { IoAdd, IoEllipsisVertical } from "solid-icons/io";
import { Match, Switch, createSignal } from "solid-js";
import { useCookie } from "../providers/cookie";
import { CookieForm } from "./CookieForm";

export function Header() {
  const [open, setOpen] = createSignal<"ADD" | "SEARCH" | undefined>(undefined);

  const {
    searchCookie,
    defaultCookie,
    createCookie,
    currentURL,
    changeCurrentURL,
  } = useCookie();

  return (
    <header class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <input
          value={currentURL() || ""}
          onInput={async (e) => changeCurrentURL(e.currentTarget.value)}
          type="text"
          class="box-content w-full rounded border border-slate-300  bg-slate-100 p-2 font-bold leading-4 dark:border-slate-600 dark:bg-slate-700"
        />

        <button
          onClick={async () => {
            setOpen((open) => (open === "ADD" ? undefined : "ADD"));
          }}
          class="block rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
        >
          <IoAdd size={16} />
        </button>
        <button
          onClick={async () => {
            setOpen((open) => (open === "SEARCH" ? undefined : "SEARCH"));
          }}
          class="block rounded border border-slate-300 bg-slate-100 p-2 dark:border-slate-600 dark:bg-slate-700"
        >
          <IoEllipsisVertical size={16} />
        </button>
      </div>
      <Switch>
        <Match when={open() === "ADD"}>
          <div class="rounded border border-slate-300 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-700">
            <CookieForm
              cookie={defaultCookie()}
              isRemove={false}
              onSave={(newCookie) => {
                createCookie(newCookie);
                setOpen(undefined);
              }}
              onCancel={() => setOpen(undefined)}
            />
          </div>
        </Match>
        <Match when={open() === "SEARCH"}>
          <input
            onInput={async (e) => searchCookie(e.currentTarget.value)}
            type="text"
            placeholder="Search cookies"
            class="box-content rounded border border-slate-300 bg-slate-100 p-2 font-bold leading-4 dark:border-slate-600 dark:bg-slate-700"
          />
        </Match>
      </Switch>
    </header>
  );
}
