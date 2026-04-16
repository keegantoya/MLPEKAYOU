import {
  Menu,
  User,
  Home,
  BarChart,
  Trophy,
  Medal,
  LogOut,
  Tag,
  Settings,
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

import logo from "@/assets/avatars/mlpekayouwiki.png";

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
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
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
  const isMobile = window.innerWidth < 640;
  const hasSeenPrompt = localStorage.getItem("seenLoginPrompt");

  if (isMobile && !user && !hasSeenPrompt) {
    setShowMobilePrompt(true);
    localStorage.setItem("seenLoginPrompt", "true");
  }
}, [user]);

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
    emailRedirectTo: window.location.origin,
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
      <header className="sticky top-0 z-50 bg-neutral-700 text-white border-b border-neutral-600 shadow-sm">
  <div className="w-full flex h-16 items-center px-2 sm:px-4 relative justify-between">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-3">

      {user && (
  <Button
    variant="ghost"
    size="icon"
    className="hidden sm:inline-flex text-white hover:bg-white/10"
    onClick={() => navigate("/profile")}
  >
    <User className="h-5 w-5" />
  </Button>
)}
  {/* DESKTOP DISCORD BUTTON */}
  <Button
    className="hidden sm:inline-flex bg-yellow-400 text-black font-bold"
    onClick={() => window.open("https://discord.gg/fb7cHz4kdD", "_blank")}
  >
    DISCORD
  </Button>

  <Button
  className="hidden sm:inline-flex bg-pink-400 hover:bg-pink-500 text-black font-bold"
  onClick={() => window.open("https://www.tiktok.com/@keanaex", "_blank")}
>
  TIKTOK
</Button>

      {/* MOBILE ONLY MENU */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-4">
            <div className="flex flex-col gap-2 mt-8">

              {user && (
  <Button
    variant="ghost"
    className="w-full justify-start"
    onClick={() => {
      navigate("/profile");
      setOpen(false);
    }}
  >
    <Settings className="h-4 w-4 mr-2" />
    Profile
  </Button>
)}

  {/* MENU BUTTONS */}
  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/"); setOpen(false); }}>
    <Home className="h-4 w-4 mr-2" />
    Home
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/collections"); setOpen(false); }}>
    <Grid className="h-4 w-4 mr-2" />
    Collections
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/my-progress"); setOpen(false); }}>
    <BarChart className="h-4 w-4 mr-2" />
    My Progress
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/my-iso"); setOpen(false); }}>
    <List className="h-4 w-4 mr-2" />
    My ISO
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/my-trades"); setOpen(false); }}>
    <Layers className="h-4 w-4 mr-2" />
    My Trades
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/public-iso"); setOpen(false); }}>
  <Users className="h-4 w-4 mr-2" />
  Open ISOs
</Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/trading-post"); setOpen(false); }}>
    <ArrowLeftRight className="h-4 w-4 mr-2" />
    Open Trades
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/community"); setOpen(false); }}>
    <Trophy className="h-4 w-4 mr-2" />
    Community
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/leaderboard"); setOpen(false); }}>
    <Medal className="h-4 w-4 mr-2" />
    Leaderboard
  </Button>

  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/selling"); setOpen(false); }}>
    <Tag className="h-4 w-4 mr-2" />
    Selling
  </Button>

  <div className="border-t my-3" />

  {/* DISCORD */}
  <Button
    className="w-full justify-start bg-yellow-400 text-black font-bold"
    onClick={() => {
      window.open("https://discord.gg/fb7cHz4kdD", "_blank");
      setOpen(false);
    }}
  >
    DISCORD
  </Button>

  {/* TIKTOK */}
  <Button
    className="w-full justify-start bg-pink-400 hover:bg-pink-500 text-black font-bold mt-2"
    onClick={() => {
      window.open("https://www.tiktok.com/@keanaex", "_blank");
      setOpen(false);
    }}
  >
    TIKTOK
  </Button>

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

      <span className="text-yellow-400 font-black text-lg sm:text-xl md:text-2xl">
        BETA
      </span>
    </div>

   {/* RIGHT SIDE */}
<div className="hidden sm:flex items-center gap-3">

  {user && (
    <Button
      variant="ghost"
      className="text-white hover:bg-white/10"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )}

  {!user && (
  <>
    <Button
      variant="ghost"
      className="text-white hover:bg-white/10"
      onClick={() => {
        setAuthMode("login");
        setShowLogin(true);
      }}
    >
      Login
    </Button>

    <Button
      className="bg-yellow-400 text-black"
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

        <div className="hidden sm:block sticky top-16 z-40 bg-neutral-700 text-white border-b border-neutral-600">
  <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap justify-center gap-2">

  <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
  <Button variant="ghost" onClick={() => navigate("/collections")}>Collections</Button>
  <Button variant="ghost" onClick={() => navigate("/my-progress")}>My Progress</Button>

  <Button variant="ghost" onClick={() => navigate("/my-iso")}>My ISO</Button>
  <Button variant="ghost" onClick={() => navigate("/public-iso")}>Open ISOs</Button>

  <Button variant="ghost" onClick={() => navigate("/my-trades")}>My Trades</Button>
  <Button variant="ghost" onClick={() => navigate("/trading-post")}>Open Trades</Button>
  <Button variant="ghost" onClick={() => navigate("/community")}>Community</Button>
  <Button variant="ghost" onClick={() => navigate("/leaderboard")}>Leaderboard</Button>
  <Button variant="ghost" onClick={() => navigate("/selling")}>Selling</Button>

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

    <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-14 flex flex-col min-h-[260px]">

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
        <img src={logo} className="h-12" />
      </div>

      <div className="text-center mb-6 text-gray-700">
        <div className="text-lg font-semibold mb-2">
          Welcome to MLPEKAYOU!
        </div>

        <div className="text-sm text-gray-500">
          Signing in allows you to save your progress. Not ready? No worries, you can still
          create an account from the sidebar menu later.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-3">
        <Button
  variant="ghost"
  className="border border-neutral-400 text-neutral-700 hover:bg-neutral-100"
  onClick={() => {
    setAuthMode("login");
    setShowMobilePrompt(false);
    setShowLogin(true);
  }}
>
  Sign In
</Button>

        <Button
          className="bg-yellow-400 text-black"
          onClick={() => {
            setAuthMode("signup");
            setShowMobilePrompt(false);
            setShowLogin(true);
          }}
        >
          Sign Up
        </Button>
      </div>

<div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
  <Button
    className="bg-pink-100 hover:bg-pink-200 text-neutral-700 rounded-xl px-6 shadow-md border border-pink-200"
    onClick={() => setShowMobilePrompt(false)}
  >
    No thanks!
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

    <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-14 flex flex-col min-h-[260px]">

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
        <img src={logo} className="h-12" />
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
          className="bg-yellow-400 text-black"
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

    <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-14 flex flex-col min-h-[260px]">

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
        <img src={logo} className="h-12" />
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
          className="bg-yellow-400 text-black"
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

          <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-12 flex flex-col min-h-[260px]">

            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
              <img src={logo} className="h-12" />
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
                className="bg-yellow-400 text-black"
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