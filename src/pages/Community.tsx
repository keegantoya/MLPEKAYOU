import KayouHeader from "@/components/KayouHeader";
import { useNavigate } from "react-router-dom";
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
  { id: "1", name: "Eternal Moon First Edition", total: 186 },
  { id: "5", name: "Rainbow First Edition", total: 146 },
  { id: "7", name: "Fun Moments First Edition", total: 127 },
  { id: "2", name: "Eternal Moon Second Edition", total: 189 },
  { id: "8", name: "Fun Moments Second Edition", total: 136 },
  { id: "3", name: "Eternal Moon Third Edition", total: 290 },
  { id: "4", name: "Star First Edition", total: 105 },
  { id: "6", name: "Rainbow Second Edition", total: 170 },
];

const manualFirstFinishers: Record<string, { username: string; avatar_url?: string }> = {
  "1": {
    username: "Jacob",
    avatar_url: "avatar003.jpg"
  },
  "2": {
    username: "Jacob",
    avatar_url: "avatar003.jpg"
  },
  "5": {
    username: "Keegan (Owner)",
    avatar_url: "avatar002.jpg"
  }
};

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
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
  };

useEffect(() => {
  setFirstFinishers(manualFirstFinishers);
}, []);

  const loadISO = async (user: any) => {
    

    setSelectedUser(user);
    setView("choice");
    setLoadingHidden(true);

   const { data: progress } = await supabase
  .from("collection_progress_raw")
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

        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Community Leaderboards
          </h1>

          <p className="text-sm text-muted-foreground">
           If you are the first user of MLPEKAYOU to master set a US set, send proof to the owner in the Discord and your image and name will appear on that set. This is done manually, not automatically, to ensure validity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {sets
            .filter((set) => ["1", "2", "5", "7"].includes(set.id))
            .map((set) => (

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

              {firstFinishers[String(set.id)] && (
                <div className="absolute top-3 right-3 flex flex-col items-center">
                  <div className="relative w-14 h-14">

                    <img
                      src={getAvatar(firstFinishers[String(set.id)].avatar_url)}
                      className="w-14 h-14 rounded-full border-2 border-background shadow-lg"
                    />

                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      #1
                    </div>

                  </div>

                  <div className="font-semibold text-xs mt-1 text-center">
                    {firstFinishers[String(set.id)]?.username}
                  </div>

                </div>
              )}

            </button>

          ))}

        </div>
      </div>
    </div>
  );
};

export default Community;