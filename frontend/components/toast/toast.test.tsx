import { render, screen, act, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { Toast } from "./toast";

vi.mock("@context/recipe-context");

const mockSetToast = vi.fn();
const mockRetryLastMessage = vi.fn();

describe("Toast", () => {
  beforeEach(() => {
    mockSetToast.mockReset();
    mockRetryLastMessage.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when toast is null", () => {
    it("should render nothing", () => {
      mockUseRecipeContext({ toast: null, setToast: mockSetToast });
      const { container } = render(<Toast />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when toast has a message", () => {
    it("should display the message", () => {
      mockUseRecipeContext({
        toast: { message: "Something went wrong." },
        setToast: mockSetToast,
      });
      render(<Toast />);
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
    });

    it("should auto-dismiss after 4 seconds", () => {
      mockUseRecipeContext({
        toast: { message: "Something went wrong." },
        setToast: mockSetToast,
      });
      render(<Toast />);
      act(() => vi.advanceTimersByTime(4000));
      expect(mockSetToast).toHaveBeenCalledWith(null);
    });

    it("should dismiss when the dismiss button is clicked", () => {
      mockUseRecipeContext({
        toast: { message: "Something went wrong." },
        setToast: mockSetToast,
      });
      render(<Toast />);
      fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
      expect(mockSetToast).toHaveBeenCalledWith(null);
    });

    it("should not show a retry button when showRetry is not set", () => {
      mockUseRecipeContext({
        toast: { message: "Something went wrong." },
        setToast: mockSetToast,
      });
      render(<Toast />);
      expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe("when toast has showRetry", () => {
    it("should show a retry button", () => {
      mockUseRecipeContext({
        toast: { message: "Connection lost.", showRetry: true },
        setToast: mockSetToast,
        retryLastMessage: mockRetryLastMessage,
      });
      render(<Toast />);
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    it("should not auto-dismiss when showRetry is true", () => {
      mockUseRecipeContext({
        toast: { message: "Connection lost.", showRetry: true },
        setToast: mockSetToast,
        retryLastMessage: mockRetryLastMessage,
      });
      render(<Toast />);
      act(() => vi.advanceTimersByTime(4000));
      expect(mockSetToast).not.toHaveBeenCalled();
    });

    it("should dismiss and call retryLastMessage when retry is clicked", () => {
      mockUseRecipeContext({
        toast: { message: "Connection lost.", showRetry: true },
        setToast: mockSetToast,
        retryLastMessage: mockRetryLastMessage,
      });
      render(<Toast />);
      fireEvent.click(screen.getByRole("button", { name: /retry/i }));
      expect(mockSetToast).toHaveBeenCalledWith(null);
      expect(mockRetryLastMessage).toHaveBeenCalledOnce();
    });
  });
});
