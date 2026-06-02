import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { ChatInput } from "./chat-input";

vi.mock("@context/recipe-context");

beforeEach(() => {
  mockUseRecipeContext();
});

const defaultProps = {
  value: "",
  onChange: vi.fn(),
  onSend: vi.fn(),
  disabled: false,
  isMicSupported: false,
  isListening: false,
  onMicClick: vi.fn(),
};

describe("ChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("textarea", () => {
    it("should render a textarea with the chat message label", () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByRole("textbox", { name: /chat message/i })).toBeInTheDocument();
    });

    it("should reflect the value prop", () => {
      render(<ChatInput {...defaultProps} value="Hello" />);
      expect(screen.getByRole("textbox")).toHaveValue("Hello");
    });

    it("should call onChange when typing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ChatInput {...defaultProps} onChange={onChange} />);
      await user.type(screen.getByRole("textbox"), "H");
      expect(onChange).toHaveBeenCalled();
    });

    it("should be disabled when isListening is true", () => {
      render(<ChatInput {...defaultProps} isMicSupported={true} isListening={true} />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should be disabled when disabled prop is true", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("send button", () => {
    it("should show send button when value has text", () => {
      render(<ChatInput {...defaultProps} value="Hello" />);
      expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    });

    it("should disable send button when value is empty", () => {
      render(<ChatInput {...defaultProps} value="" />);
      expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    });

    it("should disable send button when disabled is true", () => {
      render(<ChatInput {...defaultProps} value="Hello" disabled={true} />);
      expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    });

    it("should call onSend when clicked with text", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} value="Hello" onSend={onSend} />);
      await user.click(screen.getByRole("button", { name: /send message/i }));
      expect(onSend).toHaveBeenCalled();
    });

    it("should call onSend when Enter is pressed with text", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} value="Hello" onSend={onSend} />);
      await user.click(screen.getByRole("textbox"));
      await user.keyboard("{Enter}");
      expect(onSend).toHaveBeenCalled();
    });

    it("should not call onSend when Shift+Enter is pressed", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} value="Hello" onSend={onSend} />);
      await user.keyboard("{Shift>}{Enter}{/Shift}");
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("mic button", () => {
    it("should show mic button when isMicSupported is true and value is empty", () => {
      render(<ChatInput {...defaultProps} value="" isMicSupported={true} />);
      expect(
        screen.getByRole("button", { name: /start voice input/i }),
      ).toBeInTheDocument();
    });

    it("should hide mic button when value has text", () => {
      render(<ChatInput {...defaultProps} value="Hello" isMicSupported={true} />);
      expect(
        screen.queryByRole("button", { name: /voice input/i }),
      ).not.toBeInTheDocument();
    });

    it("should not show mic button when isMicSupported is false", () => {
      render(<ChatInput {...defaultProps} isMicSupported={false} />);
      expect(
        screen.queryByRole("button", { name: /voice input/i }),
      ).not.toBeInTheDocument();
    });

    it("should show stop listening label when isListening is true", () => {
      render(<ChatInput {...defaultProps} isMicSupported={true} isListening={true} />);
      expect(
        screen.getByRole("button", { name: /stop listening/i }),
      ).toBeInTheDocument();
    });

    it("should call onMicClick when mic button is clicked", async () => {
      const user = userEvent.setup();
      const onMicClick = vi.fn();
      render(<ChatInput {...defaultProps} isMicSupported={true} onMicClick={onMicClick} />);
      await user.click(screen.getByRole("button", { name: /start voice input/i }));
      expect(onMicClick).toHaveBeenCalled();
    });
  });
});
