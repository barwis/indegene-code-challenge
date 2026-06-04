import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import { useState } from "react";
import { RecipeProvider, useRecipeContext } from "./recipe-context";
import type { components } from "@/types/api";

type RecipeContext = components["schemas"]["RecipeContext"];

const INITIAL_STATE: RecipeContext = { current_step: 0, cooking_started: false };

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

const mockAppendMessage = vi.fn();

vi.mock("@copilotkit/react-core", () => ({
  CopilotKit: ({ children }: { children: React.ReactNode }) => children,
  useCoAgent: ({ initialState }: { name: string; initialState?: RecipeContext }) => {
    const [state, setState] = useState<RecipeContext>(initialState ?? INITIAL_STATE);
    return { state, setState, running: false, nodeName: null, threadId: null };
  },
  useCopilotChat: () => ({
    appendMessage: mockAppendMessage,
    isLoading: false,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecipeProvider>{children}</RecipeProvider>
);

beforeEach(() => {
  mockAppendMessage.mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        state: withRecipeState,
        threadId: "test-thread-id",
        runId: "test-run-id",
      }),
    } as Response),
  );
});

describe("RecipeProvider / useRecipeContext", () => {
  describe("initial state", () => {
    it("should return no recipe, not loading, and no error", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      expect(result.current.state.recipe).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("handleUpload - success", () => {
    it("should update state with the parsed recipe", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      const file = new File(["recipe text"], "recipe.txt", {
        type: "text/plain",
      });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(result.current.state.recipe?.title).toBe("Spaghetti al Pomodoro");
    });

    it("should POST to the upload endpoint with the file", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      const file = new File(["recipe text"], "recipe.txt", {
        type: "text/plain",
      });
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
        vi
          .fn()
          .mockResolvedValueOnce({
            ok: false,
            status: 422,
            json: async () => ({ detail: "Bad file" }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              state: withRecipeState,
              threadId: "test-thread-id",
              runId: "test-run-id",
            }),
          } as Response),
      );
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      const file = new File(["x"], "x.txt", { type: "text/plain" });
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(result.current.error).toBe("Bad file");
      await act(async () => {
        await result.current.handleUpload(file);
      });
      expect(result.current.error).toBeNull();
    });

    it("should set isLoading to false after upload completes", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
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
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      const file = new File(["recipe"], "recipe.txt", { type: "text/plain" });

      act(() => {
        void result.current.handleUpload(file);
      });
      await act(async () => {
        await result.current.handleUpload(file);
      });

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleUpload — file type validation", () => {
    it("should set an error and not fetch for unsupported file types", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File(["img"], "photo.jpg", { type: "image/jpeg" }),
        );
      });
      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.error).toMatch(/unsupported file type/i);
    });

    it("should accept .pdf files", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File(["pdf"], "recipe.pdf", { type: "application/pdf" }),
        );
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should accept .txt files", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File(["txt"], "recipe.txt", { type: "text/plain" }),
        );
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should not set isLoading when rejecting an invalid file type", async () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File(["doc"], "notes.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }),
        );
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handleFixture", () => {
    it("should set state to the fixture recipe", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleFixture();
      });
      expect(result.current.state.recipe?.title).toBe("Spaghetti al Pomodoro");
    });
  });

  describe("handleSetCurrentStep", () => {
    it("should update current_step in state", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleSetCurrentStep(4);
      });
      expect(result.current.state.current_step).toBe(4);
    });

    it("should preserve other state fields when updating current_step", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleToggleIngredient("garlic");
      });
      act(() => {
        result.current.handleToggleIngredient("salt");
      });
      act(() => {
        result.current.handleSetCurrentStep(2);
      });
      expect(result.current.state.current_step).toBe(2);
      expect(result.current.state.checked_ingredients).toEqual([
        "garlic",
        "salt",
      ]);
    });
  });

  describe("resetRecipe", () => {
    it("should set isChatOpen to false", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleSubstitute("garlic");
      });
      expect(result.current.isChatOpen).toBe(true);
      act(() => {
        result.current.resetRecipe();
      });
      expect(result.current.isChatOpen).toBe(false);
    });
  });

  describe("handleSubstitute", () => {
    it("should call appendMessage with 'Substitute [name]'", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleSubstitute("garlic");
      });
      expect(mockAppendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: "user", content: "Substitute garlic" }),
      );
    });

    it("should set isChatOpen to true", () => {
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      act(() => {
        result.current.handleSubstitute("garlic");
      });
      expect(result.current.isChatOpen).toBe(true);
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
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      const file = new File(["not a recipe"], "notes.txt", {
        type: "text/plain",
      });
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
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File([""], "f.txt", { type: "text/plain" }),
        );
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
      const { result } = renderHook(() => useRecipeContext(), { wrapper });
      await act(async () => {
        await result.current.handleUpload(
          new File([""], "f.txt", { type: "text/plain" }),
        );
      });
      expect(result.current.isLoading).toBe(false);
    });
  });
});
