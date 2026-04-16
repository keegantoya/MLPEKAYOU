import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const sets = [
  {
  id: "9",
  name: "Promotional Cards",
  total: 5,
  rarities: { PR: 5}
  },
  {
    id: "1",
    name: "Eternal Moon First Edition",
    total: 186,
    rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }
  },
  {
    id: "5",
    name: "Rainbow First Edition",
    total: 146,
    rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }
  },
  {
    id: "7",
    name: "Fun Moments First Edition",
    total: 127,
    rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }
  },
  {
    id: "2",
    name: "Eternal Moon Second Edition",
    total: 189,
    rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }
  },
  {
  id: "8",
  name: "Fun Moments Second Edition",
  total: 136,
  rarities: {}
  },
  {
    id: "friendship-begins",
    name: "Friendship Begins",
    total: 68,
    rarities: {}
  },
  {
    id: "3",
    name: "Eternal Moon Third Edition",
    total: 290,
    rarities: {}
  },
  {
    id: "11",
    name: "Fun Moments Three",
    total: 148,
    rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR: 9, CR:12, SCR: 12 }
  },
  {
    id: "4",
    name: "Star First Edition",
    total: 105,
    rarities: {}
  },
  {
    id: "6",
    name: "Rainbow Second Edition",
    total: 170,
    rarities: {}
  },
  {
  id: "tcg",
  name: "Fantasy Wonderland",
  total: 191,
  rarities: {}
  },
  {
  id: "10",
  name: "Serialized & Limited Cards",
  total: 1,
  rarities: { LC: 1 }
  },
  ];

const releasedRoutes: Record<string, string> = {
  "1": "/collection/1",
  "2": "/collection/2",
  "5": "/collection/5",
  "7": "/fun-moments-1",
  "9": "/promos",
  "10": "/limited-cards"
};

const MyProgress = () => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: collectionData } = await supabase
        .from("collection_progress")
        .select("*")
        .eq("user_id", user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();

      setHiddenSets(profile?.iso_hidden_sets || []);

      const progressMap = new Map(
        collectionData?.map((row) => [String(row.set_id), row]) || []
      );

      const newProgress: Record<string, number> = {};

      sets.forEach((set) => {
        const found = progressMap.get(set.id);

        if (!found?.progress || !set.rarities) {
          newProgress[set.id] = 0;
          return;
        }

        let owned = 0;

        Object.entries(set.rarities).forEach(([rarity, count]) => {
          for (let i = 1; i <= count; i++) {
            const key = `${rarity}-${i}`;
            if (found.progress[key]) owned++;
          }
        });

        newProgress[set.id] = owned;
      });

      setProgress(newProgress);
    };

    loadProgress();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">
          My Progress
          <p className="text-gray-500 text-sm sm:text-base mb-6">
            Sets that are not released will not be clickable. 
          </p>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => {
            const owned = progress[set.id] || 0;

            const percent =
              set.total > 0
                ? Math.round((owned / set.total) * 100)
                : 0;

            const route = releasedRoutes[set.id];
            const isReleased = !!route;
            const isHidden = hiddenSets.includes(set.id);

            return (
              <div key={set.id} className="relative">

  {isHidden && (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="bg-black/70 text-white text-[10px] sm:text-xs px-2 py-1 rounded-md">
        Not Collecting
      </div>
    </div>
  )}

  <button
    onClick={() => route && navigate(route)}
    className={`
      w-full bg-card rounded-xl border p-4 shadow-sm text-left transition
      ${isReleased
        ? "hover:shadow-md hover:scale-[1.01] cursor-pointer"
        : "opacity-60 cursor-not-allowed"
      }
      ${isHidden ? "opacity-40" : ""}
    `}
  >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">
                      {set.name}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    {owned} / {set.total}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyProgress;