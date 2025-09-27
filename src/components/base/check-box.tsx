import type { ComponentProps } from "react";
import { cls } from "../../utils/cls";

export function CheckBox(props: ComponentProps<"input">) {
  return (
    <div className="relative flex items-center justify-center">
      <input
        {...props}
        type="checkbox"
        className={cls(
          "w-4 h-4 rounded peer",
          "border border-slate-300 dark:border-slate-600",
          "bg-white dark:bg-slate-800 checked:bg-blue-500 checked:border-blue-500",
          "hover:cursor-pointer appearance-none",
          props.className,
        )}
      />
      <div className="peer-checked:block hidden absolute size-3.5 text-white i-ph-check" />
    </div>
  );
}
