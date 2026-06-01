import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { CopilotKit } from "@copilotkit/react-core";
import type { ReactElement } from "react";

const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => <CopilotKit>{children}</CopilotKit>,
    ...options,
  });

export default renderWithProviders;
