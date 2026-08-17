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

const logo = "/website-assets/mlpekayouwiki3.webp";

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

const requireLogin = (path: string) => {
  if (!user) {
    setShowLoginRequired(true);
    return;
  }

  requestNavigation(path);
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) => {
  if (path === "/") {
    return location.pathname === "/";
  }

  return location.pathname.startsWith(path);
};

return (
  <>

<header
  className={`fixed left-0 right-0 z-[20000] text-[#E7C84B] ${
    !window.matchMedia("(display-mode: standalone)").matches
      ? "top-0"
      : "top-0"
  }`}
  style={{
    background:
      "linear-gradient(180deg, #0d1113 0%, #0b0e10 72%, #090b0d 100%)",
    WebkitTransform: "translateZ(0)",
    transform: "translateZ(0)",
    boxShadow:
      "0 10px 35px rgba(0,0,0,.45), inset 0 -1px 0 rgba(250,204,21,.10)",
  }}
>

  {/* DESKTOP HUD FRAME */}
<div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-px bg-gradient-to-r from-transparent via-yellow-400/35 to-transparent sm:block" />

<div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[2px] bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent sm:block" />

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
  className="
    group
    relative
    hidden
    h-10
    items-center
    gap-2.5
    overflow-hidden
    rounded-xl
    border
    border-[#E7C84B]/70
    bg-[#111517]
    px-5
    font-mono
    text-[9px]
    font-bold
    uppercase
    tracking-[0.18em]
    text-[#E7C84B]
    shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_6px_20px_rgba(0,0,0,.35)]
    transition-all
    duration-200
    sm:flex
    hover:border-[#FFE477]
    hover:bg-[#171B1D]
    hover:text-[#FFE477]
    hover:shadow-[0_0_22px_rgba(231,200,75,.18)]
    active:scale-[0.98]
  "
>
  <span className="relative flex h-5 w-5 items-center justify-center rounded-md border border-[#E7C84B]/40 bg-[#E7C84B]/[0.06]">
    <span className="h-1.5 w-1.5 rounded-full bg-[#E7C84B] shadow-[0_0_9px_rgba(231,200,75,.85)] transition-transform duration-200 group-hover:scale-125" />
  </span>

  <span className="relative z-10">
    CREATE ACCOUNT
  </span>

  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 skew-x-[-20deg] bg-gradient-to-r from-transparent via-[#E7C84B]/20 to-transparent transition-all duration-500 group-hover:left-[110%]" />

  <span className="absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-[#E7C84B]/70 to-transparent" />
  <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#E7C84B]/30 to-transparent" />
</Button>
  )}

{/* MOBILE PROFILE / LOGIN */}
<div
  className="sm:hidden flex items-center gap-2"
  style={{
    marginTop: "-10px"
  }}
>
  {!user ? (
<Button
  onClick={() => {
    setAuthMode("login");
    setLoginError("");
    setShowForgot(false);
    setShowLogin(true);
  }}
  className="
    group
    relative
    h-10
    overflow-hidden
    rounded-xl
    border
    border-[#E7C84B]/80
    bg-[#E7C84B]
    px-6
    font-mono
    text-[9px]
    font-black
    uppercase
    tracking-[0.2em]
    text-[#111517]
    shadow-[0_0_16px_rgba(231,200,75,.16),inset_0_1px_0_rgba(255,255,255,.45)]
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:bg-[#FFE477]
    hover:shadow-[0_0_24px_rgba(231,200,75,.30)]
    active:scale-[0.98]
  "
>
  <span className="relative z-10 flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-[#111517] shadow-[0_0_10px_rgba(17,21,23,.7)]" />
    LOGIN
  </span>

  <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 skew-x-[-20deg] bg-white/30 transition-all duration-500 group-hover:left-[115%]" />

  <span className="absolute left-3 right-3 top-0 h-px bg-white/50" />
</Button>
  ) : (
    <>
      <button
        onClick={() => requestNavigation("/leaderboard")}
        className="group relative flex h-8 w-8 items-center justify-center border border-[#343A3D] bg-[#111517] text-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,.10)] transition-all duration-200 hover:border-[#E7C84B]/80 hover:bg-[#171B1D] hover:shadow-[0_0_16px_rgba(231,200,75,.18)]"
      >
        <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/35" />
        <Trophy className="relative z-10 h-4 w-4" />
      </button>

      <button
        onClick={() => requestNavigation("/community")}
        className="group relative flex h-8 w-8 items-center justify-center border border-[#343A3D] bg-[#111517] text-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,.10)] transition-all duration-200 hover:border-[#E7C84B]/80 hover:bg-[#171B1D] hover:shadow-[0_0_16px_rgba(231,200,75,.18)]"
      >
        <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
        <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/35" />
        <Medal className="relative z-10 h-4 w-4" />
      </button>
    </>
  )}
</div>

{/* DESKTOP DISCORD BUTTON */}

{user && (
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <button
        className={`relative hidden sm:flex h-12 w-12 items-center justify-center border bg-[#0b0f11] transition-all duration-200 ${
          open
            ? "border-[#E7C84B] shadow-[0_0_18px_rgba(231,200,75,0.30)]"
            : "border-[#30363a] hover:border-[#E7C84B] hover:shadow-[0_0_18px_rgba(231,200,75,0.20)]"
        }`}
      >
        <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#E7C84B]" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#E7C84B]/60" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#E7C84B]/60" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#E7C84B]" />

<img
  src={avatarSrc || profileAvatar}
  alt="avatar"
  className={`relative z-10 h-9 w-9 object-cover border transition-all duration-200 ${
    open
      ? "border-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,0.35)]"
      : "border-[#454545] group-hover:border-[#E7C84B]"
  }`}
/>

        <span className="absolute bottom-1 right-1 z-20 h-2 w-2 bg-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
      </button>
    </SheetTrigger>

<SheetContent
  side="left"
  className="top-16 h-[calc(100vh-64px)] w-[260px] bg-[#161616] border-r border-[#E7C84B] text-[#E7C84B] [&>button]:hidden p-0"
>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col items-center pt-2 pb-2">
          <div className="mt-2 flex items-center justify-center gap-2">
  <div className="text-xl font-semibold text-[#E7C84B]">
    {profile?.username || "My Profile"}
  </div>

{verification && (
  <img
    src={verification.badge}
    alt={verification.label}
    title={verification.label}
    className="w-5 h-5 object-contain flex-shrink-0"
  />
)}
</div>
        </div>

{/* Menu Items */}
<div className="py-2 px-3 space-y-2">

  {/* ACCOUNT */}
  <div className="space-y-1.5">
    <button
      onClick={() => {
        requestNavigation("/desktop-profile");
        setOpen(false);
      }}
      className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
    >
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]" />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

      <span className="mr-3 flex h-6 w-6 items-center justify-center border border-[#E7C84B]/30 bg-[#151a1d] text-[9px] font-bold text-[#E7C84B]">
        ID
      </span>

      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-200">
          Edit Profile
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
          IDENTIFICATION
        </span>
      </span>

      <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#E7C84B]/90 group-hover:text-[#E7C84B]">
        CFG
      </span>
    </button>

    <button
      onClick={() => {
        requestNavigation("/kayou-news");
        setOpen(false);
      }}
      className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
    >
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]/80" />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

      <span className="mr-3 h-5 w-[2px] bg-[#E7C84B]/70 transition-all duration-200 group-hover:h-6 group-hover:bg-[#E7C84B]" />

      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-200">
          Kayou US Events
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
          OFFICIAL FEED
        </span>
      </span>

      <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#E7C84B]/90 group-hover:text-[#E7C84B]">
        SYS
      </span>
    </button>

    <button
      onClick={() => {
        requestNavigation("/inbox");
        setOpen(false);
      }}
      className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
    >
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]/80" />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

      <span className="mr-3 h-5 w-[2px] bg-[#E7C84B]/70 transition-all duration-200 group-hover:h-6 group-hover:bg-[#E7C84B]" />

      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-200">
          Inbox & Friends
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
          INTERNAL COMMS
        </span>
      </span>

      <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#E7C84B]/90 group-hover:text-[#E7C84B]">
        COM
      </span>
    </button>
  </div>

  {/* PROGRESS */}
  <div className="space-y-1.5">

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => {
          requestNavigation("/my-progress");
          setOpen(false);
        }}
        className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
      >
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]/80" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

        <span className="mr-3 h-5 w-[2px] bg-[#E7C84B]/70 transition-all duration-200 group-hover:h-6 group-hover:bg-[#E7C84B]" />

        <span className="flex flex-1 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
            CCG
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
            CCG STATS
          </span>
        </span>
      </button>

      <button
        onClick={() => {
          requestNavigation("/progress-tcg");
          setOpen(false);
        }}
        className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
      >
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]/80" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

        <span className="mr-3 h-5 w-[2px] bg-[#E7C84B]/70 transition-all duration-200 group-hover:h-6 group-hover:bg-[#E7C84B]" />

        <span className="flex flex-1 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
            TCG
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
            TCG STATS
          </span>
        </span>
      </button>
    </div>
  </div>

  {/* COLLECTION */}
  <div className="space-y-1.5">

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => {
          requestNavigation("/inventory");
          setOpen(false);
        }}
        className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
      >
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

        <span className="flex flex-1 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
            Inventory
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
            CARD DATABASE
          </span>
        </span>
      </button>

      <button
        onClick={() => {
          requestNavigation("/binders");
          setOpen(false);
        }}
        className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
      >
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[#E7C84B]/80" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[#E7C84B]/50" />

        <span className="flex flex-1 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
            Binders
          </span>
          <span className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
            DIGITAL MOCK
          </span>
        </span>
      </button>
    </div>
  </div>

  {/* TRADING */}
  <div className="space-y-1.5">

    <button
      onClick={() => {
        requestNavigation("/iso");
        setOpen(false);
      }}
      className="group relative flex w-full items-center overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2.5 text-left text-white transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_18px_rgba(231,200,75,0.14)]"
    >
      <span className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#E7C84B]" />
      <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#E7C84B]/40" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#E7C84B]/40" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#E7C84B]/50" />

      <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center border border-[#E7C84B]/30 bg-[#151a1d] font-mono text-[8px] font-bold text-[#E7C84B]">
        ISO
      </span>

      <span className="flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
          ISO / Wishlist
        </span>

        <span className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.22em] text-zinc-400 group-hover:text-[#E7C84B]/70">
          WANT & TRADE TARGETS
        </span>
      </span>

      <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#E7C84B]/90 group-hover:text-[#E7C84B]">
        ISO
      </span>
    </button>
  </div>

  <div className="mx-4 my-2 border-t border-zinc-700" />

  {/* Logout */}
  <button
    onClick={() => {
      handleLogout();
      setOpen(false);
    }}
    className="group relative ml-4 flex w-[calc(100%-2rem)] items-center justify-between overflow-hidden border border-[#4a3030] bg-[#120e0e] px-4 py-2 text-left text-[#dca0a0] transition-all duration-200 hover:border-red-400/70 hover:bg-[#1a1010] hover:text-red-300 hover:shadow-[0_0_18px_rgba(248,113,113,0.12)]"
  >
    <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-red-400/70" />
    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-red-400/40" />

    <span className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
        Logout
      </span>
      <span className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.2em] text-red-300/80 group-hover:text-red-300/70">
        TERMINATE SESSION
      </span>
    </span>

    <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-red-300/90 group-hover:text-red-300">
      EXIT
    </span>
  </button>
</div>

{/* Social Links */}
<div className="pt-2">
  <div className="flex items-center justify-center gap-3 py-2">
<button
  onClick={() => window.open("https://discord.gg/fb7cHz4kdD", "_blank")}
  className="group relative flex h-10 w-10 items-center justify-center border border-[#30363a] bg-[#0d1113] transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_16px_rgba(231,200,75,0.15)]"
>
  <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
  <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-[#E7C84B]/40" />
  <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#E7C84B]/40" />
  <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/70" />

  <img
    src="/website-assets/discordlogo.webp"
    alt="Discord"
    className="h-6 w-auto opacity-60 transition-all duration-200 group-hover:opacity-100"
  />

  <span className="absolute -bottom-1 left-1/2 h-px w-3 -translate-x-1/2 bg-[#E7C84B]/60" />
</button>

<button
  onClick={() => window.open("https://www.tiktok.com/@keanaex", "_blank")}
  className="group relative flex h-10 w-10 items-center justify-center border border-[#30363a] bg-[#0d1113] transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#111619] hover:shadow-[0_0_16px_rgba(231,200,75,0.15)]"
>
  <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
  <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/40" />

  <img
    src="/website-assets/tiktoklogo.webp"
    alt="TikTok"
    className="h-6 w-auto opacity-60 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0"
  />

  <span className="absolute -bottom-1 left-1/2 h-px w-3 -translate-x-1/2 bg-[#E7C84B]/60" />
</button>
  </div>
</div>
      </div>
    </SheetContent>
  </Sheet>
)}
</div>

{/* MOBILE CENTER LOGO */}
<img
  src={logo}
  alt="MLP Kayou Wiki"
  className="sm:hidden absolute left-1/2 -translate-x-1/2 h-8 w-auto cursor-pointer drop-shadow-md"
  onClick={() => requestNavigation("/")}
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
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/support-mlpekayou")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <ShoppingBag className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            SHOP
          </span>
        </button>
      </div>

      {/* EXPLORE */}
      <div className="relative group">
        <button
          onClick={() => requireLogin("/explore")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/explore")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Users className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            EXPLORE
          </span>
        </button>
      </div>

      {/* COLLECTIONS */}
      <div className="relative group">
        <button
          onClick={() => requestNavigation("/collections")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/collections")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Sparkles className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            COLLECTIONS
          </span>
        </button>
      </div>

      {/* LEADERBOARD */}
      <div className="relative group">
        <button
          onClick={() => requestNavigation("/leaderboard")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/leaderboard")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Medal className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
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
        onClick={() => requestNavigation("/")}
        className="group relative flex h-[58px] w-[150px] items-center justify-center border border-[#30363a] bg-[#0d1113] transition-all duration-300 hover:border-yellow-400/60 hover:bg-[#111619]"
      >
        {/* HUD corners */}
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-yellow-400/70" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-yellow-400/40" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-yellow-400/40" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-yellow-400/70" />

        {/* Scan line */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Background grid */}
        <span className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(250,204,21,1)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,1)_1px,transparent_1px)] [background-size:12px_12px]" />

        <img
          src={logo}
          alt="MLP Kayou Wiki"
          className="relative z-10 h-[42px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Status */}
        <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 bg-[#0d1113] px-2 font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-zinc-400">
          SYSTEM ONLINE
        </span>
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
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/community")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Trophy className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            FIRST FINISHERS
          </span>
        </button>
      </div>

      {/* TRADING POST */}
      <div className="relative group">
        <button
          onClick={() => requireLogin("/trading-post")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/trading-post")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <ArrowLeftRight className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            TRADING POST
          </span>
        </button>
      </div>

      {/* SELLING */}
      <div className="relative group">
        <button
          onClick={() => requestNavigation("/selling")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/selling")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Tag className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
            SELLING
          </span>
        </button>
      </div>

      {/* FAQ */}
      <div className="relative group">
        <button
          onClick={() => requestNavigation("/faq")}
          className={`
            relative flex h-10 w-10 items-center justify-center
            border transition-all duration-200
            ${
              isActive("/faq")
                ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                : "border-[#30363a] bg-[#0f1315] text-zinc-500 hover:border-yellow-400/70 hover:bg-[#151a1d] hover:text-yellow-300"
            }
          `}
        >
          <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-yellow-400/50" />
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-yellow-400/30" />

          <Search className="h-[17px] w-[17px]" />

          <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap border border-[#30363a] bg-[#090b0d] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-yellow-400 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-opacity group-hover:opacity-100">
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
  className="
    group
    relative
    hidden
    h-10
    items-center
    gap-2.5
    overflow-hidden
    rounded-xl
    border
    border-red-500/60
    bg-[#181818]
    px-4
    font-mono
    text-[9px]
    font-bold
    uppercase
    tracking-[0.18em]
    text-red-400
    shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_6px_20px_rgba(0,0,0,.35)]
    transition-all
    duration-200
    sm:flex
    hover:border-red-400
    hover:bg-[#211616]
    hover:text-red-300
    hover:shadow-[0_0_22px_rgba(239,68,68,.18)]
    active:scale-[0.98]
  "
>
  {/* Stark status light */}
  <span className="relative flex h-5 w-5 items-center justify-center rounded-md border border-red-500/50 bg-red-500/[0.08]">

    <span className="absolute h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)] transition-all duration-200 group-hover:scale-125" />

  </span>

  <span className="relative z-10">
    REPORT A BUG
  </span>

  {/* Technical sweep */}
  <span
    className="
      pointer-events-none
      absolute
      inset-y-0
      -left-12
      w-10
      skew-x-[-20deg]
      bg-gradient-to-r
      from-transparent
      via-red-400/20
      to-transparent
      transition-all
      duration-500
      group-hover:left-[110%]
    "
  />

  {/* Top status rail */}
  <span className="absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />

  {/* Bottom status rail */}
  <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
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
  className="
    group
    relative
    h-10
    overflow-hidden
    rounded-xl
    border
    border-[#E7C84B]/80
    bg-[#E7C84B]
    px-6
    font-mono
    text-[9px]
    font-black
    uppercase
    tracking-[0.2em]
    text-[#111517]
    shadow-[0_0_16px_rgba(231,200,75,.16),inset_0_1px_0_rgba(255,255,255,.45)]
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:bg-[#FFE477]
    hover:shadow-[0_0_24px_rgba(231,200,75,.30)]
    active:scale-[0.98]
  "
>
  <span className="relative z-10 flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-[#111517] shadow-[0_0_7px_rgba(17,21,23,.7)]" />
    LOGIN
  </span>

  <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 skew-x-[-20deg] bg-white/30 transition-all duration-500 group-hover:left-[115%]" />

  <span className="absolute left-3 right-3 top-0 h-px bg-white/50" />
</Button>
  )}

</div>

  </div>

  

{/* MOBILE FAQ + SELLING BUTTONS */}
<div className="sm:hidden absolute right-3 bottom-2 flex items-center gap-2">
  <button
    type="button"
    onClick={() => requestNavigation("/selling")}
    aria-label="Selling"
    className="group relative flex h-8 w-8 items-center justify-center border border-[#343A3D] bg-[#111517] text-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,.10)] transition-all duration-200 hover:border-[#E7C84B]/80 hover:bg-[#171B1D] hover:shadow-[0_0_16px_rgba(231,200,75,.18)]"
  >
    <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
    <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/35" />
    <Tag className="relative z-10 h-4 w-4" />
  </button>

  <button
    type="button"
    onClick={() => requestNavigation("/faq")}
    aria-label="FAQ"
    className="group relative flex h-8 w-8 items-center justify-center border border-[#343A3D] bg-[#111517] text-[#E7C84B] shadow-[0_0_12px_rgba(231,200,75,.10)] transition-all duration-200 hover:border-[#E7C84B]/80 hover:bg-[#171B1D] hover:shadow-[0_0_16px_rgba(231,200,75,.18)]"
  >
    <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B]/70" />
    <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B]/35" />
    <Search className="relative z-10 h-4 w-4" />
  </button>
</div>
</header>

{/* SIGNUP SUCCESS POPUP — STARK INDUSTRIES STYLE */}
{showSignupSuccess && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4">

    <div
      className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[#D4AF37]/50 bg-[#111214] shadow-[0_0_80px_rgba(212,175,55,0.15),0_25px_80px_rgba(0,0,0,0.7)]"
      style={{
        fontFamily: "Oxanium, sans-serif",
      }}
    >

      {/* TOP GOLD STATUS BAR */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#E7C84B] to-transparent" />

      {/* SUBTLE TECH GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* HEADER */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4">

        <div className="flex items-center gap-3">

          {/* MINI ARC REACTOR */}
          <div className="relative flex h-10 w-10 items-center justify-center">

            <div className="absolute inset-0 rounded-full border border-[#E7C84B]/30" />

            <div className="absolute inset-[5px] rounded-full border border-[#E7C84B]/60" />

            <div className="absolute inset-[10px] rounded-full bg-[#E7C84B] shadow-[0_0_18px_rgba(231,200,75,.8)]" />

            <div className="absolute inset-[13px] rounded-full bg-white shadow-[0_0_10px_white]" />

          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E7C84B]">
              MLPEKAY SYSTEM
            </div>

            <div className="text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
              Account Initialization
            </div>
          </div>

        </div>

        {/* SYSTEM STATUS */}
        <div className="flex items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            SYSTEM ONLINE
          </span>

        </div>

      </div>


      {/* MAIN CONTENT */}
      <div className="relative px-7 py-8 sm:px-10">

        <div className="flex flex-col items-center text-center">

          {/* SUCCESS INDICATOR */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">

            <div className="absolute inset-0 rounded-full border border-[#E7C84B]/20" />

            <div className="absolute inset-2 rounded-full border border-[#E7C84B]/40" />

            <div className="absolute inset-4 rounded-full border border-[#E7C84B]/70 shadow-[0_0_25px_rgba(231,200,75,.25)]" />

            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#E7C84B] shadow-[0_0_30px_rgba(231,200,75,.55)]">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-[#111214]"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5l4.5 4.5L19 7.5"
                />
              </svg>
            </div>

          </div>


          {/* TITLE */}
          <div className="mb-2 text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl">
            Account Created
          </div>

          <div className="mb-7 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
            Identity successfully initialized
          </div>


          {/* USERNAME MODULE */}
          <div className="w-full max-w-md rounded-lg border border-[#E7C84B]/20 bg-white/[0.025] p-5">

            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#E7C84B]/70">
              Assigned Designation
            </div>

            <div className="text-2xl font-black tracking-wider text-[#E7C84B] drop-shadow-[0_0_12px_rgba(231,200,75,.2)]">
              {newUsername}
            </div>

          </div>


          {/* EMAIL MESSAGE */}
          <div className="mt-6 max-w-lg text-sm leading-6 text-white/55">
            A confirmation transmission has been sent to your email address.
            <span className="block text-white/75">
              Verify your account to complete activation.
            </span>
          </div>


          {/* TECHNICAL DIVIDER */}
          <div className="mt-7 flex w-full max-w-md items-center gap-3">

            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
              SECURE CHANNEL
            </div>

            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />

          </div>

        </div>

      </div>


      {/* FOOTER */}
      <div className="relative flex items-center justify-between border-t border-white/10 bg-black/20 px-6 py-4">

        <div className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:block">
          MLPEKAY // AUTH SYSTEM
        </div>

        <Button
          className="
            ml-auto
            min-w-[130px]
            border border-[#E7C84B]/60
            bg-[#E7C84B]
            text-[#111214]
            font-black
            uppercase
            tracking-[0.15em]
            shadow-[0_0_20px_rgba(231,200,75,.15)]
            transition-all
            duration-200
            hover:bg-[#f3d65f]
            hover:shadow-[0_0_28px_rgba(231,200,75,.3)]
            hover:scale-[1.02]
          "
          onClick={() => setShowSignupSuccess(false)}
        >
          Acknowledge
        </Button>

      </div>


      {/* CORNER DETAILS */}
      <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#E7C84B]/30" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#E7C84B]/30" />
      <div className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-l border-t border-[#E7C84B]/30" />
      <div className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-r border-t border-[#E7C84B]/30" />

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
    src={logo}
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
    className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    onClick={() => setShowBugReport(false)}
  >
    <div
      className="relative w-full max-w-md overflow-hidden rounded-md border border-red-500/40 bg-[#101212] shadow-[0_0_45px_rgba(220,38,38,.20)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-red-500/70" />
      <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-red-500/70" />

      <div className="border-b border-red-500/20 bg-[#1b1010] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-red-500/50 bg-red-500/10">
            <span className="text-lg font-black text-red-400">!</span>
          </div>

          <div>
            <div className="font-mono text-[6px] font-bold uppercase tracking-[0.3em] text-red-300/90">
              SYSTEM SUPPORT
            </div>
            <div className="mt-1 font-['Oxanium'] text-base font-bold uppercase tracking-[0.08em] text-white">
              Report a Bug
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-sm leading-6 text-zinc-300">
          Currently, bugs can only be reported in the MLPEKAYOU Discord
          server. Please join the server and find the{" "}
          <span className="font-semibold text-red-300">"Important"</span>{" "}
          category, then the last channel will be{" "}
          <span className="font-semibold text-red-300">"Bugs."</span>{" "}
          All requirements of reporting a bug are present in that channel.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowBugReport(false)}
            className="border border-white/[0.09] bg-[#181a1a] px-4 py-3 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-all active:scale-[0.98]"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(
                "https://discord.gg/mlpekayou",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="border border-red-400/70 bg-gradient-to-b from-[#dc2626] to-[#991b1b] px-4 py-3 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_0_16px_rgba(220,38,38,.18)] transition-all active:scale-[0.98]"
          >
            Join Discord
          </button>
        </div>
      </div>

      <div className="border-t border-red-500/10 bg-[#0c0e0e] px-5 py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[5px] uppercase tracking-[0.2em] text-red-300/80">
            BUG REPORT PROTOCOL
          </span>
          <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-red-300/80">
            DISCORD REQUIRED
          </span>
        </div>
      </div>
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
    onClick={() => setShowLogin(false)}
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

      {/* ========================================================
          TOP HUD
      ======================================================== */}
      <div className="relative border-b border-[#30363A] bg-[#0D1113] px-6 py-5">

        {/* HUD corners */}
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
                {authMode === "login"
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => setShowLogin(false)}
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

        <div className="mt-4 flex items-center gap-2">

          <span className="h-px flex-1 bg-[#30363A]" />

          <span className="font-mono text-[6px] uppercase tracking-[0.28em] text-zinc-400">
            SECURE CONNECTION
          </span>

          <span className="h-1 w-1 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,.8)]" />

        </div>

      </div>

      {/* ========================================================
          FORM
      ======================================================== */}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          authMode === "login"
            ? handleLoginSubmit()
            : handleSignupSubmit();
        }}
        className="p-6 sm:p-7"
      >

        {/* Intro */}
        <div className="mb-6">

          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-400">
            {authMode === "login"
              ? "ACCESS YOUR ACCOUNT"
              : "JOIN MLPEKAYOU TODAY!"}
          </div>

          <p className="mt-2 text-sm leading-6 text-[#8B9295]">
            {authMode === "login"
              ? "Enter your top secret SuperFan credentials below."
              : "Create your account and begin building your collection."}
          </p>

        </div>

        {/* Email */}
        <div className="mb-4">

          <label className="mb-2 block font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-300">
            EMAIL ADDRESS
          </label>

          <div className="relative">

            <input
              type="email"
              placeholder="collector@example.com"
              value={loginEmail}
              autoComplete="email"
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
                setLoginError("");
                setShowForgot(false);
              }}
            />

            <span className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#3F4649]" />

          </div>

          {emailError && (
            <div className="mt-2 border-l-2 border-red-500 bg-red-500/[0.06] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-red-400">
              {emailError}
            </div>
          )}

        </div>

        {/* Password */}
        <div className="mb-4">

          <label className="mb-2 block font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-300">
            PASSWORD
          </label>

          <div className="relative">

            <input
              type="password"
              placeholder="Enter password"
              value={loginPassword}
              autoComplete={
                authMode === "login"
                  ? "current-password"
                  : "new-password"
              }
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
                setLoginPassword(e.target.value);
                setLoginError("");
                setShowForgot(false);
              }}
            />

            <span className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#3F4649]" />

          </div>

        </div>

        {/* Confirm password */}
        {authMode === "signup" && (
          <div className="mb-4">

            <label className="mb-2 block font-mono text-[7px] font-bold uppercase tracking-[0.25em] text-zinc-300">
              CONFIRM PASSWORD
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              autoComplete="new-password"
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
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

<div className="mt-3 rounded-lg border border-[#E7C84B]/20 bg-[#E7C84B]/[0.05] px-3 py-3">
  <div className="flex items-start gap-2.5">

    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#E7C84B]/40 bg-[#E7C84B]/10">
      <span className="font-mono text-[9px] font-black text-[#E7C84B]">
        !
      </span>
    </div>

    <p className="font-mono text-[9px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#B8BDC0]">
      EMAIL VERIFICATION IS REQUIRED. GMAIL MAY SORT THIS INTO SPAM, AND MAY REQUIRE YOU TO MARK IT AS "SAFE" AND THEN REFRESH THE E-MAIL TO ACCESS THE LINK.
    </p>

  </div>
</div>

          </div>
        )}

        {/* Error */}
        {loginError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3">

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 font-black text-red-400">
              !
            </div>

            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
                AUTHENTICATION ERROR
              </div>

              <div className="mt-1 text-xs leading-5 text-red-300/80">
                {loginError}
              </div>
            </div>

          </div>
        )}
{/* FORGOT PASSWORD */}
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
      className="
        group
        relative
        font-mono
        text-[8px]
        font-bold
        uppercase
        tracking-[0.18em]
        text-[#777]
        transition-all
        duration-200
        hover:text-[#E7C84B]
      "
    >
      <span className="group-hover:drop-shadow-[0_0_10px_rgba(231,200,75,.35)]">
        FORGOT PASSWORD?
      </span>

      <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#E7C84B] transition-all duration-200 group-hover:w-full" />
    </button>
  </div>
)}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Mode switch */}
          <Button
            type="button"
            variant="ghost"
            className="
              h-10
              rounded-xl
              border
              border-[#30363A]
              bg-[#15191B]
              px-4
              font-mono
              text-[8px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#777]
              hover:border-[#E7C84B]/60
              hover:bg-[#1A1F21]
              hover:text-[#E7C84B]
            "
            onClick={() => {
              setAuthMode(
                authMode === "login"
                  ? "signup"
                  : "login"
              );
              setLoginError("");
              setShowForgot(false);
            }}
          >
            {authMode === "login"
              ? "CREATE ACCOUNT"
              : "BACK TO LOGIN"}
          </Button>

          <div className="flex gap-2">

            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowLogin(false)}
              className="
                h-10
                rounded-xl
                border
                border-[#30363A]
                bg-transparent
                px-4
                font-mono
                text-[8px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-zinc-300
                hover:border-[#555]
                hover:bg-[#15191B]
                hover:text-white
              "
            >
              CANCEL
            </Button>

            <Button
              type="submit"
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
                {authMode === "login"
                  ? "AUTHENTICATE"
                  : "INITIALIZE"}
              </span>

              <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 skew-x-[-20deg] bg-white/30 transition-all duration-500 group-hover:left-[115%]" />
            </Button>

          </div>

        </div>

      </form>

      {/* Bottom status rail */}
      <div className="border-t border-[#252A2D] bg-[#0D1113] px-6 py-3">

        <div className="flex items-center justify-between">

          <span className="font-mono text-[6px] uppercase tracking-[0.25em] text-zinc-400">
            AUTH NODE 01
          </span>

          <span className="flex items-center gap-2 font-mono text-[6px] uppercase tracking-[0.25em] text-green-400/60">
            <span className="h-1 w-1 rounded-full bg-green-400" />
            ONLINE
          </span>

        </div>

      </div>

    </div>
  </div>
)}

{/* MOBILE BOTTOM NAV */}
<div
  className={`
    sm:hidden
    fixed
    bottom-6
    z-[99999]
    overflow-hidden
    transition-all
    duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]
    grid
    place-items-center
    ${
      mobileNavCollapsed
        ? "grid-cols-1"
        : "grid-cols-5"
    }
  `}
  style={{
    width: mobileNavCollapsed
      ? "68px"
      : "calc(100% - 48px)",

    maxWidth: mobileNavCollapsed
      ? "68px"
      : "360px",

    height: "68px",

    left: mobileNavCollapsed
      ? "15%"
      : "50%",

    background: "rgba(13, 17, 19, 0.97)",

    backdropFilter: "blur(8px) saturate(120%)",
    WebkitBackdropFilter: "blur(8px) saturate(120%)",

    border: "1px solid rgba(231, 200, 75, 0.28)",

    boxShadow: `
      0 8px 24px rgba(0,0,0,0.48),
      inset 0 1px 0 rgba(255,255,255,0.07),
      inset 0 -1px 0 rgba(0,0,0,0.55),
      0 0 18px rgba(231,200,75,0.07)
    `,

    transform: "translateX(-50%)",
    WebkitTransform: "translateX(-50%)",

    willChange: "transform",

    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",

    contain: "paint",
  }}
>
  {/* STARK HUD EDGE */}
  <span className="pointer-events-none absolute left-0 top-0 z-20 h-px w-16 bg-gradient-to-r from-[#E7C84B] via-[#E7C84B]/70 to-transparent" />

  <span className="pointer-events-none absolute right-0 bottom-0 z-20 h-px w-16 bg-gradient-to-l from-[#E7C84B]/70 via-[#E7C84B]/40 to-transparent" />

  <span className="pointer-events-none absolute left-0 top-0 z-20 h-3 w-3 border-l border-t border-[#E7C84B]/70" />

  <span className="pointer-events-none absolute right-0 top-0 z-20 h-3 w-3 border-r border-t border-[#E7C84B]/30" />

  <span className="pointer-events-none absolute bottom-0 left-0 z-20 h-3 w-3 border-b border-l border-[#E7C84B]/30" />

  <span className="pointer-events-none absolute bottom-0 right-0 z-20 h-3 w-3 border-b border-r border-[#E7C84B]/70" />

  {/* ACTIVE PAGE INDICATOR */}
  <div
    className={`
      absolute
      top-1/2
      h-[60px]
      w-[60px]
      pointer-events-none
      ${mobileNavCollapsed ? "opacity-0" : "opacity-100"}
    `}
style={{
  width: "58px",
  height: "54px",

  background: "rgba(231, 200, 75, 0.055)",

  border: "1px solid rgba(231, 200, 75, 0.32)",

  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.045),
    inset 0 -1px 0 rgba(0,0,0,0.35),
    0 0 14px rgba(231,200,75,0.07)
  `,

  left:
    location.pathname === "/"
      ? "9.5%"
      : location.pathname.startsWith("/collections")
      ? "30%"
      : location.pathname.startsWith("/trading-post")
      ? "50%"
      : location.pathname.startsWith("/explore")
      ? "70%"
      : "90%",

  transform: "translate(-50%, -50%)",

  borderRadius:
    location.pathname === "/"
      ? "30px 12px 12px 30px"
      : location.pathname.startsWith("/collections")
      ? "12px"
      : location.pathname.startsWith("/trading-post")
      ? "12px"
      : location.pathname.startsWith("/explore")
      ? "12px"
      : "12px 30px 30px 12px",

  transition:
    "left 350ms cubic-bezier(0.22, 1.4, 0.36, 1), transform 350ms cubic-bezier(0.22, 1.4, 0.36, 1)",

  willChange: "left, transform",
}}
  />

  {/* HOMEPAGE */}
  <button
    onClick={() => {
      if (mobileNavCollapsed) {
        setMobileNavCollapsed(false);
        return;
      }

      setShowMobileProgressMenu(false);
      setShowMobileIsoMenu(false);
      setShowMobileLeaderboardMenu(false);
      setShowMobileHomeMenu(false);

      requestNavigation("/");
    }}
    className={`
      relative
      z-50
      flex
      h-full
      items-center
      justify-center
      text-[#E7C84B]
      transition-all
      duration-300
      ${
        mobileNavCollapsed
          ? "w-[68px]"
          : "px-3"
      }
    `}
  >
    <span className="flex flex-col items-center justify-center gap-0.5">
      <Home className="h-5 w-5 drop-shadow-[0_0_6px_rgba(231,200,75,0.35)]" />

      {!mobileNavCollapsed && (
        <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#E7C84B]/80">
          HOME
        </span>
      )}
    </span>
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
    className={`
      relative
      z-10
      flex
      h-full
      items-center
      justify-center
      px-3
      text-[#E7C84B]
      transition-all
      duration-300
      ${
        mobileNavCollapsed
          ? "hidden"
          : "opacity-100 scale-100"
      }
    `}
  >
    <span className="flex flex-col items-center justify-center gap-0.5">
      <Sparkles className="h-5 w-5 drop-shadow-[0_0_6px_rgba(231,200,75,0.35)]" />

      <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#E7C84B]/80">
        COLLECTIONS
      </span>
    </span>
  </button>

  {/* TRADES */}
  <button
    onClick={() => {
      setShowMobileProgressMenu(false);
      setShowMobileIsoMenu(false);
      setShowMobileLeaderboardMenu(false);
      setShowMobileHomeMenu(false);
      requestNavigation("/trading-post");
    }}
    className={`
      relative
      z-10
      flex
      h-full
      items-center
      justify-center
      px-3
      text-[#E7C84B]
      transition-all
      duration-300
      ${
        mobileNavCollapsed
          ? "hidden"
          : "opacity-100 scale-100"
      }
    `}
  >
    <span className="flex flex-col items-center justify-center gap-0.5">
      <ArrowLeftRight className="h-5 w-5 drop-shadow-[0_0_6px_rgba(231,200,75,0.35)]" />

      <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#E7C84B]/80">
        TRADES
      </span>
    </span>
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
    className={`
      relative
      z-10
      flex
      h-full
      items-center
      justify-center
      px-3
      text-[#E7C84B]
      transition-all
      duration-300
      ${
        mobileNavCollapsed
          ? "hidden"
          : "opacity-100 scale-100"
      }
    `}
  >
    <span className="flex flex-col items-center justify-center gap-0.5">
      <Users className="h-5 w-5 drop-shadow-[0_0_6px_rgba(231,200,75,0.35)]" />

      <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#E7C84B]/80">
        EXPLORE
      </span>
    </span>
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
    className={`
      relative
      z-10
      flex
      h-full
      items-center
      justify-center
      px-3
      text-[#E7C84B]
      transition-all
      duration-300
      ${
        mobileNavCollapsed
          ? "hidden"
          : "opacity-100 scale-100"
      }
    `}
  >
    <span className="flex flex-col items-center justify-center gap-0.5">
      <User className="h-5 w-5 drop-shadow-[0_0_6px_rgba(231,200,75,0.35)]" />

      <span className="font-mono text-[6px] font-bold uppercase tracking-[0.16em] text-[#E7C84B]/80">
        PROFILE
      </span>
    </span>
  </button>
</div>
</>
);
};



export default KayouHeader;