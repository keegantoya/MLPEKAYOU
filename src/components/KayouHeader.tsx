import {
  Home,
    Ghost,
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

import verifiedBadge from "/website-assets/goldenverifiedbadge.webp";
import blueVerifiedBadge from "/website-assets/blueverifiedbadge.webp";

const logo = "/website-assets/mlpekayouwikinmn.webp";

import avatar001 from "@/assets/avatars/avatar001.webp";
import avatar002 from "@/assets/avatars/avatar002.webp";
import avatar003 from "@/assets/avatars/avatar003.webp";
import avatar004 from "@/assets/avatars/avatar004.webp";
import avatar005 from "@/assets/avatars/avatar005.webp";
import avatar006 from "@/assets/avatars/avatar006.webp";
import avatar007 from "@/assets/avatars/avatar007.webp";
import avatar008 from "@/assets/avatars/avatar008.webp";
import avatar009 from "@/assets/avatars/avatar009.webp";
import avatar010 from "@/assets/avatars/avatar010.webp";
import avatar011 from "@/assets/avatars/avatar011.webp";
import avatar012 from "@/assets/avatars/avatar012.webp";
import avatar013 from "@/assets/avatars/avatar013.webp";
import avatar014 from "@/assets/avatars/avatar014.webp";
import avatar015 from "@/assets/avatars/avatar015.webp";
import avatar016 from "@/assets/avatars/avatar016.webp";
import avatar017 from "@/assets/avatars/avatar017.webp";
import avatar018 from "@/assets/avatars/avatar018.webp";
import avatar019 from "@/assets/avatars/avatar019.webp";
import avatar020 from "@/assets/avatars/avatar020.webp";
import avatar021 from "@/assets/avatars/avatar021.webp";
import avatar022 from "@/assets/avatars/avatar022.webp";
import avatar023 from "@/assets/avatars/avatar023.webp";
import avatar024 from "@/assets/avatars/avatar024.webp";
import avatar025 from "@/assets/avatars/avatar025.webp";
import avatar026 from "@/assets/avatars/avatar026.webp";
import avatar027 from "@/assets/avatars/avatar027.webp";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.webp";
import KeeganAvatar from "@/assets/avatars/keeganpfp.webp";
import KeeganAvatar2 from "@/assets/avatars/keeganpfpnmn.webp";
import TerriAvatar from "@/assets/avatars/terrypfp.webp";
import maipfp from "@/assets/avatars/maipfp.webp";
import elementOfLaughter from "/website-assets/elementoflaughter.webp";

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

const avatarMap: Record<string, string> = {
  "avatar001.webp": avatar001,
  "avatar002.webp": avatar002,
  "avatar003.webp": avatar003,
  "avatar004.webp": avatar004,
  "avatar005.webp": avatar005,
  "avatar006.webp": avatar006,
  "avatar007.webp": avatar007,
  "avatar008.webp": avatar008,
  "avatar009.webp": avatar009,
  "avatar010.webp": avatar010,
  "avatar011.webp": avatar011,
  "avatar012.webp": avatar012,
  "avatar013.webp": avatar013,
  "avatar014.webp": avatar014,
  "avatar015.webp": avatar015,
  "avatar016.webp": avatar016,
  "avatar017.webp": avatar017,
  "avatar018.webp": avatar018,
  "avatar019.webp": avatar019,
  "avatar020.webp": avatar020,
  "avatar021.webp": avatar021,
  "avatar022.webp": avatar022,
  "avatar023.webp": avatar023,
  "avatar024.webp": avatar024,
  "avatar025.webp": avatar025,
  "avatar026.webp": avatar026,
  "avatar027.webp": avatar027,
  "keeganpfp.webp": KeeganAvatar,
  "keeganpfpnmn.webp": KeeganAvatar2,
  "maipfp.webp": maipfp,
  "terrypfp.webp": TerriAvatar,
  "heimantouavatar.webp": heimantouAvatar,
};

const VERIFIED_USERS = {
  "17e57e39-bc0c-44e7-b373-ac34c6690185": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "94a1c998-d040-4dd2-b2fb-5f606287139d": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "6247b70d-3f55-493c-8eee-3badedf581db": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "408a516c-ee80-4ff8-a869-493e1fd5d961": {
    badge: verifiedBadge,
    label: "MLPEKAYOU STAFF",
  },
  "2692c7a3-bce3-45b7-8636-5e18bf39edc3": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
    "2e62bcda-f311-42a1-bf32-cfe74a43d3ef": {
    badge: blueVerifiedBadge,
    label: "KAYOU STAFF",
  },
    "325585dd-c617-4dd2-8314-d608273cd5f6": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
  "22f7a392-b5b5-4aec-a3b3-6546071593fd": {
    badge: elementOfLaughter,
    label: "ELEMENT OF LAUGHTER",
  },
};

const getAvatar = (avatar?: string, username?: string) => {
  // HEIMANTOU SPECIALTY
  if (username === "HeiManTou") {
    return heimantouAvatar;
  }

  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";
  if (!file.includes(".")) file = `${file}.webp`;

  return avatarMap[file] || avatar001;
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
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showTradesMenu, setShowTradesMenu] = useState(false);
  const [showIsoMenu, setShowIsoMenu] = useState(false);
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);
const [showProgressMenu, setShowProgressMenu] = useState(false);

const [showSpider, setShowSpider] = useState(true);
const [spiderLeaving, setSpiderLeaving] = useState(false);

const menuRef = useRef<HTMLDivElement>(null);

const verification =
  profile?.id ? VERIFIED_USERS[profile.id] : null;

  const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data?.avatar_url) {
  const avatar = getAvatar(data.avatar_url, data.username);

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
      const avatar = getAvatar(
        updates.avatar_url,
        updates.username || profile?.username
      );

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
    getProfile(currentUser.id);
  }
};

    getSession();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  const currentUser = session?.user ?? null;

  setUser(currentUser);

  if (currentUser && !profile) {
  getProfile(currentUser.id);
} else {
  
  }
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

  const avatar = getAvatar(profile.avatar_url);

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

useEffect(() => {
  if (sessionStorage.getItem("spiderDismissed")) {
    setShowSpider(false);
  }
}, []);

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

const requireLogin = (path: string) => {
  if (!user) {
    setShowLoginRequired(true);
    return;
  }

  navigate(path);
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const dismissSpider = () => {
  setSpiderLeaving(true);

  setTimeout(() => {
    sessionStorage.setItem("spiderDismissed", "true");
    setShowSpider(false);
  }, 1200);
};

  const isActive = (path: string) => {
  if (path === "/") {
    return location.pathname === "/";
  }

  return location.pathname.startsWith(path);
};

return (
  <>
{showSpider && (
  <button
    onClick={dismissSpider}
    className={`fixed left-1/2 z-[19999] bg-transparent border-0 p-0 cursor-pointer ${
      spiderLeaving ? "spider-up" : "spider-down"
    }`}
    aria-label="Spider"
  >
    <div className={spiderLeaving ? "" : "spider-sway"}>
      <div className="spider-web" />

      <img
        src="/website-assets/nmnspidernoweb.webp"
        alt="Spider"
        className="w-20 sm:w-24 h-auto select-none pointer-events-none"
      />
    </div>
  </button>
)}

<header
  className={`fixed left-0 right-0 z-[20000] text-[#f5e6a8] shadow-md ${
    !window.matchMedia('(display-mode: standalone)').matches
      ? 'top-0'
      : 'top-0'
  }`}
style={{
  background: "#ece8f1",
  WebkitTransform: "translateZ(0)",
  transform: "translateZ(0)",
}}
>
  
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
  className="hidden sm:flex h-10 px-5 bg-[#f4a261] hover:bg-[#ee964b] text-white border border-[#e48c3f] font-semibold shadow-sm"
      onClick={() => {
        setAuthMode("signup");
        setLoginError("");
        setShowForgot(false);
        setShowLogin(true);
      }}
    >
      Create Account
    </Button>
  )}

{/* MOBILE PROFILE / LOGIN */}
<div
  className="sm:hidden flex items-center gap-2"
  style={{
    marginTop: "-7px"
  }}
>
  {!user ? (
    <Button
      size="sm"
      className="h-8 px-3 text-xs bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110"
      onClick={() => {
        setAuthMode("login");
        setShowLogin(true);
      }}
    >
      Login
    </Button>
  ) : (
    <>
      <button
        onClick={() => navigate("/leaderboard")}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          border border-white
          bg-[#cbc5d4]
          text-white
          shadow-md
          transition-all
          hover:bg-[#c0b9cb]
        "
      >
        <Trophy className="h-4 w-4" />
      </button>

      <button
        onClick={() => navigate("/community")}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          border border-white
          bg-[#cbc5d4]
          text-white
          shadow-md
          transition-all
          hover:bg-[#c0b9cb]
        "
      >
        <Medal className="h-4 w-4" />
      </button>
    </>
  )}
</div>

{/* DESKTOP DISCORD BUTTON */}

 {user && (
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <button className="hidden sm:inline-flex items-center justify-center">
        <img
          src={avatarSrc || avatar001}
          alt="avatar"
         className={`h-10 w-10 rounded-full object-cover border-2 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-[#d4af37]/60 ${
  open
    ? "scale-110 shadow-xl border-[#d4af37]/60"
    : "border-white/30"
}`}
        />
      </button>
    </SheetTrigger>

<SheetContent
  side="left"
  className="top-16 h-[calc(100vh-64px)] w-[260px] bg-[#ece8f1] border-r border-white text-[#5a3e84] [&>button]:hidden p-0"
>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col items-center pt-5 pb-3">
          <img
            src={avatarSrc || avatar001}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg"
          />

          <div className="mt-2 flex items-center justify-center gap-2">
  <div className="text-xl font-semibold text-[#5a3e84]">
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
        <div className="py-3 space-y-1.5">
          <button
            onClick={() => {
              navigate("/UserMenu");
              setOpen(false);
            }}
            className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
          >
            Edit My Profile
          </button>

          <button
            onClick={() => {
              navigate("/my-progress");
              setOpen(false);
            }}
            className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
          >
            My CCG Progress
          </button>

          <button
            onClick={() => {
              navigate("/progress-tcg");
              setOpen(false);
            }}
            className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
          >
            My TCG Progress
          </button>

          <button
            onClick={() => {
              navigate("/inventory");
              setOpen(false);
            }}
            className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
          >
            My Inventory
          </button>

          <button
  onClick={() => {
    navigate("/my-iso");
    setOpen(false);
  }}
  className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
>
  My ISO
</button>
<button
  onClick={() => {
    navigate("/wishlist");
    setOpen(false);
  }}
 className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
>
  My Wishlist
</button>
<button
  onClick={() => {
    navigate("/my-collection-binder");
    setOpen(false);
  }}
  className="w-[calc(100%-1.5rem)] ml-3 text-left px-3 py-2 rounded-xl text-sm bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] hover:border-[#d4af37]/30 transition-all"
>
  My Binders
</button>
        </div>
{/* Social Links */}
<div className="pt-2 border-t border-white">
  <div className="flex items-center justify-center gap-3 py-2">
    <button
      onClick={() => window.open("https://discord.gg/fb7cHz4kdD", "_blank")}
      className="opacity-90 hover:opacity-100 transition-opacity"
    >
      <img
        src="/website-assets/discordlogo.webp"
        alt="Discord"
        className="h-8 w-auto"
      />
    </button>

    <button
      onClick={() => window.open("https://www.tiktok.com/@keanaex", "_blank")}
      className="opacity-90 hover:opacity-100 transition-opacity"
    >
      <img
        src="/website-assets/tiktoklogo.webp"
        alt="TikTok"
        className="h-10 w-auto"
      />
    </button>
  </div>

  {/* Logout */}
  <button
    onClick={() => {
      handleLogout();
      setOpen(false);
    }}
    className="w-[calc(100%-2rem)] ml-4 text-left px-4 py-3 rounded-2xl bg-[#cbc5d4] hover:bg-[#c0b9cb] border border-white text-[#5a3e84] transition-all"
  >
    Logout
  </button>
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
  onClick={() => navigate("/")}
/>

{/* CENTER LOGO + DESKTOP ICON NAV */}
<div
  className="absolute hidden sm:flex items-center gap-4 -translate-x-1/2"
  style={{
    left: user ? "calc(50% - 40px)" : "50%",
  }}
>
  {/* LEFT OF LOGO */}
  <button
    onClick={() => navigate("/")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Ghost className="h-5 w-5" />
  </button>

  <button
    onClick={() => requireLogin("/explore")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Users className="h-5 w-5" />
  </button>

  <button
    onClick={() => navigate("/collections")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Sparkles className="h-5 w-5" />
  </button>

    <button
  onClick={() => navigate("/leaderboard")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  title="Top Collectors"
>
  <Medal className="h-5 w-5" />
</button>

  {/* LOGO */}
  <img
  src={logo}
  alt="MLP Kayou Wiki"
  className="h-[46px] cursor-pointer"
  onClick={() => navigate("/")}
/>

  {/* RIGHT OF LOGO */}
  <button
    onClick={() => navigate("/community")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Trophy className="h-5 w-5" />
  </button>

    <button
    onClick={() => requireLogin("/trading-post")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <ArrowLeftRight className="h-5 w-5" />
  </button>

  <button
    onClick={() => navigate("/selling")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Tag className="h-5 w-5" />
  </button>

  <button
    onClick={() => navigate("/faq")}
className={`flex-shrink-0 w-10 h-10 min-w-10 min-h-10 rounded-full border flex items-center justify-center text-white transition-all ${
isActive("/")
  ? "bg-[#cbc5d4] border-white shadow-md scale-105"
  : "bg-[#cbc5d4] border-white hover:bg-[#c0b9cb]"
}`}
  >
    <Search className="h-5 w-5" />
  </button>
</div>

{/* RIGHT SIDE */}
<div className="hidden sm:flex items-center gap-3 min-w-[40px]">
  {!user && (
    <Button
      className="
        flex items-center justify-center
        h-10 px-5
        rounded-xl
        border border-[#e48c3f]
        bg-[#f4a261]
        text-white
        font-semibold
        shadow-sm
        transition-all
        hover:bg-[#ee964b]
      "
      onClick={() => {
        setAuthMode("login");
        setLoginError("");
        setShowForgot(false);
        setShowLogin(true);
      }}
    >
      Login
    </Button>
  )}
</div>

  </div>

  

{/* MOBILE FAQ + SELLING BUTTONS */}
<div className="sm:hidden absolute right-3 bottom-2 flex items-center gap-2">
  <button
    onClick={() => navigate("/selling")}
    className="
flex items-center justify-center
w-8 h-8
rounded-full
border border-white
bg-[#cbc5d4]
text-white
shadow-md
transition-all
hover:bg-[#c0b9cb]
"
  >
    $
  </button>

  <button
    onClick={() => navigate("/faq")}
    className="
flex items-center justify-center
w-8 h-8
rounded-full
border border-white
bg-[#cbc5d4]
text-white
shadow-md
transition-all
hover:bg-[#c0b9cb]
"
  >
    ?
  </button>
</div>
</header>

{showMobilePrompt && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

{/* Pink Glitter Around Popup */}
<div className="pointer-events-none absolute inset-0">

  {[...Array(20)].map((_, i) => (
    <span key={i} className={`glitter glitter-${i}`} />
  ))}

</div>

    <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-6 flex flex-col ">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <img
    src={logo}
    className="w-[600px] sm:w-[700px] md:w-[800px] h-auto object-contain drop-shadow-2xl"
  />
</div>

     <div className="text-center mb-6 text-gray-700">
  
  <div className="text-lg font-semibold mb-2 text-red-500 text-center">
    MLPEKAYOU UPDATE NOTICE
  </div>

  <div className="text-sm text-gray-700 mb-4">
    The mobile version of this website has recieved a large update that may not longer be visually compatible with browsers.
  </div>

<div className="text-sm text-gray-500 mb-3">
  iPhone users: In the bottom right corner on Safari, hit "...", click "Share", "View More", and "Add to homescreen."
</div>

<div className="text-sm text-gray-500">
  All other mobile devices: Find "..." in the top right corner, and select "Add to Home Screen."
</div>

</div>

      <div className="flex-1 flex items-center justify-center gap-3">
      </div>

<div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
  <Button
    className="bg-pink-100 hover:bg-pink-200 text-neutral-700 rounded-xl px-6 shadow-md border border-pink-200"
    onClick={() => {
  localStorage.setItem("seenAnnouncement", "true");
  setShowMobilePrompt(false);
}}
  >
    Understood.
  </Button>
</div>

</div>

  </div>
)}

<style>
{`
.spider-down {
  top: 52px;
  transform: translateX(-50%);
  animation: spiderDrop 2.5s ease-out forwards;
}

.spider-up {
  top: 52px;
  transform: translateX(-50%);
  animation: spiderRise 1.2s ease-in forwards;
}

@media (min-width: 640px) {
  .spider-down,
  .spider-up {
    top: 64px;
  }
}

.spider-web {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  top: -140px;
  height: 180px;

  width: 2px;

  background: rgba(255,255,255,0.95);

  z-index: -1;
  pointer-events: none;
}

.spider-sway {
  animation: spiderSway 3s ease-in-out infinite;
  transform-origin: center 12px;
}

@keyframes spiderDrop {
  from {
    transform: translateX(-50%) translateY(-120px);
  }

  to {
    transform: translateX(-50%) translateY(35px);
  }
}

@keyframes spiderRise {
  from {
    transform: translateX(-50%) translateY(35px);
  }

  to {
    transform: translateX(-50%) translateY(-120px);
  }
}

@media (max-width: 639px) {
  @keyframes spiderDrop {
    from {
      transform: translateX(-50%) translateY(-120px);
    }

    to {
  transform: translateX(-50%) translateY(40px);
}
  }

  @keyframes spiderRise {
    from {
  transform: translateX(-50%) translateY(40px);
}

    to {
      transform: translateX(-50%) translateY(-120px);
    }
  }
}

@keyframes spiderSway {
  0% {
    transform: rotate(-6deg);
  }

  50% {
    transform: rotate(6deg);
  }

  100% {
    transform: rotate(-6deg);
  }
}

.glitter {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f9a8d4;
  border-radius: 50%;
  opacity: 0.9;
  animation: sparkle 3s infinite ease-in-out;
  box-shadow: 
    0 0 6px #f9a8d4,
    0 0 12px #f9a8d4,
    0 0 18px #fbcfe8;
}

.glitter:nth-child(odd) {
  width: 5px;
  height: 5px;
}

.glitter:nth-child(even) {
  width: 9px;
  height: 9px;
}

.glitter-0 { top: 10%; left: 20%; }
.glitter-1 { top: 20%; right: 15%; }
.glitter-2 { bottom: 15%; left: 30%; }
.glitter-3 { bottom: 20%; right: 20%; }
.glitter-4 { top: 50%; left: 10%; }
.glitter-5 { top: 60%; right: 10%; }
.glitter-6 { top: 30%; left: 50%; }
.glitter-7 { bottom: 40%; right: 40%; }
.glitter-8 { top: 15%; left: 70%; }
.glitter-9 { bottom: 10%; left: 60%; }
.glitter-10 { top: 35%; right: 25%; }
.glitter-11 { bottom: 25%; left: 15%; }
.glitter-12 { top: 65%; right: 35%; }
.glitter-13 { top: 45%; left: 75%; }
.glitter-14 { bottom: 35%; right: 10%; }
.glitter-15 { top: 5%; left: 45%; }
.glitter-16 { bottom: 5%; right: 50%; }
.glitter-17 { top: 55%; left: 35%; }
.glitter-18 { bottom: 45%; left: 55%; }
.glitter-19 { top: 25%; right: 5%; }

@keyframes sparkle {
  0% { opacity: 0; transform: scale(0.5) translateY(0px); }
  50% { opacity: 1; transform: scale(1.2) translateY(-6px); }
  100% { opacity: 0; transform: scale(0.5) translateY(0px); }
}
`}
</style>

{/* SIGNUP SUCCESS POPUP */}
{showSignupSuccess && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

    {/* Glitter */}
    <div className="pointer-events-none absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <span key={i} className={`glitter glitter-${i}`} />
      ))}
    </div>

    <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-6 flex flex-col ">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <img
    src={logo}
    className="w-[600px] sm:w-[700px] md:w-[800px] h-auto object-contain drop-shadow-2xl"
  />
</div>

      <div className="text-center mb-6 text-gray-700">

        <div className="text-lg font-semibold mb-2">
          Account Created!
        </div>

        <div className="text-sm text-gray-500 mb-4">
          We've assigned you a username:
        </div>

        <div className="font-bold text-pink-500 text-lg mb-4">
          {newUsername}
        </div>

        <div className="text-sm text-gray-500">
          A confirmation email has been sent.  
          Please check your email to activate your account.
        </div>

      </div>

      <div className="flex justify-center">
        <Button
          className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
          onClick={() => setShowSignupSuccess(false)}
        >
          Got it!
        </Button>
      </div>

    </div>
  </div>
)}

{/* RESET SENT POPUP */}
{showResetSent && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

    {/* Glitter */}
    <div className="pointer-events-none absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <span key={i} className={`glitter glitter-${i}`} />
      ))}
    </div>

    <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-6 flex flex-col ">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <img
    src={logo}
    className="w-[600px] sm:w-[700px] md:w-[800px] h-auto object-contain drop-shadow-2xl"
  />
</div>

      <div className="text-center mb-6 text-gray-700">

        <div className="text-lg font-semibold mb-2">
          Password Reset Sent
        </div>

        <div className="text-sm text-gray-500">
          If an email exists for this account, you will find
          a password reset link in your junk mail. Please recheck
          the email you entered if you don't find it. The most common
          error is an invalid email entered at login.
        </div>

      </div>

      <div className="flex justify-center">
        <Button
          className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
          onClick={() => setShowResetSent(false)}
        >
          Got it
        </Button>
      </div>

    </div>
  </div>
)}

{showLoginRequired && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

    <div className="relative w-[92%] max-w-lg bg-white rounded-2xl shadow-2xl p-6">

      <div className="text-center">
        <div className="text-xl font-semibold mb-3 text-[#5a3e84]">
          Login Required
        </div>

        <div className="text-gray-600 mb-6">
          You cannot access this page without being signed in to an account.
        </div>

        <Button
          className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8]"
          onClick={() => setShowLoginRequired(false)}
        >
          Okay
        </Button>
      </div>

    </div>
  </div>
)}

      {/* LOGIN POPUP */}
      {showLogin && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

{/* Pink Glitter Around Popup */}
<div className="pointer-events-none absolute inset-0">

  {[...Array(20)].map((_, i) => (
    <span key={i} className={`glitter glitter-${i}`} />
  ))}

</div>

          <div className="relative w-[92%] max-w-2xl bg-white rounded-2xl shadow-2xl p-6 pt-6 pb-12 flex flex-col ">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <img
    src={logo}
    className="w-[600px] sm:w-[700px] md:w-[800px] h-auto object-contain drop-shadow-2xl"
  />
</div>

<form
  onSubmit={(e) => {
    e.preventDefault();

    authMode === "login"
      ? handleLoginSubmit()
      : handleSignupSubmit();
  }}
>

          <div className="text-center mb-5 text-gray-700">
  <div className="text-lg font-semibold mb-2">
    {authMode === "login"
      ? "Sign In"
      : "Create Your Account"}
  </div>

  <div className="text-sm text-gray-500 mb-4">
    {authMode === "login"
      ? "Enter your email and password."
      : "Enter your email and create a password."}
  </div>
</div>

<input
  type="email"
  placeholder="Email"
  value={loginEmail}
  autoComplete="email"
  className="w-full border rounded-lg px-3 py-2 mb-2"
  onChange={(e) => {
  setLoginEmail(e.target.value);
  setEmailError("");
  setLoginError("");
  setShowForgot(false);
}}
/>

{emailError && (
  <div className="text-sm text-red-500 mb-2">
    {emailError}
  </div>
)}

<input
  type="password"
  placeholder="Password"
  value={loginPassword}
  autoComplete="current-password"
  className="w-full border rounded-lg px-3 py-2 mb-2"
  onChange={(e) => {
  setLoginPassword(e.target.value);
  setLoginError("");
  setShowForgot(false);
}}
/>

{authMode === "signup" && (
  <>
    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      autoComplete="new-password"
      className="w-full border rounded-lg px-3 py-2 mb-2"
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <div className="text-xs text-gray-500 italic text-center mb-2">
      You will be required to confirm your signup via a link sent to your email.
    </div>
  </>
)}

{loginError && (
  <div className="text-sm text-red-500 mb-2">
    {loginError}
  </div>
)}

{showForgot && (
  <button
    onClick={handleForgotPassword}
    className="text-sm text-pink-500 hover:text-pink-600 mb-4"
  >
    Forgot your password? Request a reset here.
  </button>
)}

<div className="flex justify-between items-center gap-2">

  {/* MOBILE CREATE ACCOUNT */}
  <div className="sm:hidden">
    {authMode === "login" && (
<Button
  className="h-8 px-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white border border-pink-200/40 shadow-md hover:brightness-110"
        onClick={() => {
          setAuthMode("signup");
          setLoginError("");
        }}
      >
        Create Account
      </Button>
    )}

    {authMode === "signup" && (
<Button
  variant="ghost"
  className="text-pink-500 hover:text-pink-400 hover:bg-transparent"
        onClick={() => {
          setAuthMode("login");
          setLoginError("");
        }}
      >
        Back to Login
      </Button>
    )}
  </div>

  <div className="flex gap-2 ml-auto">

    <Button
      variant="ghost"
      onClick={() => setShowLogin(false)}
    >
      Cancel
    </Button>

    <Button
    type="submit"
      className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110 hover:bg-[#e8e8e0]"
    >
      Continue
    </Button>

  </div>

</div>
</form>
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
rounded-full
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

background: "rgba(255,255,255,0.03)",

backdropFilter: "blur(3px) saturate(90%) brightness(1.02)",
WebkitBackdropFilter: "blur(3px) saturate(90%) brightness(1.02)",

boxShadow: `
  inset 0 1px 0 rgba(255,255,255,0.35),
  inset 0 -1px 0 rgba(255,255,255,0.12),
  0 4px 16px rgba(0,0,0,0.08)
`,

transform: "translateX(-50%)",
WebkitTransform: "translateX(-50%)",

  willChange: "transform",

  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",

  contain: "paint",
}}
>

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
background: "rgba(255,255,255,0.06)",

boxShadow: `
  inset 0 1px 0 rgba(255,255,255,0.08),
  0 1px 3px rgba(0,0,0,0.02)
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
    ? "30px 14px 14px 30px"
    : location.pathname.startsWith("/collections")
    ? "18px"
    : location.pathname.startsWith("/trading-post")
    ? "18px"
    : location.pathname.startsWith("/explore")
    ? "18px"
    : "14px 30px 30px 14px",
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

  navigate("/");
}}
className={`
relative
z-50
flex
items-center
justify-center
text-[#d5d1d6] 
transition-all
duration-300
h-full
${
  mobileNavCollapsed
    ? "w-[68px]"
    : "px-3"
}
`}
  >
    <Ghost className="h-6 w-6" />
  </button>

  {/* COLLECTIONS */}
  <button
    onClick={() => {
      setShowMobileProgressMenu(false);
      setShowMobileIsoMenu(false);
      setShowMobileLeaderboardMenu(false);
      setShowMobileHomeMenu(false);
      navigate("/collections");
    }}
    className={`
relative z-10 flex items-center justify-center h-full px-3 text-[#d9d4da] 
transition-all duration-300
${
  mobileNavCollapsed
    ? "hidden"
    : "opacity-100 scale-100"
}
`}
  >
    <Sparkles className="h-6 w-6" />
  </button>

  {/* TRADES */}
  <button
    onClick={() => {
      setShowMobileProgressMenu(false);
      setShowMobileIsoMenu(false);
      setShowMobileLeaderboardMenu(false);
      setShowMobileHomeMenu(false);
      navigate("/trading-post");
    }}
    className={`
relative z-10 flex items-center justify-center h-full px-3 text-[#666467] 
${
mobileNavCollapsed
  ? "hidden"
  : "opacity-100 scale-100"
}
`}
  >
    <ArrowLeftRight className="h-6 w-6" />
  </button>

  {/* FORUM */}
  <button
    onClick={() => {
      setShowMobileProgressMenu(false);
      setShowMobileIsoMenu(false);
      setShowMobileLeaderboardMenu(false);
      setShowMobileHomeMenu(false);
      navigate("/explore");
    }}
    className={`
relative z-10 flex items-center justify-center h-full px-3 text-[#ee8ad5]   
transition-all duration-300
${
mobileNavCollapsed
  ? "hidden"
  : "opacity-100 scale-100"
}
`}
  >
    <Users className="h-6 w-6" />
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

    navigate("/profile-mobile");
  }}
  className={`
relative z-10
flex items-center justify-center
h-full px-3
text-[#e3dc5e]  
transition-all duration-300
${
mobileNavCollapsed
  ? "hidden"
  : "opacity-100 scale-100"
}
`}
>
  <User className="h-6 w-6" />
</button>
</div>
</>
);
};



export default KayouHeader;