import "@testing-library/jest-dom";
import { vi } from "vitest";
import type { PropsWithChildren } from "react";
import type * as CopilotKitModuleType from "@copilotkit/react-core";

vi.mock("@copilotkit/react-core", async (importActual) => ({
  ...(await importActual<typeof CopilotKitModuleType>()),
  CopilotKit: ({ children }: PropsWithChildren) => children,
  useCoAgent: vi.fn(),
  useCopilotChat: vi.fn(),
}));
