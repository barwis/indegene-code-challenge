"use client";

import { useState, useEffect, useRef } from "react";
import { useRecipeContext } from "@context/recipe-context";
import type { ChatMessage } from "@context/recipe-context";

// Typing indicator (animated dots)

const TypingIndicator = () => (
  <span
    role="status"
    aria-label="Agent is typing"
    className="flex items-center gap-1"
  >
    <span className="h-2 w-2 rounded-full bg-stone-400 motion-safe:animate-pulse" />
    <span className="h-2 w-2 rounded-full bg-stone-400 motion-safe:animate-pulse [animation-delay:0.3s]" />
    <span className="h-2 w-2 rounded-full bg-stone-400 motion-safe:animate-pulse [animation-delay:0.6s]" />
  </span>
);

// ChatInput

type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
};

const ChatInput = ({ value, onChange, onSend, disabled }: ChatInputProps) => {
  const canSend = value.trim().length > 0 && !disabled;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="flex gap-2 border-t border-stone-200 p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your cooking assistant..."
        aria-label="Chat message"
        className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
      />
      <button
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send message"
        className="min-h-[50px] min-w-[50px] rounded-xl bg-accent-500 px-4 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
};

// ChatMessageList

type ChatMessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

const isVisibleMessage = (m: ChatMessage): boolean =>
  !m.hidden &&
  (m.role === "user" || m.role === "assistant") &&
  typeof m.content === "string" &&
  m.content.length > 0;

const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const visibleMessages = messages.filter(isVisibleMessage);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {visibleMessages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                isUser
                  ? "max-w-[80%] rounded-2xl bg-accent-500 px-4 py-3 text-white"
                  : "max-w-[80%] rounded-2xl bg-stone-200 px-4 py-3 text-stone-900"
              }
            >
              {msg.content as string}
            </div>
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-stone-200 px-4 py-3">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

// ChatPanel

export const ChatPanel = () => {
  const { messages, isChatLoading, sendMessage } = useRecipeContext();
  const [inputValue, setInputValue] = useState("");

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
      />
    </div>
  );
};
