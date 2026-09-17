export default function CollectionLoading({ failed = false }: { failed?: boolean }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f5f7] px-6 py-16 text-zinc-900 dark:bg-[#101112] dark:text-white">
      <div className="flex flex-col items-center gap-4 text-center" role={failed ? "alert" : "status"} aria-live="polite">
        {!failed && <div aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-[#FFD54A] motion-reduce:animate-none dark:border-zinc-700 dark:border-t-[#FFD54A]" />}
        <p className="text-base font-semibold">{failed ? "Couldn't load your collection." : "Loading your collection…"}</p>
        {failed && <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-[#FFD54A] px-5 py-2 text-sm font-semibold text-zinc-900">Try again</button>}
      </div>
    </div>
  );
}
