import { IoAdd, IoSearch } from "solid-icons/io";
import { Match, Switch, createSignal } from "solid-js";
import { useCookie } from "../providers/cookie";
import { CookieForm } from "./CookieForm";

export function Header() {
  const [open, setOpen] = createSignal<"ADD_COOKIE" | "SEARCH" | undefined>(
    undefined,
  );

  const { searchCookie } = useCookie();

  return (
    <header class="flex flex-col gap-2">
      <HeaderTop
        onCreate={() =>
          setOpen((open) => (open === "ADD_COOKIE" ? undefined : "ADD_COOKIE"))
        }
        onSearch={() =>
          setOpen((open) => (open === "SEARCH" ? undefined : "SEARCH"))
        }
      />
      <Switch>
        <Match when={open() === "ADD_COOKIE"}>
          <CreateCookie close={() => setOpen(undefined)} />
        </Match>
        <Match when={open() === "SEARCH"}>
          <input
            onInput={async (e) => searchCookie(e.currentTarget.value)}
            type="text"
            placeholder="Search cookies"
            class="p-2 px-3 border leading-4 box-content  border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 font-bold"
          />
        </Match>
      </Switch>
    </header>
  );
}

function HeaderTop(props: { onSearch: () => void; onCreate: () => void }) {
  const { currentURL, changeCurrentURL } = useCookie();
  return (
    <div class="flex items-center gap-2">
      <input
        value={currentURL() || ""}
        onInput={async (e) => changeCurrentURL(e.currentTarget.value)}
        type="text"
        class="p-2 px-3 border leading-4 w-full box-content  border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 font-bold"
      />

      <button
        onClick={async () => props.onCreate()}
        class="p-2 border block border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700"
      >
        <IoAdd size={16} />
      </button>
      <button
        onClick={async () => props.onSearch()}
        class="p-2 border block border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700"
      >
        <IoSearch size={16} />
      </button>
    </div>
  );
}

function CreateCookie(props: { close: () => void }) {
  const { defaultCookie, createCookie } = useCookie();
  return (
    <div class="border p-3 border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700">
      <CookieForm
        cookie={defaultCookie()}
        isRemove={false}
        onSave={(newCookie) => {
          createCookie(newCookie);
          props.close();
        }}
        onCancel={() => props.close()}
      />
    </div>
  );
}
