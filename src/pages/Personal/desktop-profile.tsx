import { EnglishLeaderboardAppealForm } from "@/components/EnglishLeaderboardAppeals";
import { englishViewCard, englishViewCode, englishViewImage, englishViewStyle, englishViewWide, compareEnglishViewCards, ownedEnglishViewCards, masteredEnglishViewSets, isEnglishViewHit } from "@/lib/english-card-views";
import { isISOOwned, normalizeISOKey } from "@/pages/ISO/iso-visibility";
import ProfileAvatar from "@/components/ProfileAvatar";
import { chineseSets, chineseCards, isWideChineseCard, type ChineseISOCard } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ChineseISOImage from "@/pages/Chinese Kayou/Chinese ISO/components/card-image";
const chineseHitRarities: Record<string, readonly string[]> = {
    moon: ["ZR", "SC", "DZR", "SZR", "SHINING ZR"],
    star: ["BP", "DAR", "SAR"],
    fun: ["CR", "DCR", "SCR"],
    rainbow: ["XR"],
};
const isChineseShowcaseHit = (card: ChineseISOCard) => chineseHitRarities[card.family]?.includes(card.rarity) ?? false;
import { onAuthIdentityChange } from "@/lib/auth-identity";
import CardImage from "@/components/CardImage";
import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
function ShowcaseImage({ src, alt, className, imageSize, style, }: {
    imageSize?: "grid" | "original";
    style?: CSSProperties;
    src: string;
    alt: string;
    className: string;
}) {
const [failedSrc, setFailedSrc] = useState<string | null>(null);
    return failedSrc === src ? (<div role="img" aria-label={`${alt} coming soon`} className="absolute inset-0 flex items-center justify-center bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
      <span className="px-2 text-center text-sm font-bold">COMING SOON</span>
    </div>) : (<CardImage imageSize={imageSize} src={src} alt={alt} className={className} style={style} onError={() => setFailedSrc(src)}/>);
}
export default function DesktopProfile() {
const navigate = useNavigate();
const loadCounts = useRef<Record<string, number>>({});
const [profileLoads, setProfileLoads] = useState<Record<string, boolean>>({
        profile: false,
        stats: false,
        theme: false,
        showcase: false,
    });
const [profileLoadErrors, setProfileLoadErrors] = useState<Record<string, boolean>>({});
const trackProfileLoad = useCallback(async (key: string, task: () => Promise<void>) => {
        loadCounts.current[key] = (loadCounts.current[key] ?? 0) + 1;
        setProfileLoads((previous) => ({ ...previous, [key]: false }));
        try {
            await task();
            setProfileLoadErrors((previous) => ({ ...previous, [key]: false }));
        }
        catch (error) {
            console.error(`Unable to load profile ${key}:`, error);
            setProfileLoadErrors((previous) => ({ ...previous, [key]: true }));
        }
        finally {
            loadCounts.current[key] -= 1;
            if (loadCounts.current[key] === 0)
                setProfileLoads((previous) => ({ ...previous, [key]: true }));
        }
    }, []);
const [profile, setProfile] = useState<any>(null);
const [activeTheme, setActiveTheme] = useState<"light" | "dark" | "spooky">(() => {
const theme = document.documentElement.dataset.theme;
        return theme === "light" || theme === "spooky" ? theme : "dark";
    });
const isLightMode = activeTheme === "light";
const isSpookyMode = activeTheme === "spooky";
const [discord, setDiscord] = useState("");
const [tradeAccessRevoked, setTradeAccessRevoked] = useState(false);
const [offerStrikeCount, setOfferStrikeCount] = useState(0);
const [showOfferStrikeInfo, setShowOfferStrikeInfo] = useState(false);
const [editingProfile, setEditingProfile] = useState(false);
const [usernameDraft, setUsernameDraft] = useState("");
const [discordDraft, setDiscordDraft] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [showUsernameTakenModal, setShowUsernameTakenModal] = useState(false);
const [stats, setStats] = useState({
        owned: 0,
        chineseOwned: 0,
        completed: 0,
        friends: 0,
    });
const [showcaseTab, setShowcaseTab] = useState<"moon" | "star" | "fun" | "rainbow" | "tcg">("moon");
const [showcaseLanguage, setShowcaseLanguage] = useState<"english" | "chinese">("english");
const [showcaseCards, setShowcaseCards] = useState<any[]>([]);
const [selectedShowcaseCard, setSelectedShowcaseCard] = useState<any | null>(null);
const isMoon3SZR001 = (card: any) => englishViewWide(card);
const [copied, setCopied] = useState(false);
const [deletionRequested, setDeletionRequested] = useState(false);
const [showDeletionModal, setShowDeletionModal] = useState(false);
const [submittingDeletion, setSubmittingDeletion] = useState(false);
const [vacationMode, setVacationMode] = useState(false);
const [vacationBusy, setVacationBusy] = useState(false);
const [vacationLoaded, setVacationLoaded] = useState(false);
const [vacationError, setVacationError] = useState("");
const [leaderboardBanned, setLeaderboardBanned] = useState(false);
const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
    useEffect(() => {
const open = !!selectedShowcaseCard || showDeletionModal || showOfferStrikeInfo || showUsernameTakenModal;
        if (!open)
            return;
const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, [selectedShowcaseCard, showDeletionModal, showOfferStrikeInfo, showUsernameTakenModal]);
    useEffect(() => {
let mounted = true;
const syncFromDocument = () => {
            if (!mounted)
                return;
const theme = document.documentElement.dataset.theme;
            setActiveTheme(theme === "light" || theme === "spooky" ? theme : "dark");
        };
const observer = new MutationObserver(syncFromDocument);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });
        syncFromDocument();
        void trackProfileLoad("theme", async () => {
            syncFromDocument();
        });
        return () => {
            mounted = false;
            observer.disconnect();
        };
    }, [trackProfileLoad]);
    useEffect(() => {
        loadProfile();
        loadStats();
const { data: { subscription }, } = onAuthIdentityChange(() => {
            setTimeout(() => {
                void loadProfile();
                void loadStats();
            }, 0);
        });
        return () => subscription.unsubscribe();
    }, []);
async function loadProfile() {
        return trackProfileLoad("profile", async () => {
const { data: { session }, } = await checkedProfileRequest(supabase.auth.getSession());
            if (!session?.user)
                return;
const { data } = await checkedProfileRequest(supabase
                .from("profiles")
                .select("id, username, avatar_url, vacation_mode")
                .eq("id", session.user.id)
                .single());
            setVacationMode(Boolean(data?.vacation_mode));
            setVacationLoaded(Boolean(data));
            if (data) {
                await preloadProfileAvatar(getProfileAssets(data).avatar);
                setProfile(data);
            }
            setUsernameDraft(data?.username || "");
const { data: trading } = await checkedProfileRequest(supabase
                .from("trading_profiles")
                .select("discord_username, trade_access_revoked")
                .eq("user_id", session.user.id)
                .maybeSingle());
            setDiscord(trading?.discord_username || "");
            setDiscordDraft(trading?.discord_username || "");
            setTradeAccessRevoked(Boolean(trading?.trade_access_revoked));
const { count: strikeCount } = await checkedProfileRequest(supabase
                .from("trade_offer_expiration_strikes")
                .select("id", { count: "exact", head: true })
                .eq("recipient_user_id", session.user.id)
                .is("cleared_at", null));
            setOfferStrikeCount(Math.min(strikeCount ?? 0, 3));
const { data: leaderboardBan, error: leaderboardBanError } = await checkedProfileRequest(supabase
                .from("leaderboard_exclusions")
                .select("user_id, reason")
                .eq("user_id", session.user.id)
                .maybeSingle());
            if (leaderboardBanError) {
                console.error("Leaderboard ban status error:", leaderboardBanError);
            }
            setLeaderboardBanned(!!leaderboardBan);
            setLoadingLeaderboardBan(false);
        });
    }
async function toggleVacationMode() {
        if (!profile?.id || !vacationLoaded || vacationBusy)
            return;
        setVacationBusy(true);
        setVacationError("");
const nextValue = !vacationMode;
const { data, error } = await supabase
            .from("profiles")
            .update({ vacation_mode: nextValue })
            .eq("id", profile.id)
            .select("vacation_mode")
            .single();
        if (error || !data) {
            console.error("Unable to update vacation mode:", error);
            setVacationError("Could not update Vacation Mode. Please try again.");
        }
        else {
            setVacationMode(Boolean(data.vacation_mode));
        }
        setVacationBusy(false);
    }
async function requestAccountDeletion() {
        if (deletionRequested || submittingDeletion)
            return;
        setSubmittingDeletion(true);
        try {
const { data: { session }, } = await supabase.auth.getSession();
            if (!session?.user) {
                setShowDeletionModal(false);
                return;
            }
const { error } = await supabase
                .from("account_deletion_requests")
                .insert({
                user_id: session.user.id,
                username: profile?.username || null,
            });
            if (error) {
                console.error("Account deletion request error:", error);
                if (error.code === "23505") {
                    setDeletionRequested(true);
                }
                return;
            }
            setDeletionRequested(true);
            setShowDeletionModal(false);
        }
        finally {
            setSubmittingDeletion(false);
        }
    }
async function loadStats() {
        return trackProfileLoad("stats", async () => {
const { data: { session }, } = await checkedProfileRequest(supabase.auth.getSession());
            if (!session?.user)
                return;
const { data: collection } = await checkedProfileRequest(supabase
                .from("collection_progress_raw")
                .select("set_id, progress")
                .eq("user_id", session.user.id));
const chineseOwned = (collection || []).filter((row: any) => String(row.set_id).toLowerCase().startsWith("cn-")).reduce((total: number, row: any) => total + Object.values(row.progress || {}).filter((value: any) => value === true || (typeof value === "object" && value?.owned === true)).length, 0);
const owned = ownedEnglishViewCards(collection || []).length;
const { data: friends } = await checkedProfileRequest(supabase
                .from("friend_requests")
                .select("sender_id, receiver_id")
                .eq("status", "accepted"));
const friendCount = (friends ?? []).filter((friend: any) => friend.sender_id === session.user.id ||
                friend.receiver_id === session.user.id).length;
const progressMap = new Map<string, Record<string, unknown>>();
            for (const row of collection || []) {
const setId = String(row.set_id) === "friendshipsbegin" ? "SD" : String(row.set_id);
const values = progressMap.get(setId) ?? {};
                for (const [key, value] of Object.entries(row.progress || {})) {
                    values[normalizeISOKey(setId, key)] = value;
                }
                progressMap.set(setId, values);
            }
let completed = masteredEnglishViewSets(collection || []);
            for (const set of chineseSets) {
                if (set.family === "promos" || set.cards.length === 0)
                    continue;
const progress = progressMap.get(set.id);
                if (progress && set.cards.every(card => isISOOwned(progress[card.key])))
                    completed++;
            }
            setStats({
                owned,
                chineseOwned,
                completed,
                friends: friendCount,
            });
        });
    }
const { avatar, verification } = getProfileAssets(profile);
const displayName = profile?.username || "Twilight Sparkle";
const offerStrikeLabel = offerStrikeCount === 0
        ? "Clean"
        : offerStrikeCount === 1
            ? "Good"
            : offerStrikeCount === 2
                ? "Bad"
                : "Access revoked";
    useEffect(() => {
const loadShowcaseCards = async () => {
            return trackProfileLoad("showcase", async () => {
const { data: { session }, } = await checkedProfileRequest(supabase.auth.getSession());
                if (!session?.user)
                    return;
const { data } = await checkedProfileRequest(supabase
                    .from("collection_progress_raw")
                    .select("set_id, progress")
                    .eq("user_id", session.user.id));
const cards: any[] = ownedEnglishViewCards(data || []).filter(isEnglishViewHit).map(card => ({ set_id: card.setId, card_key: card.key }));
const chineseProgress = new Map<string, Record<string, unknown>>();
                for (const row of data || []) {
                    if (!String(row.set_id).startsWith("cn-"))
                        continue;
                    chineseProgress.set(String(row.set_id), { ...chineseProgress.get(String(row.set_id)), ...(row.progress || {}) });
                }
                for (const card of chineseCards) {
                    if (isChineseShowcaseHit(card) && isISOOwned(chineseProgress.get(card.setId)?.[card.key])) {
                        cards.push({ set_id: card.setId, card_key: card.key, chineseCard: card });
                    }
                }
                setShowcaseCards(cards);
            });
        };
        loadShowcaseCards();
    }, []);
const getTradeCardImage = englishViewImage;
const getShowcaseImageClass = (_card: any) => "absolute inset-0 h-full w-full object-cover object-center";
const getShowcaseImageStyle = (card: any): CSSProperties => englishViewStyle(card);
async function handleProfileEdit() {
        if (editingProfile) {
            setSavingProfile(true);
const { data: { session }, } = await supabase.auth.getSession();
            if (session?.user) {
const originalUsername = profile?.username || "";
const nextUsername = usernameDraft.trim();
const { data: existingUsername, error: usernameCheckError } = await supabase
                    .from("profiles")
                    .select("id")
                    .ilike("username", nextUsername)
                    .neq("id", session.user.id)
                    .maybeSingle();
                if (usernameCheckError) {
                    console.error("Failed to check username availability:", usernameCheckError);
                    setSavingProfile(false);
                    return;
                }
                if (existingUsername) {
                    setUsernameDraft(originalUsername);
                    setShowUsernameTakenModal(true);
                    setSavingProfile(false);
                    return;
                }
const { error: usernameError } = await supabase
                    .from("profiles")
                    .update({ username: nextUsername })
                    .eq("id", session.user.id);
                if (usernameError) {
                    if (usernameError.code === "23505" ||
                        usernameError.message.toLowerCase().includes("duplicate")) {
                        setUsernameDraft(originalUsername);
                        setShowUsernameTakenModal(true);
                    }
                    else {
                        console.error("Failed to save username:", usernameError);
                    }
                    setSavingProfile(false);
                    return;
                }
const { error: authUsernameError } = await supabase.auth.updateUser({
                    data: { username: nextUsername },
                });
                if (authUsernameError)
                    console.error("Failed to update username metadata:", authUsernameError);
const { error: tradingError } = tradeAccessRevoked
                    ? { error: null }
                    : await supabase.from("trading_profiles").upsert({
                        user_id: session.user.id,
                        discord_username: discordDraft.trim(),
                    }, { onConflict: "user_id" });
                if (tradingError) {
                    console.error("Failed to save Discord username:", tradingError);
                    setSavingProfile(false);
                    return;
                }
                setProfile((prev: any) => ({ ...prev, username: nextUsername }));
                setUsernameDraft(nextUsername);
                setDiscord(discordDraft);
            }
            setSavingProfile(false);
        }
        setEditingProfile(!editingProfile);
    }
function handleShareProfile() {
const url = `https\://www.mlpekayou.community/${encodeURIComponent(profile?.username ?? "")}`;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url);
        }
        else {
const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
            }
            finally {
                document.body.removeChild(textArea);
            }
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    }
const showcaseTabs: Array<[
        "moon" | "star" | "fun" | "rainbow" | "tcg",
        string
    ]> = [
        ["moon", "Moon"],
        ["star", "Star"],
        ["fun", "Fun Moments"],
        ["rainbow", "Rainbow"],
        ["tcg", "TCG"],
    ];
const visibleShowcaseCards = showcaseCards
        .filter((card) => {
        if (showcaseLanguage === "chinese")
            return card.chineseCard?.family === showcaseTab;
        if (card.chineseCard)
            return false;
        return englishViewCard(card)?.family === showcaseTab;
    })
        .sort((a, b) => {
        if (a.chineseCard && b.chineseCard) {
const setDifference = chineseSets.findIndex(set => set.id === a.set_id) - chineseSets.findIndex(set => set.id === b.set_id);
            if (setDifference)
                return setDifference;
const rarities = chineseHitRarities[a.chineseCard.family] ?? [];
            return rarities.indexOf(a.chineseCard.rarity) - rarities.indexOf(b.chineseCard.rarity) || a.chineseCard.number - b.chineseCard.number;
        }
        return compareEnglishViewCards(a, b);
    });
const essentialProfileLoaded = profileLoads.profile && profileLoads.theme;
const essentialProfileFailed = profileLoadErrors.profile || profileLoadErrors.theme;
    if (!essentialProfileLoaded)
        return <ProfileLoadingScreen light={isLightMode} spooky={isSpookyMode} failed={false}/>;
    if (essentialProfileFailed || !profile)
        return <ProfileLoadingScreen light={isLightMode} spooky={isSpookyMode} failed/>;
    return (<div className={`min-h-screen transition-colors duration-200 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {(tradeAccessRevoked || (!loadingLeaderboardBan && leaderboardBanned)) && <section aria-label="Account restrictions" className={`my-4 border-y px-1 py-4 text-sm leading-6 ${isLightMode ? "border-red-300 text-red-800" : "border-red-500/30 text-red-200"}`}>
{tradeAccessRevoked && <div><h2 className="font-semibold">Trading post access restricted</h2><p className="mt-1">{offerStrikeCount >= 3 ? "Your trading access was revoked after three unanswered offers expired." : "Your account cannot use the trading posts while this restriction is active."}</p></div>}
{!loadingLeaderboardBan && leaderboardBanned && <div className={tradeAccessRevoked ? "mt-4" : undefined}><h2 className="font-semibold">English leaderboard access restricted</h2><p className="mt-1">Your account is currently excluded from the English leaderboards. This does not exclude you from the Chinese leaderboard.</p></div>}
<p className="mt-3">For details or to appeal, open a ticket in the <a href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">MLPEKAYOU Discord server</a>.</p>
</section>}
<EnglishLeaderboardAppealForm restricted={leaderboardBanned} onReinstated={() => setLeaderboardBanned(false)}/>
        <div className="relative border-b border-current/10 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <ProfileAvatar profile={profile} src={avatar} alt="" className={`h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20 border object-cover ${isLightMode ? "border-black/10 bg-zinc-100" : "border-white/[0.10] bg-[#191a1b]"}`}/>
              <div className="min-w-0 flex-1">
                {editingProfile ? (<div className="grid max-w-2xl gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>
                        MLPEKAYOU Username
                      </span>
                      <input value={usernameDraft} onChange={(e) => setUsernameDraft(e.target.value)} autoFocus className={`w-full rounded-xl border px-3 py-2.5 text-base font-medium outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`} placeholder="Your MLPEKAYOU username"/>
                    </label>
                    <label className="block">
                      <span className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}>
                        Discord Username
                      </span>
                      <input value={discordDraft} onChange={(e) => setDiscordDraft(e.target.value)} disabled={tradeAccessRevoked} className={`w-full rounded-xl border px-3 py-2.5 text-base outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`} placeholder={tradeAccessRevoked
                ? "Trading access revoked"
                : "Your Discord username"}/>
                    </label>
                  </div>) : (<>
                    <div className="flex items-center gap-3">
                      <h1 className={`truncate text-2xl font-semibold tracking-tight sm:text-3xl ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                        {displayName}
                      </h1>
                      {verification && (<CardImage src={verification.badge} alt={verification.label} title={verification.label} className="h-7 w-7 shrink-0"/>)}
                    </div>
                    <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
                      @{discord || "No Discord username set"}
                    </p>
                  </>)}
                {!editingProfile && (<div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${isLightMode ? "border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-700" : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isLightMode ? "bg-emerald-600" : "bg-emerald-400"}`}/>
                      Active
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]"}`}>
                      SuperFan
                    </span>
                    <button type="button" onClick={() => setShowOfferStrikeInfo(true)} aria-label="Learn about offer response strikes" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${offerStrikeCount >= 3
                ? "border-red-500/25 bg-red-500/10 text-red-500"
                : offerStrikeCount === 2
                    ? "border-orange-500/25 bg-orange-500/10 text-orange-500"
                    : isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"}`}>
                      Offer strikes
                      <span className="font-bold">{offerStrikeCount}/3</span>
                      <span className="opacity-60"> {offerStrikeLabel}</span>
                    </button>
                  </div>)}
                {profile?.bio && (<p className={`mt-4 max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                    {profile.bio}
                  </p>)}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
              <button onClick={() => navigate("/Personal/change-avatar")} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>
                Change Avatar
              </button>
              <button type="button" onClick={() => navigate("/Personal/change-avatar?tab=frames")} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700] hover:bg-[#c89d13]/25" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/20"}`}>
                Frames
              </button>
              <button onClick={handleProfileEdit} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${editingProfile ? (isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]") : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>
                {editingProfile
            ? savingProfile
                ? "Saving..."
                : "Save"
            : "Edit Names"}
              </button>
              <button onClick={handleShareProfile} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>
                {copied ? "Copied" : "Share Profile"}
              </button>
            </div>
          </div>
        <div className={`mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4 ${isLightMode ? "border-black/10" : "border-white/[0.08]"}`}>
          {[
            [profileLoads.stats && !profileLoadErrors.stats ? stats.owned.toLocaleString() : "", "Cards Owned"],
            [profileLoads.stats && !profileLoadErrors.stats ? stats.chineseOwned.toLocaleString() : "", "Chinese Cards"],
            [profileLoads.stats && !profileLoadErrors.stats ? stats.completed.toLocaleString() : "", "Sets Mastered"],
            [profileLoads.stats && !profileLoadErrors.stats ? stats.friends.toLocaleString() : "", "Friends"],
        ].map(([value, label]) => (<div key={label} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <div className={`text-xl font-bold tracking-tight sm:text-2xl ${isLightMode ? "text-[#8a6a00]" : "text-[#FFD54A]"}`}>
                {value}
              </div>
              <div className={`text-xs font-medium sm:text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                {label}
              </div>
            </div>))}
        </div>
        </div>
        <div className="mt-4 grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4">
        <div className="grid grid-cols-2 gap-1 border-b border-current/10 pb-4 xl:grid-cols-1">
        </div>
        <div className="border-b border-current/10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Vacation Mode</h3>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                {vacationMode ? "Your trade and sale cards are hidden until you turn this off." : "Hide your trade and sale cards until you return."}
              </p>
            </div>
            <button type="button" role="switch" aria-label="Vacation Mode" aria-checked={vacationMode} disabled={!vacationLoaded || vacationBusy} onClick={() => void toggleVacationMode()} className={`relative flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors disabled:opacity-50 ${vacationMode ? "bg-[#FFD54A]" : isLightMode ? "bg-zinc-300" : "bg-zinc-700"}`}>
              <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${vacationMode ? "translate-x-6" : "translate-x-0"}`}/>
            </button>
          </div>
          {vacationError && <p role="alert" className="mt-2 text-xs text-red-400">{vacationError}</p>}
        </div>
        <div className="py-4">
          <div>
            <h3 className={`text-sm font-semibold ${isLightMode ? "text-red-700" : "text-white"}`}>
              Account Deletion
            </h3>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              Request permanent deletion of your MLPEKAYOU account. Your account
              stays active until the request is manually reviewed and completed.
            </p>
          </div>
          <button type="button" onClick={() => setShowDeletionModal(true)} disabled={deletionRequested} className={`mt-4 w-full rounded-xl border px-5 py-3 text-sm font-semibold ${deletionRequested ? "cursor-default border-zinc-400/20 bg-zinc-500/10 text-zinc-500" : isLightMode ? "border-red-700/25 bg-red-700/[0.04] text-red-700 hover:bg-red-700/[0.08]" : "border-red-500/30 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.12]"}`}>
            {deletionRequested ? "Request Pending" : "Request Account Deletion"}
          </button>
        </div>
          </aside>
          <main className="min-w-0">
        <div className="min-w-0 py-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                Top Collected Hits
              </h2>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Your rarest collected cards, grouped by collection.
              </p>
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              {showcaseTabs.filter(([key]) => showcaseLanguage === "english" || key !== "tcg").map(([key, label]) => (<button key={key} onClick={() => setShowcaseTab(key)} className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${showcaseTab === key ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-zinc-500 hover:text-current"}`}>
                  {label}
                </button>))}
            </div>
          </div>
          <div role="group" aria-label="Showcase language" className="mt-4 flex gap-5 border-b border-current/10">
            {(["english", "chinese"] as const).map(language => <button type="button" key={language} aria-pressed={showcaseLanguage === language} onClick={() => {
                setShowcaseLanguage(language);
                if (language === "chinese" && showcaseTab === "tcg")
                    setShowcaseTab("moon");
            }} className={`border-b-2 px-0 pb-2 text-sm font-semibold transition-colors ${showcaseLanguage === language ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-zinc-500 hover:text-current"}`}>{language === "english" ? "English" : "Chinese"}</button>)}
          </div>
          {!profileLoads.showcase && <p role="status" className="py-10 text-center text-sm text-zinc-500">Loading your collected hits...</p>}
          {profileLoadErrors.showcase && <p role="alert" className="py-8 text-center text-sm text-zinc-500">Your collected hits could not be loaded. Refresh to try again.</p>}
          {profileLoads.showcase && !profileLoadErrors.showcase && visibleShowcaseCards.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Your collected hits will appear here.</p>}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {visibleShowcaseCards.map((card, index) => (<button type="button" key={`${card.set_id}-${card.card_key}-${index}`} aria-label={card.chineseCard ? `${card.chineseCard.setName}: ${card.chineseCard.code}` : englishViewCode(card)} onClick={() => setSelectedShowcaseCard(card)} className={`group relative overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 ${card.chineseCard
                ? isWideChineseCard(card.chineseCard) ? "col-span-2 self-start" : "self-start"
                : isMoon3SZR001(card)
                    ? "col-span-2 grid grid-cols-2 gap-3"
                    : "aspect-[5/7]"}`}>
                {card.chineseCard ? <ChineseISOImage card={card.chineseCard}/> : isMoon3SZR001(card) ? (<>
                    <div className="invisible aspect-[5/7] w-full" aria-hidden="true"/>
                    <div className="invisible aspect-[5/7] w-full" aria-hidden="true"/>
                    <CardImage imageSize={englishViewCard(card)?.original ? "original" : "grid"} src={getTradeCardImage(card)} alt={englishViewCode(card)} className={getShowcaseImageClass(card)} style={getShowcaseImageStyle(card)}/>
                  </>) : (<ShowcaseImage imageSize={englishViewCard(card)?.original ? "original" : "grid"} src={getTradeCardImage(card)} alt={englishViewCode(card)} className={getShowcaseImageClass(card)} style={getShowcaseImageStyle(card)}/>)}
              </button>))}
          </div>
        </div>
          </main>
        </div>
      </div>
      {showOfferStrikeInfo && (<div className={`fixed inset-0 z-[140] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/30" : "bg-black/80"}`} onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    setShowOfferStrikeInfo(false);
                }
            }}>
          <div role="dialog" aria-modal="true" aria-labelledby="desktop-offer-strikes-title" className={`max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/[0.10] bg-[#151718] text-white"}`}>
            <h2 id="desktop-offer-strikes-title" className="text-xl font-semibold tracking-tight">
              Offer response strikes
            </h2>
            <div className={`mt-3 space-y-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              <p>
                You gain a strike when someone sends you a trade offer and you
                do not accept or decline it within the seven days provided.
              </p>
              <p>
                At three strikes, your account is treated as inactive in the
                Trading Post. Your Discord username and trading privileges are
                removed from public view so active users can continue trading.
              </p>
              <p>
                Reinstatement is easy. Open a ticket in the MLPEKAYOU Discord
                server and prove to a staff member that your account is active.
                Once reinstated, you will need to set your Discord username
                again in your profile.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href="https\://discord.gg/mlpekayou" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]">
                Open Discord
              </a>
              <button type="button" onClick={() => setShowOfferStrikeInfo(false)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}>
                Done
              </button>
            </div>
          </div>
        </div>)}
      {showDeletionModal && (<div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/20" : "bg-black/80"}`} onMouseDown={(e) => {
                if (e.target === e.currentTarget && !submittingDeletion)
                    setShowDeletionModal(false);
            }}>
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${isLightMode ? "border-red-900/10 bg-white text-zinc-900" : "border-red-500/25 bg-[#151718] text-white"}`}>
            <h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}>
              Request account deletion
            </h2>
            <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              This sends a request for permanent account deletion. Your account
              stays active until the request is manually reviewed and completed.
            </p>
            <p className={isLightMode
                ? "mt-3 text-sm font-medium text-red-700"
                : "mt-3 text-sm font-medium text-red-500"}>
              Once your account is deleted, it cannot be recovered.
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" disabled={submittingDeletion} onClick={() => setShowDeletionModal(false)} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700" : "border-white/10 bg-white/[0.05] text-zinc-300"}`}>
                Cancel
              </button>
              <button type="button" disabled={submittingDeletion} onClick={requestAccountDeletion} className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-red-700/25 bg-red-700/[0.06] text-red-700" : "border-red-500/30 bg-red-500/[0.08] text-red-500"}`}>
                {submittingDeletion ? "Submitting..." : "Request deletion"}
              </button>
            </div>
          </div>
        </div>)}
      {showUsernameTakenModal && (<div className={`fixed inset-0 z-[130] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`} onMouseDown={(e) => {
                if (e.target === e.currentTarget)
                    setShowUsernameTakenModal(false);
            }}>
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${isLightMode ? "border-[#8a6a00]/20 bg-white text-zinc-900" : "border-[#FFD54A]/25 bg-[#151718] text-white"}`}>
            <h2 className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}`}>
              Username already taken
            </h2>
            <p className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              That username already belongs to another collector. Your original
              username has been restored in the editor.
            </p>
            <button type="button" onClick={() => setShowUsernameTakenModal(false)} className={`mt-6 w-full rounded-xl border px-4 py-3 text-sm font-semibold ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"}`}>
              Got it
            </button>
          </div>
        </div>)}
      {selectedShowcaseCard && (<div className={`fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`} onClick={() => setSelectedShowcaseCard(null)}>
          <button type="button" aria-label="Close card preview" onClick={() => setSelectedShowcaseCard(null)} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-2xl text-white shadow-lg">-</button>
          <button type="button" className={`relative overflow-hidden rounded-2xl shadow-2xl ${selectedShowcaseCard.chineseCard
                ? isWideChineseCard(selectedShowcaseCard.chineseCard) ? "w-[min(92vw,850px,calc(78dvh*10/7))]" : "w-[min(78vw,425px,calc(78dvh*5/7))]"
                : isMoon3SZR001(selectedShowcaseCard)
                    ? "aspect-[10/7] w-[min(92vw,850px,calc(78dvh*10/7))]"
                    : "aspect-[5/7] w-[min(78vw,425px,calc(78dvh*5/7))]"}`} onClick={(e) => e.stopPropagation()}>
            {selectedShowcaseCard.chineseCard ? <ChineseISOImage card={selectedShowcaseCard.chineseCard}/> : <ShowcaseImage imageSize="original" src={getTradeCardImage(selectedShowcaseCard)} alt="Selected card" className={getShowcaseImageClass(selectedShowcaseCard)} style={getShowcaseImageStyle(selectedShowcaseCard)}/>}
          </button>
        </div>)}
    </div>);
}
function ProfileLoadingScreen({ light, spooky, failed, }: {
    light: boolean;
    spooky: boolean;
    failed: boolean;
}) {
const logo = light
        ? "/website-assets/mlpekayouwiki4.webp"
        : spooky
            ? "/website-assets/nightmarelogo.webp"
            : "/website-assets/darkmodelogo.webp";
    return (<div className={`profile-loading-screen${light ? " profile-loading-light" : ""}${spooky ? " profile-loading-spooky" : ""}`}>
      <style>{`
        .profile-loading-screen{position:relative;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:32px 24px;background:#0d0f10;color:#f4f4f5}
        .profile-loading-screen.profile-loading-light{background:#f5f5f3;color:#27272a}
        .profile-loading-content{width:100%;max-width:320px;text-align:center;transform:translateY(clamp(-110px,-12dvh,-72px))}
        .profile-loading-brand{display:flex;align-items:center;justify-content:center;width:210px;height:92px;margin:0 auto 24px}
        .profile-loading-brand img{width:100%;max-height:92px;object-fit:contain;filter:drop-shadow(0 5px 16px rgba(0,0,0,.12));animation:profile-logo-breathe 1.8s ease-in-out infinite}
        .profile-loading-title{margin:0;font-size:17px;font-weight:700;line-height:1.4}
        .profile-loading-subtitle{margin:6px 0 0;font-size:13px;line-height:1.5;color:#a1a1aa}
        .profile-loading-light .profile-loading-subtitle{color:#71717a}
        .profile-loading-spooky .profile-loading-bar::after{background:#a77be8}
        .profile-loading-spooky .profile-loading-retry{background:#7544ad;color:#fff}
        .profile-loading-spooky .profile-loading-retry:focus-visible{outline-color:#b18bff}
        .profile-loading-bar{position:relative;width:150px;height:3px;margin:22px auto 0;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.10)}
        .profile-loading-light .profile-loading-bar{background:rgba(24,24,27,.10)}
        .profile-loading-bar::after{content:"";position:absolute;inset:0;width:45%;border-radius:inherit;background:#ffda4b;animation:profile-loading-bar 1.1s ease-in-out infinite}
        .profile-loading-retry{margin-top:20px;min-height:44px;padding:10px 22px;border:0;border-radius:12px;background:#ffda4b;color:#252728;font-size:16px;font-weight:600;cursor:pointer}
        .profile-loading-retry:focus-visible{outline:3px solid #90bfff;outline-offset:4px}
        @keyframes profile-logo-breathe{0%,100%{opacity:.76;transform:scale(.985)}50%{opacity:1;transform:scale(1)}}
        @keyframes profile-loading-bar{0%{transform:translateX(-115%)}50%{transform:translateX(120%)}100%{transform:translateX(245%)}}
        @media(prefers-reduced-motion:reduce){.profile-loading-brand img,.profile-loading-bar::after{animation:none}}
      `}</style>
      <div className="profile-loading-content">
        <div className="profile-loading-brand">
          <CardImage src={logo} alt="MLPEKAYOU"/>
        </div>
        {failed ? (<>
            <p className="profile-loading-title" role="alert">
              We couldn't load your profile
            </p>
            <p className="profile-loading-subtitle">Please try again.</p>
            <button type="button" className="profile-loading-retry" onClick={() => window.location.reload()}>
              Try again
            </button>
          </>) : (<div role="status" aria-live="polite">
            <span className="sr-only">Loading your profile</span>
            <p className="profile-loading-title" aria-hidden="true">
              Getting your profile ready
            </p>
            <p className="profile-loading-subtitle" aria-hidden="true">
              Loading your account and preferences
            </p>
            <div className="profile-loading-bar" aria-hidden="true"/>
          </div>)}
      </div>
    </div>);
}
async function checkedProfileRequest<T extends {
    error?: unknown;
}>(request: PromiseLike<T>): Promise<T> {
const result = await request;
    if (result.error)
        throw result.error;
    return result;
}
function preloadProfileAvatar(src: string | null | undefined): Promise<void> {
    if (!src)
        return Promise.resolve();
    return new Promise((resolve) => {
const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
        if (image.complete)
            resolve();
    });
}
