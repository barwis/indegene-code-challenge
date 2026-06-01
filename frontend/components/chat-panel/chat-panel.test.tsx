import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import type { ChatMessage } from "@context/recipe-context";
import { ChatPanel } from "./chat-panel";

vi.mock("@context/recipe-context");

const mockSendMessage = vi.fn();

const userMsg: ChatMessage = { id: "1", role: "user", content: "Hello chef" };
const agentMsg: ChatMessage = { id: "2", role: "assistant", content: "Let me help you" };

describe("ChatPanel", () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
  });

  describe("message rendering", () => {
    it("should render user messages", () => {
      mockUseRecipeContext({ messages: [userMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByText("Hello chef")).toBeInTheDocument();
    });

    it("should render user messages right-aligned", () => {
      mockUseRecipeContext({ messages: [userMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      const bubble = screen.getByText("Hello chef").closest("[class*='justify-end']");
      expect(bubble).toBeInTheDocument();
    });

    it("should render agent messages", () => {
      mockUseRecipeContext({ messages: [agentMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByText("Let me help you")).toBeInTheDocument();
    });

    it("should render agent messages left-aligned", () => {
      mockUseRecipeContext({ messages: [agentMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      const bubble = screen.getByText("Let me help you").closest("[class*='justify-start']");
      expect(bubble).toBeInTheDocument();
    });

    it("should render multiple messages in order", () => {
      mockUseRecipeContext({ messages: [userMsg, agentMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByText("Hello chef")).toBeInTheDocument();
      expect(screen.getByText("Let me help you")).toBeInTheDocument();
    });

    it("should not render messages without text content", () => {
      const emptyMsg: ChatMessage = { id: "3", role: "assistant", content: "" };
      mockUseRecipeContext({ messages: [emptyMsg], sendMessage: mockSendMessage });
      const { container } = render(<ChatPanel />);
      expect(container.querySelectorAll("[class*='rounded-2xl']")).toHaveLength(0);
    });
  });

  describe("typing indicator", () => {
    it("should show typing indicator when isChatLoading is true", () => {
      mockUseRecipeContext({ isChatLoading: true, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("status", { name: /typing/i })).toBeInTheDocument();
    });

    it("should hide typing indicator when isChatLoading is false", () => {
      mockUseRecipeContext({ isChatLoading: false, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.queryByRole("status", { name: /typing/i })).not.toBeInTheDocument();
    });
  });

  describe("send button", () => {
    it("should disable send button when isChatLoading is true", () => {
      mockUseRecipeContext({ isChatLoading: true, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    });

    it("should disable send button when input is empty", () => {
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    });

    it("should enable send button when input has text and not loading", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ isChatLoading: false, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello");
      expect(screen.getByRole("button", { name: /send/i })).toBeEnabled();
    });
  });

  describe("submitting a message", () => {
    it("should not call sendMessage when input is empty and Enter is pressed", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.keyboard("{Enter}");
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("should clear the input after pressing Enter", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Hello chef");
      await user.keyboard("{Enter}");
      expect(input).toHaveValue("");
    });

    it("should clear the input after clicking send", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Hello chef");
      await user.click(screen.getByRole("button", { name: /send/i }));
      expect(input).toHaveValue("");
    });

    it("should call sendMessage with the input text", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello chef");
      await user.keyboard("{Enter}");
      expect(mockSendMessage).toHaveBeenCalledWith("Hello chef");
    });
  });
});
