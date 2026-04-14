import { useState, useEffect } from "react";
import KayouHeader from "@/components/KayouHeader";
import CatalogSidebar from "@/components/CatalogSidebar";
import CollectionCard from "@/components/CollectionCard";
import { loadUserProgress } from "@/lib/loadProgress";
import { useLocation } from "react-router-dom";
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
    setName: "First Edition",
    imageUrl: "/thumbnails/moon-fe.jpg",
    totalCards: 186,
    category: "eternal-moon",
  },
  {
    id: "2",
    title: "Eternal Moon",
    setName: "Second Edition",
    imageUrl: "/thumbnails/moon-se.jpg",
    totalCards: 189,
    category: "eternal-moon",
  },
  {
    id: "3",
    title: "Eternal Moon",
    setName: "Third Edition",
    imageUrl: "/thumbnails/moon-te.jpg",
    totalCards: 290,
    category: "eternal-moon",
  },
  {
    id: "4",
    title: "Star",
    setName: "First Edition",
    imageUrl: "/thumbnails/s1-thumbnail.jpg",
    totalCards: 105,
    category: "star",
  },
  {
    id: "5",
    title: "Rainbow",
    setName: "First Edition",
    imageUrl: "/thumbnails/rainbow1thumbnail.jpg",
    totalCards: 146,
    category: "rainbow",
  },
  {
    id: "6",
    title: "Rainbow",
    setName: "Second Edition",
    imageUrl: "/thumbnails/rainbow2thumbnail.jpg",
    totalCards: 170,
    category: "rainbow",
  },
  {
    id: "7",
    title: "Fun Moments",
    setName: "First Edition",
    imageUrl: "/thumbnails/fme01TN.jpg",
    totalCards: 127,
    category: "fun-moments",
  },
  {
    id: "8",
    title: "Fun Moments",
    setName: "Second Edition",
    imageUrl: "/thumbnails/fme02TN.jpg",
    totalCards: 136,
    category: "fun-moments",
  },

  {
    id: "tcg",
    title: "Fantasy Wonderland",
    setName: "",
    imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
  },
  {
    id: "friendship-begins",
    title: "Friendship Begins",
    setName: "",
    imageUrl: "/thumbnails/friendship-begins-thumbnail.jpg",
    totalCards: 191,
    category: "tcg",
  },
  {
    id: "9",
    title: "Promotional Cards",
    setName: "",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 5,
    category: "promos",
  },
  {
    id: "10",
    title: "Serialized & Limited Cards",
    setName: "",
    imageUrl: "/thumbnails/promos-thumbnail.jpg",
    totalCards: 1,
    category: "serialized",
  }
];

const Collections = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sets, setSets] = useState<Collection[]>([]);
  const [hiddenSets, setHiddenSets] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

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
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  const filtered =
    activeCategory === "all"
      ? sets
      : sets.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8 flex gap-8">
        <CatalogSidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main className="flex-1">

          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold text-foreground">
              {activeCategory === "all"
                ? "All Collections"
                : filtered[0]?.title || "Collections"}
            </h1>

            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "set" : "sets"}
            </span>
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

                return (
                  <div key={col.id} className="relative">

                    <div className={isHidden ? "opacity-40" : ""}>
                      <CollectionCard {...col} />
                    </div>

                    {isHidden && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-background/80 text-xs font-semibold px-3 py-2 rounded-lg text-center shadow">
                          NOT COLLECTING
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
    </div>
  );
};

export default Collections;