"use client";

import { X } from "lucide-react";
import { ChatPanel } from "@components";
import { useRecipeContext } from "@context/recipe-context";
import { useDrawerDrag } from "./use-drawer-drag";

const ChatDrawer = () => {
  const { isChatOpen, openChat, closeChat } = useRecipeContext();
  const {
    drawerRef,
    isDragging,
    drawerStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useDrawerDrag({ isOpen: isChatOpen, onOpen: openChat, onClose: closeChat });

  return (
    <div className="md:hidden">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={isChatOpen ? "true" : "false"}
        aria-label="Cooking assistant"
        style={drawerStyle}
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[50vh] flex-col rounded-t-2xl bg-stone-100 shadow-2xl"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          role="button"
          tabIndex={0}
          data-testid="drawer-handle"
          aria-label={isChatOpen ? "Close assistant" : "Open assistant"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") isChatOpen ? closeChat() : openChat();
          }}
          className={`flex w-full select-none touch-none items-center justify-center rounded-t-2xl bg-accent-500 pb-2 pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.15)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <span className="h-1 w-10 rounded-full bg-accent-300" />
        </div>

        <div className="flex items-center justify-between border-b border-stone-200 px-4 pb-3">
          <span className="font-body text-sm font-semibold text-stone-700">
            Cooking assistant
          </span>
          <button
            onClick={closeChat}
            data-testid="drawer-close"
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
