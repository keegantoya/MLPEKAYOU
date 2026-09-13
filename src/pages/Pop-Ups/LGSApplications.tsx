import React, { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Props = { onClose?: () => void; isLightMode?: boolean };
type Application = { store_name: string; status: "pending" | "approved" | "rejected"; created_at: string };
const noticeVersion = "2026-09-13-v2";

export default function LGSApplications({ onClose, isLightMode: suppliedTheme }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const statusHeading = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const activeUser = useRef<string | null>(null);
  const [documentLight, setDocumentLight] = useState(() => document.documentElement.dataset.theme === "light");
  const light = suppliedTheme ?? documentLight;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [application, setApplication] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const observer = new MutationObserver(() => setDocumentLight(document.documentElement.dataset.theme === "light"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onClose) return;
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    let mounted = true;
    let generation = 0;
    const load = async (nextUser: User | null) => {
      const current = ++generation;
      activeUser.current = nextUser?.id ?? null;
      setUser(nextUser);
      setApplication(null);
      setError("");
      setLoadFailed(false);
      setLoading(true);
      try {
        if (nextUser) {
          const { data, error: queryError } = await supabase.from("lgs_applications")
            .select("store_name,status,created_at").eq("user_id", nextUser.id).maybeSingle();
          if (queryError) throw queryError;
          if (mounted && generation === current) setApplication(data as Application | null);
        }
      } catch {
        if (mounted && generation === current) setLoadFailed(true);
      } finally {
        if (mounted && generation === current) setLoading(false);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) void load(session?.user ?? null);
    });
    const initialGeneration = generation;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted || generation !== initialGeneration) return;
      if (sessionError) { setLoadFailed(true); setLoading(false); return; }
      void load(data.session?.user ?? null);
    }).catch(() => { if (mounted) { setLoadFailed(true); setLoading(false); } });
    return () => { mounted = false; generation++; activeUser.current = null; subscription.unsubscribe(); };
  }, [retry]);

  useEffect(() => {
    if (!application) return;
    dialog.current?.scrollTo({ top: 0 });
    statusHeading.current?.focus({ preventScroll: Boolean(onClose) });
  }, [application, onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || inFlight.current || application || loadFailed) return;
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const requiredFields = ["store_name", "street_address", "city", "region", "postal_code", "country", "contact_name", "contact_email", "store_role"];
    if (requiredFields.some(name => !value(name))) { setError("Please complete every required field using more than spaces."); return; }
    const submittingUser = user.id;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const { data, error: submitError } = await supabase.rpc("submit_lgs_application", {
        p_store_name: value("store_name"), p_street_address: value("street_address"),
        p_city: value("city"), p_region: value("region"), p_postal_code: value("postal_code"),
        p_country: value("country"), p_contact_name: value("contact_name"),
        p_contact_email: value("contact_email"), p_store_role: value("store_role"),
        p_has_run_events: value("has_run_events") === "yes", p_employee_usage: value("employee_usage"),
        p_acknowledged: fields.get("acknowledged") === "on", p_notice_version: noticeVersion,
        p_additional_information: value("additional_information"),
      });
      if (activeUser.current !== submittingUser) return;
      if (submitError) throw submitError;
      const result = data as { outcome: string; application?: Application };
      if (result.application) setApplication(result.application);
      else setError("An application already exists for this store address. Please coordinate with your store’s representative or contact MLPEKAYOU for help.");
    } catch {
      if (activeUser.current === submittingUser) setError("We couldn’t confirm your submission. Please try again. Your account cannot submit a duplicate application.");
    } finally { inFlight.current = false; setBusy(false); }
  }

  const surface = light ? "bg-[#f6f4ee] text-zinc-900" : "bg-[#171717] text-white";
  const muted = light ? "text-zinc-600" : "text-zinc-300";
  const box = light ? "border-black/15 bg-white" : "border-white/15 bg-[#222222]";
  const input = `mt-2 w-full rounded-xl border px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#b59525] ${box}`;
  const content = (
    <div className="p-5 sm:p-7">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold ${light ? "text-[#765d12]" : "text-[#E7C84B]"}`}>Local game stores</p>
          <h1 id="lgs-application-title" className="mt-1 text-2xl font-semibold">LGS Hosting Organization Program</h1>
        </div>
        {onClose && <button type="button" onClick={onClose} aria-label="Close application" className={`shrink-0 rounded-xl border px-3 py-2 text-base ${box}`}>Close</button>}
      </header>
      {loading ? <p role="status">Loading your application…</p> : loadFailed ? (
        <div role="alert"><p>We couldn’t load your application information.</p><button type="button" onClick={() => setRetry(n => n + 1)} className="mt-3 rounded-xl bg-[#E7C84B] px-4 py-3 font-semibold text-black">Try again</button></div>
      ) : !user ? (
        <p className={`text-base leading-7 ${muted}`}>You must be logged in or have an account to apply for the LGS Hosting Organization Program.</p>
      ) : application ? (
        <section className={`rounded-2xl border p-5 ${box}`} role="status">
          <h2 ref={statusHeading} tabIndex={-1} className="text-xl font-semibold focus:outline-none">
            {application.status === "pending" ? "Your application is pending" : application.status === "approved" ? "Application approved!" : "Application denied"}
          </h2>
          <p className={`mt-3 break-words leading-7 ${muted}`}>{application.store_name} · Submitted {new Date(application.created_at).toLocaleDateString()}</p>
          <div className={`mt-4 space-y-4 leading-7 ${muted}`}>
            {application.status === "pending" ? (
              <>
                <p>We’ve received your application, and it is awaiting review. You can return here to check its status.</p>
                <p>If your application has been pending for more than fourteen days, or you have an upcoming event and would like to request expedited review, contact <a href="mailto:mlpekayou@gmail.com" className="break-words font-semibold underline underline-offset-4">mlpekayou@gmail.com</a>. Include your MLPEKAYOU username and all store information, along with your event date if applicable.</p>
                <p>Keegan will make an effort to follow up with Kayou on your behalf. Expedited communication, review, or approval cannot be guaranteed, including before your event date.</p>
              </>
            ) : application.status === "approved" ? (
              <p>If you use the LGS Program from your phone, you'll find the access point in your personal profile. If you are using it from your computer, you will find
                the access point in the top right of the header. Thank you for choosing MLPEKAYOU!
              </p>
            ) : (
              <>
                <p>There was insufficient information to approve your application, or Kayou US could not find matching records confirming that your store runs events on its behalf.</p>
                <p>If you believe this decision was made in error, please contact <a href="mailto:mlpekayou@gmail.com" className="break-words font-semibold underline underline-offset-4">mlpekayou@gmail.com</a> with as much relevant information as possible. Include your MLPEKAYOU username, complete store information, and any details that may help Kayou US locate your store’s event records.</p>
              </>
            )}
          </div>
        </section>
      ) : (
        <form key={user.id} onSubmit={submit}>
          <p className={`mb-6 leading-7 ${muted}`}>Apply on behalf of your store to use MLPEKAYOU’s tournament tracking tools. Choose one authorized representative to apply. Each account may submit one application, and each store location should be represented only once.</p>
          <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
            <legend className="sr-only">Store application</legend>
            <label className="block font-medium">Store name
              <span className={`mt-1 block text-sm font-normal ${muted}`}>The name to use for your store if your application is approved.</span>
              <input name="store_name" required maxLength={150} autoComplete="organization" className={input} />
            </label>
            <section aria-labelledby="lgs-location-heading">
              <h2 id="lgs-location-heading" className="text-lg font-semibold">Store location</h2>
              <p className={`mt-1 text-sm leading-6 ${muted}`}>Use your complete physical address, including a unit or suite number, so we can check whether your store already exists.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["street_address", "Street address and unit", "address-line1", 250],
                  ["city", "City", "address-level2", 100],
                  ["region", "State / province / region", "address-level1", 100],
                  ["postal_code", "ZIP / postal code", "postal-code", 30],
                  ["country", "Country", "country-name", 100],
                ].map(([name, label, autoComplete, maxLength]) => <label key={name} className={`block font-medium ${name === "street_address" ? "sm:col-span-2" : ""}`}>{label}<input name={String(name)} autoComplete={String(autoComplete)} maxLength={Number(maxLength)} required className={input} /></label>)}
              </div>
            </section>
            <section aria-labelledby="lgs-contact-heading">
              <h2 id="lgs-contact-heading" className="text-lg font-semibold">Store representative</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block font-medium">Your name<input name="contact_name" autoComplete="name" required maxLength={150} className={input} /></label>
                <label className="block font-medium">Your role at the store<input name="store_role" placeholder="Owner, manager, event organizer…" required maxLength={100} className={input} /></label>
                <label className="block font-medium sm:col-span-2">Contact email<input name="contact_email" type="email" autoComplete="email" defaultValue={user.email ?? ""} required maxLength={254} className={input} /></label>
              </div>
            </section>
            <fieldset><legend className="font-semibold">Has your store hosted Kayou events before?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">{[["yes", "We already run or have run events"], ["no", "We have never run an event"]].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${box}`}><input type="radio" name="has_run_events" value={value} required className="mt-1 h-5 w-5 shrink-0 accent-[#b59525]" /><span>{label}</span></label>)}</div>
            </fieldset>
            <fieldset aria-describedby="lgs-employee-help"><legend className="font-semibold">Do employees at your store already use MLPEKAYOU to track tournaments?</legend>
              <p id="lgs-employee-help" className={`mt-1 text-sm leading-6 ${muted}`}>This helps us determine whether your store already exists in our system. We cross-check several details to match the right store and avoid duplicate registrations. If you don’t know, select “I’m not sure.”</p>
              <div className="mt-3 flex flex-wrap gap-3">{[["yes", "Yes"], ["no", "No"], ["unsure", "I’m not sure"]].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${box}`}><input type="radio" name="employee_usage" value={value} required className="h-5 w-5 accent-[#b59525]" /><span>{label}</span></label>)}</div>
            </fieldset>
            <label className="block font-medium" htmlFor="lgs-additional-information">
              Anything else you’d like us to know? <span className={`text-sm font-normal ${muted}`}>(Optional)</span>
              <span id="lgs-additional-help" className={`mt-1 block text-sm font-normal leading-6 ${muted}`}>Share any helpful context, such as an upcoming event date, a different store name used with Kayou, or information that may help us find your store’s records. Please do not include passwords, payment details, or private player information.</span>
              <textarea id="lgs-additional-information" name="additional_information" rows={5} maxLength={5000} aria-describedby="lgs-additional-help" className={`${input} resize-y`} />
            </label>
            <section className={`rounded-2xl border p-5 ${box}`} aria-labelledby="lgs-privacy-heading">
              <h2 id="lgs-privacy-heading" className="text-lg font-semibold">Privacy, accountability &amp; program information</h2>
              <div className={`mt-3 space-y-3 text-sm leading-6 ${muted}`}>
                <p>MLPEKAYOU is independently owned and operated. It is a Kayou partner, but it is not owned, operated, or managed by Kayou or any Kayou branch or affiliate.</p>
                <p>The information in this application is used to review your store’s eligibility, identify duplicate store registrations, contact your representative, and arrange store access if approved. Only provide business information you are authorized to share. Your representative details help us confirm who is applying and who to contact; the optional information box can be left blank.</p>
                <p>MLPEKAYOU may share relevant application details with Kayou US to match your store with its records and verify event hosting information. This review is separate from tournament reporting and does not create an automatic connection to Kayou’s systems.</p>
                <p>Store event information is organized and retained separately for each store. Access is restricted to authorized employees assigned to that store and authorized Kayou representatives. Employees of other stores cannot view your store’s event information through the program.</p>
                <p>Event activity is accountable to individual staff accounts. From the time an event is created, edits are recorded with the acting account’s identifying information and the time of the change. Authorized Kayou representatives can review these records to see who made each change and when. Staff should use their own accounts and keep login details private.</p>
                <p>MLPEKAYOU is not connected to Kayou’s tournament submission system and does not automatically send completed tournament results or reports to Kayou. Your store remains responsible for submitting any required information through Kayou’s designated channels and meeting applicable event requirements.</p>
                <p>These tools provide an alternative workspace for tracking tournaments as they happen, including when staff experience reliability or usability issues with Kayou’s app. They do not replace Kayou’s official reporting requirements or constitute event approval by Kayou.</p>
                <p>Submitting this application does not guarantee acceptance or immediately grant hosting access. You can return to this application window to see whether your application is pending, approved, or denied. If it has been pending for more than fourteen days, or an upcoming event makes your request time-sensitive, email <a href="mailto:mlpekayou@gmail.com" className="break-words underline underline-offset-4">mlpekayou@gmail.com</a> with your MLPEKAYOU username and complete store information. Keegan will attempt to follow up with Kayou on your behalf, but expedited communication or approval cannot be guaranteed.</p>
              </div>
            </section>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input type="checkbox" name="acknowledged" required className="mt-1 h-5 w-5 shrink-0 accent-[#b59525]" /><span>I am authorized to apply on behalf of this store, confirm that the information is accurate, and have read and acknowledge the privacy, activity logging, and reporting information above.</span></label>
            {error && <p role="alert" className={`rounded-xl border p-4 text-sm leading-6 ${light ? "border-red-300 bg-red-50 text-red-800" : "border-red-500/40 bg-red-950/40 text-red-200"}`}>{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-[#E7C84B] px-5 py-3 text-base font-semibold text-[#111111] hover:bg-[#FFE477] disabled:cursor-wait">{busy ? "Submitting…" : "Submit application"}</button>
          </fieldset>
        </form>
      )}
    </div>
  );
  return onClose ? <dialog ref={dialog} aria-labelledby="lgs-application-title" onCancel={event => { event.preventDefault(); onClose(); }} className={`m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-2xl p-0 shadow-2xl backdrop:bg-black/70 ${surface}`} style={{ colorScheme: light ? "light" : "dark" }}>{content}</dialog> : <main className={`min-h-screen px-4 py-6 ${surface}`} style={{ colorScheme: light ? "light" : "dark" }}><div className="mx-auto max-w-2xl">{content}</div></main>;
}
