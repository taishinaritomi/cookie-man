import { IoChevronDown } from "solid-icons/io";
import type { JSX } from "solid-js";
import { Index } from "solid-js";

interface Props {
  selectProps: JSX.InputHTMLAttributes<HTMLSelectElement>;
  options: string[];
}

export const SelectBox = (props: Props) => {
  <label class="relative flex items-center justify-end">
    <IoChevronDown class="absolute mr-2" size={12} />
    <select
      class="appearance-none rounded border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800"
      {...props.selectProps}
    >
      <Index each={props.options} fallback={null}>
        {(option) => <option value={option()}>{option()}</option>}
      </Index>
    </select>
  </label>;
};
