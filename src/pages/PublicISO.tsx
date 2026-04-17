import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  { id: "10", name: "Serialized & Limited Cards", released: true },
];

const setConfigs: Record<string, any> = {
  "1": { rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  "2": { rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 } },
  "5": { rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  "7": { rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  "9": { rarities: { PR: 5 } },
  "10": { rarities: { LC: 1 } }
};

const getCardImage = (card: any) => {
  const { set_id, rarity, number } = card;

  // PROMOS
  if (set_id === "9") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  // SERIALIZED / LIMITED
  if (set_id === "10") {
    return `/serialized-limited-cards/andypricepromo.jpg`;
  }

  // DEFAULT SETS
  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
  };

  const c = config[set_id];
  if (!c) return "";

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

export default function PublicISO() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userISO, setUserISO] = useState<Record<string, Record<string, any[]>>>({});
      const [selectedSet, setSelectedSet] = useState<string | null>(null);
      const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

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

const loadUserISO = async (user: any) => {
  setSelectedUser(user);

  const { data: progress } = await supabase
    .from("collection_progress_raw")
    .select("*")
    .eq("user_id", user.id);

  const isoCards: any[] = [];

  progress?.forEach((row: any) => {
    const config = setConfigs[row.set_id];
    if (!config) return;

    const progressData = row.progress || {};

    const allCards = Object.entries(config.rarities).flatMap(([rarity, count]) =>
      Array.from({ length: count as number }, (_, i) => ({
        rarity,
        number: i + 1,
        set_id: row.set_id
      }))
    );

    allCards.forEach((card) => {
      const key = `${card.rarity}-${card.number}`;
      const value = progressData[key];

      const isOwned =
        value === true ||
        value?.owned === true;

      if (!isOwned) {
        isoCards.push(card);
      }
    });
  });

  const grouped: Record<string, Record<string, any[]>> = {};

isoCards.forEach(card => {
  if (!grouped[card.set_id]) grouped[card.set_id] = {};
  if (!grouped[card.set_id][card.rarity]) {
    grouped[card.set_id][card.rarity] = [];
  }

  grouped[card.set_id][card.rarity].push(card);
});

setUserISO(grouped);
setSelectedSet(null);
setSelectedRarity(null);
};

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          All ISOs
        </h1>

        <p className="text-center text-muted-foreground mb-8">
          Only people who have their Discord username entered can appear in ISOs. Check your profile to set your Discord username.
        </p>

        <div className="max-w-md mx-auto mb-8 relative">
  <input
    type="text"
    placeholder="Search for a user..."
    value={search}
    onChange={(e) => handleSearch(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 text-sm"
  />

  {results.length > 0 && (
    <div className="absolute w-full bg-background border rounded-lg mt-1 shadow-lg z-50">
      {results.map((user) => (
        <div
          key={user.id}
          onClick={() => loadUserISO(user)}
          className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
        >
          {user.username}
        </div>
      ))}
    </div>
  )}
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {sets
  .filter(set => set.released)
  .map((set) => (
            <div
              key={set.id}
              onClick={() => {
                if (set.released) {
                  navigate(`/public-iso/${set.id}`);
                }
              }}
              className={`relative rounded-xl border p-4 cursor-pointer transition
                ${set.released ? "hover:bg-accent" : "opacity-60 cursor-not-allowed"}
              `}
            >
              <div className="font-semibold mb-2">
                {set.name}
              </div>

              <div className="text-sm text-muted-foreground">
                View ISOs
              </div>

              {!set.released && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-black text-lg">
                  SET NOT YET RELEASED
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

      {selectedUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-background p-6 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {selectedUser.username}'s ISO
        </h2>

        <button
          onClick={() => setSelectedUser(null)}
          className="text-sm text-muted-foreground"
        >
          Close
        </button>
      </div>

      {/* LEVEL 1 — SETS */}
{!selectedSet && (
  <div className="grid grid-cols-2 gap-2">
    {Object.keys(userISO).map((setId) => {
      const setInfo = sets.find(s => s.id === setId);

      return (
        <div
          key={setId}
          onClick={() => setSelectedSet(setId)}
          className="border rounded p-3 cursor-pointer hover:bg-accent text-sm"
        >
          {setInfo?.name || `Set ${setId}`}
        </div>
      );
    })}
  </div>
)}

{/* LEVEL 2 — RARITIES */}
{selectedSet && !selectedRarity && (
  <div>
    <button
      onClick={() => setSelectedSet(null)}
      className="text-xs mb-3 text-muted-foreground"
    >
      ← Back to Sets
    </button>

    <div className="flex flex-wrap gap-2">
      {Object.keys(userISO[selectedSet]).map((rarity) => (
        <button
          key={rarity}
          onClick={() => setSelectedRarity(rarity)}
          className="px-3 py-1 text-xs border rounded hover:bg-accent"
        >
          {rarity}
        </button>
      ))}
    </div>
  </div>
)}

{/* LEVEL 3 — CARDS */}
{selectedSet && selectedRarity && (
  <div>
    <button
      onClick={() => setSelectedRarity(null)}
      className="text-xs mb-3 text-muted-foreground"
    >
      ← Back to Rarities
    </button>

    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
  {(userISO[selectedSet]?.[selectedRarity] || []).map((card, i) => (
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
  );
}