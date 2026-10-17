import ProfileAvatar from "@/components/ProfileAvatar";
import { onAuthIdentityChange } from "@/lib/auth-identity";
import CardImage from "@/components/CardImage";
import { createPortal } from "react-dom";
import LGSApproveDeny from "@/pages/Pop-Ups/LGSApproveDeny";
import PinkieParty from "@/pages/Game/Pinkie-Party";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ShoppingBag,
  Shield,
  Bug,
  Gamepad2,
  ChevronDown,
  Store,
  Home,
  Trophy,
  Medal,
  Tag,
  ArrowLeftRight,
  Users,
  User,
  Search,
  Sparkles,
  CalendarDays,
  Mail,
  BarChart3,
  Library,
  BookOpen,
  Heart,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRef } from "react";
import { getProfileAssets } from "../pages/Everypony/profile-assets";
const logo = "/website-assets/mlpekayouwiki4.webp";
const KayouHeader = () => {
  const [staffAccess, setStaffAccess] = useState<{
    userId: string;
    lgs: boolean;
    moderator: boolean;
  } | null>(null);
  const [showHeaderLgs, setShowHeaderLgs] = useState(false);
  const [showLGSReview, setShowLGSReview] = useState(false);
  const headerStaffRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [inboxNotificationCount, setInboxNotificationCount] = useState(0);
  const notificationAudio = useRef<AudioContext | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isSpookyMode, setIsSpookyMode] = useState(false);
  const [spookyUnlocked, setSpookyUnlocked] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    return sessionStorage.getItem("avatar");
  });
  const [showMobileLeaderboardMenu, setShowMobileLeaderboardMenu] =
    useState(false);
  const [showMobileHomeMenu, setShowMobileHomeMenu] = useState(false);
  const [showMobileProgressMenu, setShowMobileProgressMenu] = useState(false);
  const [showMobileIsoMenu, setShowMobileIsoMenu] = useState(false);
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showExistingAccount, setShowExistingAccount] = useState(false);
  const [showUnconfirmedEmail, setShowUnconfirmedEmail] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showResetSent, setShowResetSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showPinkieParty, setShowPinkieParty] = useState(false);
  const miniGamesRef = useRef<HTMLDivElement>(null);
  const miniGameButtonRef = useRef<HTMLButtonElement>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [showTradesMenu, setShowTradesMenu] = useState(false);
  const [showIsoMenu, setShowIsoMenu] = useState(false);
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);
  const [showProgressMenu, setShowProgressMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { avatar: profileAvatar, verification } = getProfileAssets(
    profile ?? {},
  );
  const notificationCountLabel =
    inboxNotificationCount > 99 ? "99+" : String(inboxNotificationCount);
  const emitNotificationChime = (audio: AudioContext) => {
    const now = audio.currentTime;
    const playTone = (
      frequency: number,
      start: number,
      duration: number,
      volume: number,
    ) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.01);
    };
    playTone(740, now, 0.2, 0.3);
    playTone(988, now + 0.11, 0.26, 0.26);
  };
  const playNotificationSound = () => {
    const audio = notificationAudio.current;
    if (!audio || audio.state === "closed") return;
    if (audio.state === "suspended") {
      void audio
        .resume()
        .then(() => emitNotificationChime(audio))
        .catch(() => undefined);
      return;
    }
    emitNotificationChime(audio);
  };
  const canUseLgs =
    !!user && staffAccess?.userId === user.id && staffAccess.lgs;
  const canModerate =
    !!user && staffAccess?.userId === user.id && staffAccess.moderator;
  const canReviewLGS = user?.id === "17e57e39-bc0c-44e7-b373-ac34c6690185";
  const [lgsIntroUserId, setLgsIntroUserId] = useState<string | null>(null);
  const [lgsIntroLine, setLgsIntroLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const lgsIntroRef = useRef<HTMLDivElement>(null);
  const lgsIntroShown = useRef(new Set<string>());
  const lgsIntroVisible = lgsIntroUserId === user?.id && canUseLgs;
  const saveLgsDiscovery = async (accountId: string, opened: boolean) => {
    const stamp = new Date().toISOString();
    try {
      localStorage.setItem(`mlpekayou:lgs-intro:${accountId}`, stamp);
      if (opened) localStorage.setItem(`mlpekayou:lgs-opened:${accountId}`, stamp);
    } catch {}
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || data.user?.id !== accountId) return;
      const metadata: Record<string, string> = { lgs_boards_intro_seen_at: stamp };
      if (opened) metadata.lgs_boards_opened_at = stamp;
      const result = await supabase.auth.updateUser({ data: metadata });
      if (result.error) console.error("Unable to save LGS introduction preference:", result.error);
    } catch (error) {
      console.error("Unable to save LGS introduction preference:", error);
    }
  };
  useEffect(() => {
    setLgsIntroUserId(null);
    if (!user?.id || !canUseLgs) return;
    const accountId = user.id;
    if (location.pathname === "/lgs-boards" || location.pathname.startsWith("/lgs-boards/")) {
      lgsIntroShown.current.add(accountId);
      void saveLgsDiscovery(accountId, true);
      return;
    }
    let cancelled = false;
    const desktop = window.matchMedia("(min-width: 768px)");
    const check = async () => {
      if (!desktop.matches || lgsIntroShown.current.has(accountId)) return;
      try {
        if (localStorage.getItem(`mlpekayou:lgs-intro:${accountId}`) || localStorage.getItem(`mlpekayou:lgs-opened:${accountId}`)) return;
      } catch {}
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error || data.user?.id !== accountId || !desktop.matches) return;
      if (data.user.user_metadata?.lgs_boards_intro_seen_at || data.user.user_metadata?.lgs_boards_opened_at) return;
      const target = headerStaffRef.current?.querySelector<HTMLElement>(".kayou-lgs-access");
      if (!target || target.getBoundingClientRect().width === 0 || lgsIntroShown.current.has(accountId)) return;
      lgsIntroShown.current.add(accountId);
      setLgsIntroUserId(accountId);
      void saveLgsDiscovery(accountId, false);
    };
    const timer = window.setTimeout(() => { void check().catch(console.error); }, 900);
    const resized = () => {
      if (!desktop.matches) setLgsIntroUserId(null);
      else void check().catch(console.error);
    };
    desktop.addEventListener("change", resized);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      desktop.removeEventListener("change", resized);
    };
  }, [user?.id, canUseLgs, location.pathname]);
  useEffect(() => {
    if (!lgsIntroVisible) return;
    const panel = lgsIntroRef.current;
    const target = headerStaffRef.current?.querySelector<HTMLElement>(".kayou-lgs-access");
    if (!panel || !target) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const update = () => {
      const button = target.getBoundingClientRect();
      const popup = panel.getBoundingClientRect();
      setLgsIntroLine({ x1: Math.max(popup.left + 24, Math.min(popup.right - 24, button.left + button.width / 2)), y1: popup.top, x2: button.left + button.width / 2, y2: button.bottom + 6 });
    };
    update();
    panel.querySelector<HTMLButtonElement>("button")?.focus();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    observer.observe(target);
    window.addEventListener("resize", update);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setLgsIntroUserId(null); }
      if (event.key !== "Tab") return;
      const buttons = panel.querySelectorAll<HTMLButtonElement>("button");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.removeEventListener("keydown", keydown, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [lgsIntroVisible]);
  useEffect(() => {
    let active = true;
    let request = 0;
    const refresh = async () => {
      const ticket = ++request;
      setStaffAccess(null);
      if (!user?.id) return;
      const db = supabase as unknown as SupabaseClient;
      try {
        const [lgs, moderator] = await Promise.all([
          db
            .from("lgs_staff")
            .select("role, store_id")
            .eq("user_id", user.id)
            .eq("active", true)
            .maybeSingle(),
          db
            .from("leaderboard_moderators")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);
        if (!active || ticket !== request) return;
        setStaffAccess({
          userId: user.id,
          lgs:
            !lgs.error &&
            !!lgs.data &&
            (lgs.data.role === "ALLGS" ||
              (lgs.data.role === "STAFF" && !!lgs.data.store_id)),
          moderator: !moderator.error && !!moderator.data,
        });
      } catch {
        if (active && ticket === request) setStaffAccess(null);
      }
    };
    setShowHeaderLgs(false);
    setShowLGSReview(false);
    void refresh();
    return () => {
      active = false;
      ++request;
    };
  }, [user?.id]);
  useEffect(() => {
    if (!showHeaderLgs) return;
    const close = (event: MouseEvent) => {
      if (!headerStaffRef.current?.contains(event.target as Node))
        setShowHeaderLgs(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowHeaderLgs(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [showHeaderLgs]);
  const getProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      const { avatar } = getProfileAssets(data);
      setAvatarSrc((prev) => {
        if (prev === avatar) return prev;
        sessionStorage.setItem("avatar", avatar);
        return avatar;
      });
    }
    setProfile(data);
  };
  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        avatar_url?: string;
        avatar_frame?: string | null;
        username?: string;
      }>;
      const updates = customEvent.detail || {};
      if (updates.avatar_url) {
        const { avatar } = getProfileAssets({
          ...profile,
          ...updates,
        });
        setAvatarSrc(avatar);
        sessionStorage.setItem("avatar", avatar);
      }
      setProfile((prev: any) => ({
        ...prev,
        ...updates,
      }));
    };
    window.addEventListener(
      "profile-updated",
      handleProfileUpdated as EventListener,
    );
    return () => {
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdated as EventListener,
      );
    };
  }, [profile?.username]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowIsoMenu(false);
        setShowTradesMenu(false);
        setShowLeaderboardMenu(false);
        setShowProgressMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (!showMiniGames) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!miniGamesRef.current?.contains(event.target as Node)) {
        setShowMiniGames(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowMiniGames(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showMiniGames]);
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getProfile(currentUser.id);
      }
    };
    getSession();
    const {
      data: { subscription },
    } = onAuthIdentityChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getProfile(currentUser.id);
      } else {
        setProfile(null);
        setAvatarSrc(null);
        sessionStorage.removeItem("avatar");
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const unlockAudio = () => {
      try {
        if (!notificationAudio.current) {
          const AudioContextConstructor =
            window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextConstructor) return;
          notificationAudio.current = new AudioContextConstructor();
        }
        const audio = notificationAudio.current;
        if (audio.state === "suspended") {
          void audio.resume();
        }
        const silentBuffer = audio.createBuffer(1, 1, 22050);
        const silentSource = audio.createBufferSource();
        silentSource.buffer = silentBuffer;
        silentSource.connect(audio.destination);
        silentSource.start(0);
      } catch {
        notificationAudio.current = null;
      }
    };
    const resumeVisibleAudio = () => {
      if (
        document.visibilityState === "visible" &&
        notificationAudio.current?.state === "suspended"
      ) {
        void notificationAudio.current.resume();
      }
    };
    window.addEventListener("touchend", unlockAudio, { passive: true });
    window.addEventListener("pointerup", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("pageshow", resumeVisibleAudio);
    document.addEventListener("visibilitychange", resumeVisibleAudio);
    return () => {
      window.removeEventListener("touchend", unlockAudio);
      window.removeEventListener("pointerup", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("pageshow", resumeVisibleAudio);
      document.removeEventListener("visibilitychange", resumeVisibleAudio);
    };
  }, []);
  useEffect(() => {
    if (!user?.id) {
      setInboxNotificationCount(0);
      return;
    }
    let active = true;
    const refreshInboxCount = async () => {
      const [messagesResult, requestsResult, offersResult] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver", user.id)
          .is("read_at", null),
        supabase
          .from("friend_requests")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("trade_offers")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString()),
      ]);
      if (!active) return;
      setInboxNotificationCount(
        (messagesResult.count ?? 0) +
          (requestsResult.count ?? 0) +
          (offersResult.count ?? 0),
      );
    };
    const handleMessageChange = (payload: any) => {
      void refreshInboxCount();
      if (
        payload.eventType === "INSERT" &&
        payload.new?.receiver === user.id &&
        payload.new?.read_at == null
      ) {
        playNotificationSound();
      }
    };
    const handleFriendRequestChange = (payload: any) => {
      void refreshInboxCount();
      if (
        payload.eventType === "INSERT" &&
        payload.new?.receiver_id === user.id &&
        payload.new?.status === "pending"
      ) {
        playNotificationSound();
      }
    };
    const handleTradeOfferChange = (payload: any) => {
      void refreshInboxCount();
      if (
        payload.eventType === "INSERT" &&
        payload.new?.recipient_id === user.id &&
        payload.new?.status === "pending"
      ) {
        playNotificationSound();
      }
    };
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const connect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!active || error || !session?.access_token || session.user.id !== user.id) return;
        await supabase.realtime.setAuth(session.access_token);
        if (!active) return;
        channel = supabase
          .channel(`header-inbox-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
              filter: `receiver=eq.${user.id}`,
            },
            handleMessageChange,
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "friend_requests",
              filter: `receiver_id=eq.${user.id}`,
            },
            handleFriendRequestChange,
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "trade_offers",
              filter: `recipient_id=eq.${user.id}`,
            },
            handleTradeOfferChange,
          )
          .subscribe();
      } catch (error) {
        if (active) console.error("Unable to connect inbox updates:", error);
      }
    };
    void connect();
    const refresh = () => void refreshInboxCount();
    void refreshInboxCount();
    window.addEventListener("header-message-update", refresh);
    window.addEventListener("header-inbox-update", refresh);
    return () => {
      active = false;
      window.removeEventListener("header-message-update", refresh);
      window.removeEventListener("header-inbox-update", refresh);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [user?.id]);
  useEffect(() => {
    const hasSeen = localStorage.getItem("seenAnnouncement");
    if (!hasSeen) {
      setShowMobilePrompt(true);
    }
  }, []);
  useEffect(() => {
    if (!profile?.avatar_url) return;
    const { avatar } = getProfileAssets(profile);
    if (avatar !== avatarSrc) {
      setAvatarSrc(avatar);
      sessionStorage.setItem("avatar", avatar);
    }
  }, [profile?.avatar_url]);
  useEffect(() => {
    sessionStorage.removeItem("spiderDismissed");
  }, []);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (mobileNavCollapsed) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            setMobileNavCollapsed(true);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileNavCollapsed]);
  const handleLoginSubmit = async () => {
    if (authSubmitting) return;
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) {
        const errorCode = (error as any).code;
        const unconfirmedEmail =
          errorCode === "email_not_confirmed" ||
          /email not confirmed|email.*not.*confirm/i.test(error.message);
        if (unconfirmedEmail) {
          setShowLogin(false);
          setLoginError("");
          setShowForgot(false);
          setShowUnconfirmedEmail(true);
          return;
        }
        setLoginError("Incorrect password");
        setShowForgot(true);
        return;
      }
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
      setShowForgot(false);
    } finally {
      setAuthSubmitting(false);
    }
  };
  const handleForgotPassword = async () => {
    if (resetSubmitting) return;
    setResetSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        loginEmail.trim(),
        {
          redirectTo: window.location.origin + "/password-reset",
        },
      );
      if (error) {
        alert("Error sending reset: " + error.message);
      } else {
        setShowLogin(false);
        setShowResetSent(true);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setResetSubmitting(false);
    }
  };
  const handleSignupSubmit = async () => {
    if (authSubmitting) return;
    if (loginPassword !== confirmPassword) {
      setLoginError("Passwords do not match");
      return;
    }
    setAuthSubmitting(true);
    try {
      const normalizedEmail = loginEmail.trim().toLowerCase();
      const { data: hasUnconfirmedEmail, error: emailStatusError } =
        await supabase.rpc("is_unconfirmed_signup_email", {
          candidate_email: normalizedEmail,
        });
      if (emailStatusError) {
        setLoginError(
          "Unable to check that email right now. Please try again.",
        );
        return;
      }
      if (hasUnconfirmedEmail) {
        setShowLogin(false);
        setLoginError("");
        setShowUnconfirmedEmail(true);
        return;
      }
      const { data: signupData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: loginPassword,
        options: {
          emailRedirectTo: window.location.origin + "/account-confirmation",
        },
      });
      if (error) {
        const errorCode = (error as any).code;
        const existingAccount =
          errorCode === "user_already_exists" ||
          /already registered|already exists|duplicate/i.test(error.message);
        if (existingAccount) {
          setShowLogin(false);
          setShowExistingAccount(true);
          return;
        }
        setLoginError(error.message);
        return;
      }
      if (signupData.user?.identities?.length === 0) {
        setShowLogin(false);
        setShowExistingAccount(true);
        return;
      }
      setShowLogin(false);
      setShowSignupSuccess(true);
      setLoginEmail("");
      setLoginPassword("");
      setConfirmPassword("");
    } finally {
      setAuthSubmitting(false);
    }
  };
  const requestNavigation = (path: string) => {
    const event = new CustomEvent("mlpekayou:before-navigation", {
      detail: { destination: path },
      cancelable: true,
    });
    if (window.dispatchEvent(event)) {
      navigate(path);
    }
  };
  const goHome = () => {
    setShowMobileProgressMenu(false);
    setShowMobileIsoMenu(false);
    setShowMobileLeaderboardMenu(false);
    setShowMobileHomeMenu(false);
    setShowTradesMenu(false);
    setShowIsoMenu(false);
    setShowLeaderboardMenu(false);
    setShowProgressMenu(false);
    setOpen(false);
    navigate("/", { replace: false });
  };
  const requireLogin = (path: string) => {
    if (!user) {
      setShowLoginRequired(true);
      return;
    }
    requestNavigation(path);
  };
  const halloweenAccessEndsAt = new Date("2026-11-01T06:00:00.000Z");
  const canChooseSpooky = spookyUnlocked || new Date() < halloweenAccessEndsAt;
  const currentTheme = isLightMode ? "light" : isSpookyMode ? "spooky" : "dark";
  const themeIcon =
    currentTheme === "light"
      ? "/website-assets/LightMode.webp"
      : currentTheme === "spooky"
        ? "/website-assets/DarkMode.webp"
        : "/website-assets/darkmodeactual.webp";
  const applyTheme = (theme: "light" | "dark" | "spooky") => {
    const lightMode = theme === "light";
    document.documentElement.classList.toggle("light", lightMode);
    document.documentElement.classList.toggle("dark", !lightMode);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = lightMode ? "light" : "dark";
  };
  useEffect(() => {
    if (!user) {
      setIsLightMode(false);
      setIsSpookyMode(false);
      setSpookyUnlocked(false);
      applyTheme("dark");
      return;
    }
    let cancelled = false;
    const loadThemePreference = async () => {
      const themeDb = supabase as unknown as SupabaseClient;
      const [legacyResult, themeResult] = await Promise.all([
        themeDb
          .from("user_light_mode_preferences")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        themeDb
          .from("user_theme_preferences")
          .select("theme, spooky_unlocked")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (legacyResult.error) {
        console.error("Unable to load legacy theme preference:", legacyResult.error);
      }
      if (themeResult.error) {
        console.error("Unable to load theme preference:", themeResult.error);
      }
      const unlocked = Boolean(themeResult.data?.spooky_unlocked);
      const savedTheme = themeResult.data?.theme;
      const theme =
        savedTheme === "light" || savedTheme === "dark" || savedTheme === "spooky"
          ? savedTheme
          : legacyResult.data
            ? "light"
            : "dark";
      const allowSpooky = unlocked || new Date() < halloweenAccessEndsAt;
      const safeTheme = theme === "spooky" && !allowSpooky ? "dark" : theme;
      setSpookyUnlocked(unlocked);
      setIsLightMode(safeTheme === "light");
      setIsSpookyMode(safeTheme === "spooky");
      applyTheme(safeTheme);
      if (theme === "spooky" && safeTheme !== theme) {
        void themeDb
          .from("user_theme_preferences")
          .upsert(
            { user_id: user.id, theme: "dark", spooky_unlocked: false },
            { onConflict: "user_id" },
          );
      }
    };
    void loadThemePreference();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  useEffect(() => {
    if (!showThemeMenu) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".kayou-theme-picker")) setShowThemeMenu(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowThemeMenu(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [showThemeMenu]);
  const handleThemeSelect = async (theme: "light" | "dark" | "spooky") => {
    if (!user || themeSaving || (theme === "spooky" && !canChooseSpooky)) return;
    const previousTheme = currentTheme;
    const nextSpookyUnlocked = spookyUnlocked || theme === "spooky";
    setThemeSaving(true);
    setShowThemeMenu(false);
    setIsLightMode(theme === "light");
    setIsSpookyMode(theme === "spooky");
    setSpookyUnlocked(nextSpookyUnlocked);
    applyTheme(theme);
    const themeDb = supabase as unknown as SupabaseClient;
    const { error: preferenceError } = await themeDb
      .from("user_theme_preferences")
      .upsert(
        {
          user_id: user.id,
          theme,
          spooky_unlocked: nextSpookyUnlocked,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    const { error: legacyError } =
      theme === "light"
        ? await supabase
            .from("user_light_mode_preferences")
            .upsert({ user_id: user.id }, { onConflict: "user_id" })
        : await supabase
            .from("user_light_mode_preferences")
            .delete()
            .eq("user_id", user.id);
    if (preferenceError || legacyError) {
      console.error(
        "Unable to save theme preference:",
        preferenceError || legacyError,
      );
      setIsLightMode(previousTheme === "light");
      setIsSpookyMode(previousTheme === "spooky");
      setSpookyUnlocked(spookyUnlocked);
      applyTheme(previousTheme);
    }
    setThemeSaving(false);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setUser(null);
    setIsLightMode(false);
    setIsSpookyMode(false);
    setSpookyUnlocked(false);
    applyTheme("dark");
    navigate("/");
  };
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  const staffButtons = (
    <div ref={headerStaffRef} className="kayou-staff-actions">
      {(canUseLgs || canReviewLGS) && (
        <div className="kayou-staff-lgs">
          <button
            type="button"
            className="kayou-staff-button kayou-lgs-access"
            aria-label="LGS"
            title="LGS"
            aria-expanded={canReviewLGS ? showHeaderLgs : undefined}
            onClick={() => {
              if (canReviewLGS) setShowHeaderLgs((value) => !value);
              else requestNavigation("/lgs-boards");
            }}
          >
            <Store size={18} aria-hidden="true" />
            <span>LGS</span>
          </button>
          {canReviewLGS && showHeaderLgs && (
            <div className="kayou-staff-menu">
              {canUseLgs && (
                <button
                  type="button"
                  onClick={() => {
                    setShowHeaderLgs(false);
                    requestNavigation("/lgs-boards");
                  }}
                >
                  LGS Game Center
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowHeaderLgs(false);
                  setShowLGSReview(true);
                }}
              >
                LGS Applications
              </button>
            </div>
          )}
        </div>
      )}
      {canModerate && (
        <button
          type="button"
          className="kayou-staff-button"
          title="Leaderboard moderation"
          aria-label="Leaderboard moderation"
          onClick={() => requestNavigation("/leaderboard-moderation")}
        >
          <Shield size={18} aria-hidden="true" />
          <span>Moderation</span>
        </button>
      )}
    </div>
  );
  return (
    <div
      className={`kayou-header-scope ${isLightMode ? "kayou-header-light" : ""} ${isSpookyMode ? "kayou-header-spooky" : ""}`}
    >
      {lgsIntroVisible && createPortal(
        <div className={`kayou-lgs-intro ${isLightMode ? "kayou-lgs-intro-light" : ""} ${isSpookyMode ? "kayou-lgs-intro-spooky" : ""}`}>
          <div className="kayou-lgs-intro-shade" aria-hidden="true" />
          {lgsIntroLine && <svg className="kayou-lgs-intro-line" aria-hidden="true"><path d={`M ${lgsIntroLine.x1} ${lgsIntroLine.y1} C ${lgsIntroLine.x1} ${lgsIntroLine.y1 - 60}, ${lgsIntroLine.x2} ${lgsIntroLine.y2 + 60}, ${lgsIntroLine.x2} ${lgsIntroLine.y2}`} /><circle cx={lgsIntroLine.x2} cy={lgsIntroLine.y2} r="5" /></svg>}
          <div className="kayou-lgs-intro-panel" ref={lgsIntroRef} role="dialog" aria-modal="true" aria-labelledby="kayou-lgs-intro-title" aria-describedby="kayou-lgs-intro-description">
            <span className="kayou-lgs-intro-kicker"><Store size={19} aria-hidden="true" /> YOUR STORE HAS ACCESS</span>
            <h2 id="kayou-lgs-intro-title">Your LGS Boards are ready.</h2>
            <p id="kayou-lgs-intro-description">Run your store's events, check in players, track decks, and draw raffle winners. Open your boards anytime using the LGS button in the header.</p>
            <p className="kayou-lgs-intro-mobile">On mobile, open your personal profile to access LGS Boards.</p>
            <div className="kayou-lgs-intro-actions">
              <button type="button" onClick={() => { setLgsIntroUserId(null); requestNavigation("/lgs-boards"); }}>Open LGS Boards <ArrowLeftRight size={16} aria-hidden="true" /></button>
              <button type="button" onClick={() => setLgsIntroUserId(null)}>Got it</button>
            </div>
          </div>
        </div>, document.body
      )}
      <style>
        {`
.kayou-lgs-intro{--intro-accent:#e7c84b;--intro-bg:#191c1e;--intro-ink:#f4f4f0;--intro-muted:#b7bfbb;position:fixed;inset:0;z-index:120000;isolation:isolate;color:var(--intro-ink);font-family:inherit}.kayou-lgs-intro-light{--intro-bg:#fff;--intro-ink:#242724;--intro-muted:#5c655e}.kayou-lgs-intro-spooky{--intro-accent:#c9acff}.kayou-lgs-intro-shade{position:absolute;inset:0;background:#06090bb3}.kayou-lgs-intro-line{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.kayou-lgs-intro-line path{fill:none;stroke:var(--intro-accent);stroke-width:2;filter:drop-shadow(0 0 5px var(--intro-accent))}.kayou-lgs-intro-line circle{fill:var(--intro-accent)}.kayou-lgs-intro-panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(480px,calc(100vw - 48px));max-height:calc(100dvh - 120px);overflow:auto;padding:30px;border:1px solid var(--intro-accent);border-radius:18px;background:var(--intro-bg);box-shadow:0 24px 90px #0006}.kayou-lgs-intro-kicker{display:flex;align-items:center;gap:9px;color:var(--intro-accent);font-size:10px;font-weight:700;letter-spacing:.12em}.kayou-lgs-intro-panel h2{font-size:27px;line-height:1.2;letter-spacing:-.025em;margin:17px 0 12px;font-weight:700}.kayou-lgs-intro-panel p{font-size:14px;line-height:1.7;color:var(--intro-muted);margin:0}.kayou-lgs-intro-panel .kayou-lgs-intro-mobile{margin-top:20px;padding-top:16px;border-top:1px solid #80808040;font-size:13px;color:var(--intro-ink)}.kayou-lgs-intro-actions{display:flex;gap:10px;margin-top:24px}.kayou-lgs-intro-actions button{display:flex;align-items:center;justify-content:center;gap:9px;min-height:44px;padding:10px 15px;border-radius:9px;border:1px solid #80808055;background:transparent;color:var(--intro-ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer}.kayou-lgs-intro-actions button:first-child{flex:1;background:var(--intro-accent);border-color:transparent;color:#191b1c}.kayou-lgs-intro-actions button:focus-visible{outline:2px solid var(--intro-accent);outline-offset:4px}@media(max-width:767px){.kayou-lgs-intro{display:none}}
  .kayou-header-scope .kayou-staff-actions{display:flex;align-items:center;gap:6px}
  .kayou-staff-lgs{position:relative}
  .kayou-header-scope .kayou-staff-button{display:flex;align-items:center;justify-content:center;gap:6px;height:40px;min-width:40px;padding:0 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:#e7c84b;font-size:13px;cursor:pointer}
  .kayou-header-light .kayou-staff-button{background:#fffaf0;border-color:#e7c84b55;color:#6d5210}
  .kayou-header-scope .kayou-lgs-access{--lgs-glow:231,200,75;border-color:rgba(var(--lgs-glow),.75);background:rgba(var(--lgs-glow),.12);box-shadow:0 0 0 1px rgba(var(--lgs-glow),.18),0 0 16px rgba(var(--lgs-glow),.3);animation:kayou-lgs-access-glow 3s ease-in-out infinite}
  .kayou-header-light .kayou-lgs-access{background:#fff6cc}
  .kayou-header-spooky .kayou-lgs-access{--lgs-glow:201,172,255;color:#d8c2ff}
  .kayou-header-scope .kayou-lgs-access:hover{background:rgba(var(--lgs-glow),.22)}
  .kayou-header-scope .kayou-lgs-access:focus-visible{outline-color:rgb(var(--lgs-glow))}
  @keyframes kayou-lgs-access-glow{0%,100%{box-shadow:0 0 0 1px rgba(var(--lgs-glow),.18),0 0 12px rgba(var(--lgs-glow),.25)}50%{box-shadow:0 0 0 2px rgba(var(--lgs-glow),.32),0 0 23px rgba(var(--lgs-glow),.5)}}
  @media(prefers-reduced-motion:reduce){.kayou-header-scope .kayou-lgs-access{animation:none}}
  .kayou-staff-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:190px;padding:6px;border-radius:14px;background:#17191b;box-shadow:0 12px 32px #0005;z-index:21000}
  .kayou-staff-menu button{display:block;width:100%;text-align:left;padding:12px;border-radius:9px;color:#f4f4f5;font-size:14px}
  .kayou-staff-menu button:hover{background:#ffffff12}
  .kayou-header-light .kayou-staff-menu{background:#fff}
  .kayou-header-light .kayou-staff-menu button{color:#312d24}
  .kayou-staff-button:focus-visible,.kayou-staff-menu button:focus-visible{outline:2px solid #e7c84b;outline-offset:3px}
  @media(min-width:640px){.kayou-staff-button span{display:none}}
  html[data-theme="spooky"] {
    --primary: 270 76% 68%;
    --ring: 270 76% 68%;
    color-scheme: dark;
  }
  html[data-theme="spooky"] [class*="text-[#E7C84B]"],
  html[data-theme="spooky"] [class*="text-[#FFE477]"],
  html[data-theme="spooky"] [class*="text-yellow-"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-yellow-300"],
  html[data-theme="spooky"] [class*="text-[#FFE477]"] { color: #d8c2ff !important; }
  html[data-theme="spooky"] [class*="border-[#E7C84B]"],
  html[data-theme="spooky"] [class*="border-yellow-300"],
  html[data-theme="spooky"] [class*="border-yellow-400"],
  html[data-theme="spooky"] [class*="border-[#D6B84A]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="bg-[#E7C84B]"]:not([class*="bg-[#E7C84B]/"]),
  html[data-theme="spooky"] [class*="bg-[#FFE477]"]:not([class*="bg-[#FFE477]/"]),
  html[data-theme="spooky"] [class*="bg-yellow-400"]:not([class*="bg-yellow-400/"]),
  html[data-theme="spooky"] [class*="bg-yellow-500"]:not([class*="bg-yellow-500/"]) { background-color: #7544ad !important; }
  html[data-theme="spooky"] [class*="bg-[#E7C84B]/"],
  html[data-theme="spooky"] [class*="bg-[#FFE477]/"],
  html[data-theme="spooky"] [class*="bg-yellow-400/"],
  html[data-theme="spooky"] [class*="bg-yellow-500/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="from-yellow-400"],
  html[data-theme="spooky"] [class*="from-yellow-500"] { --tw-gradient-from: #c9acff var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(201 172 255 / 0) var(--tw-gradient-to-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
  html[data-theme="spooky"] [class*="via-yellow-400"],
  html[data-theme="spooky"] [class*="via-yellow-500"] { --tw-gradient-via: #c9acff var(--tw-gradient-via-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to) !important; }
  html[data-theme="spooky"] [class*="to-yellow-400"],
  html[data-theme="spooky"] [class*="to-yellow-500"] { --tw-gradient-to: #c9acff var(--tw-gradient-to-position) !important; }
  html[data-theme="spooky"] [class*="shadow-"][class*="250,204,21"],
  html[data-theme="spooky"] [class*="shadow-"][class*="#facc15"],
  html[data-theme="spooky"] [class*="231,200,75"],
  html[data-theme="spooky"] [class*="rgba(231,200,75"],
  html[data-theme="spooky"] [class*="255,213,74"],
  html[data-theme="spooky"] [class*="255,226,122"],
  html[data-theme="spooky"] [class*="#ffd54a"],
  html[data-theme="spooky"] [class*="#ffe27a"] { box-shadow: 0 0 12px rgba(201,172,255,.82) !important; }
  html[data-theme="spooky"] .kayou-staff-button { color: #c9acff; border-color: rgba(201,172,255,.58); }
  html[data-theme="spooky"] .kayou-staff-button:hover { background: rgba(167,123,232,.14); }
  html[data-theme="spooky"] [class*="text-[#ffe06a]"],
  html[data-theme="spooky"] [class*="text-[#FFE06A]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="border-[#ffe06a]"],
  html[data-theme="spooky"] [class*="border-[#FFE06A]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="bg-[#ffe06a]"]:not([class*="bg-[#ffe06a]/"]),
  html[data-theme="spooky"] [class*="bg-[#FFE06A]"]:not([class*="bg-[#FFE06A]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#ffe06a]/"],
  html[data-theme="spooky"] [class*="bg-[#FFE06A]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] .tp-index { --index-accent: #c9acff !important; }
  html[data-theme="spooky"] .tp-index .tp-index-filters button[aria-pressed="true"],
  html[data-theme="spooky"] .tp-index .tp-index-empty button { background: #7544ad !important; border-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] .tp-index .tp-index-filters button:hover { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] .tp-index .tp-index-card:hover { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] .tp-market { --tp-accent: #c9acff !important; --tp-action: #7544ad !important; --tp-action-ink: #fff !important; --tp-glow-rgb: 201,172,255 !important; }
  html[data-theme="spooky"] .tp-market .tp-type button[aria-pressed="true"],
  html[data-theme="spooky"] .tp-market .tp-rarities button[aria-pressed="true"],
  html[data-theme="spooky"] .tp-market .tp-empty > button,
  html[data-theme="spooky"] .tp-market .tp-profile-btn:hover { background: #7544ad !important; border-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] .tp-market .tp-collector-head { background: linear-gradient(90deg, rgba(201,172,255,.05), transparent) !important; }
  html[data-theme="spooky"] .tp-market .tp-card-tags span { color: #c9acff !important; }
  html[data-theme="spooky"] .tp-market .tp-result-badge { background: rgba(167,123,232,.12) !important; border-color: rgba(201,172,255,.28) !important; }
  html[data-theme="spooky"] .tp-market .tp-strikes-warning { background: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] .tp-market .tp-load-track span,
  html[data-theme="spooky"] .tp-market .tp-collection-track span { background: linear-gradient(90deg, transparent, #c9acff, transparent) !important; }
  html[data-theme="spooky"] .m4-page,
  html[data-theme="spooky"] .m4-inspector-dialog { --m4-accent: #c9acff !important; }
  html[data-theme="spooky"] .m4-page .m4-mode .is-active,
  html[data-theme="spooky"] .m4-page .m4-rarities .is-active,
  html[data-theme="spooky"] .m4-page .m4-empty button,
  html[data-theme="spooky"] .m4-inspector-dialog .m4-inspector-controls button[aria-pressed="true"] { background: #7544ad !important; border-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] .m4-page .m4-rarities .is-active > span { color: #eee3ff !important; }
  html[data-theme="spooky"] .m4-page button:focus-visible,
  html[data-theme="spooky"] .m4-inspector-dialog button:focus-visible,
  html[data-theme="spooky"] .m4-inspector-stage:focus-visible { outline-color: #c9acff !important; }
  html[data-theme="spooky"] .m4-inspector-stage { background: radial-gradient(ellipse at 50% 44%, rgba(201,172,255,.12), transparent 65%) !important; }
  html[data-theme="spooky"] [class*="-page"] {
    --collection-accent: #c9acff !important;
    --set-accent: #c9acff !important;
    --m1-accent: #c9acff !important;
    --m2-accent: #c9acff !important;
    --m3-accent: #c9acff !important;
    --m4-accent: #c9acff !important;
    --s1-accent: #c9acff !important;
    --r1-accent: #c9acff !important;
    --r2-accent: #c9acff !important;
    --fm1-accent: #c9acff !important;
    --fm2-accent: #c9acff !important;
    --fm3-accent: #c9acff !important;
    --sd-accent: #c9acff !important;
    --fw-accent: #c9acff !important;
    --tcg-accent: #c9acff !important;
    --nn-accent: #c9acff !important;
  }
  html[data-theme="spooky"] [class*="-page"] [class*="-mode"] .is-active,
  html[data-theme="spooky"] [class*="-page"] [class*="-rarities"] .is-active,
  html[data-theme="spooky"] [class*="-page"] [class*="-controls"] button[aria-pressed="true"],
  html[data-theme="spooky"] [class*="-page"] [class*="-empty"] button,
  html[data-theme="spooky"] [class*="-inspector-dialog"] [class*="-inspector-controls"] button[aria-pressed="true"] { background: #7544ad !important; border-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="-page"] [class*="-rarities"] .is-active > span { color: #eee3ff !important; }
  html[data-theme="spooky"] [class*="-page"] [class*="-progress-track"] > *,
  html[data-theme="spooky"] [class*="-page"] [class*="-progress"] > [style*="width"],
  html[data-theme="spooky"] [class*="-inspector-dialog"] [class*="-progress-track"] > * { background-color: #c9acff !important; }
  html[data-theme="spooky"] [class*="-page"] input[type="range"],
  html[data-theme="spooky"] [class*="-inspector-dialog"] input[type="range"] { accent-color: #c9acff !important; }
  html[data-theme="spooky"] [class*="-page"] button:focus-visible,
  html[data-theme="spooky"] [class*="-inspector-dialog"] button:focus-visible,
  html[data-theme="spooky"] [class*="-inspector-stage"]:focus-visible { outline-color: #c9acff !important; }
  html[data-theme="spooky"] [class*="-page"] [class*="-inspector-stage"] { background-image: radial-gradient(ellipse at 50% 44%, rgba(201,172,255,.12), transparent 65%) !important; }
  html[data-theme="spooky"] [class*="-page"] .text-yellow-300,
  html[data-theme="spooky"] [class*="-page"] .text-yellow-400,
  html[data-theme="spooky"] [class*="-page"] .text-yellow-500,
  html[data-theme="spooky"] [class*="-page"] [class*="text-[#FFD54A]"],
  html[data-theme="spooky"] [class*="-page"] [class*="text-[#ffd54a]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="-page"] [class*="border-[#FFD54A]"],
  html[data-theme="spooky"] [class*="-page"] [class*="border-[#ffd54a]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="text-[#E8CA55]"],
  html[data-theme="spooky"] [class*="text-[#e8ca55]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#D9BC68]"],
  html[data-theme="spooky"] [class*="text-[#d9bc68]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#E6CD86]"],
  html[data-theme="spooky"] [class*="text-[#e6cd86]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#8A6B1B]"],
  html[data-theme="spooky"] [class*="text-[#8a6b1b]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#C9AC59]"],
  html[data-theme="spooky"] [class*="text-[#c9ac59]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#70551A]"],
  html[data-theme="spooky"] [class*="text-[#70551a]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#BFA865]"],
  html[data-theme="spooky"] [class*="text-[#bfa865]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#80621C]"],
  html[data-theme="spooky"] [class*="text-[#80621c]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#91752F]"],
  html[data-theme="spooky"] [class*="text-[#91752f]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#745A00]"],
  html[data-theme="spooky"] [class*="text-[#745a00]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#806100]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#725800]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#B18C00]"],
  html[data-theme="spooky"] [class*="text-[#b18c00]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="border-[#E8CA55]"],
  html[data-theme="spooky"] [class*="border-[#e8ca55]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="border-[#D9BC68]"],
  html[data-theme="spooky"] [class*="border-[#d9bc68]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="border-[#C9AC59]"],
  html[data-theme="spooky"] [class*="border-[#c9ac59]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="border-[#BCA04E]"],
  html[data-theme="spooky"] [class*="border-[#bca04e]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="border-[#D4B63D]"],
  html[data-theme="spooky"] [class*="border-[#d4b63d]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="bg-[#E8CA55]"]:not([class*="bg-[#E8CA55]/"]),
  html[data-theme="spooky"] [class*="bg-[#e8ca55]"]:not([class*="bg-[#e8ca55]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#E8CA55]/"],
  html[data-theme="spooky"] [class*="bg-[#e8ca55]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#D9BC68]"]:not([class*="bg-[#D9BC68]/"]),
  html[data-theme="spooky"] [class*="bg-[#d9bc68]"]:not([class*="bg-[#d9bc68]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#D9BC68]/"],
  html[data-theme="spooky"] [class*="bg-[#d9bc68]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#D5AD16]"]:not([class*="bg-[#D5AD16]/"]),
  html[data-theme="spooky"] [class*="bg-[#d5ad16]"]:not([class*="bg-[#d5ad16]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#D5AD16]/"],
  html[data-theme="spooky"] [class*="bg-[#d5ad16]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#EFE4C5]"]:not([class*="bg-[#EFE4C5]/"]),
  html[data-theme="spooky"] [class*="bg-[#efe4c5]"]:not([class*="bg-[#efe4c5]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#EFE4C5]/"],
  html[data-theme="spooky"] [class*="bg-[#efe4c5]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF6C9]"]:not([class*="bg-[#FFF6C9]/"]),
  html[data-theme="spooky"] [class*="bg-[#fff6c9]"]:not([class*="bg-[#fff6c9]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF6C9]/"],
  html[data-theme="spooky"] [class*="bg-[#fff6c9]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF8D8]"]:not([class*="bg-[#FFF8D8]/"]),
  html[data-theme="spooky"] [class*="bg-[#fff8d8]"]:not([class*="bg-[#fff8d8]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF8D8]/"],
  html[data-theme="spooky"] [class*="bg-[#fff8d8]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF1AD]"]:not([class*="bg-[#FFF1AD]/"]),
  html[data-theme="spooky"] [class*="bg-[#fff1ad]"]:not([class*="bg-[#fff1ad]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#FFF1AD]/"],
  html[data-theme="spooky"] [class*="bg-[#fff1ad]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="ring-[#D9BC68]"],
  html[data-theme="spooky"] [class*="ring-[#d9bc68]"],
  html[data-theme="spooky"] [class*="ring-[#D9bc68]"] { --tw-ring-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] .kayou-staff-button:focus-visible,
  html[data-theme="spooky"] .kayou-staff-menu button:focus-visible { outline-color: #b18bff; }
  html[data-theme="spooky"] [class*="text-orange-"],
  html[data-theme="spooky"] [class*="text-[#F2A55E]"],
  html[data-theme="spooky"] [class*="text-[#f2a55e]"],
  html[data-theme="spooky"] [class*="text-[#FF9B5C]"],
  html[data-theme="spooky"] [class*="text-[#ff9b5c]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="border-orange-"],
  html[data-theme="spooky"] [class*="border-[#F2A55E]"],
  html[data-theme="spooky"] [class*="border-[#f2a55e]"] { border-color: rgba(177,139,255,.38) !important; }
  html[data-theme="spooky"] [class*="text-[#FFD54A]"],
  html[data-theme="spooky"] [class*="text-[#ffd54a]"] { color: #c9acff !important; }
  html[data-theme="spooky"] [class*="text-[#FFE27A]"],
  html[data-theme="spooky"] [class*="text-[#ffe27a]"] { color: #d8c2ff !important; }
  html[data-theme="spooky"] [class*="border-[#FFD54A]"],
  html[data-theme="spooky"] [class*="border-[#ffd54a]"],
  html[data-theme="spooky"] [class*="border-[#FFE27A]"],
  html[data-theme="spooky"] [class*="border-[#ffe27a]"] { border-color: rgba(201,172,255,.58) !important; }
  html[data-theme="spooky"] [class*="bg-[#FFD54A]"]:not([class*="bg-[#FFD54A]/"]),
  html[data-theme="spooky"] [class*="bg-[#ffd54a]"]:not([class*="bg-[#ffd54a]/"]) { background-color: #7544ad !important; color: #fff !important; }
  html[data-theme="spooky"] [class*="bg-[#FFD54A]/"],
  html[data-theme="spooky"] [class*="bg-[#ffd54a]/"] { background-color: rgba(167,123,232,.12) !important; }
  html[data-theme="spooky"] [class*="from-[#FFD54A]"],
  html[data-theme="spooky"] [class*="from-[#ffd54a]"] { --tw-gradient-from: #c9acff var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(201 172 255 / 0) var(--tw-gradient-to-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
  html[data-theme="spooky"] [class*="via-[#FFD54A]"],
  html[data-theme="spooky"] [class*="via-[#ffd54a]"] { --tw-gradient-via: #c9acff var(--tw-gradient-via-position) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to) !important; }
  html[data-theme="spooky"] [class*="to-[#FFD54A]"],
  html[data-theme="spooky"] [class*="to-[#ffd54a]"] { --tw-gradient-to: #c9acff var(--tw-gradient-to-position) !important; }
  .kayou-header-light { color: #5f4a12; }
  .kayou-header-spooky { color: #c9acff; }
  .kayou-header-spooky .kayou-staff-button { border-color: rgba(177,139,255,.25); background: rgba(255,255,255,.045); color: #c9acff; }
  .kayou-header-spooky .kayou-staff-menu { background: #17191b; border: 1px solid rgba(177,139,255,.2); }
  .kayou-header-spooky [class*="text-[#E7C84B]"],
  .kayou-header-spooky [class*="text-[#FFE477]"],
  .kayou-header-spooky [class*="text-yellow-400"] { color: #c9acff !important; }
  .kayou-header-spooky [class*="border-[#E7C84B]"],
  .kayou-header-spooky [class*="border-yellow-400"] { border-color: rgba(177,139,255,.35) !important; }
  .kayou-header-spooky [class*="bg-[#E7C84B]"]:not([class*="bg-[#E7C84B]/"]) { background-color: #7544ad !important; }
  .kayou-header-spooky-logo { width: auto !important; height: 80px !important; max-width: none !important; max-height: none !important; transform: translateY(1px) scale(.65) !important; transform-origin: center center !important; object-fit: contain !important; }
  .kayou-theme-picker { position: relative; }
  .kayou-theme-menu { position: absolute; z-index: 25000; top: 0; left: calc(100% + 10px); display: flex; width: 0; overflow: hidden; gap: 8px; padding: 0; opacity: 0; pointer-events: none; border: 1px solid transparent; border-radius: 16px; background: #17191b; box-shadow: 0 14px 34px rgba(0,0,0,.42); transition: width .24s ease, max-height .24s ease, opacity .18s ease, padding .24s ease; }
  .kayou-theme-menu[data-open="true"] { width: 270px; padding: 8px; opacity: 1; pointer-events: auto; border-color: rgba(255,255,255,.12); }
  .kayou-theme-option { display: flex; min-width: 78px; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 9px 5px; color: #f4f4f5; font-size: 11px; font-weight: 700; transition: background .18s ease, border-color .18s ease, transform .18s ease; }
  .kayou-theme-option:hover,.kayou-theme-option[aria-pressed="true"] { border-color: rgba(177,139,255,.55); background: rgba(177,139,255,.12); }
  .kayou-theme-option:active { transform: scale(.97); }
  .kayou-theme-option img { width: 24px; height: 24px; object-fit: contain; }
  .kayou-header-light .kayou-theme-menu { background: #fffdf7; box-shadow: 0 14px 34px rgba(91,67,10,.18); }
  .kayou-header-light .kayou-theme-option { border-color: rgba(160,120,20,.18); color: #312d24; }
  .kayou-header-spooky .kayou-theme-menu { background: #17191b; border-color: rgba(177,139,255,.28); }
  .kayou-header-spooky .kayou-theme-option:hover,.kayou-header-spooky .kayou-theme-option[aria-pressed="true"] { border-color: rgba(177,139,255,.6); background: rgba(116,68,173,.17); }
  .kayou-theme-menu-note { position: absolute; top: calc(100% + 5px); left: 8px; width: max-content; color: #a1a1aa; font-size: 9px; }
  @media(max-width:639px) {
    .kayou-header-spooky-logo { width: auto !important; height: 32px !important; max-width: none !important; max-height: none !important; transform: translate(-50%,0) !important; }
    .kayou-theme-menu { top: calc(100% + 8px); left: auto; right: 0; box-sizing: border-box; flex-direction: column; width: 0; max-width: calc(100vw - 24px); max-height: 0; gap: 4px; border-radius: 12px; }
    .kayou-theme-menu[data-open="true"] { width: 150px; max-height: 210px; padding: 7px; }
    .kayou-theme-option { min-height: 38px; flex-direction: row; justify-content: flex-start; padding: 6px 8px; }
    .kayou-theme-option img { width: 20px; height: 20px; }
  }
  .kayou-header-light [class*="bg-[#0"],
  .kayou-header-light [class*="bg-[#1"],
  .kayou-header-light [class*="bg-black"] { background-color: rgba(255,255,255,.98) !important; }
  .kayou-header-light [class*="border-white/"],
  .kayou-header-light [class*="border-[#2"],
  .kayou-header-light [class*="border-[#3"] { border-color: rgba(160,120,20,.18) !important; }
  .kayou-header-light .text-white,
  .kayou-header-light [class*="text-zinc-1"],
  .kayou-header-light [class*="text-zinc-2"],
  .kayou-header-light [class*="text-zinc-3"],
  .kayou-header-light [class*="text-zinc-4"],
  .kayou-header-light [class*="text-[#8B"],
  .kayou-header-light [class*="text-[#B8"] { color: #4b4538 !important; }
  .kayou-header-light [class*="bg-white/[0.0"] { background-color: rgba(126,92,10,.055) !important; }
  .kayou-header-light [class*="hover:bg-white"]:hover { background-color: rgba(231,200,75,.14) !important; }
  .kayou-header-light [class*="hover:text-white"]:hover,
  .kayou-header-light [class*="hover:text-zinc"]:hover { color: #6d5210 !important; }
  .kayou-header-light input { background: #ffffff !important; color: #26231d !important; border-color: rgba(160,120,20,.22) !important; }
  .kayou-header-light input::placeholder { color: #9b9486 !important; }
  .kayou-header-light [role="dialog"] { color: #312d24; }
  /* SheetContent renders in a portal, so it needs its own light-mode scope. */
  .kayou-profile-sheet-light {
    background: rgba(255,255,255,.98) !important;
    color: #312d24 !important;
    border-color: rgba(160,120,20,.18) !important;
    box-shadow: 0 24px 70px rgba(91,67,10,.16) !important;
  }
  .kayou-profile-sheet-light [class*="border-white/"] {
    border-color: rgba(160,120,20,.16) !important;
  }
  .kayou-profile-sheet-light .text-white,
  .kayou-profile-sheet-light [class*="text-zinc-2"],
  .kayou-profile-sheet-light [class*="text-zinc-3"],
  .kayou-profile-sheet-light [class*="text-zinc-4"] {
    color: #514a3b !important;
  }
  .kayou-profile-sheet-light [class*="hover:bg-white"]:hover {
    background-color: rgba(231,200,75,.14) !important;
  }
  .kayou-profile-sheet-light [class*="hover:text-white"]:hover {
    color: #6d5210 !important;
  }
  .kayou-profile-sheet-light [class*="bg-white/[0.0"] {
    background-color: rgba(126,92,10,.05) !important;
  }
`}{" "}
      </style>
      <header
        className="fixed left-0 right-0 top-0 z-[20000] text-[#E7C84B]"
        style={{
          background: isLightMode
            ? "linear-gradient(180deg, #ffffff 0%, #fffdf7 72%, #fffaf0 100%)"
            : "linear-gradient(180deg, #0d1113 0%, #0b0e10 72%, #090b0d 100%)",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
          boxShadow: isLightMode
            ? "0 10px 40px rgba(160,120,20,.14), 0 0 30px rgba(231,200,75,.16), inset 0 -1px 0 rgba(190,145,30,.30)"
            : isSpookyMode
              ? "0 10px 35px rgba(0,0,0,.5), inset 0 -1px 0 rgba(177,139,255,.28)"
              : "0 10px 35px rgba(0,0,0,.45), inset 0 -1px 0 rgba(250,204,21,.10)",
        }}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 hidden h-px bg-gradient-to-r from-transparent to-transparent sm:block ${
            isLightMode
              ? "via-[#FFE477]/80 shadow-[0_0_14px_rgba(177,139,255,.55)]"
              : "via-yellow-400/35"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 hidden h-[2px] bg-gradient-to-r from-transparent to-transparent sm:block ${
            isLightMode
              ? "via-[#FFE477]/55 shadow-[0_0_18px_rgba(231,200,75,.42)]"
              : "via-yellow-400/20"
          }`}
        />
        <div className="pointer-events-none absolute left-0 top-0 hidden h-3 w-24 border-l border-t border-yellow-400/20 sm:block" />
        <div className="pointer-events-none absolute right-0 top-0 hidden h-3 w-24 border-r border-t border-yellow-400/20 sm:block" />
        <div
          className="kayou-header-row relative flex w-full items-center justify-between px-2 sm:px-4"
        >
          <div className="flex items-center gap-3 min-w-[70px]">
            {!user && (
              <Button
                onClick={() => {
                  setAuthMode("signup");
                  setLoginError("");
                  setShowForgot(false);
                  setShowLogin(true);
                }}
                className="hidden h-10 items-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_8px_24px_rgba(0,0,0,.22)] transition-all duration-200 sm:flex hover:bg-white/[0.1] hover:border-white/20 active:scale-[0.98]"
              >
                Create account
              </Button>
            )}
            <div
              className="kayou-header-mobile-actions absolute left-3 flex -translate-y-1/2 items-center gap-1.5 sm:hidden"
            >
              {!user ? (
                <Button
                  onClick={() => {
                    setAuthMode("login");
                    setLoginError("");
                    setShowForgot(false);
                    setShowLogin(true);
                  }}
                  className="h-8 rounded-full border border-[#E7C84B]/25 bg-[#E7C84B] px-3.5 text-[12px] font-semibold text-[#111517] shadow-[inset_0_1px_0_rgba(255,255,255,.30),0_4px_14px_rgba(0,0,0,.18)] transition-all duration-200 hover:bg-[#FFE477] active:scale-[0.98]"
                >
                  Log in
                </Button>
              ) : (
                <>
                  <button
                    onClick={() => requestNavigation("/leaderboard")}
                    aria-label="Leaderboard"
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors ${
                      isLightMode
                        ? "border-black/10 bg-black/[0.035] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900"
                        : "border-white/10 bg-white/[0.045] text-zinc-300 hover:bg-white/[0.08] hover:text-[#FFE477]"
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => requestNavigation("/community")}
                    aria-label="First Finishers"
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors ${
                      isLightMode
                        ? "border-black/10 bg-black/[0.035] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900"
                        : "border-white/10 bg-white/[0.045] text-zinc-300 hover:bg-white/[0.08] hover:text-[#FFE477]"
                    }`}
                  >
                    <Medal className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => requestNavigation("/trading-post")}
                    aria-label="Trading Post"
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors ${
                      isLightMode
                        ? "border-black/10 bg-black/[0.035] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900"
                        : "border-white/10 bg-white/[0.045] text-zinc-300 hover:bg-white/[0.08] hover:text-[#FFE477]"
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {user && (
              <div className="hidden sm:flex items-center gap-5">
                <Sheet modal={false} open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={`relative hidden sm:flex h-14 w-14 items-center justify-center rounded-[20px] border p-1 backdrop-blur-md transition-all duration-200 ${
                        isLightMode
                          ? open
                            ? "border-[#D6B84A]/70 bg-white shadow-[0_0_26px_rgba(231,200,75,.24)]"
                            : "border-[#D6B84A]/40 bg-white shadow-[0_0_18px_rgba(231,200,75,.14)] hover:border-[#D6B84A]/65 hover:bg-[#fffaf0]"
                          : open
                            ? "border-[#E7C84B]/60 bg-white/[0.08] shadow-[0_10px_28px_rgba(0,0,0,0.30)]"
                            : "border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
                      }`}
                    >
                      <ProfileAvatar
                        profile={profile}
                        src={avatarSrc || profileAvatar}
                        alt="avatar"
                        className={`relative z-10 h-12 w-12 rounded-2xl object-cover border transition-all duration-200 ${
                          open
                            ? "border-[#E7C84B]/50 shadow-[0_5px_16px_rgba(0,0,0,0.30)]"
                            : "border-white/10"
                        }`}
                      />
                      <span
                        className={`absolute bottom-1 right-1 z-20 h-3 w-3 rounded-full border-2 bg-[#a3e635] ${isLightMode ? "border-white" : "border-[#0d1113]"}`}
                      />
                      {inboxNotificationCount > 0 && (
                        <span className="absolute -right-2 -top-2 z-30 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-lg dark:border-[#0d1113]">
                          {notificationCountLabel}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    onInteractOutside={(event) => {
                      const target = event.target as HTMLElement | null;
                      if (
                        target?.closest('[data-header-theme-toggle="true"]')
                      ) {
                        event.preventDefault();
                      }
                    }}
                    className={`top-16 h-[calc(100vh-64px)] w-[280px] border-r p-0 shadow-2xl backdrop-blur-xl [&>button]:hidden ${
                      isLightMode
                        ? "kayou-profile-sheet-light border-[#E7C84B]/20 bg-white/95 text-[#312d24]"
                        : "border-white/10 bg-[#111315]/95 text-white"
                    }`}
                  >
                    <div className="flex h-full flex-col">
                      <div className="border-b border-white/10 px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 truncate text-lg font-semibold tracking-[-0.01em] text-white">
                            {profile?.username || "My Profile"}
                          </div>
                          {verification && (
                            <CardImage
                              src={verification.badge}
                              alt={verification.label}
                              title={verification.label}
                              className="h-5 w-5 flex-shrink-0 object-contain"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
                        <button
                          onClick={() => {
                            requestNavigation("/desktop-profile");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <User className="h-[18px] w-[18px] text-zinc-400" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/inbox");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <Mail className="h-[18px] w-[18px] text-zinc-400" />
                          <span>Inbox &amp; Friends</span>
                          {inboxNotificationCount > 0 && (
                            <span className="ml-auto flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white">
                              {notificationCountLabel}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/my-progress");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <BarChart3 className="h-[18px] w-[18px] text-zinc-400" />
                          <span>CCG Progress</span>
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/progress-tcg");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <BarChart3 className="h-[18px] w-[18px] text-zinc-400" />
                          <span>TCG Progress</span>
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/inventory");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <Library className="h-[18px] w-[18px] text-zinc-400" />
                          <span>Inventory</span>
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/binders");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <BookOpen className="h-[18px] w-[18px] text-zinc-400" />
                          <span>Binders</span>
                        </button>
                        <button
                          onClick={() => {
                            requestNavigation("/iso");
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <Heart className="h-[18px] w-[18px] text-zinc-400" />
                          <span>ISO / Wishlist</span>
                        </button>
                        <div className="my-2 border-t border-white/10 pt-3">
                          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#E7C84B]">Mini games</p>
                          <button onClick={() => { setShowPinkieParty(true); setOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white">
                            <Gamepad2 className="h-[18px] w-[18px] text-[#E7C84B]" aria-hidden="true" />
                            <span>Pinkie Pie&apos;s Party</span>
                          </button>
                          <button onClick={() => { requestNavigation("/match-pairs"); setOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white">
                            <Gamepad2 className="h-[18px] w-[18px] text-[#E7C84B]" aria-hidden="true" />
                            <span>Match Pairs</span>
                          </button>
                          <button onClick={() => { requestNavigation("/go-fish"); setOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white">
                            <Gamepad2 className="h-[18px] w-[18px] text-[#E7C84B]" aria-hidden="true" />
                            <span>Go Fish</span>
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-white/10 p-3">
                        <div className="mb-2 flex items-center gap-2 px-1">
                          <button
                            onClick={() =>
                              window.open(
                                "https://discord.gg/mlpekayou",
                                "_blank",
                              )
                            }
                            aria-label="Discord"
                            title="Discord"
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
                          >
                            <CardImage
                              src={
                                isLightMode
                                  ? "/website-assets/discordlightmode.webp"
                                  : "/website-assets/discordlogo.webp"
                              }
                              alt="Discord"
                              className={`h-5 w-auto ${isLightMode ? "opacity-100" : "opacity-80"}`}
                            />
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                "https://www.tiktok.com/@keanaex",
                                "_blank",
                              )
                            }
                            aria-label="TikTok"
                            title="TikTok"
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
                          >
                            <CardImage
                              src={
                                isLightMode
                                  ? "/website-assets/tiktoklightmode.webp"
                                  : "/website-assets/tiktoklogo.webp"
                              }
                              alt="TikTok"
                              className={`h-5 w-auto ${isLightMode ? "opacity-100" : "opacity-80"}`}
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <LogOut className="h-[18px] w-[18px]" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="kayou-theme-picker">
                  <button
                    type="button"
                    data-header-theme-toggle="true"
                    onClick={() => setShowThemeMenu((value) => !value)}
                    disabled={themeSaving}
                    aria-label="Choose theme"
                    aria-expanded={showThemeMenu}
                    title="Choose theme"
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-200 disabled:cursor-wait disabled:opacity-60 ${
                      isLightMode
                        ? "border-[#D6B84A]/45 bg-white text-[#8A6A16] shadow-[0_0_22px_rgba(231,200,75,.20)] hover:border-[#D6B84A]/70 hover:bg-[#fffaf0]"
                        : "border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    <CardImage src={themeIcon} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
                  </button>
                  <div className="kayou-theme-menu" data-open={showThemeMenu} role="group" aria-label="Theme choices">
                    <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "light"} onClick={() => void handleThemeSelect("light")}>
                      <CardImage src="/website-assets/LightMode.webp" alt="" aria-hidden="true" /> Light
                    </button>
                    <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "dark"} onClick={() => void handleThemeSelect("dark")}>
                      <CardImage src="/website-assets/darkmodeactual.webp" alt="" aria-hidden="true" /> Dark
                    </button>
                    {canChooseSpooky && (
                      <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "spooky"} onClick={() => void handleThemeSelect("spooky")}>
                        <CardImage src="/website-assets/DarkMode.webp" alt="" aria-hidden="true" /> Spooky
                      </button>
                    )}
                  </div>
                  {showThemeMenu && !canChooseSpooky && !spookyUnlocked && <span className="kayou-theme-menu-note">Halloween theme unavailable</span>}
                </div>
              </div>
            )}
          </div>
          <CardImage
            src={
              isLightMode
                ? "/website-assets/mlpekayouwiki4.webp"
                : isSpookyMode
                  ? "/website-assets/nightmarelogo.webp"
                  : "/website-assets/darkmodelogo.webp"
            }
            alt="MLP Kayou Wiki"
            className={`sm:hidden absolute left-1/2 -translate-x-1/2 cursor-pointer object-contain drop-shadow-md ${isSpookyMode ? "kayou-header-spooky-logo" : "h-8 w-auto scale-[1.65]"}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goHome();
            }}
          />
          <div className="absolute left-1/2 hidden sm:flex -translate-x-1/2 items-center">
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5">
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/support-mlpekayou")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/support-mlpekayou")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <ShoppingBag className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      SHOP
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requireLogin("/explore")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/explore")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Users className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      EXPLORE
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/collections")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/collections")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Sparkles className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      COLLECTIONS
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/leaderboard")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/leaderboard")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Medal className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      LEADERBOARD
                    </span>
                  </button>
                </div>
              </div>
              <div className="relative mx-4 flex items-center">
                <div className="mr-3 flex items-center gap-1">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-400/50" />
                  <span className="h-1 w-1 bg-yellow-400 shadow-[0_0_7px_#facc15]" />
                </div>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    goHome();
                  }}
                  className="group relative flex h-[54px] w-[120px] items-center justify-center overflow-visible bg-transparent transition-all duration-200"
                >
                  <CardImage
                    src={
                      isLightMode
                        ? "/website-assets/mlpekayouwiki4.webp"
                        : isSpookyMode
                          ? "/website-assets/nightmarelogo.webp"
                          : "/website-assets/darkmodelogo.webp"
                    }
                    alt="MLP Kayou Wiki"
                    className={`relative z-10 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:translate-y-[1px] ${isSpookyMode ? "kayou-header-spooky-logo" : "h-[42px] w-auto translate-y-[1px] scale-[1.9] group-hover:scale-[1.96]"}`}
                  />
                </button>
                <div className="ml-3 flex items-center gap-1">
                  <span className="h-1 w-1 bg-yellow-400 shadow-[0_0_7px_#facc15]" />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-400/50" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/community")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/community")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Trophy className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      FIRST FINISHERS
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requireLogin("/trading-post")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/trading-post")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <ArrowLeftRight className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      TRADING POST
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/selling")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/selling")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Tag className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      SELLING
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => requestNavigation("/faq")}
                    className={`
            relative flex h-10 w-10 items-center justify-center rounded-xl
            border transition-all duration-200
            ${
              isActive("/faq")
                ? "border-[#E7C84B]/55 bg-[#E7C84B]/10 text-[#FFE477] shadow-[0_6px_18px_rgba(0,0,0,0.20)]"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/20 hover:bg-white/[0.065] hover:text-[#FFE477] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            }
          `}
                  >
                    <Search className="h-[17px] w-[17px]" />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111416]/95 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.02em] text-zinc-100 backdrop-blur-md opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
                      FAQ
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 min-w-[40px]">
            {staffButtons}
            <div ref={miniGamesRef} className="relative hidden lg:block">
              <button
                type="button"
                ref={miniGameButtonRef}
                aria-label="Video games"
                aria-haspopup="menu"
                aria-expanded={showMiniGames}
                onClick={() => setShowMiniGames((value) => !value)}
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all duration-200 ${
                  isLightMode
                    ? "border-[#E7C84B]/30 bg-white text-[#6d5210] hover:bg-[#fffaf0]"
                    : "border-white/10 bg-white/[0.045] text-zinc-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Gamepad2 className="h-[17px] w-[17px]" aria-hidden="true" />
                <span>Video games</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showMiniGames ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {showMiniGames && (
                <div
                  role="menu"
                  aria-label="Mini games"
                  className={`absolute right-0 top-[calc(100%+8px)] z-[21000] min-w-[220px] overflow-hidden rounded-2xl border p-1.5 shadow-[0_18px_48px_rgba(0,0,0,.35)] ${
                    isLightMode
                      ? "border-[#E7C84B]/25 bg-white text-[#312d24]"
                      : "border-white/10 bg-[#17191b] text-white"
                  }`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowMiniGames(false);
                      setShowPinkieParty(true);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      isLightMode ? "hover:bg-[#E7C84B]/10" : "hover:bg-white/[0.08]"
                    }`}
                  >
                    <Gamepad2 className="h-4 w-4 shrink-0 text-[#E7C84B]" aria-hidden="true" />
                    <span>Pinkie Pie&apos;s Party</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowMiniGames(false);
                      requestNavigation("/match-pairs");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      isLightMode ? "hover:bg-[#E7C84B]/10" : "hover:bg-white/[0.08]"
                    }`}
                  >
                    <Gamepad2 className="h-4 w-4 shrink-0 text-[#E7C84B]" aria-hidden="true" />
                    <span>Match Pairs</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowMiniGames(false);
                      requestNavigation("/go-fish");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                      isLightMode ? "hover:bg-[#E7C84B]/10" : "hover:bg-white/[0.08]"
                    }`}
                  >
                    <Gamepad2 className="h-4 w-4 shrink-0 text-[#E7C84B]" aria-hidden="true" />
                    <span>Go Fish</span>
                  </button>
                </div>
              )}
            </div>
            {user && (
              <Button
                type="button"
                onClick={() => setShowBugReport(true)}
                aria-label="Report a bug"
                title="Report a bug"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/[0.08] p-0 text-red-400 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-200 hover:border-red-400/60 hover:bg-red-500/[0.16] hover:text-red-300 active:scale-[0.98]"
              >
                <Bug className="h-[19px] w-[19px]" aria-hidden="true" />
              </Button>
            )}
            {!user && (
              <Button
                onClick={() => {
                  setAuthMode("login");
                  setLoginError("");
                  setShowForgot(false);
                  setShowLogin(true);
                }}
                className="h-10 rounded-full border border-[#E7C84B]/30 bg-[#E7C84B] px-5 text-sm font-semibold text-[#111517] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_24px_rgba(0,0,0,.22)] transition-all duration-200 hover:bg-[#FFE477] active:scale-[0.98]"
              >
                Log in
              </Button>
            )}
          </div>
        </div>
        <div
          className="kayou-header-mobile-actions absolute right-3 flex -translate-y-1/2 items-center gap-1.5 sm:hidden"
        >
          {user && (
            <div className="kayou-theme-picker">
              <button
                type="button"
                onClick={() => setShowThemeMenu((value) => !value)}
                disabled={themeSaving}
                aria-label="Choose theme"
                aria-expanded={showThemeMenu}
                title="Choose theme"
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors disabled:cursor-wait disabled:opacity-60 ${
                  isLightMode
                    ? "border-black/10 bg-black/[0.035] hover:bg-black/[0.07]"
                    : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"
                }`}
              >
                <CardImage src={themeIcon} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
              </button>
              <div className="kayou-theme-menu" data-open={showThemeMenu} role="group" aria-label="Theme choices">
                <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "light"} onClick={() => void handleThemeSelect("light")}><CardImage src="/website-assets/LightMode.webp" alt="" aria-hidden="true" /> Light</button>
                <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "dark"} onClick={() => void handleThemeSelect("dark")}><CardImage src="/website-assets/darkmodeactual.webp" alt="" aria-hidden="true" /> Dark</button>
                {canChooseSpooky && <button type="button" className="kayou-theme-option" aria-pressed={currentTheme === "spooky"} onClick={() => void handleThemeSelect("spooky")}><CardImage src="/website-assets/DarkMode.webp" alt="" aria-hidden="true" /> Spooky</button>}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => requestNavigation("/selling")}
            aria-label="Selling"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors ${
              isLightMode
                ? "border-black/10 bg-black/[0.035] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900"
                : "border-white/10 bg-white/[0.045] text-zinc-300 hover:bg-white/[0.08] hover:text-[#FFE477]"
            }`}
          >
            <Tag className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => requestNavigation("/faq")}
            aria-label="FAQ"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors ${
              isLightMode
                ? "border-black/10 bg-black/[0.035] text-zinc-700 hover:bg-black/[0.07] hover:text-zinc-900"
                : "border-white/10 bg-white/[0.045] text-zinc-300 hover:bg-white/[0.08] hover:text-[#FFE477]"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </header>
      {canReviewLGS && showLGSReview && (
        <LGSApproveDeny
          isLightMode={isLightMode}
          onClose={() => setShowLGSReview(false)}
        />
      )}
      {showPinkieParty && (
        <PinkieParty
          isLightMode={isLightMode}
          onClose={() => setShowPinkieParty(false)}
          returnFocusRef={miniGameButtonRef}
        />
      )}
      {showSignupSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#17191b]/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7C84B] text-[#111517] shadow-[0_8px_25px_rgba(231,200,75,.2)]">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5l4.5 4.5L19 7.5"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Account created
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              We sent a confirmation email. Open it to verify your account and
              finish signing up.
            </p>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              If you do not see the email, check your spam or junk folder.
            </p>
            <Button
              className="mt-6 h-11 w-full rounded-xl bg-[#E7C84B] text-sm font-semibold text-[#111517] hover:bg-[#FFE477]"
              onClick={() => setShowSignupSuccess(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
      {showForgotPassword && (
        <div
          className="
      fixed
      inset-0
      z-[30000]
      flex
      items-center
      justify-center
      bg-[#050708]/80
      px-4
      py-6
      backdrop-blur-md
    "
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            className="
        relative
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        border
        border-[#3B4144]
        bg-[#111517]
        shadow-[0_30px_100px_rgba(0,0,0,.75),0_0_45px_rgba(231,200,75,.08)]
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-[#30363A] bg-[#0D1113] px-6 py-5">
              <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#E7C84B]" />
              <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#E7C84B]/50" />
              <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#E7C84B]/40" />
              <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#E7C84B]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/[0.06]">
                    <span className="h-2 w-2 rounded-full bg-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,.9)]" />
                  </div>
                  <div>
                    <div className="font-mono text-[7px] font-bold uppercase tracking-[0.32em] text-[#E7C84B]">
                      MLPEKAYOU AUTH SYSTEM
                    </div>
                    <div className="mt-1 text-sm font-black uppercase tracking-[0.16em] text-white">
                      PASSWORD RESET
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-[#30363A]
              bg-[#15191B]
              font-mono
              text-lg
              text-zinc-300
              transition-all
              hover:border-[#E7C84B]
              hover:text-[#E7C84B]
            "
                ></button>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <div className="mb-6">
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#E7C84B]">
                  ACCOUNT RECOVERY
                </div>
                <div className="mt-2 text-xl font-black uppercase tracking-[0.08em] text-white">
                  Enter email
                </div>
                <p className="mt-2 text-sm leading-6 text-[#8B9295]">
                  Enter the email address associated with your MLPEKAYOU
                  account.
                </p>
              </div>
              <div>
                <label className="mb-2 block font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-300">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="collector@example.com"
                  value={loginEmail}
                  autoComplete="email"
                  autoFocus
                  className="
              w-full
              rounded-xl
              border
              border-[#343A3D]
              bg-[#0D1113]
              px-4
              py-3.5
              font-mono
              text-sm
              text-white
              outline-none
              placeholder:text-[#454B4E]
              transition-all
              focus:border-[#E7C84B]
              focus:bg-[#101518]
              focus:shadow-[0_0_0_3px_rgba(231,200,75,.07)]
            "
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setEmailError("");
                  }}
                />
                {emailError && (
                  <div className="mt-2 border-l-2 border-red-500 bg-red-500/[0.06] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-red-400">
                    {emailError}
                  </div>
                )}
              </div>
              <div className="mt-5 rounded-xl border border-[#E7C84B]/25 bg-[#E7C84B]/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/10">
                    <span className="font-mono text-[10px] font-black text-[#E7C84B]">
                      !
                    </span>
                  </div>
                  <p className="font-mono text-[8px] font-semibold uppercase leading-5 tracking-[0.1em] text-[#B8BDC0]">
                    GMAIL MAY SEND THE MLPEKAYOU EMAIL TO YOUR SPAM. YOU MAY
                    HAVE TO VERIFY THE EMAIL IS SAFE, THEN REFRESH TO ACCESS THE
                    LINK.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  disabled={resetSubmitting}
                  onClick={() => {
                    setShowForgotPassword(false);
                    setAuthMode("login");
                    setShowLogin(true);
                    setEmailError("");
                  }}
                  className="
              h-10
              rounded-xl
              border
              border-[#30363A]
              bg-[#15191B]
              px-5
              font-mono
              text-[8px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#777]
              hover:border-[#555]
              hover:bg-[#1A1F21]
              hover:text-white
            "
                >
                  BACK TO LOGIN
                </Button>
                <Button
                  type="button"
                  disabled={resetSubmitting}
                  onClick={() => {
                    if (!loginEmail.trim()) {
                      setEmailError("ENTER YOUR EMAIL ADDRESS");
                      return;
                    }
                    handleForgotPassword();
                  }}
                  className="
              group
              relative
              h-10
              overflow-hidden
              rounded-xl
              border
              border-[#E7C84B]
              bg-[#E7C84B]
              px-6
              font-mono
              text-[8px]
              font-black
              uppercase
              tracking-[0.2em]
              text-[#111517]
              shadow-[0_0_18px_rgba(231,200,75,.14)]
              transition-all
              hover:bg-[#FFE477]
              hover:shadow-[0_0_25px_rgba(231,200,75,.25)]
              active:scale-[0.98]
            "
                >
                  <span className="relative z-10">
                    {resetSubmitting ? "SENDING..." : "SEND RESET EMAIL"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 skew-x-[-20deg] bg-white/30 transition-all duration-500 group-hover:left-[115%]" />
                </Button>
              </div>
            </div>
            <div className="border-t border-[#252A2D] bg-[#0D1113] px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[6px] uppercase tracking-[0.25em] text-zinc-400">
                  RECOVERY NODE 01
                </span>
                <span className="flex items-center gap-2 font-mono text-[6px] uppercase tracking-[0.25em] text-green-400/60">
                  <span className="h-1 w-1 rounded-full bg-green-400" />
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showResetSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-6 flex flex-col ">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <CardImage
                src={
                  isLightMode
                    ? "/website-assets/mlpekayouwiki4.webp"
                    : isSpookyMode
                      ? "/website-assets/nightmarelogo.webp"
                      : "/website-assets/darkmodelogo.webp"
                }
                className="w-[600px] sm:w-[700px] md:w-[800px] h-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div className="text-center mb-6 text-gray-700">
              <div
                className="text-3xl font-bold mb-2 tracking-wide"
                style={{
                  color: "#ffffff",
                  textShadow: "0 2px 12px rgba(0,0,0,.45)",
                }}
              >
                Password Reset Sent
              </div>
              <div className="text-sm text-gray-500 space-y-3">
                <p>
                  If an email exists for this account, you will find a password
                  reset link in your inbox or junk mail. Please recheck the
                  email you entered if you don't find it. The most common error
                  is an invalid email entered at login.
                </p>
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-800">
                  <strong>Important:</strong> The word "Reset Password" will be
                  the link. You may be required to authorize the email from your
                  junk and refresh it in order to access the link.
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#E7C84B] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
                onClick={() => setShowResetSent(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
      {showBugReport && (
        <div
          className="fixed inset-0 z-[30000] flex items-center justify-center bg-transparent px-4 backdrop-blur-md"
          onClick={() => setShowBugReport(false)}
        >
          <div
            className={`w-full max-w-lg rounded-[24px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,.25)] backdrop-blur-xl ${
              isLightMode
                ? "border-[#E7C84B]/20 bg-white/95 text-[#312d24]"
                : "border-white/10 bg-[#17191b]/95 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                Contact support
              </h2>
              <p
                className={`mt-2 text-sm leading-6 ${isLightMode ? "text-[#6b6252]" : "text-zinc-400"}`}
              >
                If you need to contact the developer of this website, please use
                one of the options below.
              </p>
            </div>
            <div
              className={`mt-5 rounded-2xl border p-4 ${isLightMode ? "border-[#E7C84B]/15 bg-[#E7C84B]/[0.06]" : "border-white/[0.08] bg-white/[0.035]"}`}
            >
              <p
                className={`text-sm font-medium ${isLightMode ? "text-[#4f4635]" : "text-zinc-200"}`}
              >
                Please reserve these communications for serious inquiries, such
                as:
              </p>
              <ul
                className={`mt-3 space-y-1.5 text-sm ${isLightMode ? "text-[#6b6252]" : "text-zinc-400"}`}
              >
                <li>Bugs</li>
                <li>Glitches</li>
                <li>Account issues</li>
                <li>Discord server issues</li>
              </ul>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://discord.gg/mlpekayou",
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${isLightMode ? "border-[#E7C84B]/20 bg-white hover:border-[#E7C84B]/35 hover:bg-[#fffaf0]" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.10]"}`}
              >
                <span
                  className={`block text-sm font-semibold ${isLightMode ? "text-[#312d24]" : "text-white"}`}
                >
                  MLPEKAYOU Discord
                </span>
                <span
                  className={`mt-1 block text-xs ${isLightMode ? "text-[#756b59]" : "text-zinc-400"}`}
                >
                  discord.gg/mlpekayou
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "mailto:mlpekayou@gmail.com";
                }}
                className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${isLightMode ? "border-[#E7C84B]/20 bg-white hover:border-[#E7C84B]/35 hover:bg-[#fffaf0]" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.10]"}`}
              >
                <span
                  className={`block text-sm font-semibold ${isLightMode ? "text-[#312d24]" : "text-white"}`}
                >
                  Email the developer
                </span>
                <span
                  className={`mt-1 block text-xs ${isLightMode ? "text-[#756b59]" : "text-zinc-400"}`}
                >
                  mlpekayou@gmail.com
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowBugReport(false)}
              className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.99] ${isLightMode ? "bg-[#E7C84B] text-[#17191b] hover:bg-[#FFE477]" : "bg-white text-[#17191b] hover:bg-zinc-100"}`}
            >
              Done
            </button>
          </div>
        </div>
      )}
      {showLoginRequired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050707]/95 px-4 backdrop-blur-md">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.025)_4px)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD54A]/[0.025] blur-3xl" />
          <div className="relative w-[92%] max-w-lg overflow-hidden border border-white/[0.10] bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.8)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#050707] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)]" />
                <span className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-red-400/80">
                  ACCESS DENIED
                </span>
              </div>
              <span className="font-mono text-[6px] uppercase tracking-[0.22em] text-zinc-400">
                AUTH NODE
              </span>
            </div>
            <div className="relative p-6 sm:p-8">
              <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l border-t border-[#FFD54A]/50" />
              <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/25" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#FFD54A]/20" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b border-r border-[#FFD54A]/50" />
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD54A]/30 bg-[#FFD54A]/[0.06] shadow-[0_0_30px_rgba(255,212,74,.08)]">
                <div className="relative flex h-8 w-8 items-center justify-center border border-[#FFD54A]/70">
                  <span className="absolute h-2 w-2 bg-[#FFD54A] shadow-[0_0_12px_#FFD54A]" />
                  <span className="absolute inset-1 border border-[#FFD54A]/20" />
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="font-mono text-[6px] font-bold uppercase tracking-[0.35em] text-zinc-400">
                  COLLECTION SYSTEM
                </div>
                <h2 className="mt-2 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
                  Login Required
                </h2>
                <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#FFD54A]/70 to-transparent" />
              </div>
              <div className="mt-6 border border-white/[0.07] bg-[#050707] px-5 py-4 text-center">
                <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                  Authorization Required
                </div>
                <p className="mt-2 font-mono text-[7px] uppercase leading-5 tracking-[0.07em] text-zinc-400">
                  You cannot access this page without being signed in to an
                  account.
                </p>
              </div>
              <Button
                onClick={() => setShowLoginRequired(false)}
                className="group relative mt-5 h-auto w-full overflow-hidden rounded-none border border-[#FFD54A]/60 bg-[#FFD54A] px-4 py-3 font-['Oxanium'] text-[10px] font-black uppercase tracking-[0.2em] text-[#090b0d] shadow-none transition-all duration-200 hover:bg-[#FFE27A] hover:text-[#090b0d] hover:shadow-[0_0_30px_rgba(255,212,74,.18)]"
              >
                <span className="absolute left-0 top-0 h-px w-10 bg-white/80" />
                <span className="absolute bottom-0 right-0 h-px w-10 bg-black/30" />
                <span className="flex items-center justify-center gap-3">
                  <span>ACKNOWLEDGE</span>
                  <span className="text-sm transition-transform duration-200 group-hover:translate-x-1"></span>
                </span>
              </Button>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-white/[0.06]" />
                <span className="font-mono text-[5px] uppercase tracking-[0.3em] text-zinc-400">
                  SECURE SESSION GATE
                </span>
                <span className="h-px w-8 bg-white/[0.06]" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#050707] px-4 py-2">
              <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-zinc-400">
                STATUS: UNAUTHORIZED
              </span>
              <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-[#FFD54A]/40">
                MLPEKAYOU // SYSTEM
              </span>
            </div>
          </div>
        </div>
      )}
      {showUnconfirmedEmail && (
        <div
          className="fixed inset-0 z-[30010] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
          onClick={() => setShowUnconfirmedEmail(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#17191b]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Email confirmation required
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Hey! It looks like you never completed the sign-up process with
              that email. You have to confirm your email before you can log in.
              If you can&apos;t find the confirmation email, it&apos;s in your
              junk/spam. Any extra instructions you need will be in the email
              that was sent to you.
            </p>
            <Button
              type="button"
              onClick={() => setShowUnconfirmedEmail(false)}
              className="mt-6 h-11 w-full rounded-xl bg-[#E7C84B] text-sm font-semibold text-[#111517] hover:bg-[#FFE477]"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
      {showExistingAccount && (
        <div
          className="fixed inset-0 z-[30010] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
          onClick={() => setShowExistingAccount(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#17191b]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Account already exists
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Hey! An account already exists with that email. Would you like to
              send a password reset?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={resetSubmitting}
                onClick={async () => {
                  setShowExistingAccount(false);
                  await handleForgotPassword();
                }}
                className="h-11 flex-1 rounded-xl bg-[#E7C84B] text-sm font-semibold text-[#111517] hover:bg-[#FFE477]"
              >
                {resetSubmitting ? "Sending..." : "Send password reset"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowExistingAccount(false);
                  setAuthMode("login");
                  setShowLogin(true);
                }}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/[0.1]"
              >
                Go to login
              </Button>
            </div>
          </div>
        </div>
      )}
      {showLogin && (
        <div
          className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#17191b]/95 shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pb-3 pt-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {authMode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {authMode === "login"
                    ? "Log in to access your collection and profile."
                    : "Sign up to save your collection and use member features."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                aria-label="Close"
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xl text-zinc-400 transition hover:bg-white/[0.1] hover:text-white"
              >
                x
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                authMode === "login"
                  ? handleLoginSubmit()
                  : handleSignupSubmit();
              }}
              className="px-6 pb-6 pt-3"
            >
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={loginEmail}
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#E7C84B]/60 focus:ring-4 focus:ring-[#E7C84B]/[0.08]"
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setEmailError("");
                    setLoginError("");
                    setShowForgot(false);
                  }}
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-400">{emailError}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#E7C84B]/60 focus:ring-4 focus:ring-[#E7C84B]/[0.08]"
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                    setShowForgot(false);
                  }}
                />
              </div>
              {authMode === "signup" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#E7C84B]/60 focus:ring-4 focus:ring-[#E7C84B]/[0.08]"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    You will need to verify your email before your account is
                    active. Check spam or junk if the email does not appear.
                  </p>
                </div>
              )}
              {loginError && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                  {loginError}
                </div>
              )}
              {authMode === "login" && (
                <div className="mb-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setShowForgotPassword(true);
                      setLoginError("");
                      setEmailError("");
                    }}
                    className="text-sm text-zinc-400 transition hover:text-[#E7C84B]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button
                type="submit"
                disabled={authSubmitting}
                className="h-11 w-full rounded-xl bg-[#E7C84B] text-sm font-semibold text-[#111517] hover:bg-[#FFE477]"
              >
                {authSubmitting
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : authMode === "login"
                    ? "Log in"
                    : "Create account"}
              </Button>
              <div className="mt-5 text-center text-sm text-zinc-500">
                {authMode === "login"
                  ? "New here?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setLoginError("");
                    setShowForgot(false);
                  }}
                  className="font-medium text-[#E7C84B] transition hover:text-[#FFE477]"
                >
                  {authMode === "login" ? "Create an account" : "Log in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div
        className={`
    sm:hidden fixed z-[99999]
    kayou-mobile-nav
    grid place-items-center overflow-hidden
    rounded-[24px] border
    backdrop-blur-xl
    transition-all duration-300 ease-out
    ${
      isLightMode
        ? "border-black/10 bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.8)]"
        : "border-white/10 bg-[#111416]/92 shadow-[0_12px_36px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]"
    }
    ${mobileNavCollapsed ? "grid-cols-1" : "grid-cols-4"}
  `}
        style={{
          width: mobileNavCollapsed ? "56px" : "calc(100% - 32px)",
          maxWidth: mobileNavCollapsed ? "56px" : "360px",
          height: "58px",
          left: mobileNavCollapsed ? "12%" : "50%",
          transform: "translateX(-50%)",
          WebkitTransform: "translateX(-50%)",
        }}
      >
        <button
          onClick={() => {
            if (mobileNavCollapsed) {
              setMobileNavCollapsed(false);
              return;
            }
            goHome();
          }}
          aria-label="Home"
          className={`flex h-full items-center justify-center transition-colors ${
            mobileNavCollapsed
              ? `w-[56px] ${isLightMode ? "text-zinc-700" : "text-[#FFE477]"}`
              : location.pathname === "/"
                ? isLightMode
                  ? "w-full bg-black/[0.055] text-zinc-800"
                  : "w-full bg-white/[0.07] text-[#FFE477]"
                : isLightMode
                  ? "w-full text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900"
                  : "w-full text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
          }`}
        >
          <Home className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            setShowMobileProgressMenu(false);
            setShowMobileIsoMenu(false);
            setShowMobileLeaderboardMenu(false);
            setShowMobileHomeMenu(false);
            requestNavigation("/collections");
          }}
          aria-label="Collections"
          className={`h-full w-full items-center justify-center transition-colors ${
            mobileNavCollapsed ? "hidden" : "flex"
          } ${
            location.pathname.startsWith("/collections")
              ? isLightMode
                ? "bg-black/[0.055] text-zinc-800"
                : "bg-white/[0.07] text-[#FFE477]"
              : isLightMode
                ? "text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
          }`}
        >
          <Sparkles className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            setShowMobileProgressMenu(false);
            setShowMobileIsoMenu(false);
            setShowMobileLeaderboardMenu(false);
            setShowMobileHomeMenu(false);
            requestNavigation("/explore");
          }}
          aria-label="Explore"
          className={`h-full w-full items-center justify-center transition-colors ${
            mobileNavCollapsed ? "hidden" : "flex"
          } ${
            location.pathname.startsWith("/explore")
              ? isLightMode
                ? "bg-black/[0.055] text-zinc-800"
                : "bg-white/[0.07] text-[#FFE477]"
              : isLightMode
                ? "text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
          }`}
        >
          <Users className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            setShowMobileProgressMenu(false);
            setShowMobileIsoMenu(false);
            setShowMobileLeaderboardMenu(false);
            setShowMobileHomeMenu(false);
            if (!user) {
              setAuthMode("login");
              setShowLogin(true);
              return;
            }
            requestNavigation("/mobile-profile");
          }}
          aria-label={
            inboxNotificationCount > 0
              ? `Profile, ${inboxNotificationCount} unread inbox notifications`
              : "Profile"
          }
          className={`relative h-full w-full items-center justify-center transition-colors ${
            mobileNavCollapsed ? "hidden" : "flex"
          } ${
            location.pathname.startsWith("/mobile-profile")
              ? isLightMode
                ? "bg-black/[0.055] text-zinc-800"
                : "bg-white/[0.07] text-[#FFE477]"
              : isLightMode
                ? "text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
          }`}
        >
          <User className="h-5 w-5" />
          {inboxNotificationCount > 0 && (
            <span className="absolute right-[calc(50%-18px)] top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white">
              {notificationCountLabel}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
export default KayouHeader;
