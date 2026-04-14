import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import avatar001 from "@/assets/avatars/avatar001.jpg";
import avatar002 from "@/assets/avatars/avatar002.jpg";
import avatar003 from "@/assets/avatars/avatar003.jpg";
import avatar004 from "@/assets/avatars/avatar004.jpg";
import avatar005 from "@/assets/avatars/avatar005.jpg";
import avatar006 from "@/assets/avatars/avatar006.jpg";
import avatar007 from "@/assets/avatars/avatar007.jpg";
import avatar008 from "@/assets/avatars/avatar008.jpg";

const avatarMap: Record<string, string> = {
  "avatar001.jpg": avatar001,
  "avatar002.jpg": avatar002,
  "avatar003.jpg": avatar003,
  "avatar004.jpg": avatar004,
  "avatar005.jpg": avatar005,
  "avatar006.jpg": avatar006,
  "avatar007.jpg": avatar007,
  "avatar008.jpg": avatar008,
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
  },
  {
  id: "9",
  name: "Promo Cards",
  folder: "promo-cards",
  prefix: "PR",
  rarities: {
    PR: 5
  }
},
{
  id: "10",
  name: "Serialized & Limited Cards",
  folder: "serialized-limited-cards",
  prefix: "LC",
  rarities: {
    LC: 1
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
  const [view, setView] = useState<"choice" | "iso" | "trade">("choice");

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

    const { data: trades } = await supabase
      .from("for_trade")
      .select("*")
      .eq("user_id", user.id);

    setTradeCards(trades || []);

    setLoadingHidden(false);
  };

  const getAvatar = (avatar?: string) => {
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
  };

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getTradeImage = (setId: string, cardKey: string) => {
  const [rarity, number] = cardKey.split("-");
  const set = sets.find((s) => s.id === setId);

  // PROMOS
  if (rarity === "PR") {
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }
  // LIMITED
if (rarity === "LC") {
  return "/serialized-limited-cards/andypricepromo.jpg";
}

  if (!set) return null;

  return `/cards/${set.folder}/${set.prefix}${getRarityCode(rarity)}${String(number).padStart(3, "0")}.jpg`;
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

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

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
            <div key={set.id} className="border rounded-xl p-4 bg-card">

              <h4 className="text-sm text-muted-foreground mb-3">
                {set.name}
              </h4>

              <div className="flex flex-wrap gap-1">

                {missing.map((card) => (
                  <img
                    key={`${card.rarity}-${card.number}`}
                    src={
                      set.id === "9"
                        ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
                        : set.id === "10"
                        ? "/serialized-limited-cards/andypricepromo.jpg"
                        : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
                    }
                    className="rounded-md w-[90px]"
                  />
                ))}

              </div>

            </div>
          );

        })}

    </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {Object.entries(
          tradeCards.reduce((acc: any, card: any) => {
            if (!acc[card.set_id]) acc[card.set_id] = [];
            acc[card.set_id].push(card);
            return acc;
          }, {})
        ).map(([setId, cards]: any) => {

          const set = sets.find((s) => s.id === setId);

          return (
            <div key={setId} className="border rounded-xl p-4 bg-card">

              <h4 className="text-sm text-muted-foreground mb-3">
                {set?.name || "Unknown Set"}
              </h4>

              <div className="flex flex-wrap gap-1">

                {cards.map((card: any) => {
                  const img = getTradeImage(card.set_id, card.card_key);
                  if (!img) return null;

                  return (
                    <img
                      key={card.id}
                      src={img}
                      className="rounded-md w-[90px]"
                    />
                  );
                })}

              </div>

            </div>
          );
        })}

      </div>
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

export default Leaderboard;