export const UploadRecipe = () => (
  <main className="flex h-full flex-col items-center justify-center gap-8 p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="font-heading text-4xl font-semibold text-accent-700">
        Recipe Companion
      </h1>
      <p className="max-w-xs text-stone-900">
        Upload a recipe and chat with a cooking assistant, hands-free in the
        kitchen.
      </p>
    </div>

    <label htmlFor="recipe-file" className="flex w-full max-w-md cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-stone-400 p-10 transition-colors hover:border-accent-500">
      <input id="recipe-file" name="recipe-file" type="file" accept=".pdf,.txt" className="sr-only" />

      <svg
        aria-hidden="true"
        className="h-10 w-10 text-stone-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-stone-600">Drop your recipe here or click to browse</p>

      <p className="text-sm text-stone-700">PDF or plain text</p>
    </label>
  </main>
);
