import { useEffect, useState, useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { getConnectionHealth, retryConnection, subscribeConnection } from "../lib/connection-monitor";
import type { ConnectionHealth, ConnectionIssue } from "../lib/connection-monitor";
const messages: Record<ConnectionIssue, { title: string; message: string }> = {
  offline: {
    title: "Connection lost",
    message: "You appear to be offline. Check your internet connection and try again.",
  },
  slow: {
    title: "Loading is taking longer",
    message: "Your internet connection may be slow or unstable, or MLPEKAYOU may be responding slowly. Try a stronger connection if cards or pages are not loading.",
  },
  unreachable: {
    title: "Having trouble connecting",
    message: "We could not reach part of MLPEKAYOU. This website may be blocked on the Wi-Fi you are connected to, or the service may be unavailable. Try mobile data or another network.",
  },
  service: {
    title: "Temporary service problem",
    message: "Part of MLPEKAYOU is temporarily unavailable. Please wait a moment and try again.",
  },
};
export default function ConnectionNotice() {
  const health = useSyncExternalStore<ConnectionHealth>(subscribeConnection, getConnectionHealth, getConnectionHealth);
  const [dismissedEpisode, setDismissedEpisode] = useState(-1);
  const [feedback, setFeedback] = useState("");
  useEffect(() => { setFeedback(""); }, [health.episode, health.issue]);
  const open = Boolean(health.issue) && health.episode !== dismissedEpisode;
  const copy = messages[health.issue ?? "unreachable"];
  const check = async () => {
    setFeedback("");
    const restored = await retryConnection();
    if (!restored) setFeedback("Still having trouble. Try another network, or check again shortly.");
  };
  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!next) setDismissedEpisode(health.episode); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[40000] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[40001] w-[calc(100%-2rem)] max-w-sm max-h-[80dvh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#17191b] p-5 text-white shadow-2xl">
        <div className="pr-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#E7C84B]">Connection notice</p>
          <Dialog.Title className="font-['Oxanium'] text-xl font-bold leading-tight">{copy.title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-zinc-300">{copy.message}</Dialog.Description>
        </div>
        {feedback && <p role="status" className="text-xs leading-5 text-zinc-400">{feedback}</p>}
        <div className="mt-1 flex gap-2">
          <button type="button" disabled={health.checking} onClick={() => { void check(); }} className="min-h-11 flex-1 rounded-xl bg-[#E7C84B] px-3 text-sm font-bold text-[#111517] disabled:opacity-60">{health.checking ? "Checking..." : "Try again"}</button>
          <button type="button" onClick={() => setDismissedEpisode(health.episode)} className="min-h-11 flex-1 rounded-xl border border-white/15 px-3 text-sm font-semibold text-white">Dismiss</button>
        </div>
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
