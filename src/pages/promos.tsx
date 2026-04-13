import KayouHeader from "@/components/KayouHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Promos = () => {

  const setId = "9";

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // LOAD PROGRESS
  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        const { data: saved } = await supabase
          .from("collection_progress")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", setId)
          .single();

        if (saved?.progress) {
          setFlipped(saved.progress);
        }
      }

      setLoaded(true);
    };

    loadProgress();
  }, []);

  // SAVE PROGRESS
  useEffect(() => {
    if (!loaded) return;

    const saveProgress = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) return;

      await supabase
        .from("collection_progress")
        .upsert(
          {
            user_id: user.id,
            set_id: setId,
            progress: flipped
          },
          { onConflict: "user_id,set_id" }
        );
    };

    saveProgress();
  }, [flipped, loaded]);

  const cards = Array.from({ length: 5 }, (_, i) => ({
    number: i + 1
  }));

  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="container py-8">

        <h1 className="text-2xl font-bold mb-6">
          Promo Cards
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

          {cards.map((card) => {

            const key = `PR-${card.number}`;
            const isFlipped = flipped[key];

            return (
              <div
                key={key}
                className="aspect-[5/7] cursor-pointer perspective"
                onClick={() => toggleFlip(key)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >

                  <img
                    src={`/promo-cards/mlpepr${String(card.number).padStart(3,"0")}.jpg`}
                    className="absolute w-full h-full object-cover rounded-lg backface-hidden"
                  />

                  <img
                    src="/card-backs/M1R-SR-SGR-SCBACK.jpeg"
                    className="absolute w-full h-full object-cover rounded-lg rotate-y-180 backface-hidden"
                  />

                </div>
              </div>
            );

          })}

        </div>

      </div>
    </div>
  );
};

export default Promos;