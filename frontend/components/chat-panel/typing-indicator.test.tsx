import { render, screen } from "@testing-library/react";
import { TypingIndicator } from "./typing-indicator";

describe("TypingIndicator", () => {
  it("should have role=status", () => {
    render(<TypingIndicator />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should have an accessible label mentioning typing", () => {
    render(<TypingIndicator />);
    expect(screen.getByRole("status", { name: /typing/i })).toBeInTheDocument();
  });

  it("should render three animated dots", () => {
    const { container } = render(<TypingIndicator />);
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(3);
  });
});
