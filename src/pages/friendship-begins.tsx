import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

const FriendshipBegins = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // ✅ SET CONFIG
  const set = {
    name: "Friendship Begins",
    folder: "friendship-begins",
    prefix: "SD",
  };

  // ✅ SECTION STRUCTURE
  const sections = [
    { title: "Twilight Sparkle Starter Deck", count: 21 },
    { title: "Fluttershy Starter Deck", count: 21 },
    { title: "Pinkie Pie Starter Deck", count: 21 },
    { title: "Applejack Starter Deck", count: 21 },
    { title: "Rainbow Dash Starter Deck", count: 21 },
    { title: "Rarity Starter Deck", count: 21 },
    { title: "Bonus Pack Deck", count: 68 },
  ];

  const starterDeckImages = [
  "/starter-decks-boxes/SDTWILIGHT.png",
  "/starter-decks-boxes/SDFLUTTERSHY.png",
  "/starter-decks-boxes/SDPINKIEPIE.png",
  "/starter-decks-boxes/SDAPPLEJACK.png",
  "/starter-decks-boxes/SDRAINBOWDASH.png",
  "/starter-decks-boxes/SDRARITY.png",
  "/starter-decks-boxes/SDBONUSPACKS.png"
];
const starterDeckGroups = [
  { name: "Twilight Sparkle", code: "SD01A", start: 1, end: 21 },
  { name: "Fluttershy", code: "SD01B", start: 22, end: 42 },
  { name: "Pinkie Pie", code: "SD01C", start: 43, end: 63 },
  { name: "Applejack", code: "SD01D", start: 64, end: 84 },
  { name: "Rainbow Dash", code: "SD01E", start: 85, end: 105 },
  { name: "Rarity", code: "SD01F", start: 106, end: 126 },
];

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async (userOverride?: any) => {
      let user = userOverride;

      if (!user) {
        const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      }

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "SD")
          .single();

        setFlipped(saved?.progress || {});
      } else {
        setFlipped({});
      }

      setLoaded(true);
    };

    loadProgress();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProgress(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // SAVE PROGRESS
  useEffect(() => {
    if (!loaded) return;

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      await supabase
        .from("collection_progress_raw")
        .upsert(
          {
            user_id: user.id,
            set_id: "SD",
            progress: flipped,
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  // TOTAL CARDS
  const totalCards = sections.reduce((sum, s) => sum + s.count, 0);

  // CONFETTI
  useEffect(() => {
    if (!loaded || celebrated) return;

    const owned = Object.values(flipped).filter(Boolean).length;

    if (totalCards > 0 && owned === totalCards) {
      fireConfetti();
      setCelebrated(true);
    }
  }, [flipped, loaded, celebrated, totalCards]);

const isDeckComplete = (start: number, end: number) => {
  for (let i = start; i <= end; i++) {
    if (!flipped[i]) return false;
  }
  return true;
};

  const getCardBack = () => {
    return "/card-backs/M1R-SR-SGR-SCBACK.jpeg";
  };

  return (
    <div className="min-h-screen bg-white">
      <KayouHeader />

      <div className="container py-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center px-2">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-amber-900 hover:text-amber-700 mr-3 whitespace-nowrap"
          >
            ← Back
          </button>

          <h1 className="text-lg font-semibold text-center flex-1">
            {set.name}
          </h1>
        </div>

        {/* DESCRIPTION */}
        <p className="text-center text-sm md:text-base text-gray-500 max-w-sm md:max-w-2xl mx-auto mt-2 px-3">
          Friendship Begins is a large set that begins with starter decks for all six main characters,
          followed by a 68-card bonus pack expansion. This checklist includes all starter decks and
          bonus pack cards. There are three bonus packs in each starter deck box.
        </p>

        {!loaded ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading collection...
          </div>
        ) : (
          <div className="space-y-8">

            {sections.map((section, sectionIndex) => {
              return (
                <div key={sectionIndex}>

                  {/* STARTER DECK IMAGE (ALL SECTIONS) */}
<div className="flex justify-center mb-2">
  <img
    src={starterDeckImages[sectionIndex]}
    alt={section.title}
    className="h-20 sm:h-28 object-contain"
  />
</div>


                  {/* SECTION TITLE */}
                  <h2 className="text-center text-xs sm:text-sm text-[#5c4022] mb-3 mt-4 tracking-wide">
                    {section.title}
                  </h2>

                  {/* GRID */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Array.from({ length: section.count }, (_, i) => {
                      const globalIndex =
                        sections
                          .slice(0, sectionIndex)
                          .reduce((sum, s) => sum + s.count, 0) + i + 1;

                      const key = `${globalIndex}`;
                      const isFlipped = flipped[key];

                      return (
                        <div
                          key={key}
                          className="aspect-[5/7] cursor-pointer perspective relative"
                          onClick={() => toggleFlip(key)}
                        >
                          <div
                            className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                              isFlipped ? "rotate-y-180" : ""
                            }`}
                          >
                            {/* FRONT */}
                            <img
                              src={`/cards/${set.folder}/${set.prefix}${String(globalIndex).padStart(3, "0")}.jpg`}
                              className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                            />

                            {/* BACK */}
                            <img
                              src={getCardBack()}
                              className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default FriendshipBegins;