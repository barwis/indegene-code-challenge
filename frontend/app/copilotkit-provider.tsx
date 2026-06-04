"use client";

import { CopilotKit } from "@copilotkit/react-core";
import type { PropsWithChildren } from "react";

type CopilotKitProviderProps = PropsWithChildren<{
  threadId?: string;
}>;

export const CopilotKitProvider = ({
  children,
  threadId,
}: CopilotKitProviderProps) => (
  <CopilotKit
    runtimeUrl="/api/copilotkit"
    agent="recipe_agent"
    threadId={threadId}
  >
    {children}
  </CopilotKit>
);
