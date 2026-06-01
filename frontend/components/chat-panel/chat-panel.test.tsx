import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useCopilotChatInternal } from "@copilotkit/react-core";
import { ChatPanel } from "./chat-panel";

const mockSendMessage = vi.fn();

const mockChat = (overrides: {
  messages?: { id: string; role: string; content?: string }[];
  isLoading?: boolean;
} = {}) => {
  vi.mocked(useCopilotChatInternal).mockReturnValue({
    messages: [],
    sendMessage: mockSendMessage,
    isLoading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useCopilotChatInternal>);
};

const userMsg = { id: "1", role: "user", content: "Hello chef" };
const agentMsg = { id: "2", role: "assistant", content: "Let me help you" };

describe("ChatPanel", () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
    mockSendMessage.mockResolvedValue(undefined);
    mockChat();
  });

  describe("message rendering", () => {
    it("should render user messages", () => {
      mockChat({ messages: [userMsg] });
      render(<ChatPanel />);
      expect(screen.getByText("Hello chef")).toBeInTheDocument();
    });

    it("should render user messages right-aligned", () => {
      mockChat({ messages: [userMsg] });
      render(<ChatPanel />);
      const bubble = screen.getByText("Hello chef").closest("[class*='justify-end']");
      expect(bubble).toBeInTheDocument();
    });

    it("should render agent messages", () => {
      mockChat({ messages: [agentMsg] });
      render(<ChatPanel />);
      expect(screen.getByText("Let me help you")).toBeInTheDocument();
    });

    it("should render agent messages left-aligned", () => {
      mockChat({ messages: [agentMsg] });
      render(<ChatPanel />);
      const bubble = screen.getByText("Let me help you").closest("[class*='justify-start']");
      expect(bubble).toBeInTheDocument();
    });

    it("should render multiple messages in order", () => {
      mockChat({ messages: [userMsg, agentMsg] });
      render(<ChatPanel />);
      expect(screen.getByText("Hello chef")).toBeInTheDocument();
      expect(screen.getByText("Let me help you")).toBeInTheDocument();
    });

    it("should not render messages without text content", () => {
      const toolMsg = { id: "3", role: "assistant", content: undefined };
      mockChat({ messages: [toolMsg] });
      const { container } = render(<ChatPanel />);
      expect(container.querySelectorAll("[class*='rounded-2xl']")).toHaveLength(0);
    });
  });

  describe("typing indicator", () => {
    it("should show typing indicator when isLoading is true", () => {
      mockChat({ isLoading: true });
      render(<ChatPanel />);
      expect(screen.getByRole("status", { name: /typing/i })).toBeInTheDocument();
    });

    it("should hide typing indicator when isLoading is false", () => {
      mockChat({ isLoading: false });
      render(<ChatPanel />);
      expect(screen.queryByRole("status", { name: /typing/i })).not.toBeInTheDocument();
    });
  });

  describe("send button", () => {
    it("should disable send button when isLoading is true", () => {
      mockChat({ isLoading: true });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    });

    it("should disable send button when input is empty", () => {
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    });

    it("should enable send button when input has text and not loading", async () => {
      const user = userEvent.setup();
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello");
      expect(screen.getByRole("button", { name: /send/i })).toBeEnabled();
    });
  });

  describe("submitting a message", () => {
    it("should not call sendMessage when input is empty and Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<ChatPanel />);
      await user.keyboard("{Enter}");
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("should clear the input after pressing Enter", async () => {
      const user = userEvent.setup();
      render(<ChatPanel />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Hello chef");
      await user.keyboard("{Enter}");
      expect(input).toHaveValue("");
    });

    it("should clear the input after clicking send", async () => {
      const user = userEvent.setup();
      render(<ChatPanel />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Hello chef");
      await user.click(screen.getByRole("button", { name: /send/i }));
      expect(input).toHaveValue("");
    });
  });
});
