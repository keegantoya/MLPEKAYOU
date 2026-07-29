import {
  ShoppingBag, 
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
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [showTradesMenu, setShowTradesMenu] = useState(false);
  const [showIsoMenu, setShowIsoMenu] = useState(false);
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);
const [showProgressMenu, setShowProgressMenu] = useState(false);
const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
const [pendingMessages, setPendingMessages] = useState(0);

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

const loadPendingFriendRequests = async (userId: string) => {
  const { count: friendCount } = await supabase
    .from("friend_requests")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("receiver_id", userId)
    .eq("status", "pending");

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("receiver", userId)
    .is("read_at", null);

  setPendingFriendRequests(friendCount ?? 0);
  setPendingMessages(messageCount ?? 0);
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
    getProfile(currentUser.id);
    loadPendingFriendRequests(currentUser.id);
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
  loadPendingFriendRequests(currentUser.id);
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
useEffect(() => {
  let channel: any;

  const setup = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const userId = session.user.id;

    await loadPendingFriendRequests(userId);

    channel = supabase
      .channel(`header-badges-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async () => {
          await loadPendingFriendRequests(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
        },
        async () => {
          await loadPendingFriendRequests(userId);
        }
      )
      .subscribe();
  };

  setup();

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);

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

  const isActive = (path: string) => {
  if (path === "/") {
    return location.pathname === "/";
  }

  return location.pathname.startsWith(path);
};

return (
  <>

<header
  className={`fixed left-0 right-0 z-[20000] text-[#E7C84B] shadow-md ${
    !window.matchMedia('(display-mode: standalone)').matches
      ? 'top-0'
      : 'top-0'
  }`}
style={{
  background: "#161616",
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
  className="
hidden sm:flex
h-10 px-5
rounded-xl
bg-[#202020]
hover:bg-[#2a2a2a]
text-[#E7C84B]
border border-[#E7C84B]
font-semibold
shadow-md
transition-all
duration-200
hover:-translate-y-0.5
hover:shadow-lg
"
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
className="
flex
items-center
justify-center
h-8
px-4
text-sm
rounded-lg
font-semibold
text-[#1b1b1b]
bg-gradient-to-b
from-[#f6d76c]
to-[#c99f30]
border
border-[#f3e19a]
shadow-md
transition-all
duration-200
active:scale-95
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
  ) : (
    <>
      <button
        onClick={() => navigate("/leaderboard")}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          border border-[#E7C84B]
          bg-[#202020]
          text-[#E7C84B]
          shadow-md
          transition-all
          hover:bg-[#2a2a2a]
        "
      >
        <Trophy className="h-4 w-4" />
      </button>

      <button
        onClick={() => navigate("/community")}
        className="
          flex items-center justify-center
          w-8 h-8 rounded-full
          border border-[#E7C84B]
          bg-[#202020]
          text-[#E7C84B]
          shadow-md
          transition-all
          hover:bg-[#2a2a2a]
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
          src={avatarSrc || profileAvatar}
          alt="avatar"
         className={`h-10 w-10 rounded-full object-cover border-2 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-[#d4af37]/60 ${
  open
    ? "scale-110 shadow-xl border-[#d4af37]/60"
    : "border-[#E7C84B]/30"
}`}
        />
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
{/* Menu Items */}
<div className="py-2 px-3 space-y-4">

  {/* ACCOUNT */}
  <div className="space-y-2">
    <button
      onClick={() => {
        navigate("/desktop-profile");
        setOpen(false);
      }}
      className="w-full px-3 py-2 rounded-xl text-sm bg-[#202020] hover:bg-[#2a2a2a] border border-[#E7C84B] text-left"
    >
      Edit Profile
    </button>

    <button
      onClick={() => {
        navigate("/kayou-news");
        setOpen(false);
      }}
      className="w-full px-3 py-2 rounded-xl text-sm bg-[#202020] hover:bg-[#2a2a2a] border border-[#E7C84B] text-left"
    >
      Kayou US Events
    </button>

    <button
      onClick={() => {
        navigate("/inbox");
        setOpen(false);
      }}
      className="w-full px-3 py-2 rounded-xl text-sm bg-[#202020] hover:bg-[#2a2a2a] border border-[#E7C84B] text-left"
    >
      Inbox & Friends
    </button>
  </div>

  {/* PROGRESS */}
  <div>
    <div className="text-[11px] uppercase tracking-[0.2em] text-[#8e7a2d] mb-2 px-1">
      Progress
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => {
          navigate("/my-progress");
          setOpen(false);
        }}
        className="
w-full
px-3
py-2
rounded-xl
text-sm
text-left
bg-[#202020]
border
border-[#E7C84B]

!transition-all
!duration-200

hover:!bg-[#353535]
hover:!border-[#FFD54A]
hover:!text-white
hover:!scale-[1.02]
hover:!shadow-xl

active:scale-[0.99]
"
      >
        CCG
      </button>

      <button
        onClick={() => {
          navigate("/progress-tcg");
          setOpen(false);
        }}
        className="
w-full
px-3
py-2
rounded-xl
text-sm
text-left
bg-[#202020]
border
border-[#E7C84B]

!transition-all
!duration-200

hover:!bg-[#353535]
hover:!border-[#FFD54A]
hover:!text-white
hover:!scale-[1.02]
hover:!shadow-xl

active:scale-[0.99]
"
      >
        TCG
      </button>
    </div>
  </div>

  {/* COLLECTION */}
  <div>
    <div className="text-[11px] uppercase tracking-[0.2em] text-[#8e7a2d] mb-2 px-1">
      Collection
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => {
          navigate("/inventory");
          setOpen(false);
        }}
        className="
w-full
px-3
py-2
rounded-xl
text-sm
text-left
bg-[#202020]
border
border-[#E7C84B]

!transition-all
!duration-200

hover:!bg-[#353535]
hover:!border-[#FFD54A]
hover:!text-white
hover:!scale-[1.02]
hover:!shadow-xl

active:scale-[0.99]
"
      >
        Inventory
      </button>

      <button
        onClick={() => {
          navigate("/binders");
          setOpen(false);
        }}
        className="
w-full
px-3
py-2
rounded-xl
text-sm
text-left
bg-[#202020]
border
border-[#E7C84B]

!transition-all
!duration-200

hover:!bg-[#353535]
hover:!border-[#FFD54A]
hover:!text-white
hover:!scale-[1.02]
hover:!shadow-xl

active:scale-[0.99]
"
      >
        Binders
      </button>
    </div>
  </div>

  {/* TRADING */}
  <div>
   <div className="grid grid-cols-1 gap-2">
  <button
    onClick={() => {
      navigate("/iso");
      setOpen(false);
    }}
    className="
w-full
px-3
py-2
rounded-xl
text-sm
text-left
bg-[#202020]
border
border-[#E7C84B]

!transition-all
!duration-200

hover:!bg-[#353535]
hover:!border-[#FFD54A]
hover:!text-white
hover:!scale-[1.02]
hover:!shadow-xl

active:scale-[0.99]
"
  >
    ISO and Wishlist
  </button>
</div>
  </div>
<div className="mx-4 my-4 border-t border-zinc-700" />

{/* Logout */}
<button
  onClick={() => {
    handleLogout();
    setOpen(false);
  }}
  className="w-[calc(100%-2rem)] ml-4 text-left px-4 py-2.5 rounded-2xl bg-[#202020] hover:bg-[#2a2a2a] border border-[#E7C84B] text-[#E7C84B] transition-all"
>
  Logout
</button>
</div>

{/* Social Links */}
<div className="pt-2">
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
<div className="relative group">
  <button
    onClick={() => navigate("/support-mlpekayou")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/support-mlpekayou") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <ShoppingBag  className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 whitespace-nowrap">
    Shop
  </div>
</div>

  <div className="relative group">
  <button
    onClick={() => requireLogin("/explore")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/explore") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Users className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    Explore
  </div>
</div>

<div className="relative group">
  <button
    onClick={() => navigate("/collections")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/collections") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Sparkles className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    Checklists
  </div>
</div>

<div className="relative group">
  <button
    onClick={() => navigate("/leaderboard")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/leaderboard") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Medal className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    Leaderboard
  </div>
</div>

  {/* LOGO */}
  <img
  src={logo}
  alt="MLP Kayou Wiki"
  className="h-[46px] cursor-pointer"
  onClick={() => navigate("/")}
/>

  {/* RIGHT OF LOGO */}
<div className="relative group">
  <button
    onClick={() => navigate("/community")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/community") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Trophy className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    First Finishers
  </div>
</div>

<div className="relative group">
  <button
    onClick={() => requireLogin("/trading-post")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/trading-post") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <ArrowLeftRight className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    Trading Post
  </div>
</div>

<div className="relative group">
  <button
    onClick={() => navigate("/selling")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/selling") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Tag className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    Selling
  </div>
</div>

<div className="relative group">
  <button
    onClick={() => navigate("/faq")}
className={`
flex-shrink-0
w-10 h-10
min-w-10 min-h-10
rounded-full
border
flex
items-center
justify-center
text-[#E7C84B]
transition-all
duration-200

bg-[#202020]
hover:bg-[#2a2a2a]
hover:-translate-y-1
hover:scale-110
hover:shadow-xl

${isActive("/faq") ? "border-[#E7C84B] shadow-md scale-105" : "border-[#E7C84B]"}
`}
  >
    <Search className="h-5 w-5" />
  </button>

  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252525] px-2 py-1 text-xs text-[#E7C84B] shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
    FAQ
  </div>
</div>
</div>

{/* RIGHT SIDE */}
<div className="hidden sm:flex items-center gap-3 min-w-[40px]">
  {!user && (
<Button
className="
flex
items-center
justify-center
h-11
px-8
rounded-xl
font-bold
text-[#1b1b1b]
bg-gradient-to-b
from-[#f6d76c]
to-[#c99f30]
border
border-[#f3e19a]
shadow-lg
transition-all
duration-200
hover:brightness-110
hover:scale-[1.02]
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
border border-[#E7C84B]
bg-[#202020]
text-[#E7C84B]
shadow-md
transition-all
hover:bg-[#2a2a2a]
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
border border-[#E7C84B]
bg-[#202020]
text-[#E7C84B]
shadow-md
transition-all
hover:bg-[#2a2a2a]
"
  >
    ?
  </button>
</div>
</header>

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
`}
</style>

{/* SIGNUP SUCCESS POPUP */}
{showSignupSuccess && (
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
          className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#E7C84B] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
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

{showLoginRequired && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

    <div className="relative w-[92%] max-w-lg bg-white rounded-2xl shadow-2xl p-6">

      <div className="text-center">
        <div className="text-xl font-semibold mb-3 text-[#E7C84B]">
          Login Required
        </div>

        <div className="text-gray-600 mb-6">
          You cannot access this page without being signed in to an account.
        </div>

        <Button
          className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#E7C84B]"
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

<div
className="relative w-[92%] max-w-lg rounded-[28px] border flex flex-col p-8 pt-12 pb-8"
  style={{
    background: `
      linear-gradient(
        180deg,
        #444444 0%,
        #2f2f2f 55%,
        #1a1a1a 100%
      )
    `,
    borderColor: "#8b8b8b",
    boxShadow: `
      0 24px 80px rgba(0,0,0,.75),
      inset 0 1px 0 rgba(255,255,255,.08),
      0 0 0 1px rgba(255,255,255,.04)
    `,
  }}
>

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

          <div className="text-center mb-7 text-white">
  <div
  className="text-3xl font-bold mb-2 tracking-wide"
  style={{
    color: "#ffffff",
    textShadow: "0 2px 12px rgba(0,0,0,.45)",
  }}
>
    {authMode === "login"
      ? "Sign In"
      : "Create Your Account"}
  </div>

 <div className="text-sm text-[#c7c7c7] mb-6">
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
  className="
w-full
rounded-xl
border
border-[#6c6c6c]
bg-[#242424]
text-white
placeholder:text-[#8d8d8d]
px-4
py-3
mb-3
transition-all
duration-200
focus:border-[#d8b64d]
focus:ring-2
focus:ring-[#d8b64d]/25
outline-none
"
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
  className="
w-full
rounded-xl
border
border-[#6c6c6c]
bg-[#242424]
text-white
placeholder:text-[#8d8d8d]
px-4
py-3
mb-3
transition-all
duration-200
focus:border-[#d8b64d]
focus:ring-2
focus:ring-[#d8b64d]/25
outline-none
"
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
      className="
w-full
rounded-xl
border
border-[#6c6c6c]
bg-[#242424]
text-white
placeholder:text-[#8d8d8d]
px-4
py-3
mb-3
transition-all
duration-200
focus:border-[#d8b64d]
focus:ring-2
focus:ring-[#d8b64d]/25
outline-none
"
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
    className="text-sm text-[#d8b64d] hover:text-[#f2d36d] mb-5 transition-colors"
  >
    Forgot your password? Request a reset here. 
  </button>
)}

<div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">

  {/* MOBILE CREATE ACCOUNT */}
  <div className="sm:hidden w-full flex justify-center">
    {authMode === "login" && (
<Button
  className="h-9 px-4 rounded-xl bg-[#2b2b2b] border border-[#666] text-white hover:bg-[#353535] transition-all"
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
  className="text-[#d8b64d] hover:text-[#f2d36d] hover:bg-transparent"
        onClick={() => {
          setAuthMode("login");
          setLoginError("");
        }}
      >
        Back to Login
      </Button>
    )}
  </div>

  <div className="flex flex-1 justify-end gap-2 sm:ml-auto">

<Button
  variant="ghost"
  className="text-white hover:bg-[#2d2d2d]"
  onClick={() => setShowLogin(false)}
>
      Cancel
    </Button>

    <Button
    type="submit"
className="
flex
items-center
justify-center
h-11
px-8
rounded-xl
font-bold
text-[#1b1b1b]
bg-gradient-to-b
from-[#f6d76c]
to-[#c99f30]
border
border-[#f3e19a]
shadow-lg
transition-all
duration-200
hover:brightness-110
hover:scale-[1.02]
"
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
text-[#e3dc5e] 
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
relative z-10 flex items-center justify-center h-full px-3 text-[#e3dc5e] 
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
relative z-10 flex items-center justify-center h-full px-3 text-[#e3dc5e] 
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
relative z-10 flex items-center justify-center h-full px-3 text-[#e3dc5e] 
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

    navigate("/mobile-profile");
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