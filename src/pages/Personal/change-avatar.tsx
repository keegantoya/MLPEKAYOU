import { useEffect, useState } from "react";
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
};

export default function ChangeAvatar() {
  const navigate = useNavigate();

  const [currentAvatar, setCurrentAvatar] = useState("avatar001");
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

return (
  <div className="min-h-screen bg-[#171717] text-white">
    <div className="sticky top-0 z-20 flex h-16 items-center border-b border-zinc-800 bg-[#171717] px-4">
      <button
        onClick={() => navigate(-1)}
        className="mr-4 text-3xl"
      >
        ‹
      </button>

      <h1 className="text-xl font-bold">
        Change Avatar
      </h1>
    </div>

    <div className="mx-auto w-full max-w-7xl p-5 md:p-10">

      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 bg-[#232323] p-6 md:p-10">

        <div className="flex flex-col items-center">

          <img
            src={getAvatar(currentAvatar)}
            className="h-32 w-32 rounded-full border-4 border-[#d4af37] md:h-48 md:w-48"
          />

          <h2 className="mt-6 text-2xl font-bold">
            Choose an Avatar
          </h2>

          <p className="mt-2 text-center text-zinc-400">
            Click any avatar below to save it instantly.
          </p>

        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">

          {Object.entries(avatarMap).map(([name]) => (
            <button
              key={name}
              disabled={saving}
              onClick={() => handleAvatarSelect(name)}
              className={`overflow-hidden rounded-3xl transition duration-200 hover:scale-105 ${
                currentAvatar === name
                  ? "ring-4 ring-[#d4af37]"
                  : "border border-zinc-700"
              }`}
            >
              <img
                src={getAvatar(name)}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}

        </div>

      </div>

    </div>
  </div>
);
}