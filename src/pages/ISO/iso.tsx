import { ISOMobileViewControl } from "@/components/iso/ISOShared";
import ISOFamily from "./iso-family";
import { getISOSets, getISOSetLabel, isISOSetHidden, fetchISOStatuses, parseISOStatusKey, normalizeEnglishSetId } from "./catalog-adapter";
import FullISO, { buildFullISOCards, type FullISOProgressRow, type FullISOStatusRow, } from "./full-iso";
import { getCompletedISOSetIds } from "./iso-visibility";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import ISOMOON from "./iso-moon";
import ISOFUN from "./iso-fun";
import ISORAINBOW from "./iso-rainbow";
import ISOSTAR from "./iso-star";
import ISOTCG from "./iso-tcg";
import ISOCONTROLS from "./iso-controls";
import ISOPROMOS from "./iso-promos";
import Wishlist from "./wishlist";
import { useWishlist } from "./wishlist-in-iso";
import InProgress from "./in-progress";
type Section = "full" | "wishlist" | "progress" | "moon" | "fun" | "rainbow" | "star" | "tcg" | "promos" | "merch";
const sections = [{ id: "full", label: "Full ISO", setIds: [] }, { id: "wishlist", label: "Wishlist", setIds: [] }, { id: "progress", label: "In Progress", setIds: [] }, ...([{ id: "moon", label: "Moon" }, { id: "fun", label: "Fun Moments" }, { id: "rainbow", label: "Rainbow" }, { id: "star", label: "Star" }, { id: "tcg", label: "TCG" }, { id: "promos", label: "Promos" }, { id: "merch", label: "Other" }] as const).map(section => ({ ...section, setIds: getISOSets(section.id).map(set => set.id) }))];
function EnglishISOContent({ onDeactivate, activationBusy, activationError }: { onDeactivate: () => void; activationBusy: boolean; activationError: string }) {
const [mobileColumns, setMobileColumns] = useState(4);
const [selectedSection, setSelectedSection] = useState<Section>("moon");
const [showControls, setShowControls] = useState(false);
const cardCodeSearch = "";
const [characterSearch, setCharacterSearch] = useState("");
const [searchAllCards, setSearchAllCards] = useState(false);
const [wishlistMode, setWishlistMode] = useState(false);
const [hiddenSets, setHiddenSets] = useState<string[]>([]);
const [completedSets, setCompletedSets] = useState<string[]>([]);
const [hasInProgress, setHasInProgress] = useState(false);
const [userId, setUserId] = useState<string | null>(null);
const [hideISO, setHideISO] = useState(false);
const { wishlist, toggleWishlist } = useWishlist();
const [fullISOProgress, setFullISOProgress] = useState<FullISOProgressRow[]>([]);
const [fullISOStatuses, setFullISOStatuses] = useState<FullISOStatusRow[]>([]);
const [fullISOLoaded, setFullISOLoaded] = useState(false);
const [fullISOError, setFullISOError] = useState("");
const fullISOCards = useMemo(() => buildFullISOCards(fullISOProgress, hiddenSets, fullISOStatuses), [fullISOProgress, hiddenSets, fullISOStatuses]);
const emptyISOSections = useMemo(() => {
        if (!fullISOLoaded)
            return new Set<string>();
const allSetIds = sections.flatMap((section) => [...section.setIds]);
        return new Set<string>(sections.filter((section) => {
const setIds: readonly string[] = section.setIds;
            if (setIds.length === 0)
                return false;
const excludedSets = [...hiddenSets, ...allSetIds.filter((setId) => !setIds.includes(setId))];
            return buildFullISOCards(fullISOProgress, excludedSets, fullISOStatuses).length === 0;
        }).map((section) => section.id));
    }, [fullISOLoaded, fullISOProgress, hiddenSets, fullISOStatuses]);
    useEffect(() => {
let disposed = false;
let requestId = 0;
let statusRevision = 0;
let activeUserId: string | null = null;
const activeStatuses = new Map<string, string>();
const load = async () => {
const request = ++requestId;
const revision = statusRevision;
const { data } = await supabase.auth.getSession();
            if (disposed || request !== requestId)
                return;
const user = data.session?.user;
            if (!user)
                return;
            activeUserId = user.id;
            setUserId(user.id);
const [{ data: profile }, { data: progress, error: progressError }, { data: isoStatus, error: statusError },] = await Promise.all([
                supabase.from("profiles").select("iso_hidden_sets, hide_iso").eq("id", user.id).single(),
                supabase.from("collection_progress_raw").select("set_id, progress").eq("user_id", user.id),
                fetchISOStatuses(user.id),
            ]);
            if (disposed || request !== requestId)
                return;
            if (progressError || statusError || !profile) {
                setFullISOError("Your ISO could not be loaded. Please refresh and try again.");
                return;
            }
            setFullISOError("");
const p = profile as any;
const hidden = (p?.iso_hidden_sets || []).map((id: unknown) => normalizeEnglishSetId(String(id)));
            if (!statusError && revision === statusRevision) {
                activeStatuses.clear();
                for (const row of isoStatus || []) {
                    if (parseISOStatusKey(String(row.card_key)) && (row.status === "purchase_in_progress" || row.status === "trade_in_progress")) {
                        activeStatuses.set(String(row.card_key), row.status);
                    }
                }
                setHasInProgress(activeStatuses.size > 0);
                setFullISOStatuses(Array.from(activeStatuses, ([card_key, status]) => ({ card_key, status })));
            }
            if (!progressError)
                setFullISOProgress(progress || []);
            if (!progressError && !statusError && profile)
                setFullISOLoaded(true);
            setHiddenSets(hidden);
            setCompletedSets(getCompletedISOSetIds(progress || []));
            setHideISO(p?.hide_iso ?? false);
        };
const refresh = () => {
            void load().catch(() => {
                if (!disposed)
                    setFullISOError("Your ISO could not be loaded. Please refresh and try again.");
            });
        };
const onStatusChange = (event: Event) => {
const detail = (event as CustomEvent<{
                userId: string;
                cardKey: string;
                status: string | null;
            }>).detail;
            if (!detail || detail.userId !== activeUserId || !parseISOStatusKey(detail.cardKey))
                return;
            statusRevision += 1;
            if (detail.status === "purchase_in_progress" || detail.status === "trade_in_progress") {
                activeStatuses.set(detail.cardKey, detail.status);
            }
            else {
                activeStatuses.delete(detail.cardKey);
            }
            setHasInProgress(activeStatuses.size > 0);
            setFullISOStatuses(Array.from(activeStatuses, ([card_key, status]) => ({ card_key, status })));
            void load().catch(() => {
                if (!disposed)
                    setFullISOError("Your ISO could not be loaded. Please refresh and try again.");
            });
        };
const onCollectionChange = (event: Event) => {
const detail = (event as CustomEvent<{
                userId: string;
                setId?: string;
                cardKey?: string;
            }>)
                .detail;
            if (detail?.userId !== activeUserId)
                return;
            if (detail.setId && detail.cardKey) {
const setId = detail.setId;
const cardKey = detail.cardKey;
                setFullISOProgress((previous) => [
                    ...previous,
                    { set_id: setId, progress: { [cardKey]: true } },
                ]);
            }
            refresh();
        };
        window.addEventListener("iso-status-changed", onStatusChange);
        window.addEventListener("iso-collection-changed", onCollectionChange);
        window.addEventListener("focus", refresh);
        void load().catch(() => {
            if (!disposed)
                setFullISOError("Your ISO could not be loaded. Please refresh and try again.");
        });
        return () => {
            disposed = true;
            requestId += 1;
            window.removeEventListener("iso-status-changed", onStatusChange);
            window.removeEventListener("iso-collection-changed", onCollectionChange);
            window.removeEventListener("focus", refresh);
        };
    }, []);
const toggleSet = async (setId: string) => {
        if (!userId)
            return;
const updated = hiddenSets.includes(setId)
            ? hiddenSets.filter((id) => id !== setId)
            : [...hiddenSets, setId];
        setHiddenSets(updated);
        await supabase
            .from("profiles")
            .update({
            iso_hidden_sets: updated,
        })
            .eq("id", userId);
    };
const toggleHideISO = async () => {
        if (!userId)
            return;
const next = !hideISO;
        setHideISO(next);
        await supabase
            .from("profiles")
            .update({
            hide_iso: next,
        })
            .eq("id", userId);
    };
const isWishlistView = wishlistMode || selectedSection === "wishlist";
const activeCharacterSearch = isWishlistView ? characterSearch : "";
const isSearching = activeCharacterSearch.trim() !== "";
const visibleHiddenSets = isWishlistView || isSearching
        ? []
        : Array.from(new Set([...hiddenSets, ...(!wishlistMode && !searchAllCards ? completedSets : [])]));
const visibleSections = sections.filter((section) => {
        if (section.id === "full")
            return fullISOLoaded && fullISOCards.length < 100;
        if (section.id === "wishlist") {
            return true;
        }
        if (section.id === "progress") {
            return true;
        }
        if (isWishlistView)
            return true;
        if (searchAllCards) {
            return section.setIds.some((setId) => !isISOSetHidden(setId, hiddenSets));
        }
        if (emptyISOSections.has(section.id))
            return false;
        return section.setIds.some((setId) => !isISOSetHidden(setId, hiddenSets) && !completedSets.includes(setId));
    });
    useEffect(() => {
        if (!visibleSections.some((section) => section.id === selectedSection)) {
            setSelectedSection((visibleSections.find((section) => section.id !== "wishlist")?.id ?? "wishlist") as Section);
        }
    }, [
        hiddenSets,
        completedSets,
        wishlistMode,
        searchAllCards,
        hasInProgress,
        selectedSection,
        fullISOLoaded,
        fullISOCards.length,
        emptyISOSections,
    ]);
const changeWishlistMode = (enabled: boolean) => {
        startTransition(() => {
            setWishlistMode(enabled);
            setCharacterSearch("");
            if (enabled) { setSearchAllCards(false); if(selectedSection === "full" || selectedSection === "progress") setSelectedSection("moon"); }
            if (!enabled && selectedSection === "wishlist") setSelectedSection("moon");
        });
    };
const changeSearchAllCards = (enabled: boolean) => {
        startTransition(() => {
            setSearchAllCards(enabled);
            if (enabled) {
                setWishlistMode(false);
                if (selectedSection === "wishlist") setSelectedSection("moon");
            }
        });
    };
const selectSection = (section: Section) => {
        setCharacterSearch("");
        if (section === "wishlist") { setWishlistMode(false); setSearchAllCards(false); } else if (selectedSection === "wishlist") { setWishlistMode(false); }
        setSelectedSection(section);
    };
const sectionContent = (<>
      {selectedSection === "full" && fullISOError && <p role="alert" className="py-8 text-sm text-red-600 dark:text-red-400">{fullISOError}</p>}
    {selectedSection === "full" && !fullISOError && (!userId || !fullISOLoaded) && <p role="status" className="py-8 text-sm text-muted-foreground">Loading English ISO...</p>}
        {selectedSection === "full" && !fullISOError && fullISOLoaded && userId && (<FullISO cards={fullISOCards} userId={userId} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}
      {selectedSection === "wishlist" && <Wishlist characterSearch={activeCharacterSearch}/>}
      {selectedSection === "progress" && <InProgress />}
      {selectedSection === "moon" && (<ISOMOON cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>)}
      {selectedSection === "fun" && (<ISOFUN cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets} wishlistMode={isWishlistView}/>)}
      {selectedSection === "rainbow" && (<ISORAINBOW cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>)}
      {selectedSection === "star" && (<ISOSTAR cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>)}
      {selectedSection === "tcg" && (<ISOTCG cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>)}
      {selectedSection === "promos" && (<ISOPROMOS cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>)}
      {selectedSection === "merch" && <ISOFamily family="merch" cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>}
    </>);
const allSearchContent = (<>
      {selectedSection === "progress" && <InProgress />}
      <ISOMOON cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
      <ISOFUN cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets} wishlistMode={isWishlistView}/>
      <ISORAINBOW cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
      <ISOSTAR cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
      <ISOTCG cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
      <ISOPROMOS cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
      <ISOFamily family="merch" cardCodeSearch={cardCodeSearch} characterSearch={activeCharacterSearch} wishlistMode={isWishlistView} searchAllCards={searchAllCards} hiddenSets={visibleHiddenSets}/>
    </>);
const navigation = <nav aria-label="English ISO sections" className="flex gap-1 overflow-x-auto border-b border-border pb-2">
    {visibleSections.map(item => <button key={item.id} type="button" aria-pressed={selectedSection === item.id} onClick={() => selectSection(item.id as Section)} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors motion-reduce:transition-none ${selectedSection === item.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span>{item.label}</span></button>)}
  </nav>;
    return (<div className="iso-page min-h-screen bg-background text-foreground" data-iso-columns={mobileColumns}>
      <div className="w-full max-w-none px-3 py-3 sm:px-5 md:px-6">
        <header className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 md:flex md:flex-wrap md:justify-between md:gap-x-3 md:gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4"><h1 className="text-xl font-semibold tracking-tight">English ISO</h1><Link to="/collections" className="hidden md:inline-flex min-h-9 items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft size={13}/>English checklists</Link></div>
          <div className="contents md:flex md:shrink-0 md:flex-wrap md:items-center md:justify-end md:gap-2"><button type="button" disabled={activationBusy} onClick={onDeactivate} className="min-h-10 rounded-xl px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">{activationBusy ? "Saving..." : "Deactivate English"}</button><ISOMobileViewControl columns={mobileColumns} onChange={setMobileColumns} /><button type="button" onClick={() => setShowControls(true)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-sm"><SlidersHorizontal size={16}/><span>Controls</span></button></div>
        </header>
        {activationError && <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">{activationError}</p>}
        <div className="mb-3">{navigation}</div>
        <div><main className="min-w-0">
          {isWishlistView && <div className="mb-3 flex items-center gap-3"><label className="flex min-h-10 w-full max-w-sm items-center gap-2 border-b border-border text-muted-foreground"><span className="sr-only">Search wishlist cards by character</span><input type="search" placeholder="Find a character..." value={characterSearch} onChange={event=>setCharacterSearch(event.target.value)} className="min-h-10 w-full min-w-0 bg-transparent px-1 text-base outline-none focus:ring-0"/></label>{characterSearch&&<button type="button" onClick={()=>setCharacterSearch("")} className="min-h-10 px-2 text-xs text-muted-foreground">Clear</button>}</div>}
            {selectedSection === "wishlist"
            ? sectionContent
            : isSearching
                ? allSearchContent
                : sectionContent}
          </main>
        </div>
      </div>
      {showControls && (<ISOCONTROLS cardCodeSearch={cardCodeSearch} onCardCodeSearchChange={() => {}} characterSearch={activeCharacterSearch} onCharacterSearchChange={setCharacterSearch} searchAllCards={searchAllCards} onSearchAllCardsChange={changeSearchAllCards} wishlistMode={isWishlistView} onWishlistModeChange={changeWishlistMode} availableSets={(["moon", "fun", "rainbow", "star", "tcg", "promos", "merch"] as const).map(family => ({ id: family, name: family === "merch" ? "Other" : family === "tcg" ? "TCG" : family === "fun" ? "Fun Moments" : family.charAt(0).toUpperCase() + family.slice(1), children: getISOSets(family).map(set => ({ id: set.id, name: getISOSetLabel(set.id) })) }))} hiddenSetIds={hiddenSets} onHideSet={toggleSet} hideISO={hideISO} onToggleHideISO={toggleHideISO} onClose={() => setShowControls(false)}/>)}
    </div>);
}
type EnglishActivation = { english_cards_enabled: boolean; english_cards_prompt_seen: boolean };
const activationColumns = "english_cards_enabled, english_cards_prompt_seen";
function activationErrorMessage(cause: unknown): string {
const error = cause as { code?: string; message?: string } | null;
    return error && ["42703", "PGRST204"].includes(error.code ?? "") ? "Run the English activation setup SQL first, then retry." : "Your English card setting could not be saved or loaded. Please retry.";
}
export default function ISO() {
const [account, setAccount] = useState<{ ready: boolean; id: string | null }>({ ready: false, id: null });
const [activation, setActivation] = useState<(EnglishActivation & { owner: string }) | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [reload, setReload] = useState(0);
const request = useRef(0);
const savingRequest = useRef<number | null>(null);
    useEffect(() => {
let disposed = false;
let authRevision = 0;
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            authRevision += 1;
            if (!disposed) setAccount(current => current.ready && current.id === (session?.user.id ?? null) ? current : { ready: true, id: session?.user.id ?? null });
        });
const revision = authRevision;
        void supabase.auth.getSession().then(({ data, error: sessionError }) => {
            if (disposed || revision !== authRevision) return;
            if (sessionError) { setError("Your account could not be loaded. Please sign in again."); setLoading(false); return; }
            setAccount({ ready: true, id: data.session?.user.id ?? null });
        }).catch(() => { if (!disposed && revision === authRevision) { setError("Your account could not be loaded. Please sign in again."); setLoading(false); } });
        return () => { disposed = true; subscription.unsubscribe(); };
    }, []);
    useEffect(() => {
const currentRequest = ++request.current;
        savingRequest.current = null;
        setSaving(false);
        setActivation(null);
        if (!account.ready) return;
        setError("");
        if (!account.id) { setLoading(false); return; }
        setLoading(true);
        void (async () => {
            try {
const { data, error: loadError } = await supabase.from("profiles").select(activationColumns).eq("id", account.id).single();
                if (currentRequest !== request.current) return;
                if (loadError) throw loadError;
                if (!data) throw new Error("Profile not found");
                setActivation({ owner: account.id!, english_cards_enabled: data.english_cards_enabled !== false, english_cards_prompt_seen: data.english_cards_prompt_seen === true });
            } catch (cause) {
                if (currentRequest === request.current) setError(activationErrorMessage(cause));
            } finally {
                if (currentRequest === request.current) setLoading(false);
            }
        })();
        return () => { request.current += 1; };
    }, [account.ready, account.id, reload]);
const saveActivation = async (enabled: boolean) => {
        if (!account.id || !activation || activation.owner !== account.id || savingRequest.current !== null) return;
const currentRequest = request.current;
        savingRequest.current = currentRequest;
        setSaving(true);
        setError("");
        try {
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (currentRequest !== request.current) return;
            if (sessionError || sessionData.session?.user.id !== account.id) throw new Error("Your account changed. Please retry.");
const { data, error: saveError } = await supabase.from("profiles").update({ english_cards_enabled: enabled, english_cards_prompt_seen: true }).eq("id", account.id).select(activationColumns).single();
            if (currentRequest !== request.current) return;
            if (saveError) throw saveError;
            if (!data || data.english_cards_enabled !== enabled || data.english_cards_prompt_seen !== true) throw new Error("Your setting was not saved");
            setActivation({ owner: account.id, english_cards_enabled: data.english_cards_enabled, english_cards_prompt_seen: true });
            window.dispatchEvent(new CustomEvent("english-card-settings-changed", { detail: { userId: account.id, enabled } }));
        } catch (cause) {
            if (currentRequest === request.current) setError(activationErrorMessage(cause));
        } finally {
            if (savingRequest.current === currentRequest) { savingRequest.current = null; setSaving(false); }
        }
    };
const current = activation?.owner === account.id ? activation : null;
    if (loading || !account.ready && !error || account.id && !current && !error) return <main className="w-full px-4 py-6 text-foreground"><p role="status" className="text-sm text-muted-foreground">Loading English ISO...</p></main>;
    if (current?.english_cards_enabled && current.english_cards_prompt_seen) return <EnglishISOContent key={current.owner} onDeactivate={() => void saveActivation(false)} activationBusy={saving} activationError={error}/>;
    return <main className="mx-auto w-full max-w-2xl px-4 py-6 text-foreground sm:px-6 sm:py-10">
        <Link to="/collections" className="hidden md:inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>English checklists</Link>
        {!current ? <section className="mt-5 border-t border-border pt-6"><h1 className="text-2xl font-semibold">English ISO</h1>{error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}{account.id ? <button type="button" onClick={() => setReload(value => value + 1)} className="mt-4 min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Retry</button> : <p className="mt-3 text-sm text-muted-foreground">Sign in to manage your English ISO.</p>}</section> : <section className="mt-5 border-t border-border pt-6">
            <h1 className="text-2xl font-semibold tracking-tight">{current.english_cards_enabled ? "Do you collect English cards?" : "English cards are deactivated"}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{current.english_cards_enabled ? "You can keep your English ISO, wishlist, and cards in progress, or deactivate them if you only collect Chinese cards." : "Activate your English ISO, wishlist, and cards in progress whenever you want to use them again."}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Your collection progress, wishlist, and in-progress statuses stay saved. You can change this choice at any time from English ISO.</p>
            {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={saving} onClick={() => void saveActivation(true)} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving..." : current.english_cards_enabled ? "Keep English activated" : "Activate English cards"}</button>{current.english_cards_enabled && <button type="button" disabled={saving} onClick={() => void saveActivation(false)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold disabled:opacity-50">Deactivate English cards</button>}<Link to="/iso-chinese" className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-muted-foreground hover:text-foreground">Chinese ISO</Link></div>
        </section>}
    </main>;
}
