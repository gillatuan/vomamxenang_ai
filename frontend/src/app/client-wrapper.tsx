"use client";

import { Providers } from "@/app/providers";
import { CustomerChatbox } from "@/components/CustomerChatbox";
import { ReactNode } from "react";

export function ClientWrapper({ children }: { children: ReactNode }) {
  return <Providers>{children}<CustomerChatbox /></Providers>;
}
