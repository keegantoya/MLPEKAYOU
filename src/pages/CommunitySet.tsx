import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

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

const sets: Record<string, { name: string; total: number }> = {
  "1": { name: "Eternal Moon First Edition", total: 186 },
  "2": { name: "Eternal Moon Second Edition", total: 189 },
  "3": { name: "Eternal Moon Third Edition", total: 290 },
  "4": { name: "Star First Edition", total: 105 },
  "5": { name: "Rainbow First Edition", total: 146 },
  "6": { name: "Rainbow Second Edition", total: 170 },
  "7": { name: "Fun Moments First Edition", total: 127 },
  "8": { name: "Fun Moments Second Edition", total: 136 },
  "9": { name: "Promos", total: 5 }
};

const isoSets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "9",
    name: "Promos",
    folder: "promos",
    prefix: "PR",
    rarities: { PR: 5 }
  }
];

const medals = ["🥇", "🥈", "🥉"];

const CommunitySet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [tradeCards, setTradeCards] = useState<any[]>([]);

  const set = id ? sets[id] : undefined;

  useEffect(() => {
    if (!id || !set) return;

    const load = async () => {

      const { data: progress } = await supabase
        .from("collection_progress")
        .select("*")
        .eq("set_id", id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

      if (!progress || !profiles) return;

      const profileMap: Record<string, any> = {};
      profiles.forEach((p: any) => {
        profileMap[p.id] = p;
      });

      const active: any[] = [];
      const finished: any[] = [];

      progress.forEach((row: any) => {

  const isoSet = isoSets.find(s => s.id === id);
  if (!isoSet) return;

  let owned = 0;
  let total = 0;

  Object.entries(isoSet.rarities).forEach(([rarity, count]) => {
    for (let i = 1; i <= count; i++) {
      total++;

      const key = `${rarity}-${i}`;

      if (row.progress && row.progress[key] === true) {
        owned++;
      }
    }
  });

  const user = {
    id: row.user_id,
    username: profileMap[row.user_id]?.username || "Anonymous",
    avatar: profileMap[row.user_id]?.avatar_url,
    owned,
    updated: row.updated_at
  };

  if (owned === total) finished.push(user);
  else active.push(user);

});

      active.sort((a, b) => b.owned - a.owned);

      finished.sort(
        (a, b) =>
          new Date(a.updated).getTime() - new Date(b.updated).getTime()
      );

      setCollectors(active.slice(0, 30));
      setCompleted(finished.slice(0, 10));

    };

    load();
  }, [id, set]);

  const loadISO = async (user: any) => {
    setSelectedUser(user);

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

  if (!set) return null;

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <button
          onClick={() => navigate("/community")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </button>

        <h1 className="text-2xl font-bold mb-6">
          {set.name} Leaderboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-card border rounded-xl p-4">
            <h2 className="font-semibold mb-4">
              Still Collecting
            </h2>

            <div className="space-y-2">
              {collectors.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>#{index + 1}</span>

                    <img
                      src={getAvatar(user.avatar)}
                      className="w-6 h-6 rounded-full cursor-pointer"
                      onClick={() => loadISO(user)}
                    />

                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => loadISO(user)}
                    >
                      {user.username}
                    </span>
                  </div>

                  <span>
                    {user.owned} / {set.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4">
            <h2 className="font-semibold mb-4">
              Completed Sets
            </h2>

            <div className="space-y-2">
              {completed.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {medals[index] || "🏅"}
                    </span>

                    <img
                      src={getAvatar(user.avatar)}
                      className="w-6 h-6 rounded-full cursor-pointer"
                      onClick={() => loadISO(user)}
                    />

                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => loadISO(user)}
                    >
                      {user.username}
                    </span>
                  </div>
                </div>
              ))}

              {completed.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  No one has completed this set yet
                </div>
              )}
            </div>

          </div>

        </div>

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-background w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 max-h-[70vh] overflow-y-auto">

                <button
                  onClick={() => setSelectedUser(null)}
                  className="mb-6"
                >
                  Close
                </button>

                <h2 className="text-2xl font-bold mb-6">
                  {selectedUser.username}'s ISO
                </h2>

                {isoSets
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

                        <h2 className="text-xl font-semibold mb-4">
                          {set.name}
                        </h2>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">

                          {missing.map((card) => (
                            <img
                              key={`${card.rarity}-${card.number}`}
                              src={`/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`}
                              className="rounded-md"
                            />
                          ))}

                        </div>

                      </div>
                    );

                  })}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunitySet;