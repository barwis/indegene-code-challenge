import { render, screen } from "@testing-library/react";
import { UploadRecipe } from "./upload-recipe";

describe("UploadRecipe", () => {
  it("renders without crashing", () => {
    render(<UploadRecipe />);
  });

  it("displays the app headline", () => {
    render(<UploadRecipe />);
    expect(
      screen.getByRole("heading", { name: /recipe companion/i }),
    ).toBeInTheDocument();
  });

  it("has a file input accepting pdf and plain text", () => {
    render(<UploadRecipe />);
    const input = screen.getByLabelText(/drop your recipe/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe(".pdf,.txt");
  });

  it("shows the supported formats hint", () => {
    render(<UploadRecipe />);
    expect(screen.getByText(/pdf or plain text/i)).toBeInTheDocument();
  });
});
