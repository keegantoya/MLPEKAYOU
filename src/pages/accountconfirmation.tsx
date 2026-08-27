import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const logo = "/website-assets/mlpekayouwiki3.webp";
export default function AccountConfirmation() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your account...");
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const root = document.documentElement;
    return root.dataset.theme === "light" || root.classList.contains("light") || !root.classList.contains("dark");
  });
  useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      setIsLightMode(
        root.dataset.theme === "light" ||
        root.classList.contains("light") ||
        !root.classList.contains("dark")
      );
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    window.addEventListener("themechange", syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", syncTheme);
    };
  }, []);
  useEffect(() => {
    setMessage("Account confirmed! Redirecting...");
    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div
      className={`min-h-screen px-4 py-8 transition-colors ${
        isLightMode ? "bg-[#f6f4ef] text-zinc-900" : "bg-[#0f1112] text-zinc-100"
      }`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
        <section
          className={`w-full overflow-hidden rounded-[28px] border shadow-xl ${
            isLightMode
              ? "border-black/10 bg-white shadow-black/[0.06]"
              : "border-white/[0.08] bg-[#17191a] shadow-black/40"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-[#FFD54A] via-[#e8c446] to-transparent" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <img src={logo} alt="MLPEKAYOU" className="h-11 w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <div
                  className={`text-sm font-medium ${
                    isLightMode ? "text-[#806100]" : "text-[#E8CA55]"
                  }`}
                >
                  Account verification
                </div>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Account Confirmed</h1>
              </div>
            </div>
            <div
              className={`mt-6 rounded-[22px] border p-5 ${
                isLightMode
                  ? "border-emerald-700/15 bg-emerald-50"
                  : "border-emerald-400/15 bg-emerald-400/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
                  ✓
                </div>
                <div>
                  <div className="text-base font-semibold">You're all set</div>
                  <p
                    className={`mt-1 text-sm leading-6 ${
                      isLightMode ? "text-zinc-600" : "text-zinc-400"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className={isLightMode ? "text-zinc-500" : "text-zinc-400"}>
                  Redirecting
                </span>
                <span className={isLightMode ? "text-[#806100]" : "text-[#E8CA55]"}>
                  100%
                </span>
              </div>
              <div
                className={`h-2 overflow-hidden rounded-full ${
                  isLightMode ? "bg-zinc-200" : "bg-white/[0.07]"
                }`}
              >
                <div className="h-full w-full rounded-full bg-[#FFD54A]" />
              </div>
            </div>
            <button
              type="button"
              disabled
              className={`mt-5 w-full cursor-wait rounded-2xl border px-4 py-3 text-sm font-semibold ${
                isLightMode
                  ? "border-black/10 bg-zinc-100 text-zinc-500"
                  : "border-white/[0.08] bg-white/[0.04] text-zinc-400"
              }`}
            >
              Redirecting to homepage...
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
