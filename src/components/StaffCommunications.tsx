import CardImage from "@/components/CardImage";
import { getProfileAssets } from "@/pages/Everypony/profile-assets";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Shield, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Summary = { userId: string; is_moderator: boolean; is_owner: boolean; moderation_unread: number; conversation_unread: number; unread: number; error: string };
type Notice = { id: string; title: string; url: string; thread_id: string | null; created_at: string; read_at: string | null };
type Entry = { id: string; from_staff: boolean; sender_role?: "staff" | "owner"; kind: "message" | "appeal" | "decision"; appeal_id?: string | null; body: string; created_at: string };
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
  return <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground"><span aria-hidden="true">{initials || "?"}</span>{src && <CardImage key={src} src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" onError={event => { event.currentTarget.style.visibility = "hidden"; }}/>}</span>;
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
.staff-directory-row{border:1px solid hsl(var(--border));border-left-width:3px;box-sizing:border-box;width:100%;min-width:0;max-width:100%;border-radius:12px;background:hsl(var(--background));transition:background-color .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease}
.staff-directory-list{list-style:none;margin:0;padding:4px;min-width:0;max-width:100%}.staff-directory-list>li{min-width:0;max-width:100%}.staff-directory-preview{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;overflow-wrap:anywhere}
.staff-directory-row:hover{border-color:hsl(var(--primary)/.4);background:hsl(var(--primary)/.045);transform:translateX(2px)}
.staff-directory-row[data-selected="true"]{border-color:hsl(var(--primary)/.4);border-left-color:hsl(var(--primary));background:hsl(var(--primary)/.09);box-shadow:0 2px 12px hsl(var(--primary)/.06)}
.staff-directory-row:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px}
.staff-directory-enter{animation:staffDirectoryEnter .22s ease both}
.staff-conversation-pane{animation:staffConversationEnter .2s ease both}
@keyframes staffDirectoryEnter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes staffConversationEnter{from{opacity:.55;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.staff-directory-enter,.staff-conversation-pane{animation:none}.staff-directory-row{transition:none}.staff-directory-row:hover{transform:none}}
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
function StaffPortrait({ owner = false }: { owner?: boolean }) {
  return <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">{owner ? <img src="/website-assets/OwnerBadge.webp" alt="" className="h-full w-full object-contain" draggable={false}/> : <Shield size={25}/>}</span>;
}
export function StaffName({ owner = false }: { owner?: boolean }) {
  return <span className="inline-flex flex-wrap items-center gap-1.5"><span>{owner ? "MLPEKAYOU Owner" : "MLPEKAYOU Staff Member"}</span>{!owner && <img src="/website-assets/blueverifiedbadge.webp" alt="Verified staff" className="h-4 w-4 shrink-0 object-contain" draggable={false}/>}</span>;
}
function StaffConversation({ userId, threadId, targetId, moderator, owner, version, onThread, onOpenAppeal, onResolved }: { userId: string; threadId?: string; targetId?: string; moderator: boolean; owner: boolean; version: number; onThread: (id: string) => void; onResolved?: () => void; onOpenAppeal?: (appealId: string) => void }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const collectorId = thread?.user_id ?? targetId ?? (!moderator ? userId : "");
  const collectorProfiles = useCollectorProfiles([collectorId]);
  const collectorProfile = collectorProfiles[collectorId];
  const collectorName = thread?.username ?? collectorProfile?.username ?? "Collector";
  const [entries, setEntries] = useState<Entry[]>([]);
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
    if (pending.current?.body !== body) pending.current = { body, nonce: crypto.randomUUID() };
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
  const latestStaff = [...timeline].reverse().find(entry => entry.from_staff);
  const headerOwner = !moderator && latestStaff?.sender_role === "owner";
  return <section className="staff-conversation-pane min-w-0" aria-label="Staff conversation"><header className="flex items-center gap-3 border-b border-current/10 pb-3">{moderator ? <CollectorPortrait profile={collectorProfile} name={collectorName}/> : <StaffPortrait owner={headerOwner}/>}<div className="min-w-0"><h2 className="break-words font-semibold">{moderator ? collectorName : <StaffName owner={headerOwner}/>}</h2><p className="mt-1 text-xs text-muted-foreground">{moderator ? owner ? "Replies appear as MLPEKAYOU Owner. The responder is recorded in History." : "Replies appear under the staff identity. The responder is recorded in History." : "You can message staff here at any time. This conversation stays saved."}</p></div></header>
    {moderator && thread && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"><span className={`text-xs font-semibold ${resolvedAt ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{resolutionReady ? resolvedAt ? `Resolved ${new Date(resolvedAt).toLocaleString()}` : thread.escalated_at ? "Escalated conversation" : "Pending conversation" : "Loading conversation status..."}</span>{!resolvedAt && <button type="button" disabled={!resolutionReady || resolving || saving || loading} onClick={() => void resolveConversation()} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold transition-colors hover:border-primary disabled:opacity-50">{resolving ? "Resolving..." : "Mark as resolved"}</button>}</div>}
    {moderator && thread && resolutionReady && !resolvedAt && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-current/10 py-2 text-sm">{thread.escalated_at ? <><span className="font-semibold text-primary">Escalated to Keegan</span></> : !owner && <button type="button" disabled={escalating} onClick={() => void escalate()} className="min-h-11 font-semibold underline underline-offset-4 disabled:opacity-50">{escalating ? "Escalating..." : "Escalate to Keegan"}</button>}</div>}
    {moderator && appeals.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 py-3 text-sm"><span>Leaderboard appeal: {appeals[0].status === "approved" ? "Approved" : appeals[0].status === "declined" ? "Denied" : "Pending"}</span><button type="button" onClick={() => onOpenAppeal?.((appeals.find(appeal => appeal.status === "pending") ?? appeals[0]).id)} className="min-h-11 font-semibold underline underline-offset-4">{appeals.some(appeal => appeal.status === "pending") ? "Review or complete appeal" : "View appeal decision"}</button></div>}
    <div ref={scrollArea} className="max-h-[52dvh] min-h-40 overflow-y-auto overscroll-contain py-4 sm:max-h-[60dvh]" onScroll={event => { const element = event.currentTarget; follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80; }}>
      {hasMore && <button type="button" disabled={olderLoading} onClick={() => void older()} className="mb-4 min-h-11 text-sm underline disabled:opacity-50">{olderLoading ? "Loading..." : "Load earlier messages"}</button>}
      {loading ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading conversation...</p> : !timeline.length ? <p className="py-6 text-sm text-muted-foreground">Send a message to start a conversation with staff.</p> : <ol className="space-y-4">{timeline.map(entry => {
        const outgoing = moderator ? entry.from_staff : !entry.from_staff;
        const decision = appealDecision(entry);
        return <li key={entry.id} data-message-side={outgoing ? "outgoing" : "incoming"} className={`flex w-full ${outgoing ? "justify-end" : "justify-start"}`}>
          <div className={`flex max-w-[92%] items-end gap-2 sm:max-w-[85%] sm:gap-3 ${outgoing ? "flex-row-reverse" : "flex-row"}`}>
            {entry.from_staff ? <StaffPortrait owner={entry.sender_role === "owner"}/> : <CollectorPortrait profile={collectorProfile} name={collectorName}/>}
            <div className={`min-w-0 rounded-2xl border px-3 py-2.5 sm:px-4 ${outgoing ? "rounded-br-sm border-primary/20 bg-primary/10" : "rounded-bl-sm border-border bg-muted/40"}`}>
              <div className={`mb-1 text-xs font-semibold ${outgoing ? "text-right" : "text-left"}`}>{entry.from_staff ? <StaffName owner={entry.sender_role === "owner"}/> : collectorName}</div>
              {decision ? <AppealDecisionCard update={decision}/> : <p className="whitespace-pre-wrap break-words text-left text-sm leading-6 [overflow-wrap:anywhere]">{entry.kind === "appeal" ? appealMessageBody(entry.body, moderator, collectorName) : entry.body}</p>}
              <time dateTime={entry.created_at} className={`mt-1.5 block text-[10px] text-muted-foreground ${outgoing ? "text-right" : "text-left"}`}>{new Date(entry.created_at).toLocaleString()}</time>
            </div>
          </div>
        </li>;
      })}</ol>}
    </div>
    {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-3 underline">Retry</button></p>}
    <form onSubmit={event => { event.preventDefault(); void send(); }} className="border-t border-current/10 pt-3"><label className="sr-only" htmlFor={`staff-draft-${userId}`}>Message {moderator ? "collector" : "staff"}</label><textarea id={`staff-draft-${userId}`} value={draft} onChange={event => setDraft(event.target.value)} disabled={saving} maxLength={4000} rows={3} placeholder={moderator ? owner ? "Reply as MLPEKAYOU Owner..." : "Reply as MLPEKAYOU Staff Member..." : "Message staff..."} className="w-full resize-y rounded-lg border border-border bg-background p-3 text-base text-foreground disabled:opacity-60"/><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{draft.length}/4000</span><button type="submit" disabled={saving || resolving || !draft.trim() || loading} className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Send size={16}/>{saving ? "Sending..." : "Send message"}</button></div></form>
  </section>;
}
export function StaffConversations({ moderator = false, search = "", refresh = 0, onOpenAppeal }: { moderator?: boolean; search?: string; refresh?: number; onOpenAppeal?: (appealId: string) => void }) {
  const summary = useStaffSummary();
  return !summary.userId ? null : moderator && !summary.is_moderator ? <p className="py-6 text-sm text-muted-foreground">{summary.error || "Checking moderator access..."}</p> : <ConversationWorkspace key={summary.userId} userId={summary.userId} moderator={moderator} owner={summary.is_owner} search={search} refresh={refresh + summary.version} onOpenAppeal={onOpenAppeal}/>;
}
function ConversationWorkspace({ userId, moderator, owner, search, refresh, onOpenAppeal }: { userId: string; moderator: boolean; owner: boolean; search: string; refresh: number; onOpenAppeal?: (appealId: string) => void }) {
  const [rows, setRows] = useState<ThreadRow[]>([]);
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
  useEffect(() => { setPage(0); setRows([]); }, [search, status]);
  useEffect(() => {
    let alive = true;
    if (!moderator) return;
    setLoading(true);
    const timer = window.setTimeout(() => { void conversationQueue("threads", { query: search, status, offset: page * 25 }).then(result => { if (alive) { if (page > 0 && page * 25 >= Number(result.total)) { setPage(Math.max(0, Math.ceil(Number(result.total) / 25) - 1)); return; } setRows(result.rows); setTotal(Number(result.total)); setTotals({ pending: Number(result.pending ?? 0), escalated: Number(result.escalated ?? 0), resolved: Number(result.resolved ?? 0) }); setError(""); } }).catch(cause => { if (alive) setError(failure(cause)); }).finally(() => { if (alive) setLoading(false); }); }, 200);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [moderator, search, status, page, refresh, retry]);
  useEffect(() => {
    let alive = true;
    setPeople([]); setFindError("");
    if (!moderator || find.trim().length < 2) { setFindLoading(false); return; }
    setFindLoading(true);
    const timer = window.setTimeout(() => { void staff("find_users", { query: find }).then(result => { if (alive) setPeople(result); }).catch(cause => { if (alive) setFindError(failure(cause)); }).finally(() => { if (alive) setFindLoading(false); }); }, 250);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [moderator, find]);
  const hasConversation = !moderator || !!selected || !!target;
  return <div className={`grid min-w-0 gap-6 py-5 ${moderator ? "md:grid-cols-[minmax(200px,0.7fr)_minmax(0,1.5fr)]" : ""}`}>
    <style>{conversationStyles}</style>
    {moderator && <aside className={`${hasConversation ? "hidden md:block" : ""} min-w-0 md:border-r md:border-border md:pr-5`}>
      <section aria-label="Find a collector" className="border-b-2 border-border pb-5">
        <label htmlFor={`staff-collector-search-${userId}`} className="block text-base font-semibold">Find a collector</label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Search a site or Discord username to start a conversation.</p>
        <div className="mt-3 flex min-h-12 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"><Search size={17} className="shrink-0 text-muted-foreground"/><input id={`staff-collector-search-${userId}`} value={find} onChange={event => setFind(event.target.value)} placeholder="Name or Discord username" maxLength={200} className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"/>{find && <button type="button" aria-label="Clear collector search" onClick={() => setFind("")} className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"><X size={16}/></button>}</div>
        {find.trim().length >= 2 && <section aria-label="Collector search results" className="mt-4 border-t border-border pt-3">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search results</h3>{!findLoading && !findError && <span className="text-xs text-muted-foreground">{people.length} found</span>}</div>
          {findLoading ? <p role="status" className="py-4 text-sm text-muted-foreground">Searching collectors...</p> : findError ? <p role="alert" className="py-3 text-sm text-red-500">{findError}</p> : !people.length ? <p className="py-4 text-sm text-muted-foreground">No collectors match this name.</p> : <ul className="staff-directory-list space-y-2">{people.map((person, index) => <li key={person.id} className="staff-directory-enter" style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}><button type="button" data-selected={target === person.id} onClick={() => { setTarget(person.id); setSelected(""); }} className="staff-directory-row flex w-full items-center gap-3 px-3 py-3 text-left"><CollectorPortrait profile={collectorProfiles[person.id]} name={person.username}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{person.username}</span>{person.discord_username && <span className="mt-1 block truncate text-xs text-muted-foreground">Discord: {person.discord_username}</span>}</span><span className="shrink-0 text-[11px] font-semibold text-primary">Message</span></button></li>)}</ul>}
        </section>}
      </section>
      <section aria-label="Existing conversations" className="pt-5">
        <nav aria-label="Conversation status" className="mb-4 flex flex-wrap gap-x-4 border-b border-border">{(["pending", "escalated", "resolved"] as const).map(value => <button key={value} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); setSelected(""); setTarget(""); }} className={`flex min-h-11 items-center gap-2 border-b-2 py-2 text-sm font-semibold ${status === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{value === "pending" ? "Pending" : value === "escalated" ? "Escalated" : "Resolved"}<span className="text-xs font-normal tabular-nums text-muted-foreground">{totals[value]}</span></button>)}</nav>
        <div className="mb-1 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{status === "pending" ? "Pending conversations" : status === "escalated" ? "Escalated conversations" : "Resolved conversations"}</h2><span className="text-xs text-muted-foreground">{total}</span></div>
        <p className="mb-4 text-xs text-muted-foreground">Select a collector to read and reply. A new collector message returns a resolved conversation to Pending. Escalation must be requested again.</p>
        {loading && <p role="status" className="mb-3 text-xs text-muted-foreground">Updating conversations...</p>}
        {error && <p role="alert" className="mb-3 text-sm text-red-500">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-2 underline">Retry</button></p>}
        <ul className="staff-directory-list space-y-3">{rows.map((row, index) => <li key={row.id} className="staff-directory-enter" style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}><button type="button" aria-pressed={(selected === row.id || target === row.user_id)} data-selected={(selected === row.id || target === row.user_id)} onClick={() => { setSelected(row.id); setTarget(""); }} className="staff-directory-row flex w-full items-start gap-3 px-3 py-3 text-left"><CollectorPortrait profile={collectorProfiles[row.user_id]} name={row.username}/><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="min-w-0 truncate text-sm font-semibold">{row.username}</span><time dateTime={row.updated_at} title={new Date(row.updated_at).toLocaleString()} className="shrink-0 pt-0.5 text-[10px] text-muted-foreground">{conversationTime(row.updated_at)}</time></span><span className="staff-directory-preview mt-1 text-xs leading-5 text-muted-foreground">{appealMessageBody(row.preview || "Open conversation", true, row.username)}</span><span className="mt-2 flex min-h-4 flex-wrap items-center justify-between gap-2 text-[11px]">{row.escalated_at ? <span className="font-semibold text-primary">Escalated to Keegan</span> : <span className="text-muted-foreground">{(selected === row.id || target === row.user_id) ? "Viewing conversation" : "View conversation"}</span>}{Number(row.unread) > 0 && <span aria-label={`${row.unread} unread messages`} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold leading-none text-white">{Number(row.unread) > 99 ? "99+" : row.unread}</span>}</span></span></button></li>)}</ul>
        {!loading && !rows.length && !error && <p className="py-5 text-sm leading-6 text-muted-foreground">{status === "pending" ? "No pending conversations match. Unanswered appeals stay in English appeals until staff first replies." : status === "escalated" ? "No escalated conversations match." : "No resolved conversations match."}</p>}
        {total > 25 && <nav className="mt-4 flex items-center justify-between border-t border-border pt-2" aria-label="Conversation pages"><button type="button" aria-label="Previous page" disabled={!page} onClick={() => setPage(value => value - 1)} className="min-h-11 px-2 disabled:opacity-40"><ChevronLeft size={18}/></button><span className="text-xs">{page + 1} / {Math.ceil(total / 25)}</span><button type="button" aria-label="Next page" disabled={(page + 1) * 25 >= total} onClick={() => setPage(value => value + 1)} className="min-h-11 px-2 disabled:opacity-40"><ChevronRight size={18}/></button></nav>}
      </section>
    </aside>}
    <div className="min-w-0">{moderator && hasConversation && <button type="button" onClick={() => { setSelected(""); setTarget(""); }} className="mb-4 flex min-h-11 items-center gap-2 text-sm md:hidden"><ArrowLeft size={16}/>Conversations</button>}{hasConversation ? <StaffConversation key={`${selected}:${target}`} userId={userId} moderator={moderator} owner={owner} threadId={selected || undefined} targetId={target || undefined} version={refresh} onThread={id => { if (moderator && !selected && !target) setSelected(id); setRetry(value => value + 1); }} onOpenAppeal={onOpenAppeal} onResolved={() => { setSelected(""); setTarget(""); setRetry(value => value + 1); }}/> : <p className="py-8 text-sm text-muted-foreground">Choose a conversation or find a collector to message.</p>}</div>
  </div>;
}
