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

export { TypingIndicator };
