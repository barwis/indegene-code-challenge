import { render, screen } from "@testing-library/react";
import type { ChatMessage } from "@context/recipe-context";
import { ChatMessageList } from "./chat-message-list";

const userMsg: ChatMessage = { id: "1", role: "user", content: "Hello" };
const agentMsg: ChatMessage = { id: "2", role: "assistant", content: "Hi there" };
const hiddenMsg: ChatMessage = { id: "3", role: "user", content: "Hidden", hidden: true };
const emptyMsg: ChatMessage = { id: "4", role: "assistant", content: "" };
const failedMsg: ChatMessage = { id: "5", role: "user", content: "Failed", failed: true };

describe("ChatMessageList", () => {
  describe("message rendering", () => {
    it("should render visible user messages", () => {
      render(<ChatMessageList messages={[userMsg]} isLoading={false} />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("should render visible assistant messages", () => {
      render(<ChatMessageList messages={[agentMsg]} isLoading={false} />);
      expect(screen.getByText("Hi there")).toBeInTheDocument();
    });

    it("should not render messages with hidden=true", () => {
      render(<ChatMessageList messages={[hiddenMsg]} isLoading={false} />);
      expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    });

    it("should not render messages with empty content", () => {
      const { container } = render(
        <ChatMessageList messages={[emptyMsg]} isLoading={false} />,
      );
      expect(container.querySelectorAll("[class*='rounded-2xl']")).toHaveLength(0);
    });

    it("should render multiple messages in order", () => {
      render(<ChatMessageList messages={[userMsg, agentMsg]} isLoading={false} />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Hi there")).toBeInTheDocument();
    });
  });

  describe("failed message", () => {
    it("should show Not sent indicator on a failed user message", () => {
      render(<ChatMessageList messages={[failedMsg]} isLoading={false} />);
      expect(screen.getByText("Not sent")).toBeInTheDocument();
    });

    it("should not show Not sent on a normal user message", () => {
      render(<ChatMessageList messages={[userMsg]} isLoading={false} />);
      expect(screen.queryByText("Not sent")).not.toBeInTheDocument();
    });
  });

  describe("typing indicator", () => {
    it("should show typing indicator when isLoading is true", () => {
      render(<ChatMessageList messages={[]} isLoading={true} />);
      expect(screen.getByRole("status", { name: /typing/i })).toBeInTheDocument();
    });

    it("should not show typing indicator when isLoading is false", () => {
      render(<ChatMessageList messages={[]} isLoading={false} />);
      expect(
        screen.queryByRole("status", { name: /typing/i }),
      ).not.toBeInTheDocument();
    });
  });
});
