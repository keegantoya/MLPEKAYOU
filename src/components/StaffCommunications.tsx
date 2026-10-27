import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { profileViewName, profileViewCode } from "@/lib/english-card-views";
import { getChineseCard, getChineseCardLabel, chineseSets } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import CardImage from "@/components/CardImage";
import { FRAME_CATALOG, getProfileAssets } from "@/pages/Everypony/profile-assets";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUp, Shield, Search, X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
type Summary = { userId: string; is_moderator: boolean; is_owner: boolean; moderation_unread: number; conversation_unread: number; unread: number; error: string };
type Notice = { id: string; title: string; url: string; thread_id: string | null; created_at: string; read_at: string | null };
type Entry = { id: string; from_staff: boolean; sender_role?: "staff" | "owner"; kind: "message" | "appeal" | "decision"; appeal_id?: string | null; body: string; created_at: string; system_context?: SystemResponse | null };
type Thread = { id: string; user_id: string; username: string; escalated_at?: string | null };
type ThreadRow = Thread & { updated_at: string; preview: string; unread: number; resolved_at?: string | null };
type Appeal = { id: string; status: string; updated_at: string };
type CollectorProfile = { id: string; username: string | null; avatar_url: string | null };
function useCollectorProfiles(ids: string[]) {
  const key = [...new Set(ids.filter(Boolean))].sort().join(",");
  const [profiles, setProfiles] = useState<Record<string, CollectorProfile>>({});
  useEffect(() => {
    let active = true;
    if (!key) return;
    void (async () => {
      const { data, error } = await supabase.from("profiles").select("id,username,avatar_url").in("id", key.split(","));
      if (active && !error) setProfiles(previous => ({ ...previous, ...Object.fromEntries((data ?? []).map((profile: CollectorProfile) => [profile.id, profile])) }));
    })().catch(() => {});
    return () => { active = false; };
  }, [key]);
  return profiles;
}
function CollectorPortrait({ profile, name }: { profile?: CollectorProfile; name: string }) {
  const src = profile ? getProfileAssets(profile).avatar : "";
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word.slice(0, 1)).join("").toUpperCase();
  return <span className="staff-message-portrait relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground"><span aria-hidden="true">{initials || "?"}</span>{src && <CardImage key={src} src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" onError={event => { event.currentTarget.style.visibility = "hidden"; }}/>}</span>;
}
function appealMessageBody(body: string, moderator: boolean, collectorName: string) {
  const prefix = "You sent a leaderboard appeal:";
  return moderator && body.startsWith(prefix) ? `${collectorName} submitted a leaderboard appeal:${body.slice(prefix.length)}` : body;
}
function appealDecision(entry: Entry) {
  if (!entry.from_staff || (entry.kind !== "decision" && !entry.appeal_id)) return null;
  const prefix = entry.body.match(/^Leaderboard appeal (approved|declined|pending)\.[\r\n]*/i);
  const status = prefix?.[1].toLowerCase() ?? "pending";
  return { status, label: status === "approved" ? "Approved" : status === "declined" ? "Denied" : "Pending", comment: prefix ? entry.body.slice(prefix[0].length) : entry.body };
}
function AppealDecisionCard({ update }: { update: NonNullable<ReturnType<typeof appealDecision>> }) {
  const color = update.status === "approved" ? "border-emerald-500 text-emerald-700 dark:text-emerald-300" : update.status === "declined" ? "border-red-500 text-red-700 dark:text-red-300" : "border-amber-500 text-amber-800 dark:text-amber-300";
  return <section aria-label={`English leaderboard appeal: ${update.label}`} className={`my-2 border-l-[3px] pl-3 sm:pl-4 ${color}`}><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider"><Shield size={14} aria-hidden="true"/>English leaderboard appeal</div><p className="mt-3 text-sm leading-6 text-foreground">A staff member has made a decision regarding your appeal:</p><p className="mt-1 text-lg font-bold">{update.label}</p><div className="mt-3 border-t border-border pt-3 text-foreground"><h3 className="text-xs font-semibold">Staff comment(s):</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{update.comment}</p></div></section>;
}
function conversationTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const today = new Date();
  return date.toDateString() === today.toDateString() ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString([], { month: "short", day: "numeric" });
}
const conversationStyles = `
.staff-conversation-pane .staff-message-portrait{width:56px;height:56px;flex-shrink:0;display:flex}
.staff-conversation-pane .staff-developer-portrait{width:56px;height:56px;border-radius:50%}
.staff-developer-portrait>img{object-position:center;transform:none}
@media(max-width:767px){.staff-conversation-pane .staff-message-portrait{width:44px;height:44px}.staff-conversation-pane .staff-developer-portrait{width:44px;height:44px;border-radius:50%}}
.staff-system-card{border:1px solid hsl(var(--border));border-radius:14px;background:hsl(var(--muted)/.35);padding:12px 14px;color:hsl(var(--foreground));font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.staff-system-card>header{display:flex;align-items:center;gap:8px;margin-bottom:8px;color:hsl(var(--muted-foreground));font-size:11px;letter-spacing:.025em;font-weight:650}
.staff-system-card h3{font-size:14px;font-weight:650;margin-bottom:5px}.staff-system-card time{display:block;margin-top:8px;font-size:10px;color:hsl(var(--muted-foreground))}
.staff-system-offers{display:grid;gap:10px;margin-top:12px}.staff-system-offers>li{padding-top:10px;border-top:1px solid hsl(var(--border))}.staff-system-offers dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 10px;font-size:11px;margin-top:6px}.staff-system-offers dt{color:hsl(var(--muted-foreground))}.staff-system-offers dd{margin:0;overflow-wrap:anywhere}
.staff-info-dialog{display:flex!important;flex-direction:column!important;gap:0!important;width:calc(100vw - 24px)!important;max-width:680px!important;max-height:min(720px,calc(100dvh - 32px))!important;border-radius:18px!important;padding:0!important;overflow:hidden!important}
.staff-info-dialog>button{display:none}.staff-info-dialog>header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid hsl(var(--border));flex-shrink:0}.staff-info-dialog nav{display:flex;gap:4px;overflow-x:auto;padding:6px 12px;border-bottom:1px solid hsl(var(--border));flex-shrink:0}.staff-info-dialog nav button{min-height:40px;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:600;white-space:nowrap}.staff-info-dialog nav button[aria-pressed=true]{background:hsl(var(--primary)/.12);color:hsl(var(--primary))}.staff-info-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:12px 16px}.staff-info-dialog footer{display:flex;gap:8px;justify-content:flex-end;padding:10px 16px;border-top:1px solid hsl(var(--border));flex-shrink:0}.staff-info-dialog footer button{min-height:42px;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600}.staff-info-dialog select{width:100%;min-height:44px;margin-bottom:12px;border:1px solid hsl(var(--border));border-radius:10px;background:hsl(var(--background));color:hsl(var(--foreground));padding:8px;font-size:16px}.staff-info-dialog .staff-info-note{font-size:11px;color:hsl(var(--muted-foreground));margin-bottom:10px}.staff-info-dialog details{font-size:11px;padding:10px 0;color:hsl(var(--muted-foreground))}.staff-info-dialog details p{white-space:pre-wrap;padding-top:8px}
@media(max-width:639px){.staff-thread-heading{gap:6px!important}.staff-thread-heading>button{padding:6px 8px;font-size:10px}.staff-info-dialog{max-height:calc(100dvh - 24px)!important}.staff-info-content{padding:10px 12px}.staff-info-dialog>header{padding:10px 12px}.staff-info-dialog footer{padding:8px 12px}}
.staff-workspace[data-moderator=true]{height:100%;min-height:0;gap:18px;padding:8px 0 0;grid-template-columns:minmax(230px,300px) minmax(0,1fr);overflow:hidden}
.staff-workspace[data-moderator=true] .staff-conversation-directory{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-right:14px;scrollbar-width:thin}
.staff-workspace[data-moderator=true] .staff-thread-column{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}
.staff-workspace[data-moderator=true] .staff-conversation-pane{display:flex;flex:1;flex-direction:column;height:100%;min-height:0;overflow:hidden;animation:none}
.staff-workspace[data-moderator=true] .staff-thread-heading{flex-shrink:0;gap:10px;min-height:54px;padding:0 0 8px}
.staff-workspace[data-moderator=true] .staff-thread-heading>div{flex:1;min-width:0}
.staff-workspace[data-moderator=true] .staff-thread-heading>span{width:48px;height:48px;flex-shrink:0}.staff-workspace[data-moderator=true] .staff-directory-row>span:first-child{width:42px;height:42px;flex-shrink:0}
.staff-workspace[data-moderator=true] .staff-thread-heading h2{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.staff-workspace[data-moderator=true] .staff-thread-heading p{font-size:11px}
.staff-thread-actions{position:relative;flex-shrink:0;font-size:12px}
.staff-thread-actions>summary{display:flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 10px;border:1px solid hsl(var(--border));border-radius:10px;list-style:none;cursor:pointer}
.staff-thread-actions>summary::-webkit-details-marker{display:none}
.staff-thread-actions>summary:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px}
.staff-thread-action-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:30;width:min(280px,calc(100vw - 38px));max-height:min(350px,50dvh);overflow-y:auto;overscroll-behavior:contain;border:1px solid hsl(var(--border));border-radius:12px;background:hsl(var(--background));padding:8px 12px;box-shadow:0 10px 32px #0004}
.staff-thread-action-menu>div{padding:8px 0;gap:8px;font-size:12px}.staff-thread-action-menu button{font-size:12px}
.staff-workspace[data-moderator=true] .staff-message-scroll{flex:1;min-height:0;max-height:none;padding:12px 2px;scrollbar-width:thin}
.staff-workspace[data-moderator=true] .staff-message-scroll ol{gap:12px}
.staff-workspace[data-moderator=true] .staff-message-scroll li>div{max-width:92%;gap:8px}
.staff-workspace[data-moderator=true] .staff-message-scroll li p{font-size:13px;line-height:1.55}
.staff-workspace[data-moderator=true] .staff-message-composer{flex-shrink:0;padding-top:8px}
.staff-workspace[data-moderator=true] .staff-message-composer textarea{height:58px;min-height:46px;max-height:90px;resize:none;padding:9px 11px;font-size:16px}
.staff-workspace[data-moderator=true] .staff-message-composer>div{margin-top:5px}
.staff-workspace[data-moderator=true] .staff-message-composer button{min-height:38px;padding:7px 12px;font-size:12px}
.staff-workspace[data-moderator=true] .staff-collector-finder>label{font-size:13px}
.staff-workspace[data-moderator=true] .staff-collector-finder>div{margin-top:8px;min-height:42px;padding-left:10px;padding-right:6px}
.staff-workspace[data-moderator=true] .staff-collector-finder input{font-size:16px;padding:9px 0}
.staff-workspace[data-moderator=true] .staff-collector-results{max-height:220px;overflow-y:auto;overscroll-behavior:contain}
.staff-workspace[data-moderator=true] .staff-existing-conversations>nav{gap:12px;margin-bottom:10px}
.staff-workspace[data-moderator=true] .staff-existing-conversations>nav button{font-size:12px;gap:5px}
.staff-workspace[data-moderator=true] .staff-existing-conversations h2{font-size:13px}
.staff-workspace[data-moderator=true] .staff-directory-list{padding:3px;display:grid;gap:7px}
.staff-workspace[data-moderator=true] .staff-directory-list>li{margin-top:0}
.staff-workspace[data-moderator=true] .staff-directory-row{gap:9px;padding:10px;border-radius:10px}
.staff-workspace[data-moderator=true] .staff-directory-row:hover{transform:none}
.staff-workspace[data-moderator=true] .staff-directory-preview{-webkit-line-clamp:1;line-height:1.5;font-size:12px}
.staff-workspace[data-moderator=true] .staff-directory-preview+span{margin-top:5px;min-height:0}
.staff-workspace[data-moderator=true] .staff-directory-row .staff-directory-preview+span:empty{display:none}
@media(max-width:767px){.staff-workspace[data-moderator=true]{grid-template-columns:minmax(0,1fr);gap:0;padding-top:4px}.staff-workspace[data-moderator=true] .staff-conversation-directory{padding-right:0;border:0}.staff-workspace[data-moderator=true][data-open=true] .staff-conversation-directory{display:none}.staff-workspace[data-moderator=true][data-open=false] .staff-thread-column{display:none}.staff-workspace[data-moderator=true] .staff-back-to-list{flex-shrink:0;margin:0 0 4px;min-height:36px}.staff-workspace[data-moderator=true] .staff-message-scroll li>div{max-width:96%;gap:6px}.staff-workspace[data-moderator=true] .staff-message-composer textarea{height:48px}.staff-workspace[data-moderator=true] .staff-thread-heading{min-height:48px}}
.staff-directory-row{border:1px solid hsl(var(--border));border-left-width:3px;box-sizing:border-box;width:100%;min-width:0;max-width:100%;border-radius:12px;background:hsl(var(--background));transition:background-color .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease}
.staff-directory-list{list-style:none;margin:0;padding:4px;min-width:0;max-width:100%}.staff-directory-list>li{min-width:0;max-width:100%}.staff-directory-preview{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;overflow-wrap:anywhere}
.staff-directory-row:hover{border-color:hsl(var(--primary)/.4);background:hsl(var(--primary)/.045);transform:translateX(2px)}
.staff-directory-row[data-selected="true"]{border-color:hsl(var(--primary)/.4);border-left-color:hsl(var(--primary));background:hsl(var(--primary)/.09);box-shadow:0 2px 12px hsl(var(--primary)/.06)}
.staff-directory-row:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px}
.staff-directory-enter{animation:staffDirectoryEnter .22s ease both}
.staff-conversation-pane{animation:staffConversationEnter .2s ease both}
@keyframes staffDirectoryEnter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes staffConversationEnter{from{opacity:.55;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.staff-workspace[data-moderator=true] .staff-message-composer{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:8px}
.staff-workspace[data-moderator=true] .staff-message-composer textarea{height:48px;max-height:70px}
.staff-workspace[data-moderator=true] .staff-message-composer>div{margin:0;gap:0}
.staff-workspace[data-moderator=true] .staff-message-composer>div>span{display:none}
.staff-workspace[data-moderator=true] .staff-message-composer button{height:48px;min-height:44px}
@media(prefers-reduced-motion:reduce){.staff-directory-enter,.staff-conversation-pane{animation:none}.staff-directory-row{transition:none}.staff-directory-row:hover{transform:none}}
.staff-workspace .staff-conversation-pane .staff-message-scroll{padding:18px 6px 12px}
.staff-workspace .staff-conversation-pane .staff-chat-list{display:flex;flex-direction:column;gap:0;list-style:none;margin:0;padding:0}
.staff-workspace .staff-conversation-pane .staff-chat-day{margin:12px 0 20px;text-align:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground))}
.staff-workspace .staff-conversation-pane .staff-chat-item{margin:0;padding:3px 0}
.staff-workspace .staff-conversation-pane .staff-chat-item[data-group-start=true]{padding-top:15px}
.staff-workspace .staff-conversation-pane .staff-message-scroll .staff-chat-line{width:auto;max-width:min(82%,670px);gap:10px}
.staff-workspace .staff-conversation-pane .staff-chat-avatar{display:flex;align-items:flex-end;justify-content:center;flex:0 0 56px;width:56px;min-width:56px}
.staff-workspace .staff-conversation-pane .staff-chat-avatar[data-developer=true]{flex-basis:56px;width:56px;min-width:56px}
.staff-workspace .staff-conversation-pane .staff-chat-content{display:flex;flex-direction:column;gap:0}
.staff-workspace .staff-conversation-pane .staff-chat-author{margin:0 10px 5px;font-size:11px;font-weight:600;line-height:1.5;color:hsl(var(--muted-foreground));overflow-wrap:anywhere}
.staff-workspace .staff-conversation-pane .staff-chat-author img{width:13px;height:13px}
.staff-workspace .staff-conversation-pane .staff-chat-bubble{position:relative;width:fit-content;max-width:100%;border:0;border-radius:22px;padding:11px 16px;background:hsl(var(--muted));color:hsl(var(--foreground));box-shadow:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.staff-workspace .staff-conversation-pane [data-message-side=outgoing] .staff-chat-bubble{background:#087af5;color:#fff}
.staff-workspace .staff-conversation-pane [data-message-side=incoming] .staff-chat-bubble[data-group-end=true]{border-bottom-left-radius:7px}
.staff-workspace .staff-conversation-pane [data-message-side=outgoing] .staff-chat-bubble[data-group-end=true]{border-bottom-right-radius:7px}
.staff-workspace .staff-conversation-pane .staff-chat-bubble p{margin:0;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;text-align:left}
.staff-workspace .staff-conversation-pane .staff-chat-bubble[data-rich=true]{background:hsl(var(--muted)/.45);color:hsl(var(--foreground));border:1px solid hsl(var(--border));border-radius:18px}
.staff-workspace .staff-conversation-pane .staff-chat-time{display:block;margin:5px 10px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:10px;line-height:1.5;color:hsl(var(--muted-foreground))}
.staff-workspace .staff-conversation-pane .staff-imessage-composer{display:flex;align-items:flex-end;gap:6px;margin-top:10px;padding:4px;border:1px solid hsl(var(--border));border-radius:27px;background:hsl(var(--muted)/.2);flex-shrink:0}
.staff-workspace .staff-conversation-pane .staff-imessage-composer textarea{display:block;flex:1;min-width:0;width:100%;height:44px;min-height:44px;max-height:min(120px,22dvh);resize:none;border:0;border-radius:22px;padding:11px 14px;background:transparent;color:hsl(var(--foreground));font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:16px;line-height:22px;outline:none;box-shadow:none}
.staff-workspace .staff-conversation-pane .staff-imessage-composer:focus-within{border-color:#087af5;box-shadow:0 0 0 2px #087af51a}
.staff-workspace .staff-conversation-pane .staff-imessage-composer button{display:flex;align-items:center;justify-content:center;flex:0 0 38px;width:38px;height:38px;min-height:38px;margin:3px;padding:0;border:0;border-radius:50%;background:#087af5;color:white;transition:opacity .15s,transform .15s}
.staff-workspace .staff-conversation-pane .staff-imessage-composer button:disabled{opacity:.35;cursor:not-allowed}
.staff-workspace .staff-conversation-pane .staff-imessage-composer button:not(:disabled):active{transform:scale(.94)}
.staff-workspace .staff-conversation-pane .staff-imessage-composer button:focus-visible{outline:2px solid #087af5;outline-offset:3px}
@media(max-width:767px){.staff-workspace .staff-conversation-pane .staff-message-scroll{padding:12px 0}.staff-workspace .staff-conversation-pane .staff-message-scroll .staff-chat-line{max-width:96%;gap:7px}.staff-workspace .staff-conversation-pane .staff-chat-avatar{flex-basis:44px;width:44px;min-width:44px}.staff-workspace .staff-conversation-pane .staff-chat-avatar[data-developer=true]{flex-basis:44px;width:44px;min-width:44px}.staff-workspace .staff-conversation-pane .staff-chat-author{font-size:10px;margin-left:8px;margin-right:8px}.staff-workspace .staff-conversation-pane .staff-chat-bubble{padding:10px 13px;border-radius:20px}.staff-workspace .staff-conversation-pane .staff-chat-item[data-group-start=true]{padding-top:12px}}
@media(prefers-reduced-motion:reduce){.staff-workspace .staff-conversation-pane .staff-imessage-composer button{transition:none}}
`;
const api = supabase as unknown as { rpc: (name: string, args: { p_action: string; p_data: Record<string, unknown> }) => Promise<{ data: any; error: { message: string } | null }> };
const failure = (cause: unknown) => cause instanceof Error ? cause.message : "This request could not be completed. Please retry.";
async function staff(action: string, data: Record<string, unknown> = {}) {
  const result = await api.rpc("staff_communications", { p_action: action, p_data: data });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
async function conversationQueue(action: string, data: Record<string, unknown> = {}) {
  const result = await api.rpc("moderator_conversation_queue", { p_action: action, p_data: data });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
function messageNonce(): string {
  const source = globalThis.crypto;
  if (typeof source?.randomUUID === "function") return source.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof source?.getRandomValues === "function") source.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}
function changed() { window.dispatchEvent(new Event("staff-communications-changed")); window.dispatchEvent(new Event("header-inbox-update")); }
export function useStaffSummary() {
  const [summary, setSummary] = useState<Summary>({ userId: "", is_moderator: false, is_owner: false, moderation_unread: 0, conversation_unread: 0, unread: 0, error: "" });
  const [version, setVersion] = useState(0);
  const channelId = useId();
  useEffect(() => {
    let alive = true, request = 0, userId = "";
    let channel: ReturnType<typeof supabase.channel> | undefined;
    const load = async () => {
      const ticket = ++request;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive || ticket !== request) return;
        if (error) throw error;
        const id = data.session?.user.id ?? "";
        if (userId !== id) {
          userId = id;
          setSummary({ userId: id, is_moderator: false, is_owner: false, moderation_unread: 0, conversation_unread: 0, unread: 0, error: "" });
          if (channel) void supabase.removeChannel(channel);
          channel = id ? supabase.channel(`staff-notices-${channelId}-${id}`).on("postgres_changes", { event: "*", schema: "public", table: "staff_notifications", filter: `recipient_id=eq.${id}` }, () => { void load(); setVersion(value => value + 1); }).subscribe() : undefined;
        }
        if (!id) return;
        const result = await staff("summary");
        if (alive && ticket === request) setSummary({ userId: id, is_moderator: result.is_moderator === true, is_owner: result.is_owner === true, moderation_unread: Number(result.moderation_unread ?? 0), conversation_unread: Number(result.conversation_unread ?? 0), unread: Number(result.unread ?? 0), error: "" });
      } catch (cause) { if (alive && ticket === request) setSummary(previous => ({ ...previous, error: failure(cause) })); }
    };
    const refresh = () => { void load(); setVersion(value => value + 1); };
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || session?.user.id !== userId) { ++request; setSummary({ userId: "", is_moderator: false, is_owner: false, moderation_unread: 0, conversation_unread: 0, unread: 0, error: "" }); queueMicrotask(refresh); }
    });
    const timer = window.setInterval(visible, 30000);
    window.addEventListener("staff-communications-changed", refresh);
    document.addEventListener("visibilitychange", visible);
    void load();
    return () => { alive = false; ++request; subscription.unsubscribe(); window.clearInterval(timer); window.removeEventListener("staff-communications-changed", refresh); document.removeEventListener("visibilitychange", visible); if (channel) void supabase.removeChannel(channel); };
  }, [channelId]);
  return { ...summary, version };
}
export function useStaffResponses(userId: string, version: number) {
  const [rows, setRows] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { setRows([]); setError(""); }, [userId]);
  useEffect(() => {
    let active = true;
    setError("");
    if (userId) void (async () => {
      try {
        const result = await supabase.from("staff_notifications").select("id,title,url,thread_id,created_at,read_at").eq("recipient_id", userId).eq("staff_only", false).not("message_id", "is", null).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(50);
        if (result.error) throw new Error(result.error.message);
        if (active) setRows(result.data ?? []);
      } catch (cause) { if (active) setError(failure(cause)); }
    })();
    return () => { active = false; };
  }, [userId, version]);
  const markRead = async (id: string) => {
    try { await staff("read_notification", { id }); changed(); return true; }
    catch (cause) { setError(failure(cause)); return false; }
  };
  return { rows, error, markRead };
}
export function StaffNotifications(_props: { onOpenStaff?: () => void }) { return null; }
export function ModerationNotifications() { return null; }
const DEVELOPER_USER_ID = "17e57e39-bc0c-44e7-b373-ac34c6690185";
type DeveloperProfile = CollectorProfile & { avatar_frame?: string | null };
const developerProfileKey = ["staff-developer-profile", DEVELOPER_USER_ID] as const;
function useDeveloperProfile() {
  return useQuery({
    queryKey: developerProfileKey,
    queryFn: async (): Promise<DeveloperProfile> => {
      const { data, error } = await supabase.from("profiles").select("id,username,avatar_url,avatar_frame").eq("id", DEVELOPER_USER_ID).single();
      if (error) throw error;
      if (!data) throw new Error("Developer profile not found");
      return data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
function DeveloperPortrait() {
  const { data: profile } = useDeveloperProfile();
  return <span className="staff-message-portrait staff-developer-portrait relative block shrink-0 overflow-hidden rounded-full border border-border bg-muted"><img src="/kayou's-assets/mehehehe.webp" alt={profile?.username || "MLPEKAYOU Developer"} draggable={false} className="block h-full w-full max-w-none object-cover"/></span>;
}
function DeveloperName() {
  const { data: profile } = useDeveloperProfile();
  return <span className="inline-flex flex-wrap items-center gap-1.5"><span>MLPEKAYOU Developer{profile?.username ? ` · ${profile.username}` : ""}</span><img src="/website-assets/goldenverifiedbadge.webp" alt="Verified developer" className="h-4 w-4 shrink-0 object-contain" draggable={false}/></span>;
}
function StaffPortrait({ owner = false }: { owner?: boolean }) {
  return owner ? <DeveloperPortrait/> : <span className="staff-message-portrait flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"><Shield size={25}/></span>;
}
export function StaffName({ owner = false }: { owner?: boolean }) {
  return owner ? <DeveloperName/> : <span className="inline-flex flex-wrap items-center gap-1.5"><span>MLPEKAYOU Staff Member</span><img src="/website-assets/blueverifiedbadge.webp" alt="Verified staff" className="h-4 w-4 shrink-0 object-contain" draggable={false}/></span>;
}
type OfferItem = { set_id: string; card_key: string };
type SystemOffer = { id: string; sender: string; received_at: string | null; expired_at: string; recorded_at: string; cleared_at: string | null; target: OfferItem; offered: OfferItem[] };
type SystemResponse = { topic: "leaderboard" | "trading" | "frame"; title: string; body: string; status: string; frame_id?: string; owned?: number; required?: number; request_status?: string | null; recorded_at?: string | null; offers?: SystemOffer[] };
type CollectorSnapshot = { user_id: string; username: string; leaderboard: SystemResponse; trading: SystemResponse; frames: SystemResponse[]; staff_notes: { leaderboard: string | null; trading: string | null } };
const contextDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "Not recorded";
const frameName = (id?: string) => FRAME_CATALOG.find(frame => frame.id === id)?.name ?? "Avatar frame";
function offerItemName(item: OfferItem) {
  const cn = getChineseCard(String(item.set_id), item.card_key);
  if (cn) return `${chineseSets.find(set => set.id === cn.setId)?.name ?? "Chinese collection"} — ${getChineseCardLabel(cn)}`;
  const card = { set_id: item.set_id, card_key: item.card_key };
  const name = profileViewName(String(item.set_id));
  const label = profileViewCode(card);
  return [name, label && !/\.(webp|png|jpe?g)$|\//i.test(label) ? label : "Collection item"].filter(Boolean).join(" — ");
}
function SystemResponseCard({ response, createdAt }: { response: SystemResponse; createdAt?: string }) {
  return <article className="staff-system-card" aria-label="MLPEKAYOU System message"><header><Shield size={15} aria-hidden="true"/><span>MLPEKAYOU System</span></header><h3>{response.topic === "frame" ? frameName(response.frame_id) : response.title}</h3><p className="whitespace-pre-wrap">{response.body}</p>{response.offers && <><details className="mt-3"><summary className="min-h-10 cursor-pointer py-2 text-xs font-semibold">Unanswered-offer record · {response.offers.length} {response.offers.length === 1 ? "offer" : "offers"}</summary>{response.offers.length ? <ol className="staff-system-offers">{response.offers.map((offer, index) => <li key={offer.id}><p className="text-xs font-semibold">{index + 1}. Offer from {offer.sender}</p><dl><dt>Received</dt><dd>{contextDate(offer.received_at)}</dd><dt>Expired</dt><dd>{contextDate(offer.expired_at)}</dd><dt>Requested</dt><dd>{offerItemName(offer.target)}</dd><dt>Offered</dt><dd>{offer.offered.length ? <ul>{offer.offered.map((item, position) => <li key={position}>{offerItemName(item)}</li>)}</ul> : "Original offer details are no longer available."}</dd><dt>Strike</dt><dd>{offer.cleared_at ? `Cleared ${contextDate(offer.cleared_at)}` : `Uncleared · recorded ${contextDate(offer.recorded_at)}`}</dd></dl></li>)}</ol> : <p className="mt-2 text-xs text-muted-foreground">No unanswered-offer strikes are recorded.</p>}</details></>}{createdAt && <time dateTime={createdAt}>Account record at the time this response was sent · {contextDate(createdAt)}</time>}</article>;
}
async function collectorContext(action: "info" | "preview" | "send", data: Record<string, unknown>) {
  const { data: result, error } = await api.rpc("moderator_collector_context", { p_action: action, p_data: data });
  if (error) throw new Error(error.message);
  return result;
}
function CollectorInformation({ userId, open, onClose, onSent }: { userId: string; open: boolean; onClose: () => void; onSent: (threadId: string) => void }) {
  const [snapshot, setSnapshot] = useState<CollectorSnapshot | null>(null);
  const [topic, setTopic] = useState<SystemResponse["topic"]>("leaderboard");
  const [frameId, setFrameId] = useState("frame001");
  const [preview, setPreview] = useState<{ response: SystemResponse; digest: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const lock = useRef(false);
  const nonce = useRef<string | null>(null);
  const alive = useRef(true);
  const generation = useRef(0);
  const selection = `${userId}:${topic}:${frameId}`;
  const currentSelection = useRef(selection);
  currentSelection.current = selection;
  useEffect(() => { alive.current = true; return () => { alive.current = false; ++generation.current; }; }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setSnapshot(null); setPreview(null); setError(""); nonce.current = null;
    void collectorContext("info", { user_id: userId }).then(result => { if (active) { setSnapshot(result as CollectorSnapshot); setFrameId((result as CollectorSnapshot).frames.find(frame => frame.status === "revoked")?.frame_id ?? "frame001"); } }).catch(cause => { if (active) setError(failure(cause)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; ++generation.current; };
  }, [userId, revision]);
  const selectTopic = (value: SystemResponse["topic"]) => { if (lock.current) return; ++generation.current; setTopic(value); setPreview(null); setError(""); nonce.current = null; };
  const review = async () => {
    if (lock.current || !snapshot) return;
    lock.current = true; setBusy(true); setError("");
    const request = ++generation.current;
    const selected = selection;
    try {
      const result = await collectorContext("preview", { user_id: userId, topic, ...(topic === "frame" ? { frame_id: frameId } : {}) });
      if (alive.current && request === generation.current && selected === currentSelection.current) { nonce.current = messageNonce(); setPreview(result); }
    } catch (cause) { if (alive.current) setError(failure(cause)); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  const send = async () => {
    if (!preview || !nonce.current || lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const result = await collectorContext("send", { user_id: userId, topic, ...(topic === "frame" ? { frame_id: frameId } : {}), digest: preview.digest, nonce: nonce.current });
      if (alive.current) { onSent(result.thread_id); onClose(); }
    } catch (cause) { if (alive.current) setError(failure(cause)); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  const response = preview?.response ?? (topic === "leaderboard" ? snapshot?.leaderboard : topic === "trading" ? snapshot?.trading : snapshot?.frames.find(frame => frame.frame_id === frameId));
  const notes = topic === "leaderboard" ? snapshot?.staff_notes.leaderboard : topic === "trading" ? snapshot?.staff_notes.trading : null;
  return <Dialog open={open} onOpenChange={value => { if (!value && !lock.current) onClose(); }}><DialogContent className="staff-info-dialog z-[120020]"><header><div className="min-w-0"><DialogTitle className="truncate text-base font-semibold">{snapshot?.username ?? "Collector information"}</DialogTitle><DialogDescription className="mt-1 text-xs">{preview ? "Review the System message before sending." : "Account information · visible only to moderators"}</DialogDescription></div><button type="button" disabled={busy} onClick={onClose} aria-label="Close collector information" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border disabled:opacity-50"><X size={18}/></button></header><nav aria-label="Collector information sections">{([["leaderboard", "Leaderboard"], ["frame", "Frames"], ["trading", "Trading"]] as const).map(([id, label]) => <button key={id} type="button" disabled={busy} aria-pressed={topic === id} onClick={() => selectTopic(id)}>{label}</button>)}</nav><div className="staff-info-content">{loading ? <p role="status" className="py-5 text-sm">Loading account record...</p> : <>{topic === "frame" && snapshot && <><label className="sr-only" htmlFor={`collector-frame-${userId}`}>Choose a frame</label><select id={`collector-frame-${userId}`} value={frameId} disabled={busy} onChange={event => { ++generation.current; setFrameId(event.target.value); setPreview(null); nonce.current = null; setError(""); }}>{snapshot.frames.map(frame => <option key={frame.frame_id} value={frame.frame_id}>{frameName(frame.frame_id)} · {frame.status}</option>)}</select></>}{response && <><p className="staff-info-note">{preview ? "This is exactly what the collector will receive as a System message." : `Current status: ${response.status}${response.request_status ? ` · application ${response.request_status}` : ""}. Review the response to prepare it for the collector.`}</p><SystemResponseCard response={response}/></>}{!preview && notes && <details><summary className="cursor-pointer">Internal moderation note · never included in the System message</summary><p>{notes}</p></details>}</>}{error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}</div><footer><button type="button" disabled={busy} onClick={() => { setPreview(null); nonce.current = null; setRevision(value => value + 1); }} className="border border-border disabled:opacity-50">Refresh record</button>{preview ? <button type="button" disabled={busy} onClick={() => void send()} className="bg-primary text-primary-foreground disabled:opacity-50">{busy ? "Sending..." : "Send System response"}</button> : <button type="button" disabled={busy || loading || !response} onClick={() => void review()} className="bg-primary text-primary-foreground disabled:opacity-50">{busy ? "Preparing..." : "Review System response"}</button>}</footer></DialogContent></Dialog>;
}
function sameMessageGroup(previous: Entry | undefined, current: Entry | undefined) {
  if (!previous || !current || previous.system_context || current.system_context || previous.kind !== "message" || current.kind !== "message") return false;
  const gap = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime();
  return previous.from_staff === current.from_staff && (!current.from_staff || (previous.sender_role ?? "staff") === (current.sender_role ?? "staff")) && gap >= 0 && gap < 300000 && new Date(previous.created_at).toDateString() === new Date(current.created_at).toDateString();
}
function conversationDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  today.setDate(today.getDate() - 1);
  return date.toDateString() === today.toDateString() ? "Yesterday" : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", ...(date.getFullYear() !== today.getFullYear() ? { year: "numeric" as const } : {}) });
}
function StaffConversation({ userId, threadId, targetId, moderator, owner, version, onThread, onOpenAppeal, onResolved }: { userId: string; threadId?: string; targetId?: string; moderator: boolean; owner: boolean; version: number; onThread: (id: string) => void; onResolved?: () => void; onOpenAppeal?: (appealId: string) => void }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const collectorId = thread?.user_id ?? targetId ?? (!moderator ? userId : "");
  const collectorProfiles = useCollectorProfiles([collectorId]);
  const collectorProfile = collectorProfiles[collectorId];
  const collectorName = thread?.username ?? collectorProfile?.username ?? "Collector";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [greetings, setGreetings] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const [escalating, setEscalating] = useState(false);
  const [resolvedAt, setResolvedAt] = useState<string | null>(null);
  const [resolutionReady, setResolutionReady] = useState(false);
  const [resolving, setResolving] = useState(false);
  const resolutionLock = useRef(false);
  const escalationLock = useRef(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [olderLoading, setOlderLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const composerInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!draft && composerInput.current) composerInput.current.style.height = "44px"; }, [draft]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const lock = useRef(false);
  const alive = useRef(true);
  const request = useRef(0);
  const pending = useRef<{ body: string; nonce: string } | null>(null);
  const scrollArea = useRef<HTMLDivElement | null>(null);
  const follow = useRef(true);
  const state = useRef({ older: false });
  const context = threadId ? { thread_id: threadId } : targetId ? { user_id: targetId } : {};
  const key = `${threadId ?? ""}:${targetId ?? ""}`;
  useEffect(() => { alive.current = true; return () => { alive.current = false; ++request.current; }; }, []);
  useEffect(() => {
    let active = true;
    const ticket = ++request.current;
    void staff("thread", context).then(async result => {
      if (!active || ticket !== request.current) return;
      setThread(result.thread); setAppeals(result.appeals); setGreetings(result.greetings ?? []); setError(""); setLoading(false);
      setEntries(previous => state.current.older ? [...previous, ...result.messages.filter((entry: Entry) => !previous.some(item => item.id === entry.id))] : result.messages);
      if (!state.current.older) setHasMore(result.has_more);
      if (!moderator && result.greetings?.length && follow.current && document.visibilityState === "visible") { const receipt = await staff("read_greetings", { ids: result.greetings.map((greeting: { id: string }) => greeting.id) }); if (receipt.read > 0 && active) changed(); }
      if (moderator && result.thread) {
        const resolution = await conversationQueue("state", { thread_id: result.thread.id });
        if (!active || ticket !== request.current) return;
        setResolvedAt(resolution.resolved_at ?? null); setResolutionReady(true);
      }
      const last = result.messages[result.messages.length - 1]?.id;
      if (result.thread && last && follow.current && document.visibilityState === "visible") { const receipt = await staff("read_thread", { thread_id: result.thread.id, up_to: last, scope: moderator ? "moderation" : "personal" }); if (receipt.read > 0 && active) changed(); }
      if (moderator && owner && result.thread?.escalated_at && follow.current && document.visibilityState === "visible") {
        const notices = await (supabase as any).from("staff_notifications").select("id").eq("recipient_id", userId).eq("thread_id", result.thread.id).eq("staff_only", true).is("read_at", null).is("message_id", null).limit(100);
        if (notices.error) throw new Error(notices.error.message);
        if (active && notices.data?.length) { await Promise.all(notices.data.map((notice: { id: string }) => staff("read_notification", { id: notice.id }))); if (active) changed(); }
      }
      if (active) window.dispatchEvent(new Event("header-inbox-update"));
    }).catch(cause => { if (active) { setError(failure(cause)); setLoading(false); } });
    return () => { active = false; };
  }, [key, version, retry, userId]);
  useEffect(() => { if (follow.current && scrollArea.current) scrollArea.current.scrollTop = scrollArea.current.scrollHeight; }, [entries.length]);
  const older = async () => {
    if (!entries.length || olderLoading) return;
    const ticket = request.current;
    setOlderLoading(true);
    try {
      const result = await staff("thread", { ...context, before: entries[0].id });
      if (!alive.current || ticket !== request.current) return;
      follow.current = false; state.current.older = true;
      setEntries(previous => [...result.messages.filter((entry: Entry) => !previous.some(item => item.id === entry.id)), ...previous]); setHasMore(result.has_more);
    } catch (cause) { if (alive.current) setError(failure(cause)); }
    finally { if (alive.current) setOlderLoading(false); }
  };
  const send = async () => {
    const body = draft.trim();
    if (!body || lock.current || resolutionLock.current || body.length > 4000) return;
    lock.current = true; setSaving(true); setError("");
    if (pending.current?.body !== body) pending.current = { body, nonce: messageNonce() };
    try {
      const result = await staff("send", { ...context, ...pending.current });
      if (!alive.current) return;
      pending.current = null; setDraft(""); follow.current = true; setRetry(value => value + 1); onThread(result.thread_id); changed();
    } catch (cause) { if (alive.current) setError(failure(cause)); }
    finally { lock.current = false; if (alive.current) setSaving(false); }
  };
  const escalate = async (resolve = false) => {
    if (!thread || escalationLock.current) return;
    escalationLock.current = true; setEscalating(true); setError("");
    try { await staff(resolve ? "resolve_escalation" : "escalate", { thread_id: thread.id }); if (alive.current) { setRetry(value => value + 1); changed(); } }
    catch (cause) { if (alive.current) setError(failure(cause)); }
    finally { escalationLock.current = false; if (alive.current) setEscalating(false); }
  };
  const resolveConversation = async () => {
    if (!moderator || !thread || !resolutionReady || resolutionLock.current || saving || loading) return;
    resolutionLock.current = true; setResolving(true); setError("");
    try {
      const result = await conversationQueue("resolve", { thread_id: thread.id, expected_last_message_id: entries[entries.length - 1]?.id });
      if (alive.current) { setResolvedAt(result.resolved_at); changed(); onResolved?.(); }
    } catch (cause) { if (alive.current) { setError(failure(cause)); setRetry(value => value + 1); } }
    finally { resolutionLock.current = false; if (alive.current) setResolving(false); }
  };
  const timeline: Entry[] = [...entries, ...greetings.map(greeting => ({ ...greeting, id: `greeting-${greeting.id}`, from_staff: true, sender_role: "staff" as const, kind: "message" as const }))].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const latestStaff = [...timeline].reverse().find(entry => entry.from_staff && !entry.system_context);
  const headerOwner = !moderator && latestStaff?.sender_role === "owner";
  return <section className="staff-conversation-pane min-w-0" data-moderator={moderator} aria-label="Staff conversation"><header className="staff-thread-heading flex items-center gap-3 border-b border-current/10 pb-3">{moderator ? <CollectorPortrait profile={collectorProfile} name={collectorName}/> : <StaffPortrait owner={headerOwner}/>}<div className="min-w-0"><h2 className="break-words font-semibold">{moderator ? collectorName : <StaffName owner={headerOwner}/>}</h2><p className="mt-1 text-xs text-muted-foreground" title={moderator ? "Replies use the public staff identity. The responder is recorded in History." : undefined}>{moderator ? resolvedAt ? "Resolved conversation" : thread?.escalated_at ? "Escalated to Keegan" : "Pending conversation" : "You can message staff here at any time. This conversation stays saved."}</p></div>{moderator && collectorId && <button type="button" onClick={() => setInfoOpen(true)} className="ml-auto min-h-10 shrink-0 rounded-xl border border-border px-3 text-xs font-semibold hover:border-primary">Collector info</button>}{moderator && (thread || appeals.length > 0) && <details className="staff-thread-actions" onClick={event => { if ((event.target as Element).closest("button")) event.currentTarget.open = false; }}><summary aria-label="Conversation actions">Actions<ChevronDown size={14} aria-hidden="true"/></summary><div className="staff-thread-action-menu">
    {moderator && thread && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"><span className={`text-xs font-semibold ${resolvedAt ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{resolutionReady ? resolvedAt ? `Resolved ${new Date(resolvedAt).toLocaleString()}` : thread.escalated_at ? "Escalated conversation" : "Pending conversation" : "Loading conversation status..."}</span>{!resolvedAt && <button type="button" disabled={!resolutionReady || resolving || saving || loading} onClick={() => void resolveConversation()} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold transition-colors hover:border-primary disabled:opacity-50">{resolving ? "Resolving..." : "Mark as resolved"}</button>}</div>}
    {moderator && thread && resolutionReady && !resolvedAt && (thread.escalated_at || !owner) && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-current/10 py-2 text-sm">{thread.escalated_at ? <><span className="font-semibold text-primary">Escalated to Keegan</span></> : !owner && <button type="button" disabled={escalating} onClick={() => void escalate()} className="min-h-11 font-semibold underline underline-offset-4 disabled:opacity-50">{escalating ? "Escalating..." : "Escalate to Keegan"}</button>}</div>}
    {moderator && appeals.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 py-3 text-sm"><span>Leaderboard appeal: {appeals[0].status === "approved" ? "Approved" : appeals[0].status === "declined" ? "Denied" : "Pending"}</span><button type="button" onClick={() => onOpenAppeal?.((appeals.find(appeal => appeal.status === "pending") ?? appeals[0]).id)} className="min-h-11 font-semibold underline underline-offset-4">{appeals.some(appeal => appeal.status === "pending") ? "Review or complete appeal" : "View appeal decision"}</button></div>}
</div></details>}</header>
    <div ref={scrollArea} className="staff-message-scroll max-h-[52dvh] min-h-40 overflow-y-auto overscroll-contain py-4 sm:max-h-[60dvh]" onScroll={event => { const element = event.currentTarget; follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80; }}>
      {hasMore && <button type="button" disabled={olderLoading} onClick={() => void older()} className="mb-4 min-h-11 text-sm underline disabled:opacity-50">{olderLoading ? "Loading..." : "Load earlier messages"}</button>}
      {loading ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading conversation...</p> : !timeline.length ? <p className="py-6 text-sm text-muted-foreground">Send a message to start a conversation with staff.</p> : <ol className="staff-chat-list">{timeline.map((entry, index) => {
        const startsDay = index === 0 || new Date(timeline[index - 1].created_at).toDateString() !== new Date(entry.created_at).toDateString();
        const day = startsDay ? <li className="staff-chat-day"><time dateTime={entry.created_at}>{conversationDay(entry.created_at)}</time></li> : null;
        if (entry.system_context) return <Fragment key={entry.id}>{day}<li data-message-side="system" className="mx-auto my-3 w-full max-w-2xl"><SystemResponseCard response={entry.system_context} createdAt={entry.created_at}/></li></Fragment>;
        const outgoing = moderator ? entry.from_staff : !entry.from_staff;
        const decision = appealDecision(entry);
        const startsGroup = !sameMessageGroup(timeline[index - 1], entry);
        const endsGroup = !sameMessageGroup(entry, timeline[index + 1]);
        return <Fragment key={entry.id}>{day}<li data-message-side={outgoing ? "outgoing" : "incoming"} data-group-start={startsGroup} className={`staff-chat-item flex w-full ${outgoing ? "justify-end" : "justify-start"}`}>
          <div className={`staff-chat-line flex min-w-0 items-end ${outgoing ? "flex-row-reverse" : "flex-row"}`}>
            <span className="staff-chat-avatar" data-developer={entry.from_staff && entry.sender_role === "owner"}>{endsGroup ? entry.from_staff ? <StaffPortrait owner={entry.sender_role === "owner"}/> : <CollectorPortrait profile={collectorProfile} name={collectorName}/> : null}</span>
            <div className={`staff-chat-content min-w-0 ${outgoing ? "items-end" : "items-start"}`}>
              {startsGroup && <div className="staff-chat-author">{entry.from_staff ? <StaffName owner={entry.sender_role === "owner"}/> : collectorName}</div>}
              <div className="staff-chat-bubble" data-rich={!!decision} data-group-end={endsGroup} title={new Date(entry.created_at).toLocaleString()}>
                {decision ? <AppealDecisionCard update={decision}/> : <p>{entry.kind === "appeal" ? appealMessageBody(entry.body, moderator, collectorName) : entry.body}</p>}
              </div>
              {endsGroup && <time dateTime={entry.created_at} title={new Date(entry.created_at).toLocaleString()} className="staff-chat-time">{new Date(entry.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>}
            </div>
          </div>
        </li></Fragment>;
      })}</ol>}
    </div>
    {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-3 underline">Retry</button></p>}
    <form onSubmit={event => { event.preventDefault(); void send(); }} className="staff-message-composer staff-imessage-composer"><label className="sr-only" htmlFor={`staff-draft-${userId}`}>Message {moderator ? "collector" : "staff"}</label><textarea ref={composerInput} id={`staff-draft-${userId}`} value={draft} onChange={event => { setDraft(event.target.value); event.currentTarget.style.height = "auto"; event.currentTarget.style.height = `${Math.min(120, Math.max(44, event.currentTarget.scrollHeight))}px`; }} disabled={saving} maxLength={4000} rows={1} placeholder={moderator ? owner ? "Reply as MLPEKAYOU Developer..." : "Reply as MLPEKAYOU Staff Member..." : "Message staff..."}/><button type="submit" disabled={saving || resolving || !draft.trim() || loading} aria-label={saving ? "Sending message" : "Send message"} title="Send message"><ArrowUp size={22} aria-hidden="true"/><span className="sr-only">{saving ? "Sending..." : "Send message"}</span></button></form>
    {moderator && infoOpen && <CollectorInformation userId={collectorId} open={infoOpen} onClose={() => setInfoOpen(false)} onSent={id => { follow.current = true; setRetry(value => value + 1); onThread(id); changed(); }}/>}
  </section>;
}
export function StaffConversations({ moderator = false, search = "", refresh = 0, onOpenAppeal }: { moderator?: boolean; search?: string; refresh?: number; onOpenAppeal?: (appealId: string) => void }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const update = (event: Event) => {
      const profile = (event as CustomEvent<Partial<DeveloperProfile>>).detail;
      if (profile?.id === DEVELOPER_USER_ID) queryClient.setQueryData<DeveloperProfile>(developerProfileKey, previous => previous ? { ...previous, ...profile } : undefined);
    };
    window.addEventListener("profile-updated", update);
    return () => window.removeEventListener("profile-updated", update);
  }, [queryClient]);
  const summary = useStaffSummary();
  return !summary.userId ? null : moderator && !summary.is_moderator ? <p className="py-6 text-sm text-muted-foreground">{summary.error || "Checking moderator access..."}</p> : <ConversationWorkspace key={summary.userId} userId={summary.userId} moderator={moderator} owner={summary.is_owner} search={search} refresh={refresh + summary.version} onOpenAppeal={onOpenAppeal}/>;
}
function ConversationWorkspace({ userId, moderator, owner, search, refresh, onOpenAppeal }: { userId: string; moderator: boolean; owner: boolean; search: string; refresh: number; onOpenAppeal?: (appealId: string) => void }) {
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const workspace = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moderator) return;
    const root = workspace.current?.closest<HTMLElement>(".moderation-page");
    if (!root) return;
    const viewport = window.visualViewport;
    const update = () => { const height = viewport?.height ?? window.innerHeight; if (height > 0) root.style.setProperty("--moderation-viewport-height", `${height}px`); };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("pageshow", update);
    viewport?.addEventListener("resize", update);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("pageshow", update); viewport?.removeEventListener("resize", update); root.style.removeProperty("--moderation-viewport-height"); };
  }, [moderator]);
  const [status, setStatus] = useState<"pending" | "escalated" | "resolved">("pending");
  const [totals, setTotals] = useState({ pending: 0, escalated: 0, resolved: 0 });
  const [selected, setSelected] = useState(() => moderator ? new URLSearchParams(window.location.search).get("thread") ?? "" : "");
  const [target, setTarget] = useState(() => moderator ? new URLSearchParams(window.location.search).get("user") ?? "" : "");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [find, setFind] = useState("");
  const [people, setPeople] = useState<{ id: string; username: string; discord_username: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [findLoading, setFindLoading] = useState(false);
  const [findError, setFindError] = useState("");
  const collectorProfiles = useCollectorProfiles([...rows.map(row => row.user_id), ...people.map(person => person.id)]);
  const queueSearch = search.trim() || find.trim();
  useEffect(() => { setPage(0); setRows([]); }, [queueSearch, status]);
  useEffect(() => {
    let alive = true;
    if (!moderator) return;
    setLoading(true);
    const timer = window.setTimeout(() => { void conversationQueue("threads", { query: queueSearch, status, offset: page * 25 }).then(result => { if (alive) { if (page > 0 && page * 25 >= Number(result.total)) { setPage(Math.max(0, Math.ceil(Number(result.total) / 25) - 1)); return; } setRows(result.rows); setTotal(Number(result.total)); setTotals({ pending: Number(result.pending ?? 0), escalated: Number(result.escalated ?? 0), resolved: Number(result.resolved ?? 0) }); setError(""); } }).catch(cause => { if (alive) setError(failure(cause)); }).finally(() => { if (alive) setLoading(false); }); }, 200);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [moderator, queueSearch, status, page, refresh, retry]);
  useEffect(() => {
    let alive = true;
    setPeople([]); setFindError("");
    if (!moderator || find.trim().length < 2) { setFindLoading(false); return; }
    setFindLoading(true);
    const timer = window.setTimeout(() => { void staff("find_users", { query: find }).then(result => { if (alive) setPeople(result); }).catch(cause => { if (alive) setFindError(failure(cause)); }).finally(() => { if (alive) setFindLoading(false); }); }, 250);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [moderator, find]);
  const hasConversation = !moderator || !!selected || !!target;
  return <div ref={workspace} data-moderator={moderator} data-open={hasConversation} className={`staff-workspace grid min-w-0 gap-6 py-5 ${moderator ? "md:grid-cols-[minmax(200px,0.7fr)_minmax(0,1.5fr)]" : ""}`}>
    <style>{conversationStyles}</style>
    {moderator && <aside className="staff-conversation-directory min-w-0 md:border-r md:border-border md:pr-5">
      <section aria-label="Find a collector" className="staff-collector-finder border-b border-border pb-3">
        <label htmlFor={`staff-collector-search-${userId}`} className="block text-base font-semibold">Find or message a collector</label>
        <div className="mt-3 flex min-h-12 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"><Search size={17} className="shrink-0 text-muted-foreground"/><input id={`staff-collector-search-${userId}`} data-staff-search value={find} onChange={event => setFind(event.target.value)} placeholder="Name or Discord username" maxLength={200} className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"/>{find && <button type="button" aria-label="Clear collector search" onClick={() => setFind("")} className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"><X size={16}/></button>}</div>
        {find.trim().length >= 2 && <section aria-label="Collector search results" className="staff-collector-results mt-3 border-t border-border pt-3">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search results</h3>{!findLoading && !findError && <span className="text-xs text-muted-foreground">{people.length} found</span>}</div>
          {findLoading ? <p role="status" className="py-4 text-sm text-muted-foreground">Searching collectors...</p> : findError ? <p role="alert" className="py-3 text-sm text-red-500">{findError}</p> : !people.length ? <p className="py-4 text-sm text-muted-foreground">No collectors match this name.</p> : <ul className="staff-directory-list space-y-2">{people.map((person, index) => <li key={person.id} className="staff-directory-enter" style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}><button type="button" data-selected={target === person.id} onClick={() => { setTarget(person.id); setSelected(""); }} className="staff-directory-row flex w-full items-center gap-3 px-3 py-3 text-left"><CollectorPortrait profile={collectorProfiles[person.id]} name={person.username}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{person.username}</span>{person.discord_username && <span className="mt-1 block truncate text-xs text-muted-foreground">Discord: {person.discord_username}</span>}</span><span className="shrink-0 text-[11px] font-semibold text-primary">Message</span></button></li>)}</ul>}
        </section>}
      </section>
      <section aria-label="Existing conversations" className="staff-existing-conversations pt-3">
        <nav aria-label="Conversation status" className="mb-4 flex flex-wrap gap-x-4 border-b border-border">{(["pending", "escalated", "resolved"] as const).map(value => <button key={value} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); setSelected(""); setTarget(""); }} className={`flex min-h-11 items-center gap-2 border-b-2 py-2 text-sm font-semibold ${status === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{value === "pending" ? "Pending" : value === "escalated" ? "Escalated" : "Resolved"}<span className="text-xs font-normal tabular-nums text-muted-foreground">{totals[value]}</span></button>)}</nav>
        <div className="mb-1 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{status === "pending" ? "Pending conversations" : status === "escalated" ? "Escalated conversations" : "Resolved conversations"}</h2><span className="text-xs text-muted-foreground">{total}</span></div>
        {loading && <p role="status" className="mb-3 text-xs text-muted-foreground">Updating conversations...</p>}
        {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-2 underline">Retry</button></p>}
        <ul className="staff-directory-list space-y-3">{rows.map((row, index) => <li key={row.id} className="staff-directory-enter" style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}><button type="button" aria-pressed={(selected === row.id || target === row.user_id)} data-selected={(selected === row.id || target === row.user_id)} onClick={() => { setSelected(row.id); setTarget(""); }} className="staff-directory-row flex w-full items-start gap-3 px-3 py-3 text-left"><CollectorPortrait profile={collectorProfiles[row.user_id]} name={row.username}/><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="min-w-0 truncate text-sm font-semibold">{row.username}</span><time dateTime={row.updated_at} title={new Date(row.updated_at).toLocaleString()} className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">{conversationTime(row.updated_at)}</time></span><span className="staff-directory-preview mt-1 text-xs leading-5 text-muted-foreground">{appealMessageBody(row.preview || "Open conversation", true, row.username)}</span><span className="mt-2 flex min-h-4 flex-wrap items-center justify-between gap-2 text-[11px]">{row.escalated_at ? <span className="font-semibold text-primary">Escalated to Keegan</span> : null}{Number(row.unread) > 0 && <span aria-label={`${row.unread} unread messages`} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white">{Number(row.unread) > 99 ? "99+" : row.unread}</span>}</span></span></button></li>)}</ul>
        {!loading && !rows.length && !error && <p className="py-5 text-sm leading-6 text-muted-foreground">{status === "pending" ? "No pending conversations match. Unanswered appeals stay in English appeals until staff first replies." : status === "escalated" ? "No escalated conversations match." : "No resolved conversations match."}</p>}
        {total > 25 && <nav className="mt-4 flex items-center justify-between border-t border-border pt-2" aria-label="Conversation pages"><button type="button" aria-label="Previous page" disabled={!page} onClick={() => setPage(value => value - 1)} className="min-h-11 px-2 disabled:opacity-40"><ChevronLeft size={18}/></button><span className="text-xs">{page + 1} / {Math.ceil(total / 25)}</span><button type="button" aria-label="Next page" disabled={(page + 1) * 25 >= total} onClick={() => setPage(value => value + 1)} className="min-h-11 px-2 disabled:opacity-40"><ChevronRight size={18}/></button></nav>}
      </section>
    </aside>}
    <div className="staff-thread-column min-w-0">{moderator && hasConversation && <button type="button" onClick={() => { setSelected(""); setTarget(""); }} className="staff-back-to-list mb-2 flex min-h-10 items-center gap-2 text-sm md:hidden"><ArrowLeft size={16}/>Conversations</button>}{hasConversation ? <StaffConversation key={`${selected}:${target}`} userId={userId} moderator={moderator} owner={owner} threadId={selected || undefined} targetId={target || undefined} version={refresh} onThread={id => { if (moderator && !selected && !target) setSelected(id); setRetry(value => value + 1); }} onOpenAppeal={onOpenAppeal} onResolved={() => { setSelected(""); setTarget(""); setRetry(value => value + 1); }}/> : <p className="py-8 text-sm text-muted-foreground">Choose a conversation or find a collector to message.</p>}</div>
  </div>;
}
