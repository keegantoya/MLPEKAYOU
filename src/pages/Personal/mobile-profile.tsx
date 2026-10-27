import { useStaffSummary } from "@/components/StaffCommunications";
import { EnglishLeaderboardAppealForm } from "@/components/EnglishLeaderboardAppeals";
import { isISOOwned, normalizeISOKey } from "@/pages/ISO/iso-visibility";
import { chineseSets } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ProfileAvatar from "@/components/ProfileAvatar";
import { onAuthIdentityChange } from "@/lib/auth-identity";
import CardImage from "@/components/CardImage";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getProfileAssets } from "../Everypony/profile-assets";
import LGSApproveDeny from "@/pages/Pop-Ups/LGSApproveDeny";
import { supabase } from "@/lib/supabase";
import {
  ChevronRight,
  Bell,
  Shield,
  LogOut,
  Pencil,
  Inbox,
  Store,
  Bug,
  Sparkles,
} from "lucide-react";
const PUSH_PUBLIC_KEY =
  "BMd3JmZpZQ2g4-wuBUeuUEMGJAuoaW8E2qTJkzOFWGh8G2tWg7SYca6wIACs_Nbd3JunbUFBHww91hfHQ6PM2xE";
const PUSH_SERVICE_WORKER = "/push-sw.js";
const PUSH_SCOPE = "/push-notifications/";
const MobileProfile = () => {
  const navigate = useNavigate();
  const pageChoiceTrigger = useRef<HTMLButtonElement | null>(null);
  const editProfileTrigger = useRef<HTMLButtonElement | null>(null);
  const [pageChoice, setPageChoice] = useState<{ title: string; english: string; chinese: string } | null>(null);
  const pageChoiceMenu = useRef<HTMLDivElement | null>(null);
  const [pageChoicePosition, setPageChoicePosition] = useState({ left: 0, top: 0, origin: "left center" });
  const openPageChoice = (page: { title: string; english: string; chinese: string }, trigger: HTMLButtonElement) => {
    if (pageChoice?.title === page.title) { setPageChoice(null); return; }
    pageChoiceTrigger.current = trigger;
    const rect = trigger.getBoundingClientRect(), width = 156, height = 108, gap = 8, margin = 12;
    const rightFits = window.innerWidth - rect.right >= width + gap + margin;
    const leftFits = rect.left >= width + gap + margin;
    const left = rightFits ? rect.right + gap : leftFits ? rect.left - width - gap : Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
    const preferredTop = rightFits || leftFits ? rect.top + rect.height / 2 - height / 2 : rect.bottom + gap;
    setPageChoicePosition({ left, top: Math.max(margin, Math.min(preferredTop, window.innerHeight - height - margin)), origin: rightFits ? "left center" : leftFits ? "right center" : "top center" });
    setPageChoice(page);
  };
  useEffect(() => {
    if (!pageChoice) return;
    pageChoiceMenu.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!pageChoiceMenu.current?.contains(target) && !pageChoiceTrigger.current?.contains(target)) setPageChoice(null);
    };
    const close = () => setPageChoice(null);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setPageChoice(null); pageChoiceTrigger.current?.focus(); }
      if (event.key === "Tab") setPageChoice(null);
    };
    document.addEventListener("pointerdown", dismiss); document.addEventListener("keydown", key);
    window.addEventListener("resize", close); window.addEventListener("scroll", close, true);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", key); window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); };
  }, [pageChoice]);
  const loadCounts = useRef<Record<string, number>>({});
  const [profileLoads, setProfileLoads] = useState<Record<string, boolean>>({
    profile: false,
    stats: false,
    theme: false,
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
  const [inboxCounts, setInboxCounts] = useState({ owner: "", count: 0 });
  const staffSummary = useStaffSummary();
  const safeUnreadCount = (value: unknown) => { const count = Number(value); return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0; };
  const ownStaffSummary = Boolean(profile?.id) && staffSummary.userId === profile.id;
  const inboxNotificationCount = (inboxCounts.owner === profile?.id ? inboxCounts.count : 0) + (ownStaffSummary ? safeUnreadCount(staffSummary.unread) : 0);
  const moderationNotificationCount = ownStaffSummary ? safeUnreadCount(staffSummary.moderation_unread) : 0;
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
  const [copied, setCopied] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationBusy, setVacationBusy] = useState(false);
  const [vacationLoaded, setVacationLoaded] = useState(false);
  const [vacationError, setVacationError] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState("");
  const [showPushEnabledModal, setShowPushEnabledModal] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [canReviewLGS, setCanReviewLGS] = useState(false);
  const [showLGSReview, setShowLGSReview] = useState(false);
  const [lgsAccess, setLgsAccess] = useState<string | null>(null);
  const [leaderboardBanned, setLeaderboardBanned] = useState(false);
  const [loadingLeaderboardBan, setLoadingLeaderboardBan] = useState(true);
  const [showBugReport, setShowBugReport] = useState(false);
  const [stats, setStats] = useState({
    owned: 0,
    chineseOwned: 0,
    completed: 0,
  });
  useEffect(() => {
    let mounted = true;
    let authVersion = 0;
    const applyReviewAccess = (id?: string) => {
      if (!mounted) return;
      const allowed = id === "17e57e39-bc0c-44e7-b373-ac34c6690185";
      setCanReviewLGS(allowed);
      if (!allowed) setShowLGSReview(false);
    };
    const {
      data: { subscription },
    } = onAuthIdentityChange((_event, session) => {
      authVersion++;
      applyReviewAccess(session?.user?.id);
    });
    const initialVersion = authVersion;
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (mounted && authVersion === initialVersion)
          applyReviewAccess(error ? undefined : data.session?.user?.id);
      })
      .catch(() => {
        if (mounted && authVersion === initialVersion) applyReviewAccess();
      });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const loadProfile = async () => {
      return trackProfileLoad("profile", async () => {
        const {
          data: { session },
        } = await checkedProfileRequest(supabase.auth.getSession());
        setCanReviewLGS(
          session?.user?.id === "17e57e39-bc0c-44e7-b373-ac34c6690185",
        );
        if (!session?.user) {
          setProfile(null);
          setLgsAccess(null);
          return;
        }
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
        const { data: moderatorRecord, error: moderatorError } =
          await checkedProfileRequest(
            supabase
              .from("leaderboard_moderators")
              .select("user_id")
              .eq("user_id", session.user.id)
              .maybeSingle(),
          );
        if (moderatorError) {
          console.error("Moderator status error:", moderatorError);
        }
        setIsModerator(Boolean(moderatorRecord));
        const { data: lgsStaff, error: lgsError } = await checkedProfileRequest(
          supabase
            .from("lgs_staff")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        );
        if (lgsError) {
          console.error("LGS staff status error:", lgsError);
        }
        setLgsAccess(lgsError ? null : (lgsStaff?.role ?? null));
        const { data: tradingProfile } = await checkedProfileRequest(
          supabase
            .from("trading_profiles")
            .select("discord_username, trade_access_revoked")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        );
        setDiscord(tradingProfile?.discord_username || "");
        setTradeAccessRevoked(Boolean(tradingProfile?.trade_access_revoked));
        const { count: strikeCount } = await checkedProfileRequest(
          supabase
            .from("trade_offer_expiration_strikes")
            .select("id", { count: "exact", head: true })
            .eq("recipient_user_id", session.user.id)
            .is("cleared_at", null),
        );
        setOfferStrikeCount(Math.min(strikeCount ?? 0, 3));
        setUsernameDraft(data?.username || "");
        setDiscordDraft(tradingProfile?.discord_username || "");
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
        setLoadingLeaderboardBan(false);
      });
    };
    loadProfile();
    const {
      data: { subscription },
    } = onAuthIdentityChange(() => {
      setTimeout(() => {
        void loadProfile();
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!profile?.id) {
      setInboxCounts({ owner: "", count: 0 });
      return;
    }
    let active = true;
    let requestId = 0;
    const refreshInboxCount = async () => {
      const request = ++requestId;
      try {
      const [messagesResult, requestsResult, offersResult] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver", profile.id)
          .is("read_at", null),
        supabase
          .from("friend_requests")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", profile.id)
          .eq("status", "pending"),
        supabase
          .from("trade_offers")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", profile.id)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString()),
      ]);
      if (!active || request !== requestId) return;
      const error = messagesResult.error ?? requestsResult.error ?? offersResult.error;
      if (error) throw error;
      setInboxCounts({ owner: profile.id, count: (messagesResult.count ?? 0) + (requestsResult.count ?? 0) + (offersResult.count ?? 0) });
      } catch (error) {
        if (active && request === requestId) console.error("Unable to refresh inbox counts:", error);
      }
    };
    const refresh = () => { void refreshInboxCount(); };
    const refreshVisible = () => { if (document.visibilityState === "visible") refresh(); };
    const refreshTimer = window.setInterval(refreshVisible, 30000);
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const connect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!active || error || !session?.access_token || session.user.id !== profile.id) return;
        await supabase.realtime.setAuth(session.access_token);
        if (!active) return;
        channel = supabase
          .channel(`mobile-profile-inbox-${profile.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
              filter: `receiver=eq.${profile.id}`,
            },
            refresh,
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "friend_requests",
              filter: `receiver_id=eq.${profile.id}`,
            },
            refresh,
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "trade_offers",
              filter: `recipient_id=eq.${profile.id}`,
            },
            refresh,
          )
          .subscribe();
      } catch (error) {
        if (active) console.error("Unable to connect inbox updates:", error);
      }
    };
    void connect();
    void refreshInboxCount();
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("header-message-update", refresh);
    window.addEventListener("header-inbox-update", refresh);
    return () => {
      active = false;
      ++requestId;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("header-message-update", refresh);
      window.removeEventListener("header-inbox-update", refresh);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [profile?.id]);
  useEffect(() => {
    let mounted = true;
    const syncFromDocument = () => {
      if (!mounted) return;
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
  useEffect(() => {
    let mounted = true;
    const supported = supportsWebPush();
    if (!profile?.id || !supported) {
      setPushEnabled(false);
      return () => {
        mounted = false;
      };
    }
    void getExistingPushRegistration()
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => {
        if (mounted) setPushEnabled(Boolean(subscription));
      })
      .catch((error) => {
        console.error("Unable to check push notification status:", error);
        if (mounted) setPushEnabled(false);
      });
    return () => {
      mounted = false;
    };
  }, [profile?.id]);
  async function enablePushNotifications() {
    if (pushBusy) return;
    setPushStatusMessage("");
    if (!supportsWebPush()) {
      setPushStatusMessage(
        "Push notifications are not supported in this browser. On iPhone, add MLPEKAYOU to your Home Screen and open it there.",
      );
      return;
    }
    if (isIosBrowser() && !isStandaloneApp()) {
      setPushStatusMessage(
        "On iPhone or iPad, first add MLPEKAYOU to your Home Screen, then open that saved icon and enable notifications here.",
      );
      return;
    }
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatusMessage(
          permission === "denied"
            ? "Notifications are blocked. Allow them in your phone or browser settings, then try again."
            : "Notifications were not enabled.",
        );
        return;
      }
      const registration = await getPushRegistration();
      let subscription = await registration.pushManager.getSubscription();
      let createdSubscription = false;
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_KEY),
        });
        createdSubscription = true;
      }
      const { error } = await supabase.functions.invoke("push-notifications", {
        body: {
          action: "subscribe",
          subscription: subscription.toJSON(),
        },
      });
      if (error) {
        if (createdSubscription) await subscription.unsubscribe();
        throw error;
      }
      setPushEnabled(true);
      setShowPushEnabledModal(true);
    } catch (error) {
      console.error("Unable to enable push notifications:", error);
      setPushStatusMessage(
        "Push notifications could not be enabled. Please try again.",
      );
    } finally {
      setPushBusy(false);
    }
  }
  async function disablePushNotifications() {
    if (pushBusy) return;
    setPushBusy(true);
    setPushStatusMessage("");
    try {
      const registration = await getExistingPushRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const { error } = await supabase.functions.invoke(
          "push-notifications",
          {
            body: {
              action: "unsubscribe",
              endpoint: subscription.endpoint,
            },
          },
        );
        if (error) throw error;
        await subscription.unsubscribe();
      }
      setPushEnabled(false);
      setPushStatusMessage("Push notifications are off on this device.");
    } catch (error) {
      console.error("Unable to disable push notifications:", error);
      setPushStatusMessage(
        "Push notifications could not be turned off. Please try again.",
      );
    } finally {
      setPushBusy(false);
    }
  }
  useEffect(() => {
    const loadStats = async () => {
      return trackProfileLoad("stats", async () => {
        try {
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
          const chineseOwned = (collection || []).filter((row: any) => String(row.set_id).toLowerCase().startsWith("cn-")).reduce((total: number, row: any) => total + Object.values(row.progress || {}).filter((value: any) => value === true || (typeof value === "object" && value?.owned === true)).length, 0);
          const filtered = (collection || []).filter(
            (row: any) => row.set_id !== "OTHERMERCH" && !String(row.set_id).toLowerCase().startsWith("cn-"),
          );
          let owned = 0;
          filtered.forEach((row: any) => {
            owned += Object.values(row.progress || {}).filter(
              (value: any) =>
                value === true ||
                (typeof value === "object" && value?.owned === true),
            ).length;
          });
          const progressMap = new Map<string, Record<string, unknown>>();
          for (const row of collection || []) {
            const setId = String(row.set_id) === "friendshipsbegin" ? "SD" : String(row.set_id);
            const values = progressMap.get(setId) ?? {};
            for (const [key, value] of Object.entries(row.progress || {})) {
              values[normalizeISOKey(setId, key)] = value;
            }
            progressMap.set(setId, values);
          }
          const sets = [
            {
              id: "14",
              rarities: { C: 48, U: 18, ER: 6, SR: 14, SPR: 28, GR: 12, CR: 12, RR: 6, PER: 12, PGR: 5, PSPR: 11, PCR: 12, PRR: 6 },
            },
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
              rarities: {
                N: 20,
                SN: 20,
                R: 35,
                SR: 15,
                SSR: 15,
                UR: 10,
                CR: 12,
              },
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
            const progress = progressMap.get(set.id);
            if (!progress) return;
            const keys = Object.entries(set.rarities).flatMap(([rarity, count]) => {
              if (set.id === "14") {
                if (rarity === "ER") return ["01", "02"].flatMap(n => ["A", "B", "C"].map(v => `BP03-ER${n}-${v}`));
                if (rarity === "PER") return ["01", "02"].flatMap(n => ["A", "A2", "B", "B2", "C", "C2"].map(v => `PBP03-ER${n}-${v}`));
                if (rarity === "PGR") return ["07", "08", "09", "11", "12"].map(n => `PBP03-GR${n}`);
                if (rarity === "PSPR") return ["03", "04", "06", "08", "11", "16", "17", "19", "20", "23", "25"].map(n => `PBP03-SPR${n}`);
                return Array.from({ length: count }, (_, i) => `${rarity.startsWith("P") ? "PBP03-" + rarity.slice(1) : "BP03-" + rarity}${String(i + 1).padStart(2, "0")}`);
              }
              if (set.id === "12") {
                if (rarity === "PER") return Array.from({ length: 6 }, (_, i) => ["A2", "B2"].map(v => `BP02-PER${String(i + 1).padStart(2, "0")}-${v}`)).flat();
                return Array.from({ length: count }, (_, i) => `BP02-${rarity}${String(i + 1).padStart(2, "0")}`);
              }
              if (set.id === "FW") {
                if (rarity === "PSPR") return [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(n => `BP01PSPR${String(n).padStart(2, "0")}`);
                return Array.from({ length: count }, (_, i) => `BP01${rarity}${String(i + (rarity === "ER" ? 7 : 1)).padStart(2, "0")}`);
              }
              if (set.id === "SD") return Array.from({ length: count }, (_, i) => `SD01${rarity}${String(i + (rarity === "PER" ? 7 : 1)).padStart(2, "0")}`);
              return Array.from({ length: count }, (_, i) => normalizeISOKey(set.id, `${rarity}-${i + 1}`));
            });
            if (keys.length > 0 && keys.every(key => isISOOwned(progress[key]))) completed++;
          });
          for (const set of chineseSets) {
            if (set.family === "promos" || set.cards.length === 0) continue;
            const progress = progressMap.get(set.id);
            if (progress && set.cards.every(card => isISOOwned(progress[card.key]))) completed++;
          }
          setStats({
            owned,
            chineseOwned,
            completed,
          });
        } catch (error) {
          console.error("Failed to load stats:", error);
          throw error;
        }
      });
    };
    loadStats();
  }, []);
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
  const collectionPages = [
    { title: "Inventory", subtitle: "Set your inventory and trades/sales", english: "/inventory", chinese: "/inventory-chinese" },
    { title: "Wishlist & ISO", subtitle: "Missing cards & wishlisted cards", english: "/iso", chinese: "/iso-chinese" },
    { title: "Binders", subtitle: "Browse your binders", english: "/binders", chinese: "/binders-chinese" },
  ];
  const essentialProfileLoaded = profileLoads.profile && profileLoads.theme;
  const essentialProfileFailed =
    profileLoadErrors.profile || profileLoadErrors.theme;
  if (!essentialProfileLoaded)
    return <ProfileLoadingScreen light={isLightMode} spooky={isSpookyMode} failed={false} />;
  if (essentialProfileFailed || !profile)
    return <ProfileLoadingScreen light={isLightMode} spooky={isSpookyMode} failed />;
  return (
    <main className={`mobile-profile-scope mp-clean min-h-screen pb-24 font-['Oxanium'] ${isLightMode ? "mobile-profile-light bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
<style>{`
.mp-page-language-menu{position:fixed;z-index:120100;box-sizing:border-box;width:156px;padding:6px;border:1px solid #ffffff24;border-radius:12px;background:#1b1d20;color:#f4f4f5;box-shadow:0 8px 24px #0004;font-family:"Oxanium",sans-serif;animation:mp-page-language-in .16s ease-out both}
.mp-page-language-menu-light{background:#fff;color:#202124;border-color:#00000020;box-shadow:0 8px 24px #0002}
.mp-page-language-menu button{display:block;width:100%;min-height:46px;padding:10px 12px;text-align:left;font:inherit;font-size:13px;font-weight:600;color:inherit;border:0;border-radius:7px;background:none;cursor:pointer}
.mp-page-language-menu button:hover,.mp-page-language-menu button:focus-visible{background:hsl(var(--primary)/.10);color:hsl(var(--primary))}
.mp-page-language-menu button:focus-visible{outline:1px solid hsl(var(--primary));outline-offset:-1px}
@keyframes mp-page-language-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@media(prefers-reduced-motion:reduce){.mp-page-language-menu{animation:none}}
        .mobile-profile-light [class*="bg-[#0"],
        .mobile-profile-light [class*="bg-[#1"] {
          background-color: #ffffff !important;
        }
        .mobile-profile-light [class*="border-white/"],
        .mobile-profile-light [class*="border-zinc-8"] {
          border-color: rgba(24, 24, 27, 0.10) !important;
        }
        .mobile-profile-light .text-white,
        .mobile-profile-light [class*="text-zinc-2"],
        .mobile-profile-light [class*="text-zinc-3"] {
          color: #27272a !important;
        }
        .mobile-profile-light [class*="text-zinc-4"],
        .mobile-profile-light [class*="text-zinc-5"],
        .mobile-profile-light [class*="text-zinc-6"],
        .mobile-profile-light [class*="text-zinc-7"] {
          color: #52525b !important;
        }
        .mobile-profile-light [class*="bg-white/[0.0"] {
          background-color: rgba(24, 24, 27, 0.035) !important;
        }
        .mobile-profile-light [class*="hover:bg-[#19"]:hover,
        .mobile-profile-light [class*="hover:bg-[#20"]:hover,
        .mobile-profile-light [class*="hover:bg-white"]:hover {
          background-color: rgba(24, 24, 27, 0.055) !important;
        }
        .mobile-profile-light input {
          background: #ffffff !important;
          color: #18181b !important;
          border-color: rgba(24, 24, 27, 0.12) !important;
        }
        .mobile-profile-light input::placeholder {
          color: #a1a1aa !important;
        }
        .mobile-profile-light [class*="text-[#FFD54A]"],
        .mobile-profile-light [class*="text-[#FFE27A]"],
        .mobile-profile-light [class*="text-[#E7C84B]"] {
          color: #8a6a00 !important;
        }
        .mobile-profile-light [class*="border-[#FFD54A]"] {
          border-color: rgba(138, 106, 0, 0.28) !important;
        }
      `}</style>
<style>{`
.mp-clean { --mp-panel:#151718; --mp-line:rgba(255,255,255,.08); --mp-muted:#a1a1aa; --mp-hover:rgba(255,255,255,.04); }
.mp-clean.mobile-profile-light { --mp-panel:#fff; --mp-line:rgba(24,24,27,.10); --mp-muted:#71717a; --mp-hover:rgba(24,24,27,.035); }
.mp-surface { background:var(--mp-panel);border:1px solid var(--mp-line);border-radius:20px; }
.mp-clean details > summary { list-style:none;cursor:pointer; }
.mp-clean details > summary::-webkit-details-marker { display:none; }
.mp-clean details[open] > summary .mp-chevron { transform:rotate(90deg); }
.mp-clean .mp-chevron { transition:transform .15s; }
.mp-clean .mp-row { display:flex;align-items:center;gap:12px;width:100%;min-height:52px;padding:12px 16px;text-align:left;border-bottom:1px solid var(--mp-line); }
.mp-clean .mp-row:last-child { border-bottom:0; }
.mp-clean .mp-row:hover { background:var(--mp-hover); }
.mp-clean .mp-muted { color:var(--mp-muted); }
.mp-clean .mp-edit-actions button { min-height:44px;margin:0;box-shadow:none;background:transparent;color:inherit;border-color:var(--mp-line); }
.mp-clean .mp-edit-actions button:first-child { grid-column:1 / -1; }
.mp-clean .mp-profile-editor{position:relative;display:flow-root;clear:both;isolation:isolate;box-sizing:border-box;width:100%;min-width:0;margin:0 0 16px;padding:16px 0;border-top:1px solid var(--mp-line);overflow-wrap:anywhere;scroll-margin-top:calc(var(--kayou-header-bottom,64px) + 12px)}
.mp-clean .mp-profile-fields{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.mp-clean .mp-profile-fields label{position:static;display:flex;min-width:0;flex-direction:column}
.mp-clean .mp-profile-fields input{position:static;display:block;box-sizing:border-box;width:100%;min-width:0;min-height:44px;font-size:16px;line-height:1.5}
.mp-clean .mp-profile-editor .mp-edit-actions{display:flex;flex-wrap:wrap;gap:8px}
.mp-clean .mp-profile-editor .mp-edit-actions button{position:static;flex:1 1 140px;min-width:0;white-space:normal}
.mp-clean .mp-profile-editor .mp-edit-actions button:first-child{flex-basis:100%}
@media(prefers-reduced-motion:reduce){.mp-clean .mp-chevron{transition:none}}
`}</style>
<div className="w-full px-4 pb-6 sm:px-6">
<header className="pt-4 sm:pt-6">
<div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[hsl(var(--primary))]">Reminder that i love and appreciate you! -keegan</div>
  <div className="flex items-center gap-4 py-5 sm:py-6">
    <ProfileAvatar profile={profile} src={avatar} alt="Your avatar" className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover shadow-lg" />
    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h1 className="truncate text-2xl font-semibold tracking-tight">{displayName}</h1>{verification && <CardImage src={verification.badge} alt={verification.label} title={verification.label} className="h-5 w-5 shrink-0" />}</div><p className="mp-muted mt-1 truncate text-xs">{discord ? `@${discord}` : "No Discord username set"}</p>{vacationMode && <p className="mt-1 text-xs text-[hsl(var(--primary))]">Vacation mode on</p>}</div>
    <div className="flex shrink-0 flex-col items-center gap-2" aria-label="Profile notifications">
      {isModerator && <button type="button" onClick={() => navigate("/leaderboard-moderation")} aria-label={`Open moderation, ${moderationNotificationCount} unread notifications`} title="Moderation" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mp-line)] text-[hsl(var(--primary))] transition-colors hover:bg-[var(--mp-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Shield size={19} aria-hidden="true"/>{moderationNotificationCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">{moderationNotificationCount > 99 ? "99+" : moderationNotificationCount}</span>}</button>}
      <button type="button" onClick={() => navigate("/inbox")} aria-label={`Open inbox, ${inboxNotificationCount} unread notifications`} title="Inbox" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mp-line)] transition-colors hover:bg-[var(--mp-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><Inbox size={19} aria-hidden="true"/>{inboxNotificationCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">{inboxNotificationCount > 99 ? "99+" : inboxNotificationCount}</span>}</button>
    </div>
  </div>
  <div className="flex flex-wrap gap-2 pb-4">
    <button type="button" onClick={()=>navigate("/Personal/change-avatar")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium"><Pencil size={13}/>Avatar</button>
    <button type="button" onClick={()=>navigate("/Personal/change-avatar?tab=frames")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium"><Sparkles size={13}/>Frames</button>
    <button type="button" ref={editProfileTrigger} disabled={editingProfile || savingProfile} aria-expanded={editingProfile} aria-controls={editingProfile ? "mp-profile-editor" : undefined} onClick={() => { setPageChoice(null); setUsernameDraft(profile?.username || ""); setDiscordDraft(discord); setEditingProfile(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 text-xs font-semibold text-[hsl(var(--primary-foreground))]">Edit profile<ChevronRight size={13}/></button>
<button type="button" disabled={!profile?.username}
                onClick={() => {
                  const url = `https://www.mlpekayou.community/${encodeURIComponent(
                    profile?.username ?? "",
                  )}`;
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
                }}
                className={`inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--mp-line)] px-3 text-xs font-medium transition-colors disabled:opacity-50 ${copied ? "text-emerald-600 dark:text-emerald-400" : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"}`}
              >
                <span>{copied ? "Copied" : "Share Profile"}</span>
              </button>
  </div>
{editingProfile && <section id="mp-profile-editor" aria-labelledby="mp-edit-profile-heading" className="mp-profile-editor">
<div className="flex items-center justify-between gap-3"><h2 id="mp-edit-profile-heading" className="text-base font-semibold">Edit profile</h2><button type="button" disabled={savingProfile} onClick={() => { setUsernameDraft(profile?.username || ""); setDiscordDraft(discord); setEditingProfile(false); window.setTimeout(() => editProfileTrigger.current?.focus(), 0); }} className="mp-muted min-h-10 px-2 text-sm disabled:opacity-50">Cancel</button></div>
<div className="pt-4">
{editingProfile && (
                  <div
                    className="w-full"
                  >
                    <div className="mp-profile-fields">
                      <label className="block">
                        <span
                          className={`mb-1.5 block text-sm font-medium ${isLightMode ? "text-zinc-800" : "text-zinc-200"}`}
                        >
                          MLPEKAYOU Username
                        </span>
                        <input
                          value={usernameDraft}
                          onChange={(e) => setUsernameDraft(e.target.value)}
                          className="w-full rounded-xl border px-3 py-2.5 text-base font-medium outline-none transition-colors focus:border-[#8a6a00]/50"
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
                          className="w-full rounded-xl border px-3 py-2.5 text-base outline-none transition-colors focus:border-[#8a6a00]/50"
                          placeholder={
                            tradeAccessRevoked
                              ? "Trading access revoked"
                              : "Your Discord username"
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
<div className="mp-edit-actions mt-3 grid grid-cols-2 gap-2">
<button type="button" disabled={savingProfile}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
                  editingProfile
                    ? "border-[#FFD54A] bg-[#FFD54A] text-black shadow-[0_0_18px_rgba(255,213,74,0.18)]"
                    : "border-[#FFD54A]/20 bg-[#191a1b] text-zinc-300 hover:border-[#FFD54A]/60 hover:bg-[#202122] hover:text-white"
                }`}
                onClick={async () => {
                  if (editingProfile) {
                    setSavingProfile(true);
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (session?.user) {
                      const originalUsername = profile?.username || "";
                      const nextUsername = usernameDraft.trim();
                      const {
                        data: existingUsername,
                        error: usernameCheckError,
                      } = await supabase
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
                        .update({
                          username: nextUsername,
                        })
                        .eq("id", session.user.id);
                      if (usernameError) {
                        if (
                          usernameError.code === "23505" ||
                          usernameError.message
                            .toLowerCase()
                            .includes("duplicate")
                        ) {
                          setUsernameDraft(originalUsername);
                          setShowUsernameTakenModal(true);
                        } else {
                          console.error(
                            "Failed to save username:",
                            usernameError,
                          );
                        }
                        setSavingProfile(false);
                        return;
                      }
                      const { error: authUsernameError } =
                        await supabase.auth.updateUser({
                          data: {
                            username: nextUsername,
                          },
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
                            {
                              onConflict: "user_id",
                            },
                          );
                      if (tradingError) {
                        console.error(
                          "Failed to save Discord username:",
                          tradingError,
                        );
                        setSavingProfile(false);
                        return;
                      }
                      setProfile((prev: any) => ({
                        ...prev,
                        username: nextUsername,
                      }));
                      setUsernameDraft(nextUsername);
                      setDiscord(discordDraft);
                    }
                    setSavingProfile(false);
                  }
                  setEditingProfile(!editingProfile);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>
                  {editingProfile
                    ? savingProfile
                      ? "Saving..."
                      : "Save"
                    : "Edit Names"}
                </span>
              </button>
<button type="button" onClick={()=>navigate("/Personal/change-avatar")} className="rounded-xl border px-3 py-2 text-xs font-medium">Change avatar</button>
<button type="button" onClick={()=>navigate("/Personal/change-avatar?tab=frames")} className="rounded-xl border px-3 py-2 text-xs font-medium">Choose frame</button>
</div>
</div></section>}
  <div className="grid grid-cols-3 border-t border-[var(--mp-line)] py-4">
    {[["English Cards",stats.owned],["Chinese Cards",stats.chineseOwned],["Sets Mastered",stats.completed]].map(([label,value]) => <div key={label} className="min-w-0 px-1 text-center"><p className="text-xl font-semibold tabular-nums text-[hsl(var(--primary))]">{profileLoads.stats && !profileLoadErrors.stats ? Number(value).toLocaleString() : "--"}</p><p className="mp-muted mt-1 text-[10px] font-medium">{label}</p></div>)}
  </div>
</header>
{(tradeAccessRevoked || (!loadingLeaderboardBan && leaderboardBanned)) && <section aria-label="Account restrictions" className={`my-4 border-y px-1 py-4 text-sm leading-6 ${isLightMode ? "border-red-300 text-red-800" : "border-red-500/30 text-red-200"}`}>
{tradeAccessRevoked && <div><h2 className="font-semibold">Trading post access restricted</h2><p className="mt-1">{offerStrikeCount >= 3 ? "Your trading access was revoked after three unanswered offers expired." : "Your account cannot use the trading posts while this restriction is active."}</p></div>}
{!loadingLeaderboardBan && leaderboardBanned && <div className={tradeAccessRevoked ? "mt-4" : undefined}><h2 className="font-semibold">English leaderboard access restricted</h2><p className="mt-1">Your account is currently excluded from the English leaderboards. This does not exclude you from the Chinese leaderboard.</p></div>}
<p className="mt-3">For details or to appeal, open a ticket in the <a href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">MLPEKAYOU Discord server</a>.</p>
</section>}
<EnglishLeaderboardAppealForm restricted={leaderboardBanned} onReinstated={() => setLeaderboardBanned(false)}/>
<section aria-label="Profile pages">
  <div className="grid grid-cols-2 gap-3">
    {collectionPages.map(item => <button key={item.title} type="button" onClick={event => openPageChoice(item, event.currentTarget)} aria-haspopup="menu" aria-expanded={pageChoice?.title === item.title} aria-controls={pageChoice?.title === item.title ? "mp-page-language-menu" : undefined} className="mp-surface group flex min-h-[90px] flex-col items-start justify-center p-4 text-left transition-colors hover:border-[hsl(var(--primary))]/40">
      <span className="text-sm font-semibold">{item.title}</span><span className="mp-muted mt-1 text-[11px] leading-5">{item.subtitle}</span>
    </button>)}
    <button type="button" onClick={() => navigate("/support-mlpekayou")} className="mp-surface group flex min-h-[90px] flex-col items-start justify-center p-4 text-left transition-colors hover:border-[hsl(var(--primary))]/40"><span className="text-sm font-semibold">Support MLPEKAYOU</span><span className="mp-muted mt-1 text-[11px] leading-5">Shop partners and upcoming rewards</span></button>
  </div>
</section>
{pageChoice && createPortal(<div ref={pageChoiceMenu} id="mp-page-language-menu" role="menu" aria-label={`${pageChoice.title}: choose a language`} className={`mp-page-language-menu ${isLightMode ? "mp-page-language-menu-light" : ""}`} style={{ left: pageChoicePosition.left, top: pageChoicePosition.top, transformOrigin: pageChoicePosition.origin }} onKeyDown={event => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
  const current = options.indexOf(document.activeElement as HTMLButtonElement);
  const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length;
  options[next]?.focus();
}}>{[{ label: "English", path: pageChoice.english }, { label: "Chinese", path: pageChoice.chinese }].map(option => <button key={option.path} type="button" role="menuitem" onClick={() => { setPageChoice(null); pageChoiceTrigger.current?.focus(); navigate(option.path); }}>{option.label}</button>)}</div>, document.body)}
<details className="mp-surface mt-3 overflow-hidden"><summary className="flex min-h-14 items-center justify-between gap-3 px-4 py-4"><span><span className="block text-sm font-semibold">Preferences &amp; trading</span><span className="mp-muted mt-1 block text-xs">Notifications, vacation mode, and account standing</span></span><ChevronRight size={16} className="mp-chevron mp-muted" aria-hidden="true" /></summary><div className="border-t border-white/[0.08]">
<button type="button" disabled={pushBusy} onClick={()=>void(pushEnabled?disablePushNotifications():enablePushNotifications())} className="mp-row disabled:opacity-50"><Bell size={17} className="mp-muted"/><span className="flex-1 text-sm">Notifications</span><span className="text-xs font-medium text-[hsl(var(--primary))]">{pushBusy?"Updating...":pushEnabled?"On":"Off"}</span></button>
{pushStatusMessage && <p role="status" className="mp-muted px-4 py-3 text-xs leading-5">{pushStatusMessage}</p>}
<button type="button" disabled={!vacationLoaded||vacationBusy} onClick={()=>void toggleVacationMode()} aria-pressed={vacationMode} className="mp-row disabled:opacity-50"><span className="flex-1 text-sm">Vacation mode</span><span className="text-xs font-medium text-[hsl(var(--primary))]">{vacationBusy?"Saving...":vacationMode?"On":"Off"}</span></button>
<p className="mp-muted px-4 py-2 text-xs leading-5">Hide your trade and sale cards while you are away.</p>{vacationError && <p role="alert" className="px-4 py-2 text-xs text-red-400">{vacationError}</p>}
<button type="button" onClick={()=>setShowOfferStrikeInfo(true)} className="mp-row"><span className="flex-1 text-sm">Offer response strikes</span><span className={`text-xs font-semibold ${offerStrikeCount>=2?"text-red-400":"mp-muted"}`}>{offerStrikeCount}/3</span><ChevronRight size={15} className="mp-muted"/></button>
</div></details>
{offerStrikeCount>=2 && <button type="button" onClick={()=>setShowOfferStrikeInfo(true)} className="mt-3 w-full rounded-xl border border-red-500/25 px-4 py-3 text-left text-xs text-red-400">You have {offerStrikeCount}/3 offer response strikes. Tap for details.</button>}
{(lgsAccess!==null||canReviewLGS) && <section className="mp-surface mt-4 overflow-hidden" aria-label="Staff tools">{lgsAccess!==null && <button type="button" onClick={()=>navigate("/lgs-boards")} className="mp-row"><Store size={17} className="mp-muted"/><span className="flex-1 text-sm">LGS Boards</span><ChevronRight size={16} className="mp-muted"/></button>}{canReviewLGS && <button type="button" onClick={()=>setShowLGSReview(true)} className="mp-row"><Shield size={17} className="mp-muted"/><span className="flex-1 text-sm">LGS Applications</span><ChevronRight size={16} className="mp-muted"/></button>}</section>}
<details className="mp-surface mt-3 overflow-hidden"><summary className="flex min-h-14 items-center justify-between gap-3 px-4 py-4"><span><span className="block text-sm font-semibold">Help &amp; account</span><span className="mp-muted mt-1 block text-xs">Bug reports and account controls</span></span><ChevronRight size={16} className="mp-chevron mp-muted" aria-hidden="true" /></summary><div className="border-t border-white/[0.08]"><button type="button" onClick={()=>setShowBugReport(true)} className="mp-row"><Bug size={17} className="text-red-400"/><span className="flex-1 text-sm">Report a bug</span><ChevronRight size={16} className="mp-muted"/></button><button type="button" onClick={async()=>{await supabase.auth.signOut({scope:"local"});navigate("/");}} className="mp-row"><LogOut size={17} className="mp-muted"/><span className="text-sm">Log out</span></button><div className="border-t border-white/[0.08] px-4 py-3"><button type="button" disabled={deletionRequested} onClick={()=>setShowDeletionModal(true)} className="min-h-11 text-xs font-medium text-red-400 disabled:opacity-50">{deletionRequested?"Deletion request pending":"Request account deletion"}</button></div></div></details>
{profile?.bio && <p className="mp-muted mt-5 px-1 text-xs leading-6">{profile.bio}</p>}
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
            aria-labelledby="mobile-offer-strikes-title"
            className={`max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border p-5 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/[0.10] bg-[#151718] text-white"}`}
          >
            <h2
              id="mobile-offer-strikes-title"
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
{showBugReport && (
        <div
          className={`fixed inset-0 z-[30000] flex items-center justify-center px-4 backdrop-blur-md ${
            isLightMode ? "bg-white/15" : "bg-black/55"
          }`}
          onClick={() => setShowBugReport(false)}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.28)] ${
              isLightMode
                ? "border-red-900/10 bg-white text-zinc-900"
                : "border-white/[0.10] bg-[#151718] text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-xl font-semibold tracking-tight ${isLightMode ? "text-red-700" : "text-white"}`}
            >
              Report a Bug
            </h2>
            <p
              className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              If you need to contact the developer, you can join the MLPEKAYOU
              Discord Server or email mlpekayou@gmail.com.
            </p>
            <p
              className={`mt-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}
            >
              Please reserve these communications for serious inquiries such as
              bugs, glitches, account issues, or Discord server issues.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowBugReport(false)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  isLightMode
                    ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://discord.gg/mlpekayou",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  isLightMode
                    ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700] hover:bg-[#c89d13]/20"
                    : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A] hover:bg-[#FFD54A]/15"
                }`}
              >
                Join Discord
              </button>
            </div>
            <a
              href="mailto:mlpekayou@gmail.com"
              className={`mt-3 block w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors ${
                isLightMode
                  ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                  : "border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.05]"
              }`}
            >
              Email Developer
            </a>
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
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${isLightMode ? "border-[#8a6a00]/20 bg-white text-zinc-900" : "border-[#FFD54A]/25 bg-[#151718] text-white"}`}
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
{showPushEnabledModal && (
        <div
          className={`fixed inset-0 z-[135] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/25" : "bg-black/80"
          }`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setShowPushEnabledModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="push-enabled-title"
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-[#8a6a00]/20 bg-white text-zinc-900"
                : "border-[#FFD54A]/25 bg-[#151718] text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD54A]/15 text-[#FFD54A]">
                <Bell size={22} aria-hidden="true" />
              </span>
              <h2
                id="push-enabled-title"
                className="text-xl font-semibold tracking-tight"
              >
                Notifications enabled
              </h2>
            </div>
            <p
              className={`mt-4 text-sm leading-6 ${
                isLightMode ? "text-zinc-600" : "text-zinc-300"
              }`}
            >
              MLPEKAYOU can now notify you about messages, friend requests, and
              trade offers. To turn notifications off later, tap Edit Names and
              use the alarm bell switch.
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setShowPushEnabledModal(false)}
              className="mt-6 w-full rounded-xl border border-[#FFD54A]/30 bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
{showDeletionModal && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md ${
            isLightMode ? "bg-white/20" : "bg-black/80"
          }`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submittingDeletion) {
              setShowDeletionModal(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)] ${
              isLightMode
                ? "border-red-200 bg-white text-zinc-900"
                : "border-red-500/25 bg-[#151718] text-white"
            }`}
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
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${
                  isLightMode
                    ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
                }`}
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
{canReviewLGS && showLGSReview && (
        <LGSApproveDeny
          isLightMode={isLightMode}
          onClose={() => setShowLGSReview(false)}
        />
      )}
</main>
  );
};
function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#232323] p-5 text-center">
      <div className="text-2xl font-bold text-[#d4af37]">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
        {label}
      </div>
    </div>
  );
}
function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-[#232323] p-8 text-center">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-300">Future section</p>
    </div>
  );
}
export default MobileProfile;
function ProfileLoadingScreen({
  light,
  spooky,
  failed,
}: {
  light: boolean;
  spooky: boolean;
  failed: boolean;
}) {
  const logo = light
    ? "/website-assets/mlpekayouwiki4.webp"
    : spooky
      ? "/website-assets/nightmarelogo.webp"
      : "/website-assets/darkmodelogo.webp";
  return (
    <div
      className={`profile-loading-screen${light ? " profile-loading-light" : ""}${spooky ? " profile-loading-spooky" : ""}`}
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
function supportsWebPush() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}
function isIosBrowser() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
function isStandaloneApp() {
  const standaloneNavigator = navigator as Navigator & {
    standalone?: boolean;
  };
  return (
    standaloneNavigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}
function getExistingPushRegistration() {
  return navigator.serviceWorker.getRegistration(PUSH_SCOPE);
}
async function getPushRegistration() {
  const registration = await navigator.serviceWorker.register(
    PUSH_SERVICE_WORKER,
    { scope: PUSH_SCOPE },
  );
  if (registration.active) return registration;
  const worker = registration.installing ?? registration.waiting;
  if (!worker) return registration;
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Push service worker did not become active")),
      10000,
    );
    const handleStateChange = () => {
      if (worker.state === "activated") {
        window.clearTimeout(timeout);
        worker.removeEventListener("statechange", handleStateChange);
        resolve();
      } else if (worker.state === "redundant") {
        window.clearTimeout(timeout);
        worker.removeEventListener("statechange", handleStateChange);
        reject(new Error("Push service worker registration failed"));
      }
    };
    worker.addEventListener("statechange", handleStateChange);
    handleStateChange();
  });
  return registration;
}
function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = window.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}
