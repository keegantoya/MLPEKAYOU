import {
  ShoppingBag,
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRef } from "react";
import { getProfileAssets } from "../pages/Everypony/profile-assets";
const logo = "/website-assets/mlpekayouwiki4.webp";
const generateUsername = () => {
  const names = [
    "Twilight Sparkle",
    "Pinkie Pie",
    "Applejack",
    "Fluttershy",
    "Rarity",
    "Rainbow Dash",
    "Princess Celestia",
    "Princess Luna",
    "Princess Cadance",
    "Princess Flurry Heart"
  ];
  const name = names[Math.floor(Math.random() * names.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${name} ${number}`;
};
const KayouHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
const [isLightMode, setIsLightMode] = useState(false);
const [themeSaving, setThemeSaving] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
  return sessionStorage.getItem("avatar");
});
const [showMobileLeaderboardMenu, setShowMobileLeaderboardMenu] = useState(false);
const [showMobileHomeMenu, setShowMobileHomeMenu] = useState(false);
const [showMobileProgressMenu, setShowMobileProgressMenu] = useState(false);
const [showMobileIsoMenu, setShowMobileIsoMenu] = useState(false);
const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [newUsername, setNewUsername] = useState("");
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
  const [showTradesMenu, setShowTradesMenu] = useState(false);
  const [showIsoMenu, setShowIsoMenu] = useState(false);
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);
const [showProgressMenu, setShowProgressMenu] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);
const { avatar: profileAvatar, verification } =
  getProfileAssets(profile ?? {});
  const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (data?.avatar_url) {
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
    handleProfileUpdated as EventListener
  );
  return () => {
    window.removeEventListener(
      "profile-updated",
      handleProfileUpdated as EventListener
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
    const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  const currentUser = data.session?.user ?? null;
  setUser(currentUser);
  if (currentUser) {
    getProfile(currentUser.id);  }
};
    getSession();
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null);
});
return () => subscription.unsubscribe();
  }, []);
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
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: loginPassword,
  });
  if (error) {
    setLoginError("Incorrect password");
    setShowForgot(true);
    return;
  }
  setShowLogin(false);
  setLoginEmail("");
  setLoginPassword("");
  setLoginError("");
  setShowForgot(false);
};
const handleForgotPassword = async () => {
  try {
    console.log("Sending reset for:", loginEmail);
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      loginEmail,
      {
        redirectTo: window.location.origin + "/password-reset",
      }
    );
    console.log("Reset response:", data, error);
    if (error) {
      alert("Error sending reset: " + error.message);
    } else {
  setShowLogin(false);
  setShowResetSent(true);
}
  } catch (err) {
    console.error("Reset failed:", err);
  }
};
  const handleSignupSubmit = async () => {
  if (loginPassword !== confirmPassword) {
    setLoginError("Passwords do not match");
    return;
  }
  const username = generateUsername();
  const { data, error } = await supabase.auth.signUp({
  email: loginEmail,
  password: loginPassword,
  options: {
    emailRedirectTo: window.location.origin + "/account-confirmation",
    data: { username }
  }
});
  if (error) {
    alert(error.message);
    return;
  }
  setNewUsername(username);
  setShowLogin(false);
  setShowSignupSuccess(true);
  setLoginEmail("");
  setLoginPassword("");
  setConfirmPassword("");
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
const applyTheme = (lightMode: boolean) => {
  document.documentElement.classList.toggle("light", lightMode);
  document.documentElement.classList.toggle("dark", !lightMode);
  document.documentElement.dataset.theme = lightMode ? "light" : "dark";
  document.documentElement.style.colorScheme = lightMode ? "light" : "dark";
};
useEffect(() => {
  if (!user) {
    setIsLightMode(false);
    applyTheme(false);
    return;
  }
  let cancelled = false;
  const loadThemePreference = async () => {
    const { data, error } = await supabase
      .from("user_light_mode_preferences")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (cancelled) return;
    if (error) {
      console.error("Unable to load theme preference:", error);
      setIsLightMode(false);
      applyTheme(false);
      return;
    }
    const lightMode = Boolean(data);
    setIsLightMode(lightMode);
    applyTheme(lightMode);
  };
  loadThemePreference();
  return () => {
    cancelled = true;
  };
}, [user?.id]);
const handleThemeToggle = async () => {
  if (!user || themeSaving) return;
  const nextLightMode = !isLightMode;
  setThemeSaving(true);
  setIsLightMode(nextLightMode);
  applyTheme(nextLightMode);
  const { error } = nextLightMode
    ? await supabase
        .from("user_light_mode_preferences")
        .upsert({ user_id: user.id }, { onConflict: "user_id" })
    : await supabase
        .from("user_light_mode_preferences")
        .delete()
        .eq("user_id", user.id);
  if (error) {
    console.error("Unable to save theme preference:", error);
    setIsLightMode(!nextLightMode);
    applyTheme(!nextLightMode);
  }
  setThemeSaving(false);
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLightMode(false);
    applyTheme(false);
    navigate("/");
  };
  const isActive = (path: string) => {
  if (path === "/") {
    return location.pathname === "/";
  }
  return location.pathname.startsWith(path);
};
return (
  <div className={`kayou-header-scope ${isLightMode ? "kayou-header-light" : ""}`}>
<style>{`
  .kayou-header-light { color: #5f4a12; }
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
`} </style>
<header
  className={`fixed left-0 right-0 z-[20000] text-[#E7C84B] ${
    !window.matchMedia("(display-mode: standalone)").matches
      ? "top-0"
      : "top-0"
  }`}
  style={{
    background: isLightMode
      ? "linear-gradient(180deg, #ffffff 0%, #fffdf7 72%, #fffaf0 100%)"
      : "linear-gradient(180deg, #0d1113 0%, #0b0e10 72%, #090b0d 100%)",
    WebkitTransform: "translateZ(0)",
    transform: "translateZ(0)",
    boxShadow: isLightMode
      ? "0 10px 40px rgba(160,120,20,.14), 0 0 30px rgba(231,200,75,.16), inset 0 -1px 0 rgba(190,145,30,.30)"
      : "0 10px 35px rgba(0,0,0,.45), inset 0 -1px 0 rgba(250,204,21,.10)",
  }}
>
  {/* DESKTOP HUD FRAME */}
<div className={`pointer-events-none absolute inset-x-0 bottom-0 hidden h-px bg-gradient-to-r from-transparent to-transparent sm:block ${
  isLightMode ? "via-[#FFE477]/80 shadow-[0_0_14px_rgba(231,200,75,.55)]" : "via-yellow-400/35"
}`} />
<div className={`pointer-events-none absolute inset-x-0 top-0 hidden h-[2px] bg-gradient-to-r from-transparent to-transparent sm:block ${
  isLightMode ? "via-[#FFE477]/55 shadow-[0_0_18px_rgba(231,200,75,.42)]" : "via-yellow-400/20"
}`} />
<div className="pointer-events-none absolute left-0 top-0 hidden h-3 w-24 border-l border-t border-yellow-400/20 sm:block" />
<div className="pointer-events-none absolute right-0 top-0 hidden h-3 w-24 border-r border-t border-yellow-400/20 sm:block" />
 <div
  className="w-full flex sm:h-16 items-center px-2 sm:px-4 relative justify-between"
style={{
  height: window.innerWidth < 640
    ? (
        window.matchMedia('(display-mode: standalone)').matches
          ? `calc(44px + env(safe-area-inset-top))`
          : `52px`
      )
    : `64px`,
  paddingTop:
    window.innerWidth < 640 &&
    window.matchMedia('(display-mode: standalone)').matches
      ? `env(safe-area-inset-top)`
      : `0px`
}}
>
{/* LEFT SIDE */}
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
{/* MOBILE PROFILE / LOGIN */}
<div className="sm:hidden absolute left-3 flex items-center gap-1.5"
  style={{
    top: window.matchMedia("(display-mode: standalone)").matches
      ? "calc(50% + env(safe-area-inset-top) / 2)"
      : "50%",
    transform: "translateY(-50%)",
  }}>
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
{/* DESKTOP DISCORD BUTTON */}
{user && (
  <div className="hidden sm:flex items-center gap-2">
    <button
      type="button"
      data-header-theme-toggle="true"
      onClick={handleThemeToggle}
      disabled={themeSaving}
      aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
      title={isLightMode ? "Dark mode" : "Light mode"}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-200 disabled:cursor-wait disabled:opacity-60 ${
        isLightMode
          ? "border-[#D6B84A]/45 bg-white text-[#8A6A16] shadow-[0_0_22px_rgba(231,200,75,.20)] hover:border-[#D6B84A]/70 hover:bg-[#fffaf0]"
          : "border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]"
      }`}
    >
      <img
        src={isLightMode ? "/website-assets/LightMode.webp" : "/website-assets/DarkMode.webp"}
        alt=""
        aria-hidden="true"
        className="h-6 w-6 object-contain"
      />
    </button>
    <Sheet
      modal={false}
      open={open}
      onOpenChange={setOpen}
    >
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
<img
  src={avatarSrc || profileAvatar}
  alt="avatar"
  className={`relative z-10 h-12 w-12 rounded-2xl object-cover border transition-all duration-200 ${
    open
      ? "border-[#E7C84B]/50 shadow-[0_5px_16px_rgba(0,0,0,0.30)]"
      : "border-white/10"
  }`}
/>
        <span className={`absolute bottom-1 right-1 z-20 h-3 w-3 rounded-full border-2 bg-[#a3e635] ${isLightMode ? "border-white" : "border-[#0d1113]"}`} />
      </button>
    </SheetTrigger>
<SheetContent
  side="left"
  onInteractOutside={(event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-header-theme-toggle="true"]')) {
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
    {/* Profile Header */}
    <div className="border-b border-white/10 px-5 py-5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 truncate text-lg font-semibold tracking-[-0.01em] text-white">
          {profile?.username || "My Profile"}
        </div>
        {verification && (
          <img
            src={verification.badge}
            alt={verification.label}
            title={verification.label}
            className="h-5 w-5 flex-shrink-0 object-contain"
          />
        )}
      </div>
    </div>
    {/* Menu Items */}
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
          requestNavigation("/kayou-news");
          setOpen(false);
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <CalendarDays className="h-[18px] w-[18px] text-zinc-400" />
        <span>Kayou US Events</span>
      </button>
      <button
        onClick={() => {
          requestNavigation("/inbox");
          setOpen(false);
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <Mail className="h-[18px] w-[18px] text-zinc-400" />
        <span>Inbox & Friends</span>
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
    </div>
    {/* Footer */}
    <div className="border-t border-white/10 p-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <button
          onClick={() => window.open("https://discord.gg/mlpekayou", "_blank")}
          aria-label="Discord"
          title="Discord"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <img
            src={isLightMode ? "/website-assets/discordlightmode.webp" : "/website-assets/discordlogo.webp"}
            alt="Discord"
            className={`h-5 w-auto ${isLightMode ? "opacity-100" : "opacity-80"}`}
          />
        </button>
        <button
          onClick={() => window.open("https://www.tiktok.com/@keanaex", "_blank")}
          aria-label="TikTok"
          title="TikTok"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <img
            src={isLightMode ? "/website-assets/tiktoklightmode.webp" : "/website-assets/tiktoklogo.webp"}
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
  </div>
)}
</div>
{/* MOBILE CENTER LOGO */}
<img
  src={isLightMode ? "/website-assets/mlpekayouwiki4.webp" : "/website-assets/darkmodelogo.webp"}
  alt="MLP Kayou Wiki"
  className="sm:hidden absolute left-1/2 -translate-x-1/2 h-8 w-auto scale-[1.65] cursor-pointer object-contain drop-shadow-md"
  onClick={(event) => { event.preventDefault(); event.stopPropagation(); goHome(); }}
/>
{/* CENTER LOGO + DESKTOP HUD NAV */}
<div
  className="absolute left-1/2 hidden sm:flex -translate-x-1/2 items-center"
>
  <div className="relative flex items-center">
    {/* LEFT NAV SYSTEM */}
    <div className="flex items-center gap-1.5">
      {/* SHOP */}
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
      {/* EXPLORE */}
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
      {/* COLLECTIONS */}
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
      {/* LEADERBOARD */}
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
    {/* CENTRAL LOGO CORE */}
    <div className="relative mx-4 flex items-center">
      {/* Left data rail */}
      <div className="mr-3 flex items-center gap-1">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-yellow-400/50" />
        <span className="h-1 w-1 bg-yellow-400 shadow-[0_0_7px_#facc15]" />
      </div>
      <button
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); goHome(); }}
        className="group relative flex h-[54px] w-[120px] items-center justify-center overflow-visible bg-transparent transition-all duration-200"
      >
        <img
          src={isLightMode ? "/website-assets/mlpekayouwiki4.webp" : "/website-assets/darkmodelogo.webp"}
          alt="MLP Kayou Wiki"
          className="relative z-10 h-[42px] w-auto translate-y-[1px] scale-[1.9] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:translate-y-[1px] group-hover:scale-[1.96]"
        />
      </button>
      {/* Right data rail */}
      <div className="ml-3 flex items-center gap-1">
        <span className="h-1 w-1 bg-yellow-400 shadow-[0_0_7px_#facc15]" />
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-yellow-400/50" />
      </div>
    </div>
    {/* RIGHT NAV SYSTEM */}
    <div className="flex items-center gap-1.5">
      {/* FIRST FINISHERS */}
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
      {/* TRADING POST */}
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
      {/* SELLING */}
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
      {/* FAQ */}
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
{/* RIGHT SIDE */}
<div className="hidden sm:flex items-center gap-2 min-w-[40px]">
  {user && (
<Button
  onClick={() => setShowBugReport(true)}
  className="hidden h-10 items-center rounded-full border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-200 sm:flex hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
>
  Report a bug
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
{/* MOBILE FAQ + SELLING BUTTONS */}
<div className="sm:hidden absolute right-3 flex items-center gap-1.5"
  style={{
    top: window.matchMedia("(display-mode: standalone)").matches
      ? "calc(50% + env(safe-area-inset-top) / 2)"
      : "50%",
    transform: "translateY(-50%)",
  }}>
  {user && (
    <button
      type="button"
      onClick={handleThemeToggle}
      disabled={themeSaving}
      aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
      title={isLightMode ? "Dark mode" : "Light mode"}
      className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors disabled:cursor-wait disabled:opacity-60 ${
        isLightMode
          ? "border-black/10 bg-black/[0.035] hover:bg-black/[0.07]"
          : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"
      }`}
    >
      <img
        src={isLightMode ? "/website-assets/LightMode.webp" : "/website-assets/DarkMode.webp"}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain"
      />
    </button>
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
{/* SIGNUP SUCCESS POPUP */}
{showSignupSuccess && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#17191b]/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.06)]">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7C84B] text-[#111517] shadow-[0_8px_25px_rgba(231,200,75,.2)]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">Account created</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        We sent a confirmation email. Open it to verify your account and finish signing up.
      </p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
        <div className="text-xs font-medium text-zinc-500">Your username</div>
        <div className="mt-1 text-lg font-semibold text-[#E7C84B]">{newUsername}</div>
      </div>
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
{/* FORGOT PASSWORD POPUP */}
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
      {/* HEADER */}
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
          >
            ×
          </button>
        </div>
      </div>
      {/* CONTENT */}
      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#E7C84B]">
            ACCOUNT RECOVERY
          </div>
          <div className="mt-2 text-xl font-black uppercase tracking-[0.08em] text-white">
            Enter email
          </div>
          <p className="mt-2 text-sm leading-6 text-[#8B9295]">
            Enter the email address associated with your MLPEKAYOU account.
          </p>
        </div>
        {/* EMAIL */}
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
        {/* GMAIL WARNING */}
        <div className="mt-5 rounded-xl border border-[#E7C84B]/25 bg-[#E7C84B]/[0.05] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/10">
              <span className="font-mono text-[10px] font-black text-[#E7C84B]">
                !
              </span>
            </div>
            <p className="font-mono text-[8px] font-semibold uppercase leading-5 tracking-[0.1em] text-[#B8BDC0]">
              GMAIL MAY SEND THE MLPEKAYOU EMAIL TO YOUR SPAM. YOU MAY HAVE TO VERIFY THE EMAIL IS SAFE, THEN REFRESH TO ACCESS THE LINK.
            </p>
          </div>
        </div>
        {/* ACTIONS */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
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
              SEND RESET EMAIL
            </span>
            <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 skew-x-[-20deg] bg-white/30 transition-all duration-500 group-hover:left-[115%]" />
          </Button>
        </div>
      </div>
      {/* FOOTER */}
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
{/* RESET SENT POPUP */}
{showResetSent && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-6 flex flex-col ">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <img
    src={isLightMode ? "/website-assets/mlpekayouwiki4.webp" : "/website-assets/darkmodelogo.webp"}
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
    If an email exists for this account, you will find a password reset
    link in your inbox or junk mail. Please recheck the email you entered
    if you don't find it. The most common error is an invalid email entered
    at login.
  </p>
  <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-800">
    <strong>Important:</strong> The word "Reset Password" will be the link. You may be required to authorize
    the email from your junk and refresh it in order to access the link.
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
{/* REPORT A BUG POPUP */}
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
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Contact support</h2>
        <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-[#6b6252]" : "text-zinc-400"}`}>
          If you need to contact the developer of this website, please use one of the options below.
        </p>
      </div>
      <div className={`mt-5 rounded-2xl border p-4 ${isLightMode ? "border-[#E7C84B]/15 bg-[#E7C84B]/[0.06]" : "border-white/[0.08] bg-white/[0.035]"}`}>
        <p className={`text-sm font-medium ${isLightMode ? "text-[#4f4635]" : "text-zinc-200"}`}>
          Please reserve these communications for serious inquiries, such as:
        </p>
        <ul className={`mt-3 space-y-1.5 text-sm ${isLightMode ? "text-[#6b6252]" : "text-zinc-400"}`}>
          <li>• Bugs</li>
          <li>• Glitches</li>
          <li>• Account issues</li>
          <li>• Discord server issues</li>
        </ul>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            window.open(
              "https://discord.gg/mlpekayou",
              "_blank",
              "noopener,noreferrer"
            )
          }
          className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${isLightMode ? "border-[#E7C84B]/20 bg-white hover:border-[#E7C84B]/35 hover:bg-[#fffaf0]" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.10]"}`}
        >
          <span className={`block text-sm font-semibold ${isLightMode ? "text-[#312d24]" : "text-white"}`}>MLPEKAYOU Discord</span>
          <span className={`mt-1 block text-xs ${isLightMode ? "text-[#756b59]" : "text-zinc-400"}`}>discord.gg/mlpekayou</span>
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.href = "mailto:mlpekayou@gmail.com";
          }}
          className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${isLightMode ? "border-[#E7C84B]/20 bg-white hover:border-[#E7C84B]/35 hover:bg-[#fffaf0]" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.10]"}`}
        >
          <span className={`block text-sm font-semibold ${isLightMode ? "text-[#312d24]" : "text-white"}`}>Email the developer</span>
          <span className={`mt-1 block text-xs ${isLightMode ? "text-[#756b59]" : "text-zinc-400"}`}>mlpekayou@gmail.com</span>
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
    {/* TECH GRID */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.3]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,212,74,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }}
    />
    {/* SCANLINES */}
    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.025)_4px)]" />
    {/* AMBIENT GOLD */}
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD54A]/[0.025] blur-3xl" />
    {/* PANEL */}
    <div className="relative w-[92%] max-w-lg overflow-hidden border border-white/[0.10] bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.8)]">
      {/* TOP SYSTEM BAR */}
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
      {/* CONTENT */}
      <div className="relative p-6 sm:p-8">
        {/* CORNER BRACKETS */}
        <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l border-t border-[#FFD54A]/50" />
        <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t border-[#FFD54A]/25" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#FFD54A]/20" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b border-r border-[#FFD54A]/50" />
        {/* ACCESS CORE */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#FFD54A]/30 bg-[#FFD54A]/[0.06] shadow-[0_0_30px_rgba(255,212,74,.08)]">
          <div className="relative flex h-8 w-8 items-center justify-center border border-[#FFD54A]/70">
            <span className="absolute h-2 w-2 bg-[#FFD54A] shadow-[0_0_12px_#FFD54A]" />
            <span className="absolute inset-1 border border-[#FFD54A]/20" />
          </div>
        </div>
        {/* TITLE */}
        <div className="mt-6 text-center">
          <div className="font-mono text-[6px] font-bold uppercase tracking-[0.35em] text-zinc-400">
            COLLECTION SYSTEM
          </div>
          <h2 className="mt-2 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
            Login Required
          </h2>
          <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#FFD54A]/70 to-transparent" />
        </div>
        {/* MESSAGE */}
        <div className="mt-6 border border-white/[0.07] bg-[#050707] px-5 py-4 text-center">
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-300">
            Authorization Required
          </div>
          <p className="mt-2 font-mono text-[7px] uppercase leading-5 tracking-[0.07em] text-zinc-400">
            You cannot access this page without being signed in to an account.
          </p>
        </div>
        {/* ACTION */}
        <Button
          onClick={() => setShowLoginRequired(false)}
          className="group relative mt-5 h-auto w-full overflow-hidden rounded-none border border-[#FFD54A]/60 bg-[#FFD54A] px-4 py-3 font-['Oxanium'] text-[10px] font-black uppercase tracking-[0.2em] text-[#090b0d] shadow-none transition-all duration-200 hover:bg-[#FFE27A] hover:text-[#090b0d] hover:shadow-[0_0_30px_rgba(255,212,74,.18)]"
        >
          <span className="absolute left-0 top-0 h-px w-10 bg-white/80" />
          <span className="absolute bottom-0 right-0 h-px w-10 bg-black/30" />
          <span className="flex items-center justify-center gap-3">
            <span>ACKNOWLEDGE</span>
            <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </span>
        </Button>
        {/* SYSTEM LABEL */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-white/[0.06]" />
          <span className="font-mono text-[5px] uppercase tracking-[0.3em] text-zinc-400">
            SECURE SESSION GATE
          </span>
          <span className="h-px w-8 bg-white/[0.06]" />
        </div>
      </div>
      {/* BOTTOM STATUS */}
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
{/* LOGIN / CREATE ACCOUNT POPUP */}
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
            {authMode === "login" ? "Welcome back" : "Create your account"}
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
          ×
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          authMode === "login" ? handleLoginSubmit() : handleSignupSubmit();
        }}
        className="px-6 pb-6 pt-3"
      >
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
          <input
            type="email"
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
          {emailError && <p className="mt-2 text-sm text-red-400">{emailError}</p>}
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-300">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={loginPassword}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
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
            <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm password</label>
            <input
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#E7C84B]/60 focus:ring-4 focus:ring-[#E7C84B]/[0.08]"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              You will need to verify your email before your account is active. Check spam or junk if the email does not appear.
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
          className="h-11 w-full rounded-xl bg-[#E7C84B] text-sm font-semibold text-[#111517] hover:bg-[#FFE477]"
        >
          {authMode === "login" ? "Log in" : "Create account"}
        </Button>
        <div className="mt-5 text-center text-sm text-zinc-500">
          {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
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
{/* MOBILE BOTTOM NAV */}
<div
  className={`
    sm:hidden fixed bottom-5 z-[99999]
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
  {/* HOMEPAGE */}
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
  {/* COLLECTIONS */}
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
  {/* EXPLORE */}
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
  {/* PROFILE */}
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
    aria-label="Profile"
    className={`h-full w-full items-center justify-center transition-colors ${
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
  </button>
</div>
</div>
);
};
export default KayouHeader;