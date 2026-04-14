import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import starlight from "@/assets/avatars/starlight-glimmer.jpg";
import rarity from "@/assets/avatars/rarity.jpg";
import pearButter from "@/assets/avatars/pear-butter.jpg";
import luna from "@/assets/avatars/luna.jpg";
import trixie from "@/assets/avatars/trixie.jpg";

const avatarMap: Record<string, string> = {
  "starlight-glimmer.jpg": starlight,
  "rarity.jpg": rarity,
  "pear-butter.jpg": pearButter,
  "luna.jpg": luna,
  "trixie.jpg": trixie
};

const sets = [
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "5", name: "Rainbow First Edition", total: 146 },
  { id: "6", name: "Rainbow Second Edition", total: 170 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "9", name: "Promos", total: 5 },
  { id: "10", name: "Serialized & Limited Cards", total: 1 }
];

const isoSets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7
    }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1
    }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7
    }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12
    }
  },
  {
  id: "9",
  name: "Promos",
  folder: "promo-cards",
  prefix: "PR",
  rarities: { PR: 5 }
},
{
  id: "10",
  name: "Serialized & Limited Cards",
  folder: "serialized-limited-cards",
  prefix: "LC",
  rarities: { LC: 1 }
}
];

const Community = () => {

  const navigate = useNavigate();

  const [firstFinishers, setFirstFinishers] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [loadingHidden, setLoadingHidden] = useState(false);
  const [tradeCards, setTradeCards] = useState<any[]>([]);
  const [view, setView] = useState<"choice" | "iso" | "trade">("choice");
  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getTradeImage = (setId: string, cardKey: string) => {
  const [rarity, number] = cardKey.split("-");
  const set = isoSets.find((s) => s.id === setId);

  // PROMOS
  if (rarity === "PR") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (!set) return null;

  return `/cards/${set.folder}/${set.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
};

  const getAvatar = (avatar?: string) => {
    if (!avatar) return starlight;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || starlight;
  };

  useEffect(() => {
    const load = async () => {

const blockedFirstFinishers = {
  "1": ["HeiManTou"],
  "2": ["HeiManTou"],
  "3": ["HeiManTou"],
  "4": ["HeiManTou"],
  "5": ["HeiManTou"],
  "6": ["HeiManTou"],
  "7": ["HeiManTou"],
  "8": ["HeiManTou"],
  "9": ["HeiManTou"],
  "tcg": ["HeiManTou"],
  "friendship-begins": ["HeiManTou"]
};

      const { data: progress } = await supabase
        .from("collection_progress")
        .select("*")
        .order("updated_at", { ascending: true });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      if (!progress || !profiles) return;

      const profileMap: Record<string, any> = {};

      profiles.forEach((p: any) => {
        profileMap[p.id] = p;
      });

      const first: Record<string, any> = {};

      progress.forEach((row: any) => {

        const set = isoSets.find(s => s.id === row.set_id);
        if (!set) return;

        let owned = 0;
        let total = 0;

        Object.entries(set.rarities).forEach(([rarity, count]) => {
          for (let i = 1; i <= count; i++) {
            total++;

            const key = `${rarity}-${i}`;

            if (row.progress && row.progress[key] === true) {
              owned++;
            }
          }
        });

        const profile = profileMap[row.user_id];

if (
  owned === total &&
  !first[row.set_id] &&
  !blockedFirstFinishers[row.set_id]?.includes(profile?.username)
) {
  first[row.set_id] = {
    ...profile
  };
}

      });

      setFirstFinishers(first);

    };

    load();

  }, []);

  const loadISO = async (user: any) => {
    

    setSelectedUser(user);
    setView("choice");
    setLoadingHidden(true);

    const { data: progress } = await supabase
      .from("collection_progress")
      .select("*")
      .eq("user_id", user.id);

    const allOwned: Record<string, boolean> = {};

    progress?.forEach((set: any) => {
      Object.entries(set.progress || {}).forEach(([key, value]) => {
        if (value) {
          allOwned[`${set.set_id}-${key}`] = true;
        }
      });
    });

    setOwned(allOwned);

    const { data: profile } = await supabase
      .from("profiles")
      .select("iso_hidden_sets")
      .eq("id", user.id)
      .single();

    setHiddenSets(profile?.iso_hidden_sets || []);
    setLoadingHidden(false);

    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    setTradeCards(trades || []);
  };

  return (
    <div className="min-h-screen bg-background">

      <KayouHeader />

      <div className="container py-8">

        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Community Leaderboards
          </h1>

          <p className="text-sm text-muted-foreground">
            Those who are the first registered on MLPEKAYOU to complete a set are granted their name and chosen avatar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {sets.map((set) => (

            <button
              key={set.id}
              onClick={() => navigate(`/community/${set.id}`)}
              className="relative bg-card border rounded-xl p-5 shadow-sm text-left hover:border-primary hover:shadow-md transition"
            >

              <h2 className="font-semibold mb-2">
                {set.name}
              </h2>

              <div className="text-sm text-muted-foreground">
                View leaderboard →
              </div>

              {firstFinishers[set.id] && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    loadISO(firstFinishers[set.id]);
                  }}
                  className="absolute top-3 right-3 flex flex-col items-center cursor-pointer"
                >
                  <div className="relative w-14 h-14">

                    <img
                      src={getAvatar(firstFinishers[set.id].avatar_url)}
                      className="w-14 h-14 rounded-full border-2 border-background shadow-lg"
                    />

                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      #1
                    </div>

                  </div>

                  <div className="font-semibold text-xs mt-1 text-center">
                    {firstFinishers[set.id].username}
                  </div>

                </div>
              )}

            </button>

          ))}

        </div>

        {/* MODAL */}
{selectedUser && (

<div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
  <div className="bg-background max-w-3xl mx-auto mt-16 p-4 rounded-xl shadow-lg">

    <div className="sticky top-0 z-50 bg-background py-3 mb-4 border-b flex justify-end">
  <button
    onClick={() => setSelectedUser(null)}
    className="text-muted-foreground hover:text-foreground text-sm font-medium"
  >
    ✕ Close
  </button>
</div>

    <h2 className="text-2xl font-bold mb-6">
      {selectedUser.username}
    </h2>

    {view === "choice" && (
      <div className="flex flex-col gap-4">

        <button
          onClick={() => setView("iso")}
          className="border rounded-lg p-4 hover:bg-muted"
        >
          This User's ISO
        </button>

        <button
          onClick={() => setView("trade")}
          className="border rounded-lg p-4 hover:bg-muted"
        >
          This User's Cards For Trade
        </button>

      </div>
    )}

    <div>

      {view === "iso" && (
        <div>

          <button
            onClick={() => setView("choice")}
            className="mb-4 text-sm underline"
          >
            ← Back
          </button>

          <h3 className="text-lg font-bold mb-4">
            ISO
          </h3>

          {!loadingHidden && isoSets
            .filter(s => !hiddenSets.includes(s.id))
            .map((set) => {

              const cards = Object.entries(set.rarities).flatMap(([rarity, count]) =>
                Array.from({ length: count as number }, (_, i) => ({
                  rarity,
                  number: i + 1
                }))
              );

              const missing = cards.filter(card => {
                const key = `${card.rarity}-${card.number}`;
                return !owned[`${set.id}-${key}`];
              });

              if (!missing.length) return null;

              return (
                <div key={set.id} className="mb-8">

                  <h4 className="text-sm text-muted-foreground mb-2">
                    {set.name}
                  </h4>

                  <div className="grid grid-cols-5 md:grid-cols-6 gap-1">

                    {missing.map(card => (
                      <img
                        key={`${card.rarity}-${card.number}`}
                        src={
  set.id === "9"
    ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
    : set.id === "10"
    ? "/serialized-limited-cards/andypricepromo.jpg"
    : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
}
                        className="rounded-md w-full"
                      />
                    ))}

                  </div>

                </div>
              );

            })}
        </div>
      )}

      {view === "trade" && (
        <div>

          <button
            onClick={() => setView("choice")}
            className="mb-4 text-sm underline"
          >
            ← Back
          </button>

          <h3 className="text-lg font-bold mb-4">
            FOR TRADE
          </h3>

          {tradeCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cards listed for trade.
            </p>
          ) : (
            Object.entries(
              tradeCards.reduce((acc: any, card: any) => {
                if (!acc[card.set_id]) acc[card.set_id] = [];
                acc[card.set_id].push(card);
                return acc;
              }, {})
            ).map(([setId, cards]: any) => {

              const set = isoSets.find((s) => s.id === setId);

              return (
                <div key={setId} className="mb-8">

                  <h4 className="text-sm text-muted-foreground mb-2">
                    {set?.name || "Unknown Set"}
                  </h4>

                  <div className="grid grid-cols-5 md:grid-cols-6 gap-1">

                    {cards.map((card: any) => {
                      const img = getTradeImage(card.set_id, card.card_key);
                      if (!img) return null;

                      return (
                        <img
                          key={card.id}
                          src={img}
                          className="rounded-md w-full"
                        />
                      );
                    })}

                  </div>

                </div>
              );
            })
          )}

        </div>
      )}

    </div>

  </div>
</div>

)}

      </div>
    </div>
  );
};

export default Community;