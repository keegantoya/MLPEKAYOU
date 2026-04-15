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
    rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1 }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 }
  },
  {
    id: "9",
    name: "Promo Cards",
    rarities: { PR: 5 }
  },
  {
    id: "10",
    name: "Serialized & Limited Cards",
    rarities: { LC: 1 }
  }
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);

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

  const getAvatar = (avatar?: string) => {
    if (!avatar) return avatar001;

    let file = avatar.split("/").pop() || "";
    if (!file.includes(".")) file = `${file}.jpg`;

    return avatarMap[file] || avatar001;
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
                  <div className="font-semibold">
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

      </div>
    </div>
  );
};

export default Leaderboard;