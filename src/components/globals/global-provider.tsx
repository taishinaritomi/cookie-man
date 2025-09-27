import { type ReactNode, StrictMode } from "react";

import "../../globals.css";

type Props = { children?: ReactNode };

export function GlobalProvider({ children }: Props) {
  return <StrictMode>{children}</StrictMode>;
}
