import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import starlight from "@/assets/avatars/starlight-glimmer.jpg";
import rarity from "@/assets/avatars/rarity.jpg";
import pearButter from "@/assets/avatars/pear-butter.jpg";
import luna from "@/assets/avatars/luna.jpg";
import trixie from "@/assets/avatars/trixie.jpg";

const avatars = [
  { name: "Starlight Glimmer", file: "starlight-glimmer", src: starlight },
  { name: "Rarity", file: "rarity", src: rarity },
  { name: "Pear Butter", file: "pear-butter", src: pearButter },
  { name: "Princess Luna", file: "luna", src: luna },
  { name: "Trixie", file: "trixie", src: trixie },
];

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [canChange, setCanChange] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [showIsoSettings, setShowIsoSettings] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);

        const savedUsername = data.user.user_metadata?.username || "";
        const savedAvatar = data.user.user_metadata?.avatar || "";
        const hasChanged = data.user.user_metadata?.username_locked;

        setUsername(savedUsername);
        setOriginalUsername(savedUsername);
        setAvatar(savedAvatar);
        setCanChange(!hasChanged);

        const { data: profile } = await supabase
          .from("profiles")
          .select("iso_hidden_sets")
          .eq("id", data.user.id)
          .single();

        setHiddenSets(profile?.iso_hidden_sets || []);
      }
    };

    getUser();
  }, []);

  const handleSave = async () => {
    if (!username) return;

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
      iso_hidden_sets: hiddenSets,
    });

    setLoading(false);
    setCanChange(false);
    setOriginalUsername(username);
  };

  const handleAvatarSelect = async (file: string) => {
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

  const toggleSet = (id: string) => {
    if (hiddenSets.includes(id)) {
      setHiddenSets(hiddenSets.filter((s) => s !== id));
    } else {
      setHiddenSets([...hiddenSets, id]);
    }
  };

  const currentAvatar = avatars.find((a) => a.file === avatar);

  if (!user) {
    return <div className="container mx-auto p-6">Please log in</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Profile</h1>

  <div className="relative">
    <button
      onClick={() => setShowIsoSettings(!showIsoSettings)}
      className="text-sm px-3 py-1 rounded-lg border hover:bg-muted"
    >
      Hide Sets
    </button>

    {showIsoSettings && (
      <div className="absolute right-0 mt-2 w-72 bg-background border rounded-xl shadow-lg p-4 z-50">

        <h2 className="font-semibold mb-1">
          Not wanting to collect every set?
        </h2>

        <p className="text-sm text-muted-foreground mb-3">
          Hide unwanted sets from your personal and public ISOs.
        </p>

        {[
          { id: "1", name: "Eternal Moon 1" },
          { id: "2", name: "Eternal Moon 2" },
          { id: "3", name: "Eternal Moon 3" },
          { id: "5", name: "Rainbow 1" },
          { id: "7", name: "Fun Moments 1" }
        ].map((set) => (
          <label key={set.id} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={hiddenSets.includes(set.id)}
              onChange={() => toggleSet(set.id)}
            />
            {set.name}
          </label>
        ))}

      </div>
    )}
  </div>
</div>

      <div className="space-y-6">

        {currentAvatar && (
          <div className="flex justify-center">
            <img
              src={currentAvatar.src}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full border"
            />
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Your username currently is{" "}
            <span className="font-semibold">
              {originalUsername || "Not set yet"}
            </span>
          </p>

          <input
            type="text"
            value={username}
            disabled={!canChange}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <h2 className="font-semibold mb-3">Choose Avatar</h2>

          <div className="grid grid-cols-3 gap-3">
            {avatars.map((a) => (
              <button
                key={a.file}
                onClick={() => handleAvatarSelect(a.file)}
                className={`border rounded-lg p-2 ${
                  avatar === a.file ? "border-primary" : ""
                }`}
              >
                <img src={a.src} className="rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {canChange && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        )}

      </div>
    </div>
  );
};

export default Profile;