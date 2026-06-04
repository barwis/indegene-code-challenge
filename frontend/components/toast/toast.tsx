"use client";

import { useEffect } from "react";
import { useRecipeContext } from "@context/recipe-context";

const TOAST_DURATION_MS = 4000;

const Toast = () => {
  const { toast, setToast } = useRecipeContext();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100vw-3rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => setToast(null)}
        aria-label="Dismiss"
        className="min-h-[44px] min-w-[44px] rounded-lg font-medium text-red-500"
      >
        &times;
      </button>
    </div>
  );
};

export { Toast };
