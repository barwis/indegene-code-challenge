"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { PropsWithChildren, RefObject } from "react";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { CopilotKitProvider } from "@/app/copilotkit-provider";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import { toggleCheckedIngredient } from "@domain/ingredients";
import type { components } from "@/types/api";

type RecipeState = components["schemas"]["RecipeContext"];
type UploadResponse = components["schemas"]["UploadResponse"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ALLOWED_EXTENSIONS = [".pdf", ".txt"];
const INITIAL_STATE: RecipeState = { current_step: 0, cooking_started: false };

export type ToastConfig = {
  message: string;
};

export type RecipeContextValue = {
  state: RecipeState;
  isLoading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  handleFixture: () => void;
  handleToggleIngredient: (name: string) => void;
  handleSetCurrentStep: (index: number) => void;
  handleSubstitute: (name: string) => void;
  toast: ToastConfig | null;
  setToast: (config: ToastConfig | null) => void;
  resetUpload: () => void;
  resetRecipe: () => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  activeTab: string;
  setActiveTab: (id: string) => void;
  chatInputRef: RefObject<HTMLTextAreaElement | null>;
};

const Ctx = createContext<RecipeContextValue | null>(null);

// ── Inner component — must live inside <CopilotKit> ──────────────────────────

type InnerProps = PropsWithChildren<{
  uploadedState: RecipeState;
  isLoading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  resetUpload: () => void;
  resetRecipeOuter: () => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  chatInputRef: RefObject<HTMLTextAreaElement | null>;
  activeTab: string;
  setActiveTab: (id: string) => void;
  handleFixtureAction: () => void;
}>;

const RecipeStateInner = ({
  children,
  uploadedState,
  isLoading,
  error,
  handleUpload,
  resetUpload,
  resetRecipeOuter,
  isChatOpen,
  openChat,
  closeChat,
  chatInputRef,
  activeTab,
  setActiveTab,
  handleFixtureAction,
}: InnerProps) => {
  const { state: agentState, setState } = useCoAgent<RecipeState>({
    name: "recipe_agent",
    initialState: uploadedState,
  });
  // agentState starts as {} before any backend run — use uploadedState as base
  // and overlay agentState mutations. Once backend sets recipe, use agentState as
  // the sole source.
  const state: RecipeState =
    agentState?.recipe != null
      ? agentState
      : { ...uploadedState, ...(agentState ?? {}) };

  const { appendMessage } = useCopilotChat();

  const [toast, setToast] = useState<ToastConfig | null>(null);

  // useCoAgent initialState is not sent to the backend until onRunInitialized
  // fires — too late for the first request. Push uploadedState into agent.state
  // on mount so the first message always carries the full recipe context.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current && uploadedState.recipe != null) {
      seededRef.current = true;
      setState(uploadedState);
    }
  }, [setState, uploadedState]);

  const userMutationRef = useRef(false);

  const prevAgentStateRef = useRef<RecipeState | null>(null);
  useEffect(() => {
    const prev = prevAgentStateRef.current;
    prevAgentStateRef.current = agentState ?? null;
    if (userMutationRef.current) {
      userMutationRef.current = false;
      return;
    }
    if (!prev || !agentState) return;
    // Guard against false positives when agentState first populates from initialState.
    if (
      prev.current_step !== undefined &&
      (agentState.current_step !== prev.current_step ||
        agentState.cooking_started !== prev.cooking_started)
    ) {
      setActiveTab("steps");
    } else if (
      prev.recipe?.ingredients !== undefined &&
      (JSON.stringify(agentState.recipe?.ingredients) !==
        JSON.stringify(prev.recipe?.ingredients) ||
        agentState.recipe?.servings !== prev.recipe?.servings)
    ) {
      setActiveTab("ingredients");
    }
  }, [agentState, setActiveTab]);

  const handleToggleIngredient = (name: string): void => {
    setState((prev: RecipeState | undefined) => ({
      ...(prev ?? INITIAL_STATE),
      checked_ingredients: toggleCheckedIngredient(
        (prev ?? INITIAL_STATE).checked_ingredients ?? [],
        name,
      ),
    }));
  };

  const handleSetCurrentStep = (index: number): void => {
    userMutationRef.current = true;
    setState((prev: RecipeState | undefined) => ({
      ...(prev ?? INITIAL_STATE),
      current_step: index,
    }));
  };

  const handleSubstitute = (name: string): void => {
    void appendMessage(
      new TextMessage({ role: MessageRole.User, content: `Substitute ${name}` }),
    );
    openChat();
    chatInputRef.current?.focus();
  };

  const handleFixture = (): void => {
    handleFixtureAction();
  };

  const resetRecipe = (): void => {
    setToast(null);
    resetRecipeOuter();
  };

  return (
    <Ctx.Provider
      value={{
        state,
        isLoading,
        error,
        handleUpload,
        handleFixture,
        handleToggleIngredient,
        handleSetCurrentStep,
        handleSubstitute,
        toast,
        setToast,
        resetUpload,
        resetRecipe,
        isChatOpen,
        openChat,
        closeChat,
        chatInputRef,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

// ── Outer component — manages upload state + threadId ─────────────────────────

export const RecipeProvider = ({ children }: PropsWithChildren) => {
  const [uploadedState, setUploadedState] = useState<RecipeState>(INITIAL_STATE);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [uploadId, setUploadId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients");
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleUpload = async (file: File): Promise<void> => {
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
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(json?.detail ?? `Upload failed (${res.status})`);
      }
      const json = (await res.json()) as UploadResponse;
      setUploadedState(json.state);
      setThreadId(json.threadId);
      setUploadId((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixtureAction = (): void => {
    setUploadedState(recipeContextFixture);
    setUploadId((prev) => prev + 1);
  };

  const resetRecipe = (): void => {
    setUploadedState(INITIAL_STATE);
    setThreadId(undefined);
    setUploadId((prev) => prev + 1);
    setError(null);
    setIsChatOpen(false);
    setActiveTab("ingredients");
  };

  return (
    <CopilotKitProvider threadId={threadId}>
      <RecipeStateInner
        key={uploadId}
        uploadedState={uploadedState}
        isLoading={isLoading}
        error={error}
        handleUpload={handleUpload}
        resetUpload={() => setError(null)}
        resetRecipeOuter={resetRecipe}
        isChatOpen={isChatOpen}
        openChat={() => setIsChatOpen(true)}
        closeChat={() => setIsChatOpen(false)}
        chatInputRef={chatInputRef}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleFixtureAction={handleFixtureAction}
      >
        {children}
      </RecipeStateInner>
    </CopilotKitProvider>
  );
};

export const useRecipeContext = (): RecipeContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useRecipeContext must be used within RecipeProvider");
  return ctx;
};
