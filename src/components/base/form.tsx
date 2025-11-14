import type { ComponentProps } from "react";
import { cls } from "../../utils/cls";

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900"
      {...props}
    />
  );
}

export function TextBox(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type="text"
      className={cls(
        "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900",
        props.className,
      )}
    />
  );
}

type SelectBoxProps = {
  options: { value: string; label: string }[];
} & ComponentProps<"select">;

export function SelectBox({ options, ...props }: SelectBoxProps) {
  return (
    <div className="relative flex items-center justify-end">
      <div className="size-3 i-ph-caret-down text-gray-900 dark:text-white absolute mr-2" />
      <select
        className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white p-2 pr-5 dark:border-gray-600 dark:bg-gray-900"
        {...props}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function CheckBox(props: ComponentProps<"input">) {
  return (
    <div className="relative flex items-center justify-center">
      <input
        {...props}
        type="checkbox"
        className={cls(
          "w-4 h-4 rounded peer",
          "border border-gray-300 dark:border-gray-600",
          "bg-white dark:bg-gray-900 checked:bg-blue-500 checked:border-blue-500",
          "hover:cursor-pointer appearance-none",
          props.className,
        )}
      />
      <div className="peer-checked:block hidden absolute size-3.5 text-white i-ph-check" />
    </div>
  );
}
