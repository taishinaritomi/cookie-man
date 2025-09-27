import type { ComponentProps } from "react";
import { cls } from "../../utils/cls";

export function TextBox(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type="text"
      className={cls(
        "w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800",
        props.className,
      )}
    />
  );
}
