import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import * as useRecipeUploadModule from "@hooks/use-recipe-upload";
import { UploadRecipe } from "./upload-recipe";

vi.mock("@/app/hooks/use-recipe-upload");

const mockHook = (
  overrides: Partial<ReturnType<typeof useRecipeUploadModule.useRecipeUpload>> = {},
) => {
  vi.spyOn(useRecipeUploadModule, "useRecipeUpload").mockReturnValue({
    state: { current_step: 0, cooking_started: false },
    setState: vi.fn(),
    isLoading: false,
    error: null,
    handleUpload: vi.fn(),
    handleFixture: vi.fn(),
    handleToggleIngredient: vi.fn(),
    handleSetCurrentStep: vi.fn(),
    ...overrides,
  });
};

describe("UploadRecipe", () => {
  describe("default state", () => {
    it("should render without crashing", () => {
      mockHook();
      render(<UploadRecipe />);
    });

    it("should display the app headline", () => {
      mockHook();
      render(<UploadRecipe />);
      expect(
        screen.getByRole("heading", { name: /recipe companion/i }),
      ).toBeInTheDocument();
    });

    it("should have a file input accepting pdf and plain text", () => {
      mockHook();
      render(<UploadRecipe />);
      const input = screen.getByLabelText(/drop your recipe/i) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.accept).toBe(".pdf,.txt");
    });

    it("should show the supported formats hint", () => {
      mockHook();
      render(<UploadRecipe />);
      expect(screen.getByText(/pdf or plain text/i)).toBeInTheDocument();
    });
  });

  describe("file selection", () => {
    it("should call handleUpload with the selected file", async () => {
      const handleUpload = vi.fn();
      mockHook({ handleUpload });
      const user = userEvent.setup();
      render(<UploadRecipe />);
      const file = new File(["recipe content"], "recipe.txt", { type: "text/plain" });
      const input = screen.getByLabelText(/drop your recipe/i);
      await user.upload(input, file);
      expect(handleUpload).toHaveBeenCalledOnce();
      expect(handleUpload).toHaveBeenCalledWith(file);
    });
  });

  describe("loading state", () => {
    it("should show a parsing message while loading", () => {
      mockHook({ isLoading: true });
      render(<UploadRecipe />);
      expect(screen.getByText(/parsing your recipe/i)).toBeInTheDocument();
    });

    it("should disable the file input while loading", () => {
      mockHook({ isLoading: true });
      render(<UploadRecipe />);
      expect(document.getElementById("recipe-file")).toBeDisabled();
    });

    it("should not show the browse prompt while loading", () => {
      mockHook({ isLoading: true });
      render(<UploadRecipe />);
      expect(screen.queryByText(/drop your recipe here/i)).not.toBeInTheDocument();
    });
  });

  describe("fixture shortcut", () => {
    it("should call handleFixture when the sample button is clicked", async () => {
      const handleFixture = vi.fn();
      mockHook({ handleFixture });
      const user = userEvent.setup();
      render(<UploadRecipe />);
      await user.click(screen.getByRole("button", { name: /load a sample recipe/i }));
      expect(handleFixture).toHaveBeenCalledOnce();
    });

    it("should not show the sample button while loading", () => {
      mockHook({ isLoading: true });
      render(<UploadRecipe />);
      expect(
        screen.queryByRole("button", { name: /load a sample recipe/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should show an alert with the error message", () => {
      mockHook({ error: "Could not parse recipe" });
      render(<UploadRecipe />);
      expect(screen.getByRole("alert")).toHaveTextContent("Could not parse recipe");
    });

    it("should not show an alert when there is no error", () => {
      mockHook();
      render(<UploadRecipe />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
