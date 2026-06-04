import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ChatPanel } from "./chat-panel";

vi.mock("@copilotkit/react-ui", () => ({
  CopilotChat: ({ labels }: { labels?: { initial?: string } }) => (
    <div data-testid="copilot-chat">{labels?.initial}</div>
  ),
}));

describe("ChatPanel", () => {
  it("should render CopilotChat", () => {
    render(<ChatPanel />);
    expect(screen.getByTestId("copilot-chat")).toBeInTheDocument();
  });

  it("should pass the initial greeting label", () => {
    render(<ChatPanel />);
    expect(screen.getByTestId("copilot-chat")).toHaveTextContent(
      "Your recipe is ready",
    );
  });
});
