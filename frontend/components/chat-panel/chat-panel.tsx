"use client";

import { useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import type { ErrorMessageProps } from "@copilotkit/react-ui";
import { useRecipeContext } from "@context/recipe-context";
import { CopilotChatInput } from "./copilot-chat-input";

const INITIAL_LABEL =
  'Your recipe is ready! Ask me anything - scaling, substitutions, or just say "let\'s start cooking" when you\'re ready.';

const ChatErrorMessage = ({ error }: ErrorMessageProps) => {
  const { setToast } = useRecipeContext();
  useEffect(() => {
    setToast({ message: error.message || "Connection error. Please try again." });
  }, [error, setToast]);
  return null;
};

const ChatPanel = () => (
  <CopilotChat
    className="copilot-chat-panel"
    labels={{ initial: INITIAL_LABEL }}
    Input={CopilotChatInput}
    ErrorMessage={ChatErrorMessage}
  />
);

export { ChatPanel };
