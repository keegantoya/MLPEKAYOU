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
  const success = message.includes("successfully");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4 py-8 font-['Oxanium'] text-zinc-900 transition-colors dark:bg-[#111214] dark:text-white">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#1c1c1e] dark:shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between px-5 pt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={loading}
            className="group flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition hover:brightness-95 disabled:opacity-50"
            aria-label="Cancel password reset"
            title="Cancel"
          >
            <span className="text-[11px] font-bold leading-none text-[#7a1f1b] opacity-0 transition-opacity group-hover:opacity-100">×</span>
          </button>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-white/[0.07] dark:text-zinc-400">
            Account Recovery
          </span>
        </div>
        <div className="px-6 pb-6 pt-4 sm:px-7 sm:pb-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.07]">
              <img
                src={logo}
                alt="MLPEKAYOU"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Choose a new password for your account.
              </p>
            </div>
          </div>
          <div className="rounded-[22px] bg-[#f5f5f7] p-4 dark:bg-white/[0.05]">
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#FFD54A] focus:ring-4 focus:ring-[#FFD54A]/15 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
          {message && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || !password}
            className="mt-5 w-full rounded-2xl bg-[#FFD54A] px-4 py-3.5 text-[15px] font-semibold text-zinc-900 transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
          <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            You’ll be redirected to your profile after your password is updated.
          </p>
        </div>
      </div>
    </div>
  );
}
