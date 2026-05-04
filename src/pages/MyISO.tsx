import KayouHeader from "@/components/KayouHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import myProgressBadge from "@/assets/avatars/personaliso.png";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

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
  id: "8",
  name: "Fun Moments Second Edition",
  folder: "fun-moments-two",   
  prefix: "FM2",               
  total: 136,
  rarities: { N: 20, SN: 20, R:35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 }
},
{
  id: "SD_STARTERS",
  name: "Friendships Begin — Starter Decks"
},
{
  id: "SD_BONUS",
  name: "Friendships Begin — Bonus Packs"
},
{
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasywonderland",
  prefix: "BP01",
  total: 191
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
const [hiddenSetsCCG, setHiddenSetsCCG] = useState<string[]>([]);
const [hiddenSetsTCG, setHiddenSetsTCG] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
const [mode, setMode] = useState<string>("CCG");

  useEffect(() => {
  const load = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }
    if (!user) {
      setUserId(null);
      setOwned({});
      setHiddenSetsCCG([]);
setHiddenSetsTCG([]);
      setUsername("My");
      setLoading(false);
      return;
    }
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

    const { data: fwProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "FW");

const fwRow = fwProgress?.[0];

if (fwRow?.progress) {
  Object.entries(fwRow.progress).forEach(([key, value]) => {
    if (value) {
      allOwned[`FW-${key}`] = true;
    }
  });
}

    setOwned(allOwned);

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets, iso_hidden_sets_ccg, iso_hidden_sets_tcg")
  .eq("id", user.id)
  .single();

const p = profile as any;

const global = p?.iso_hidden_sets || [];

setHiddenSetsCCG(global);
setHiddenSetsTCG(global);

    setLoading(false);
  };

  // initial load
  load();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    load(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

const toggleSet = async (setId: string) => {
  if (!userId) return;

  const current = mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG;
  const setter = mode === "CCG" ? setHiddenSetsCCG : setHiddenSetsTCG;

  const updated = current.includes(setId)
    ? current.filter(id => id !== setId)
    : [...current, setId];

  setter(updated);

await supabase
  .from("profiles")
  .update({
    ...(mode === "CCG"
      ? {
          iso_hidden_sets_ccg: updated,
          iso_hidden_sets: updated
        }
      : {
          iso_hidden_sets_tcg: updated,
          iso_hidden_sets: updated
        })
  })
  .eq("id", userId);
};

const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  return (
    <div
  className="min-h-screen"
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="flex flex-col items-center justify-center mb-8 gap-3 text-center">
  
<div className="flex flex-col items-center">
    <img
  src={myProgressBadge}
  alt="Personal ISO"
  className="mx-auto h-14 sm:h-16 md:h-20 object-contain"
/>
    
    <div className="flex justify-center gap-2 mt-2">
  <button
    onClick={() => setMode("CCG")}
    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
      mode === "CCG"
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84]"
    }`}
  >
    CCG
  </button>

  <button
    onClick={() => setMode("TCG")}
    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
      mode === "TCG"
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84]"
    }`}
  >
    TCG
  </button>
</div>
  
  </div>

  <div className="relative">
    <button
  onClick={() => setShowDropdown(!showDropdown)}
  className="whitespace-nowrap text-sm px-4 py-1.5 rounded-lg 
             bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] 
             text-[#f5e6a8] font-semibold 
             border border-[#d4af37]/60 
             shadow-sm hover:shadow-md hover:scale-[1.02] 
             transition"
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
                 {sets.filter(set =>
  mode === "CCG"
    ? ["1","2","5","7","8","9","10"].includes(set.id)
    : ["SD_STARTERS","SD_BONUS","FW"].includes(set.id)
).map(set => (
                    <label key={set.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(mode === "CCG" ? hiddenSetsCCG : hiddenSetsTCG).includes(set.id)}
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
<div>
  {loading ? (
    <div className="text-center py-10 text-muted-foreground">
      Loading your ISO...
    </div>
  ) : (
  <>

  {mode === "TCG" && (
  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      TCG Promos
    </h2>

    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }, (_, i) => {
        const num = i + 1;
        const key = `RR${String(num).padStart(2, "0")}`;
        const stateKey = `PR-${key}`;

        if (owned[stateKey]) return null;

        return (
          <div key={key} className="relative w-[90px]">
            <img
              src={`/tcgpromos/${key}.png`}
              className="rounded-lg w-full"
            />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={watermark}
                  className="absolute opacity-20 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
                  style={{ top: `${i * 25 - 20}%` }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
  {/* STARTER DECKS */}
{mode === "TCG" && !hiddenSetsTCG.includes("SD_STARTERS") && (
    <div className="border rounded-xl p-4 bg-card mb-6">
      <h2 className="text-sm md:text-base font-semibold mb-3">
        Friendships Begin — Starter Decks
      </h2>

      <div className="flex flex-wrap gap-4 justify-center">
        {[
          { code: "SD01A", src: "/starter-decks-boxes/SDTWILIGHT.png" },
          { code: "SD01B", src: "/starter-decks-boxes/SDFLUTTERSHY.png" },
          { code: "SD01C", src: "/starter-decks-boxes/SDPINKIEPIE.png" },
          { code: "SD01D", src: "/starter-decks-boxes/SDAPPLEJACK.png" },
          { code: "SD01E", src: "/starter-decks-boxes/SDRAINBOWDASH.png" },
          { code: "SD01F", src: "/starter-decks-boxes/SDRARITY.png" },
        ].map((deck) => {
          let complete = true;

          for (let i = 1; i <= 21; i++) {
            if (!owned[`SD-${deck.code}-${i}`]) {
              complete = false;
              break;
            }
          }

          if (complete) return null;

          return (
            <img
              key={deck.code}
              src={deck.src}
              className="h-20 sm:h-24 object-contain rounded-xl opacity-90"
            />
          );
        })}
      </div>
    </div>
  )}

 {/* BONUS PACKS */}
{mode === "TCG" && !hiddenSetsTCG.includes("SD_BONUS") && (
  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Bonus Packs
    </h2>

    <div className="flex flex-wrap gap-2">
      {[
        { prefix: "SD01C", count: 9 },
        { prefix: "SD01U", count: 7 },
        { prefix: "SD01SR", count: 6 },
        { prefix: "SD01SPR", count: 10 },
        { prefix: "SD01GR", count: 6 },
        { prefix: "SD01CR", count: 6 },
        { prefix: "SD01ER", count: 6 },
        { prefix: "SD01PER", count: 12 },
        { prefix: "SD01PRR", count: 6 },
      ].flatMap(({ prefix, count }) =>
        Array.from({ length: count }, (_, i) => {
          let actualIndex = i + 1;

          if (prefix === "SD01PER") {
            actualIndex = i + 7;
            if (actualIndex > 16) return null;
          }

          const num = String(actualIndex).padStart(2, "0");
          const key = `${prefix}${num}`;
          const stateKey = `SD-${key}`;

          if (owned[stateKey]) return null;

          return (
            <div key={key} className="relative w-[90px]">
              <img
                src={`/friendships-begin/${key}.png`}
                className="rounded-lg w-full"
              />

              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={watermark}
                    className="absolute opacity-20 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
                    style={{ top: `${i * 25 - 20}%` }}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}


{mode === "TCG" && !hiddenSetsTCG.includes("FW") && (
  <div className="border rounded-xl p-4 bg-card mb-6">
    <h2 className="text-sm md:text-base font-semibold mb-3">
      Fantasy Wonderland
    </h2>

    <div className="flex flex-wrap gap-2">
      {[
        { prefix: "BP01C", count: 48 },
        { prefix: "BP01U", count: 18 },
        { prefix: "BP01ER", count: 6 },
        { prefix: "BP01SR", count: 14 },
        { prefix: "BP01SPR", count: 28 },
        { prefix: "BP01GR", count: 12 },
        { prefix: "BP01CR", count: 12 },
        { prefix: "BP01RR", count: 6 },
        { prefix: "BP01PER", count: 6 },
        { prefix: "BP01PSPR", count: 11 },
        { prefix: "BP01PGR", count: 6 },
        { prefix: "BP01PCR", count: 12 },
        { prefix: "BP01PRR", count: 6 },
      ].flatMap(({ prefix, count }) =>
        Array.from({ length: count }, (_, i) => {
          const key = `${prefix}${String(i + 1).padStart(2, "0")}`;

          if (owned[`FW-${key}`]) return null;

          return (
            <div key={key} className="relative w-[90px]">
              <img
                src={`/cards/fantasywonderland/${key}.jpg`}
                className="rounded-lg w-full"
              />

              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={watermark}
                    className="absolute opacity-20 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
                    style={{ top: `${i * 25 - 20}%` }}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

  {/* MAIN GRID */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
   {sets
.filter(set =>
  mode === "CCG" &&
  !hiddenSetsCCG.includes(set.id) &&
  set.rarities
)
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
                <div
                  key={`${card.rarity}-${card.number}`}
                  className="relative w-[90px]"
                >
                  <img
                    src={
                      set.id === "9"
                        ? `/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`
                        : set.id === "10"
                        ? "/serialized-limited-cards/andypricepromo.jpg"
                        : `/cards/${set.folder}/${set.prefix}${getRarityCode(card.rarity)}${String(card.number).padStart(3,"0")}.jpg`
                    }
                    className="rounded-lg w-full"
                  />

                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={watermark}
                        className="absolute opacity-20 rotate-[-25deg] w-[140%] left-1/2 -translate-x-1/2"
                        style={{ top: `${i * 25 - 20}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
  </div>
</>
)}
</div>
  
          
        </div>

      </div>
  );
};

export default MyISO;