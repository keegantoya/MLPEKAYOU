import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"

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

const getCardImage = (card: any) => {
  const { set_id, rarity, number } = card;

  if (set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
  };

  const c = config[set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;
};

const TradingPost = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
const [results, setResults] = useState<any[]>([]);
const [selectedUser, setSelectedUser] = useState<any | null>(null);

const [userTrades, setUserTrades] = useState<Record<string, Record<string, any[]>>>({});
const [selectedSet, setSelectedSet] = useState<string | null>(null);
const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

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

const handleSearch = async (value: string) => {
  setSearch(value);

  if (value.length < 2) {
    setResults([]);
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", `%${value}%`)
    .limit(10);

  setResults(data || []);
};

const loadUserTrades = async (user: any) => {
  setSelectedUser(user);

  const { data: trades } = await supabase
    .from("for_trade")
    .select("*")
    .eq("user_id", user.id);

  const grouped: Record<string, Record<string, any[]>> = {};

  (trades || []).forEach((card: any) => {
    const [rarity, number] = card.card_key.split("-");

    if (!grouped[card.set_id]) grouped[card.set_id] = {};
    if (!grouped[card.set_id][rarity]) {
      grouped[card.set_id][rarity] = [];
    }

    grouped[card.set_id][rarity].push({
      set_id: card.set_id,
      rarity,
      number: parseInt(number)
    });
  });

  setUserTrades(grouped);
  setSelectedSet(null);
  setSelectedRarity(null);
};

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
    <div
  className="min-h-screen"
  style={{
    backgroundColor: "#f5f5f5",
    backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  }}
>
      <KayouHeader />

      <div className="container py-8">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Trading Post
          </h1>

          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Only people who have their Discord username entered can appear in the Trading Post. Check your profile to set your Discord username.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-6 relative">
  <input
    type="text"
    placeholder="Search traders..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 text-sm"
  />

  {results.length > 0 && (
    <div className="absolute w-full bg-background border rounded-lg mt-1 shadow-lg z-50">
      {results.map((user) => (
        <div
          key={user.id}
          onClick={() => loadUserTrades(user)}
          className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
        >
          {user.username}
        </div>
      ))}
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

        {selectedUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-background p-6 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">

    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">
        {selectedUser.username}'s Trades
      </h2>

      <button
        onClick={() => setSelectedUser(null)}
        className="text-sm text-muted-foreground"
      >
        Close
      </button>
    </div>

    {/* SETS */}
    {!selectedSet && (
      <div className="space-y-2">
        {Object.keys(userTrades).map((setId) => {
          const setInfo = sets.find(s => s.id === setId);

          return (
            <div
              key={setId}
              onClick={() => setSelectedSet(setId)}
              className="border rounded p-3 cursor-pointer hover:bg-accent text-sm"
            >
              {setInfo?.name || setId}
            </div>
          );
        })}
      </div>
    )}

    {/* RARITIES */}
    {selectedSet && !selectedRarity && (
      <div>
        <button
          onClick={() => setSelectedSet(null)}
          className="text-xs mb-3 text-muted-foreground"
        >
          ← Back to Sets
        </button>

        <div className="flex flex-wrap gap-2">
          {Object.keys(userTrades[selectedSet] || {}).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className="px-3 py-1 text-xs border rounded"
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* CARDS */}
    {selectedSet && selectedRarity && (
      <div>
        <button
          onClick={() => setSelectedRarity(null)}
          className="text-xs mb-3 text-muted-foreground"
        >
          ← Back to Rarities
        </button>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
  {(userTrades[selectedSet]?.[selectedRarity] || []).map((card, i) => (
    <img
      key={i}
      src={getCardImage(card)}
      className="w-full rounded-md"
    />
  ))}
</div>
      </div>
    )}

  </div>
  </div>
)}

      </div>
    </div>
  );
};

export default TradingPost;