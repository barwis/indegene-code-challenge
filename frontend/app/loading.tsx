const Loading = () => (
  <main className="flex h-full flex-col items-center justify-center gap-8 p-8">
    <div className="flex animate-pulse flex-col items-center gap-3">
      <div className="h-10 w-56 rounded-lg bg-stone-200" />
      <div className="h-4 w-72 rounded bg-stone-200" />
      <div className="mt-1 h-4 w-48 rounded bg-stone-200" />
    </div>

    <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-stone-300 p-10">
      <div className="animate-pulse flex flex-col items-center gap-5 w-full">
        <div className="h-10 w-10 rounded-full bg-stone-200" />
        <div className="h-4 w-44 rounded bg-stone-200" />
        <div className="h-12 w-36 rounded-xl bg-stone-300" />
        <div className="h-3 w-28 rounded bg-stone-200" />
      </div>
    </div>
  </main>
);

export default Loading;
