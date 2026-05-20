"use client";

import { Providers } from "@/app/providers";
import { ReactNode } from "react";

export function ClientWrapper({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
