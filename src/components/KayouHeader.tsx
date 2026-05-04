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

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      username,
    });
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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border-b border-[#d4af37]/40 text-[#f5e6a8] shadow-md">
  <div className="w-full flex h-20 items-center px-2 sm:px-4 relative justify-between">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-3">

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
    className="h-10 w-auto"
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

      {/* MOBILE ONLY MENU */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#b48ec2]/40"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-4 bg-neutral-900/40 backdrop-blur-xl backdrop-saturate-150 text-white border-r border-white/10">
            <div className="flex flex-col gap-2 mt-8">

              <Button
  variant="ghost"
  className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10"
  onClick={() => {
    navigate("/profile");
    setOpen(false);
  }}
>
  <img
    src={avatarSrc || avatar001}
    alt="avatar"
    className="h-5 w-5 rounded-full object-cover mr-2 border border-white/30"
  />
  Profile
</Button>

  {/* MENU BUTTONS */}
  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/"); setOpen(false); }}>
    <Home className="h-4 w-4 mr-2" />
    Home
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/collections"); setOpen(false); }}>
    <Grid className="h-4 w-4 mr-2" />
    Collections
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/my-progress"); setOpen(false); }}>
    <BarChart className="h-4 w-4 mr-2" />
    CCG Progress
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/progress-tcg"); setOpen(false); }}>
    <BarChart className="h-4 w-4 mr-2" />
    TCG Progress
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/my-iso"); setOpen(false); }}>
    <List className="h-4 w-4 mr-2" />
    My ISO
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/my-trades"); setOpen(false); }}>
    <Layers className="h-4 w-4 mr-2" />
    My Inventory
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/public-iso"); setOpen(false); }}>
  <Users className="h-4 w-4 mr-2" />
  Open ISOs
</Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/trading-post"); setOpen(false); }}>
    <ArrowLeftRight className="h-4 w-4 mr-2" />
    Open Trades
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/community"); setOpen(false); }}>
    <Trophy className="h-4 w-4 mr-2" />
    Community
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/leaderboard"); setOpen(false); }}>
    <Medal className="h-4 w-4 mr-2" />
    Leaderboard
  </Button>

  <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10" onClick={() => { navigate("/selling"); setOpen(false); }}>
    <Tag className="h-4 w-4 mr-2" />
    Selling
  </Button>

  <Button
  variant="ghost"
  className="w-full justify-start text-white hover:bg-[#b48ec2]/40 hover:text-[#f5e6a8] focus:bg-white/10 active:bg-white/10"
  onClick={() => {
    navigate("/faq");
    setOpen(false);
  }}
>
  <List className="h-4 w-4 mr-2" />
  FAQ
</Button>

  <div className="border-t my-3" />

{/* ACTIONS (MOBILE) */}
<div className="flex flex-col gap-3">

  {!user && (
    <>
      <Button
        className="w-full justify-start bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold shadow-sm hover:bg-white/20 transition-all"
        onClick={() => {
          setAuthMode("login");
          setShowLogin(true);
          setOpen(false);
        }}
      >
        LOGIN
      </Button>

      <Button
        className="w-full justify-start bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold shadow-sm hover:bg-white/20 transition-all"
        onClick={() => {
          setAuthMode("signup");
          setShowLogin(true);
          setOpen(false);
        }}
      >
        CREATE AN ACCOUNT
      </Button>
    </>
  )}

  {/* DISCORD */}
  <Button
    className="w-full justify-start bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold shadow-sm hover:bg-white/20 transition-all"
    onClick={() => {
      window.open("https://discord.gg/fb7cHz4kdD", "_blank");
      setOpen(false);
    }}
  >
    DISCORD
  </Button>

  {/* TIKTOK */}
  <Button
    className="w-full justify-start bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold shadow-sm hover:bg-white/20 transition-all"
    onClick={() => {
      window.open("https://www.tiktok.com/@keanaex", "_blank");
      setOpen(false);
    }}
  >
    TIKTOK
  </Button>

</div>

</div>
          </SheetContent>
        </Sheet>
      </div>

    </div>

    {/* CENTER LOGO */}
    <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-2">
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
</header>

      <div className="hidden sm:block sticky top-16 z-40 bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border-b border-[#d4af37]/40 text-[#f5e6a8]">
  <div
  ref={menuRef}
  className="w-full px-4 py-2 flex justify-center gap-2"
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
    Important Notice
  </div>

  <div className="text-sm text-gray-700 mb-4">
    All card assets, front and back, were obtained by gaining direct access and permission from Kayou US. Please do not take these images for use other than personal.
  </div>

  <div className="text-sm text-gray-500">
   If you are saving them to use for an ISO post, that is not a concern. If you are saving them to use on your own public website or domain, please refrain. Reach out to me and I will guide you to the channels to get access and permission yourself instead of stealing images.
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
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] border border-[#d4af37]/40 hover:brightness-110  hover:bg-[#e8e8e0]"
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
      )}
    </>
  );
};

export default KayouHeader;