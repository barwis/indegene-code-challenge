import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { useVoiceInput } from "./use-voice-input";
import { ChatPanel } from "./chat-panel";

vi.mock("@context/recipe-context");
vi.mock("./use-voice-input");

const mockSendMessage = vi.fn();
const mockSetToast = vi.fn();

beforeEach(() => {
  mockSendMessage.mockReset();
  mockSetToast.mockReset();
  vi.mocked(useVoiceInput).mockReturnValue({
    isSupported: false,
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
  });
});

describe("ChatPanel", () => {
  describe("submitting a message", () => {
    it("should call sendMessage with the typed text on Enter", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.type(screen.getByRole("textbox"), "Hello chef");
      await user.keyboard("{Enter}");
      expect(mockSendMessage).toHaveBeenCalledWith("Hello chef");
    });

    it("should clear the input after sending", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      const input = screen.getByRole("textbox");
      await user.type(input, "Hello chef");
      await user.keyboard("{Enter}");
      expect(input).toHaveValue("");
    });

    it("should not call sendMessage when input is empty", async () => {
      const user = userEvent.setup();
      mockUseRecipeContext({ sendMessage: mockSendMessage });
      render(<ChatPanel />);
      await user.keyboard("{Enter}");
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("should disable the input while chat is loading", () => {
      mockUseRecipeContext({ isChatLoading: true, sendMessage: mockSendMessage });
      render(<ChatPanel />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("voice hook wiring", () => {
    it("should populate the input with the transcript from the voice hook", () => {
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

    it("should call setToast when the voice hook fires an error", () => {
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
