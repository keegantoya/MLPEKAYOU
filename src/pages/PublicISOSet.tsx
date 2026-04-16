import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
};

const sets: Record<string, any> = {
  "1": { name: "Eternal Moon First Edition" },
  "2": { name: "Eternal Moon Second Edition" },
  "5": { name: "Rainbow First Edition" },
  "7": { name: "Fun Moments First Edition" },
};

const rarityMap: Record<string, string[]> = {
  "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
  "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
  "5": ["R","SR","FR","TR","SSR","UR"],
  "7": ["N","SN","R","SR","SSR","UR","CR"]
};

export default function PublicISOSet() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [groupedISO, setGroupedISO] = useState<Record<string, TradeCard[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [tradingProfiles, setTradingProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) return;

    const load = async () => {
      setLoading(true);

      const { data: progress } = await supabase
  .from("collection_progress_raw")
  .select("*")
  .eq("set_id", setId)
  .range(0, 5000);
  
console.log("TOTAL ROWS FROM DB:", progress?.length);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username");

      const { data: tradingData } = await supabase
        .from("trading_profiles")
        .select("*");

      const profileMap: Record<string, any> = {};
      (profileData || []).forEach(p => profileMap[p.id] = p);

      const tradingMap: Record<string, string> = {};
      (tradingData || []).forEach(p => tradingMap[p.user_id] = p.discord_username);

      const isoMap: Record<string, TradeCard[]> = {};

      (progress || []).forEach((row: any) => {
        const userId = row.user_id;
        if (!isoMap[userId]) isoMap[userId] = [];

        const progressData = row.progress || {};

        Object.keys(progressData).forEach((key) => {
          if (progressData[key] !== true) {
            isoMap[userId].push({
              id: `${userId}-${row.set_id}-${key}`,
              user_id: userId,
              set_id: row.set_id,
              card_key: key
            });
          }
        });
      });

      setProfiles(profileMap);
      setTradingProfiles(tradingMap);
      setGroupedISO(isoMap);
      setLoading(false);
    };

    load();
  }, [setId]);

  const getCardImage = (card: TradeCard) => {
    const [rarity, number] = card.card_key.split("-");

    const config: any = {
      "1": { folder: "first-edition-moon", prefix: "M1" },
      "2": { folder: "second-edition-moon", prefix: "M2" },
      "5": { folder: "rainbow-one", prefix: "R1" },
      "7": { folder: "fun-moments-one", prefix: "FM1" },
    };

    const c = config[card.set_id];
    if (!c) return "";

    const getRarityCode = (rarity: string) => {
      if (rarity === "SHINING ZR") return "SZR";
      return rarity;
    };

    return `/cards/${c.folder}/${c.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
  };

  const set = setId ? sets[setId] : null;

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/public-iso")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All ISOs
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">
          {set?.name}
        </h1>

        {/* RARITY FILTER */}
        {setId && rarityMap[setId] && (
          <>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {rarityMap[setId].map((rarity) => (
                <button
                  key={rarity}
                  onClick={() =>
                    setSelectedRarity(
                      selectedRarity === rarity ? null : rarity
                    )
                  }
                  className={`px-3 py-1 text-xs border rounded ${
                    selectedRarity === rarity ? "bg-primary text-white" : ""
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>

            {!selectedRarity && (
              <div className="text-center text-sm text-muted-foreground mb-6">
                Choose a rarity to view what users are looking for.
              </div>
            )}
          </>
        )}

        {loading && <div className="text-center">Loading...</div>}

        {!loading && (
          <div className="space-y-6">

            {Object.entries(groupedISO).map(([userId, cards]) => {

              const filteredCards = selectedRarity
  ? cards.filter(c => {
      const [rarity] = c.card_key.split("-");
      return rarity.trim() === selectedRarity;
    })
  : [];

              if (!selectedRarity || filteredCards.length === 0) return null;

              return (
                <div key={userId} className="border rounded-xl p-4 bg-card">

                  <div className="font-semibold mb-1">
                    {profiles[userId]?.username || userId}
                  </div>

                  {tradingProfiles[userId] && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Discord:{" "}
                      <span className="text-foreground font-medium">
                        {tradingProfiles[userId]}
                      </span>
                    </div>
                  )}

                  <div
  className={`grid gap-2 ${
    selectedRarity === "SHINING ZR"
      ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-4"
      : "grid-cols-4 sm:grid-cols-6"
  }`}
>
  {filteredCards
    .sort((a, b) => {
      const numA = parseInt(a.card_key.split("-")[1]);
      const numB = parseInt(b.card_key.split("-")[1]);
      return numA - numB;
    })
    .map((card) => (
      <img
        key={card.id}
        src={getCardImage(card)}
        className={`w-full rounded-md ${
          selectedRarity === "SHINING ZR" ? "max-w-[180px]" : ""
        }`}
      />
    ))}
</div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}