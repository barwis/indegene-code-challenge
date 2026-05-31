"use client";

import { CopilotKit } from "@copilotkit/react-core";
import type { PropsWithChildren } from "react";

const CopilotKitProvider = ({ children }: PropsWithChildren) => (
  <CopilotKit runtimeUrl="/api/copilotkit" agent="recipe_agent" showDevConsole={false}>
    {children}
  </CopilotKit>
);

export default CopilotKitProvider;
