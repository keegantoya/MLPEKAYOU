import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import KayouHeader from "@/components/KayouHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  if (!avatar) return starlight;

  let file = avatar.split("/").pop() || "";
  if (!file.includes(".")) file = `${file}.jpg`;

  return avatarMap[file] || starlight;
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

    <h2 className="text-2xl font-bold mb-6">
      {selectedUser.username}'s ISO + Trade
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      <div>

        <h3 className="text-xl font-bold mb-4">
          ISO
        </h3>

        {sets
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
            <div key={set.id} className="mb-10">

              <h3 className="text-xl font-semibold mb-4">
                {set.name}
              </h3>

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

      <div>

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
            if (!set) return null;

            return (
              <div key={setId} className="mb-10">

                <h3 className="text-xl font-semibold mb-4">
                  {set.name}
                </h3>

                <div className="grid grid-cols-4 gap-2">

                  {cards.map((card: any) => {

                    const [rarity, number] = card.card_key.split("-");

                    return (
                      <img
                        key={card.id}
                        src={`/cards/${set.folder}/${set.prefix}${rarity}${String(number).padStart(3,"0")}.jpg`}
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
)}

      </div>
    </div>
  );
};

export default Collectors;