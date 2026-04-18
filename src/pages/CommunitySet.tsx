import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

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

const sets: Record<string, { name: string; total: number }> = {
  "1": { name: "Eternal Moon First Edition", total: 186 },
  "2": { name: "Eternal Moon Second Edition", total: 189 },
  "3": { name: "Eternal Moon Third Edition", total: 290 },
  "4": { name: "Star First Edition", total: 105 },
  "5": { name: "Rainbow First Edition", total: 146 },
  "6": { name: "Rainbow Second Edition", total: 170 },
  "7": { name: "Fun Moments First Edition", total: 127 },
  "8": { name: "Fun Moments Second Edition", total: 136 }
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
  }
];

const medals = ["🥇", "🥈", "🥉"];
const forcedStillCollecting = ["HeiManTou"];

const manualPlacements: Record<string, string[]> = {
  "2": ["Jacob", "Mari", "Silly Pony", "Keegan (Owner)"] // order = 1st, 2nd, 3rd...
};

const CommunitySet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [tradeCards, setTradeCards] = useState<any[]>([]);
  const [view, setView] = useState<"choice" | "iso" | "trade">("choice");

  const set = id ? sets[id] : undefined;

  useEffect(() => {
    if (!id || !set) return;

    const load = async () => {

      const { data: progress } = await supabase
        .from("collection_progress_raw")
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

  Object.entries(isoSet.rarities).forEach(([rarity, count]) => {
    for (let i = 1; i <= count; i++) {

      const key = `${rarity}-${i}`;
      const value = row.progress?.[key];

      const isOwned =
        value === true ||
        value?.owned === true;

      if (isOwned) {
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

  const actualTotal = set.total;

  if (forcedStillCollecting.includes(user.username)) {
    active.push(user);
  } else if (owned === actualTotal) {
    finished.push(user);
  } else {
    active.push(user);
  }

});

// ✅ THIS WAS BROKEN — NOW FIXED
active.sort((a, b) => {
  if (forcedStillCollecting.includes(a.username)) return -1;
  if (forcedStillCollecting.includes(b.username)) return 1;
  return b.owned - a.owned;
});

// ✅ completed sort
if (manualPlacements[id || ""]) {

  const manualOrder = manualPlacements[id || ""];

  finished.sort((a, b) => {

    const aIndex = manualOrder.indexOf(a.username);
    const bIndex = manualOrder.indexOf(b.username);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return new Date(a.updated).getTime() - new Date(b.updated).getTime();
  });

} else {

  finished.sort(
    (a, b) =>
      new Date(a.updated).getTime() - new Date(b.updated).getTime()
  );

}

setCollectors(active.slice(0, 30));
setCompleted(finished.slice(0, 10));
      setCompleted(finished.slice(0, 10));

    };

    load();
  }, [id, set]);

  const loadISO = async (user: any) => {
    setSelectedUser(user);
    setView("choice");

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
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
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

        <h1 className="text-2xl font-bold">
  {set.name} Leaderboard
</h1>

<p className="text-sm text-muted-foreground mb-6">
  This page only shows the top 30 collectors closest to completing the set, and those who have completed it already.
</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-card border rounded-xl p-4 relative overflow-visible">
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
  className="w-6 h-6 rounded-full"
/>

        <span>
  {user.username}
</span>
      </div>

      <div className="relative">

        <span>
  {user.owned} / {set.total}
</span>
      </div>
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
  className="w-6 h-6 rounded-full"
/>

                    <span>
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

      </div>
    </div>
  );
};

export default CommunitySet;