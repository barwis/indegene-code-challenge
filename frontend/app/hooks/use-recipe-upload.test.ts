import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import { useCoAgent } from "@copilotkit/react-core";
import { useRecipeUpload } from "./use-recipe-upload";
import type { components } from "@/types/api";

type RecipeContext = components["schemas"]["RecipeContext"];

vi.mock("@copilotkit/react-core", () => ({
  useCoAgent: vi.fn(),
}));

const mockSetState = vi.fn();

const noRecipeState: RecipeContext = { current_step: 0, cooking_started: false };

const withRecipeState: RecipeContext = {
  current_step: 0,
  cooking_started: false,
  recipe: {
    title: "Spaghetti al Pomodoro",
    servings: 4,
    difficulty: "easy",
    ingredients: [],
    steps: [],
  },
};

beforeEach(() => {
  mockSetState.mockClear();
  vi.mocked(useCoAgent).mockReturnValue({
    state: noRecipeState,
    setState: mockSetState,
  } as unknown as ReturnType<typeof useCoAgent>);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ state: withRecipeState }),
    } as Response),
  );
});

describe("useRecipeUpload", () => {
  describe("initial state", () => {
    it("should return no recipe, not loading, and no error", () => {
      const { result } = renderHook(() => useRecipeUpload());
      expect(result.current.state.recipe).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("handleUpload — success", () => {
    it("should call setState with the parsed recipe state", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["recipe text"], "recipe.txt", { type: "text/plain" });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(mockSetState).toHaveBeenCalledWith(withRecipeState);
    });

    it("should POST to the upload endpoint with the file", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["recipe text"], "recipe.txt", { type: "text/plain" });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/upload",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("should clear the error on a new upload attempt", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({
            ok: false,
            status: 422,
            json: async () => ({ detail: "Bad file" }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ state: withRecipeState }),
          } as Response),
      );
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["x"], "x.txt", { type: "text/plain" });
      await act(async () => { await result.current.handleUpload(file); });
      expect(result.current.error).toBe("Bad file");
      await act(async () => { await result.current.handleUpload(file); });
      expect(result.current.error).toBeNull();
    });

    it("should set isLoading to false after upload completes", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["recipe"], "recipe.txt", { type: "text/plain" });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handleUpload — concurrent guard", () => {
    it("should not start a second fetch while an upload is already in progress", async () => {
      vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["recipe"], "recipe.txt", { type: "text/plain" });

      act(() => { void result.current.handleUpload(file); });
      await act(async () => { await result.current.handleUpload(file); });

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleUpload — file type validation", () => {
    it("should set an error and not fetch for unsupported file types", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File(["img"], "photo.jpg", { type: "image/jpeg" }));
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.error).toMatch(/unsupported file type/i);
    });

    it("should accept .pdf files", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File(["pdf"], "recipe.pdf", { type: "application/pdf" }));
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should accept .txt files", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File(["txt"], "recipe.txt", { type: "text/plain" }));
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should not set isLoading when rejecting an invalid file type", async () => {
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File(["doc"], "notes.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handleUpload — failure", () => {
    it("should set error from the response detail field", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({ detail: "Could not parse a recipe" }),
        } as Response),
      );
      const { result } = renderHook(() => useRecipeUpload());
      const file = new File(["not a recipe"], "notes.txt", { type: "text/plain" });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(result.current.error).toBe("Could not parse a recipe");
    });

    it("should set a generic error when the response has no detail field", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response),
      );
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File([""], "f.txt", { type: "text/plain" }));
      });
      expect(result.current.error).toBe("Upload failed (500)");
    });

    it("should set isLoading to false after a failed upload", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response),
      );
      const { result } = renderHook(() => useRecipeUpload());
      await act(async () => {
        await result.current.handleUpload(new File([""], "f.txt", { type: "text/plain" }));
      });
      expect(result.current.isLoading).toBe(false);
    });
  });
});
