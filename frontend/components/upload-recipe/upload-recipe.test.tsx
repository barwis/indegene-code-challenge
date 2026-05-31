import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { UploadRecipe } from "./upload-recipe";

describe("UploadRecipe", () => {
  describe("default state", () => {
    it("should render without crashing", () => {
      render(<UploadRecipe onUpload={vi.fn()} />);
    });

    it("should display the app headline", () => {
      render(<UploadRecipe onUpload={vi.fn()} />);
      expect(
        screen.getByRole("heading", { name: /recipe companion/i }),
      ).toBeInTheDocument();
    });

    it("should have a file input accepting pdf and plain text", () => {
      render(<UploadRecipe onUpload={vi.fn()} />);
      const input = screen.getByLabelText(/drop your recipe/i) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.accept).toBe(".pdf,.txt");
    });

    it("should show the supported formats hint", () => {
      render(<UploadRecipe onUpload={vi.fn()} />);
      expect(screen.getByText(/pdf or plain text/i)).toBeInTheDocument();
    });
  });

  describe("file selection", () => {
    it("should call onUpload with the selected file", async () => {
      const onUpload = vi.fn();
      const user = userEvent.setup();
      render(<UploadRecipe onUpload={onUpload} />);
      const file = new File(["recipe content"], "recipe.txt", { type: "text/plain" });
      const input = screen.getByLabelText(/drop your recipe/i);
      await user.upload(input, file);
      expect(onUpload).toHaveBeenCalledOnce();
      expect(onUpload).toHaveBeenCalledWith(file);
    });
  });

  describe("loading state", () => {
    it("should show a parsing message while loading", () => {
      render(<UploadRecipe onUpload={vi.fn()} isLoading />);
      expect(screen.getByText(/parsing your recipe/i)).toBeInTheDocument();
    });

    it("should disable the file input while loading", () => {
      render(<UploadRecipe onUpload={vi.fn()} isLoading />);
      expect(document.getElementById("recipe-file")).toBeDisabled();
    });

    it("should not show the browse prompt while loading", () => {
      render(<UploadRecipe onUpload={vi.fn()} isLoading />);
      expect(screen.queryByText(/drop your recipe here/i)).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should show an alert with the error message", () => {
      render(<UploadRecipe onUpload={vi.fn()} error="Could not parse recipe" />);
      expect(screen.getByRole("alert")).toHaveTextContent("Could not parse recipe");
    });

    it("should not show an alert when there is no error", () => {
      render(<UploadRecipe onUpload={vi.fn()} />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
