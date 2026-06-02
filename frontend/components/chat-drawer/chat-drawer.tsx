"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "@components";

const ChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ask assistant"
        className={[
          "fixed bottom-6 right-6 z-40 flex min-h-[50px] min-w-[50px] items-center gap-2 rounded-full",
          "bg-accent-500 px-5 text-white shadow-lg",
          "transition-[opacity,transform] duration-200",
          isOpen ? "pointer-events-none scale-75 opacity-0" : "scale-100 opacity-100",
        ].join(" ")}
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">Ask assistant</span>
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cooking assistant"
        className={[
          "fixed bottom-0 left-0 right-0 z-50 flex h-[50vh] flex-col rounded-t-2xl bg-stone-100 shadow-2xl",
          "transition-transform duration-300 ease-stagger",
          isOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close assistant"
          className="flex w-full items-center justify-center pb-2 pt-3"
        >
          <span className="h-1 w-10 rounded-full bg-stone-300" />
        </button>

        <div className="flex items-center justify-between border-b border-stone-200 px-4 pb-3">
          <span className="font-body text-sm font-semibold text-stone-700">
            Cooking assistant
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export { ChatDrawer };
