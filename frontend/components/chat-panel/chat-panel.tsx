"use client";

import { useState } from "react";
import { useRecipeContext } from "@context/recipe-context";
import { useVoiceInput } from "./use-voice-input";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";

const ChatPanel = () => {
  const { messages, isChatLoading, sendMessage, setToast } = useRecipeContext();
  const [inputValue, setInputValue] = useState("");

  const { isSupported, isListening, startListening, stopListening } =
    useVoiceInput({
      onTranscript: (text) => setInputValue(text),
      onError: (message) => setToast({ message }),
    });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex h-full flex-col">
      <ChatMessageList messages={messages ?? []} isLoading={isChatLoading} />
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isChatLoading}
        isMicSupported={isSupported}
        isListening={isListening}
        onMicClick={isListening ? stopListening : startListening}
      />
    </div>
  );
};

export { ChatPanel };
