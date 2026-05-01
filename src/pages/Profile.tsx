import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import avatar001 from "../assets/avatars/avatar001.jpg";
import avatar002 from "../assets/avatars/avatar002.jpg";
import avatar003 from "../assets/avatars/avatar003.jpg";
import avatar004 from "../assets/avatars/avatar004.jpg";
import avatar005 from "../assets/avatars/avatar005.jpg";
import avatar006 from "../assets/avatars/avatar006.jpg";
import avatar007 from "../assets/avatars/avatar007.jpg";
import avatar008 from "../assets/avatars/avatar008.jpg";
import avatar009 from "../assets/avatars/avatar009.jpg";
import avatar010 from "../assets/avatars/avatar010.jpg";
import avatar011 from "../assets/avatars/avatar011.jpg";
import avatar012 from "../assets/avatars/avatar012.jpg";
import avatar013 from "../assets/avatars/avatar013.jpg";
import avatar014 from "../assets/avatars/avatar014.jpg";
import avatar015 from "../assets/avatars/avatar015.jpg";
import heimantouAvatar from "../assets/avatars/heimantouavatar.png";

const avatars = [
  { name: "Avatar 001", file: "avatar001", src: avatar001 },
  { name: "Avatar 002", file: "avatar002", src: avatar002 },
  { name: "Avatar 003", file: "avatar003", src: avatar003 },
  { name: "Avatar 004", file: "avatar004", src: avatar004 },
  { name: "Avatar 005", file: "avatar005", src: avatar005 },
  { name: "Avatar 006", file: "avatar006", src: avatar006 },
  { name: "Avatar 007", file: "avatar007", src: avatar007 },
  { name: "Avatar 008", file: "avatar008", src: avatar008 },
  { name: "Avatar 009", file: "avatar009", src: avatar009 },
  { name: "Avatar 010", file: "avatar010", src: avatar010 },
  { name: "Avatar 011", file: "avatar011", src: avatar011 },
  { name: "Avatar 012", file: "avatar012", src: avatar012 },
  { name: "Avatar 013", file: "avatar013", src: avatar013 },
  { name: "Avatar 014", file: "avatar014", src: avatar014 },
  { name: "Avatar 015", file: "avatar015", src: avatar015 },
];

const bannedWords = [
  "admin", "administrator", "mod", "moderator", "Owner", "staff", "support",
  "fuck", "shit", "bitch", "asshole", "dick", "cock", "pussy", "vagina",
  "fag", "faggot", "nigger", "nigga", "niglet",
  "rape", "rapist", "molest", "pedo", "pedophile", "epstein", "trump"
];

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [canChange, setCanChange] = useState(true);
  const [loading, setLoading] = useState(false);
  const [discord, setDiscord] = useState("");
  const [savingDiscord, setSavingDiscord] = useState(false);
  const [discordLocked, setDiscordLocked] = useState(false);
  const [isHeiManTou, setIsHeiManTou] = useState(false);

  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(data.user);

      const savedUsername = data.user.user_metadata?.username || "";
      setIsHeiManTou(savedUsername === "HeiManTou (Chinese Collector)");
      const savedAvatar = data.user.user_metadata?.avatar || "";
      const hasChanged = data.user.user_metadata?.username_locked;

      // this is the temporary unlock i implemented //
  setCanChange(true);

setUsername(savedUsername);
setOriginalUsername(savedUsername);
setAvatar(savedAvatar);

      const { data: profileData } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", data.user.id)
        .single();

      if (profileData?.discord_username) {
        setDiscord(profileData.discord_username);
          setDiscordLocked(true);
      }
    }
  };

  getUser();
}, []);

  const handleSave = async () => {
  if (!username) return;

  // ✅ BANNED WORD CHECK
  const lower = username.toLowerCase();

// replace common bypass characters
const normalized = lower
  .replace(/1/g, "i")
  .replace(/3/g, "e")
  .replace(/4/g, "a")
  .replace(/@/g, "a")
  .replace(/0/g, "o")
  .replace(/\$/g, "s");

  const hasBannedWord = bannedWords.some((word) =>
  normalized.includes(word)
);

  if (hasBannedWord) {
    alert("This username contains a restricted word.");
    return;
  }

  setLoading(true);

  await supabase.auth.updateUser({
    data: {
      username,
      avatar,
      username_locked: true,
    },
  });

  await supabase.from("profiles").upsert({
    id: user.id,
    username,
    avatar_url: avatar,
  });

  setLoading(false);
  setCanChange(false);
  setOriginalUsername(username);
};

  const handleAvatarSelect = async (file: string) => {
    if (isHeiManTou) return;
    setAvatar(file);

    await supabase.auth.updateUser({
      data: {
        avatar: file,
      },
    });

    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: file,
    });
  };

  let currentAvatar =
  avatars.find((a) => a.file === avatar) || avatars[0];

if (isHeiManTou) {
  currentAvatar = {
    name: "Hidden Avatar",
    file: "heimantou",
    src: heimantouAvatar,
  };
}

  if (!user) {
    return <div className="container mx-auto p-6">Please log in</div>;
  }

   return (
  <div
    className="min-h-screen"
    style={{
      backgroundColor: "#e9e2f3",
      backgroundSize: "26px 26px",
    }}
  >
    <div className="container mx-auto p-6 max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-10">

  {/* LEFT SIDE */}
  <div className="space-y-6">
    {currentAvatar && (
      <div className="flex justify-center md:justify-start">
        <img
          src={currentAvatar.src}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full border"
        />
      </div>
    )}

    <div>
      <p className="text-sm text-muted-foreground mb-2">
        This is the username that can be used to search for you on the site in searchable fields.
      </p>

      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={username}
          disabled={!canChange}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        {canChange && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">Discord Username</h2>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Enter Discord username"
            value={discord}
            disabled={discordLocked}
            onChange={(e) => setDiscord(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 ${
              discordLocked ? "bg-muted text-muted-foreground cursor-not-allowed" : ""
            }`}
          />

          {!discordLocked && (
            <button
              onClick={async () => {
                if (!discord.trim()) return;

                setSavingDiscord(true);

                await supabase.from("trading_profiles").upsert({
                  user_id: user.id,
                  discord_username: discord.trim(),
                });

                setSavingDiscord(false);
                setDiscordLocked(true);
              }}
              disabled={savingDiscord}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              {savingDiscord ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div>
    <h2 className="font-semibold mb-3">The avatar you choose will display for everyone on MLPEKAYOU.</h2>

    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 justify-items-center">
      {avatars.map((a) => (
        <button
  key={a.file}
  onClick={() => handleAvatarSelect(a.file)}
  className="flex items-center justify-center"
>
  <div
    className={`w-24 h-24 rounded-full overflow-hidden transition-all duration-200
      ${avatar === a.file
        ? "ring-4 ring-[#c4b5fd] scale-105"
        : "hover:scale-105"
      }`}
  >
    <img
      src={a.src}
      className="w-full h-full object-cover"
    />
  </div>
</button>
      ))}
    </div>
  </div>

</div>
        </div>
  </div>
);
};

export default Profile;