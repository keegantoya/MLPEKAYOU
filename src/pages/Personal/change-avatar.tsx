import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, UserRound, Medal } from "lucide-react";
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
const appearanceStyles = `
.appearance-page{color:hsl(var(--foreground));background:hsl(var(--background))!important}.ap-heading{padding-bottom:18px;border-bottom:1px solid hsl(var(--border))}.ap-heading h1{letter-spacing:-.025em;font-size:clamp(23px,3vw,32px);line-height:1.2}.ap-heading p{margin-top:5px}.ap-preview{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px 12px;gap:18px}.ap-preview-art{display:flex;align-items:center;justify-content:center;width:174px;height:174px;flex:none;position:relative}.ap-preview-label{font-size:16px;font-weight:700}.ap-tabs{display:flex;gap:26px;border-bottom:1px solid hsl(var(--border));margin-bottom:22px}.ap-tab{display:flex;align-items:center;gap:9px;min-height:52px;padding:0 3px;border-bottom:3px solid transparent;font-size:17px;font-weight:700;color:hsl(var(--muted-foreground));transition:color .18s,border-color .18s}.ap-tab[aria-pressed=true]{border-color:hsl(var(--primary));color:hsl(var(--foreground))}.ap-tab[aria-pressed=true] svg{color:hsl(var(--primary))}.ap-section-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 14px;font-size:16px;font-weight:700;letter-spacing:-.01em}.ap-section-title span{font-size:11px;font-weight:400;color:hsl(var(--muted-foreground))}.ap-avatar-group+.ap-avatar-group{margin-top:28px}.ap-avatar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:13px}.ap-avatar{position:relative;display:block;aspect-ratio:1;overflow:hidden;padding:0;border-radius:24%;border:2px solid transparent;background:hsl(var(--muted));transition:transform .2s,border-color .2s,box-shadow .2s}.ap-avatar img{transition:transform .25s}.ap-avatar[aria-pressed=true]{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary)/.14)}.ap-equipped{position:absolute;right:5px;bottom:5px;padding:4px;border-radius:50%;background:hsl(var(--primary));color:hsl(var(--primary-foreground));box-shadow:0 2px 7px #0003}.ap-filters{display:flex;gap:20px;margin:0 0 24px;border-bottom:1px solid hsl(var(--border))}.ap-filter{min-height:44px;padding:0 0 9px;border-bottom:2px solid transparent;font-size:13px;color:hsl(var(--muted-foreground))}.ap-filter[aria-pressed=true]{color:hsl(var(--foreground));border-color:hsl(var(--primary));font-weight:700}.ap-frame{min-width:0;overflow:hidden;border:1px solid hsl(var(--border));border-radius:20px;background:hsl(var(--card));transition:transform .2s,border-color .2s,box-shadow .2s}.ap-frame[data-equipped=true]{border-color:hsl(var(--primary)/.65);box-shadow:inset 0 0 0 1px hsl(var(--primary)/.12)}.ap-frame-art{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1;padding:18px;overflow:hidden;background:radial-gradient(circle at center,hsl(var(--primary)/.1),transparent 67%)}.ap-frame-art>[data-frame-art]{transition:transform .24s}.ap-progress{height:4px;border-radius:4px;overflow:hidden;background:hsl(var(--primary)/.12);margin-top:10px}.ap-progress span{display:block;height:100%;border-radius:inherit;background:hsl(var(--primary));transition:width .3s}.ap-dialog{border-color:hsl(var(--primary)/.25)!important;background:hsl(var(--card))!important;color:hsl(var(--foreground))!important}.appearance-page button:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:4px}.ap-avatar:disabled,.ap-frame-art:disabled{opacity:.6}
.ap-frame-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}.ap-staff-link{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border-radius:10px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-size:14px;font-weight:600;text-decoration:none}.ap-staff-link:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:4px}@media(min-width:640px){.ap-frame-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:1024px){.ap-frame-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}@media(min-width:1800px){.ap-frame-grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}}
@media(hover:hover) and (pointer:fine){.ap-avatar:hover:not(:disabled){transform:translateY(-4px) rotate(-1deg);border-color:hsl(var(--primary)/.5);box-shadow:0 8px 18px #0002}.ap-avatar:hover img{transform:scale(1.055)}.ap-frame:hover{border-color:hsl(var(--primary)/.45);box-shadow:0 8px 24px #0001}.ap-frame-art:hover>[data-frame-art]{transform:scale(1.06) rotate(-2deg)}}
@media(min-width:1024px){.ap-avatar-grid{grid-template-columns:repeat(auto-fill,minmax(132px,1fr))}}@media(max-width:639px){.ap-heading{padding-bottom:14px}.ap-preview{flex-direction:row;text-align:left;gap:14px;padding:16px;border-radius:22px}.ap-preview-art{width:110px;height:110px}.ap-preview-art>span,.ap-preview-art>div{max-width:80px;max-height:80px}.ap-preview-label{font-size:14px}.ap-preview p.mt-3{margin-top:6px;font-size:11px}.ap-tabs{margin-bottom:18px;gap:24px}.ap-tab{font-size:16px;min-height:48px}.ap-avatar-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.ap-section-title{font-size:14px}.ap-frame-art{padding:12px}.ap-avatar-group+.ap-avatar-group{margin-top:24px}}
@media(prefers-reduced-motion:reduce){.appearance-page *,.ap-dialog *{transition:none!important;animation:none!important}.ap-avatar:hover,.ap-avatar:hover img,.ap-frame-art:hover>[data-frame-art]{transform:none!important}}
`;
const db = supabase as unknown as SupabaseClient;
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
const [hoverPreview, setHoverPreview] = useState<Selection | null>(null);
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
const displayProfile = hoverPreview?.kind === "avatar" ? { ...profile, avatar_url: hoverPreview.value } : hoverPreview?.kind === "frame" ? { ...profile, avatar_frame: hoverPreview.value } : profile;
const olderAvatars = SELECTABLE_AVATARS.filter(name => Number(name.slice(6)) < 51);
const newAvatars = SELECTABLE_AVATARS.filter(name => Number(name.slice(6)) >= 51);
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
const savedAppearance = useMemo(() => <ProfileAvatar profile={displayProfile} frameId={displayProfile?.avatar_frame ?? null} preview alt={hoverPreview ? "Preview appearance" : "Current avatar"} className="h-24 w-24 lg:h-28 lg:w-28" />, [displayProfile?.id, displayProfile?.avatar_url, displayProfile?.avatar_frame, hoverPreview]);
const shownFrame = FRAME_CATALOG.find((frame) => frame.id === infoFrame);
const shownStatus = infoFrame ? frameStatuses[infoFrame] : null;
  return (
    <div className={`appearance-page min-h-screen ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <style>{appearanceStyles}</style>
      <main className="w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="ap-heading mb-5 flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back to profile" className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${surface}`}><ChevronLeft className="h-5 w-5" /></button>
          <div><h1 className="text-xl font-semibold sm:text-2xl">Profile appearance</h1><p className={`text-sm ${muted}`}>Change your avatar or pick a frame.</p></div>
        </header>
        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          <aside className="ap-preview lg:sticky lg:top-[calc(var(--kayou-header-bottom,64px)+1rem)]">
            <div className="ap-preview-art">{savedAppearance}</div>
            <div><p className="ap-preview-label">{hoverPreview ? "Trying on" : "On your profile"}</p><p className={`mt-1 text-xs ${muted}`}>{FRAME_CATALOG.find((frame) => frame.id === displayProfile?.avatar_frame)?.name || "No frame equipped"}</p><p className={`mt-3 max-w-52 text-xs leading-5 ${muted}`}>{hoverPreview ? "Click to get a closer look." : "Pick an avatar or see which frames you’ve unlocked."}</p></div>
          </aside>
          <section className="min-w-0">
            <div className="ap-tabs">
              {(["avatars", "frames"] as const).map((tab) => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className="ap-tab">{tab === "avatars" ? <UserRound size={18} aria-hidden="true"/> : <Medal size={18} aria-hidden="true"/>}{tab === "avatars" ? "Avatars" : "Frames"}</button>)}
            </div>
            {error && !pending ? <p role="alert" className="mb-4 text-sm text-red-500">{error}</p> : null}
            {loading ? <p role="status" className={muted}>Loading your appearance...</p> : profile ? activeTab === "avatars" ? (
              <div className="ap-avatar-sections">
                {[{ title: "Earlier avatars", avatars: olderAvatars }, { title: "Just added", avatars: newAvatars }].map(group => <section key={group.title} className="ap-avatar-group"><h2 className="ap-section-title">{group.title}<span>{group.avatars.length} avatars</span></h2><div className="ap-avatar-grid">
                  {group.avatars.map(name => <button key={name} type="button" disabled={saving} onMouseEnter={() => setHoverPreview({ kind: "avatar", value: name })} onMouseLeave={() => setHoverPreview(null)} onFocus={() => setHoverPreview({ kind: "avatar", value: name })} onBlur={() => setHoverPreview(null)} onClick={() => choose({ kind: "avatar", value: name })} aria-label={`Choose avatar ${name.replace("avatar", "")}`} aria-pressed={profile.avatar_url === name} className="ap-avatar">
                    <CardImage src={getAvatar(name)} alt="" className="absolute inset-0 block h-full w-full object-cover object-center" />
                    {profile.avatar_url === name && <span className="ap-equipped"><Check size={13} aria-hidden="true"/></span>}
                  </button>)}
                </div></section>)}
              </div>
          ) : (
              <>
              <div className="ap-filters">{(["all", "available", "locked"] as const).map(value => <button key={value} type="button" aria-pressed={frameFilter === value} onClick={() => setFrameFilter(value)} className="ap-filter">{value === "all" ? "All frames" : value === "available" ? "Unlocked" : "Locked"}</button>)}</div>
              {[{ name: "Collection frames", frames: FRAME_CATALOG.filter(frame => !frame.kofiMonthly && !["frame003", "frame010"].includes(frame.id)) }, { name: "Community frames", frames: FRAME_CATALOG.filter(frame => ["frame003", "frame010"].includes(frame.id)) }, { name: "Ko-Fi supporter frames", frames: FRAME_CATALOG.filter(frame => frame.kofiMonthly) }].map(group => {
const frames = group.frames.filter(frame => frameFilter === "all" || (frameStatuses[frame.id]?.status === "unlocked") === (frameFilter === "available"));
                if (!frames.length) return null;
                return <section key={group.name} className="mb-7"><h2 className="ap-section-title">{group.name}</h2>{group.name === "Ko-Fi supporter frames" && <p className={`mt-2 text-xs leading-5 ${muted}`}>A permanent thank-you from Keegan. These frames stay unlocked even after your Ko-Fi membership ends.</p>}<div className="ap-frame-grid">
                {frames.map(frame => {
const state = frameStatuses[frame.id]; const unlocked = state?.status === "unlocked"; const permanentlyLocked = state?.status === "revoked"; const selected = profile.avatar_frame === frame.id; const application = requests.find(row => row.frame_id === frame.id);
                  return <article key={frame.id} className="ap-frame" data-equipped={selected}>
                    <p className={`px-3 pt-3 text-center text-xs font-bold ${permanentlyLocked ? "text-red-600 dark:text-red-300" : unlocked ? "text-emerald-700 dark:text-emerald-300" : muted}`}>{permanentlyLocked ? "Permanently locked" : unlocked ? selected ? "Equipped" : "Unlocked" : "Locked"}</p>
                    <button type="button" disabled={saving} onMouseEnter={() => setHoverPreview({ kind: "frame", value: frame.id })} onMouseLeave={() => setHoverPreview(null)} onFocus={() => setHoverPreview({ kind: "frame", value: frame.id })} onBlur={() => setHoverPreview(null)} onClick={() => openFrame(frame.id)} aria-label={unlocked ? `Choose ${frame.name}` : permanentlyLocked ? `${frame.name}, permanently locked; view details` : `View ${frame.name} requirement`} className="ap-frame-art"><span data-frame-art={frame.id} className={`flex h-[64%] w-[64%] items-center justify-center ${permanentlyLocked ? "grayscale blur-[2px] opacity-35" : !unlocked ? "opacity-75" : ""}`}><ProfileAvatar profile={profile} frameId={frame.id} preview alt="" className="h-full w-full" /></span></button>
                    <div className="border-t border-current/10 px-3 py-2.5"><p className="text-xs font-semibold sm:text-sm">{frame.name}</p><p className={`mt-1 text-xs ${muted}`}>{permanentlyLocked ? "Staff review needed" : selected ? "Equipped" : unlocked ? "Available" : frame.kofiMonthly ? application?.status === "pending" ? "Awaiting approval" : application?.status === "denied" ? "Request reviewed" : `$${frame.kofiMonthly}/month - request approval` : state?.status === "revoked" ? "Permanently locked" : frame.id === "frame003" ? "Tap to unlock" : frame.id === "frame010" ? "Limited-time reward" : `${state?.owned_count ?? 0} / ${state?.required_count ?? "..."}`}</p>
                    {!frame.kofiMonthly && !frame.merit && frame.id !== "frame010" && !permanentlyLocked && <div className="ap-progress" role="progressbar" aria-label={`${frame.name} unlock progress`} aria-valuemin={0} aria-valuemax={Math.max(1, state?.required_count ?? 1)} aria-valuenow={Math.min(Math.max(0, state?.owned_count ?? 0), Math.max(1, state?.required_count ?? 1))}><span style={{ width: `${unlocked ? 100 : Math.min(100, Math.max(0, (state?.owned_count ?? 0) / Math.max(1, state?.required_count ?? 1) * 100))}%` }}/></div>}
                    <button type="button" onClick={() => { setInfoFrame(frame.id); setPublicName(application?.public_name ?? ""); setRequestError(""); }} className="mt-1 min-h-9 text-xs font-medium text-primary">{permanentlyLocked ? "Contact staff" : frame.kofiMonthly && !unlocked ? "Request this frame" : "How to unlock"}</button></div>
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
        <DialogContent onEscapeKeyDown={event => { if (requestBusy) event.preventDefault(); }} onPointerDownOutside={event => { if (requestBusy) event.preventDefault(); }} className={`ap-dialog max-h-[90dvh] overflow-y-auto max-w-md rounded-3xl border ${surface} ${isLightMode ? "text-zinc-900" : "text-white"}`}>
          <DialogTitle>{shownFrame?.name} {shownStatus?.status === "unlocked" ? "unlocked" : shownStatus?.status === "revoked" ? "permanently locked" : "requirement"}</DialogTitle>
          <DialogDescription className={muted}>{shownFrame?.requirement}</DialogDescription>
          {shownStatus?.status === "revoked" ? <div className="space-y-4"><p className="text-sm leading-6">{shownFrame && !shownFrame.kofiMonthly && !shownFrame.merit && shownFrame.id !== "frame010" ? "This frame was locked after your collection passed its unlock requirement and later dropped below it. The system flags that change as a possible attempt to claim a frame without earning it." : "This frame needs a staff review before it can be unlocked again."}</p><p className="text-sm leading-6">If you were correcting your checklist or think this was a mistake, please reach out to staff. They can review it and restore access.</p><a className="ap-staff-link" href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer">Contact staff on Discord</a><p className={`text-xs leading-5 ${muted}`}>Let staff know your website username and which frame is locked.</p></div> : shownFrame?.kofiMonthly ? <div className="space-y-4">
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
          <p className="text-sm">{shownStatus?.status === "unlocked" ? `Requirement met: ${shownStatus.owned_count} / ${shownStatus.total_count} ${shownFrame?.progressLabel ?? "cards"}.` : infoFrame === "frame003" ? "Tap Unlock Frame to add the Pakra frame to your available frames." : shownFrame?.merit ? "Unlock this frame on merit." : `You currently own ${shownStatus?.owned_count ?? 0} of ${shownStatus?.total_count ?? 0} ${shownFrame?.progressLabel ?? "cards"}. Own ${shownStatus?.required_count ?? 0} to unlock ${shownFrame?.name ?? "this frame"}.`}</p>
          {infoFrame === "frame003" && shownStatus?.status !== "unlocked" ? <button type="button" disabled={saving} onClick={() => void unlockPakraFrame()} className={`rounded-2xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${selectedStyle}`}>{saving ? "Unlocking..." : "Unlock Frame"}</button> : <button type="button" onClick={() => setInfoFrame(null)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${selectedStyle}`}>Got it</button>}
          {error && infoFrame === "frame003" && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </>}
       </DialogContent>
      </Dialog>
    <Dialog open={pending !== null} onOpenChange={(open) => { if (!open && !saving) { setPending(null); setError(""); } }}>
        <DialogContent className={`ap-dialog max-w-md rounded-3xl border ${isLightMode ? "bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}
          onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (saving) event.preventDefault(); }}>
          <DialogTitle>{pending?.kind === "frame" ? pending.value ? "Use this frame?" : "Remove your frame?" : "Use this avatar?"}</DialogTitle>
          <DialogDescription className={muted}>Your selection will appear on your profile.</DialogDescription>
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="flex h-32 w-32 items-center justify-center">
              <ProfileAvatar profile={profile} frameId={profile?.avatar_frame ?? null} preview alt="Current appearance" className="h-24 w-24 rounded-3xl" />
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex h-32 w-32 items-center justify-center">
              <ProfileAvatar profile={previewProfile} frameId={previewProfile?.avatar_frame ?? null} preview alt="New appearance" className="h-24 w-24 rounded-3xl" />
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
