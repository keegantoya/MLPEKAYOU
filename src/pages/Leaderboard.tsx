import KayouHeader from "@/components/KayouHeader";
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
  }
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [loadingHidden, setLoadingHidden] = useState(false);
  const [tradeCards, setTradeCards] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {

      const { data: progress } = await supabase
        .from("collection_progress")
        .select("*");

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*");

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p: any) => {
        profileMap[p.id] = p;
      });

      const totals: Record<string, any> = {};
      const seen: Record<string, boolean> = {};

      progress?.forEach((row: any) => {

        const key = `${row.user_id}-${row.set_id}`;
        if (seen[key]) return;
        seen[key] = true;

        const set = sets.find(s => s.id === row.set_id);
        if (!set) return;

        let owned = 0;

        Object.entries(set.rarities).forEach(([rarity, count]) => {
          for (let i = 1; i <= count; i++) {
            const cardKey = `${rarity}-${i}`;
            if (row.progress?.[cardKey]) {
              owned++;
            }
          }
        });

        const id = row.user_id;

        if (!totals[id]) {
          totals[id] = {
            id,
            username: profileMap[id]?.username || "Anonymous",
            avatar: profileMap[id]?.avatar_url,
            total: 0
          };
        }

        totals[id].total += owned;
      });

      const sorted =
        Object.values(totals)
          .sort((a: any, b: any) => b.total - a.total);

      setLeaders(sorted);
    };

    load();
  }, []);

  const loadISO = async (user: any) => {
    setSelectedUser(user);
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

    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    setTradeCards(trades || []);

    setLoadingHidden(false);
  };

  const getAvatar = (avatar?: string) => {
    if (!avatar) return starlight;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || starlight;
  };

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getTradeImage = (setId: string, cardKey: string) => {
    const [rarity, number] = cardKey.split("-");
    const set = sets.find((s) => s.id === setId);
    if (!set) return null;

    return `/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;
  };

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">
          Top Collectors
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((user, index) => (
            <div
              key={index}
              className="bg-card border rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">

                <div className="font-bold">
                  #{index + 1}
                </div>

                <img
                  src={getAvatar(user.avatar)}
                  className="w-10 h-10 rounded-full"
                />

                <div>
                  <div
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() => loadISO(user)}
                  >
                    {user.username}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {user.total} cards
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="bg-background max-w-6xl mx-auto mt-10 p-6 rounded-xl">

              <button
                onClick={() => setSelectedUser(null)}
                className="mb-6"
              >
                Close
              </button>

              <h2 className="text-2xl font-bold mb-6">
                {selectedUser.username}'s ISO + Trade
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ISO */}
                <div>
                  {!loadingHidden && sets
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

                      if (missing.length === 0) return null;

                      return (
                        <div key={set.id} className="mb-8">

                          <h4 className="text-sm text-muted-foreground mb-2">
                            {set.name}
                          </h4>

                          <div className="grid grid-cols-4 gap-2">

                            {missing.map((card) => (
                              <img
                                key={`${card.rarity}-${card.number}`}
                                src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`}
                                className="rounded-lg"
                              />
                            ))}

                          </div>

                        </div>
                      );

                    })}
                </div>

                {/* TRADE */}
                <div>

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

                      const set = sets.find((s) => s.id === setId);

                      return (
                        <div key={setId} className="mb-8">

                          <h4 className="text-sm text-muted-foreground mb-2">
                            {set?.name || "Unknown Set"}
                          </h4>

                          <div className="grid grid-cols-4 gap-2">

                            {cards.map((card: any) => {
                              const img = getTradeImage(card.set_id, card.card_key);
                              if (!img) return null;

                              return (
                                <img
                                  key={card.id}
                                  src={img}
                                  className="rounded-lg"
                                />
                              );
                            })}

                          </div>

                        </div>
                      );
                    })
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;