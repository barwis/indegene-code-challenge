"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, ArrowRight } from "lucide-react";
import Markdown from "react-markdown";
import { useRecipeContext } from "@context/recipe-context";
import type { ChatMessage } from "@context/recipe-context";
import { useVoiceInput } from "./use-voice-input";
import { useAutoResize } from "./use-auto-resize";

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
  isMicSupported: boolean;
  isListening: boolean;
  onMicClick: () => void;
};

const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled,
  isMicSupported,
  isListening,
  onMicClick,
}: ChatInputProps) => {
  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled;
  const showMic = isMicSupported && !hasText;
  const isInputDisabled = disabled || isListening;

  const textareaRef = useAutoResize(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-stone-200 p-4">
      <div
        className={`flex-1 overflow-hidden rounded-full border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-accent-400 ${isInputDisabled ? "opacity-50" : ""}`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your cooking assistant..."
          aria-label="Chat message"
          disabled={isInputDisabled}
          className="block w-full resize-none bg-transparent px-4 py-3 text-stone-900 focus:outline-none"
        />
      </div>
      {showMic ? (
        <button
          onClick={onMicClick}
          disabled={disabled}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          aria-pressed={isListening}
          className={`flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? "bg-red-500 ring-4 ring-red-300 motion-safe:animate-pulse" : "bg-accent-500"}`}
        >
          <Mic size={20} />
        </button>
      ) : (
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight size={20} />
        </button>
      )}
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
            className={`flex motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 duration-200 ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex w-full flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={
                  isUser
                    ? "max-w-[80%] rounded-2xl bg-accent-500 px-4 py-3 text-white"
                    : "prose prose-stone max-w-[80%] rounded-2xl bg-stone-200 px-4 py-3 text-stone-900"
                }
              >
                {isUser ? (
                  msg.content as string
                ) : (
                  <Markdown>{msg.content as string}</Markdown>
                )}
              </div>
              {isUser && msg.failed && (
                <span className="text-xs text-red-500">Not sent</span>
              )}
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
