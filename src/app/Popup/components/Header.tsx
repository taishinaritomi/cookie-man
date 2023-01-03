import { CgSpinner } from 'solid-icons/cg';
import { IoAdd, IoRefresh, IoSearch } from 'solid-icons/io';
import { createSignal } from 'solid-js';
import {
  refreshCookies,
  searchInput,
  setIsOpenAddCookie,
  setSearchInput,
} from '../states/cookie';

export const Header = () => {
  return (
    <header class="flex justify-between items-center p-1">
      <p class="text-xl font-bold italic"></p>
      <HeaderRight />
    </header>
  );
};

const HeaderRight = () => {
  const [lording, setLording] = createSignal(false);
  return (
    <div class="flex items-center gap-2">
      <div class="relative flex items-center justify-end">
        <IoSearch size={16} class="absolute mr-2" />
        <input
          value={searchInput() || ''}
          onInput={async (e) => setSearchInput(e.currentTarget.value)}
          type="text"
          class="p-2 border leading-4 box-content min-w-[200px] border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700"
        />
      </div>
      <button
        onClick={async () => setIsOpenAddCookie((b) => !b)}
        class="p-2 border block border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700"
      >
        <IoAdd size={16} />
      </button>
      <button
        onClick={async () => {
          setLording(true);
          await refreshCookies();
          setLording(false);
        }}
        class="p-2 border block border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700"
      >
        {lording() ? (
          <CgSpinner size={16} class="animate-[spin_.5s_linear_infinite]" />
        ) : (
          <IoRefresh size={16} />
        )}
      </button>
    </div>
  );
};
