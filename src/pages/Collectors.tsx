import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import KayouHeader from "@/components/KayouHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

interface User {
  id: string;
  username: string;
   avatar_url?: string;
}

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
    name: "Rainbow: First Volume",
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
    name: "Fun Moments: First Volume",
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

const Collectors = () => {

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [tradeCards, setTradeCards] = useState<any[]>([]);
  const [view, setView] = useState<"iso" | "trade">("iso");

  const searchUsers = async () => {
    setLoading(true);

    const { data } = await supabase
  .from("profiles")
  .select("id, username, avatar_url")
  .ilike("username", `%${search}%`)
  .limit(20);

    let results = data || [];

    // Remove duplicates by ID
    const unique = Array.from(
      new Map(results.map(user => [user.id, user])).values()
    );

    setUsers(unique);
    setLoading(false);
  };

  const loadISO = async (user: User) => {

  setSelectedUser(user);
  setTradeCards([]);

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
  };

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  const getAvatar = (avatar?: string) => {
  if (!avatar) return avatar001;

  let file = avatar.split("/").pop() || "";
  if (!file.includes(".")) file = `${file}.jpg`;

  return avatarMap[file] || avatar001;
};

  return (
    <div>
      <KayouHeader />

      <div className="container max-w-6xl mx-auto py-10">

        <h1 className="text-3xl font-bold mb-6">
          Other Collectors
        </h1>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button onClick={searchUsers}>
            Search
          </Button>
        </div>

        {loading && <p>Searching...</p>}

        <div className="space-y-3 mb-10">
          {users.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">

  <img
  src={getAvatar(user.avatar_url)}
  className="w-8 h-8 rounded-full"
/>

  <div className="font-medium">
    {user.username}
  </div>

</div>

              <Button
                variant="outline"
                onClick={() => loadISO(user)}
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>

        {selectedUser && (
  <div>

    <div className="flex items-center justify-between mb-6">

  <h2 className="text-2xl font-bold">
    {selectedUser.username}
  </h2>

  <div className="flex gap-2">
    <button
      onClick={() => setView("iso")}
      className={`px-3 py-1 rounded-lg text-sm border ${
        view === "iso"
          ? "bg-primary text-white"
          : "hover:bg-muted"
      }`}
    >
      ISO
    </button>

    <button
      onClick={() => setView("trade")}
      className={`px-3 py-1 rounded-lg text-sm border ${
        view === "trade"
          ? "bg-primary text-white"
          : "hover:bg-muted"
      }`}
    >
      Trade
    </button>
  </div>

</div>
{view === "iso" && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

  <h3 className="text-xl font-bold mb-4">
    ISO
  </h3>

        {sets.map((set) => {

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

          if (hiddenSets.includes(set.id)) return null;

          return (
            <div key={set.id} className="border rounded-xl p-4 bg-card">

              <h3 className="text-xl font-semibold mb-4">
                {set.name}
              </h3>

              <div className="flex flex-wrap gap-2">

                {missing.map((card) => (
                  <img
                    key={`${card.rarity}-${card.number}`}
                    src={
  set.id === "9"
  ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
  : set.id === "10"
  ? `/serialized-limited-cards/andypricepromo.jpg`
    : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
}
                    className="rounded-lg w-[90px]"
                  />
                ))}

              </div>

            </div>
          );

        })}

      </div>
      
)}


{view === "trade" && (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

<h3 className="text-xl font-bold mb-4">
  For Trade
</h3>

        {tradeCards.length === 0 ? (
          <p className="text-muted-foreground text-sm">
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

            const set = sets.find(s => s.id === setId);
if (!set || hiddenSets.includes(set.id)) return null;

            return (
              <div key={setId} className="border rounded-xl p-4 bg-card">

                <h3 className="text-xl font-semibold mb-4">
                  {set.name}
                </h3>

                <div className="flex flex-wrap gap-2">

                  {cards.map((card: any) => {

                    const [rarity, number] = card.card_key.split("-");

                    return (
                      <img
                        key={card.id}
                        src={
   rarity === "PR"
    ? `/promo-cards/mlpepr${String(number).padStart(3,"0")}.jpg`
    : rarity === "LC"
    ? "/serialized-limited-cards/andypricepromo.jpg"
    : `/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3,"0")}.jpg`
}
                        className="rounded-lg w-[90px]"
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
  )}

      </div>
    </div>
  );
};

export default Collectors;