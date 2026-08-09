import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const logo = "/website-assets/mlpekayouwiki3.webp";

export default function PasswordReset() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery session detected");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171717] px-4 py-8 font-['Oxanium']">

      {/* SUBTLE TECH GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(#FFD400 1px, transparent 1px), linear-gradient(90deg, #FFD400 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* AMBIENT GOLD LIGHT */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[#FFD400]/[0.035] blur-[120px]" />

      {/* MAIN PANEL */}
      <div className="relative w-full max-w-md">

        {/* TECHNICAL CORNERS */}
        <div className="pointer-events-none absolute -left-px -top-px z-20 h-8 w-8 border-l border-t border-[#FFD400]/60" />
        <div className="pointer-events-none absolute -right-px -top-px z-20 h-8 w-8 border-r border-t border-[#FFD400]/30" />
        <div className="pointer-events-none absolute -bottom-px -left-px z-20 h-7 w-7 border-b border-l border-[#FFD400]/20" />
        <div className="pointer-events-none absolute -bottom-px -right-px z-20 h-7 w-7 border-b border-r border-[#FFD400]/35" />

        <div className="overflow-hidden border border-white/[0.08] bg-[#111111] shadow-[0_20px_70px_rgba(0,0,0,.45)]">

          {/* SYSTEM BAR */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-2.5">

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,.7)]" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.24em] text-white/25">
                MLPEKAYOU // AUTHENTICATION
              </span>
            </div>

            <span className="font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#FFD400]/45">
              SECURE
            </span>

          </div>

          {/* HEADER */}
          <div className="px-6 pb-5 pt-5 text-center">

            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="h-px w-7 bg-[#FFD400]/25" />

              <span className="font-mono text-[6px] font-bold uppercase tracking-[0.25em] text-[#FFD400]/55">
                ACCOUNT RECOVERY
              </span>

              <span className="h-px w-7 bg-[#FFD400]/25" />
            </div>

            <h1 className="text-2xl font-black uppercase tracking-[0.05em] text-white">
              Reset Password
            </h1>

            <p className="mx-auto mt-2 max-w-xs font-mono text-[7px] uppercase leading-[1.8] tracking-[0.08em] text-white/25">
              Enter a new password to restore access to your MLPEKAYOU account.
            </p>

          </div>

          {/* FORM */}
          <div className="px-6 pb-6">

            {/* INPUT LABEL */}
            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="new-password"
                className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-white/35"
              >
                New Password
              </label>

              <span className="font-mono text-[6px] uppercase tracking-[0.14em] text-[#FFD400]/40">
                REQUIRED
              </span>

            </div>

            {/* INPUT */}
            <div className="relative">

              <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-[#FFD400]/35" />

              <input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="
                  h-12
                  w-full
                  border
                  border-white/[0.09]
                  bg-[#181818]
                  px-4
                  font-['Oxanium']
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/20
                  transition-all
                  duration-200
                  focus:border-[#FFD400]/55
                  focus:bg-[#1b1b1b]
                  focus:shadow-[0_0_16px_rgba(255,212,0,.06)]
                "
              />

              <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#FFD400]/20" />

            </div>

            {/* BUTTONS */}
            <div className="mt-5 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="
                  h-11
                  border
                  border-white/[0.08]
                  bg-[#181818]
                  font-mono
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-white/35
                  transition-all
                  duration-200
                  hover:border-white/[0.16]
                  hover:bg-[#1d1d1d]
                  hover:text-white/65
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading || !password}
                className="
                  relative
                  h-11
                  overflow-hidden
                  border
                  border-[#FFD400]
                  bg-[#FFD400]
                  font-['Oxanium']
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[#171717]
                  transition-all
                  duration-200
                  hover:bg-[#ffe45c]
                  hover:shadow-[0_0_18px_rgba(255,212,0,.18)]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

            </div>

            {/* STATUS */}
            {message && (
              <div
                className={`
                  mt-4
                  border
                  px-3
                  py-3
                  text-center
                  ${
                    message.includes("successfully")
                      ? "border-[#FFD400]/25 bg-[#FFD400]/[0.04]"
                      : "border-red-400/20 bg-red-400/[0.04]"
                  }
                `}
              >
                <div
                  className={`
                    font-mono
                    text-[7px]
                    font-bold
                    uppercase
                    leading-relaxed
                    tracking-[0.08em]
                    ${
                      message.includes("successfully")
                        ? "text-[#FFD400]/75"
                        : "text-red-300/70"
                    }
                  `}
                >
                  {message}
                </div>
              </div>
            )}

          </div>

          {/* FOOTER STATUS */}
          <div className="flex items-center justify-between border-t border-white/[0.05] bg-[#0d0d0d] px-5 py-2.5">

            <span className="font-mono text-[5px] uppercase tracking-[0.18em] text-white/15">
              AUTH NODE // 04
            </span>

            <span className="flex items-center gap-1.5 font-mono text-[5px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/40">
              <span className="h-1 w-1 bg-[#FFD400]/70 shadow-[0_0_5px_rgba(255,212,0,.6)]" />
              ENCRYPTED
            </span>

          </div>

        </div>

        {/* BOTTOM SYSTEM TEXT */}
        <div className="mt-3 flex justify-center gap-3 font-mono text-[5px] uppercase tracking-[0.18em] text-white/10">
          <span>MLPEKAYOU</span>
          <span>•</span>
          <span>SECURE ACCOUNT RECOVERY</span>
        </div>

      </div>
    </div>
  );
}