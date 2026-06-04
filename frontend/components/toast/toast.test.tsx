import { render, screen, act, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { mockUseRecipeContext } from "@test-utils/recipe-context-mock";
import { Toast } from "./toast";

vi.mock("@context/recipe-context");

const mockSetToast = vi.fn();

describe("Toast", () => {
  beforeEach(() => {
    mockSetToast.mockReset();
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

    it("should not show a retry button", () => {
      mockUseRecipeContext({
        toast: { message: "Something went wrong." },
        setToast: mockSetToast,
      });
      render(<Toast />);
      expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    });
  });
});
