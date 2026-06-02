"use client";

import { useEffect } from "react";
import { Mic, ArrowRight } from "lucide-react";
import { useRecipeContext } from "@context/recipe-context";
import { useTextareaAutoResize } from "./use-textarea-auto-resize";

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
  const { chatInputRef } = useRecipeContext();
  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled;
  const showMic = isMicSupported && !hasText;
  const isInputDisabled = disabled || isListening;

  const textareaRef = useTextareaAutoResize(value);

  useEffect(() => {
    chatInputRef.current = textareaRef.current;
  }, [chatInputRef, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-stone-200 p-4">
      <div
        className={`flex min-h-[50px] flex-1 items-center overflow-hidden rounded-[25px] border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-accent-400 ${isInputDisabled ? "opacity-50" : ""}`}
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
          className="block w-full resize-none bg-transparent px-4 py-[11px] text-stone-900  mr-1 focus:outline-none"
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

export type { ChatInputProps };
export { ChatInput };
