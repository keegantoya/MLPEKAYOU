import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { englishViewName } from "@/lib/english-card-views";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
type Appeal = { id: string; user_id: string; message: string; response: string; status: "pending" | "approved" | "declined"; created_at: string; updated_at: string; reviewed_at: string | null; currently_excluded?: boolean; username?: string; discord_username?: string | null; exclusion_reason?: string | null };
const api = supabase as any;
const problem = (cause: unknown) => {
    const value = cause as { code?: string; message?: string } | null;
    return value?.code === "PGRST202" || value?.code === "42P01" ? "Run the English leaderboard appeals setup SQL, then retry." : value?.message || "This request could not be completed. Please retry.";
};
export function EnglishLeaderboardAppealForm({ restricted, onReinstated }: { restricted: boolean; onReinstated?: () => void }) {
    const [appeal, setAppeal] = useState<Appeal | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [retry, setRetry] = useState(0);
    const saveLock = useRef(false);
    const identity = useRef(0);
    const [account, setAccount] = useState(0);
    const activeUserId = useRef<string | null | undefined>(undefined);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const next = session?.user.id ?? null;
            if (activeUserId.current !== undefined && activeUserId.current !== next) { identity.current += 1; setAccount(value => value + 1); }
            activeUserId.current = next;
        });
        return () => { identity.current += 1; subscription.unsubscribe(); };
    }, []);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setAppeal(null);
        setMessage("");
        setError("");
        void (async () => {
            try {
                const { data, error: loadError } = await api.rpc("get_my_english_leaderboard_appeal");
                if (!active) return;
                if (loadError) throw loadError;
                setAppeal(data);
                setMessage(data?.status === "pending" ? data.message : "");
                if (data) setOpen(true);
                if (data?.currently_excluded === false) onReinstated?.();
            } catch (cause) { if (active) setError(problem(cause)); }
            finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [retry, account]);
    const submit = async () => {
        if (saveLock.current || message.trim().length < 3) return;
        saveLock.current = true;
        const request = identity.current;
        setBusy(true);
        setError("");
        try {
            const { data, error: saveError } = await api.rpc("submit_english_leaderboard_appeal", { p_message: message.trim() });
            if (request !== identity.current) return;
            if (saveError) throw saveError;
            setAppeal(data);
        } catch (cause) { if (request === identity.current) setError(problem(cause)); }
        finally { saveLock.current = false; setBusy(false); }
    };
    const canAppeal = appeal?.currently_excluded ?? restricted;
    if (!restricted && !appeal) return null;
    return <div className="mt-3 text-sm">
        <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="min-h-11 font-semibold underline underline-offset-4">{appeal ? "English leaderboard appeal and response" : "Appeal English leaderboard access"}</button>
        {open && <div className="mt-2 max-w-2xl border-t border-current/15 pt-3">
            {loading ? <p role="status">Loading appeal...</p> : <>
                {appeal && <><p className="font-semibold">Status: {appeal.status === "pending" ? "Waiting for review" : appeal.status === "approved" ? "Approved" : "Declined"}</p><p className="mt-2 whitespace-pre-wrap break-words">Your appeal: {appeal.message}</p>{appeal.response && <div className="mt-3 border-l-2 border-current/25 pl-3"><h3 className="font-semibold">Moderator response</h3><p className="mt-1 whitespace-pre-wrap break-words">{appeal.response}</p></div>}</>}
                {canAppeal && <><label className="mt-3 block font-semibold">Explain your English collection and regional association<textarea value={message} onChange={event => setMessage(event.target.value)} disabled={busy} maxLength={4000} rows={4} className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-base font-normal text-foreground" placeholder="Explain what happened and which English sets need correcting."/></label><p className="mt-2 text-xs leading-5">Moderators can reply here and, when approving, keep or clear English collection progress. Chinese cards are separate.</p><button type="button" disabled={busy || loading || message.trim().length < 3} onClick={() => void submit()} className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : appeal?.status === "pending" ? "Update appeal" : "Submit appeal"}</button></>}
                {appeal?.status === "approved" && <button type="button" onClick={onReinstated} className="mt-3 min-h-11 underline">Refresh account standing</button>}
            </>}
            {error && <p role="alert" className="mt-3 text-red-500">{error}</p>}
            <button type="button" disabled={busy || loading} onClick={() => setRetry(value => value + 1)} className="ml-3 mt-3 min-h-11 text-xs underline disabled:opacity-50">Refresh response</button>
        </div>}
    </div>;
}
export function EnglishLeaderboardAppealQueue({ search, refresh, onChanged }: { search: string; refresh: number; onChanged: () => void }) {
    const [rows, setRows] = useState<Appeal[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [loadedKey, setLoadedKey] = useState("");
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [selected, setSelected] = useState<Appeal | null>(null);
    const [ownedSets, setOwnedSets] = useState<string[]>([]);
    const [setsLoading, setSetsLoading] = useState(false);
    const [setsError, setSetsError] = useState("");
    const [response, setResponse] = useState("");
    const [decision, setDecision] = useState("reply");
    const [clearMode, setClearMode] = useState("none");
    const [setIds, setSetIds] = useState<string[]>([]);
    const [confirmed, setConfirmed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [notice, setNotice] = useState("");
    const lock = useRef(false);
    const key = `${search.trim()}:${status}:${page}`;
    useEffect(() => { setPage(0); }, [search, status]);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        const timer = window.setTimeout(() => {
            void (async () => {
                try {
                    const { data, error: loadError } = await api.rpc("moderator_english_appeals", { p_query: search.trim(), p_status: status, p_offset: page * 10 });
                    if (!active) return;
                    if (loadError) throw loadError;
                    const count = Number(data?.total ?? 0);
                    if (page > 0 && page * 10 >= count) { setPage(Math.max(0, Math.ceil(count / 10) - 1)); return; }
                    setRows(data?.rows ?? []);
                    setTotal(count);
                } catch (cause) { if (active) { setRows([]); setTotal(0); setError(problem(cause)); } }
                finally { if (active) { setLoadedKey(key); setLoading(false); } }
            })();
        }, 250);
        return () => { active = false; window.clearTimeout(timer); };
    }, [search, status, page, refresh, retry]);
    useEffect(() => {
        let active = true;
        setOwnedSets([]);
        setSetsError("");
        setSetIds([]);
        setConfirmed(false);
        if (!selected) return;
        setSetsLoading(true);
        void (async () => {
            try {
                const { data, error: loadError } = await api.rpc("moderator_owned_english_sets", { p_user_id: selected.user_id });
                if (!active) return;
                if (loadError) throw loadError;
                setOwnedSets(data ?? []);
            } catch (cause) { if (active) setSetsError(problem(cause)); }
            finally { if (active) setSetsLoading(false); }
        })();
        return () => { active = false; };
    }, [selected]);
    const review = async () => {
        const clearing = decision === "approve" && clearMode !== "none";
        if (!selected || lock.current || response.trim().length < 3 || clearing && (setsLoading || !!setsError || !confirmed || clearMode === "selected" && setIds.length === 0)) return;
        lock.current = true;
        setSaving(true);
        setSaveError("");
        try {
            const { error: reviewError } = await api.rpc("moderator_review_english_appeal", { p_appeal_id: selected.id, p_expected_updated_at: selected.updated_at, p_response: response.trim(), p_decision: decision, p_clear_mode: decision === "approve" ? clearMode : "none", p_set_ids: decision === "approve" && clearMode === "selected" ? setIds : [], p_expected_owned_sets: clearing ? ownedSets : [] });
            if (reviewError) throw reviewError;
            setSelected(null);
            setNotice(decision === "approve" ? "English leaderboard access reinstated. The response was saved." : "Your response was saved for the collector.");
            setRetry(value => value + 1);
            onChanged();
        } catch (cause) { setSaveError(problem(cause)); }
        finally { lock.current = false; setSaving(false); }
    };
    const clearing = decision === "approve" && clearMode !== "none";
    return <section className="py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">English leaderboard appeals. Chinese leaderboard eligibility is separate.</p><label className="text-sm">Show <select value={status} onChange={event => setStatus(event.target.value)} className="ml-2 min-h-11 rounded-xl border border-border bg-background px-3 text-base text-foreground"><option value="pending">Pending</option><option value="approved">Approved</option><option value="declined">Declined</option><option value="all">All appeals</option></select></label></div>
        {notice && <p role="status" className="mb-3 text-sm">{notice}</p>}
        {loading || loadedKey !== key ? <p role="status" className="py-8 text-sm text-muted-foreground">Loading English appeals...</p> : error ? <p role="alert" className="py-8 text-sm text-red-500">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-2 underline">Retry</button></p> : !rows.length ? <p className="py-8 text-sm text-muted-foreground">No appeals match this view.</p> : <ul className="divide-y divide-current/10">{rows.map(appeal => <li key={appeal.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{appeal.username}</h3>{appeal.discord_username && <p className="mt-1 break-all text-sm text-muted-foreground">Discord: {appeal.discord_username}</p>}<p className="mt-1 text-xs text-muted-foreground">{appeal.status} / {new Date(appeal.created_at).toLocaleString()}</p></div><button type="button" onClick={() => { setSelected(appeal); setResponse(appeal.response); setDecision("reply"); setClearMode("none"); setSaveError(""); }} className="min-h-11 rounded-xl border border-border px-4 text-sm">{appeal.status === "pending" ? "Review appeal" : "View response"}</button></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{appeal.message}</p>{appeal.response && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">Moderator: {appeal.response}</p>}</li>)}</ul>}
        {!loading && total > 10 && <nav aria-label="Appeal pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"><span className="text-xs text-muted-foreground">{total} appeals / Page {page + 1} of {Math.ceil(total / 10)}</span><div className="flex gap-2"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="min-h-11 rounded-xl border border-border px-3 text-sm disabled:opacity-40">Previous</button><button type="button" disabled={(page + 1) * 10 >= total} onClick={() => setPage(value => value + 1)} className="min-h-11 rounded-xl border border-border px-3 text-sm disabled:opacity-40">Next</button></div></nav>}
        <Dialog open={!!selected} onOpenChange={open => { if (!open && !lock.current) setSelected(null); }}><DialogContent className="z-[120020] max-h-[90dvh] max-w-2xl overflow-y-auto border-border bg-background text-foreground [&>button]:hidden" onEscapeKeyDown={event => { if (lock.current) event.preventDefault(); }} onPointerDownOutside={event => { if (lock.current) event.preventDefault(); }}><DialogTitle>English leaderboard appeal</DialogTitle><DialogDescription>{selected?.username}{selected?.discord_username ? ` / ${selected.discord_username}` : ""}</DialogDescription><p className="whitespace-pre-wrap break-words text-sm leading-6">{selected?.message}</p>{selected?.exclusion_reason && <p className="text-sm text-muted-foreground">English exclusion: {selected.exclusion_reason}</p>}
            {selected?.status === "pending" ? <><label className="text-sm font-semibold">Response to the collector<textarea value={response} onChange={event => setResponse(event.target.value)} maxLength={4000} rows={4} disabled={saving} className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-base font-normal"/></label><label className="text-sm">Decision<select value={decision} onChange={event => { setDecision(event.target.value); setClearMode("none"); setConfirmed(false); }} disabled={saving} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base"><option value="reply">Reply and keep pending</option><option value="approve">Approve and reinstate English access</option><option value="decline">Decline appeal</option></select></label>
                {decision === "approve" && <><label className="text-sm">English collection progress<select value={clearMode} onChange={event => { setClearMode(event.target.value); setConfirmed(false); }} disabled={saving || setsLoading || !!setsError} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base"><option value="none">Keep progress</option><option value="selected" disabled={!ownedSets.length}>Clear selected owned English sets</option><option value="all" disabled={!ownedSets.length}>Clear all owned English sets</option></select></label>{setsLoading ? <p role="status" className="text-sm">Loading owned English sets...</p> : setsError ? <p role="alert" className="text-sm text-red-500">{setsError}</p> : !ownedSets.length ? <p className="text-sm text-muted-foreground">This collector owns no English cards.</p> : clearMode !== "none" && <fieldset disabled={saving} className="max-h-48 space-y-1 overflow-y-auto border-y border-border py-2"><legend className="text-sm font-semibold">Owned English sets only</legend>{ownedSets.map(id => <label key={id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={clearMode === "all" || setIds.includes(id)} disabled={clearMode === "all"} onChange={event => { setSetIds(previous => event.target.checked ? [...previous,id] : previous.filter(item => item !== id)); setConfirmed(false); }} className="h-4 w-4"/>{englishViewName(id)}</label>)}</fieldset>}
                {clearing && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={saving} className="mt-1 h-4 w-4 shrink-0"/><span>I confirm clearing {clearMode === "all" ? "all owned English sets" : `${setIds.length} selected English sets`} and their trade/sale listings. This cannot be undone. Chinese progress, wishlists, and in-progress statuses stay saved. Clearing progress may revoke collection-based frames.</span></label>}</>}
                {saveError && <p role="alert" className="text-sm text-red-500">{saveError}</p>}
                <button type="button" disabled={saving || response.trim().length < 3 || clearing && (setsLoading || !!setsError || !confirmed || clearMode === "selected" && !setIds.length)} onClick={() => void review()} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving..." : clearing ? "Confirm clearing and approval" : "Save review"}</button>
            </> : selected?.response && <p className="whitespace-pre-wrap break-words text-sm leading-6">Moderator response: {selected.response}</p>}
            <button type="button" disabled={saving} onClick={() => setSelected(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm disabled:opacity-50">Close</button>
        </DialogContent></Dialog>
    </section>;
}
