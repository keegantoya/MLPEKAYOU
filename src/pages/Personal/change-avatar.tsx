import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, Hourglass } from "lucide-react";
import CardImage from "@/components/CardImage";
import ProfileAvatar, { avatarFrameQueryKey } from "@/components/ProfileAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import {
  getAvatar,
  SELECTABLE_AVATARS,
  FRAME_CATALOG,
  type ProfileAssetUser,
} from "../Everypony/profile-assets";
const db = supabase as unknown as SupabaseClient;
const AVATARS_LEAVING_SOON = new Set(["avatar016", "avatar017", "avatar018", "avatar019", "avatar020", "avatar021", "avatar022", "avatar023", "avatar024", "avatar025", "avatar026", "avatar029", "avatar032", "avatar039", "avatar040", "avatar041", "avatar042", "avatar043", "avatar046"]);
type FrameStatus = { frame_id: string; status: "locked" | "unlocked" | "revoked"; owned_count: number; total_count: number; required_count: number };
type KofiRequest = { id: string; frame_id: string; public_name: string; status: "pending" | "approved" | "denied"; staff_comment: string; updated_at: string };
type Selection = { kind: "avatar"; value: string } | { kind: "frame"; value: string | null };
export default function ChangeAvatar() {
const navigate = useNavigate();
const location = useLocation();
const queryClient = useQueryClient();
const [profile, setProfile] = useState<ProfileAssetUser | null>(null);
const [activeTab, setActiveTab] = useState<"avatars" | "frames">(
    () => new URLSearchParams(location.search).get("tab") === "frames" ? "frames" : "avatars",
  );
const [pending, setPending] = useState<Selection | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const unlockPending = useRef(false);
const [error, setError] = useState("");
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
const [frameStatuses, setFrameStatuses] = useState<Record<string, FrameStatus>>({});
const [infoFrame, setInfoFrame] = useState<string | null>(null);
const [frameFilter, setFrameFilter] = useState<"all" | "available" | "locked">("all");
const [requests, setRequests] = useState<KofiRequest[]>([]);
const [publicName, setPublicName] = useState("");
const [requestBusy, setRequestBusy] = useState(false);
const [requestError, setRequestError] = useState("");
const requestLock = useRef(false);
const requestFrame = FRAME_CATALOG.find(frame => frame.id === infoFrame);
const currentRequest = requests.find(row => row.frame_id === infoFrame);
const submitRequest = async () => {
  if (!requestFrame?.kofiMonthly || requestLock.current || !publicName.trim()) return;
  requestLock.current = true; setRequestBusy(true); setRequestError("");
  try {
const { error } = await db.rpc("kofi_frame_requests", { p_action: "submit", p_data: { frame_id: requestFrame.id, public_name: publicName.trim() } });
    if (error) throw error;
const { data, error: refreshError } = await db.rpc("kofi_frame_requests", { p_action: "mine" });
    if (refreshError) throw refreshError;
    setRequests((data ?? []) as KofiRequest[]);
    window.dispatchEvent(new Event("staff-communications-changed"));
  } catch (cause) { setRequestError(cause instanceof Error ? cause.message : (cause as { message?: string })?.message || "Your request could not be saved. Please retry."); }
  finally { requestLock.current = false; setRequestBusy(false); }
};
const previewProfile = pending?.kind === "avatar"
    ? { ...profile, avatar_url: pending.value }
    : pending?.kind === "frame"
      ? { ...profile, avatar_frame: pending.value }
      : profile;
const surface = isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]";
const muted = isLightMode ? "text-zinc-600" : "text-zinc-400";
const selectedStyle = isLightMode
    ? "border-[#8a6a00]/50 bg-[#c89d13]/10 ring-2 ring-[#8a6a00]/15"
    : "border-[#FFD54A]/55 bg-[#FFD54A]/10 ring-2 ring-[#FFD54A]/15";
  useEffect(() => {
    setActiveTab(new URLSearchParams(location.search).get("tab") === "frames" ? "frames" : "avatars");
  }, [location.search]);
  useEffect(() => {
let active = true;
const load = async () => {
      try {
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active) return;
        if (!session?.user) {
          setError("Log in to change your avatar.");
          return;
        }
const { data, error } = await db
          .from("profiles")
          .select("id, avatar_url, avatar_frame")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;
        if (!active) return;
const { data: statuses, error: statusError } = await db.rpc("get_my_avatar_frames");
      if (statusError) throw statusError;
      if (!active) return;
      setFrameStatuses(Object.fromEntries((statuses || []).map((row: FrameStatus) => [row.frame_id, row])));
const requestResult = await db.rpc("kofi_frame_requests", { p_action: "mine" });
      if (!active) return;
      if (!requestResult.error) setRequests((requestResult.data ?? []) as KofiRequest[]);
      setProfile(current => current?.id === data.id && current?.avatar_url === data.avatar_url && current?.avatar_frame === data.avatar_frame ? current : data);
        queryClient.setQueryData(avatarFrameQueryKey(session.user.id), data.avatar_frame ?? null);
      } catch {
        if (active) setError("Your avatar could not be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
const refresh = window.setInterval(() => { void load(); }, 30000);
  return () => { active = false; window.clearInterval(refresh); };
  }, [queryClient]);
  useEffect(() => {
const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
const previousHtmlBackground = document.documentElement.style.backgroundColor;
const previousBodyBackground = document.body.style.backgroundColor;
const background = isLightMode ? "#f5f5f3" : "#0d0f10";
    document.documentElement.style.backgroundColor = background;
    document.body.style.backgroundColor = background;
    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackground;
      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, [isLightMode]);
const choose = (selection: Selection) => {
    setError("");
    setPending(selection);
  };
const unlockPakraFrame = async () => {
    if (saving || unlockPending.current || !profile?.id) return;
    if (frameStatuses.frame003?.status === "revoked") {
      setInfoFrame("frame003");
      return;
    }
    unlockPending.current = true;
    setSaving(true);
    setError("");
    try {
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user || session.user.id !== profile.id) throw new Error("Log in again to unlock this frame.");
const { error: unlockError } = await db.rpc("unlock_pakra_supporter_frame");
      if (unlockError) throw unlockError;
const { data: statuses, error: statusError } = await db.rpc("get_my_avatar_frames");
      if (statusError) throw statusError;
const rows = (statuses ?? []) as FrameStatus[];
      setFrameStatuses(Object.fromEntries(rows.map(row => [row.frame_id, row])));
const status = rows.find(row => row.frame_id === "frame003")?.status;
      if (status === "revoked") throw new Error("Access to this frame has been revoked.");
      if (status !== "unlocked") throw new Error("The frame could not be unlocked. Please try again.");
      setInfoFrame(null);
      choose({ kind: "frame", value: "frame003" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The Pakra frame could not be unlocked. Please try again.");
    } finally {
      unlockPending.current = false;
      setSaving(false);
    }
  };
const openFrame = (frameId: string | null) => {
    setPublicName(requests.find(row => row.frame_id === frameId)?.public_name ?? "");
    setRequestError("");
    if (saving || unlockPending.current) return;
    if (frameId === null || frameStatuses[frameId]?.status === "unlocked") {
      choose({ kind: "frame", value: frameId });
    } else if (frameId === "frame003" && frameStatuses[frameId]?.status !== "revoked") {
      void unlockPakraFrame();
    } else {
      setInfoFrame(frameId);
    }
  };
const confirm = async () => {
    if (!pending || saving || !profile?.id) return;
    setSaving(true);
    setError("");
    try {
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user || session.user.id !== profile.id) throw new Error("Session changed");
      if (pending.kind === "frame" && pending.value !== null) {
const { data: statuses, error: statusError } = await db.rpc("get_my_avatar_frames");
      if (statusError) throw statusError;
      if (!statuses?.some((row: FrameStatus) => row.frame_id === pending.value && row.status === "unlocked")) throw new Error("Frame is locked");
    }
const update = pending.kind === "avatar"
        ? { avatar_url: pending.value }
        : { avatar_frame: pending.value };
const { data, error: saveError } = await db
        .from("profiles")
        .update(update)
        .eq("id", session.user.id)
        .select("id, avatar_url, avatar_frame")
        .single();
      if (saveError) throw saveError;
      setProfile(data);
      queryClient.setQueryData(avatarFrameQueryKey(data.id), data.avatar_frame ?? null);
      window.dispatchEvent(new CustomEvent("profile-updated", { detail: data }));
      if (pending.kind === "avatar") {
const { error: metadataError } = await supabase.auth.updateUser({ data: { avatar_url: pending.value } });
        if (metadataError) console.error("Avatar metadata sync failed:", metadataError);
      }
      setPending(null);
    } catch {
      setError(pending.kind === "frame"
        ? "Your frame could not be saved. Please try again."
        : "Your avatar could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };
const savedAppearance = useMemo(() => <ProfileAvatar profile={{ id: profile?.id, avatar_url: profile?.avatar_url, avatar_frame: profile?.avatar_frame }} frameId={profile?.avatar_frame ?? null} preview alt="Current avatar" className="h-16 w-16 lg:h-24 lg:w-24" />, [profile?.id, profile?.avatar_url, profile?.avatar_frame]);
const shownFrame = FRAME_CATALOG.find((frame) => frame.id === infoFrame);
const shownStatus = infoFrame ? frameStatuses[infoFrame] : null;
  return (
    <div className={`min-h-screen ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <main className="w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back to profile" className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${surface}`}><ChevronLeft className="h-5 w-5" /></button>
          <div><h1 className="text-xl font-semibold sm:text-2xl">Profile appearance</h1><p className={`text-sm ${muted}`}>Choose your avatar and collect frames.</p></div>
        </header>
        <div className="grid items-start gap-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-8">
          <aside className={`flex items-center gap-4 rounded-3xl border-b p-4 lg:sticky lg:top-[calc(var(--kayou-header-bottom,64px)+1rem)] lg:flex-col lg:border-b-0 lg:border-r lg:p-4 lg:text-center ${surface}`}>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center lg:h-36 lg:w-36">{savedAppearance}</div>
            <div><p className="text-sm font-semibold">Your current look</p><p className={`mt-1 text-xs ${muted}`}>{FRAME_CATALOG.find((frame) => frame.id === profile?.avatar_frame)?.name || "No frame equipped"}</p><p className={`mt-3 max-w-52 text-xs leading-5 ${muted}`}>Frames appear wherever your profile picture is shown.</p></div>
          </aside>
          <section className="min-w-0">
            <div className={`mb-5 flex gap-1 rounded-2xl border p-1 ${surface}`}>
              {(["avatars", "frames"] as const).map((tab) => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold ${activeTab === tab ? isLightMode ? "bg-[#c89d13]/15 text-[#725700]" : "bg-[#FFD54A]/15 text-[#FFE27A]" : muted}`}>{tab === "avatars" ? "Avatars" : "Frames"}</button>)}
            </div>
            {error && !pending ? <p role="alert" className="mb-4 text-sm text-red-500">{error}</p> : null}
            {loading ? <p role="status" className={muted}>Loading your appearance...</p> : profile ? activeTab === "avatars" ? (
              <div><div role="note" className="mb-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Hourglass className="mt-1 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" /><p><strong className="font-semibold text-foreground">Leaving soon.</strong> Avatars marked with this hourglass are leaving the selector in 24-48 hours.</p></div><div className="grid grid-cols-4 items-start gap-2 min-[420px]:grid-cols-5 sm:grid-cols-6 lg:grid-cols-[repeat(auto-fill,minmax(90px,1fr))] sm:gap-3">
                {SELECTABLE_AVATARS.map((name) => <button key={name} type="button" disabled={saving} onClick={() => choose({ kind: "avatar", value: name })} aria-label={`Choose avatar ${name.replace("avatar", "")}${AVATARS_LEAVING_SOON.has(name) ? ", leaving the selector soon" : ""}`} aria-pressed={profile.avatar_url === name} className={`relative block aspect-square w-full overflow-hidden rounded-[22%] border p-0 leading-none ${profile.avatar_url === name ? selectedStyle : surface}`}>
                  <CardImage src={getAvatar(name)} alt="" className="absolute inset-0 block h-full w-full object-cover object-center" />
                  {AVATARS_LEAVING_SOON.has(name) && <span title="Leaving the selector in 24-48 hours" aria-label="Leaving soon" className="pointer-events-none absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/90 text-amber-300 shadow-sm sm:h-7 sm:w-7"><Hourglass className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /></span>}
                  {profile.avatar_url === name ? <span className="absolute bottom-2 right-2 rounded-full bg-[#E7C84B] p-1 text-black"><Check className="h-3 w-3" /></span> : null}
              </button>)}
            </div>
           </div>
          ) : (
              <>
              <div className="mb-5 flex gap-5 border-b border-current/10">{(["all", "available", "locked"] as const).map(value => <button key={value} type="button" aria-pressed={frameFilter === value} onClick={() => setFrameFilter(value)} className={`min-h-11 rounded-t-2xl border-b-2 px-3 text-sm font-semibold capitalize ${frameFilter === value ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{value === "all" ? "All frames" : value}</button>)}</div>
              {[{ name: "Collection frames", frames: FRAME_CATALOG.filter(frame => !frame.kofiMonthly && !["frame003", "frame010"].includes(frame.id)) }, { name: "Community frames", frames: FRAME_CATALOG.filter(frame => ["frame003", "frame010"].includes(frame.id)) }, { name: "Ko-Fi supporter frames", frames: FRAME_CATALOG.filter(frame => frame.kofiMonthly) }].map(group => {
const frames = group.frames.filter(frame => frameFilter === "all" || (frameStatuses[frame.id]?.status === "unlocked") === (frameFilter === "available"));
                if (!frames.length) return null;
                return <section key={group.name} className="mb-7"><h2 className="border-b border-current/10 pb-2 text-sm font-semibold">{group.name}</h2>{group.name === "Ko-Fi supporter frames" && <p className={`mt-2 text-xs leading-5 ${muted}`}>A permanent thank-you from Keegan. These frames stay unlocked even after your Ko-Fi membership ends.</p>}<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
                {frames.map(frame => {
const state = frameStatuses[frame.id]; const unlocked = state?.status === "unlocked"; const permanentlyLocked = state?.status === "revoked"; const selected = profile.avatar_frame === frame.id; const application = requests.find(row => row.frame_id === frame.id);
                  return <article key={frame.id} className={`min-w-0 overflow-hidden rounded-2xl border ${selected ? selectedStyle : surface}`}>
                    <p className={`px-3 pt-3 text-center text-xs font-bold ${permanentlyLocked ? "text-red-600 dark:text-red-300" : unlocked ? "text-emerald-700 dark:text-emerald-300" : muted}`}>{permanentlyLocked ? "Permanently locked" : unlocked ? selected ? "Equipped" : "Unlocked" : "Locked"}</p>
                    <button type="button" disabled={saving} onClick={() => openFrame(frame.id)} aria-label={unlocked ? `Choose ${frame.name}` : permanentlyLocked ? `${frame.name}, permanently locked; view details` : `View ${frame.name} requirement`} className="flex aspect-square w-full items-center justify-center overflow-hidden p-5 sm:p-6"><span data-frame-art={frame.id} className={`flex h-[60%] w-[60%] items-center justify-center ${permanentlyLocked ? "grayscale blur-[2px] opacity-35" : !unlocked ? "grayscale opacity-60" : ""}`}><ProfileAvatar profile={profile} frameId={frame.id} preview alt="" className="h-full w-full" /></span></button>
                    <div className="border-t border-current/10 px-3 py-2.5"><p className="text-xs font-semibold sm:text-sm">{frame.name}</p><p className={`mt-1 text-xs ${muted}`}>{selected ? "Equipped" : unlocked ? "Available" : frame.kofiMonthly ? application?.status === "pending" ? "Awaiting approval" : application?.status === "denied" ? "Request reviewed" : `$${frame.kofiMonthly}/month - request approval` : state?.status === "revoked" ? "Permanently locked" : frame.id === "frame003" ? "Tap to unlock" : frame.id === "frame010" ? "Limited-time reward" : `${state?.owned_count ?? 0} / ${state?.required_count ?? "..."}`}</p>
                    <button type="button" onClick={() => { setInfoFrame(frame.id); setPublicName(application?.public_name ?? ""); setRequestError(""); }} className="mt-1 min-h-9 text-xs font-medium text-primary">{frame.kofiMonthly && !unlocked ? "View criteria / request" : "View requirement"}</button></div>
                  </article>;
                })}</div></section>;
              })}
              <button type="button" disabled={saving} onClick={() => openFrame(null)} className="min-h-11 rounded-2xl border border-current/20 px-4 text-sm">Remove equipped frame</button>
            </>
            ) : null}
          </section>
        </div>
      </main>
      <Dialog open={infoFrame !== null} onOpenChange={(open) => { if (!open && !requestBusy) setInfoFrame(null); }}>
        <DialogContent onEscapeKeyDown={event => { if (requestBusy) event.preventDefault(); }} onPointerDownOutside={event => { if (requestBusy) event.preventDefault(); }} className={`max-h-[90dvh] overflow-y-auto max-w-md rounded-3xl border ${surface} ${isLightMode ? "text-zinc-900" : "text-white"}`}>
          <DialogTitle>{shownFrame?.name} {shownStatus?.status === "unlocked" ? "unlocked" : shownStatus?.status === "revoked" ? "permanently locked" : "requirement"}</DialogTitle>
          <DialogDescription className={muted}>{shownFrame?.requirement}</DialogDescription>
          {shownFrame?.kofiMonthly ? <div className="space-y-4">
          <div className="mx-auto flex h-32 w-32 items-center justify-center"><ProfileAvatar profile={profile} frameId={shownFrame.id} preview className="h-20 w-20" alt="Frame preview" /></div>
          <p className="text-sm leading-6">This frame is yours permanently once approved, even if your membership ends. A thank you from Keegan for supporting MLPEKAYOU.</p>
          <a href="https\://ko-fi.com/Q2Y429HP6N" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-primary underline">Visit MLPEKAYOU on Ko-Fi</a>
          {shownStatus?.status === "unlocked" ? <p className="text-sm font-semibold">Permanently unlocked.</p> : currentRequest?.status === "approved" ? <p role="status" className="text-sm">Approved. Your frame availability will refresh shortly.</p> : currentRequest?.status === "pending" ? <p role="status" className="text-sm">Your request is awaiting moderator approval under <strong>{currentRequest.public_name}</strong>.</p> : <form onSubmit={event => { event.preventDefault(); void submitRequest(); }} className="space-y-3">
            {currentRequest?.status === "denied" && <p className="text-sm leading-6">Previous request not approved: {currentRequest.staff_comment}</p>}
            <label className="block text-sm font-semibold">Public Ko-Fi membership name<input required maxLength={100} value={publicName} onChange={event => setPublicName(event.target.value)} disabled={requestBusy} autoComplete="off" className="mt-2 min-h-11 w-full rounded-2xl border border-border bg-background px-3 text-base text-foreground" /></label>
            <p className={`text-xs leading-5 ${muted}`}>Enter the exact name your subscription publicly appears under on the MLPEKAYOU Ko-Fi homepage. Moderators will use that name to verify your membership.</p>
            <button type="submit" disabled={requestBusy || !publicName.trim()} className="min-h-11 w-full rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{requestBusy ? "Submitting..." : "Request frame approval"}</button>
          </form>}
          {requestError && <p role="alert" className="text-sm text-red-500">{requestError}</p>}
        </div> : <>
          <p className="text-sm">{shownStatus?.status === "unlocked" ? `Requirement met: ${shownStatus.owned_count} / ${shownStatus.total_count} ${shownFrame?.progressLabel ?? "cards"}.` : shownStatus?.status === "revoked" ? "This frame is no longer available for your account." : infoFrame === "frame003" ? "Tap Unlock Frame to add the Pakra frame to your available frames." : shownFrame?.merit ? "Unlock this frame on merit." : `You currently own ${shownStatus?.owned_count ?? 0} of ${shownStatus?.total_count ?? 0} ${shownFrame?.progressLabel ?? "cards"}. Own ${shownStatus?.required_count ?? 0} to unlock ${shownFrame?.name ?? "this frame"}.`}</p>
          {infoFrame === "frame003" && shownStatus?.status !== "unlocked" && shownStatus?.status !== "revoked" ? <button type="button" disabled={saving} onClick={() => void unlockPakraFrame()} className={`rounded-2xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${selectedStyle}`}>{saving ? "Unlocking..." : "Unlock Frame"}</button> : <button type="button" onClick={() => setInfoFrame(null)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${selectedStyle}`}>Got it</button>}
          {error && infoFrame === "frame003" && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </>}
       </DialogContent>
      </Dialog>
    <Dialog open={pending !== null} onOpenChange={(open) => { if (!open && !saving) { setPending(null); setError(""); } }}>
        <DialogContent className={`max-w-md rounded-3xl border ${isLightMode ? "bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}
          onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (saving) event.preventDefault(); }}>
          <DialogTitle>{pending?.kind === "frame" ? pending.value ? "Use this frame?" : "Remove your frame?" : "Use this avatar?"}</DialogTitle>
          <DialogDescription className={muted}>Your selection will appear on your profile.</DialogDescription>
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="flex h-32 w-32 items-center justify-center">
              <ProfileAvatar profile={profile} frameId={profile?.avatar_frame ?? null} preview alt="Current appearance" className="h-20 w-20 rounded-3xl" />
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#b38a13]" />
            <div className="flex h-32 w-32 items-center justify-center">
              <ProfileAvatar profile={previewProfile} frameId={previewProfile?.avatar_frame ?? null} preview alt="New appearance" className="h-20 w-20 rounded-3xl" />
            </div>
          </div>
          {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
          <DialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
            <button type="button" disabled={saving} onClick={() => { setPending(null); setError(""); }} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${surface}`}>Cancel</button>
            <button type="button" disabled={saving} onClick={() => void confirm()}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${selectedStyle}`}>
              {saving ? "Saving..." : pending?.kind === "frame" ? pending.value ? "Use Frame" : "Remove Frame" : "Use Avatar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
