import { useCoAgent } from "@copilotkit/react-core";
import { useState } from "react";
import type { components } from "@/types/api";

type RecipeContext = components["schemas"]["RecipeContext"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ALLOWED_EXTENSIONS = [".pdf", ".txt"];

const INITIAL_STATE: RecipeContext = {
  current_step: 0,
  cooking_started: false,
};

export type UseRecipeUploadReturn = {
  state: RecipeContext;
  isLoading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
};

export const useRecipeUpload = (): UseRecipeUploadReturn => {
  const { state, setState } = useCoAgent<RecipeContext>({
    name: "recipe_agent",
    initialState: INITIAL_STATE,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (isLoading) return;

    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Unsupported file type. Please upload a PDF or plain text file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null) as { detail?: string } | null;
        throw new Error(json?.detail ?? `Upload failed (${res.status})`);
      }
      const json = await res.json() as { state: RecipeContext };
      setState(json.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { state, isLoading, error, handleUpload };
};
