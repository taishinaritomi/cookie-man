import { cls } from "@/utils/cls";
import { type ComponentProps, useState } from "react";

export const CheckBox = (props: ComponentProps<"input">) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <div className="relative flex items-center justify-center">
      {checked && <div className="absolute size-3.5 text-white i-ph-check" />}
      <input
        {...props}
        type="checkbox"
        checked={checked}
        className={cls(
          "w-4 h-4 rounded",
          "border border-slate-300 dark:border-slate-600",
          "bg-white dark:bg-slate-800 checked:bg-blue-500 checked:border-blue-500",
          "hover:cursor-pointer appearance-none",
          props.className,
        )}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
          if (props.onChange instanceof Function) props.onChange(e);
        }}
      />
    </div>
  );
};
