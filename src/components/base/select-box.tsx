import type { ComponentProps } from "react";

type Props = {
  options: string[];
} & ComponentProps<"select">;

export function SelectBox(_props: Props) {
  const { options, ...props } = _props;

  return (
    <label className="relative flex items-center justify-end">
      <div className="i-ph-tag-chevron size-3" />
      <select
        className="appearance-none rounded border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800"
        {...props}
      >
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
    </label>
  );
}
