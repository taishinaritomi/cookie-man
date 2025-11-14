import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { PropsWithChildren } from "react";

export function Tooltip(props: PropsWithChildren<{ message: string }>) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{props.children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={5}
            collisionPadding={4}
            className="p-1 rounded drop-shadow  bg-slate-700 text-white dark:bg-slate-100 dark:text-slate-800"
          >
            {props.message}
            <RadixTooltip.Arrow className="fill-slate-700 dark:fill-slate-100" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
