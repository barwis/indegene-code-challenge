import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import type { ChatMessage } from "@context/recipe-context";
import { useVoiceInput } from "./use-voice-input";
import { ChatPanel } from "./chat-panel";

vi.mock("@context/recipe-context");
vi.mock("./use-voice-input");

const mockSendMessage = vi.fn();
const mockSetToast = vi.fn();

const mockVoiceInputDefault = () =>
  vi.mocked(useVoiceInput).mockReturnValue({
    isSupported: false,
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
  });

const userMsg: ChatMessage = { id: "1", role: "user", content: "Hello chef" };
const agentMsg: ChatMessage = { id: "2", role: "assistant", content: "Let me help you" };
const failedMsg: ChatMessage = { id: "3", role: "user", content: "Failed message", failed: true };

describe("ChatPanel", () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
    mockSetToast.mockReset();
    mockVoiceInputDefault();
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
      expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    });

    it("should disable send button when input is empty", () => {
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    });

    it("should enable send button when input has text and not loading", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ isChatLoading: false, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello");
      expect(screen.getByRole("button", { name: /send message/i })).toBeEnabled();
    });
  });

  describe("failed message", () => {
    it("should show Not sent indicator on a failed user message", () => {
      mockUseRecipeContext({ messages: [failedMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByText("Not sent")).toBeInTheDocument();
    });

    it("should not show Not sent indicator on a normal user message", () => {
      mockUseRecipeContext({ messages: [userMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.queryByText("Not sent")).not.toBeInTheDocument();
    });

    it("should not show Not sent indicator on an agent message", () => {
      mockUseRecipeContext({ messages: [agentMsg], sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.queryByText("Not sent")).not.toBeInTheDocument();
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
      await user.click(screen.getByRole("button", { name: /send message/i }));
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

  describe("voice input", () => {
    it("should not show mic button when SpeechRecognition is unavailable", () => {
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.queryByRole("button", { name: /voice input/i })).not.toBeInTheDocument();
    });

    it("should show mic button when mic is supported and input is empty", () => {
      vi.mocked(useVoiceInput).mockReturnValue({
        isSupported: true,
        isListening: false,
        startListening: vi.fn(),
        stopListening: vi.fn(),
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /start voice input/i })).toBeInTheDocument();
    });

    it("should hide mic button when input has text", async () => {
      const user = userEvent.setup();
      vi.mocked(useVoiceInput).mockReturnValue({
        isSupported: true,
        isListening: false,
        startListening: vi.fn(),
        stopListening: vi.fn(),
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello");
      expect(screen.queryByRole("button", { name: /voice input/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    });

    it("should show stop listening label on mic button when listening", () => {
      vi.mocked(useVoiceInput).mockReturnValue({
        isSupported: true,
        isListening: true,
        startListening: vi.fn(),
        stopListening: vi.fn(),
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("button", { name: /stop listening/i })).toBeInTheDocument();
    });

    it("should disable input when listening", () => {
      vi.mocked(useVoiceInput).mockReturnValue({
        isSupported: true,
        isListening: true,
        startListening: vi.fn(),
        stopListening: vi.fn(),
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should populate input with transcript from voice hook", () => {
      let capturedOnTranscript: ((text: string) => void) | undefined;
      vi.mocked(useVoiceInput).mockImplementation(({ onTranscript }) => {
        capturedOnTranscript = onTranscript;
        return { isSupported: true, isListening: false, startListening: vi.fn(), stopListening: vi.fn() };
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      act(() => {
        capturedOnTranscript?.("scale up to 4 servings");
      });
      expect(screen.getByRole("textbox")).toHaveValue("scale up to 4 servings");
    });

    it("should call setToast when voice hook fires an error", () => {
      let capturedOnError: ((message: string) => void) | undefined;
      vi.mocked(useVoiceInput).mockImplementation(({ onError }) => {
        capturedOnError = onError;
        return { isSupported: true, isListening: false, startListening: vi.fn(), stopListening: vi.fn() };
      });
      mockUseRecipeContext({ sendMessage: mockSendMessage, setToast: mockSetToast });
      render(<ChatPanel />);
      act(() => {
        capturedOnError?.("Microphone access was denied.");
      });
      expect(mockSetToast).toHaveBeenCalledWith({ message: "Microphone access was denied." });
    });
  });
});
