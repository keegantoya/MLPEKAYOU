import KayouHeader from "@/components/KayouHeader";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CollectionCard from "@/components/CollectionCard";
import { useEffect, useState } from "react";
import { loadUserProgress } from "@/lib/loadProgress";
import { supabase } from "@/lib/supabase";

type Set = {
  id: string;
  title: string;
  setName: string;
  imageUrl: string;
  totalCards: number;
  category: string;
  progress?: number;
  collectedCards?: number;
};

const featuredSets: Set[] = [
  {
    id: "3",
    title: "Eternal Moon",
    setName: "Third Volume",
    imageUrl: "/thumbnails/moon-te.jpg",
    totalCards: 290,
    category: "eternal-moon",
  },
  {
    id: "star1",
    title: "Eternal Star",
    setName: "First Volume",
    imageUrl: "/thumbnails/s1-thumbnail.jpg",
    totalCards: 105,
    category: "eternal-star",
  },
  {
    id: "rainbow2",
    title: "Eternal Rainbow",
    setName: "Second Volume",
    imageUrl: "/thumbnails/rainbow2thumbnail.jpg",
    totalCards: 146,
    category: "eternal-rainbow",
  },
  {
    id: "tcg",
    title: "Fantasy Wonderland",
    setName: "",
    imageUrl: "/thumbnails/fantasy-wonderland-thumbnail.jpg",
    totalCards: 0,
    category: "tcg",
  },
  {
    id: "friendship-begins",
    title: "Friendship Begins",
    setName: "",
    imageUrl: "/thumbnails/friendship-begins-thumbnail.jpg",
    totalCards: 0,
    category: "tcg",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<Set[]>([]);

  // 🔐 Password Reset Redirect (THIS IS THE IMPORTANT PART)
  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      navigate("/password-reset" + hash);
    }
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        setSets(
          featuredSets.map((set) => ({
            ...set,
            progress: 0,
            collectedCards: 0,
          }))
        );
        return;
      }

      const progress = await loadUserProgress();

      const updated = featuredSets.map((set) => {
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

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      {/* Giveaway Banner */}
      <section className="w-full px-4 mt-4">
        <div className="max-w-5xl mx-auto border-2 border-yellow-400 rounded-2xl p-4 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left Image */}
            <div className="w-full md:w-[45%]">
              <img
                src="/website-assets/giveaway001.jpg"
                alt="MLPEKAYOU Giveaway"
                className="rounded-xl w-full max-h-64 object-cover"
              />
            </div>

            {/* Right Content */}
            <div className="w-full md:w-[55%] text-center flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                MLPEKAYOU BETA LAUNCH GIVEAWAY!
              </h2>

              <p className="text-sm mb-1">
                In celebration of MLPEKAYOU Beta finally launching, we are giving away
                an English Moon 2 Fluttershy SC!
              </p>

              <p className="text-xs text-gray-500 mb-3">
                Rules and conditions apply.
              </p>

              <a
                href="https://discord.gg/fb7cHz4kdD"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="btn-kayou rounded-full px-5 py-2 text-sm">
                  ENTER GIVEAWAY
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center mb-6 gap-2">
          <Link to="/collections">
            <Button className="btn-kayou font-semibold gap-2 px-5 h-9 rounded-lg">
              See all Releases <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <h2 className="text-lg font-bold text-foreground text-center">
            Upcoming Releases
          </h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
          {sets.map((set) => (
            <CollectionCard key={set.id} {...set} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-4 sm:py-5 text-center text-[10px] sm:text-xs text-muted-foreground">
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

export default Index;