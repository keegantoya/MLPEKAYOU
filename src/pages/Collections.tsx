import { useState, useEffect } from "react";
import KayouHeader from "@/components/KayouHeader";
import CatalogSidebar from "@/components/CatalogSidebar";
import CollectionCard from "@/components/CollectionCard";
import { loadUserProgress } from "@/lib/loadProgress";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import collectionsBanner from "@/assets/avatars/kayouuscollectionsbanner.png";

type Collection = {
  id: string;
  title: string;
  setName: string;
  imageUrl: string;
  totalCards: number;
  category: string;
  progress?: number;
  collectedCards?: number;
  released: boolean;
};

const collections: Collection[] = [
  {
    id: "1",
    title: "Eternal Moon",
    setName: "One",
    imageUrl: "/thumbnails/moon-fe.jpg",
    totalCards: 186,
    category: "eternal-moon",
     released: true,
  },
   {
    id: "5",
    title: "Rainbow",
    setName: "One",
    imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
    totalCards: 146,
    category: "rainbow",
    released: true,
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "One",
    imageUrl: "/thumbnails/fme01TN.jpg",
    totalCards: 127,
    category: "fun-moments",
    released: true,
  },
  {
    id: "2",
    title: "Eternal Moon",
    setName: "Two",
    imageUrl: "/thumbnails/moon-se.jpg",
    totalCards: 189,
    category: "eternal-moon",
    released: true,
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Two",
    imageUrl: "/thumbnails/fme02TN.jpg",
    totalCards: 136,
    category: "fun-moments",
    released: true,
  },
  {
    id: "tcg",
    title: "Fantasy",
    setName: "Wonderland",
    imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "friendshipsbegin",
    title: "Friendships",
    setName: "Begin",
    imageUrl: "/thumbnails/friendship-begins-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
    released: true,
  },
  {
    id: "3",
    title: "Eternal Moon",
    setName: "Three",
    imageUrl: "/thumbnails/moon-te.jpg",
    totalCards: 290,
    category: "eternal-moon",
    released: false,
  },
  {
    id: "11",
    title: "Fun Moments",
    setName: "Three",
    imageUrl: "/thumbnails/fme03TN.jpg",
    totalCards: 148,
    category: "fun-moments",
    released: true,
  },
  {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/s1-thumbnail.jpg",
    totalCards: 105,
    category: "star",
    released: false,
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbow2thumbnail.jpg",
    totalCards: 170,
    category: "rainbow",
    released: false,
  },
  {
    id: "9",
    title: "Promotional",
    setName: "Cards",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 5,
    category: "promos",
    released: true,
  },
  {
    id: "10",
    title: "Limited",
    setName: "Cards",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 1,
    category: "serialized",
    released: true,
  },
  {
  id: "tcgpromos",
  title: "TCG",
  setName: "Promos",
  imageUrl: "/thumbnails/tcgpromosthumbnail.jpg",
  totalCards: 6,
  category: "tcg",
  released: true,
}
];

const unreleasedSetIds = [
  "11", // Fun Moments 3
  "4",  // Star 1
  "3",  // Moon 3
  "tcg", // Fantasy Wonderland
  "friendshipbegins", // Self explanatory
  "6",  // Rainbow 2
];

const Collections = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(
  location.state?.category || "all"
);
  const [sets, setSets] = useState<Collection[]>([]);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    const load = async (userOverride?: any) => {
      let user = userOverride;

if (!user) {
  const { data } = await supabase.auth.getSession();
  user = data.session?.user;
}

      if (!user) {
        setSets(
          collections.map((set) => ({
            ...set,
            progress: 0,
            collectedCards: 0,
          }))
        );
        return;
      }

      const { data: rawData } = await supabase
  .from("collection_progress_raw")
  .select("set_id, progress")
  .eq("user_id", user.id);

const progressMap: Record<string, number> = {};

rawData?.forEach((row: any) => {
  const count = Object.values(row.progress || {}).filter(Boolean).length;

  if (row.set_id === "FW") {
    progressMap["tcg"] = count;
  } else if (row.set_id === "SD") {
    progressMap["friendshipsbegin"] = count;
  } else {
    progressMap[row.set_id] = count;
  }
});

const { data: profile } = await supabase
  .from("profiles")
  .select("iso_hidden_sets")
  .eq("id", user.id)
  .single();

setHiddenSets(profile?.iso_hidden_sets || []);

const updated = collections.map((set) => {
  const collected = progressMap[set.id] || 0;

  const percent =
    set.totalCards > 0
      ? Math.round((collected / set.totalCards) * 100)
      : 0;

  return {
    ...set,
    collectedCards: collected,
    progress: percent,
  };
});

setSets(updated);
    };

    load();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  load(session?.user);
});

    return () => subscription.unsubscribe();
  }, []);

  const filtered =
  (activeCategory === "all"
    ? sets
    : sets.filter((c) => c.category === activeCategory)
  ).filter((c) => c.released);

  return (
    <div
  className="min-h-screen relative overflow-hidden"
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <div className="container py-8 flex gap-8">
  
  {/* Sidebar wrapper */}
  <div className="hidden md:block p-4">
  <CatalogSidebar
    activeCategory={activeCategory}
    onCategoryChange={setActiveCategory}
  />
</div>

  <main className="flex-1">

          <div className="mb-6 relative flex items-center">

  {/* BACK BUTTON (LEFT) */}
  <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
>
  <ArrowLeft className="h-4 w-4 text-[#f5e6a8]" />
  <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
  </span>
</button>

  {/* CENTERED BANNER */}
  <div className="absolute left-1/2 -translate-x-1/2">
  <img
    src={collectionsBanner}
    alt="All Collections"
    className="h-20 md:h-24 lg:h-28 object-contain"
  />
  </div>

  {/* RIGHT SIDE COUNT */}
  <div className="ml-auto text-sm text-[#555] tracking-wide">
    {filtered.length} {filtered.length === 1 ? "set" : "sets"}
  </div>

</div>


  {activeCategory === "all" && (
    <p className="mt-4 mb-6 text-sm md:text-base text-[#555] leading-relaxed">
      Sets will appear here in release order. Promotional cards will always appear at the bottom. If a set is released but not yet available, it is because I am still waiting on Kayou.
    </p>
  )}

          {activeCategory === "limited" ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-yellow-500 text-center max-w-xl leading-relaxed">
                The only serialized or limited card from English My Little Pony Kayou is the signed Andy Price MLPE-PR-005.
                There are no known pictures of this card. Kayou has not sent me a file to upload, and it is likely one does not exist.
                When someone uploads the card, it will be here.
              </p>
            </div>
          ) : (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
  {filtered.map((col) => {
    const isHidden = hiddenSets.includes(col.id);

      const isMastered = col.progress === 100;

    const unreleasedSetIds = [
      "11", // Fun Moments 3
      "4",  // Star 1
      "3",  // Moon 3
      "friendshipbegins",
      "6",  // Rainbow 2
    ];

    const waitingOnKayouIds = [
      
    ];

    const isUnreleased = unreleasedSetIds.includes(col.id);
    const isWaiting = waitingOnKayouIds.includes(col.id);

    return (
      <div key={col.id} className="relative">

        {/* Card */}
        <div
          className={`${
            isUnreleased || isWaiting
              ? "opacity-50 grayscale pointer-events-none"
              : isHidden
              ? "opacity-50 grayscale"
              : ""
          }`}
        >
          <CollectionCard {...col} />
        </div>

        {/* SET HIDDEN */}
{isHidden && !isUnreleased && !isWaiting && (
  <div className="absolute inset-0 flex items-center justify-center translate-y-5 pointer-events-none">
    <div className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] text-xs font-bold px-4 py-2 rounded-lg shadow-md tracking-widest text-center border border-[#d4af37]/60">
      YOU ARE NOT COLLECTING THIS SET
    </div>
  </div>
)}

        {/* WAITING ON KAYOU */}
{(isUnreleased || isWaiting) && (
  <div className="absolute inset-0 flex items-center justify-center translate-y-5 pointer-events-none">
    <div className="bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] text-[#f5e6a8] text-xs font-bold px-4 py-2 rounded-lg shadow-md tracking-widest text-center border border-[#d4af37]/60">
      WAITING ON KAYOU
    </div>
  </div>
)}

        {/* MASTERSET */}
{isMastered && !isHidden && !isUnreleased && !isWaiting && (
  <div className="absolute inset-0 flex items-center justify-center translate-y-5 pointer-events-none">
    <div
  className="text-[11px] sm:text-[10px] md:text-[10px] font-semibold px-7 py-3 sm:px-3 sm:py-1.5 rounded-md shadow tracking-wide text-center flex items-center justify-center border border-[#5a3e84]/50"
  style={{
    background: "linear-gradient(90deg, #f5e6a8 0%, #d4af37 40%, #b8962e 60%, #f5e6a8 100%)",
    color: "#3b2a1a"
  }}
>
  <span className="block text-center w-full">MASTERED</span>
</div>
  </div>
)}

      </div>
    );
  })}
</div>
          )}

        </main>
      </div>

      <footer className="py-4 sm:py-5 text-center text-[10px] sm:text-xs text-black">
        <div className="max-w-lg mx-auto">
          <p>This website is not run or owned by Kayou.</p>

          <p className="text-[7px] sm:text-[8px] italic">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p>
            This is a fan-made collector tool that generates zero profit and will not run ads or promote a subscription.
          </p>

          <img
            src="/logos/collab-logo.png"
            alt="MLPEKAYOU x KAYOU"
            className="mx-auto h-10 sm:h-14 opacity-90"
          />
        </div>
      </footer>

    </div>
  );
};

export default Collections;