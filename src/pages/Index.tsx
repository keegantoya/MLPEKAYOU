import KayouHeader from "@/components/KayouHeader";
import logoWithCards from "@/assets/avatars/logowithcards.png";
import aboutMeButton from "@/assets/avatars/aboutmebutton.png";
import Moon3Poster from "@/assets/avatars/Moon3Poster.png";
import FriendshipsBeginPoster from "@/assets/avatars/FriendshipsBeginPoster.png";
import FantasyWonderlandPoster from "@/assets/avatars/FantasyWonderlandPoster.png";
import FunMoments3Poster from "@/assets/avatars/FunMoments3Poster.png";
import Star1Poster from "@/assets/avatars/Star1poster.png";
import { supabase } from "@/lib/supabase";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();

  const images = [
    Moon3Poster,
    FriendshipsBeginPoster,
    FantasyWonderlandPoster,
    FunMoments3Poster,
    Star1Poster,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  trades: 0
});

const [activeGiveaway, setActiveGiveaway] = useState<string | null>(null);
const [topCollector, setTopCollector] = useState<{ username: string; total: number } | null>(null);

  const intervalRef = useRef(null);

  useEffect(() => {

    if (hasInteracted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }


    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);


    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasInteracted, images.length]);

useEffect(() => {
  const loadStats = async (userOverride?: any) => {
    let user = userOverride;

    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }

    if (!user) {
      setStats({
        owned: 0,
        completed: 0,
        trades: 0
      });
      return;
    }

    const { data: progress } = await supabase
      .from("collection_progress")
      .select("progress")
      .eq("user_id", user.id);

    let ownedCount = 0;
    let completedCount = 0;

    (progress || []).forEach((row: any) => {
      const cards = row.progress || {};
      const values = Object.values(cards);

      const ownedCards = values.filter(Boolean).length;
      const totalCards = values.length;

      if (ownedCards > 0) {
        ownedCount += ownedCards;
      }

      if (totalCards > 0 && ownedCards > 0 && ownedCards === totalCards) {
        completedCount += 1;
      }
    });

    const { data: trades } = await supabase
      .from("for_trade")
      .select("id")
      .eq("user_id", user.id);

    setStats({
      owned: ownedCount,
      completed: completedCount,
      trades: trades?.length || 0
    });
  };

  // INITIAL LOAD
  loadStats();

  // 🔥 THIS IS THE ONLY NEW PART
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadStats(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  const loadTopCollector = async () => {
    const { data: progress } = await supabase
      .from("collection_progress_raw")
      .select("*");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");

    const profileMap: Record<string, string> = {};
    profiles?.forEach((p: any) => {
      profileMap[p.id] = p.username;
    });

    const totals: Record<string, number> = {};

    progress?.forEach((row: any) => {
      const owned = Object.values(row.progress || {}).filter(Boolean).length;

      if (!totals[row.user_id]) {
        totals[row.user_id] = 0;
      }

      totals[row.user_id] += owned;
    });

    const sorted = Object.entries(totals)
      .map(([id, total]) => ({
        username: profileMap[id] || "Anonymous",
        total,
      }))
      .sort((a, b) => b.total - a.total);

    setTopCollector(sorted[0] || null);
  };

  loadTopCollector();
}, []);
  
  return (
 <div
  style={{
    backgroundColor: "#e9e2f3",
    backgroundImage: "radial-gradient(#44444418 1.5px, transparent 1.5px)",
    backgroundSize: "26px 26px",
  }}
>
      <KayouHeader />

      <section className="w-full pt-4 pb-2">
  <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">

    {/* LEFT PANEL */}
    <div className="hidden lg:flex w-[220px] flex-col items-center bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] rounded-lg p-4 shadow ml-4">
      <h3 className="font-bold mb-2 text-center">Winners</h3>
      <div className="text-[11px] text-center space-y-1">
        <div>Oddity</div>
        <div>Stenz</div>
        <div>Maissa</div>
        <div>HyveMind710</div>
        <div>Cloven</div>
</div>
    </div>

    {/* CAROUSEL */}
    <div className="relative w-full max-w-4xl overflow-hidden rounded-lg shadow-md">

      <img
        src={images[currentIndex]}
        alt="Carousel"
        className="w-full object-cover transition duration-700 ease-in-out"
      />

      {/* LEFT */}
      <button
        onClick={() => {
          setHasInteracted(true);
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded hover:bg-black/60"
      >
        ‹
      </button>

      {/* RIGHT */}
      <button
        onClick={() => {
          setHasInteracted(true);
          setCurrentIndex((prev) => (prev + 1) % images.length);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded hover:bg-black/60"
      >
        ›
      </button>

      {/* DOTS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              setHasInteracted(true);
              setCurrentIndex(i);
            }}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              i === currentIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

    </div>

    {/* RIGHT PANEL */}
<div className="hidden lg:flex w-[220px] flex-col items-center bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] rounded-lg p-4 shadow mr-4">

  <h3 className="font-bold mb-2 text-center">Giveaways</h3>

  <div className="text-[11px] text-center space-y-2">

    <div className="relative group cursor-pointer">
      MLPEKAYOU x KAYOU
      <img
        src="/website-assets/giveaway001.png"
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[600px] max-w-[90vw] rounded-lg shadow-xl border border-[#d4af37] hidden group-hover:block z-50"
      />
    </div>

    <div className="relative group cursor-pointer">
      DISCORD FLASH GIVEAWAY
      <img
        src="/website-assets/giveaway002.png"
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[600px] max-w-[90vw] rounded-lg shadow-xl border border-[#d4af37] hidden group-hover:block z-50"
      />
    </div>

    <div className="relative group cursor-pointer">
      MLPEKAYOU BETA LAUNCH
      <img
        src="/website-assets/giveaway003.png"
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[400px] max-w-[90vw] rounded-lg shadow-xl border border-[#d4af37] hidden group-hover:block z-50"
      />
    </div>

    <div className="relative group cursor-pointer">
      MLPEKAYOU DISCORD GIVEAWAY
      <img
        src="/website-assets/giveaway004.jpg"
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[400px] max-w-[90vw] rounded-lg shadow-xl border border-[#d4af37] hidden group-hover:block z-50"
      />
    </div>

  </div>
</div>

  </div>
<div className="text-center text-[10px] text-[#5a3e84] mt-3 px-4">
  All images were pulled from Google Images and small modifications may have been made regarding putting set images or decorations. All rights to Kayou.
</div>

</section>

      <div className="mt-0 sm:mt-6 flex justify-between gap-2 px-2 sm:justify-center sm:gap-6">

  <div className="bg-[#5a3e84] text-[#f5e6a8] px-4 py-2 rounded-lg border border-[#d4af37] shadow text-center min-w-[100px]">
    <div className="text-xs">Cards Owned</div>
    <div className="text-lg font-bold">{stats.owned}</div>
  </div>

  <div className="bg-[#5a3e84] text-[#f5e6a8] px-4 py-2 rounded-lg border border-[#d4af37] shadow text-center min-w-[100px]">
  <div className="text-xs">Sets Completed</div>
  <div className="text-lg font-bold">{stats.completed}</div>
  <div className="text-[9px] opacity-80 mt-1">
    Promotional sets do not count due to them constantly changing.
  </div>
</div>

  <div className="bg-[#5a3e84] text-[#f5e6a8] px-4 py-2 rounded-lg border border-[#d4af37] shadow text-center min-w-[100px]">
    <div className="text-xs">Cards for Trade</div>
    <div className="text-lg font-bold">{stats.trades}</div>
  </div>

</div>

{topCollector && (
  <div className="mt-4 flex justify-center">
    <div className="relative w-full max-w-xl sm:max-w-2xl px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 border-[#b8962e] shadow-lg text-center
      bg-gradient-to-b from-[#fff3b0] via-[#ffd700] to-[#d4af37] overflow-hidden">

      {/* LEFT GOLD ACCENT */}
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#fff8cc] to-[#b8962e]" />

      {/* RIGHT GOLD ACCENT */}
      <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-[#fff8cc] to-[#b8962e]" />

      {/* INNER EDGE LINES */}
      <div className="absolute left-2 top-1 bottom-1 w-[1px] bg-[#b8962e]/40" />
      <div className="absolute right-2 top-1 bottom-1 w-[1px] bg-[#b8962e]/40" />

      {/* CONTENT */}
      <div className="relative">

        <div className="text-[9px] sm:text-[11px] tracking-wide text-[#b8962e] font-semibold">
  TOP KAYOUUS COLLECTOR
</div>

        <div className="text-sm sm:text-lg font-bold text-[#5a3e84]">
          {topCollector.username}
        </div>

        <div className="text-[10px] sm:text-[11px] text-[#5a3e84] opacity-80">
          {topCollector.total} cards
        </div>

      </div>
    </div>
  </div>
)}

<div className="lg:hidden mt-6 px-4">
  <div className="grid grid-cols-2 gap-3">

    {/* WINNERS */}
    <div className="bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] rounded-lg p-3 text-center">
      <h3 className="font-bold mb-2 text-sm">Winners</h3>
      <div className="text-[11px] space-y-2">

  <div className="bg-[#4a2f6b] px-2 py-1 rounded border border-[#d4af37]">
    Oddity
  </div>

  <div className="bg-[#4a2f6b] px-2 py-1 rounded border border-[#d4af37]">
    Stenz
  </div>

  <div className="bg-[#4a2f6b] px-2 py-1 rounded border border-[#d4af37]">
    Maissa
  </div>

  <div className="bg-[#4a2f6b] px-2 py-1 rounded border border-[#d4af37]">
    HyveMind710
  </div>

  <div className="bg-[#4a2f6b] px-2 py-1 rounded border border-[#d4af37]">
    Cloven
  </div>

</div>

    </div>

    {/* GIVEAWAYS */}
    <div className="bg-[#5a3e84] text-[#f5e6a8] border border-[#d4af37] rounded-lg p-3 text-center">
      <h3 className="font-bold mb-2 text-sm">Giveaways</h3>

      <div className="text-[11px] space-y-2">

  <div
  onClick={() => setActiveGiveaway("/website-assets/giveaway001.png")}
  className="cursor-pointer bg-[#4a2f6b] hover:bg-[#6b46a1] px-2 py-1 rounded border border-[#d4af37] transition"
>
  MLPEKAYOU x KAYOU
</div>

<div
  onClick={() => setActiveGiveaway("/website-assets/giveaway002.png")}
  className="cursor-pointer bg-[#4a2f6b] hover:bg-[#6b46a1] px-2 py-1 rounded border border-[#d4af37] transition"
>
  DISCORD FLASH GIVEAWAY
</div>

<div
  onClick={() => setActiveGiveaway("/website-assets/giveaway003.png")}
  className="cursor-pointer bg-[#4a2f6b] hover:bg-[#6b46a1] px-2 py-1 rounded border border-[#d4af37] transition"
>
  MLPEKAYOU BETA LAUNCH
</div>

<div
  onClick={() => setActiveGiveaway("/website-assets/giveaway004.jpg")}
  className="cursor-pointer bg-[#4a2f6b] hover:bg-[#6b46a1] px-2 py-1 rounded border border-[#d4af37] transition"
>
  MLPEKAYOU DISCORD GIVEAWAY
</div>

</div>
    </div>

  </div>
</div>

{activeGiveaway && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]"
    onClick={() => setActiveGiveaway(null)}
  >
    <div
      className="relative max-w-[90vw] max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setActiveGiveaway(null)}
        className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded"
      >
        ✕
      </button>

      <img
        src={activeGiveaway}
        className="max-w-full max-h-[90vh] rounded-lg border border-[#d4af37]"
      />
    </div>
  </div>
)}

      {/* FOOTER */}
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

export default Index;