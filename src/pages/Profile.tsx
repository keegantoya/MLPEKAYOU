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

const avatars = [
  { name: "Avatar 001", file: "avatar001", src: avatar001 },
  { name: "Avatar 002", file: "avatar002", src: avatar002 },
  { name: "Avatar 003", file: "avatar003", src: avatar003 },
  { name: "Avatar 004", file: "avatar004", src: avatar004 },
  { name: "Avatar 005", file: "avatar005", src: avatar005 },
  { name: "Avatar 006", file: "avatar006", src: avatar006 },
  { name: "Avatar 007", file: "avatar007", src: avatar007 },
  { name: "Avatar 008", file: "avatar008", src: avatar008 },
];

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [canChange, setCanChange] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const currentAvatar =
  avatars.find((a) => a.file === avatar) || avatars[0];

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

      <h1 className="text-2xl font-bold mb-6">Profile</h1>

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
            Others can find you in "Other Collectors" by the name set below.
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

          <div className="grid grid-cols-3">
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