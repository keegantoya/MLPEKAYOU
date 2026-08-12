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
  avatar045};

export default function ChangeAvatar() {
  const navigate = useNavigate();

const [currentAvatar, setCurrentAvatar] = useState("avatar001");
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
<div className="min-h-screen bg-[#171717] text-white">
  <div className="sticky top-0 z-20 flex h-16 items-center border-b border-zinc-800 bg-[#171717] px-4 pt-6 md:pt-0">

    <button
      type="button"
      onClick={() => navigate(-1)}
      className="group relative flex items-center gap-2 overflow-hidden border border-[#30363a] bg-[#0d1113] px-3 py-2 transition-all duration-200 hover:border-[#E7C84B] hover:bg-[#13191c] hover:shadow-[0_0_18px_rgba(231,200,75,.12)]"
    >
      <span className="font-mono text-lg leading-none text-[#E7C84B] transition-transform duration-200 group-hover:-translate-x-0.5">
        ‹
      </span>

      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors duration-200 group-hover:text-white">
        Back to My Profile
      </span>

      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-[#E7C84B] opacity-70" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#E7C84B] opacity-50" />
    </button>

    <div className="ml-4 h-5 w-px bg-[#E7C84B]/20" />

    <h1 className="ml-4 font-['Oxanium'] text-xl font-black uppercase tracking-[0.12em] text-white">
      Change Avatar
    </h1>

  </div>

  <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-6 md:px-8 md:py-10">

  <div className="relative mx-auto max-w-5xl overflow-hidden border border-[#30363a] bg-[#0b0f11]">

    {/* TECH GRID */}
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage: `
          linear-gradient(rgba(231,200,75,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(231,200,75,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }}
    />

    {/* HUD CORNERS */}
    <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#E7C84B]" />
    <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#E7C84B]/50" />
    <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#E7C84B]/40" />
    <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#E7C84B]" />

    {/* HEADER */}
    <div className="relative flex items-center justify-between border-b border-[#252b2f] bg-[#0d1113] px-5 py-3 md:px-6">

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />

        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-[#E7C84B]">
          PROFILE SYSTEM
        </span>

        <span className="hidden h-px w-8 bg-[#E7C84B]/30 sm:block" />

        <span className="hidden font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-700 sm:block">
          AVATAR MODULE
        </span>
      </div>

      <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-green-400/70">
        ● ONLINE
      </span>

    </div>

    {/* CURRENT AVATAR */}
    <div className="relative flex flex-col items-center px-5 py-8 md:py-10">

      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E7C84B]/50" />

        <span className="font-mono text-[7px] font-bold uppercase tracking-[0.35em] text-[#E7C84B]/70">
          CURRENT IDENTITY
        </span>

        <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E7C84B]/50" />
      </div>

      <div className="relative">

        <span className="absolute -left-3 -top-3 h-3 w-3 border-l-2 border-t-2 border-[#E7C84B]" />
        <span className="absolute -right-3 -top-3 h-3 w-3 border-r-2 border-t-2 border-[#E7C84B]/60" />
        <span className="absolute -bottom-3 -left-3 h-3 w-3 border-b-2 border-l-2 border-[#E7C84B]/60" />
        <span className="absolute -bottom-3 -right-3 h-3 w-3 border-b-2 border-r-2 border-[#E7C84B]" />

        <img
          src={getAvatar(currentAvatar)}
          className="relative h-28 w-28 border border-[#E7C84B]/50 object-cover shadow-[0_0_25px_rgba(231,200,75,.12)] md:h-36 md:w-36"
        />

      </div>

      <h2 className="mt-7 font-['Oxanium'] text-2xl font-black uppercase tracking-[0.1em] text-white md:text-3xl">
        Choose an Avatar
      </h2>

<p className="mt-2 max-w-2xl text-center font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-zinc-500">
  Any avatar with{" "}
  <span className="inline-flex h-4 w-4 items-center justify-center border border-[#E7C84B]/70 bg-[#0b0f11] text-[9px] font-black leading-none text-[#E7C84B]">
    !
  </span>{" "}
  on them will be leaving MLPEKayou soon! They will still display on your profile, but they will be removed from the avatar selector to make room for more future avatars!
</p>

    </div>

    {/* AVATAR DATABASE */}
    <div className="relative border-t border-[#252b2f] bg-[#0d1113] px-4 py-5 md:px-6 md:py-6">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_7px_#E7C84B]" />

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#E7C84B]">
            AVATAR DATABASE
          </span>
        </div>

        <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-700">
          {Object.keys(avatarMap).length} AVAILABLE
        </span>

      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">

{Object.entries(avatarMap)
  .filter(([name]) => !/^avatar(00[1-9]|01[0-5]|027)$/.test(name))
  .map(([name]) => {
  return (
    <button
      key={name}
      disabled={saving}
      onClick={() => setPendingAvatar(name)}
      className={`group relative overflow-hidden border transition-all duration-200 ${
        currentAvatar === name
          ? "border-[#E7C84B] bg-[#E7C84B]/10 shadow-[0_0_18px_rgba(231,200,75,.2)]"
          : "border-[#30363a] bg-[#101518] hover:border-[#E7C84B]/70 hover:bg-[#13191c]"
      }`}
    >

      <img
        src={getAvatar(name)}
        className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />

      {currentAvatar === name && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#E7C84B] px-1 py-1">
          <span className="font-mono text-[6px] font-black uppercase tracking-[0.15em] text-[#090b0c]">
            SELECTED
          </span>
        </div>
      )}

      <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[#E7C84B] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-[#E7C84B]/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-[#E7C84B]/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[#E7C84B] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

    </button>
  );
})}

      </div>

    </div>

  </div>

</div>

{pendingAvatar && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">

    <div className="relative w-full max-w-md overflow-hidden border border-[#30363a] bg-[#0b0f11] shadow-[0_25px_80px_rgba(0,0,0,.75)]">

      {/* HUD corners */}
      <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#E7C84B]" />
      <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#E7C84B]/50" />
      <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#E7C84B]/40" />
      <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#E7C84B]" />

      <div className="border-b border-[#252b2f] bg-[#0d1113] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[#E7C84B]">
            CONFIRM AVATAR CHANGE
          </span>
        </div>
      </div>

      <div className="px-5 py-6">

        {/* CURRENT -> NEW */}
        <div className="flex items-center justify-center gap-4">

          <div className="text-center">
            <div className="mb-2 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              CURRENT
            </div>

            <div className="border border-[#30363a] bg-[#101518] p-1.5">
              <img
                src={getAvatar(currentAvatar)}
                alt="Current avatar"
                className="h-24 w-24 object-cover"
              />
            </div>
          </div>

          <ChevronRight className="h-6 w-6 shrink-0 text-[#E7C84B]" />

          <div className="text-center">
            <div className="mb-2 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#E7C84B]">
              NEW
            </div>

            <div className="border border-[#E7C84B] bg-[#E7C84B]/10 p-1.5 shadow-[0_0_18px_rgba(231,200,75,.12)]">
              <img
                src={getAvatar(pendingAvatar)}
                alt="New avatar"
                className="h-24 w-24 object-cover"
              />
            </div>
          </div>

        </div>

        <div className="mt-6 text-center">

          <h2 className="font-['Oxanium'] text-lg font-black uppercase tracking-[0.08em] text-white">
            Are you sure you want to change your avatar?
          </h2>

          <p className="mx-auto mt-3 max-w-sm font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-zinc-500">
            If you have an avatar that is no longer on this list, it can't be undone.
          </p>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">

          <button
            type="button"
            disabled={saving}
            onClick={() => setPendingAvatar(null)}
            className="border border-[#30363a] bg-[#101518] px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition-all hover:border-zinc-500 hover:bg-[#13191c] hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={confirmAvatarChange}
            className="border border-[#E7C84B] bg-[#E7C84B] px-4 py-3 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#090b0c] transition-all hover:bg-[#fff1a8]"
          >
            {saving ? "Changing..." : "Confirm Change"}
          </button>

        </div>

      </div>

    </div>

  </div>
)}

  </div>
);
}