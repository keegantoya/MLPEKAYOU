import { onAuthIdentityChange } from "@/lib/auth-identity";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
const db = supabase as unknown as SupabaseClient;
type ExistingStore = { id: string; name: string; code: string };
const reviewerId = "17e57e39-bc0c-44e7-b373-ac34c6690185";
type Props = { onClose?: () => void; isLightMode?: boolean };
type Tab = "pending" | "history";
type Application = {
  id: string; user_id: string; applicant_username?: string | null;
  store_name: string; street_address: string; city: string; region: string;
  postal_code: string; country: string; contact_name: string; contact_email: string;
  store_role: string; has_run_events: boolean; employee_usage: "yes" | "no" | "unsure";
  additional_information?: string | null; created_at: string;
  acknowledged: boolean; acknowledged_at: string; notice_version: string;
};
type History = {
  id: string; applicant_username: string | null; applicant_user_id: string;
  reviewer_username: string | null; reviewer_user_id: string;
  decision: "approved" | "rejected"; decided_at: string;
  approved_store_name: string | null; store_code: string | null;
  review_note: string | null; application_snapshot: Application;
};
type Decision = { application: Application; choice: "approved" | "rejected" };
const dateTime = (value: string) => new Date(value).toLocaleString();
export default function LGSApproveDeny({ onClose, isLightMode }: Props) {
const dialog = useRef<HTMLDialogElement>(null);
const alive = useRef(true);
const authorized = useRef(false);
const request = useRef(0);
const submitting = useRef(false);
const confirmation = useRef<HTMLDivElement>(null);
const [auth, setAuth] = useState<"loading" | "allowed" | "denied" | "error">("loading");
const [documentLight, setDocumentLight] = useState(() => document.documentElement.dataset.theme === "light");
const light = isLightMode ?? documentLight;
const [tab, setTab] = useState<Tab>("pending");
const [page, setPage] = useState(0);
const [total, setTotal] = useState(0);
const [applications, setApplications] = useState<Application[]>([]);
const [history, setHistory] = useState<History[]>([]);
const [loading, setLoading] = useState(false);
const [busy, setBusy] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [decision, setDecision] = useState<Decision | null>(null);
const [storeName, setStoreName] = useState("");
const [storeMode, setStoreMode] = useState<"new" | "existing">("new");
const [existingStoreId, setExistingStoreId] = useState("");
const [stores, setStores] = useState<ExistingStore[]>([]);
const [storesLoading, setStoresLoading] = useState(false);
const [storesError, setStoresError] = useState("");
const storesRequest = useRef(0);
const [note, setNote] = useState("");
const [decisionError, setDecisionError] = useState("");
const surface = light ? "bg-[#f6f4ee] text-zinc-900" : "bg-[#151718] text-white";
const muted = light ? "text-zinc-600" : "text-zinc-300";
const card = light ? "border-black/10 bg-white" : "border-white/10 bg-[#202324]";
const secondary = `rounded-xl border px-4 py-3 text-base font-semibold disabled:opacity-50 ${card}`;
const primary = "rounded-xl bg-[#E7C84B] px-4 py-3 text-base font-semibold text-[#111111] hover:bg-[#FFE477] disabled:opacity-50";
const input = `mt-2 w-full rounded-xl border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#b59525] ${card}`;
  useEffect(() => {
    alive.current = true;
const previousFocus = document.activeElement as HTMLElement | null;
const previousOverflow = document.body.style.overflow;
    if (dialog.current) { dialog.current.showModal(); document.body.style.overflow = "hidden"; }
const observer = new MutationObserver(() => setDocumentLight(document.documentElement.dataset.theme === "light"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
let authVersion = 0;
const applyUser = (id?: string) => {
      if (!alive.current) return;
      authorized.current = id === reviewerId;
      setAuth(authorized.current ? "allowed" : "denied");
      if (!authorized.current) {
        request.current++;
        setApplications([]); setHistory([]); setDecision(null); setMessage(""); setError("");
      }
    };
const { data: { subscription } } = onAuthIdentityChange((_event, session) => {
      authVersion++; applyUser(session?.user?.id);
    });
const initialVersion = authVersion;
    void supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!alive.current || authVersion !== initialVersion) return;
      if (authError) { setAuth("error"); return; }
      applyUser(data.session?.user?.id);
    }).catch(() => { if (alive.current && authVersion === initialVersion) setAuth("error"); });
    return () => {
      alive.current = false; authorized.current = false; request.current++;
      subscription.unsubscribe(); observer.disconnect();
      dialog.current?.close(); document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
const load = useCallback(async () => {
    if (!authorized.current) return;
const current = ++request.current;
    setLoading(true); setError("");
    try {
const { data, error: queryError } = await supabase.rpc("list_lgs_application_reviews", { p_tab: tab, p_page: page });
      if (!alive.current || !authorized.current || current !== request.current) return;
      if (queryError) throw queryError;
const result = data as { items: Application[] | History[]; total: number };
      if (page > 0 && result.items.length === 0) { setPage(page - 1); return; }
      setTotal(result.total);
      if (tab === "pending") setApplications(result.items as Application[]);
      else setHistory(result.items as History[]);
    } catch {
      if (alive.current && authorized.current && current === request.current) setError("Couldn’t load applications. Check your connection and try Refresh.");
    } finally {
      if (alive.current && current === request.current) setLoading(false);
    }
  }, [tab, page]);
  useEffect(() => { if (auth === "allowed") void load(); }, [auth, load]);
  useEffect(() => {
    if (decision) confirmation.current?.focus();
  }, [decision]);
const loadStores = useCallback(async () => {
    if (!authorized.current) return;
    const ticket = ++storesRequest.current;
    setStoresLoading(true); setStoresError(""); setStores([]); setExistingStoreId("");
    try {
      const { data, error: storeError } = await db.rpc("list_lgs_review_stores");
      if (!alive.current || !authorized.current || ticket !== storesRequest.current) return;
      if (storeError) throw storeError;
      setStores((data ?? []) as ExistingStore[]);
    } catch {
      if (alive.current && authorized.current && ticket === storesRequest.current) setStoresError("Couldn’t load stores. Try again.");
    } finally {
      if (alive.current && ticket === storesRequest.current) setStoresLoading(false);
    }
  }, []);
  useEffect(() => {
    if (auth !== "allowed") { ++storesRequest.current; setStores([]); setExistingStoreId(""); }
  }, [auth]);
function openDecision(application: Application, choice: Decision["choice"]) {
    setStoreMode("new"); setExistingStoreId("");
    if (choice === "approved") void loadStores();
    setStoreName(application.store_name); setNote(""); setDecisionError("");
    setDecision({ application, choice });
  }
async function saveDecision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || !authorized.current || submitting.current) return;
    if (decision.choice === "approved" && storeMode === "new" && !storeName.trim()) { setDecisionError("Enter the store’s approved name."); return; }
    if (decision.choice === "approved" && storeMode === "existing" && (storesLoading || storesError || !stores.some(store => store.id === existingStoreId))) {
      setDecisionError("Choose an existing store from the list before approving."); return;
    }
    submitting.current = true; setBusy(true); setDecisionError("");
    try {
const useExistingStore = decision.choice === "approved" && storeMode === "existing";
const { data, error: saveError } = useExistingStore
      ? await db.rpc("review_lgs_application_existing_store", {
          p_application_id: decision.application.id, p_store_id: existingStoreId, p_review_note: note.trim() || null,
        })
      : await supabase.rpc("review_lgs_application", {
        p_application_id: decision.application.id, p_decision: decision.choice,
        p_store_name: decision.choice === "approved" ? storeName.trim() : null,
        p_review_note: note.trim() || null,
      });
      if (!alive.current || !authorized.current) return;
      if (saveError) throw saveError;
const result = data as { outcome: string; message?: string; store_code?: string; store_name?: string };
      if (result.outcome !== "saved") { setDecisionError(result.message ?? "The application could not be updated. Refresh and try again."); return; }
      setMessage(decision.choice === "approved"
        ? useExistingStore
          ? `Application approved. The applicant was added to ${result.store_name ?? stores.find(store => store.id === existingStoreId)?.name} (${result.store_code}) as active staff. Their approval status and History were updated.`
          : `Application approved. ${storeName.trim()} (${result.store_code}) was created and the applicant was assigned as active staff.`
        : "Application denied. The decision was saved to History and the applicant’s status was updated.");
      setDecision(null);
      await load();
    } catch {
      if (alive.current && authorized.current) setDecisionError("We couldn’t confirm the decision. Cancel and refresh to check its status before trying again. A completed decision cannot be submitted twice.");
    } finally { submitting.current = false; if (alive.current) setBusy(false); }
  }
function details(application: Application, username?: string | null) {
const fields: [string, string][] = [
      ["Store name", application.store_name],
      ["Location", `${application.street_address}\n${application.city}, ${application.region} ${application.postal_code}\n${application.country}`],
      ["Representative", application.contact_name], ["Role at store", application.store_role],
      ["Contact email", application.contact_email],
      ["MLPEKAYOU username", username || application.applicant_username || "Username unavailable"],
      ["Applicant account", application.user_id],
      ["Previously hosted Kayou events", application.has_run_events ? "Yes" : "No"],
      ["Employees already tracking tournaments", application.employee_usage === "unsure" ? "I’m not sure" : application.employee_usage === "yes" ? "Yes" : "No"],
      ["Submitted", dateTime(application.created_at)],
      ["Privacy acknowledgment", `${application.acknowledged ? "Accepted" : "Not accepted"} · ${dateTime(application.acknowledged_at)} · Notice ${application.notice_version}`],
    ];
    return <>
      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className={`text-sm ${muted}`}>{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-base">{value}</dd></div>)}
      </dl>
      <div className="mt-5"><h4 className={`text-sm ${muted}`}>Additional information</h4><p className="mt-1 whitespace-pre-wrap break-words leading-7">{application.additional_information || "None provided."}</p></div>
    </>;
  }
const content = <div className="p-5 sm:p-7">
    <header className={`sticky top-0 z-20 flex items-start justify-between gap-4 py-3 ${surface}`}>
      <div><p className={`text-sm font-semibold ${light ? "text-[#765d12]" : "text-[#E7C84B]"}`}>LGS administration</p><h1 id="lgs-review-title" className="mt-1 text-2xl font-semibold">LGS Applications</h1></div>
      {onClose && <button type="button" disabled={busy} onClick={onClose} className={secondary}>Close</button>}
    </header>
    {auth === "loading" ? <p className="mt-6" role="status">Checking access…</p> : auth !== "allowed" ? <p className="mt-6" role="alert">{auth === "error" ? "Couldn’t verify your account. Close and reopen this screen to try again." : "You do not have access to this screen."}</p> : decision ? (
      <div ref={confirmation} tabIndex={-1} className="mt-6 focus:outline-none">
        <h2 className="text-xl font-semibold">{decision.choice === "approved" ? "Approve application" : "Deny application"}</h2>
        <p className={`mt-2 break-words leading-7 ${muted}`}>{decision.application.store_name} · {decision.application.applicant_username || decision.application.contact_name}</p>
        <form onSubmit={saveDecision} className="mt-5 space-y-5">
          <fieldset disabled={busy} className="space-y-5">
            <legend className="sr-only">Confirm review decision</legend>
            {decision.choice === "approved" ? <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Store assignment">
                <button type="button" aria-pressed={storeMode === "new"} onClick={() => { setStoreMode("new"); setDecisionError(""); }} className={storeMode === "new" ? primary : secondary}>Create a new store</button>
                <button type="button" aria-pressed={storeMode === "existing"} onClick={() => { setStoreMode("existing"); setDecisionError(""); }} className={storeMode === "existing" ? primary : secondary}>Choose an existing store</button>
              </div>
              {storeMode === "new" ? (
                <label className="block font-semibold">Approved store name<input name="approved_store_name" value={storeName} onChange={event => setStoreName(event.target.value)} required maxLength={150} className={input} /></label>
              ) : (
                <div>
                  <label className="block font-semibold">Existing store
                    <select name="existing_store_id" value={existingStoreId} onChange={event => { setExistingStoreId(event.target.value); setDecisionError(""); }} required disabled={storesLoading || !!storesError} className={input}>
                      <option value="">{storesLoading ? "Loading stores…" : "Select a store"}</option>
                      {stores.map(store => <option key={store.id} value={store.id}>{store.name} ({store.code})</option>)}
                    </select>
                  </label>
                  {storesError && <p role="alert" className={`mt-2 ${muted}`}>{storesError}</p>}
                  {!storesLoading && !storesError && stores.length === 0 && <p className={`mt-2 ${muted}`}>No stores exist yet. Choose “Create a new store” above.</p>}
                  <button type="button" disabled={storesLoading} onClick={() => void loadStores()} className={`${secondary} mt-3`}>Refresh stores</button>
                </div>
              )}
              <p className={`text-sm leading-6 ${muted}`}>{storeMode === "existing" ? "Adds the submitting account as active STAFF at the selected store. No new store is created." : "Creates the named store and makes the submitting account its active STAFF member. Its store code is assigned automatically."} The applicant’s status will show “Application approved!” and this decision will be recorded in History.</p>
            </> : <p className={`leading-7 ${muted}`}>The applicant will see that their application was denied because there was insufficient information or Kayou US could not locate matching event records. No store or staff record will be created.</p>}
            <label className="block font-semibold">History note <span className={`font-normal ${muted}`}>(Optional)</span><textarea value={note} onChange={event => setNote(event.target.value)} rows={4} maxLength={5000} className={`${input} resize-y`} /><span className={`mt-1 block text-sm font-normal ${muted}`}>Saved in your review history. This note is not shown to the applicant.</span></label>
            <p className={`text-sm leading-6 ${muted}`}>This decision is final in this screen and will be recorded with your account and the date and time.</p>
          </fieldset>
          {decisionError && <p role="alert" className={light ? "text-red-800" : "text-red-200"}>{decisionError}</p>}
          <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => setDecision(null)} className={secondary}>Cancel</button><button type="submit" disabled={busy || (decision.choice === "approved" && storeMode === "existing" && (storesLoading || !!storesError || !existingStoreId))} className={decision.choice === "approved" ? primary : "rounded-xl bg-red-700 px-4 py-3 text-base font-semibold text-white hover:bg-red-800 disabled:opacity-50"}>{busy ? "Saving decision…" : decision.choice === "approved" ? "Confirm approval" : "Confirm denial"}</button></div>
        </form>
      </div>
    ) : <>
      <nav className="mt-6 flex flex-wrap gap-3" aria-label="Application review views">
        {(["pending", "history"] as Tab[]).map(value => <button type="button" key={value} aria-pressed={tab === value} onClick={() => { if (tab !== value) { setApplications([]); setHistory([]); setTotal(0); setTab(value); setPage(0); setMessage(""); } }} className={tab === value ? primary : secondary}>{value === "pending" ? "Pending" : "History"}</button>)}
        <button type="button" disabled={loading} onClick={() => void load()} className={`${secondary} sm:ml-auto`}>Refresh</button>
      </nav>
      {message && <p role="status" className={`mt-5 rounded-xl border p-4 leading-7 ${card}`}>{message}</p>}
      {error ? <p role="alert" className={`mt-5 ${light ? "text-red-800" : "text-red-200"}`}>{error}</p> : loading ? <p role="status" className="mt-6">Loading {tab === "pending" ? "applications" : "history"}…</p> : <>
        <p className={`mt-5 text-sm ${muted}`}>{total} {tab === "pending" ? "pending application(s)" : "recorded decision(s)"}</p>
        {total === 0 && <p className="mt-4 leading-7">{tab === "pending" ? "No applications are waiting for review." : "Approval and denial decisions will appear here."}</p>}
        <div className="mt-4 space-y-4">
          {tab === "pending" ? applications.map(application => <article key={application.id} className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
            <h2 className="break-words text-xl font-semibold">{application.store_name}</h2>
            {details(application)}
            <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => openDecision(application, "approved")} className={primary}>Approve</button><button type="button" onClick={() => openDecision(application, "rejected")} className={secondary}>Deny</button></div>
          </article>) : history.map(entry => <article key={entry.id} className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
            <p className={`font-semibold ${entry.decision === "approved" ? light ? "text-green-800" : "text-green-300" : light ? "text-red-800" : "text-red-300"}`}>{entry.decision === "approved" ? "Approved" : "Denied"}</p>
            <h2 className="mt-1 break-words text-xl font-semibold">{entry.approved_store_name || entry.application_snapshot.store_name}</h2>
            <p className={`mt-2 break-words text-sm leading-6 ${muted}`}>{dateTime(entry.decided_at)} · Reviewed by {entry.reviewer_username || entry.reviewer_user_id}</p>
            {entry.store_code && <p className={`mt-1 text-sm ${muted}`}>Store code: {entry.store_code}</p>}
            {entry.review_note && <p className="mt-4 whitespace-pre-wrap break-words leading-7">{entry.review_note}</p>}
            <details className="mt-4"><summary className="cursor-pointer py-2 font-semibold">View submitted information</summary>{details(entry.application_snapshot, entry.applicant_username)}</details>
          </article>)}
        </div>
        {total > 25 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className={secondary}>Previous</button><span className={`text-sm ${muted}`}>Page {page + 1} of {Math.ceil(total / 25)}</span><button type="button" disabled={(page + 1) * 25 >= total} onClick={() => setPage(value => value + 1)} className={secondary}>Next</button></div>}
      </>}
    </>}
  </div>;
  return onClose ? createPortal(<dialog ref={dialog} aria-labelledby="lgs-review-title" onCancel={event => { event.preventDefault(); if (!submitting.current) onClose(); }} className={`m-auto max-h-[75dvh] sm:max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl p-0 shadow-2xl backdrop:bg-black/70 ${surface}`} style={{ colorScheme: light ? "light" : "dark" }}>{content}</dialog>, document.body) : <main className={`min-h-screen px-4 py-6 ${surface}`} style={{ colorScheme: light ? "light" : "dark" }}><div className="mx-auto max-w-3xl">{content}</div></main>;
}
