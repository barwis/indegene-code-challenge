"use client";

import { createContext, useContext, useState, useRef } from "react";
import type { PropsWithChildren } from "react";
import { EventType } from "@ag-ui/core";
import type { AGUIEvent, RunAgentInput } from "@ag-ui/core";
import { recipeContextFixture } from "@domain/__fixtures__/recipe-context";
import { toggleCheckedIngredient } from "@domain/ingredients";
import type { components } from "@/types/api";

type RecipeState = components["schemas"]["RecipeContext"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ALLOWED_EXTENSIONS = [".pdf", ".txt"];
const INITIAL_STATE: RecipeState = { current_step: 0, cooking_started: false };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
};

export type RecipeContextValue = {
  state: RecipeState;
  setState: (next: RecipeState) => void;
  isLoading: boolean;
  error: string | null;
  handleUpload: (file: File) => Promise<void>;
  handleFixture: () => void;
  handleToggleIngredient: (name: string) => void;
  handleSetCurrentStep: (index: number) => void;
  messages: ChatMessage[];
  isChatLoading: boolean;
  sendMessage: (content: string) => void;
};

const Ctx = createContext<RecipeContextValue | null>(null);

export const RecipeProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<RecipeState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const threadId = useRef(crypto.randomUUID());

  const handleUpload = async (file: File): Promise<void> => {
    if (isLoading) return;

    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(
        "Unsupported file type. Please upload a PDF or plain text file.",
      );
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
      const json = (await res.json()) as { state: RecipeState };
      setState(json.state);
      if (json.state.recipe) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Recipe context: ${JSON.stringify(json.state.recipe)}`,
            hidden: true,
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Your recipe is ready! Ask me anything - scaling, substitutions, or just say \"let's start cooking\" when you're ready.",
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixture = () => {
    setState(recipeContextFixture);
    if (recipeContextFixture.recipe) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Recipe context: ${JSON.stringify(recipeContextFixture.recipe)}`,
          hidden: true,
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Your recipe is ready! Ask me anything - scaling, substitutions, or just say \"let's start cooking\" when you're ready.",
        },
      ]);
    }
  };

  const handleToggleIngredient = (name: string) => {
    setState((prev) => ({
      ...prev,
      checked_ingredients: toggleCheckedIngredient(
        prev.checked_ingredients ?? [],
        name,
      ),
    }));
  };

  const handleSetCurrentStep = (index: number) => {
    setState((prev) => ({ ...prev, current_step: index }));
  };

  const sendMessage = (content: string): void => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const outgoing = [...messages, userMsg];
    setMessages(outgoing);
    setIsChatLoading(true);

    void (async () => {
      try {
        const body: RunAgentInput = {
          threadId: threadId.current,
          runId: crypto.randomUUID(),
          state,
          messages: outgoing as RunAgentInput["messages"],
          tools: [],
          context: [],
          forwardedProps: {},
        };

        const res = await fetch(`${API_BASE}/copilotkit/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.body) {
          setIsChatLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantMsgId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let event: AGUIEvent;
            try {
              event = JSON.parse(line.slice(6)) as AGUIEvent;
            } catch {
              continue;
            }

            if (event.type === EventType.TEXT_MESSAGE_START) {
              assistantMsgId = event.messageId;
              const id = event.messageId;
              setMessages((prev) => [
                ...prev,
                { id, role: "assistant", content: "" },
              ]);
            } else if (
              event.type === EventType.TEXT_MESSAGE_CONTENT &&
              assistantMsgId
            ) {
              const { delta, messageId } = event;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, content: m.content + delta } : m,
                ),
              );
            } else if (event.type === EventType.STATE_SNAPSHOT) {
              // snapshot is typed `any` in ag-ui - it is schema-agnostic by design
              setState(event.snapshot as RecipeState);
            } else if (event.type === EventType.RUN_FINISHED) {
              setIsChatLoading(false);
            }
          }
        }
      } catch {
        setIsChatLoading(false);
      }
    })();
  };

  return (
    <Ctx.Provider
      value={{
        state,
        setState,
        isLoading,
        error,
        handleUpload,
        handleFixture,
        handleToggleIngredient,
        handleSetCurrentStep,
        messages,
        isChatLoading,
        sendMessage,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useRecipeContext = (): RecipeContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useRecipeContext must be used within RecipeProvider");
  return ctx;
};
