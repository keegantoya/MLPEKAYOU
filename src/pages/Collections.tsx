import { useState, useEffect } from "react";
import KayouHeader from "@/components/KayouHeader";
import CatalogSidebar from "@/components/CatalogSidebar";
import CollectionCard from "@/components/CollectionCard";
import { loadUserProgress } from "@/lib/loadProgress";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Collection = {
  id: string;
  title: string;
  setName: string;
  imageUrl: string;
  totalCards: number;
  category: string;
  progress?: number;
  collectedCards?: number;
};

const collections: Collection[] = [
  {
    id: "1",
    title: "Eternal Moon",
    setName: "One",
    imageUrl: "/thumbnails/moon-fe.jpg",
    totalCards: 186,
    category: "eternal-moon",
  },
   {
    id: "5",
    title: "Rainbow",
    setName: "One",
    imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
    totalCards: 146,
    category: "rainbow",
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "One",
    imageUrl: "/thumbnails/fme01TN.jpg",
    totalCards: 127,
    category: "fun-moments",
  },
  {
    id: "2",
    title: "Eternal Moon",
    setName: "Two",
    imageUrl: "/thumbnails/moon-se.jpg",
    totalCards: 189,
    category: "eternal-moon",
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Two",
    imageUrl: "/thumbnails/fme02TN.jpg",
    totalCards: 136,
    category: "fun-moments",
  },
  {
    id: "tcg",
    title: "Fantasy",
    setName: "Wonderland",
    imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
  },
  {
    id: "friendship-begins",
    title: "Friendship",
    setName: "Begins",
    imageUrl: "/thumbnails/friendship-begins-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
  },
  {
    id: "3",
    title: "Eternal Moon",
    setName: "Three",
    imageUrl: "/thumbnails/moon-te.jpg",
    totalCards: 290,
    category: "eternal-moon",
  },
  {
    id: "11",
    title: "Fun Moments",
    setName: "Three",
    imageUrl: "/thumbnails/fme03TN.jpg",
    totalCards: 148,
    category: "fun-moments",
  },
  {
    id: "4",
    title: "Star",
    setName: "One",
    imageUrl: "/thumbnails/s1-thumbnail.jpg",
    totalCards: 105,
    category: "star",
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Two",
    imageUrl: "/thumbnails/rainbow2thumbnail.jpg",
    totalCards: 170,
    category: "rainbow",
  },
  {
    id: "9",
    title: "Promotional",
    setName: "Cards",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 5,
    category: "promos",
  },
  {
    id: "10",
    title: "Serialized & Limited",
    setName: "Cards",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 1,
    category: "serialized",
  }
];

const unreleasedSetIds = [
  "11", // Fun Moments 3
  "4",  // Star 1
  "3",  // Moon 3
  "tcg", // Fantasy Wonderland
  "friendship-begins", // Self explanatory
  "6",  // Rainbow 2
];

const Collections = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sets, setSets] = useState<Collection[]>([]);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const navigate = useNavigate();

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

      const progress = await loadUserProgress();

      const { data: profile } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .single();

      setHiddenSets(profile?.iso_hidden_sets || []);

      const updated = collections.map((set) => {
        const collected = progress[set.id] || 0;
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
    activeCategory === "all"
      ? sets
      : sets.filter((c) => c.category === activeCategory);

  return (
    <div
  className="min-h-screen relative overflow-hidden"
  style={{
    backgroundImage: `
      radial-gradient(rgba(92, 64, 34, 0.12) 1px, transparent 1px),
      radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35)),
      linear-gradient(to bottom, #e2d3b0, #cbb892)
    `,
    backgroundSize: `
      20px 20px,
      cover,
      cover
    `,
  }}
>
      <KayouHeader />

      <div className="container py-8 flex gap-8">
  
  {/* Sidebar wrapper */}
  <div className="hidden md:block bg-[#3b2a1a]/70 backdrop-blur-xl rounded-xl p-4 text-white border border-[#8b6a3e]/30">
  <CatalogSidebar
    activeCategory={activeCategory}
    onCategoryChange={setActiveCategory}
  />
</div>

  <main className="flex-1">

          <div className="mb-4">
            <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-sm text-[#3b2a1a] hover:text-black"
>
  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3b2a1a] hover:bg-[#2a1e12] transition">
    <ArrowLeft className="h-4 w-4 text-[#f5e6c8]" />
  </div>
  Back
</button>
          </div>

          <div className="mb-6">

  <div className="flex items-center justify-between">
    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#3b2a1a]">
      {activeCategory === "all"
        ? "All Collections"
        : filtered[0]?.title || "Collections"}
    </h1>

    <span className="text-sm text-[#3b2a1a] tracking-wide">
      {filtered.length} {filtered.length === 1 ? "set" : "sets"}
    </span>
  </div>

  {activeCategory === "all" && (
    <p className="mt-2 text-sm md:text-base text-[#5c4228] leading-relaxed">
      Sets are updated as KayouUS sends the files to place into them. They are working very hard to help with this website and all of their efforts are deeply appreciated. Sets below will display in release order.
    </p>
  )}

</div>
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
      "friendship-begins",
      "6",  // Rainbow 2
    ];

    const waitingOnKayouIds = [
      "tcg", // Friendship Begins
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

        {/* NOT COLLECTING */}
        {isHidden && !isUnreleased && !isWaiting && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-yellow-400/90 text-black text-xs font-bold px-4 py-2 rounded-lg shadow-md tracking-widest">
              NOT COLLECTING
            </div>
          </div>
        )}

        {/* UNRELEASED */}
        {isUnreleased && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-yellow-400/90 text-black text-xs font-bold px-4 py-2 rounded-lg shadow-md tracking-widest">
              UNRELEASED
            </div>
          </div>
        )}

        {/* WAITING ON KAYOU */}
        {isWaiting && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-yellow-400/90 text-black text-xs font-bold px-4 py-2 rounded-lg shadow-md tracking-widest text-center">
              WAITING ON KAYOUUS
            </div>
          </div>
        )}

        {/* MASTERSET */}
{isMastered && !isHidden && !isUnreleased && !isWaiting && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="bg-green-500/85 text-white text-[10px] font-semibold px-3 py-1.5 rounded-md shadow tracking-wide text-center max-w-[90%]">
      CONGRATULATIONS ON THE MASETERSET
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
          <p className="mb-1 sm:mb-1.5">
            This website is not run or owned by Kayou.
          </p>

          <p className="text-[7px] sm:text-[8px] italic mb-1 sm:mb-1.5">
            All rights to respective owners. All rights to Kayou.
          </p>

          <p className="mb-2 sm:mb-2.5">
            This is a fan-made collector tool that generates zero profit and will not run ads. Ever.
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