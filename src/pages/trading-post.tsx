import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const sets = [
  { id: "1", name: "Eternal Moon First Edition", released: true },
  { id: "2", name: "Eternal Moon Second Edition", released: true },
  { id: "3", name: "Eternal Moon Third Edition", released: false },
  { id: "4", name: "Star First Edition", released: false },
  { id: "5", name: "Rainbow First Edition", released: true },
  { id: "6", name: "Rainbow Second Edition", released: false },
  { id: "7", name: "Fun Moments First Edition", released: true },
  { id: "8", name: "Fun Moments Second Edition", released: false },
  { id: "9", name: "Promos", released: true },
  { id: "10", name: "Serialized & Limited Cards", released: true }
];

const TradingPost = () => {
  const navigate = useNavigate();

  const [discord, setDiscord] = useState("");
  const [savedDiscord, setSavedDiscord] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDiscord = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trading_profiles")
        .select("discord_username")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.discord_username) {
        setSavedDiscord(data.discord_username);
      }
    };

    loadDiscord();
  }, []);

  const handleSaveDiscord = async () => {
    if (!discord.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("trading_profiles")
      .upsert({
        user_id: user.id,
        discord_username: discord.trim()
      });

    if (error) {
      console.error(error);
      alert("Failed to save Discord");
    } else {
      setSavedDiscord(discord.trim());
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Trading Post
          </h1>

          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Enter your Discord username here. You will only be able to do this once.
            It will display beside your username on anything you have for trade so
            that people can find you.
          </p>
        </div>

        {/* DISCORD INPUT */}
        <div className="flex justify-center mb-8">
          {savedDiscord ? (
            <div className="text-sm text-muted-foreground">
              Discord:{" "}
              <span className="font-medium text-foreground">
                {savedDiscord}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Discord username"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-[250px]"
              />

              <button
                onClick={handleSaveDiscord}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* SET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets
  .filter(set => set.released)
  .map((set) => (
            <button
              key={set.id}
              onClick={() => {
                if (set.released) {
                  navigate(`/trading-post/${set.id}`);
                }
              }}
              className={`
                relative w-full rounded-xl border p-4 shadow-sm text-left transition
                ${set.released
                  ? "bg-card hover:shadow-md hover:scale-[1.01] cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
            >

              {/* 🔒 OVERLAY LABEL */}
              {!set.released && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                 <div className="text-black text-base md:text-lg font-extrabold uppercase tracking-wide drop-shadow-sm">
                    {set.id === "8"
                      ? "WAITING FOR FILES FROM KAYOUUS"
                      : "SET NOT YET RELEASED"}
                  </div>
                </div>
              )}

              {/* CONTENT */}
              <div className="font-medium text-sm">
                {set.name}
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                View trades
              </div>

            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TradingPost;