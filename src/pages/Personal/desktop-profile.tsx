import ProfileAvatar from "@/components/ProfileAvatar";
import { onAuthIdentityChange } from "@/lib/auth-identity";
import { getMoonFourFront, cardImagePaths } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
function ShowcaseImage({
  src,
  alt,
  className,
  imageSize,
  style,
}: {
  imageSize?: "grid" | "original";
  style?: CSSProperties;
  src: string;
  alt: string;
  className: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return failedSrc === src ? (
    <div
      role="img"
      aria-label={`${alt} coming soon`}
      className="absolute inset-0 flex items-center justify-center bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"
    >
      <span className="px-2 text-center text-sm font-bold">COMING SOON</span>
    </div>
  ) : (
    <CardImage imageSize={imageSize}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailedSrc(src)}
    />
  );
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
  const [profileLoadErrors, setProfileLoadErrors] = useState<
    Record<string, boolean>
  >({});
  const trackProfileLoad = useCallback(
    async (key: string, task: () => Promise<void>) => {
      loadCounts.current[key] = (loadCounts.current[key] ?? 0) + 1;
      setProfileLoads((previous) => ({ ...previous, [key]: false }));
      try {
        await task();
        setProfileLoadErrors((previous) => ({ ...previous, [key]: false }));
      } catch (error) {
        console.error(`Unable to load profile ${key}:`, error);
        setProfileLoadErrors((previous) => ({ ...previous, [key]: true }));
      } finally {
        loadCounts.current[key] -= 1;
        if (loadCounts.current[key] === 0)
          setProfileLoads((previous) => ({ ...previous, [key]: true }));
      }
    },
    [],
  );
  const [profile, setProfile] = useState<any>(null);
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
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
    completed: 0,
    friends: 0,
  });
  const [showcaseTab, setShowcaseTab] = useState<
    "moon" | "star" | "fun" | "rainbow" | "tcg"
  >("moon");
  const [showcaseCards, setShowcaseCards] = useState<any[]>([]);
  const [selectedShowcaseCard, setSelectedShowcaseCard] = useState<any | null>(
    null,
  );
  const isMoon3SZR001 = (card: any) =>
    getTradeCardImage(card) === cardImagePaths.fixed.cardsThirdEditionMoonM3SZR001;
  const [copied, setCopied] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationBusy, setVacationBusy] = useState(false);
  const [vacationLoaded, setVacationLoaded] = useState(false);
  const [vacationError, setVacationError] = useState("");
  const [leaderboardBanned, setLeaderboardBanned] = useState(false);
  const [manuallyBannedFromLeaderboard, setManuallyBannedFromLeaderboard] = useState(false);
  const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
  const [showLeaderboardBanInfo, setShowLeaderboardBanInfo] = useState(false);
  const [showLeaderboardBanConfirm, setShowLeaderboardBanConfirm] =
    useState(false);
  useEffect(() => {
    const open = !!selectedShowcaseCard || showDeletionModal || showOfferStrikeInfo || showLeaderboardBanConfirm || showLeaderboardBanInfo || showUsernameTakenModal;
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedShowcaseCard, showDeletionModal, showOfferStrikeInfo, showLeaderboardBanConfirm, showLeaderboardBanInfo, showUsernameTakenModal]);
  const tabs = [
    { label: "Collection", path: "/binders" },
    { label: "Inventory", path: "/inventory" },
    { label: "Wishlist & ISO", path: "/iso" },
    { label: "Inbox & Friends", path: "/inbox" },
    { label: "Trading", path: "/trading-post" },
    { label: "Kayou Events", path: "/kayou-news" },
  ];
  useEffect(() => {
    let mounted = true;
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
    const syncFromDocument = () => {
      if (!mounted) return;
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    const observer = new MutationObserver(syncFromDocument);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    const loadThemePreference = async () => {
      return trackProfileLoad("theme", async () => {
        const {
          data: { session },
        } = await checkedProfileRequest(supabase.auth.getSession());
        if (!mounted) return;
        if (!session?.user) {
          setIsLightMode(false);
          return;
        }
        const { data, error } = await checkedProfileRequest(
          supabase
            .from("user_light_mode_preferences")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        );
        if (!mounted) return;
        if (error) {
          console.error(
            "Unable to load desktop profile theme preference:",
            error,
          );
        } else {
          setIsLightMode(Boolean(data));
        }
        realtimeChannel = supabase
          .channel(`desktop-profile-theme-${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_light_mode_preferences",
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              if (!mounted) return;
              setIsLightMode(payload.eventType !== "DELETE");
            },
          )
          .subscribe();
      });
    };
    syncFromDocument();
    loadThemePreference();
    return () => {
      mounted = false;
      observer.disconnect();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, []);
  useEffect(() => {
    loadProfile();
    loadStats();
    const {
      data: { subscription },
    } = onAuthIdentityChange(() => {
      setTimeout(() => {
        void loadProfile();
        void loadStats();
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function loadProfile() {
    return trackProfileLoad("profile", async () => {
      const {
        data: { session },
      } = await checkedProfileRequest(supabase.auth.getSession());
      if (!session?.user) return;
      const { data } = await checkedProfileRequest(
        supabase
          .from("profiles")
          .select("id, username, avatar_url, vacation_mode")
          .eq("id", session.user.id)
          .single(),
      );
      setVacationMode(Boolean(data?.vacation_mode));
      setVacationLoaded(Boolean(data));
      if (data) {
        await preloadProfileAvatar(getProfileAssets(data).avatar);
        setProfile(data);
      }
      setUsernameDraft(data?.username || "");
      const { data: trading } = await checkedProfileRequest(
        supabase
          .from("trading_profiles")
          .select("discord_username, trade_access_revoked")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      );
      setDiscord(trading?.discord_username || "");
      setDiscordDraft(trading?.discord_username || "");
      setTradeAccessRevoked(Boolean(trading?.trade_access_revoked));
      const { count: strikeCount } = await checkedProfileRequest(
        supabase
          .from("trade_offer_expiration_strikes")
          .select("id", { count: "exact", head: true })
          .eq("recipient_user_id", session.user.id)
          .is("cleared_at", null),
      );
      setOfferStrikeCount(Math.min(strikeCount ?? 0, 3));
      const { data: leaderboardBan, error: leaderboardBanError } =
        await checkedProfileRequest(
          supabase
            .from("leaderboard_exclusions")
            .select("user_id, reason")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        );
      if (leaderboardBanError) {
        console.error("Leaderboard ban status error:", leaderboardBanError);
      }
      setLeaderboardBanned(!!leaderboardBan);
      setManuallyBannedFromLeaderboard(
        leaderboardBan?.reason === "Excluded from leaderboard" ||
          leaderboardBan?.reason === "Excluded from leaderboard and community set pages",
      );
      setLoadingLeaderboardBan(false);
    });
  }
  async function selfBanFromLeaderboard() {
    if (leaderboardBanned) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error("Leaderboard self-ban: no authenticated session.");
      return;
    }
    setLeaderboardBanned(true);
    setManuallyBannedFromLeaderboard(false);
    setLoadingLeaderboardBan(false);
    const { error } = await supabase.from("leaderboard_exclusions").upsert(
      {
        user_id: session.user.id,
        reason:
          "Self-banned from leaderboard because user collects non-North American cards",
      },
      {
        onConflict: "user_id",
      },
    );
    if (error) {
      console.error("Leaderboard self-ban error:", error);
      setLeaderboardBanned(false);
      return;
    }
    setLeaderboardBanned(true);
  }
  async function toggleVacationMode() {
    if (!profile?.id || !vacationLoaded || vacationBusy) return;
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
    } else {
      setVacationMode(Boolean(data.vacation_mode));
    }
    setVacationBusy(false);
  }
  async function requestAccountDeletion() {
    if (deletionRequested || submittingDeletion) return;
    setSubmittingDeletion(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
    } finally {
      setSubmittingDeletion(false);
    }
  }
  async function loadStats() {
    return trackProfileLoad("stats", async () => {
      const {
        data: { session },
      } = await checkedProfileRequest(supabase.auth.getSession());
      if (!session?.user) return;
      const { data: collection } = await checkedProfileRequest(
        supabase
          .from("collection_progress_raw")
          .select("set_id, progress")
          .eq("user_id", session.user.id),
      );
      const filtered = (collection || []).filter(
        (row: any) => row.set_id !== "OTHERMERCH",
      );
      let owned = 0;
      filtered.forEach((row: any) => {
        owned += Object.values(row.progress || {}).filter(
          (value: any) =>
            value === true ||
            (typeof value === "object" && value?.owned === true),
        ).length;
      });
      const { data: friends } = await checkedProfileRequest(
        supabase
          .from("friend_requests")
          .select("sender_id, receiver_id")
          .eq("status", "accepted"),
      );
      const friendCount = (friends ?? []).filter(
        (friend: any) =>
          friend.sender_id === session.user.id ||
          friend.receiver_id === session.user.id,
      ).length;
      const { data: progress } = await checkedProfileRequest(
        supabase
          .from("collection_progress")
          .select("set_id, progress")
          .eq("user_id", session.user.id),
      );
      const progressMap = new Map(
        (progress || []).map((row: any) => [String(row.set_id), row]),
      );
      const sets = [
        {
          id: "13",
          rarities: { R: 30, SR: 20, SSR: 26, HR: 30, LSR: 16, UR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 2 },
        },
        {
          id: "1",
          rarities: {
            R: 30,
            SR: 20,
            SSR: 54,
            HR: 36,
            UR: 16,
            LSR: 15,
            SGR: 8,
            SC: 7,
          },
        },
        {
          id: "5",
          rarities: {
            R: 30,
            SR: 15,
            FR: 18,
            TR: 12,
            TGR: 8,
            MTR: 18,
            SSR: 15,
            UR: 15,
            USR: 8,
            XR: 7,
          },
        },
        {
          id: "7",
          rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 },
        },
        {
          id: "2",
          rarities: {
            R: 30,
            SR: 20,
            SSR: 54,
            HR: 30,
            UR: 16,
            LSR: 16,
            SGR: 8,
            ZR: 7,
            SC: 7,
            "SHINING ZR": 1,
          },
        },
        {
          id: "3",
          rarities: {
            R: 60,
            SR: 40,
            SSR: 40,
            HR: 60,
            UR: 18,
            LSR: 32,
            SGR: 16,
            ZR: 14,
            SC: 7,
            SZR: 3,
          },
        },
        {
          id: "8",
          rarities: {
            N: 20,
            SN: 20,
            R: 35,
            SR: 15,
            SSR: 15,
            UR: 10,
            UGR: 9,
            CR: 12,
          },
        },
        {
          id: "11",
          rarities: {
            N: 20,
            SN: 20,
            R: 35,
            SR: 15,
            SSR: 15,
            UR: 10,
            UGR: 9,
            CR: 12,
            SCR: 12,
          },
        },
        {
          id: "6",
          rarities: {
            BASE: 18,
            R: 30,
            SR: 14,
            ST: 20,
            SSR: 15,
            FR: 18,
            TR: 12,
            TGR: 8,
            UR: 19,
            USR: 8,
            XR: 8,
          },
        },
        {
          id: "4",
          rarities: {
            SSR: 20,
            SCR: 18,
            UR: 18,
            USR: 15,
            AR: 9,
            OR: 7,
            BP: 9,
            SAR: 9,
          },
        },
        {
          id: "12",
          rarities: {
            C: 48,
            U: 18,
            ER: 6,
            SR: 14,
            SPR: 28,
            GR: 12,
            CR: 12,
            RR: 6,
            PER: 12,
            PSPR: 11,
            PGR: 6,
            PCR: 12,
            PRR: 6,
          },
        },
        {
          id: "FW",
          rarities: {
            C: 48,
            U: 18,
            ER: 6,
            SR: 14,
            SPR: 28,
            GR: 12,
            CR: 12,
            RR: 6,
            PER: 12,
            PSPR: 11,
            PGR: 6,
            PCR: 12,
            PRR: 6,
          },
        },
        {
          id: "SD",
          rarities: {
            C: 9,
            U: 7,
            SR: 6,
            SPR: 10,
            GR: 6,
            CR: 6,
            ER: 6,
            PER: 12,
            PRR: 6,
          },
        },
      ];
      let completed = 0;
      sets.forEach((set) => {
        const found = progressMap.get(set.id);
        if (!found?.progress) return;
        let total = 0;
        let ownedCards = 0;
        Object.entries(set.rarities).forEach(([rarity, count]) => {
          total += count;
          for (let i = 1; i <= count; i++) {
            if (found.progress[`${rarity}-${i}`]) {
              ownedCards++;
            }
          }
        });
        if (ownedCards === total) completed++;
      });
      setStats({
        owned,
        completed,
        friends: friendCount,
      });
    });
  }
  const { avatar, verification } = getProfileAssets(profile);
  const displayName = profile?.username || "Twilight Sparkle";
  const offerStrikeLabel =
    offerStrikeCount === 0
      ? "Clean"
      : offerStrikeCount === 1
        ? "Good"
        : offerStrikeCount === 2
          ? "Bad"
          : "Access revoked";
  useEffect(() => {
    const loadShowcaseCards = async () => {
      return trackProfileLoad("showcase", async () => {
        const {
          data: { session },
        } = await checkedProfileRequest(supabase.auth.getSession());
        if (!session?.user) return;
        const { data } = await checkedProfileRequest(
          supabase
            .from("collection_progress_raw")
            .select("set_id, progress")
            .eq("user_id", session.user.id),
        );
        const showcaseRarities = [
          "SHINING ZR",
          "SZR",
          "SC",
          "SAR",
          "BP",
          "SCR",
          "CR",
          "XR",
          "PRR",
        ];
        const cards: any[] = [];
        (data || []).forEach((row: any) => {
          Object.entries(row.progress || {}).forEach(([card_key, owned]) => {
            if (String(row.set_id) === "14") {
              const isOwned =
                owned === true ||
                (typeof owned === "object" &&
                  owned !== null &&
                  "owned" in owned &&
                  owned.owned === true);
              if (isOwned && /^PBP03-RR0[1-6]$/.test(card_key)) {
                cards.push({ set_id: "14", card_key });
              }
              return;
            }
            const isOwned = owned === true || (
              typeof owned === "object" && owned !== null && "owned" in owned && owned.owned === true
            );
            if (!isOwned) return;
            if (String(row.set_id) === "13") {
              const match = card_key.match(/^(ZR|SC|SZR|SHINING ZR)-(\d+)$/);
              const count = match?.[1] === "SZR" || match?.[1] === "SHINING ZR" ? 2 : 7;
              if (match && Number(match[2]) >= 1 && Number(match[2]) <= count) {
                cards.push({ set_id: "13", card_key });
              }
              return;
            }
            const rarity =
              String(row.set_id) === "FW" ||
              String(row.set_id) === "SD" ||
              String(row.set_id) === "12" ||
              String(row.set_id) === "tcgpromos"
                ? card_key.includes("PRR")
                  ? "PRR"
                  : ""
                : String(card_key).split("-")[0];
            if (!showcaseRarities.includes(rarity)) return;
            cards.push({
              set_id: String(row.set_id),
              card_key,
            });
          });
        });
        setShowcaseCards(cards);
      });
    };
    loadShowcaseCards();
  }, []);
  const getTradeCardImage = (card: any) => {
    if (!card) return "";
    if (String(card.set_id) === "13") return getMoonFourFront(String(card.card_key));
    if (card.set_id === "friendshipsbegin" || card.set_id === "SD") {
      const cleanKey = String(card.card_key)
        .replace(/^BONUS-/, "")
        .replace(/^STARTER-/, "");
      return cardImagePaths.friendshipsBegin(cleanKey);
    }
    if (card.set_id === "FW") {
      return cardImagePaths.fantasyWonderland(card.card_key);
    }
    if (String(card.set_id) === "14") {
      return cardImagePaths.nightmareNight(card.card_key);
    }
    if (card.set_id === "12") {
      return cardImagePaths.discord(card.card_key);
    }
    if (card.set_id === "tcgpromos") {
      return cardImagePaths.tcgPromo(card.card_key);
    }
    const [rarityRaw, number] = String(card.card_key).split("-");
    const rarity = rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;
    const config: Record<string, { folder: string; prefix: string }> = {
      "1": { folder: "first-edition-moon", prefix: "M1" },
      "2": { folder: "second-edition-moon", prefix: "M2" },
      "3": { folder: "third-edition-moon", prefix: "M3" },
      "4": { folder: "star-one", prefix: "S1" },
      "5": { folder: "rainbow-one", prefix: "R1" },
      "6": { folder: "rainbow-two", prefix: "R2" },
      "7": { folder: "fun-moments-one", prefix: "FM1" },
      "8": { folder: "fun-moments-two", prefix: "FM2" },
      "11": { folder: "fun-moments-three", prefix: "FM3" },
    };
    const c = config[String(card.set_id)];
    if (!c) return "";
    return cardImagePaths.ccg(c.folder, c.prefix, rarity, String(number).padStart(
      3,
      "0",
    ));
  };
  const getShowcaseImageClass = (_card: any) => "absolute inset-0 h-full w-full object-cover object-center";
  const getShowcaseImageStyle = (card: any): CSSProperties => ({
    transform: `scale(${["1", "2", "3", "4", "5", "6", "7", "8", "11", "13"].includes(String(card?.set_id ?? "")) ? 1.055 : 1})`,
    transformOrigin: "center",
  });
  async function handleProfileEdit() {
    if (editingProfile) {
      setSavingProfile(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const originalUsername = profile?.username || "";
        const nextUsername = usernameDraft.trim();
        const { data: existingUsername, error: usernameCheckError } =
          await supabase
            .from("profiles")
            .select("id")
            .ilike("username", nextUsername)
            .neq("id", session.user.id)
            .maybeSingle();
        if (usernameCheckError) {
          console.error(
            "Failed to check username availability:",
            usernameCheckError,
          );
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
          if (
            usernameError.code === "23505" ||
            usernameError.message.toLowerCase().includes("duplicate")
          ) {
            setUsernameDraft(originalUsername);
            setShowUsernameTakenModal(true);
          } else {
            console.error("Failed to save username:", usernameError);
          }
          setSavingProfile(false);
          return;
        }
        const { error: authUsernameError } = await supabase.auth.updateUser({
          data: { username: nextUsername },
        });
        if (authUsernameError)
          console.error(
            "Failed to update username metadata:",
            authUsernameError,
          );
        const { error: tradingError } = tradeAccessRevoked
          ? { error: null }
          : await supabase.from("trading_profiles").upsert(
              {
                user_id: session.user.id,
                discord_username: discordDraft.trim(),
              },
              { onConflict: "user_id" },
            );
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
    const url = `https://www.mlpekayou.community/${encodeURIComponent(profile?.username ?? "")}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textArea);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }
  const showcaseTabs: Array<
    ["moon" | "star" | "fun" | "rainbow" | "tcg", string]
  > = [
    ["moon", "Moon"],
    ["star", "Star"],
    ["fun", "Fun Moments"],
    ["rainbow", "Rainbow"],
    ["tcg", "TCG"],
  ];
  const visibleShowcaseCards = showcaseCards
    .filter((card) => {
      switch (showcaseTab) {
        case "moon":
          return (
            ["1", "2", "3", "13"].includes(String(card.set_id)) &&
            ((String(card.set_id) === "13" && String(card.card_key).startsWith("ZR-")) ||
              String(card.card_key).startsWith("SC-") ||
              String(card.card_key).startsWith("SZR-") ||
              String(card.card_key).startsWith("SHINING ZR-"))
          );
        case "star":
          return (
            String(card.set_id) === "4" &&
            (String(card.card_key).startsWith("BP-") ||
              String(card.card_key).startsWith("SAR-"))
          );
        case "fun":
          return (
            ["7", "8", "11"].includes(String(card.set_id)) &&
            (String(card.card_key).startsWith("CR-") ||
              String(card.card_key).startsWith("SCR-"))
          );
        case "rainbow":
          return (
            ["5", "6"].includes(String(card.set_id)) &&
            String(card.card_key).startsWith("XR-")
          );
        case "tcg":
          if (String(card.set_id) === "14") {
            return /^PBP03-RR0[1-6]$/.test(card.card_key);
          }
          return (
            ["FW", "SD", "12", "friendshipsbegin", "tcgpromos"].includes(
              String(card.set_id),
            ) && String(card.card_key).includes("PRR")
          );
        default:
          return false;
      }
    })
    .sort((a, b) => {
      const setOrder: Record<string, number> = {
        "7": 1,
        "8": 2,
        "11": 3,
        "1": 4,
        "2": 5,
        "3": 6,
        "13": 6.5,
        "5": 7,
        "6": 8,
        "4": 9,
        FW: 10,
        friendshipsbegin: 11,
        SD: 12,
        "12": 13,
        tcgpromos: 14,
        "14": 15,
      };
      const rarityOrder: Record<string, number> = {
        ZR: 0,
        SC: 1,
        "SHINING ZR": 2,
        SZR: 3,
        SAR: 1,
        BP: 2,
        CR: 1,
        SCR: 2,
        XR: 1,
        PRR: 1,
      };
      const setDiff =
        (setOrder[String(a.set_id)] ?? 999) -
        (setOrder[String(b.set_id)] ?? 999);
      if (setDiff !== 0) return setDiff;
      if (String(a.set_id) === "14") {
        return String(a.card_key).localeCompare(String(b.card_key));
      }
      const rarityA = [
        "12",
        "FW",
        "SD",
        "friendshipsbegin",
        "tcgpromos",
      ].includes(String(a.set_id))
        ? "PRR"
        : String(a.card_key).split("-")[0];
      const rarityB = [
        "12",
        "FW",
        "SD",
        "friendshipsbegin",
        "tcgpromos",
      ].includes(String(b.set_id))
        ? "PRR"
        : String(b.card_key).split("-")[0];
      const rarityDiff =
        (rarityOrder[rarityA] ?? 999) - (rarityOrder[rarityB] ?? 999);
      if (rarityDiff !== 0) return rarityDiff;
      const numA = parseInt(String(a.card_key).match(/\d+/)?.[0] ?? "0", 10);
      const numB = parseInt(String(b.card_key).match(/\d+/)?.[0] ?? "0", 10);
      return numA - numB;
    });
  const essentialProfileLoaded = profileLoads.profile && profileLoads.theme;
  const essentialProfileFailed = profileLoadErrors.profile || profileLoadErrors.theme;
  if (!essentialProfileLoaded)
    return <ProfileLoadingScreen light={isLightMode} failed={false} />;
  if (essentialProfileFailed || !profile)
    return <ProfileLoadingScreen light={isLightMode} failed />;
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-2xl border p-4 sm:p-5 ${isLightMode ? "border-black/10 bg-white shadow-[0_12px_32px_rgba(0,0,0,.08)]" : "border-white/[0.08] bg-[#151718] shadow-[0_14px_36px_rgba(0,0,0,.24)]"}`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <ProfileAvatar
                profile={profile}
                src={avatar}
                alt=""
                className={`h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20 border object-cover ${isLightMode ? "border-black/10 bg-zinc-100" : "border-white/[0.10] bg-[#191a1b]"}`}
              />
              <div className="min-w-0 flex-1">
                {editingProfile ? (
                  <div
                    className={`grid max-w-2xl gap-4 rounded-2xl border p-4 sm:grid-cols-2 ${isLightMode ? "border-black/10 bg-zinc-50" : "border-white/[0.08] bg-[#101213]"}`}
                  >
                    <label className="block">
                      <span
                        className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}
                      >
                        MLPEKAYOU Username
                      </span>
                      <input
                        value={usernameDraft}
                        onChange={(e) => setUsernameDraft(e.target.value)}
                        autoFocus
                        className={`w-full rounded-xl border px-3 py-2.5 text-base font-medium outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`}
                        placeholder="Your MLPEKAYOU username"
                      />
                    </label>
                    <label className="block">
                      <span
                        className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}
                      >
                        Discord Username
                      </span>
                      <input
                        value={discordDraft}
                        onChange={(e) => setDiscordDraft(e.target.value)}
                        disabled={tradeAccessRevoked}
                        className={`w-full rounded-xl border px-3 py-2.5 text-base outline-none ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#0d0f10] text-white"}`}
                        placeholder={
                          tradeAccessRevoked
                            ? "Trading access revoked"
                            : "Your Discord username"
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h1
                        className={`truncate text-2xl font-semibold tracking-tight sm:text-3xl ${isLightMode ? "text-zinc-950" : "text-white"}`}
                      >
                        {displayName}
                      </h1>
                      {verification && (
                        <CardImage
                          src={verification.badge}
                          alt={verification.label}
                          title={verification.label}
                          className="h-7 w-7 shrink-0"
                        />
                      )}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
                    >
                      @{discord || "No Discord username set"}
                    </p>
                  </>
                )}
                {!editingProfile && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${isLightMode ? "border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-700" : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isLightMode ? "bg-emerald-600" : "bg-emerald-400"}`}
                      />
                      Active
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]"}`}
                    >
                      SuperFan
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOfferStrikeInfo(true)}
                      aria-label="Learn about offer response strikes"
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        offerStrikeCount >= 3
                          ? "border-red-500/25 bg-red-500/10 text-red-500"
                          : offerStrikeCount === 2
                            ? "border-orange-500/25 bg-orange-500/10 text-orange-500"
                            : isLightMode
                              ? "border-black/10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                              : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      Offer strikes
                      <span className="font-bold">{offerStrikeCount}/3</span>
                      <span className="opacity-60"> {offerStrikeLabel}</span>
                    </button>
                  </div>
                )}
                {tradeAccessRevoked && (
                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                      isLightMode
                        ? "border-red-500/20 bg-red-50 text-red-700"
                        : "border-red-400/20 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {offerStrikeCount >= 3 ? (
                      <>
                        Your Discord username and trade and sale rights were
                        revoked after three unanswered offers expired. You must
                        appeal in the{" "}
                        <a
                          className="font-bold underline"
                          href="https://discord.gg/mlpekayou"
                          target="_blank"
                          rel="noreferrer"
                        >
                          MLPEKAYOU Discord server
                        </a>{" "}
                        and prove to a moderator that your account is active.
                      </>
                    ) : (
                      <>
                        Your trade and sale rights have been revoked based on
                        community reports. You can appeal by emailing{" "}
                        <a
                          className="font-bold underline"
                          href="mailto:mlpekayou@gmail.com"
                        >
                          mlpekayou@gmail.com
                        </a>{" "}
                        or opening a ticket in the{" "}
                        <a
                          className="font-bold underline"
                          href="https://discord.gg/mlpekayou"
                          target="_blank"
                          rel="noreferrer"
                        >
                          MLPEKAYOU Discord server
                        </a>
                        .
                      </>
                    )}
                  </div>
                )}
                {profile?.bio && (
                  <p
                    className={`mt-4 max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
              <button
                onClick={() => navigate("/Personal/change-avatar")}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}
              >
                Change Avatar
              </button>
              <button
                type="button"
                onClick={() => navigate("/Personal/change-avatar?tab=frames")}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700] hover:bg-[#c89d13]/25" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/20"}`}
              >
                Frames
              </button>
              <button
                onClick={handleProfileEdit}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${editingProfile ? (isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]") : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}
              >
                {editingProfile
                  ? savingProfile
                    ? "Saving..."
                    : "Save"
                  : "Edit Names"}
              </button>
              <button
                onClick={handleShareProfile}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}
              >
                {copied ? "Copied" : "Share Profile"}
              </button>
            </div>
          </div>
        <div className={`mt-4 grid grid-cols-3 gap-3 border-t pt-4 ${isLightMode ? "border-black/10" : "border-white/[0.08]"}`}>
          {[
            [profileLoads.stats && !profileLoadErrors.stats ? stats.owned.toLocaleString() : "", "Cards Owned"],
            [profileLoads.stats && !profileLoadErrors.stats ? stats.completed.toLocaleString() : "", "Sets Mastered"],
            [profileLoads.stats && !profileLoadErrors.stats ? stats.friends.toLocaleString() : "", "Friends"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
            >
              <div
                className={`text-xl font-bold tracking-tight sm:text-2xl ${isLightMode ? "text-[#8a6a00]" : "text-[#FFD54A]"}`}
              >
                {value}
              </div>
              <div
                className={`text-xs font-medium sm:text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        </div>
        <div className="mt-4 grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4">
        <div
          className={`grid grid-cols-2 gap-2 rounded-2xl border p-2 xl:grid-cols-1 ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${isLightMode ? "text-zinc-700 hover:bg-zinc-100" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={`rounded-2xl border p-5 ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Vacation Mode</h3>
              <p className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                {vacationMode ? "Your trade and sale cards are hidden until you turn this off." : "Hide your trade and sale cards until you return."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Vacation Mode"
              aria-checked={vacationMode}
              disabled={!vacationLoaded || vacationBusy}
              onClick={() => void toggleVacationMode()}
              className={`relative flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors disabled:opacity-50 ${vacationMode ? "bg-[#FFD54A]" : isLightMode ? "bg-zinc-300" : "bg-zinc-700"}`}
            >
              <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${vacationMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
          {vacationError && <p role="alert" className="mt-2 text-xs text-red-400">{vacationError}</p>}
        </div>
        {loadingLeaderboardBan ? null : manuallyBannedFromLeaderboard ? (
          <div role="status" className={`mt-4 w-full rounded-2xl border p-5 text-sm font-semibold leading-6 sm:p-6 ${isLightMode ? "border-red-300 bg-red-50 text-red-800" : "border-red-500/40 bg-red-500/10 text-red-200"}`}>
            You have been banned from the leaderboard. This is likely due to your conduct on or off website.
          </div>
        ) : (
        <div
          className={`mt-4 w-full overflow-hidden rounded-2xl border p-5 sm:p-6 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className={`text-sm font-semibold ${isLightMode ? "text-zinc-950" : "text-white"}`}
                >
                  Regional Association
                </div>
                <button
                  type="button"
                  aria-label="Leaderboard eligibility information"
                  onClick={() => setShowLeaderboardBanInfo(true)}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isLightMode
                      ? "border-black/[0.10] bg-black/[0.03] text-zinc-600 hover:bg-black/[0.06] hover:text-zinc-900"
                      : "border-white/[0.10] bg-white/[0.05] text-zinc-300 hover:bg-white/[0.10] hover:text-white"
                  }`}
                >
                  ?
                </button>
              </div>
              <p
                className={`mt-2 max-w-md text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
              >
                If you are using this website to track MLP Kayou cards in
                regions outside of North American cards, click this toggle.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={leaderboardBanned}
              disabled={leaderboardBanned}
              onClick={() => setShowLeaderboardBanConfirm(true)}
              className={`relative mt-1 flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${
                leaderboardBanned
                  ? isLightMode
                    ? "cursor-not-allowed bg-zinc-300 opacity-60"
                    : "cursor-not-allowed bg-zinc-700 opacity-60"
                  : isLightMode
                    ? "cursor-pointer bg-zinc-300 hover:bg-zinc-400"
                    : "cursor-pointer bg-zinc-700 hover:bg-zinc-600"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  leaderboardBanned ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            {leaderboardBanned && (
              <div className="mt-2 text-xs text-zinc-500">
                Leaderboard exclusion is active. Contact Keegan to undo it.
              </div>
            )}
          </div>
        </div>
        )}
        <div
          className={`rounded-2xl border p-5 ${isLightMode ? "border-red-900/10 bg-white" : "border-red-500/20 bg-[#151718]"}`}
        >
          <div>
            <h3
              className={`text-sm font-semibold ${isLightMode ? "text-red-700" : "text-white"}`}
            >
              Account Deletion
            </h3>
            <p
              className={`mt-2 max-w-3xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              Request permanent deletion of your MLPEKAYOU account. Your account
              stays active until the request is manually reviewed and completed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeletionModal(true)}
            disabled={deletionRequested}
            className={`mt-4 w-full rounded-xl border px-5 py-3 text-sm font-semibold ${deletionRequested ? "cursor-default border-zinc-400/20 bg-zinc-500/10 text-zinc-500" : isLightMode ? "border-red-700/25 bg-red-700/[0.04] text-red-700 hover:bg-red-700/[0.08]" : "border-red-500/30 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.12]"}`}
          >
            {deletionRequested ? "Request Pending" : "Request Account Deletion"}
          </button>
        </div>
          </aside>
          <main className="min-w-0">
        <div
          className={`rounded-3xl border p-5 sm:p-6 ${isLightMode ? "border-black/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,.06)]" : "border-white/[0.08] bg-[#151718] shadow-[0_10px_30px_rgba(0,0,0,.18)]"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                className={`text-2xl font-semibold tracking-tight ${isLightMode ? "text-zinc-950" : "text-white"}`}
              >
                Top Collected Hits
              </h2>
              <p
                className={`mt-1 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Your rarest collected cards, grouped by collection.
              </p>
            </div>
            <div className="flex max-w-full flex-wrap gap-2">
              {showcaseTabs.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setShowcaseTab(key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${showcaseTab === key ? (isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]") : isLightMode ? "border-black/10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100" : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {!profileLoads.showcase && <p role="status" className="py-10 text-center text-sm text-zinc-500">Loading your collected hits…</p>}
          {profileLoadErrors.showcase && <p role="alert" className="py-8 text-center text-sm text-zinc-500">Your collected hits could not be loaded. Refresh to try again.</p>}
          {profileLoads.showcase && !profileLoadErrors.showcase && visibleShowcaseCards.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Your collected hits will appear here.</p>}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {visibleShowcaseCards.map((card, index) => (
              <button
                type="button"
                key={`${card.set_id}-${card.card_key}-${index}`}
                onClick={() => setSelectedShowcaseCard(card)}
                className={`group relative overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 ${
                  isMoon3SZR001(card)
                    ? "col-span-2 grid grid-cols-2 gap-3"
                    : "aspect-[5/7]"
                }`}
              >
                {isMoon3SZR001(card) ? (
                  <>
                    <div
                      className="invisible aspect-[5/7] w-full"
                      aria-hidden="true"
                    />
                    <div
                      className="invisible aspect-[5/7] w-full"
                      aria-hidden="true"
                    />
                    <CardImage
                      src={getTradeCardImage(card)}
                      alt={card.card_key}
                      className={getShowcaseImageClass(card)}
                      style={getShowcaseImageStyle(card)}
                    />
                  </>
                ) : (
                  <ShowcaseImage
                    src={getTradeCardImage(card)}
                    alt={card.card_key}
                    className={getShowcaseImageClass(card)}
                      style={getShowcaseImageStyle(card)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
          </main>
        </div>
      </div>
      {showOfferStrikeInfo && (
        <div
          className={`fixed inset-0 z-[140] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/30" : "bg-black/80"}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowOfferStrikeInfo(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-offer-strikes-title"
            className={`max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/[0.10] bg-[#151718] text-white"}`}
          >
            <h2
              id="desktop-offer-strikes-title"
              className="text-xl font-semibold tracking-tight"
            >
              Offer response strikes
            </h2>
            <div
              className={`mt-3 space-y-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
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
              <a
                href="https://discord.gg/mlpekayou"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]"
              >
                Open Discord
              </a>
              <button
                type="button"
                onClick={() => setShowOfferStrikeInfo(false)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200" : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {showLeaderboardBanConfirm && (
        <div
          className={`fixed inset-0 z-[115] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/20" : "bg-black/80"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLeaderboardBanConfirm(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/[0.10] bg-[#151718] text-white"
            }`}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              Do not activate this toggle if you only collect American Cards
              using this app.
            </h2>
            <p
              className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              Turn this on only if you collect cards outside the North American
              English release, and if you are using this app to track them.
            </p>
            <p
              className={`mt-3 text-sm font-medium ${isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}`}
            >
              This includes SEA, Chinese, Japanese, and other regional or
              language cards. This app is only made for North American releases.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaderboardBanConfirm(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  isLightMode
                    ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLeaderboardBanConfirm(false);
                  await selfBanFromLeaderboard();
                }}
                className="flex-1 rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showLeaderboardBanInfo && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/20" : "bg-black/80"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLeaderboardBanInfo(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-900"
                : "border-white/[0.10] bg-[#151718] text-white"
            }`}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              Regional Association
            </h2>
            {leaderboardBanned ? (
              <div
                className={`mt-3 space-y-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
              >
                <p>
                  Your account is currently excluded from all leaderboards. This
                  is due to the unfair advantage provided to other regions
                  regarding release dates.
                </p>
                <p>
                  If this was a mistake, contact Keegan in the MLPEKAYOU Discord
                  server. You will be required to open a ticket and provide
                  proof that your cards are North American only.
                </p>
              </div>
            ) : (
              <p
                className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
              >
                Use this setting if you collect cards from outside the North
                American English release, including SEA, Chinese, or Japanese
                cards.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowLeaderboardBanInfo(false)}
              className={`mt-6 w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
                isLightMode
                  ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
      {showDeletionModal && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/20" : "bg-black/80"}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submittingDeletion)
              setShowDeletionModal(false);
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${isLightMode ? "border-red-900/10 bg-white text-zinc-900" : "border-red-500/25 bg-[#151718] text-white"}`}
          >
            <h2
              className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}
            >
              Request account deletion
            </h2>
            <p
              className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              This sends a request for permanent account deletion. Your account
              stays active until the request is manually reviewed and completed.
            </p>
            <p
              className={
                isLightMode
                  ? "mt-3 text-sm font-medium text-red-700"
                  : "mt-3 text-sm font-medium text-red-500"
              }
            >
              Once your account is deleted, it cannot be recovered.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={submittingDeletion}
                onClick={() => setShowDeletionModal(false)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-black/10 bg-zinc-100 text-zinc-700" : "border-white/10 bg-white/[0.05] text-zinc-300"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDeletion}
                onClick={requestAccountDeletion}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${isLightMode ? "border-red-700/25 bg-red-700/[0.06] text-red-700" : "border-red-500/30 bg-red-500/[0.08] text-red-500"}`}
              >
                {submittingDeletion ? "Submitting..." : "Request deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showUsernameTakenModal && (
        <div
          className={`fixed inset-0 z-[130] flex items-center justify-center p-4 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowUsernameTakenModal(false);
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${isLightMode ? "border-[#8a6a00]/20 bg-white text-zinc-900" : "border-[#FFD54A]/25 bg-[#151718] text-white"}`}
          >
            <h2
              className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-[#725700]" : "text-[#FFE27A]"}`}
            >
              Username already taken
            </h2>
            <p
              className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              That username already belongs to another collector. Your original
              username has been restored in the editor.
            </p>
            <button
              type="button"
              onClick={() => setShowUsernameTakenModal(false)}
              className={`mt-6 w-full rounded-xl border px-4 py-3 text-sm font-semibold ${isLightMode ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]" : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"}`}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {selectedShowcaseCard && (
        <div
          className={`fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md ${isLightMode ? "bg-white/25" : "bg-black/80"}`}
          onClick={() => setSelectedShowcaseCard(null)}
        >
          <button type="button" aria-label="Close card preview" onClick={() => setSelectedShowcaseCard(null)} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-2xl text-white shadow-lg">—</button>
          <button
            type="button"
            className={`relative overflow-hidden rounded-2xl shadow-2xl ${
              isMoon3SZR001(selectedShowcaseCard)
                ? "aspect-[10/7] w-[min(92vw,850px,calc(78dvh*10/7))]"
                : "aspect-[5/7] w-[min(78vw,425px,calc(78dvh*5/7))]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <ShowcaseImage imageSize="original"
              src={getTradeCardImage(selectedShowcaseCard)}
              alt="Selected card"
              className={getShowcaseImageClass(selectedShowcaseCard)}
              style={getShowcaseImageStyle(selectedShowcaseCard)}
            />
          </button>
        </div>
      )}
    </div>
  );
}
function ProfileLoadingScreen({
  light,
  failed,
}: {
  light: boolean;
  failed: boolean;
}) {
  const logo = light
    ? "/website-assets/mlpekayouwiki4.webp"
    : "/website-assets/darkmodelogo.webp";
  return (
    <div
      className={`profile-loading-screen${light ? " profile-loading-light" : ""}`}
    >
      <style>{`
        .profile-loading-screen{position:relative;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:32px 24px;background:#0d0f10;color:#f4f4f5}
        .profile-loading-screen.profile-loading-light{background:#f5f5f3;color:#27272a}
        .profile-loading-content{width:100%;max-width:320px;text-align:center;transform:translateY(clamp(-110px,-12dvh,-72px))}
        .profile-loading-brand{display:flex;align-items:center;justify-content:center;width:210px;height:92px;margin:0 auto 24px}
        .profile-loading-brand img{width:100%;max-height:92px;object-fit:contain;filter:drop-shadow(0 5px 16px rgba(0,0,0,.12));animation:profile-logo-breathe 1.8s ease-in-out infinite}
        .profile-loading-title{margin:0;font-size:17px;font-weight:700;line-height:1.4}
        .profile-loading-subtitle{margin:6px 0 0;font-size:13px;line-height:1.5;color:#a1a1aa}
        .profile-loading-light .profile-loading-subtitle{color:#71717a}
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
          <CardImage src={logo} alt="MLPEKAYOU" />
        </div>
        {failed ? (
          <>
            <p className="profile-loading-title" role="alert">
              We couldn't load your profile
            </p>
            <p className="profile-loading-subtitle">Please try again.</p>
            <button
              type="button"
              className="profile-loading-retry"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </>
        ) : (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading your profile</span>
            <p className="profile-loading-title" aria-hidden="true">
              Getting your profile ready
            </p>
            <p className="profile-loading-subtitle" aria-hidden="true">
              Loading your account and preferences
            </p>
            <div className="profile-loading-bar" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
async function checkedProfileRequest<T extends { error?: unknown }>(
  request: PromiseLike<T>,
): Promise<T> {
  const result = await request;
  if (result.error) throw result.error;
  return result;
}
function preloadProfileAvatar(src: string | null | undefined): Promise<void> {
  if (!src) return Promise.resolve();
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
    if (image.complete) resolve();
  });
}