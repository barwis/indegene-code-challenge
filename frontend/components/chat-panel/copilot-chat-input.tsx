"use client";

import { useState } from "react";
import { type InputProps } from "@copilotkit/react-ui";
import { useRecipeContext } from "@context/recipe-context";
import { ChatInput } from "./chat-input";
import { useVoiceInput } from "./use-voice-input";

const CopilotChatInput = ({ onSend, inProgress }: InputProps) => {
  const [text, setText] = useState("");
  const { setToast } = useRecipeContext();

  const { isSupported, isListening, startListening, stopListening } = useVoiceInput({
    onTranscript: (transcript) => {
      if (inProgress) return;
      onSend(transcript);
    },
    onError: (message) => {
      setToast({ message });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <ChatInput
      value={text}
      onChange={setText}
      onSend={handleSend}
      disabled={inProgress}
      isMicSupported={isSupported}
      isListening={isListening}
      onMicClick={isListening ? stopListening : startListening}
    />
  );
};

export { CopilotChatInput };
