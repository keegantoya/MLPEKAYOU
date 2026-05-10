import {
  Menu,
  Home,
  BarChart,
  Trophy,
  Medal,
  Tag,
  ArrowLeftRight,
  Users,
  List,
  Grid,
  Layers
} from "lucide-react";

import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRef } from "react";

import logo from "@/assets/avatars/mlpekayouwiki.png";

import avatar001 from "@/assets/avatars/avatar001.jpg";
import avatar002 from "@/assets/avatars/avatar002.jpg";
import avatar003 from "@/assets/avatars/avatar003.jpg";
import avatar004 from "@/assets/avatars/avatar004.jpg";
import avatar005 from "@/assets/avatars/avatar005.jpg";
import avatar006 from "@/assets/avatars/avatar006.jpg";
import avatar007 from "@/assets/avatars/avatar007.jpg";
import avatar008 from "@/assets/avatars/avatar008.jpg";
import avatar009 from "@/assets/avatars/avatar009.jpg";
import avatar010 from "@/assets/avatars/avatar010.jpg";
import avatar011 from "@/assets/avatars/avatar011.jpg";
import avatar012 from "@/assets/avatars/avatar012.jpg";
import avatar013 from "@/assets/avatars/avatar013.jpg";
import avatar014 from "@/assets/avatars/avatar014.jpg";
import avatar015 from "@/assets/avatars/avatar015.jpg";
import heimantouAvatar from "@/assets/avatars/heimantouavatar.png";

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
  "avatar001.jpg": avatar001,
  "avatar002.jpg": avatar002,
  "avatar003.jpg": avatar003,
  "avatar004.jpg": avatar004,
  "avatar005.jpg": avatar005,
  "avatar006.jpg": avatar006,
  "avatar007.jpg": avatar007,
  "avatar008.jpg": avatar008,
  "avatar009.jpg": avatar009,
  "avatar010.jpg": avatar010,
  "avatar011.jpg": avatar011,
  "avatar012.jpg": avatar012,
  "avatar013.jpg": avatar013,
  "avatar014.jpg": avatar014,
  "avatar015.jpg": avatar015,
};

const getAvatar = (avatar?: string, username?: string) => {
  // HEIMANTOU SPECIALTY
  if (username === "HeiManTou") {
    return heimantouAvatar;
  }

  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";
  if (!file.includes(".")) file = `${file}.jpg`;

  return avatarMap[file] || avatar001;
};

const KayouHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
 const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
  return sessionStorage.getItem("avatar");
});
const [showMobileLeaderboardMenu, setShowMobileLeaderboardMenu] = useState(false);
const [showMobileHomeMenu, setShowMobileHomeMenu] = useState(false);
const [showMobileProgressMenu, setShowMobileProgressMenu] = useState(false);
const [showMobileIsoMenu, setShowMobileIsoMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [loginStep, setLoginStep] = useState<"email" | "password">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showResetSent, setShowResetSent] = useState(false);
  const [showTradesMenu, setShowTradesMenu] = useState(false);
  const [showIsoMenu, setShowIsoMenu] = useState(false);
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);
  const [showProgressMenu, setShowProgressMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

const getProfile = async (userId: string) => {

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  setProfile(data);
};

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
  if (profile?.avatar_url) {
    const avatar = getAvatar(profile.avatar_url);
    setAvatarSrc(avatar);
    sessionStorage.setItem("avatar", avatar);
  }
}, [profile]);

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
  setLoginStep("email");
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
  setLoginStep("email");
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <>
<header
  className={`fixed left-0 right-0 z-50 bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] shadow-md ${
    !window.matchMedia('(display-mode: standalone)').matches
      ? 'top-0'
      : 'top-0'
  }`}
  style={{
    WebkitTransform: "translateZ(0)",
    transform: "translateZ(0)"
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
    {/* LEFT SIDE */}
<div className="flex items-center gap-3 min-w-[70px]">

  {/* MOBILE PROFILE / LOGIN */}
  <div className="sm:hidden">
    {user ? (
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center"
      >
        <img
  src={avatarSrc || avatar001}
  alt="avatar"
 className="h-11 w-11 rounded-full object-cover r-2 bordeborder-white/30 shadow-md"
style={{
  marginTop:
    window.innerWidth < 640 &&
    window.matchMedia("(display-mode: standalone)").matches
      ? "-20px"
      : "0px"
}}
/>
      </button>
    ) : (
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
    )}
  </div>

      {user && (
  <Button
    variant="ghost"
    size="icon"
    className="hidden sm:flex text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4]"
    onClick={() => navigate("/profile")}
  >
    <img
      src={avatarSrc || avatar001}
      alt="avatar"
      className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
    />
  </Button>
)}
  {/* DESKTOP DISCORD BUTTON */}
  <button
  className="hidden sm:inline-flex items-center justify-center"
  onClick={() => window.open("https://discord.gg/fb7cHz4kdD", "_blank")}
>
  <img
    src="/website-assets/discordlogo.png"
    alt="Discord"
    className="h-8 w-auto"
  />
</button>

  <button
  className="hidden sm:inline-flex items-center justify-center"
  onClick={() => window.open("https://www.tiktok.com/@keanaex", "_blank")}
>
  <img
    src="/website-assets/tiktoklogo.png"
    alt="TikTok"
    className="h-12 w-auto"
  />
</button>

</div>

    {/* CENTER LOGO */}
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
      <img
        src={logo}
        alt="MLP Kayou Wiki"
        className="h-[32px] sm:h-[40px] md:h-[46px] cursor-pointer"
        onClick={() => navigate("/")}
      />
    </div>

   {/* RIGHT SIDE */}
<div className="hidden sm:flex items-center gap-3">

  {user && (
  <>
    <Button
  variant="ghost"
  className="text-white hover:bg-[#b48ec2]/40"
  onClick={() => {
    handleLogout();
    setOpen(false);
  }}
>
  Logout
</Button>
  </>
)}

  {!user && (
  <>
    <Button
      variant="ghost"
      className="text-white hover:bg-[#b48ec2]/40"
      onClick={() => {
        setAuthMode("login");
        setShowLogin(true);
      }}
    >
      Login
    </Button>

    <Button
      className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
      onClick={() => {
        setAuthMode("signup");
        setShowLogin(true);
      }}
    >
      Make Account
    </Button>
  </>
)}

</div>

  </div>

  

{/* MOBILE FAQ + SELLING BUTTONS */}
<div className="sm:hidden absolute right-3 bottom-2 flex items-center gap-2">
  <button
    onClick={() => navigate("/selling")}
    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-white/10 text-[#f5e6a8] text-lg font-bold shadow-sm"
  >
    $
  </button>

  <button
    onClick={() => navigate("/faq")}
    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-white/10 text-[#f5e6a8] text-lg font-bold shadow-sm"
  >
    ?
  </button>
</div>
</header>

     {window.innerWidth >= 640 && (
  <div
  className="hidden sm:block fixed top-16 left-0 right-0 z-[9999] bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8]"
>
  <div
  ref={menuRef}
  className="w-full px-4 py-1 flex justify-center gap-1"
>

  <Button
  variant="ghost"
  className="relative z-10 text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => navigate("/")}
>
  Home
</Button>
 <Button
  variant="ghost"
  className="relative z-10 text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => navigate("/collections")}
>
  Collections
</Button>
  <div className="relative">
  <Button
    variant="ghost"
    className="relative z-10 px-2 py-1 text-sm whitespace-nowrap text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4]"
    onClick={() => {
      setShowProgressMenu(!showProgressMenu);
      setShowIsoMenu(false);
      setShowTradesMenu(false);
      setShowLeaderboardMenu(false);
    }}
  >
    Progress ▾
  </Button>

  {showProgressMenu && (
    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#5a3e84] backdrop-blur-xl border border-[#d4af37]/40 rounded-2xl shadow-xl z-50">

      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/my-progress");
          setShowProgressMenu(false);
        }}
      >
        CCG Progress
      </button>

      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/progress-tcg");
          setShowProgressMenu(false);
        }}
      >
        TCG Progress
      </button>

    </div>
  )}
</div>

 <div className="relative">
  <Button
    variant="ghost"
    className="relative z-10 px-2 py-1 text-sm whitespace-nowrap text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4]"
    onClick={() => {
  setShowIsoMenu(!showIsoMenu);
  setShowTradesMenu(false);
  setShowLeaderboardMenu(false);
}}
  >
    ISO ▾
  </Button>

  {showIsoMenu && (
    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#5a3e84] backdrop-blur-xl border border-[#d4af37]/40 rounded-2xl shadow-xl z-50">
      
      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/my-iso");
          setShowIsoMenu(false);
        }}
      >
        My ISO
      </button>

      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/public-iso");
          setShowIsoMenu(false);
        }}
      >
        All ISOs
      </button>

    </div>
  )}
</div>

<div className="relative">
  <Button
    variant="ghost"
    className="relative z-10 px-2 py-1 text-sm whitespace-nowrap text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4]"
    onClick={() => {
  setShowTradesMenu(!showTradesMenu);
  setShowIsoMenu(false);
  setShowLeaderboardMenu(false);
}}
  >
    Trades ▾
  </Button>

  {showTradesMenu && (
   <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#5a3e84] backdrop-blur-xl border border-[#d4af37]/40 rounded-2xl shadow-xl z-50">
      
      <button
  className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => {
    navigate("/my-trades");
    setShowTradesMenu(false);
  }}
>
  My Inventory
</button>

<button
  className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => {
    navigate("/trading-post");
    setShowTradesMenu(false);
  }}
>
  Community Trades
</button>

    </div>
  )}
</div>
  <div className="relative">
  <Button
    variant="ghost"
    className="relative z-10 px-2 py-1 text-sm whitespace-nowrap text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4]"
    onClick={() => {
  setShowLeaderboardMenu(!showLeaderboardMenu);
  setShowIsoMenu(false);
  setShowTradesMenu(false);
}}
  >
    Leaderboards ▾
  </Button>

  {showLeaderboardMenu && (
    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#5a3e84] backdrop-blur-xl border border-[#d4af37]/40 rounded-2xl shadow-xl z-50">
      
      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/community");
          setShowLeaderboardMenu(false);
        }}
      >
        US Sets Leaderboards
      </button>

      <button
        className="block mx-2 my-1 px-3 py-1.5 text-sm rounded-md text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
        onClick={() => {
          navigate("/leaderboard");
          setShowLeaderboardMenu(false);
        }}
      >
        US Top Collectors
      </button>

    </div>
  )}
</div>
  <Button
  variant="ghost"
  className="relative z-10 text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => navigate("/selling")}
>
  Selling
</Button>

<Button
  variant="ghost"
  className="relative z-10 text-[#f5e6a8] hover:bg-white/10 hover:text-[#fff3c4] transition-colors"
  onClick={() => navigate("/faq")}
>
  FAQ
</Button>

</div>
</div>
)}

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
          Check your email for instructions to reset your password.
          If you don't see it, check your spam folder.
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

            <div className="text-center mb-5 text-gray-700">
              {loginStep === "email" ? (
                <>
                  <div className="text-lg font-semibold mb-2">
                    {authMode === "login"
                      ? "Sign In"
                      : "Create Your Account"}
                  </div>

                  <div className="text-sm text-gray-500">
                    {authMode === "login"
                      ? "Enter the email associated with your account."
                      : "Enter the email you'd like to use."}
                  </div>
                </>
              ) : (
                <div className="text-lg font-semibold">
                  {authMode === "login"
                    ? "Enter your password."
                    : "Create a password."}
                </div>
              )}
            </div>

            {loginStep === "email" && (
  <input
    type="email"
    value={loginEmail}
    autoComplete="off"
    className="w-full border rounded-lg px-3 py-2 mb-2"
    onChange={(e) => setLoginEmail(e.target.value)}
  />
)}

{loginStep === "password" && (
  <>
    <input
      type="password"
      placeholder="Password"
      value={loginPassword}
      autoComplete="off"
      className="w-full border rounded-lg px-3 py-2 mb-2"
      onChange={(e) => setLoginPassword(e.target.value)}
    />

    {authMode === "signup" && (
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        autoComplete="off"
        className="w-full border rounded-lg px-3 py-2 mb-2"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
    )}
  </>
)}

{loginError && loginStep === "password" && (
  <div className="text-sm text-red-500 mb-2">
    {loginError}
  </div>
)}

{showForgot && loginStep === "password" && (
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
          setLoginStep("email");
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
          setLoginStep("email");
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
      className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110 hover:bg-[#e8e8e0]"
      onClick={() => {
        if (loginStep === "email") {
          setLoginStep("password");
        } else {
          authMode === "login"
            ? handleLoginSubmit()
            : handleSignupSubmit();
        }
      }}
    >
      Continue
    </Button>

  </div>

</div>
          </div>

        </div>
)}

{/* MOBILE BOTTOM NAV */}
<div
  className="sm:hidden fixed bottom-0 left-0 right-0 z-[999] 
  bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] 
  border-t border-[#d4af37]/40
  flex justify-around items-center
  shadow-[0_-4px_16px_rgba(0,0,0,0.5)]"
  style={{
  height: "calc(58px + env(safe-area-inset-bottom))",
  paddingBottom: "max(env(safe-area-inset-bottom), 4px)"
}}
>

<div className="relative">

  <button
    onClick={() => {
  setShowMobileIsoMenu(false);
  setShowMobileLeaderboardMenu(false);
  setShowMobileHomeMenu(false);

  setShowMobileProgressMenu(!showMobileProgressMenu);
}}
    className="mt-1 flex flex-col items-center text-[#f5e6a8] text-[11px]"
  >
    <Grid className="h-6 w-6" />
  </button>

{showMobileProgressMenu && (
  <div className="absolute bottom-14 left-0 w-44 bg-[#5a3e84] border border-[#d4af37]/40 rounded-2xl shadow-xl overflow-hidden">

 <button
      className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
      onClick={() => {
        navigate("/my-iso");
        setShowMobileProgressMenu(false);
      }}
    >
      MY ISO
    </button>

    <button
      className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
      onClick={() => {
        navigate("/my-progress");
        setShowMobileProgressMenu(false);
      }}
    >
      CCG PROGRESS
    </button>

    <button
      className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
      onClick={() => {
        navigate("/progress-tcg");
        setShowMobileProgressMenu(false);
      }}
    >
      TCG PROGRESS
    </button>

  </div>
)}

</div>

<div className="relative">

  <button
    onClick={() => {
  setShowMobileProgressMenu(false);
  setShowMobileLeaderboardMenu(false);
  setShowMobileHomeMenu(false);
  setShowMobileIsoMenu(!showMobileIsoMenu);
}}
    className="flex flex-col items-center text-[#f5e6a8] text-[11px]"
  >
    <List className="h-6 w-6" />
  </button>

  {showMobileIsoMenu && (
    <div className="absolute bottom-14 left-0 w-44 bg-[#5a3e84] border border-[#d4af37]/40 rounded-2xl shadow-xl overflow-hidden">

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10"
        onClick={() => {
          navigate("/public-iso");
          setShowMobileIsoMenu(false);
        }}
      >
        ALL ISO
      </button>

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
        onClick={() => {
          navigate("/trading-post");
          setShowMobileIsoMenu(false);
        }}
      >
        ALL TRADES
      </button>

    </div>
  )}

</div>

  <button
    onClick={() => navigate("/my-trades")}
    className="flex flex-col items-center text-[#f5e6a8] text-[11px]"
  >
    <Layers className="h-6 w-6" />
  </button>

<div className="relative">

  <button
    onClick={() => {
  setShowMobileProgressMenu(false);
  setShowMobileIsoMenu(false);
  setShowMobileHomeMenu(false);
  setShowMobileLeaderboardMenu(!showMobileLeaderboardMenu);
}}
    className="flex flex-col items-center text-[#f5e6a8] text-[11px]"
  >
    <Medal className="h-6 w-6" />
  </button>

  {showMobileLeaderboardMenu && (
    <div className="absolute bottom-14 right-0 w-44 bg-[#5a3e84] border border-[#d4af37]/40 rounded-2xl shadow-xl overflow-hidden">

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10"
        onClick={() => {
          navigate("/leaderboard");
          setShowMobileLeaderboardMenu(false);
        }}
      >
        TOP COLLECTORS
      </button>

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
        onClick={() => {
          navigate("/community");
          setShowMobileLeaderboardMenu(false);
        }}
      >
        LEADERBOARDS
      </button>

    </div>
  )}

</div>

<div className="relative">

  <button
    onClick={() => {
  setShowMobileProgressMenu(false);
  setShowMobileIsoMenu(false);
  setShowMobileLeaderboardMenu(false);
  setShowMobileHomeMenu(!showMobileHomeMenu);
}}
    className="flex flex-col items-center text-[#f5e6a8] text-[11px]"
  >
    <Home className="h-6 w-6" />
  </button>

  {showMobileHomeMenu && (
    <div className="absolute bottom-14 right-0 w-40 bg-[#5a3e84] border border-[#d4af37]/40 rounded-2xl shadow-xl overflow-hidden">

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10"
        onClick={() => {
          navigate("/");
          setShowMobileHomeMenu(false);
        }}
      >
        HOMEPAGE
      </button>

      <button
        className="w-full px-4 py-3 text-sm text-[#f5e6a8] hover:bg-white/10 border-t border-white/10"
        onClick={() => {
          navigate("/collections");
          setShowMobileHomeMenu(false);
        }}
      >
        KAYOUUS SETS
      </button>

    </div>
  )}

</div>

</div>
</>
);
};



export default KayouHeader;