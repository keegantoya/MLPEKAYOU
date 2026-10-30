import { profileViewGroup, profileViewSquare, isProfileMerchandiseHidden } from "@/lib/english-card-views";
import { profileViewCard as englishViewCard, profileViewEligible as englishViewEligible, profileViewName as englishViewName, profileViewCode as englishViewCode, profileViewImage as englishViewImage, profileViewStyle as englishViewStyle, profileViewWide as englishViewWide, profileViewRarity as englishViewRarity, profileViewRarityOrder as englishViewRarityOrder, profileViewRarityLabel as englishViewRarityLabel, profileViewSetOrder as englishViewSetOrder, compareProfileViewCards as compareEnglishViewCards, ownedEnglishViewCards, masteredEnglishViewSets, missingProfileViewCards as missingEnglishViewCards, englishViewSetId } from "@/lib/english-card-views";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProfileCardLanguageSwitch, usePublicChineseProfile, type ProfileCardLanguage } from "@/pages/Chinese Kayou/Chinese ISO/PublicChineseCards";
import ChineseISOImage from "@/pages/Chinese Kayou/Chinese ISO/components/card-image";
import { chineseSets, getChineseCard, getChineseCardLabel, hasChineseCardCode, isChineseKujiPrize, isChineseSetId, isWideChineseCard, chineseRarityLabel } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { getProfileAssets } from "./profile-assets";
import { usePublicProfileCards } from "@/lib/public-profile-cards";
type CardImageCard = {
    set_id: string | number;
    card_key: string;
};
const isMerchandise = (card: CardImageCard | null | undefined) => !!card && (englishViewCard(card)?.family === "merch" || isChineseKujiPrize({ setId: String(card.set_id), key: card.card_key }));
const getTradeCardImage = (card: CardImageCard) => getChineseCard(String(card.set_id), card.card_key)?.image ?? englishViewImage(card);
type InventoryCard = {
    id: string;
    set_id: string;
    card_key: string;
};
type OfferState = {
    attempts: number;
    latestStatus: string;
    latestExpiresAt: string;
    latestCreatedAt: string;
};
const OFFER_SET_ORDER = englishViewSetOrder();
const allOfferSetOrder = [...OFFER_SET_ORDER, ...chineseSets.map(set => set.id)];
const getOfferCollectionSet = (setId: string) => englishViewSetId(setId);
const canonicalOfferSetId = (setId: string | number) => String(setId) === "SD" ? "friendshipsbegin" : String(setId);
const offerKeyFor = (recipientId: string, setId: string | number, cardKey: string) => [recipientId, canonicalOfferSetId(setId), cardKey].join("-");
const buildOfferState = (rows: any[]) => {
    const states: Record<string, OfferState> = {};
    rows.forEach((offer) => {
        const key = offerKeyFor(offer.recipient_id, offer.target_set_id, offer.target_card_key);
        const current = states[key];
        const attempts = Math.max(current?.attempts || 0, Number(offer.attempt_number || 1));
        if (!current ||
            new Date(offer.created_at).getTime() >=
                new Date(current.latestCreatedAt).getTime()) {
            states[key] = {
                attempts,
                latestStatus: offer.status,
                latestExpiresAt: offer.expires_at,
                latestCreatedAt: offer.created_at,
            };
        }
        else {
            states[key].attempts = attempts;
        }
    });
    return states;
};
const getCardImageClassName = (_card: CardImageCard, position: "block" | "absolute" = "block") => `${position === "absolute" ? "absolute inset-0" : "block"} h-full w-full max-w-none object-cover object-center`;
const getProfileCardIdentity = (card: CardImageCard) => getChineseCard(String(card.set_id), card.card_key)?.identity ?? englishViewCard(card)?.identity ?? JSON.stringify([String(card.set_id), card.card_key]);
const getProfileCardCode = (card: CardImageCard) => { const chineseCard = getChineseCard(String(card.set_id), card.card_key); return chineseCard ? getChineseCardLabel(chineseCard) : englishViewCode(card); };
type SafeCardImageProps = {
    card?: CardImageCard;
    imageSize?: "grid" | "original";
    src: string;
    alt: string;
    className: string;
};
const SafeCardImage = (props: SafeCardImageProps) => <ProfileCardImageSource key={JSON.stringify([props.card ? getProfileCardIdentity(props.card) : "", props.src, props.imageSize ?? "grid"])} {...props}/>;
const ProfileCardImageSource = ({ src, alt, className, imageSize, card }: SafeCardImageProps) => {
    const [failed, setFailed] = useState(false);
    const resolvedImageSize = imageSize ?? (card && englishViewCard(card)?.original ? "original" : "grid");
    const chineseCard = card ? getChineseCard(String(card.set_id), card.card_key) : undefined;
    if (chineseCard)
        return <span className={className} style={{ display: "block", position: className.includes("absolute") ? "absolute" : "relative" }}><ChineseISOImage card={chineseCard}/></span>;
    if (failed) {
        return (<div role="img" aria-label={`${alt} image coming soon`} className={`${className} aspect-[5/7] min-h-0 w-full flex items-center justify-center bg-zinc-300 grayscale dark:bg-zinc-700`}>
        <span className="rounded-lg bg-zinc-800/80 px-2 py-1 text-center text-[10px] font-black tracking-wider text-white sm:text-xs">
          COMING SOON
        </span>
      </div>);
    }
    return (<CardImage publicProfile draggable={false} imageSize={resolvedImageSize} src={src} alt={alt} className={className} style={card ? englishViewStyle(card) : { backgroundColor: "transparent", backgroundImage: "none" }} onError={() => setFailed(true)}/>);
};
interface ExploreProfileProps {
    user: any;
    tradingProfile: any;
    onClose: () => void;
    lightMode?: boolean;
}
function useEnglishProfileActivation(profileId?: string) {
    const [snapshot, setSnapshot] = useState<{ owner: string; ready: boolean; enabled: boolean; error: string }>({ owner: "", ready: false, enabled: false, error: "" });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        let request = 0;
        const load = async () => {
            const ticket = ++request;
            if (!profileId) return;
            setSnapshot({ owner: profileId, ready: false, enabled: false, error: "" });
            try {
                const { data, error } = await supabase.from("profiles").select("english_cards_enabled").eq("id", profileId).single();
                if (!active || ticket !== request) return;
                if (error) throw error;
                if (!data) throw new Error("Profile not found");
                setSnapshot({ owner: profileId, ready: true, enabled: data.english_cards_enabled !== false, error: "" });
            } catch (cause) {
                if (!active || ticket !== request) return;
                const code = (cause as { code?: string } | null)?.code;
                setSnapshot({ owner: profileId, ready: true, enabled: false, error: code === "42703" || code === "PGRST204" ? "Run the English activation setup SQL, then retry." : "Card preferences could not be loaded. Please retry." });
            }
        };
        const changed = (event: Event) => {
            const detail = (event as CustomEvent<{ userId?: string }>).detail;
            if (detail?.userId === profileId) void load();
        };
        void load();
        window.addEventListener("english-card-settings-changed", changed);
        return () => { active = false; request += 1; window.removeEventListener("english-card-settings-changed", changed); };
    }, [profileId, retry]);
    const current = snapshot.owner === profileId;
    return { ready: current && snapshot.ready, enabled: current && snapshot.ready && snapshot.enabled, error: current ? snapshot.error : "", refresh: () => setRetry(value => value + 1) };
}
const ExploreProfile = ({ user, tradingProfile, onClose, lightMode, }: ExploreProfileProps) => {
    const chineseProfile = usePublicChineseProfile(user?.id);
    const [cardLanguage, setCardLanguage] = useState<ProfileCardLanguage>("english");
    const englishProfile = useEnglishProfileActivation(user?.id);
    const englishEnabled = englishProfile.enabled;
    const cardLanguagesReady = englishProfile.ready && chineseProfile.ready;
    const hasActiveCards = englishEnabled || chineseProfile.enabled;
    const showChineseCards = chineseProfile.enabled && (!englishEnabled || cardLanguage === "chinese");
    useEffect(() => { setCardLanguage("english"); setQuickViewCard(null); setOfferTarget(null); setInventoryLoaded(false); setInventoryCards([]); }, [user?.id]);
    useEffect(() => {
        if (chineseProfile.ready && !chineseProfile.enabled) {
            setQuickViewCard((card: any) => card && isChineseSetId(card.set_id) ? null : card);
            setOfferTarget((card: any) => card && isChineseSetId(card.set_id) ? null : card);
        }
    }, [chineseProfile.ready, chineseProfile.enabled]);
    useEffect(() => {
        if (!englishProfile.ready || englishEnabled) return;
        setQuickViewCard((card: any) => card && !isChineseSetId(card.set_id) ? null : card);
        setOfferTarget((card: any) => card && !isChineseSetId(card.set_id) ? null : card);
    }, [englishProfile.ready, englishEnabled]);
    const [userStats, setuserStats] = useState({
        trades: 0,
        owned: 0,
        completed: 0,
    });
    const { wishlistCards: allUserWishlistCards, tradeCards } = usePublicProfileCards(englishEnabled ? user?.id : undefined);
    const userWishlistCards = allUserWishlistCards.filter((card: any) => !isChineseSetId(card.set_id));
    const [userIsoCards, setUserIsoCards] = useState<any[]>([]);
    const userTradeCards = tradeCards.filter((x: any) => (x.listing_type || "trade") === "trade" && !isChineseSetId(x.set_id));
    const [saleListings, setSaleListings] = useState<any[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [userProfileSettings, setuserProfileSettings] = useState({
        hide_iso: false,
        hide_wishlist: false,
        hidden_iso_sets: [] as string[],
    });
    const [userTab, setuserTab] = useState<"trades" | "purchases" | "iso" | "wishlist">("trades");
    const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});
    const [selectedSet, setSelectedSet] = useState("");
    const [selectedSection, setSelectedSection] = useState<"iso" | "trade" | "wishlist">("iso");
    const [quickViewCard, setQuickViewCard] = useState<any>(null);
    const [copiedCardCode, setCopiedCardCode] = useState(false);
    useEffect(() => { setCopiedCardCode(false); }, [quickViewCard?.set_id, quickViewCard?.card_key]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [notAcceptingRequests, setNotAcceptingRequests] = useState(false);
    const [alreadyFriends, setAlreadyFriends] = useState(false);
    const [copied, setCopied] = useState(false);
    const [discordUsername, setDiscordUsername] = useState("");
    const [currentUserContact, setCurrentUserContact] = useState("");
    const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
    const [copiedDiscord, setCopiedDiscord] = useState(false);
    const [offerStates, setOfferStates] = useState<Record<string, OfferState>>({});
    const [activeOfferCount, setActiveOfferCount] = useState(0);
    const [offerTarget, setOfferTarget] = useState<any>(null);
    const [inventoryCards, setInventoryCards] = useState<InventoryCard[]>([]);
    const [inventoryLoaded, setInventoryLoaded] = useState(false);
    const [selectedOfferCards, setSelectedOfferCards] = useState<InventoryCard[]>([]);
    const offerHasMerchandise = isMerchandise(offerTarget) || inventoryCards.some(isMerchandise);
    const [offerContact, setOfferContact] = useState("");
    const [offerSet, setOfferSet] = useState("");
    const [offerRarity, setOfferRarity] = useState("ALL");
    const [offerStep, setOfferStep] = useState<"compose" | "review" | "sent">("compose");
    const [offerError, setOfferError] = useState("");
    const [isSendingOffer, setIsSendingOffer] = useState(false);
    const [documentIsLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
    const isLightMode = lightMode ?? documentIsLightMode;
    const navigate = useNavigate();
    const { avatar, verification: badge } = getProfileAssets(user);
    useEffect(() => {
        if (!user?.id)
            return;
        setProfileLoading(true);
        async function loadProfile() {
            const { data: { session }, } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || "");
            if (session?.user) {
                const [contactResult, offersResult] = await Promise.all([
                    supabase
                        .from("trading_profiles")
                        .select("discord_username")
                        .eq("user_id", session.user.id)
                        .maybeSingle(),
                    supabase
                        .from("trade_offers")
                        .select("recipient_id, target_set_id, target_card_key, status, expires_at, created_at, attempt_number")
                        .eq("sender_id", session.user.id)
                        .eq("recipient_id", user.id),
                ]);
                setCurrentUserContact(contactResult.data?.discord_username?.trim() || "");
                const offerRows = offersResult.data || [];
                setOfferStates(buildOfferState(offerRows));
                setActiveOfferCount(offerRows.filter((offer: any) => offer.status === "pending" &&
                    new Date(offer.expires_at).getTime() > Date.now()).length);
            }
            else {
                setCurrentUserContact("");
                setOfferStates({});
                setActiveOfferCount(0);
            }
            if (session?.user && session.user.id !== user.id) {
                const { data: friendship } = await supabase
                    .from("friends")
                    .select("id")
                    .eq("user_id", session.user.id)
                    .eq("friend_id", user.id)
                    .maybeSingle();
                setAlreadyFriends(!!friendship);
            }
            if (session?.user && session.user.id !== user.id) {
                const { data: existingRequest } = await supabase
                    .from("friend_requests")
                    .select("id")
                    .eq("sender_id", session.user.id)
                    .eq("receiver_id", user.id)
                    .eq("status", "pending")
                    .maybeSingle();
                setRequestPending(!!existingRequest);
            }
            const { data: tradingProfileData } = await supabase
                .from("trading_profiles")
                .select("discord_username")
                .eq("user_id", user.id)
                .maybeSingle();
            setDiscordUsername(tradingProfileData?.discord_username || "");
            const { data: saleRows, error: salesError } = await supabase
                .from("card_market_listings")
                .select("user_id, set_id, card_key, is_for_sale, asking_price, sale_quantity")
                .eq("user_id", user.id);
            if (salesError)
                console.error("Failed to load sale listings:", salesError);
            setSaleListings((saleRows || [])
                .filter((row: any) => Boolean(row.is_for_sale) && !isChineseSetId(row.set_id))
                .map((row: any) => ({
                ...row,
                id: `${row.user_id}-${row.set_id}-${row.card_key}-sale`,
                type: "sale",
            })));
            setSalesLoading(false);
            const { data: activityData } = await supabase
                .from("user_activity")
                .select("last_activity_at")
                .eq("user_id", user.id)
                .maybeSingle();
            setLastActivityAt(activityData?.last_activity_at || null);
            const { data: profileSettings } = await supabase
                .from("profiles")
                .select("hide_iso, hide_wishlist, iso_hidden_sets")
                .eq("id", user.id)
                .single();
            const hiddenIsoSets: string[] = profileSettings?.iso_hidden_sets || [];
            setuserProfileSettings({
                hide_iso: profileSettings?.hide_iso ?? false,
                hide_wishlist: profileSettings?.hide_wishlist ?? false,
                hidden_iso_sets: hiddenIsoSets,
            });
            const { data: wishlistRows } = await supabase
                .from("wishlists")
                .select("card_key")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });
            const wishlistCards = (wishlistRows || []).map((row: any) => {
                const [set_id, card_key] = String(row.card_key).split(":");
                return {
                    id: row.card_key,
                    set_id,
                    card_key,
                };
            });
            if (!(profileSettings?.hide_iso ?? false)) {
                setuserTab("iso");
            }
            else if (!(profileSettings?.hide_wishlist ?? false)) {
                setuserTab("wishlist");
            }
            else {
                setuserTab("trades");
            }
            const { data: isoProgress } = await supabase
                .from("collection_progress_raw")
                .select("set_id, progress")
                .eq("user_id", user.id);
            const { data: isoStatusRows } = await supabase
                .from("iso_status")
                .select("card_key, status")
                .eq("user_id", user.id);
            const isoCards = missingEnglishViewCards(isoProgress || [], isoStatusRows || [], hiddenIsoSets).map(card => ({ id: card.identity, set_id: card.setId, card_key: card.key }));
            setUserIsoCards(isoCards);
            const { data: collection } = await supabase
                .from("collection_progress_raw")
                .select("set_id, progress")
                .eq("user_id", user.id);
            const owned = ownedEnglishViewCards(collection || []).length;
            const completed = masteredEnglishViewSets(collection || []);
            setuserStats({
                trades: (tradeCards || []).filter((card: any) => !isChineseSetId(card.set_id)).length,
                owned,
                completed,
            });
        }
        loadProfile().finally(() => setProfileLoading(false));
    }, [user?.id]);
    useEffect(() => {
        if (!offerTarget)
            return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (!isSendingOffer) {
                    setOfferTarget(null);
                    setQuickViewCard(null);
                }
            }
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [quickViewCard, offerTarget, isSendingOffer]);
    async function sendFriendRequest() {
        if (!currentUserId)
            return;
        if (currentUserId === user.id)
            return;
        setSendingRequest(true);
        const { data: profile } = await supabase
            .from("profiles")
            .select("allow_friend_requests")
            .eq("id", user.id)
            .single();
        if (profile && !profile.allow_friend_requests) {
            setNotAcceptingRequests(true);
            setSendingRequest(false);
            return;
        }
        const { error } = await supabase.from("friend_requests").insert({
            sender_id: currentUserId,
            receiver_id: user.id,
            status: "pending",
        });
        if (!error) {
            setRequestPending(true);
        }
        setSendingRequest(false);
    }
    function getOfferAction(card: any) {
        const key = offerKeyFor(user.id, card.set_id, card.card_key);
        const state = offerStates[key];
        if (state?.attempts >= 2) {
            return { enabled: false, label: "No offers left" };
        }
        if (state?.attempts === 1 && state.latestStatus === "declined") {
            if (activeOfferCount >= 2) {
                return { enabled: false, label: "2 active offers sent" };
            }
            return { enabled: true, label: "1 try left. Offer again?" };
        }
        if (state) {
            return { enabled: false, label: "Offer already sent" };
        }
        if (activeOfferCount >= 2) {
            return { enabled: false, label: "2 active offers sent" };
        }
        return { enabled: true, label: "Make an offer" };
    }
    async function openOfferComposer(card: any) {
        if (!currentUserId || currentUserId === user.id || card.type !== "trade")
            return;
        if (!getOfferAction(card).enabled)
            return;
        setOfferTarget(card);
        setQuickViewCard(null);
        setSelectedOfferCards([]);
        setOfferRarity("ALL");
        setOfferStep("compose");
        setOfferError("");
        setOfferContact(currentUserContact);
        if (inventoryLoaded)
            return;
        const { data, error } = await supabase
            .from("collection_progress_raw")
            .select("set_id, progress")
            .eq("user_id", currentUserId);
        if (error) {
            console.error("Unable to load offer inventory:", error);
            setOfferError("Your inventory could not be loaded. Please try again.");
            return;
        }
        const { data: viewerSettings, error: viewerSettingsError } = await supabase.from("profiles").select("chinese_cards_enabled, english_cards_enabled").eq("id", currentUserId).maybeSingle();
        const viewerEnglishEnabled = !viewerSettingsError && !!viewerSettings && viewerSettings.english_cards_enabled !== false;
        const viewerChineseEnabled = !viewerSettingsError && viewerSettings?.chinese_cards_enabled === true;
        const ownedCards = (data || []).flatMap((row: any) => ((viewerEnglishEnabled && OFFER_SET_ORDER.includes(getOfferCollectionSet(String(row.set_id)))) || (viewerChineseEnabled && chineseSets.some(set => set.id === String(row.set_id))))
            ? Object.entries(row.progress || {})
                .filter(([key, value]) => {
                if (isChineseSetId(row.set_id) ? !getChineseCard(String(row.set_id), key) : !englishViewEligible({ set_id: row.set_id, card_key: key }))
                    return false;
                if (value === true)
                    return true;
                return Boolean(value &&
                    typeof value === "object" &&
                    (value as {
                        owned?: boolean;
                    }).owned);
            })
                .map(([cardKey]) => ({
                id: [row.set_id, cardKey].join("-"),
                set_id: String(row.set_id),
                card_key: cardKey,
            }))
            : []);
        const seenInventory = new Set<string>();
        const uniqueOwnedCards = ownedCards.filter((card: InventoryCard) => {
            const resolved = englishViewCard(card);
            const identity = resolved?.identity ?? `${card.set_id}:${card.card_key}`;
            if (seenInventory.has(identity))
                return false;
            seenInventory.add(identity);
            return true;
        });
        uniqueOwnedCards.sort((a: InventoryCard, b: InventoryCard) => allOfferSetOrder.indexOf(getOfferCollectionSet(a.set_id)) - allOfferSetOrder.indexOf(getOfferCollectionSet(b.set_id)) ||
            a.card_key.localeCompare(b.card_key, undefined, { numeric: true }));
        setInventoryCards(uniqueOwnedCards);
        setOfferSet(getOfferCollectionSet(uniqueOwnedCards[0]?.set_id || ""));
        setInventoryLoaded(true);
    }
    function toggleOfferCard(card: InventoryCard) {
        setOfferError("");
        setSelectedOfferCards((current) => {
            if (current.some((selected) => selected.id === card.id)) {
                return current.filter((selected) => selected.id !== card.id);
            }
            if (current.length >= 10) {
                setOfferError("You can include a maximum of 10 cards.");
                return current;
            }
            return [...current, card];
        });
    }
    function reviewOffer() {
        const discordUsername = offerContact.trim();
        if (selectedOfferCards.length === 0) {
            setOfferError(offerHasMerchandise ? "Choose at least one item from your inventory." : "Choose at least one card from your inventory.");
            return;
        }
        if (!discordUsername) {
            setOfferError("Enter your Discord username to send an offer.");
            return;
        }
        if (discordUsername.length > 100) {
            setOfferError("Your Discord username must be 100 characters or fewer.");
            return;
        }
        setOfferError("");
        setOfferStep("review");
    }
    async function submitOffer() {
        if (!offerTarget || !currentUserId || isSendingOffer)
            return;
        const contact = offerContact.trim();
        if (selectedOfferCards.length === 0) {
            setOfferError(offerHasMerchandise ? "Choose at least one item from your inventory." : "Choose at least one card from your inventory.");
            return;
        }
        if (!contact) {
            setOfferError("Enter your Discord username to send an offer.");
            return;
        }
        if (contact.length > 100) {
            setOfferError("Your Discord username must be 100 characters or fewer.");
            return;
        }
        setIsSendingOffer(true);
        setOfferError("");
        const targetSetId = canonicalOfferSetId(offerTarget.set_id);
        const offerKey = offerKeyFor(user.id, targetSetId, offerTarget.card_key);
        const { error } = await supabase.from("trade_offers").insert({
            sender_id: currentUserId,
            recipient_id: user.id,
            target_set_id: targetSetId,
            target_card_key: offerTarget.card_key,
            offered_cards: selectedOfferCards.map((card) => ({
                set_id: card.set_id,
                card_key: card.card_key,
            })),
            contact,
        });
        if (error) {
            console.error("Unable to send trade offer:", error);
            setOfferError(error.message?.includes("offer_recipient_active_limit")
                ? "You already have 2 active offers sent to this user."
                : error.message?.includes("offer_attempt_limit_reached")
                    ? isMerchandise(offerTarget) ? "You have used both offers for this item." : "You have used both offers for this card."
                    : error.message?.includes("offer_retry_requires_decline") ||
                        error.code === "23505"
                        ? "You can only offer again after the first offer is declined."
                        : error.code === "42501"
                            ? isMerchandise(offerTarget) ? "This item is no longer available for trade." : "This card is no longer available for trade."
                            : "Your offer could not be sent. Please try again.");
            setOfferStep("compose");
            setIsSendingOffer(false);
            return;
        }
        const previousAttempts = offerStates[offerKey]?.attempts || 0;
        const createdAt = new Date().toISOString();
        setOfferStates((current) => ({
            ...current,
            [offerKey]: {
                attempts: previousAttempts + 1,
                latestStatus: "pending",
                latestCreatedAt: createdAt,
                latestExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        }));
        setActiveOfferCount((current) => current + 1);
        setOfferStep("sent");
        setIsSendingOffer(false);
    }
    function isMoon3DoubleWide(card: any) {
        if (!card)
            return false;
        const chinese = getChineseCard(String(card.set_id), card.card_key);
        if (chinese)
            return isWideChineseCard(chinese);
        return englishViewWide(card);
    }
    function getSetName(setId: string) {
        return chineseSets.find(set => set.id === String(setId))?.name ?? englishViewName(setId);
    }
    const visibleIsoCards = userIsoCards.filter((card) => {
        const setId = String(card.set_id);
        const hidden = userProfileSettings.hidden_iso_sets;
        if (hidden.includes(setId) || isProfileMerchandiseHidden(card, hidden)) {
            return false;
        }
        if (setId === "FW" && hidden.includes("FW")) {
            return false;
        }
        if (setId === "12" && hidden.includes("12")) {
            return false;
        }
        if (setId === "tcgpromos" && hidden.includes("TCG_PROMOS")) {
            return false;
        }
        if (setId === "SD" &&
            (hidden.includes("SD") ||
                hidden.includes("SD_STARTERS") ||
                hidden.includes("SD_BONUS"))) {
            return false;
        }
        return true;
    });
    const activeProfileSettings = showChineseCards ? { hide_iso: chineseProfile.data.settings.chinese_hide_iso, hide_wishlist: chineseProfile.data.settings.chinese_hide_wishlist } : userProfileSettings;
    const displayIsoCards = !cardLanguagesReady || !hasActiveCards ? [] : showChineseCards ? chineseProfile.state.missing.map(card => ({ ...card, set_id: card.setId, card_key: card.key })) : visibleIsoCards.filter(englishViewEligible);
    const displayWishlistCards = !cardLanguagesReady || !hasActiveCards ? [] : showChineseCards ? chineseProfile.state.wishlisted.map(card => ({ ...card, set_id: card.setId, card_key: card.key })) : userWishlistCards.filter(englishViewEligible);
    const ISO_SET_TABS = Array.from(new Set(displayIsoCards.map((card) => profileViewGroup(card)))).map((setId) => ({
        id: setId,
        name: getSetName(setId),
    }));
    const filteredIsoCards = displayIsoCards.filter((card) => profileViewGroup(card) === selectedSet);
    const allTradeCards = !cardLanguagesReady || !hasActiveCards ? [] : showChineseCards ? [...chineseProfile.trades, ...chineseProfile.sales] : [
        ...userTradeCards.map((card: any) => ({
            ...card,
            type: "trade",
        })),
        ...saleListings,
    ].filter(englishViewEligible);
    const TRADE_SET_TABS = Array.from(new Set(allTradeCards.map((card) => profileViewGroup(card)))).map((setId) => ({
        id: setId,
        name: getSetName(setId),
    }));
    const WISHLIST_SET_TABS = Array.from(new Set(displayWishlistCards.map((card) => profileViewGroup(card)))).map((setId) => ({
        id: setId,
        name: getSetName(setId),
    }));
    useEffect(() => {
        let tabs: {
            id: string;
        }[] = [];
        if (selectedSection === "iso") {
            tabs = ISO_SET_TABS;
        }
        else if (selectedSection === "trade") {
            tabs = TRADE_SET_TABS;
        }
        else {
            tabs = WISHLIST_SET_TABS;
        }
        if (tabs.length === 0) {
            setSelectedSet("");
            return;
        }
        if (!tabs.some((x) => x.id === selectedSet)) {
            setSelectedSet(tabs[0].id);
        }
    }, [
        selectedSection,
        selectedSet,
        ISO_SET_TABS,
        TRADE_SET_TABS,
        WISHLIST_SET_TABS,
    ]);
    const profileSetOrder = showChineseCards ? chineseSets.map(set => set.id) : [...englishViewSetOrder(), "friendshipsbegin"];
    const sectionCards = selectedSection === "iso" ? displayIsoCards : selectedSection === "trade" ? allTradeCards : displayWishlistCards;
    const selectedSetIsMerchandise = sectionCards.some(card => profileViewGroup(card) === selectedSet && isMerchandise(card));
    const sectionHidden = selectedSection === "iso" ? activeProfileSettings.hide_iso : selectedSection === "wishlist" ? activeProfileSettings.hide_wishlist : false;
    const sectionError = showChineseCards ? selectedSection === "trade" ? chineseProfile.marketError : chineseProfile.cardsError : "";
    const sectionTabs = (sectionHidden ? [] : selectedSection === "iso" ? ISO_SET_TABS : selectedSection === "trade" ? TRADE_SET_TABS : WISHLIST_SET_TABS).slice().sort((a, b) => {
        const rank = (id: string) => { const index = profileSetOrder.indexOf(id); return index < 0 ? profileSetOrder.length : index; };
        return rank(a.id) - rank(b.id);
    });
    const sectionCounts = new Map<string, number>();
    if (!sectionHidden)
        for (const card of sectionCards) {
            const id = profileViewGroup(card);
            sectionCounts.set(id, (sectionCounts.get(id) || 0) + 1);
        }
    function getOfferRarity(card: InventoryCard) {
        return getChineseCard(String(card.set_id), card.card_key)?.rarity ?? englishViewRarity(card);
    }
    function getOfferRarityRank(setId: string, rarity: string) {
        const chineseSet = chineseSets.find(set => set.id === setId);
        const order = chineseSet ? [...new Set(chineseSet.cards.map(card => card.rarity))] : englishViewRarityOrder(setId);
        const rank = order.indexOf(rarity);
        return rank < 0 ? order.length : rank;
    }
    function getOfferRarityLabel(setId: string, rarity: string) {
        if (rarity === "ALL")
            return "All rarities";
        return isChineseSetId(setId) ? chineseRarityLabel(rarity) : englishViewRarityLabel(setId, rarity);
    }
    function sortByIsoOrder(cards: any[]) {
        return [...cards].sort((a, b) => {
            if (!isChineseSetId(a.set_id))
                return compareEnglishViewCards(a, b) || String(a.type ?? "").localeCompare(String(b.type ?? ""));
            const set = chineseSets.find(set => set.id === String(a.set_id));
            return (set?.cards.findIndex(card => card.key === a.card_key) ?? -1) - (set?.cards.findIndex(card => card.key === b.card_key) ?? -1) || String(a.type ?? "").localeCompare(String(b.type ?? ""));
        });
    }
    const filteredTradeCards = sortByIsoOrder(allTradeCards.filter((card) => profileViewGroup(card) === selectedSet));
    const filteredWishlistCards = sortByIsoOrder(displayWishlistCards.filter((card) => profileViewGroup(card) === selectedSet));
    const offerSetOptions = allOfferSetOrder.filter((setId) => inventoryCards.some((card) => getOfferCollectionSet(card.set_id) === setId));
    const currentOfferSetIndex = Math.max(0, offerSetOptions.indexOf(offerSet));
    function changeOfferSet(direction: -1 | 1) {
        const nextSet = offerSetOptions[currentOfferSetIndex + direction];
        if (!nextSet)
            return;
        setOfferSet(nextSet);
        setOfferRarity("ALL");
    }
    const offerRarityOptions = Array.from(new Set(inventoryCards
        .filter((card) => getOfferCollectionSet(card.set_id) === offerSet)
        .map((card) => getOfferRarity(card)))).sort((a, b) => getOfferRarityRank(offerSet, a) - getOfferRarityRank(offerSet, b) ||
        a.localeCompare(b));
    const visibleOfferInventory = inventoryCards
        .filter((card) => {
        return (getOfferCollectionSet(card.set_id) === offerSet &&
            (offerRarity === "ALL" || getOfferRarity(card) === offerRarity));
    })
        .sort((a, b) => {
        if (offerRarity === "ALL") {
            const rarityDifference = getOfferRarityRank(offerSet, getOfferRarity(b)) -
                getOfferRarityRank(offerSet, getOfferRarity(a));
            if (rarityDifference !== 0)
                return rarityDifference;
        }
        if (!isChineseSetId(a.set_id))
            return compareEnglishViewCards(a, b);
        return a.card_key.localeCompare(b.card_key, undefined, {
            numeric: true,
        });
    })
        .slice(0, 150);
    const activityStatus = (() => {
        if (!lastActivityAt) {
            return {
                label: "Inactive",
                lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
                darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
                dotClass: "bg-zinc-400",
            };
        }
        const age = Date.now() - new Date(lastActivityAt).getTime();
        if (age <= 24 * 60 * 60 * 1000) {
            return {
                label: "Active in the last 24 Hours",
                lightClass: "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800",
                darkClass: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
                dotClass: "bg-emerald-500",
            };
        }
        if (age <= 7 * 24 * 60 * 60 * 1000) {
            return {
                label: "Active in the last 7 Days",
                lightClass: "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]",
                darkClass: "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]",
                dotClass: "bg-[#FFD54A]",
            };
        }
        return {
            label: "Inactive",
            lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
            darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
            dotClass: "bg-zinc-400",
        };
    })();
    useEffect(() => {
        const syncTheme = () => {
            setIsLightMode(document.documentElement.dataset.theme === "light");
        };
        syncTheme();
        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });
        return () => observer.disconnect();
    }, []);
    const isJacob = user?.id === "94a1c998-d040-4dd2-b2fb-5f606287139d";
    if (profileLoading) {
        return (<div className="flex min-h-[70dvh] w-full items-center justify-center px-4 py-10 [overflow-anchor:none]">
        <div role="status" aria-live="polite" className={`flex max-w-full items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 ${isLightMode ? "text-zinc-800" : "text-white"}`}>
          <div className="relative shrink-0">
            <div className="absolute -inset-1 animate-pulse rounded-[20px] bg-[#FFD54A]/25"/>
            <ProfileAvatar profile={user} src={avatar} alt={user?.username || "User"} className={`relative h-12 w-12 rounded-[17px] border object-cover sm:h-14 sm:w-14 sm:rounded-[19px] ${isLightMode ? "border-black/10" : "border-white/10"}`}/>
          </div>
          <div className="min-w-0">
            <p className="flex min-w-0 flex-wrap items-center text-sm font-semibold sm:text-base">
              <span>Loading&nbsp;</span>
              <span className="max-w-[180px] truncate sm:max-w-[280px]">
                {user?.username || "user"}'s
              </span>
              <span>&nbsp;data</span>
              <span className="ml-0.5 inline-flex items-end gap-0.5" aria-hidden="true">
                <span className="animate-bounce [animation-delay:-0.3s]">
                  .
                </span>
                <span className="animate-bounce [animation-delay:-0.15s]">
                  .
                </span>
                <span className="animate-bounce">.</span>
              </span>
            </p>
            <p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              Gathering their collection details
            </p>
          </div>
        </div>
      </div>);
    }
    return (<div className={`w-full transition-colors duration-200 [overflow-anchor:none] ${isLightMode ? "text-zinc-900" : "text-white"}`}>
      <style>{`.ep-avatar-space{display:flex;align-items:center;justify-content:center;flex-shrink:0}.ep-profile-identity:has([data-avatar-frame="frame013"]){display:flex;align-items:center}.ep-avatar-space:has(>[data-avatar-frame="frame013"]){padding:42px 34px 30px}@media(max-width:639px){.ep-profile-identity:has([data-avatar-frame="frame013"]){flex-direction:column;align-items:stretch;gap:4px}.ep-avatar-space:has(>[data-avatar-frame="frame013"]){align-self:center;padding:36px 34px 26px}}`}</style>
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-cover bg-center ${isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"}`} style={{
            backgroundImage: "url('/website-assets/exploreequestria.webp')",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}/>
        <div className={`absolute inset-0 ${isLightMode
            ? "bg-gradient-to-r from-[#f5f5f3] via-[#f5f5f3]/95 to-[#f5f5f3]/80"
            : "bg-gradient-to-r from-[#0d0f10] via-[#0d0f10]/95 to-[#0d0f10]/80"}`}/>
        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${isLightMode
            ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
            : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/[0.06]"}`}>
              Back
            </button>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode
            ? activityStatus.lightClass
            : activityStatus.darkClass}`}>
              <span className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`}/>
              {activityStatus.label}
            </div>
          </div>
          <div className="ep-profile-identity mt-4 grid grid-cols-[64px_minmax(0,1fr)] items-start gap-3 sm:flex sm:items-center sm:gap-4">
            <div className="ep-avatar-space"><ProfileAvatar profile={user} src={avatar} alt={user?.username} className={`h-16 w-16 shrink-0 rounded-2xl border object-cover sm:h-20 sm:w-20 ${isLightMode ? "border-black/10" : "border-white/10"}`}/></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                  {user?.username}
                </h1>
                {badge && (<CardImage src={badge.badge} alt={badge.label} title={badge.label} className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"/>)}
              </div>
              {discordUsername && (<div className={`mt-1 text-xs sm:mt-2 sm:text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  Discord:{" "}
                  <span className={isLightMode
                ? "font-medium text-[#725700]"
                : "font-medium text-[#FFE27A]"}>
                    {discordUsername}
                  </span>
                </div>)}
              <div className="mt-3 flex flex-wrap gap-2">
                {currentUserId !== user.id && (<button type="button" onClick={() => {
                if (alreadyFriends) {
                    navigate("/inbox");
                    return;
                }
                if (!requestPending && !notAcceptingRequests) {
                    sendFriendRequest();
                }
            }} disabled={sendingRequest ||
                (requestPending && !alreadyFriends) ||
                notAcceptingRequests} className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${alreadyFriends
                ? isLightMode
                    ? "bg-[#c89d13]/15 text-[#725700]"
                    : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : notAcceptingRequests
                    ? isLightMode
                        ? "cursor-not-allowed bg-red-700/[0.06] text-red-700"
                        : "cursor-not-allowed bg-red-500/[0.08] text-red-400"
                    : requestPending
                        ? isLightMode
                            ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                            : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                        : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"}`}>
                    {alreadyFriends
                ? "Manage Friendship"
                : notAcceptingRequests
                    ? "Requests Disabled"
                    : requestPending
                        ? "Request Pending"
                        : sendingRequest
                            ? "Sending..."
                            : "Add Friend"}
                  </button>)}
                <button type="button" onClick={() => {
            const url = `https://www.mlpekayou.community/${encodeURIComponent(user?.username ?? "")}`;
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
        }} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${isLightMode
            ? "border-black/10 bg-white/70 text-zinc-700 hover:bg-zinc-100"
            : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"}`}>
                  {copied ? "Link Copied" : "Share Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      <div className={`relative mx-4 grid grid-cols-3 gap-3 border-t py-3 sm:mx-5 ${isLightMode ? "border-black/10" : "border-white/[0.08]"}`}>
        {[
            ["Cards Owned", !cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.data.settings.chinese_hide_iso || chineseProfile.cardsError ? "--" : chineseProfile.ownedCount.toLocaleString() : userStats.owned.toLocaleString()],
            ["Sets Completed", !cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.data.settings.chinese_hide_iso || chineseProfile.cardsError ? "--" : chineseProfile.completedCount : userStats.completed],
            ["Listings", !cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.marketError ? "--" : chineseProfile.trades.length + chineseProfile.sales.length : userStats.trades],
        ].map(([label, value]) => (<div key={label} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <div className={`text-xs font-medium ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              {label}
            </div>
            <div className="text-lg font-semibold sm:text-xl">
              {value}
            </div>
          </div>))}
      </div>
      </section>
      <section className="mt-4 flex flex-col [overflow-anchor:none]">
        {!cardLanguagesReady ? <p role="status" className="px-3 py-6 text-sm text-muted-foreground">Loading card preferences...</p> : englishProfile.error ? <p role="alert" className="px-3 py-6 text-sm text-muted-foreground">{englishProfile.error}<button type="button" onClick={englishProfile.refresh} className="ml-2 underline">Retry</button></p> : !hasActiveCards ? <p className="px-3 py-6 text-sm text-muted-foreground">This collector has deactivated English and Chinese cards.</p> : <>
        <ProfileCardLanguageSwitch enabled={englishEnabled && chineseProfile.enabled} value={showChineseCards ? "chinese" : "english"} onChange={value => { setCardLanguage(value); setSelectedSet(""); setQuickViewCard(null); }}/>
          {!(englishEnabled && chineseProfile.enabled) && <p className="border-b border-border px-3 py-3 text-sm font-semibold">{showChineseCards ? "Chinese cards" : "English cards"}</p>}
        <div className={`grid grid-cols-3 border-b ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
          {[
            ["iso", "ISO"],
            ["trade", "Trades"],
            ["wishlist", "Wishlist"],
        ].map(([key, label]) => (<button key={key} type="button" onClick={() => {
                setSelectedSection(key as "iso" | "trade" | "wishlist");
                setSelectedSet("");
            }} className={`px-3 py-3.5 text-sm font-semibold transition-colors ${selectedSection === key
                ? isLightMode
                    ? "bg-[#c89d13]/10 text-[#725700]"
                    : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : isLightMode
                    ? "text-zinc-500 hover:bg-zinc-50"
                    : "text-zinc-500 hover:bg-white/[0.04]"}`}>
              {label}
            </button>))}
        </div>
        <div className="grid min-h-0 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside aria-label="Collection sets" className={`hidden max-h-[620px] overflow-y-auto border-r p-3 lg:block ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
            <p className={`mb-3 px-2 text-xs font-semibold uppercase tracking-wide ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>Sets</p>
            <div className="space-y-1">
              {sectionTabs.map(set => (<button key={set.id} type="button" onClick={() => setSelectedSet(set.id)} aria-pressed={selectedSet === set.id} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${selectedSet === set.id ? isLightMode ? "bg-[#c89d13]/15 font-semibold text-[#725700]" : "bg-[#FFD54A]/10 font-semibold text-[#FFE27A]" : isLightMode ? "text-zinc-600 hover:bg-zinc-100" : "text-zinc-400 hover:bg-white/[0.05]"}`}>
                  <span>{set.name}</span>
                  <span className="shrink-0 text-xs tabular-nums opacity-70">{sectionCounts.get(set.id) || 0}</span>
                </button>))}
              {sectionTabs.length === 0 && <p className="px-2 text-sm text-zinc-500">No sets to show.</p>}
            </div>
          </aside>
          <div className="min-w-0 lg:max-h-[620px] lg:overflow-y-auto lg:overscroll-contain [overflow-anchor:none]">
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-3 py-3 sm:px-5 lg:sticky lg:top-0 lg:z-10 ${isLightMode ? "border-black/[0.08] bg-[#f5f5f3]" : "border-white/[0.07] bg-[#0d0f10]"}`}>
              <div className="min-w-0">
                <h2 className="text-base font-semibold">{sectionHidden ? selectedSection === "iso" ? "ISO hidden" : "Wishlist hidden" : selectedSet ? getSetName(selectedSet) : "Collection"}</h2>
                {!sectionHidden && <p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{sectionCounts.get(selectedSet) || 0} {selectedSection === "trade" ? "listings" : selectedSetIsMerchandise ? "items" : "cards"}</p>}
              </div>
              {sectionTabs.length > 0 && <select aria-label="Choose a set" value={selectedSet} onChange={event => setSelectedSet(event.target.value)} className={`max-w-full rounded-xl border px-3 py-2 text-base lg:hidden ${isLightMode ? "border-black/10 bg-zinc-50 text-zinc-700" : "border-white/10 bg-[#202223] text-zinc-200"}`}>
                {!selectedSet && <option value="">Choose a set</option>}
                {sectionTabs.map(set => <option key={set.id} value={set.id}>{set.name} ({sectionCounts.get(set.id) || 0})</option>)}
              </select>}
            </div>
          {sectionError ? <div role="alert" className="p-10 text-center text-sm text-zinc-500">{sectionError}<button type="button" onClick={chineseProfile.refresh} className="ml-2 underline">Retry</button></div> : selectedSection === "iso" ? (activeProfileSettings.hide_iso ? (<div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                This Superfan has hidden their ISO.
              </div>) : (<>
                <div key={JSON.stringify([user?.id, showChineseCards ? "chinese" : "english", "iso", selectedSet])} className="p-3 sm:p-5" style={{ isolation: "isolate", contain: "paint" }}>
                  {filteredIsoCards.length === 0 ? (<div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                      No cards to show.
                    </div>) : (<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 lg:grid-cols-[repeat(auto-fill,minmax(86px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(96px,1fr))]">
                      {filteredIsoCards.map((card) => (<button key={getProfileCardIdentity(card)} type="button" onClick={() => setQuickViewCard(card)} style={{ isolation: "isolate", contain: "paint", clipPath: "inset(0 round 10px)" }} className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${profileViewSquare(card) ? "aspect-square" : isMoon3DoubleWide(card) ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"}`}>
                          <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card)}/>
                        </button>))}
                    </div>)}
                </div>
              </>)) : selectedSection === "trade" ? (<>
              <div key={JSON.stringify([user?.id, showChineseCards ? "chinese" : "english", "trade", selectedSet])} className="p-3 sm:p-5" style={{ isolation: "isolate", contain: "paint" }}>
                {(!showChineseCards && salesLoading) ? (<div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                    Loading listings...
                  </div>) : filteredTradeCards.length === 0 ? (<div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                    No listings to show.
                  </div>) : (<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 lg:grid-cols-[repeat(auto-fill,minmax(86px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(96px,1fr))]">
                    {filteredTradeCards.map((card: any) => (<button key={JSON.stringify([getProfileCardIdentity(card), card.type])} type="button" onClick={() => setQuickViewCard(card)} style={{ isolation: "isolate", contain: "paint", clipPath: "inset(0 round 10px)" }} className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${profileViewSquare(card) ? "aspect-square" : isMoon3DoubleWide(card) ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"}`}>
                        <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card)}/>
                        <span className={`absolute bottom-1 left-1 right-1 truncate rounded px-1 py-0.5 text-[9px] font-semibold sm:text-[10px] ${isLightMode
                        ? "bg-white/90 text-zinc-700"
                        : "bg-black/70 text-white"}`}>
                          {card.type === "sale"
                        ? `For Sale - $${Number(card.asking_price || 0).toFixed(2)}`
                        : "Trade"}
                        </span>
                      </button>))}
                  </div>)}
              </div>
            </>) : activeProfileSettings.hide_wishlist ? (<div className={`p-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
              This Superfan has hidden their wishlist.
            </div>) : (<>
              <div key={JSON.stringify([user?.id, showChineseCards ? "chinese" : "english", "wishlist", selectedSet])} className="p-3 sm:p-5" style={{ isolation: "isolate", contain: "paint" }}>
                {filteredWishlistCards.length === 0 ? (<div className={`py-10 text-center text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
                    No wishlist cards to show.
                  </div>) : (<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 lg:grid-cols-[repeat(auto-fill,minmax(86px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(96px,1fr))]">
                    {filteredWishlistCards.map((card) => (<button key={getProfileCardIdentity(card)} type="button" onClick={() => setQuickViewCard(card)} style={{ isolation: "isolate", contain: "paint", clipPath: "inset(0 round 10px)" }} className={`relative overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-none ${profileViewSquare(card) ? "aspect-square" : isMoon3DoubleWide(card) ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"}`}>
                        <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card)}/>
                      </button>))}
                  </div>)}
              </div>
            </>)}
        </div>
        </div>
        </>}
      </section>
      <Dialog open={!!quickViewCard} onOpenChange={open => {
            if (!open)
                setQuickViewCard(null);
        }}>
        {quickViewCard && <DialogContent className={`!flex !w-[calc(100%-1.5rem)] !max-w-[760px] max-h-[90dvh] !flex-col !gap-0 overflow-hidden !rounded-xl !p-0 [&>button]:hidden ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#17191a] text-white"}`}>
          <header className={`flex shrink-0 items-start justify-between gap-4 border-b px-4 py-3 sm:px-5 sm:py-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
            <div className="min-w-0"><DialogDescription className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>{getSetName(profileViewGroup(quickViewCard))}</DialogDescription><DialogTitle className="mt-1 break-words text-lg font-semibold leading-tight sm:text-xl">{getProfileCardCode(quickViewCard)}</DialogTitle></div>
            <button type="button" aria-label={isMerchandise(quickViewCard) ? "Close item details" : "Close card details"} onClick={() => setQuickViewCard(null)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-2xl leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${isLightMode ? "text-zinc-500 hover:bg-zinc-100" : "text-zinc-400 hover:bg-white/5"}`}>&times;</button>
          </header>
          <div className="min-h-0 overflow-y-auto overscroll-contain">
            <div className="grid items-start gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,.85fr)] sm:gap-6 sm:p-5">
              <div className={`flex min-w-0 items-center justify-center self-start py-2 sm:py-4 ${isLightMode ? "bg-zinc-100/60" : "bg-black/15"}`}>
                <div className={`relative overflow-hidden rounded-[12px] ${profileViewSquare(quickViewCard) ? "w-full max-w-[300px] aspect-square" : isMoon3DoubleWide(quickViewCard) ? "w-full max-w-[420px] aspect-[10/7]" : "h-[min(34dvh,260px)] aspect-[5/7] sm:h-[340px]"}`} style={{ clipPath: "inset(0 round 12px)" }}>
                  <SafeCardImage imageSize="original" card={quickViewCard} src={getTradeCardImage(quickViewCard)} alt={getProfileCardCode(quickViewCard)} className={`${getCardImageClassName(quickViewCard, "absolute")} rounded-[12px]`}/>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">{isMerchandise(quickViewCard) ? "Item details" : "Card details"}</h2>
                <dl className={`mt-3 divide-y text-sm ${isLightMode ? "divide-black/10" : "divide-white/10"}`}>
                  <div className="flex items-start justify-between gap-4 py-2.5"><dt className="shrink-0 text-zinc-500">Set</dt><dd className="text-right font-medium">{getSetName(profileViewGroup(quickViewCard))}</dd></div>
                  <div className="flex items-start justify-between gap-4 py-2.5"><dt className="shrink-0 text-zinc-500">{isMerchandise(quickViewCard) ? "Edition" : "Rarity"}</dt><dd className="font-medium">{(() => {
                const cn = getChineseCard(String(quickViewCard.set_id), quickViewCard.card_key);
                if (cn)
                    return chineseRarityLabel(cn.rarity);
                return getOfferRarityLabel(String(quickViewCard.set_id), getOfferRarity(quickViewCard));
            })()}</dd></div>
                  <div className="flex items-start justify-between gap-4 py-2.5"><dt className="shrink-0 text-zinc-500">Language</dt><dd className="font-medium">{isChineseSetId(quickViewCard.set_id) ? "Chinese" : "English"}</dd></div>
                  <div className="flex items-start justify-between gap-4 py-2.5"><dt className="shrink-0 text-zinc-500">Status</dt><dd className="text-right font-medium">{quickViewCard.type === "sale" ? "For sale" : quickViewCard.type === "trade" ? "Available for trade" : selectedSection === "wishlist" ? "On their wishlist" : isMerchandise(quickViewCard) ? "Looking for this item" : "Looking for this card"}</dd></div>
                  {quickViewCard.type === "sale" && <><div className="flex items-baseline justify-between gap-4 py-3"><dt className="text-zinc-500">Price</dt><dd className="text-2xl font-semibold tabular-nums text-primary">${Number(quickViewCard.asking_price || 0).toFixed(2)}</dd></div><div className="flex justify-between gap-4 py-2.5"><dt className="text-zinc-500">Available</dt><dd className="font-medium tabular-nums">{quickViewCard.sale_quantity ?? 0}</dd></div></>}
                  {quickViewCard.type === "trade" && quickViewCard.trade_quantity != null && <div className="flex justify-between gap-4 py-2.5"><dt className="text-zinc-500">Available</dt><dd className="font-medium tabular-nums">{quickViewCard.trade_quantity}</dd></div>}
                </dl>
                {(!isMerchandise(quickViewCard) || hasChineseCardCode(getChineseCard(String(quickViewCard.set_id), quickViewCard.card_key))) && <button type="button" onClick={async () => {
                try {
                    await navigator.clipboard.writeText(getProfileCardCode(quickViewCard));
                    setCopiedCardCode(true);
                }
                catch {
                    setCopiedCardCode(false);
                }
            }} className="mt-2 min-h-10 text-sm font-medium text-primary underline-offset-4 hover:underline" aria-live="polite">{copiedCardCode ? "Code copied" : "Copy code"}</button>}
                <div className={`mt-4 border-t pt-4 ${isLightMode ? "border-black/10" : "border-white/10"}`}>
                    {quickViewCard.type === "trade" &&
                currentUserId &&
                currentUserId !== user.id &&
                (() => {
                    const action = getOfferAction(quickViewCard);
                    return (<button type="button" onClick={() => void openOfferComposer(quickViewCard)} disabled={!action.enabled} className="mb-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-500/15 disabled:text-zinc-500">
                            {action.label}
                          </button>);
                })()}
                    <div className="flex items-center gap-3">
                      <ProfileAvatar profile={user} src={avatar} alt={user?.username} className="h-10 w-10 rounded-lg object-cover"/>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">
                          {user?.username}
                        </div>
                        <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                          {quickViewCard.type === "sale" || quickViewCard.type === "trade" ? "Listing owner" : "Collector"}
                        </div>
                      </div>
                    </div>
                    {discordUsername ? (<button type="button" onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(discordUsername);
                        setCopiedDiscord(true);
                        window.setTimeout(() => setCopiedDiscord(false), 2500);
                    }
                    catch {
                        console.error("Could not copy Discord username");
                    }
                }} className={`mt-3 flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium ${isLightMode ? "bg-[#c89d13]/12 text-[#725700] hover:bg-[#c89d13]/20" : "bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/15"}`}>
                        <span>Discord: {discordUsername}</span>
                        <span>{copiedDiscord ? "Copied" : "Copy"}</span>
                      </button>) : (<div className={`mt-3 text-sm ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                        This user has not shared a Discord username.
                      </div>)}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>}
      </Dialog>
      {offerTarget && (<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" onMouseDown={() => !isSendingOffer && setOfferTarget(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="profile-offer-title" onMouseDown={(event) => event.stopPropagation()} className={"flex max-h-[70dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-[18px] border shadow-2xl lg:max-w-5xl " +
                (isLightMode
                    ? "border-black/10 bg-white text-zinc-900"
                    : "border-white/10 bg-[#17191a] text-white")}>
            <div className={"flex items-center justify-between gap-3 border-b p-2.5 sm:p-3 " +
                (isLightMode ? "border-black/10" : "border-white/10")}>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                  {offerStep === "sent" ? "Complete" : "Trade offer"}
                </div>
                <h2 id="profile-offer-title" className="mt-0.5 truncate text-lg font-bold">
                  {offerStep === "compose"
                ? offerHasMerchandise ? "Choose your items" : "Choose your cards"
                : offerStep === "review"
                    ? "Are you sure you want to send this?"
                    : "Offer sent"}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {offerStep === "compose"
                ? offerHasMerchandise ? "Choose up to 10 items. This offer expires after 7 days." : "Choose up to 10 cards. This offer expires after 7 days."
                : offerStep === "review"
                    ? "Review both sides of the trade before confirming."
                    : "The collector will see your offer in their inbox."}
                </p>
              </div>
              <button type="button" onClick={() => setOfferTarget(null)} disabled={isSendingOffer} aria-label="Close offer" className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg " +
                (isLightMode ? "bg-zinc-100" : "bg-white/[0.07]")}>
                &times;
              </button>
            </div>
            {offerStep === "compose" && (<>
                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3 md:overflow-hidden">
                  <div className="grid min-h-0 gap-3 md:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="space-y-2.5">
                      <div className={"rounded-xl border p-2.5 " +
                    (isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.08] bg-white/[0.03]")}>
                        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          You want
                        </div>
                        <div className={`relative mx-auto mt-2 ${profileViewSquare(offerTarget) ? "aspect-square" : "aspect-[5/7]"} w-full max-w-[112px] overflow-hidden rounded-[6px]`}>
                          <SafeCardImage card={offerTarget} src={getTradeCardImage(offerTarget)} alt={getProfileCardCode(offerTarget)} className={getCardImageClassName(offerTarget, "absolute")}/>
                        </div>
                        <div className="mt-1 text-center text-xs text-zinc-500">
                          {getSetName(offerTarget.set_id)}
                        </div>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-sm font-semibold">
                          Discord username{" "}
                          <span className="text-red-500">*</span>
                        </span>
                        <span className="mb-1.5 block text-[11px] leading-snug text-zinc-500">
                          Required so the other collector can contact you about
                          the trade.
                        </span>
                        <input value={offerContact} onChange={(event) => setOfferContact(event.target.value)} maxLength={100} placeholder="Discord username" required autoCapitalize="none" spellCheck={false} className={"w-full rounded-xl border px-3 py-2 text-base outline-none focus:border-[#d5ad24] " +
                    (isLightMode
                        ? "border-black/10 bg-white"
                        : "border-white/10 bg-white/[0.05]")}/>
                      </label>
                    </div>
                    <div className="min-h-0 min-w-0">
                      <div>
                        <div>
                          <h3 className="font-semibold">Your inventory</h3>
                          <p className="text-sm text-zinc-500">
                            {selectedOfferCards.length} of 10 {offerHasMerchandise ? "items" : "cards"} selected
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
                        {offerSetOptions.map((setId) => (<button key={setId} type="button" onClick={() => {
                        setOfferSet(setId);
                        setOfferRarity("ALL");
                    }} className={"shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                        (offerSet === setId
                            ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                            : isLightMode
                                ? "border-black/10 bg-zinc-50 text-zinc-600"
                                : "border-white/10 bg-white/[0.04] text-zinc-400")}>
                            {getSetName(setId)}
                          </button>))}
                      </div>
                      {offerSetOptions.length > 0 && (<div className={"mt-3 hidden grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 rounded-xl border p-1.5 md:grid " +
                        (isLightMode
                            ? "border-black/10 bg-zinc-50"
                            : "border-white/10 bg-white/[0.03]")}>
                          <button type="button" onClick={() => changeOfferSet(-1)} disabled={currentOfferSetIndex === 0} aria-label="Previous set" className={"flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 " +
                        (isLightMode
                            ? "bg-white text-zinc-700 shadow-sm"
                            : "bg-white/[0.07] text-zinc-200")}>
                            &lsaquo;
                          </button>
                          <div className="min-w-0 text-center">
                            <div className="truncate text-sm font-semibold text-[#b88a00] dark:text-[#FFE27A]">
                              {getSetName(offerSet)}
                            </div>
                            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                              Set {currentOfferSetIndex + 1} of{" "}
                              {offerSetOptions.length}
                            </div>
                          </div>
                          <button type="button" onClick={() => changeOfferSet(1)} disabled={currentOfferSetIndex >= offerSetOptions.length - 1} aria-label="Next set" className={"flex h-9 w-9 items-center justify-center rounded-lg text-xl font-bold disabled:opacity-25 " +
                        (isLightMode
                            ? "bg-white text-zinc-700 shadow-sm"
                            : "bg-white/[0.07] text-zinc-200")}>
                            &rsaquo;
                          </button>
                        </div>)}
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {["ALL", ...offerRarityOptions].map((rarity) => (<button key={rarity} type="button" onClick={() => setOfferRarity(rarity)} className={"shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
                        (offerRarity === rarity
                            ? "border-[#FFD54A] bg-[#FFD54A]/15 text-[#b88a00] dark:text-[#FFE27A]"
                            : isLightMode
                                ? "border-black/10 bg-white text-zinc-600"
                                : "border-white/10 bg-white/[0.03] text-zinc-400")}>
                            {getOfferRarityLabel(offerSet, rarity)}
                          </button>))}
                      </div>
                      {!inventoryLoaded ? (<div className="py-16 text-center text-sm text-zinc-500">
                          Loading your inventory...
                        </div>) : visibleOfferInventory.length === 0 ? (<div className={"mt-4 rounded-2xl border p-8 text-center text-sm " +
                        (isLightMode
                            ? "border-black/10 bg-zinc-50 text-zinc-500"
                            : "border-white/[0.08] bg-white/[0.03] text-zinc-400")}>
                          {offerSet === "OTHERMERCH" ? "You do not own any items in this collection and edition." : "You do not own any cards in this set and rarity."}
                        </div>) : (<div className="mt-2.5 grid max-h-[230px] grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
                          {visibleOfferInventory.map((card) => {
                        const selected = selectedOfferCards.some((item) => item.id === card.id);
                        const selectionFull = selectedOfferCards.length >= 10 && !selected;
                        return (<button key={card.id} type="button" onClick={() => toggleOfferCard(card)} disabled={selectionFull} className={"group relative overflow-hidden rounded-[6px] border-0 bg-transparent p-0 text-left transition disabled:opacity-35 " +
                                (selected
                                    ? "ring-2 ring-[#FFD54A] ring-offset-1 ring-offset-transparent"
                                    : isLightMode
                                        ? "hover:ring-2 hover:ring-[#c89d13]/40"
                                        : "hover:ring-2 hover:ring-[#FFD54A]/30")}>
                                <span className={`relative block ${profileViewSquare(card) ? "aspect-square" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                                  <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card, "absolute")}/>
                                </span>
                                {selected && (<span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-black text-zinc-900 shadow-lg">
                                    &#10003;
                                  </span>)}
                              </button>);
                    })}
                        </div>)}
                    </div>
                  </div>
                  {selectedOfferCards.length > 0 && (<div className={"mt-2.5 rounded-xl border p-2 " +
                        (isLightMode
                            ? "border-[#c89d13]/20 bg-[#c89d13]/[0.05]"
                            : "border-[#FFD54A]/15 bg-[#FFD54A]/[0.05]")}>
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        {offerHasMerchandise ? "Items in your offer" : "Cards in your offer"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOfferCards.map((card) => (<button key={card.id} type="button" onClick={() => toggleOfferCard(card)} aria-label={isMerchandise(card) ? "Remove selected item" : "Remove selected card"} className={`relative h-12 ${profileViewSquare(card) ? "aspect-square" : "aspect-[5/7]"} overflow-hidden rounded-[6px] border border-[#FFD54A]/40`}>
                            <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card, "absolute")}/>
                            <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-xs text-white">
                              &times;
                            </span>
                          </button>))}
                      </div>
                    </div>)}
                  {offerError && (<p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>)}
                </div>
                <div className={"grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")}>
                  <button type="button" onClick={() => setOfferTarget(null)} disabled={isSendingOffer} className={"rounded-xl px-4 py-2 text-sm font-semibold " +
                    (isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200")}>
                    Cancel
                  </button>
                  <button type="button" onClick={reviewOffer} disabled={isSendingOffer || !inventoryLoaded} className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50">
                    Review offer
                  </button>
                </div>
              </>)}
            {offerStep === "review" && (<>
                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
                    <div className={"flex flex-col rounded-2xl border p-3 md:min-h-[230px] " +
                    (isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.08] bg-white/[0.03]")}>
                      <div className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You are offering
                      </div>
                      <div className="mt-3 flex flex-1 flex-col items-center justify-center overflow-y-auto">
                        <div className="flex flex-wrap justify-center gap-2">
                          {selectedOfferCards.map((card) => (<div key={card.id} className={`relative h-32 ${profileViewSquare(card) ? "aspect-square" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                              <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card, "absolute")}/>
                            </div>))}
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {selectedOfferCards.length}{" "}
                          {selectedOfferCards.some(isMerchandise) ? selectedOfferCards.length === 1 ? "item" : "items" : selectedOfferCards.length === 1 ? "card" : "cards"}
                        </div>
                      </div>
                    </div>
                    <div className="self-center text-center text-xl font-black text-[#c89d13]">
                      for
                    </div>
                    <div className={"flex flex-col rounded-2xl border p-3 text-center md:min-h-[230px] " +
                    (isLightMode
                        ? "border-black/10 bg-zinc-50"
                        : "border-white/[0.08] bg-white/[0.03]")}>
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        You want
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center">
                        <div className={`relative h-32 ${profileViewSquare(offerTarget) ? "aspect-square" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                          <SafeCardImage card={offerTarget} src={getTradeCardImage(offerTarget)} alt={getProfileCardCode(offerTarget)} className={getCardImageClassName(offerTarget, "absolute")}/>
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {getSetName(offerTarget.set_id)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"mt-4 rounded-xl border px-3 py-2 text-sm " +
                    (isLightMode
                        ? "border-black/10 bg-white"
                        : "border-white/10 bg-white/[0.04]")}>
                    <span className="font-semibold">Discord username:</span>{" "}
                    {offerContact.trim()}
                  </div>
                  {offerError && (<p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
                      {offerError}
                    </p>)}
                </div>
                <div className={"grid grid-cols-2 gap-2 border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")}>
                  <button type="button" onClick={() => setOfferStep("compose")} disabled={isSendingOffer} className={"rounded-xl px-4 py-2 text-sm font-semibold " +
                    (isLightMode
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-white/[0.07] text-zinc-200")}>
                    Back
                  </button>
                  <button type="button" onClick={() => void submitOffer()} disabled={isSendingOffer} className="rounded-xl bg-[#FFD54A] px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50">
                    {isSendingOffer ? "Sending..." : "Confirm and send"}
                  </button>
                </div>
              </>)}
            {offerStep === "sent" && (<>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl font-black text-emerald-500">
                    &#10003;
                  </div>
                  <h3 className="mt-3 text-xl font-bold">
                    Your offer was sent
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-zinc-500">
                    Your offer is active for 7 days. You will be notified when
                    the collector responds.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {selectedOfferCards.map((card) => (<div key={card.id} className={`relative h-20 ${profileViewSquare(card) ? "aspect-square" : "aspect-[5/7]"} overflow-hidden rounded-[6px]`}>
                        <SafeCardImage card={card} src={getTradeCardImage(card)} alt={getProfileCardCode(card)} className={getCardImageClassName(card, "absolute")}/>
                      </div>))}
                  </div>
                </div>
                <div className={"border-t p-2.5 sm:flex sm:justify-end " +
                    (isLightMode ? "border-black/10" : "border-white/10")}>
                  <button type="button" onClick={() => {
                    setOfferTarget(null);
                    setSelectedOfferCards([]);
                }} className="w-full rounded-xl bg-[#FFD54A] px-5 py-2 text-sm font-semibold text-zinc-900 sm:w-auto">
                    Done
                  </button>
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
};
export default ExploreProfile;
