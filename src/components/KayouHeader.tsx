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
  List
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
  const [loginStep, setLoginStep] = useState<"email" | "password">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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

  const handleLoginSubmit = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert("Invalid email or password");
      return;
    }

    setShowLogin(false);
    setLoginEmail("");
    setLoginPassword("");
    setLoginStep("email");
  };

  const handleSignupSubmit = async () => {
    const username = generateUsername();

    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password: loginPassword,
      options: {
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

    alert(`Account created! Your username is: ${username}`);

    setShowLogin(false);
    setLoginEmail("");
    setLoginPassword("");
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
        <div className="container flex h-16 items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">

            <Sheet>
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
  <div className="flex flex-col gap-2">

    {user && (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/profile")}
      >
        <Settings className="h-4 w-4 mr-2" />
        Profile
      </Button>
    )}

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/")}
    >
      <Home className="h-4 w-4 mr-2" />
      Home
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/collections")}
    >
      <List className="h-4 w-4 mr-2" />
      Collections
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/my-progress")}
    >
      <BarChart className="h-4 w-4 mr-2" />
      My Progress
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/my-iso")}
    >
      <List className="h-4 w-4 mr-2" />
      My ISO
    </Button>

    <Button
  variant="ghost"
  className="w-full justify-start"
  onClick={() => navigate("/for-trade")}
>
  <ArrowLeftRight className="h-4 w-4 mr-2" />
  For Trade
</Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/community")}
    >
      <Trophy className="h-4 w-4 mr-2" />
      Community Progress
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/leaderboard")}
    >
      <Medal className="h-4 w-4 mr-2" />
      Top Collectors
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/collectors")}
    >
      <Users className="h-4 w-4 mr-2" />
      Other Collectors
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => navigate("/selling")}
    >
      <Tag className="h-4 w-4 mr-2" />
      Selling
    </Button>

    {!user && (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => {
          setAuthMode("login");
          setShowLogin(true);
        }}
      >
        <User className="h-4 w-4 mr-2" />
        Log In
      </Button>
    )}

    {user && (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    )}

  </div>
</SheetContent>
</Sheet>

            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-2 sm:px-4"
              onClick={() =>
                window.open("https://discord.gg/fb7cHz4kdD", "_blank")
              }
            >
              DISCORD
            </Button>

          </div>

          {/* CENTER LOGO */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <img
              src={logo}
              alt="MLP Kayou Wiki"
              className="h-[36px] sm:h-[46px] cursor-pointer"
              onClick={() => navigate("/")}
            />

            <span className="text-yellow-400 font-black text-xl sm:text-2xl">
              BETA
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">

            {!user && (
              <>
                <Button
                  variant="ghost"
                  className="text-white"
                  onClick={() => {
                    setAuthMode("login");
                    setShowLogin(true);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Log In
                </Button>

                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4"
                  onClick={() => {
                    setAuthMode("signup");
                    setShowLogin(true);
                  }}
                >
                  Create Account
                </Button>
              </>
            )}

          </div>

        </div>
      </header>

      {/* LOGIN POPUP */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

          <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14">

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

            <input
              type={loginStep === "email" ? "email" : "password"}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              onChange={(e) =>
                loginStep === "email"
                  ? setLoginEmail(e.target.value)
                  : setLoginPassword(e.target.value)
              }
            />

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