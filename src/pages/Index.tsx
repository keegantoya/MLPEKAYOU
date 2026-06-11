const lunaGif = "/nightmarenight-assets/princesslunagif.webp";
import { supabase } from "@/lib/supabase";

import {
  BookOpen,
  Trophy,
  ArrowLeftRight,
  Star,
  Heart,
    Ghost,
  Send,
  Bookmark,
} from "lucide-react"; 

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const Index = () => {
  const navigate = useNavigate();

  const images = [lunaGif];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const [postSlides, setPostSlides] = useState<Record<string, number>>({});

  const [stats, setStats] = useState({
  owned: 0,
  completed: 0,
  trades: 0
});

const toggleLike = async (postId: string) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    navigate("/auth");
    return;
  }

  const isLiked = likedPosts[postId];

  if (isLiked) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: false,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] || 1) - 1, 0),
    }));
  } else {
    await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: true,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }
};

useEffect(() => {
  const loadLikes = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    // Load all likes to calculate public counts
    const { data: allLikes, error } = await supabase
      .from("post_likes")
      .select("post_id, user_id");

    if (error) {
      console.error("Error loading likes:", error);
      return;
    }

    const counts: Record<string, number> = {};
    const liked: Record<string, boolean> = {};

    allLikes?.forEach((row: any) => {
      counts[row.post_id] = (counts[row.post_id] || 0) + 1;

      // Mark posts liked by the current user
      if (user && row.user_id === user.id) {
        liked[row.post_id] = true;
      }
    });

    setLikeCounts(counts);
    setLikedPosts(liked);
  };

  loadLikes();
}, []);

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
  .select("set_id, progress")
  .eq("user_id", user.id);

    let ownedCount = 0;
    let completedCount = 0;

    const progressMap = new Map(
      (progress || []).map((row: any) => [String(row.set_id), row])
    );

    const sets = [
      { id: "9", rarities: { PR: 6 } },
      { id: "1", rarities: { R:30, SR:20, SSR:54, HR:36, UR:16, LSR:15, SGR:8, SC:7 }},
      { id: "5", rarities: { R:30, SR:15, FR:18, TR:12, TGR:8, MTR:18, SSR:15, UR:15, USR:8, XR:7 }},
      { id: "7", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, CR:12 }},
      { id: "2", rarities: { R:30, SR:20, SSR:54, HR:30, UR:16, LSR:16, SGR:8, ZR:7, SC:7, "SHINING ZR":1 }},
      { id: "3", rarities: { R:60, SR:40, SSR:40, HR:60, UR:18, LSR:32, SGR:16, ZR:14, SC:7, "SZR":1 }},
      { id: "11", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR: 9, CR:12, SCR: 12 }},
      { id: "8", rarities: { N:20, SN:20, R:35, SR:15, SSR:15, UR:10, UGR:9, CR:12 }},
      { id: "10", rarities: { LC: 1 } },
      { id: "6", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 }},
      { id: "4", rarities: { SSR: 20, SCR: 18, UR:18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 }},
    ];

    sets.forEach((set) => {
      const found = progressMap.get(set.id);

      if (!found?.progress || !set.rarities) return;

      let owned = 0;
      let total = 0;

      owned = Object.values(found.progress || {}).filter(
  (value: any) =>
    value === true ||
    (typeof value === "object" && value?.owned === true)
).length;

      ownedCount += owned;

      Object.entries(set.rarities).forEach(([_, count]) => {
  total += count;
});

      // skip promo and limited
      if (set.id === "9" || set.id === "10") return;

      if (total > 0 && owned === total) {
        completedCount++;
      }
    });
    
    const { data: sdProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "SD"); // THIS LINE PREVENTS DOUBLE COUNTING

const mergedSD: Record<string, boolean> = {};

(sdProgress || []).forEach((row: any) => {
  Object.entries(row.progress || {}).forEach(([k, v]) => {
    if (v === true) mergedSD[k] = true;
  });
});

const owned = Object.keys(mergedSD).filter(key => {
  const raw = key.replace("STARTER-", "").replace("BONUS-", "");
  return raw.startsWith("SD01");
}).length;

ownedCount += owned;

const { data: fwProgress } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "FW");

  const { data: tcgPromos } = await supabase
  .from("collection_progress_raw")
  .select("progress")
  .eq("user_id", user.id)
  .eq("set_id", "tcgpromos");

const tcgRow = tcgPromos?.[0];

if (tcgRow) {
  const owned = Object.values(tcgRow.progress || {}).filter(Boolean).length;
  ownedCount += owned;
}

const fwRow = fwProgress?.[0];

if (fwRow) {

  const STRUCTURE = [
    { prefix: "BP01C", count: 48 },
    { prefix: "BP01U", count: 18 },
    { prefix: "BP01ER", count: 6 },
    { prefix: "BP01SR", count: 14 },
    { prefix: "BP01SPR", count: 28 },
    { prefix: "BP01GR", count: 12 },
    { prefix: "BP01CR", count: 12 },
    { prefix: "BP01RR", count: 6 },
    { prefix: "BP01PER", count: 12 },
    { prefix: "BP01PSPR", count: 11 },
    { prefix: "BP01PGR", count: 6 },
    { prefix: "BP01PCR", count: 12 },
    { prefix: "BP01PRR", count: 6 },
  ];

  const validKeys = new Set(
    STRUCTURE.flatMap(({ prefix, count }) => {

      if (prefix === "BP01ER") {
        return Array.from({ length: 6 }, (_, i) =>
          `BP01ER${String(i + 7).padStart(2, "0")}`
        );
      }

      if (prefix === "BP01PSPR") {
        return [1,2,3,5,7,8,9,12,13,18,21].map(n =>
          `BP01PSPR${String(n).padStart(2, "0")}`
        );
      }

      return Array.from({ length: count }, (_, i) =>
        `${prefix}${String(i + 1).padStart(2, "0")}`
      );
    })
  );

  const owned = Object.entries(fwRow.progress || {}).filter(
    ([key, val]) => val && validKeys.has(key)
  ).length;

  ownedCount += owned;
}
    
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

  loadStats();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    loadStats(session?.user);
  });

  return () => subscription.unsubscribe();
}, []);
  
  return (
  <div
  className="min-h-screen relative overflow-hidden pb-24"
    style={{
backgroundColor: "#120A24",
backgroundImage: `
  radial-gradient(circle at 20% 15%, rgba(104,58,183,0.25) 0%, transparent 35%),
  radial-gradient(circle at 80% 10%, rgba(53,94,255,0.18) 0%, transparent 30%),
  radial-gradient(circle at 50% 60%, rgba(91,46,134,0.20) 0%, transparent 40%),
  linear-gradient(
    180deg,
    #1A1033 0%,
    #201547 30%,
    #17244D 65%,
    #10172F 100%
  )
`,
}}
  >

<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  
{/* Left Branch */}
<img
  src="/website-assets/spookybranch1.webp"
  alt=""
  style={{
    animation: "branch-sway-left 12s ease-in-out infinite",
    transformOrigin: "top left",
  }}
  className="
  absolute
  top-5
  left-0
  w-[280px]
  sm:w-[340px]
  lg:w-[550px]
  opacity-50
  select-none
"
/>

{/* Right Branch */}
<img
  src="/website-assets/spookybranch2.webp"
  alt=""
  style={{
    animation: "branch-sway-right 12s ease-in-out infinite",
    transformOrigin: "top right",
  }}
  className="
  absolute
  top-40
  right-0
  w-[280px]
  sm:w-[340px]
  lg:w-[550px]
  opacity-50
  select-none
  z-20
"
/>

<div
  className="
    absolute
    top-12
    right-[-40px]
    lg:right-[40px]
    w-[180px]
    sm:w-[240px]
    lg:w-[340px]
  "
>
  <div className="moon-glow" />

  <img
    src="/nightmarenight-assets/mareinthemoon.webp"
    alt=""
    className="relative z-10 w-full h-auto"
  />
</div>

 {/* Background stars */}
<div className="absolute top-12 left-6 text-purple-300/25 text-3xl">✦</div>
<div className="absolute top-24 right-8 text-blue-200/20 text-2xl">⋆</div>

<div className="absolute top-52 left-[12%] text-purple-200/20 text-4xl">✧</div>
<div className="absolute top-72 right-[15%] text-indigo-200/20 text-3xl">•</div>

<div className="absolute top-[420px] left-1/3 text-purple-300/15 text-5xl">✦</div>
<div className="absolute top-[560px] right-10 text-blue-200/20 text-3xl">⋆</div>

<div className="absolute top-[850px] left-10 text-indigo-200/15 text-4xl">✧</div>
<div className="absolute top-[1100px] right-[10%] text-purple-300/20 text-3xl">•</div>

<div className="absolute top-[1450px] left-[8%] text-blue-200/15 text-5xl">✦</div>
<div className="absolute top-[1800px] right-[12%] text-purple-200/20 text-4xl">⋆</div>

<div className="absolute top-[2200px] left-12 text-indigo-200/15 text-3xl">✧</div>

<div className="absolute bottom-32 left-8 text-purple-300/20 text-4xl">✦</div>
<div className="absolute bottom-16 right-10 text-blue-200/15 text-5xl">⋆</div>
</div>

    <div className="relative z-10 container max-w-7xl mx-auto px-6 py-10 min-[1024px]:max-[1439px]:scale-90 min-[1024px]:max-[1439px]:origin-top">
      {/* HERO */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-12">
        {/* LEFT SIDE */}
        <div className="text-center lg:text-left">
          {/* Badge */}
<div
  className="
    inline-flex
    items-center
    gap-2
    px-5
    py-2
    rounded-full
   bg-[#161021]/95
    border
    border-[#7A5A9B]
    shadow-[0_0_35px_rgba(184,138,232,0.15)]
    text-xs
    font-semibold
    tracking-wide
    text-[#DCCEEF]
    mb-6
  "
>
  <Star className="w-3.5 h-3.5 fill-current text-[#E6D38A]" />
  <span>THE FIRST SPOOKY INTERACTIVE U.S. KAYOU MLP CHECKLIST</span>
  <Star className="w-3.5 h-3.5 fill-current text-[#E6D38A]" />
</div>

          {/* Headline */}
<h1
  className="
    text-5xl sm:text-6xl lg:text-7xl
    font-bold
    leading-[0.95]
    tracking-[-0.02em]
    text-[#D8C5F4]
    drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]
  "
  style={{
    fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
  }}
>
  <span className="block">Your collection</span>
  <span className="block text-[#B88AE8]">anytime,</span>
  <span className="block relative">
    anywhere.
    <span className="absolute -top-4 -right-6 text-3xl sm:text-4xl text-[#F4C84A] opacity-95">
      ✦
    </span>
  </span>
</h1>

          {/* Description */}
          <p className="mt-8 max-w-xl mx-auto lg:mx-0 text-lg text-[#A991C7] leading-relaxed">
            Track your progress, your inventory, and your place on the board.
            KAYOU US is not owned or run by Kayou, but the owner is a partner of Kayou's US E-Commerce branch.
          </p>

          {/* Mobile Card Fan */}
<div className="lg:hidden mt-8 mb-8 flex justify-center">
  <img
    src="/website-assets/carddesignnmn.webp"
    alt="Kayou card fan"
    className="
      w-[420px]
      max-w-[115%]
      h-auto
      drop-shadow-[0_25px_60px_rgba(88,42,135,0.22)]
      select-none
      pointer-events-none
    "
  />
</div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
  onClick={() => navigate("/inventory")}
className="
  px-8 py-4 rounded-2xl

  bg-gradient-to-r
  from-[#16203D]
  via-[#1B2A52]
  to-[#24386B]

  text-[#E6E2F5]
  font-semibold

  border border-[#D8B45A]

  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.55)]
  hover:scale-[1.03]

  transition-all duration-300

  relative overflow-hidden

  before:content-['']
  before:absolute
  before:inset-[3px]
  before:rounded-[14px]
  before:border
  before:border-[#F8E38C]/70
  before:pointer-events-none

  after:content-['']
  after:absolute
  after:top-0
  after:left-[-120%]
  after:w-[60%]
  after:h-full
  after:bg-gradient-to-r
  after:from-transparent
  after:via-white/10
  after:to-transparent
  after:skew-x-[-20deg]
  hover:after:left-[140%]
  after:transition-all
  after:duration-700
"
>
  View Your Collection
</button>

            <button
  onClick={() => navigate("/leaderboard")}
className="
  px-8 py-4 rounded-2xl

  bg-gradient-to-r
  from-[#16203D]
  via-[#1B2A52]
  to-[#24386B]

  text-[#E6E2F5]
  font-semibold

  border border-[#D8B45A]

  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.55)]
  hover:scale-[1.03]

  transition-all duration-300

  relative overflow-hidden

  before:content-['']
  before:absolute
  before:inset-[3px]
  before:rounded-[14px]
  before:border
  before:border-[#F8E38C]/70
  before:pointer-events-none

  after:content-['']
  after:absolute
  after:top-0
  after:left-[-120%]
  after:w-[60%]
  after:h-full
  after:bg-gradient-to-r
  after:from-transparent
  after:via-white/10
  after:to-transparent
  after:skew-x-[-20deg]
  hover:after:left-[140%]
  after:transition-all
  after:duration-700
"
>
  Top Kayou US Collectors
</button>
<button
  onClick={() => navigate("/faq")}
className="
  px-8 py-4 rounded-2xl

  bg-gradient-to-r
  from-[#16203D]
  via-[#1B2A52]
  to-[#24386B]

  text-[#E6E2F5]
  font-semibold

  border border-[#D8B45A]

  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.55)]
  hover:scale-[1.03]

  transition-all duration-300

  relative overflow-hidden

  before:content-['']
  before:absolute
  before:inset-[3px]
  before:rounded-[14px]
  before:border
  before:border-[#F8E38C]/70
  before:pointer-events-none

  after:content-['']
  after:absolute
  after:top-0
  after:left-[-120%]
  after:w-[60%]
  after:h-full
  after:bg-gradient-to-r
  after:from-transparent
  after:via-white/10
  after:to-transparent
  after:skew-x-[-20deg]
  hover:after:left-[140%]
  after:transition-all
  after:duration-700
"
>
  KAYOU US TUTORIAL
</button>
          </div>
        </div>

{/* RIGHT SIDE - CARD FAN */}
<div className="hidden lg:flex relative h-[500px] items-center justify-end pr-8">
  {/* Magical glow behind the fan */}
  <div
    className="
      absolute
      w-[320px] h-[320px]
      sm:w-[480px] sm:h-[480px]
      lg:w-[620px] lg:h-[620px]
      rounded-full
      blur-3xl
      opacity-75
      bg-[radial-gradient(circle,_rgba(255,214,102,0.28)_0%,_rgba(196,140,255,0.22)_30%,_rgba(124,75,184,0.12)_55%,_transparent_75%)]
      lg:-translate-x-8
    "
  />

  {/* Pre-made card fan image */}
  <img
    src="/website-assets/carddesignnmn.webp"
    alt="Kayou card fan"
className="
  relative
  z-10
  w-[min(760px,48vw)]
  h-auto
  max-w-full
  translate-y-2
  sm:translate-y-4
  lg:translate-y-4
  lg:translate-x-0
  xl:translate-x-12
  2xl:translate-x-24
  drop-shadow-[0_35px_90px_rgba(88,42,135,0.28)]
  select-none
  pointer-events-none
"
  />
</div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Cards Owned */}
        <div className="rounded-[28px]
bg-gradient-to-br
from-[#121A33]
via-[#17244D]
to-[#22366A]

text-white
p-6
shadow-[0_15px_40px_rgba(0,0,0,0.50)]
border border-[#D8B45A]

relative overflow-hidden

before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold text-[#DCCEEF]">
              total cards owned
            </span>
          </div>
          <div className="text-4xl font-bold">
            {stats.owned.toLocaleString()}
          </div>
        </div>

        {/* Sets Completed */}
        <div className="rounded-[28px]
bg-gradient-to-br
from-[#121A33]
via-[#17244D]
to-[#22366A]

text-white
p-6
shadow-[0_15px_40px_rgba(0,0,0,0.50)]
border border-[#D8B45A]

relative overflow-hidden

before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold text-[#DCCEEF]">
              Completed Sets
            </span>
          </div>
          <div className="text-4xl font-bold">{stats.completed}</div>
          <p className="text-xs mt-2 opacity-80">
            Promotional sets do not count.
          </p>
        </div>

        {/* Cards for Trade */}
        <div className="rounded-[28px]
bg-gradient-to-br
from-[#121A33]
via-[#17244D]
to-[#22366A]

text-white
p-6
shadow-[0_15px_40px_rgba(0,0,0,0.50)]
border border-[#D8B45A]

relative overflow-hidden

before:content-['']
before:absolute
before:inset-[4px]
before:rounded-[24px]
before:border
before:border-[#F8E38C]/60
before:pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <ArrowLeftRight className="w-6 h-6 text-[#F8E38C]" />
            <span className="text-sm uppercase tracking-wide font-semibold text-[#DCCEEF]">
              total for trade
            </span>
          </div>
          <div className="text-4xl font-bold">{stats.trades}</div>
        </div>

        {/* Mobile Social Icons */}
<div className="sm:hidden mt-8 flex items-center justify-center gap-6">
  <button
    onClick={() =>
      window.open("https://discord.gg/mlpekayou", "_blank")
    }
    className="
  inline-flex items-center justify-center

  w-14 h-14
  rounded-full

  bg-gradient-to-r
  from-[#16203D]
  via-[#1B2A52]
  to-[#24386B]

  border border-[#D8B45A]

  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.55)]
  hover:scale-105

  transition-all duration-300

  relative overflow-hidden

  before:content-['']
  before:absolute
  before:inset-[2px]
  before:rounded-full
  before:border
  before:border-[#F8E38C]/70
  before:pointer-events-none

  after:content-['']
  after:absolute
  after:top-0
  after:left-[-120%]
  after:w-[60%]
  after:h-full
  after:bg-gradient-to-r
  after:from-transparent
  after:via-white/10
  after:to-transparent
  after:skew-x-[-20deg]
  hover:after:left-[140%]
  after:transition-all
  after:duration-700
"
  >
    <img
      src="/website-assets/discordlogo.webp"
      alt="Discord"
      className="h-8 w-auto"
    />
  </button>

  <button
    onClick={() =>
      window.open("https://www.tiktok.com/@keanaex?_r=1&_t=ZP-96Ea5WXQqic", "_blank")
    }
    className="
  inline-flex items-center justify-center

  w-14 h-14
  rounded-full

  bg-gradient-to-r
  from-[#16203D]
  via-[#1B2A52]
  to-[#24386B]

  border border-[#D8B45A]

  shadow-[0_10px_30px_rgba(0,0,0,0.45)]
  hover:shadow-[0_15px_40px_rgba(0,0,0,0.55)]
  hover:scale-105

  transition-all duration-300

  relative overflow-hidden

  before:content-['']
  before:absolute
  before:inset-[2px]
  before:rounded-full
  before:border
  before:border-[#F8E38C]/70
  before:pointer-events-none

  after:content-['']
  after:absolute
  after:top-0
  after:left-[-120%]
  after:w-[60%]
  after:h-full
  after:bg-gradient-to-r
  after:from-transparent
  after:via-white/10
  after:to-transparent
  after:skew-x-[-20deg]
  hover:after:left-[140%]
  after:transition-all
  after:duration-700
"
  >
    <img
      src="/website-assets/tiktoklogo.webp"
      alt="TikTok"
      className="h-10 w-auto"
    />
  </button>
</div>
      </section>

{/* MOBILE INSTAGRAM-STYLE POSTS */}
<section className="sm:hidden mt-12 space-y-8">
  {[
  {
    id: "luna",
    image: lunaGif,
    username: "MLPEKAYOU",
    caption: "NIGHTMARE NIGHT LOOMS AROUND THE DARKENING CORNERS OF EQUESTRIA, THREATENING TO BRING NEW KAYOU US PRODUCTS TO YOU!",
  },

  {
    id: "discord",
    image: "/nightmarenight-assets/discordposter.webp",
    username: "KAYOU US",
    caption: "Discord! is coming to the My Little Pony Kayou US community soon, complete with a new chaotic theme and powerful card skills.",
  },

  {
    id: "triple",
    images: [
      "/nightmarenight-assets/nightmarenightposter.webp",
      "/nightmarenight-assets/nmnboxset.webp",
      "/nightmarenight-assets/nmnboosterbox.webp",
    ],
    username: "KAYOU US",
    caption: "The darkness of Nightmare Night looms closer to Equestria with each passing day, bringing Kayou US's new Nightmare Night themed TCG deck closer and closer.",
  },

  {
    id: "giftset",
    image: "/nightmarenight-assets/nmngiftset.webp",
    username: "KAYOU US",
    caption: "With Nightmare Night will come Kayou US's first available large gift set. This set will MSRP at $139.99 and come with an array of exclusive items. This gift set will include five Nightmare Night TCG booster packs, and an exclusive bonus pack with box art of the Mane 6 on them only available in this gift set. This set will also include a random card storage box, with designs featuring the Mane 6 characters in their Nightmare Night costumes. Lastly, this gift set will have a pack of 70 Nightmare Night themed card sleeves and a 3x3 grid binder with an exclusive Nightmare Night print on it.",
  },
].map((post) => (
    <div
      key={post.id}
      className="
  bg-[#121212]
  rounded-3xl
  overflow-hidden
  border border-[#262626]
"
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="w-10 h-10 rounded-full bg-[#3A3A3A] p-[2px]">
          <img
  src={
    post.username === "MLPEKAYOU"
      ? "/nightmarenight-assets/mareinthemoon.webp"
      : "/website-assets/KayouLogoPFP.webp"
  }
  alt={post.username}
  className="w-full h-full rounded-full object-cover bg-white"
/>
        </div>

        <div className="flex-1">
          <div className="font-semibold text-sm text-white">
            {post.username}
          </div>
        </div>
      </div>

<div className="p-4 pt-0">
  {post.images ? (
    <div className="relative">
      <div
  className="
    relative
    overflow-hidden
    rounded-3xl
    bg-black
    h-[500px]
  "
>
  <div
    className="
      absolute
      inset-0
      flex
      transition-transform
      duration-500
      ease-in-out
    "
          style={{
            transform: `translateX(-${(postSlides[post.id] ?? 0) * 100}%)`,
          }}
        >
          {post.images.map((img, index) => (
  <div
  key={index}
  className="
    relative
    w-full
    h-full
    shrink-0
  "
>
              <img
                src={img}
                alt={post.caption}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          setPostSlides((prev) => ({
            ...prev,
            [post.id]:
              ((prev[post.id] ?? 0) - 1 + post.images.length) %
              post.images.length,
          }))
        }
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 rounded-full w-9 h-9 text-white z-10"
      >
        ‹
      </button>

      <button
        onClick={() =>
          setPostSlides((prev) => ({
            ...prev,
            [post.id]:
              ((prev[post.id] ?? 0) + 1) %
              post.images.length,
          }))
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 rounded-full w-9 h-9 text-white z-10"
      >
        ›
      </button>

      <div className="flex justify-center gap-2 mt-3">
        {post.images.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              (postSlides[post.id] ?? 0) === i
                ? "bg-white"
                : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  ) : (
<div className="overflow-hidden rounded-3xl">
  <img
    src={post.image}
    alt={post.caption}
    className="w-full h-auto object-contain"
  />
</div>
  )}
</div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Ghost
              onClick={() => toggleLike(post.id)}
              className={`w-6 h-6 cursor-pointer transition ${
                likedPosts[post.id]
                  ? "fill-[#E85AA8] text-[#E85AA8]"
                  : "text-white"
              }`}
            />
            <Send className="w-6 h-6 text-white" />
          </div>

          <Bookmark className="w-6 h-6 text-white" />
        </div>

        <div className="text-sm font-semibold text-white mb-2">
          {(likeCounts[post.id] || 0).toLocaleString()} likes
        </div>

        <p className="text-sm leading-relaxed text-gray-200">
          <span className="font-semibold text-white mr-2">
            {post.username}
          </span>
          {post.caption}
        </p>
      </div>
    </div>
  ))}
</section>

{/* DESKTOP FACEBOOK-STYLE POSTS */}
<section className="hidden sm:block mt-12">
  <div className="max-w-5xl mx-auto space-y-8">
    {[
  {
    id: "luna",
    image: lunaGif,
    username: "MLPEKAYOU",
    caption: "NIGHTMARE NIGHT LOOMS AROUND THE DARKENING CORNERS OF EQUESTRIA, THREATENING TO BRING NEW KAYOU US PRODUCTS TO YOU!",
  },

  {
    id: "discord",
    image: "/nightmarenight-assets/discordposter.webp",
    username: "KAYOU US",
    caption: "Discord! is coming to the My Little Pony Kayou US community soon, complete with a new chaotic theme and powerful card skills.",
  },

  {
    id: "triple",
    images: [
      "/nightmarenight-assets/nightmarenightposter.webp",
      "/nightmarenight-assets/nmnboxset.webp",
      "/nightmarenight-assets/nmnboosterbox.webp",
    ],
    username: "KAYOU US",
    caption: "The darkness of Nightmare Night looms closer to Equestria with each passing day, bringing Kayou US's new Nightmare Night themed TCG deck closer and closer.",
  },

  {
    id: "giftset",
    image: "/nightmarenight-assets/nmngiftset.webp",
    username: "KAYOU US",
    caption: "With Nightmare Night will come Kayou US's first available large gift set. This set will MSRP at $139.99 and come with an array of exclusive items. This gift set will include five Nightmare Night TCG booster packs, and an exclusive bonus pack with box art of the Mane 6 on them only available in this gift set. This set will also include a random card storage box, with designs featuring the Mane 6 characters in their Nightmare Night costumes. Lastly, this gift set will have a pack of 70 Nightmare Night themed card sleeves and a 3x3 grid binder with an exclusive Nightmare Night print on it.",
  },
].map((post) => (
      <div
        key={post.id}
       className="
  bg-[#121212]
  rounded-3xl
  overflow-hidden
  border border-[#262626]
"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#262626]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-yellow-300 p-[2px]">
           <img
  src={
    post.username === "MLPEKAYOU"
      ? "/nightmarenight-assets/mareinthemoon.webp"
      : "/website-assets/KayouLogoPFP.webp"
  }
  alt={post.username}
  className="w-full h-full rounded-full object-cover bg-white"
/>
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm text-white">
              {post.username}
            </div>

            <div className="text-xs text-gray-400">
              1,000 Moons Ago · Public
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[320px_1fr]">
          <div className="bg-[#121212] p-5 flex items-center justify-center border-r border-[#262626]">
{post.images ? (
  <div className="relative w-full">
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-black
        h-[500px]
      "
    >
      <div
        className="
          absolute
          inset-0
          flex
          transition-transform
          duration-500
          ease-in-out
        "
        style={{
          transform: `translateX(-${(postSlides[post.id] ?? 0) * 100}%)`,
        }}
      >
        {post.images.map((img, index) => (
          <div
            key={index}
            className="
              relative
              w-full
              h-full
              shrink-0
            "
          >
            <img
              src={img}
              alt={post.caption}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={() =>
        setPostSlides((prev) => ({
          ...prev,
          [post.id]:
            ((prev[post.id] ?? 0) - 1 + post.images.length) %
            post.images.length,
        }))
      }
      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 rounded-full w-10 h-10 text-white z-10"
    >
      ‹
    </button>

    <button
      onClick={() =>
        setPostSlides((prev) => ({
          ...prev,
          [post.id]:
            ((prev[post.id] ?? 0) + 1) %
            post.images.length,
        }))
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 rounded-full w-10 h-10 text-white z-10"
    >
      ›
    </button>

    <div className="flex justify-center gap-2 mt-3">
      {post.images.map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            (postSlides[post.id] ?? 0) === i
              ? "bg-white"
              : "bg-white/30"
          }`}
        />
      ))}
    </div>
  </div>
) : (
  <img
    src={post.image}
    alt={post.caption}
    className="
      w-full
      max-w-[260px]
      h-auto
      rounded-3xl
      shadow-[0_15px_30px_rgba(95,55,145,0.10)]
    "
  />
)}
          </div>

          <div className="p-6 flex flex-col">
            <p className="text-sm leading-7 text-gray-200 mb-5">
              <span className="font-semibold text-white mr-2">
                {post.username}
              </span>
              {post.caption}
            </p>

            <div className="text-sm font-semibold text-white mb-5">
              {(likeCounts[post.id] || 0).toLocaleString()} likes
            </div>

            <div className="flex items-center gap-4">
              <Ghost
                onClick={() => toggleLike(post.id)}
                className={`w-6 h-6 cursor-pointer transition ${
                  likedPosts[post.id]
                    ? "fill-[white] text-[white]"
                    : "text-white"
                }`}
              />
              <Send className="w-6 h-6 text-white" />
              <Bookmark className="w-6 h-6 text-white ml-auto" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

    </div>

  </div>
);
};

export default Index;