"use client";

import { useState } from "react";

export type UploadRecipeProps = {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  onUseFixture?: () => void;
};

export const UploadRecipe = ({
  onUpload,
  isLoading = false,
  error = null,
  onUseFixture,
}: UploadRecipeProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const dropZoneClass = [
    "flex w-full max-w-md cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed p-10 transition-colors",
    isDragOver ? "border-accent-500 bg-accent-100" : "border-stone-400 hover:border-accent-500",
    isLoading ? "pointer-events-none opacity-60" : "",
  ].filter(Boolean).join(" ");

  return (
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

      <label
        htmlFor="recipe-file"
        className={dropZoneClass}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          id="recipe-file"
          name="recipe-file"
          type="file"
          accept=".pdf,.txt"
          className="sr-only"
          onChange={handleChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <>
            <svg
              aria-hidden="true"
              className="h-10 w-10 animate-spin text-accent-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-stone-600">Parsing your recipe&hellip;</p>
          </>
        ) : (
          <>
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
          </>
        )}
      </label>

      {onUseFixture && !isLoading && (
        <button
          type="button"
          className="text-sm text-stone-400 underline hover:text-accent-600 transition-colors"
          onClick={onUseFixture}
        >
          or load a sample recipe
        </button>
      )}

      {error && (
        <p role="alert" className="max-w-md text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </main>
  );
};
