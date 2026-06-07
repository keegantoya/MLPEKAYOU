import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

const merchItems = [
  {
    id: 1,
    title: "Twilight Sparkle",
    image: "/otherkayoumerch/twilightplushone.webp",
  },
  {
    id: 2,
    title: "Pinkie Pie",
    image: "/otherkayoumerch/pinkieplushone.webp",
  },
  {
    id: 3,
    title: "Fluttershy",
    image: "/otherkayoumerch/fluttershyplushone.webp",
  },
  {
    id: 4,
    title: "Rainbow Dash",
    image: "/otherkayoumerch/rainbowdashplushone.webp",
  },
  {
    id: 5,
    title: "Rarity",
    image: "/otherkayoumerch/rarityplushone.webp",
  },
  {
    id: 6,
    title: "Applejack",
    image: "/otherkayoumerch/applejackplushone.webp",
  },
];

export default function OtherKayouMerch() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
  const loadProgress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    const { data } = await supabase
      .from("collection_progress_raw")
      .select("progress")
      .eq("user_id", user.id)
      .eq("set_id", "OTHERMERCH")
      .single();

    if (data?.progress) {
      const completedIds = Object.entries(data.progress)
        .filter(([_, value]) => value)
        .map(([key]) => Number(key));

      setCompleted(completedIds);
    }
  };

  loadProgress();
}, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#e9e2f3",
        backgroundImage:
          "radial-gradient(#44444418 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
      }}
    >

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0 mb-8 mt-6 sm:mt-0">
          <button
  onClick={() => navigate("/collections")}
  className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#7c5aa6] to-[#5a3e84] border border-[#d4af37]/60 shadow-md hover:brightness-110 transition"
>
            <ArrowLeft className="h-4 w-4 text-[#f5e6a8]" />

            <span className="text-sm font-semibold text-[#f5e6a8] tracking-wide">
              Back
            </span>
          </button>

          <div className="flex-1 text-center">
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5a3e84] leading-tight">
    Other Kayou Merch
  </h1>

  <p className="mt-3 text-sm md:text-base text-[#555] max-w-2xl mx-auto leading-relaxed">
    This is all Kayou US merch that is non-card related. It will not have ISO, trade, or leaderboard functions.
  </p>

  <div className="flex items-center justify-center gap-4 my-5">
    <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />

    <span className="text-xs tracking-[0.3em] font-semibold text-[#8b6a2b] uppercase">
      Leaping Pony Plush Collection
    </span>

    <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[140px]" />
  </div>
</div>

          <div className="hidden sm:block w-[72px]" />
        </div>

        {/* Merch Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {merchItems.map((item) => (
            <div
  key={item.id}
onClick={async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) return;

  let updated: number[];

  if (completed.includes(item.id)) {
    updated = completed.filter((id) => id !== item.id);
  } else {
    updated = [...completed, item.id];
  }

  setCompleted(updated);

  const progressObject = updated.reduce(
    (acc, id) => {
      acc[id] = true;
      return acc;
    },
    {} as Record<number, boolean>
  );

 await supabase
  .from("collection_progress_raw")
  .upsert(
    {
      user_id: user.id,
      set_id: "OTHERMERCH",
      progress: progressObject,
    },
    {
      onConflict: "user_id,set_id",
    }
  );
}}
  className={`relative bg-white/80 border rounded-2xl overflow-hidden shadow-md transition cursor-pointer hover:scale-[1.02]
    ${
      completed.includes(item.id)
        ? "border-[#d4af37] ring-2 ring-[#d4af37]/50"
        : "border-[#d4af37]/40"
    }`}
>
  {item.image ? (
    <div className="relative">
      <img
        src={item.image}
        alt={item.title}
        className={`w-full aspect-square object-contain bg-white transition ${
          completed.includes(item.id)
            ? "brightness-110"
            : ""
        }`}
      />

      {completed.includes(item.id) && (
        <>
          <div className="absolute inset-0 pointer-events-none animate-pulse">
            <Sparkles className="absolute top-2 left-2 h-5 w-5 text-yellow-300" />
            <Sparkles className="absolute top-3 right-3 h-4 w-4 text-pink-300" />
            <Sparkles className="absolute bottom-3 left-3 h-4 w-4 text-purple-300" />
            <Sparkles className="absolute bottom-2 right-2 h-5 w-5 text-yellow-200" />
          </div>

          <div className="absolute top-2 right-2 bg-[#5a3e84] rounded-full p-1 shadow-lg">
            <Check className="h-4 w-4 text-[#f5e6a8]" />
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="w-full aspect-square flex items-center justify-center bg-white/40 text-[#7c5aa6] text-sm font-semibold">
      Coming Soon
    </div>
  )}

  <div className="p-3 text-center">
    <h2 className="text-sm font-semibold text-[#5a3e84] flex items-center justify-center gap-1">
      {completed.includes(item.id) && (
        <Check className="h-4 w-4 text-[#d4af37]" />
      )}

      {item.title}
    </h2>
  </div>
</div>
          ))}
        </div>

      </div>
    </div>
  );
}