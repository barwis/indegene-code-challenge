"use client";

import { useRef, useEffect } from "react";
import Markdown from "react-markdown";
import type { ChatMessage } from "@context/recipe-context";
import { TypingIndicator } from "./typing-indicator";

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

export type { ChatMessageListProps };
export { ChatMessageList, isVisibleMessage };
