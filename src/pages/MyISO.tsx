import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7
    }
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, "SHINING ZR": 1
    }
  },
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7
    }
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12
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

const MyISO = () => {
  const [username, setUsername] = useState("");
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      setUserId(user.id);
      setUsername(user.user_metadata?.username || "My");

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
    };

    load();
  }, []);

  const toggleSet = async (setId: string) => {
    if (!userId) return;

    const updated = hiddenSets.includes(setId)
      ? hiddenSets.filter(id => id !== setId)
      : [...hiddenSets, setId];

    setHiddenSets(updated);

    await supabase
      .from("profiles")
      .update({ iso_hidden_sets: updated })
      .eq("id", userId);
  };

  const getRarityCode = (rarity: string) => {
    if (rarity === "SHINING ZR") return "SZR";
    return rarity;
  };

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {username}'s ISO
          </h1>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-sm px-3 py-1 rounded-lg border hover:bg-muted"
            >
              Hide Sets
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-background border rounded-xl shadow-lg p-4 z-50">

                <h2 className="font-semibold mb-1">
                  Not wanting to collect every set?
                </h2>

                <p className="text-sm text-muted-foreground mb-3">
                  Hide unwanted sets from your personal and public ISOs.
                </p>

                <div className="space-y-2">
                  {sets.map(set => (
                    <label key={set.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hiddenSets.includes(set.id)}
                        onChange={() => toggleSet(set.id)}
                      />
                      {set.name}
                    </label>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ✅ GRID FIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {sets
            .filter(set => !hiddenSets.includes(set.id))
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

                  <h2 className="text-sm md:text-base font-semibold mb-2">
                    {set.name}
                  </h2>

                  <div className="flex flex-wrap gap-2">

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
                        className="rounded-lg w-[90px]"
                      />
                    ))}

                  </div>

                </div>
              );

            })}

        </div>

      </div>
    </div>
  );
};

export default MyISO;