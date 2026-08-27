import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getAvatar } from "../Everypony/profile-assets";
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
import avatar028 from "@/assets/avatars/avatar028.webp";
import avatar029 from "@/assets/avatars/avatar029.webp";
import avatar030 from "@/assets/avatars/avatar030.webp";
import avatar031 from "@/assets/avatars/avatar031.webp";
import avatar032 from "@/assets/avatars/avatar032.webp";
import avatar033 from "@/assets/avatars/avatar033.webp";
import avatar034 from "@/assets/avatars/avatar034.webp";
import avatar035 from "@/assets/avatars/avatar035.webp";
import avatar036 from "@/assets/avatars/avatar036.webp";
import avatar037 from "@/assets/avatars/avatar037.webp";
import avatar038 from "@/assets/avatars/avatar038.webp";
import avatar039 from "@/assets/avatars/avatar039.webp";
import avatar040 from "@/assets/avatars/avatar040.webp";
import avatar041 from "@/assets/avatars/avatar041.webp";
import avatar042 from "@/assets/avatars/avatar042.webp";
import avatar043 from "@/assets/avatars/avatar043.webp";
import avatar044 from "@/assets/avatars/avatar044.webp";
import avatar045 from "@/assets/avatars/avatar045.webp";
import avatar046 from "@/assets/avatars/avatar046.webp";
const avatarMap: Record<string, string> = {
  avatar001,
  avatar002,
  avatar003,
  avatar004,
  avatar005,
  avatar006,
  avatar007,
  avatar008,
  avatar009,
  avatar010,
  avatar011,
  avatar012,
  avatar013,
  avatar014,
  avatar015,
  avatar016,
  avatar017,
  avatar018,
  avatar019,
  avatar020,
  avatar021,
  avatar022,
  avatar023,
  avatar024,
  avatar025,
  avatar026,
  avatar027,
  avatar028,
  avatar029,
  avatar030,
  avatar031,
  avatar032,
  avatar033,
  avatar034,
  avatar035,
  avatar036,
  avatar037,
  avatar038,
  avatar039,
  avatar040,
  avatar041,
  avatar042,
  avatar043,
  avatar044,
  avatar045,
  avatar046};
export default function ChangeAvatar() {
const navigate = useNavigate();
const [currentAvatar, setCurrentAvatar] = useState("avatar001");
const [isLightMode, setIsLightMode] = useState(
  () => document.documentElement.dataset.theme === "light"
);
const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
  useEffect(() => {
const loadAvatar = async () => {
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();
      if (data?.avatar_url) {
setCurrentAvatar(data.avatar_url);
      }
    };
    loadAvatar();
  }, []);
useEffect(() => {
let mounted = true;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const syncFromDocument = () => {
    if (!mounted) return;
    setIsLightMode(document.documentElement.dataset.theme === "light");
  };
const observer = new MutationObserver(syncFromDocument);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
const loadThemePreference = async () => {
const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!mounted) return;
    if (!session?.user) {
      setIsLightMode(false);
      return;
    }
const { data, error } = await supabase
      .from("user_light_mode_preferences")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!mounted) return;
    if (error) {
      console.error("Unable to load avatar page theme preference:", error);
    } else {
      setIsLightMode(Boolean(data));
    }
    realtimeChannel = supabase
      .channel(`change-avatar-theme-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "\*",
          schema: "public",
          table: "user_light_mode_preferences",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (!mounted) return;
          setIsLightMode(payload.eventType !== "DELETE");
        }
      )
      .subscribe();
  };
  syncFromDocument();
  loadThemePreference();
  return () => {
    mounted = false;
    observer.disconnect();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  };
}, []);
useEffect(() => {
const background = isLightMode ? "#f5f5f3" : "#0d0f10";
const previousHtmlBackground = document.documentElement.style.backgroundColor;
const previousBodyBackground = document.body.style.backgroundColor;
  document.documentElement.style.backgroundColor = background;
  document.body.style.backgroundColor = background;
  return () => {
    document.documentElement.style.backgroundColor = previousHtmlBackground;
    document.body.style.backgroundColor = previousBodyBackground;
  };
}, [isLightMode]);
const handleAvatarSelect = async (avatar: string) => {
    try {
      setSaving(true);
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
await supabase.auth.updateUser({
  data: {
    avatar_url: avatar,
  },
});
await supabase
  .from("profiles")
  .update({
    avatar_url: avatar,
  })
        .eq("id", session.user.id);
window.dispatchEvent(
  new CustomEvent("profile-updated", {
    detail: {
      avatar_url: avatar,
    },
  })
);
      navigate(-1);
    } finally {
      setSaving(false);
    }
  };
const confirmAvatarChange = async () => {
  if (!pendingAvatar) return;
  await handleAvatarSelect(pendingAvatar);
  setPendingAvatar(null);
};
return (
  <div className={`min-h-screen transition-colors duration-200 ${
    isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
  }`}>
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xl font-medium transition-colors ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
            }`}
            aria-label="Back to profile"
          >
            ‹
          </button>
          <img
            src={getAvatar(currentAvatar)}
            alt="Current avatar"
            className={`h-24 w-24 rounded-3xl border object-cover sm:h-28 sm:w-28 ${
              isLightMode ? "border-black/10" : "border-white/10"
            }`}
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pick an Avatar</h1>
            <p className={`mt-1 max-w-xl text-sm leading-6 ${
              isLightMode ? "text-zinc-600" : "text-zinc-400"
            }`}>
              Choose a new profile picture from the avatars below.
            </p>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Object.entries(avatarMap)
              .filter(([name]) => !/^avatar(00[1-9]|01[0-5]|027)$/.test(name))
              .map(([name]) => {
                const selected = currentAvatar === name;
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={saving}
                    onClick={() => setPendingAvatar(name)}
                    aria-label={selected ? "Current avatar" : "Choose avatar"}
                    className={`group relative overflow-hidden rounded-3xl border transition-all ${
                      selected
                        ? isLightMode
                          ? "border-[#8a6a00]/45 bg-[#c89d13]/10 ring-2 ring-[#8a6a00]/10"
                          : "border-[#FFD54A]/55 bg-[#FFD54A]/10 ring-2 ring-[#FFD54A]/10"
                        : isLightMode
                        ? "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_8px_22px_rgba(0,0,0,.08)]"
                        : "border-white/[0.08] bg-[#151718] hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#1a1c1d]"
                    }`}
                  >
                    <img
                      src={getAvatar(name)}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    {selected && (
                      <div className={`absolute inset-x-2 bottom-2 rounded-full px-2 py-1 text-center text-[11px] font-semibold backdrop-blur-sm ${
                        isLightMode
                          ? "bg-white/90 text-[#725700]"
                          : "bg-[#0d0f10]/85 text-[#FFE27A]"
                      }`}>
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
          <p className={`mt-5 text-center text-xs leading-5 ${
            isLightMode ? "text-zinc-500" : "text-zinc-500"
          }`}>
            Some older avatars are no longer available to select, but they remain visible for users who already have them.
          </p>
        </div>
      </div>
    </main>
    {pendingAvatar && (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 backdrop-blur-md ${
          isLightMode ? "bg-white/20" : "bg-black/70"
        }`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !saving) {
            setPendingAvatar(null);
          }
        }}
      >
        <div className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,.30)] ${
          isLightMode
            ? "border-black/10 bg-white text-zinc-900"
            : "border-white/[0.10] bg-[#151718] text-white"
        }`}>
          <h2 className="text-xl font-semibold tracking-tight">Use this avatar?</h2>
          <div className="mt-5 flex items-center justify-center gap-4">
            <img
              src={getAvatar(currentAvatar)}
              alt="Current avatar"
              className={`h-24 w-24 rounded-3xl border object-cover ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            />
            <ChevronRight className={isLightMode ? "text-[#725700]" : "text-[#FFE27A]"} />
            <img
              src={getAvatar(pendingAvatar)}
              alt="New avatar"
              className={`h-24 w-24 rounded-3xl border object-cover ${
                isLightMode ? "border-[#8a6a00]/30" : "border-[#FFD54A]/40"
              }`}
            />
          </div>
          <p className={`mt-4 text-center text-sm leading-6 ${
            isLightMode ? "text-zinc-600" : "text-zinc-300"
          }`}>
            Your profile picture will update immediately.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setPendingAvatar(null)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                isLightMode
                  ? "border-black/10 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={confirmAvatarChange}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                isLightMode
                  ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                  : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFE27A]"
              }`}
            >
              {saving ? "Changing..." : "Use Avatar"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
