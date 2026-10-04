import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, Lock, LockOpen } from "lucide-react";
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

type FrameStatus = { frame_id: string; status: "locked" | "unlocked" | "revoked"; owned_count: number; total_count: number; required_count: number };

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
const [error, setError] = useState("");
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
const [frameStatuses, setFrameStatuses] = useState<Record<string, FrameStatus>>({});
const [infoFrame, setInfoFrame] = useState<string | null>(null);
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
      setProfile(data);
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

  const shownFrame = FRAME_CATALOG.find((frame) => frame.id === infoFrame);
  const shownStatus = infoFrame ? frameStatuses[infoFrame] : null;
  return (
    <div className={`min-h-screen ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-5 flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back to profile" className={`flex h-10 w-10 items-center justify-center rounded-xl border ${surface}`}><ChevronLeft className="h-5 w-5" /></button>
          <div><h1 className="text-xl font-semibold sm:text-2xl">Profile appearance</h1><p className={`text-sm ${muted}`}>Choose your avatar and collect frames.</p></div>
        </header>
        <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <aside className={`flex items-center gap-4 rounded-2xl border p-4 lg:sticky lg:top-6 lg:flex-col lg:p-6 lg:text-center ${surface}`}>
            <div className="flex h-28 w-28 shrink-0 items-center justify-center lg:h-44 lg:w-44"><ProfileAvatar profile={profile} frameId={profile?.avatar_frame ?? null} alt="Current avatar" className="h-20 w-20 lg:h-28 lg:w-28" /></div>
            <div><p className="text-sm font-semibold">Your current look</p><p className={`mt-1 text-xs ${muted}`}>{FRAME_CATALOG.find((frame) => frame.id === profile?.avatar_frame)?.name || "No frame equipped"}</p><p className={`mt-3 max-w-52 text-xs leading-5 ${muted}`}>Frames appear wherever your profile picture is shown.</p></div>
          </aside>
          <section className="min-w-0">
            <div className={`mb-5 flex gap-1 rounded-xl border p-1 ${surface}`}>
              {(["avatars", "frames"] as const).map((tab) => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${activeTab === tab ? isLightMode ? "bg-[#c89d13]/15 text-[#725700]" : "bg-[#FFD54A]/15 text-[#FFE27A]" : muted}`}>{tab === "avatars" ? "Avatars" : "Frames"}</button>)}
            </div>
            {error && !pending ? <p role="alert" className="mb-4 text-sm text-red-500">{error}</p> : null}
            {loading ? <p role="status" className={muted}>Loading your appearance...</p> : profile ? activeTab === "avatars" ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
                {SELECTABLE_AVATARS.map((name) => <button key={name} type="button" disabled={saving} onClick={() => choose({ kind: "avatar", value: name })} aria-label={`Choose avatar ${name.replace("avatar", "")}`} aria-pressed={profile.avatar_url === name} className={`relative aspect-square rounded-2xl border p-1.5 ${profile.avatar_url === name ? selectedStyle : surface}`}>
                  <CardImage src={getAvatar(name)} alt="" className="h-full w-full rounded-[22%] object-cover" />
                  {profile.avatar_url === name ? <span className="absolute bottom-2 right-2 rounded-full bg-[#E7C84B] p-1 text-black"><Check className="h-3 w-3" /></span> : null}
                </button>)}
              </div>
            ) : (
              <>
                <p className={`mb-4 text-sm leading-6 ${muted}`}>Unlock frames through your collection. Tap a lock to see its requirement.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {[{ id: null, name: "No frame" }, ...FRAME_CATALOG].map((frame) => {
                    const selected = (profile.avatar_frame ?? null) === frame.id;
                    const state = frame.id ? frameStatuses[frame.id] : null;
                    const unlocked = frame.id === null || state?.status === "unlocked";
                    return <article key={frame.id ?? "none"} className={`relative min-w-0 overflow-hidden rounded-2xl border ${selected ? selectedStyle : surface}`}>
                      <div className="relative">
                        <button type="button" disabled={saving} aria-pressed={selected} aria-label={unlocked ? `Choose ${frame.name}` : `${frame.name}, ${state?.status === "revoked" ? "permanently locked" : "locked"}`} onClick={() => unlocked ? choose({ kind: "frame", value: frame.id }) : setInfoFrame(frame.id)} className="flex aspect-square w-full items-center justify-center p-4">
                          <ProfileAvatar profile={profile} frameId={frame.id} preview alt="" className="h-[60%] w-[60%]" />
                        </button>
                        {!unlocked ? <button type="button" onClick={() => setInfoFrame(frame.id)} aria-label={`View ${frame.name} unlock requirement`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-800/75 text-white backdrop-blur-sm"><Lock className="h-7 w-7" /><span className="text-xs font-medium">{state?.status === "revoked" ? "Permanently locked" : "Locked"}</span></button> : null}
                        {frame.id && unlocked ? <button type="button" onClick={() => setInfoFrame(frame.id)} aria-label={`View ${frame.name} met requirement`} className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 text-emerald-200"><LockOpen className="h-4 w-4" /></button> : null}
                      </div>
                      <div className="border-t border-current/10 px-3 py-3"><p className="text-sm font-semibold">{frame.name}</p><p className={`mt-1 text-xs ${muted}`}>{selected ? "Equipped" : unlocked ? "Available" : state?.status === "revoked" ? "Access revoked" : `${state?.owned_count ?? 0} / ${state?.required_count ?? "..."} ${"progressLabel" in frame ? frame.progressLabel : "cards"}`}</p></div>
                    </article>;
                  })}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>
      <Dialog open={infoFrame !== null} onOpenChange={(open) => { if (!open) setInfoFrame(null); }}>
        <DialogContent className={`max-w-md rounded-2xl border ${surface} ${isLightMode ? "text-zinc-900" : "text-white"}`}>
          <DialogTitle>{shownFrame?.name} {shownStatus?.status === "unlocked" ? "unlocked" : shownStatus?.status === "revoked" ? "permanently locked" : "requirement"}</DialogTitle>
          <DialogDescription className={muted}>{shownFrame?.requirement}</DialogDescription>
          <p className="text-sm">{shownStatus?.status === "unlocked" ? `Requirement met: ${shownStatus?.owned_count ?? 0} / ${shownStatus?.total_count ?? 0} ${shownFrame?.progressLabel ?? "cards"}.` : shownStatus?.status === "revoked" ? "This frame is no longer available for your account." : shownFrame?.merit ? "Unlock this frame on merit." : `You currently own ${shownStatus?.owned_count ?? 0} of ${shownStatus?.total_count ?? 0} ${shownFrame?.progressLabel ?? "cards"}. Own ${shownStatus?.required_count ?? 0} to unlock ${shownFrame?.name ?? "this frame"}.`}</p>
          <button type="button" onClick={() => setInfoFrame(null)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${selectedStyle}`}>Got it</button>
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
              <ProfileAvatar profile={profile} frameId={profile?.avatar_frame ?? null} alt="Current appearance" className="h-20 w-20 rounded-3xl" />
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#b38a13]" />
            <div className="flex h-32 w-32 items-center justify-center">
              <ProfileAvatar profile={previewProfile} frameId={previewProfile?.avatar_frame ?? null} preview alt="New appearance" className="h-20 w-20 rounded-3xl" />
            </div>
          </div>
          {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
          <DialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
            <button type="button" disabled={saving} onClick={() => { setPending(null); setError(""); }} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${surface}`}>Cancel</button>
            <button type="button" disabled={saving} onClick={() => void confirm()}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${selectedStyle}`}>
              {saving ? "Saving..." : pending?.kind === "frame" ? pending.value ? "Use Frame" : "Remove Frame" : "Use Avatar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
