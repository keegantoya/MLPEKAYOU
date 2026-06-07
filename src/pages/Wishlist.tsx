import { ChevronUp, Heart } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

import fluttershyCutieMark from "/website-assets/fluttershycutiemark.webp";
import applejackCutieMark from "/website-assets/applejackcutiemark.webp";
import pinkiePieCutieMark from "/website-assets/pinkiecutiemark.webp";
import rainbowDashCutieMark from "/website-assets/rainbowdashcutiemark.webp";
import rarityCutieMark from "/website-assets/raritycutiemark.webp";
import twilightSparkleCutieMark from "/website-assets/twilightcutiemark.webp";

const backgroundCutieMarks = [
  fluttershyCutieMark,
  applejackCutieMark,
  pinkiePieCutieMark,
  rainbowDashCutieMark,
  rarityCutieMark,
  twilightSparkleCutieMark,
];

const sets = [
  {
    id: "1",
    name: "Eternal Moon: First Edition",
    folder: "first-edition-moon",
    prefix: "M1",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 36,
      UR: 16,
      LSR: 15,
      SGR: 8,
      SC: 7,
    },
  },
  {
    id: "2",
    name: "Eternal Moon: Second Edition",
    folder: "second-edition-moon",
    prefix: "M2",
    rarities: {
      R: 30,
      SR: 20,
      SSR: 54,
      HR: 30,
      UR: 16,
      LSR: 16,
      SGR: 8,
      ZR: 7,
      SC: 7,
      "SHINING ZR": 1,
    },
  },
  {
  id: "3",
  name: "Eternal Moon: Third Edition",
  folder: "third-edition-moon",
  prefix: "M3",
  rarities: {
    R: 60,
    SR: 40,
    SSR: 40,
    HR: 60,
    UR: 18,
    LSR: 32,
    SGR: 16,
    ZR: 14,
    SC: 7,
    SZR: 3,
  },
},
  {
    id: "5",
    name: "Rainbow: First Edition",
    folder: "rainbow-one",
    prefix: "R1",
    rarities: {
      R: 30,
      SR: 15,
      FR: 18,
      TR: 12,
      TGR: 8,
      MTR: 18,
      SSR: 15,
      UR: 15,
      USR: 8,
      XR: 7,
    },
  },
  {
    id: "7",
    name: "Fun Moments: First Edition",
    folder: "fun-moments-one",
    prefix: "FM1",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      CR: 12,
    },
  },
  {
    id: "8",
    name: "Fun Moments Second Edition",
    folder: "fun-moments-two",
    prefix: "FM2",
    rarities: {
      N: 20,
      SN: 20,
      R: 35,
      SR: 15,
      SSR: 15,
      UR: 10,
      UGR: 9,
      CR: 12,
    },
  },
  {
  id: "11",
  name: "Fun Moments Third Edition",
  folder: "fun-moments-three",
  prefix: "FM3",
  rarities: {
    N: 20,
    SN: 20,
    R: 35,
    SR: 15,
    SSR: 15,
    UR: 10,
    UGR: 9,
    CR: 12,
    SCR: 12,
    }
  },
  {
  id: "6",
  name: "Rainbow: Second Edition",
  folder: "rainbow-two",
  prefix: "R2",
  rarities: {
    BASE: 18,
    R: 30,
    SR: 14,
    FR: 18,
    ST: 20,
    TR: 12,
    TGR: 8,
    SSR: 15,
    UR: 19,
    USR: 8,
    XR: 8
  }
},
{
  id: "4",
  name: "Star: First Edition",
  folder: "star-one",
  prefix: "S1",
  rarities: {
    SSR: 20,
    SCR: 18,
    UR: 18,
    USR: 15,
    AR: 9,
    OR: 7,
    BP: 9,
    SAR: 9
  }
},
  {
    id: "9",
    name: "Promos",
    folder: "promo-cards",
    prefix: "PR",
    rarities: {
      PR: 6,
    },
  },
  {
    id: "10",
    name: "Serialized & Limited Cards",
    folder: "serialized-limited-cards",
    prefix: "LC",
    rarities: {
      LC: 1,
    },
  },
  {
  id: "SD",
  name: "Friendships Begin",
  folder: "friendships-begin",
  prefix: "SD01",
  rarities: {
    C: 9,
    U: 7,
    SR: 6,
    SPR: 10,
    GR: 6,
    CR: 6,
    ER: 6,
    PER: 12,
    PRR: 6,
  },
},
{
  id: "FW",
  name: "Fantasy Wonderland",
  folder: "fantasy-wonderland",
  prefix: "BP01",
  rarities: {
    C: 48,
    U: 18,
    ER: 6,
    SR: 14,
    SPR: 28,
    GR: 12,
    CR: 12,
    RR: 6,
    PER: 12,
    PSPR: 11,
    PGR: 6,
    PCR: 12,
    PRR: 6,
    },
  },
  {
    id: "tcgpromos",
    name: "TCG Promos",
    folder: "tcgpromos",
    prefix: "RR",
    rarities: {
      RR: 6,
    },
  },
];

const setGroups = [
  {
    label: "Star",
    setIds: ["4"],
  },
  {
  label: "Moon",
  setIds: ["1", "2", "3"],
},
  {
    label: "Rainbow",
    setIds: ["5", "6"],
  },
  {
  label: "Fun Moments",
  setIds: ["7", "8", "11"],
},
  {
    label: "Promos",
    setIds: ["9", "10", "tcgpromos"],
  },
  {
    label: "TCG",
    setIds: ["FW", "SD"],
  },
];

function getWishlistCardsForSet(setId: string) {
  if (setId === "SD") {
    const structures: Record<string, string[]> = {
      C: Array.from({ length: 9 }, (_, i) => `SD01C${String(i + 1).padStart(2, "0")}`),
      U: Array.from({ length: 7 }, (_, i) => `SD01U${String(i + 1).padStart(2, "0")}`),
      ER: Array.from({ length: 6 }, (_, i) => `SD01ER${String(i + 1).padStart(2, "0")}`),
      SR: Array.from({ length: 6 }, (_, i) => `SD01SR${String(i + 1).padStart(2, "0")}`),
      SPR: Array.from({ length: 10 }, (_, i) => `SD01SPR${String(i + 1).padStart(2, "0")}`),
      GR: Array.from({ length: 6 }, (_, i) => `SD01GR${String(i + 1).padStart(2, "0")}`),
      CR: Array.from({ length: 6 }, (_, i) => `SD01CR${String(i + 1).padStart(2, "0")}`),
      PER: Array.from({ length: 12 }, (_, i) => `SD01PER${String(i + 7).padStart(2, "0")}`),
      PRR: Array.from({ length: 6 }, (_, i) => `SD01PRR${String(i + 1).padStart(2, "0")}`),
    };

    return Object.entries(structures).flatMap(([rarity, keys]) =>
      keys.map((card_key) => ({
        set_id: "SD",
        rarity,
        card_key,
      }))
    );
  }

if (setId === "FW") {
  const structures: Record<string, string[]> = {
    C: Array.from(
      { length: 48 },
      (_, i) => `BP01C${String(i + 1).padStart(2, "0")}`
    ),
    U: Array.from(
      { length: 18 },
      (_, i) => `BP01U${String(i + 1).padStart(2, "0")}`
    ),

    ER: Array.from(
      { length: 6 },
      (_, i) => `BP01ER${String(i + 7).padStart(2, "0")}`
    ),

    SR: Array.from(
      { length: 14 },
      (_, i) => `BP01SR${String(i + 1).padStart(2, "0")}`
    ),
    SPR: Array.from(
      { length: 28 },
      (_, i) => `BP01SPR${String(i + 1).padStart(2, "0")}`
    ),
    GR: Array.from(
      { length: 12 },
      (_, i) => `BP01GR${String(i + 1).padStart(2, "0")}`
    ),
    CR: Array.from(
      { length: 12 },
      (_, i) => `BP01CR${String(i + 1).padStart(2, "0")}`
    ),
    RR: Array.from(
      { length: 6 },
      (_, i) => `BP01RR${String(i + 1).padStart(2, "0")}`
    ),

    PER: Array.from(
      { length: 12 },
      (_, i) => `BP01PER${String(i + 1).padStart(2, "0")}`
    ),

    PSPR: [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21].map(
      (n) => `BP01PSPR${String(n).padStart(2, "0")}`
    ),

    PGR: Array.from(
      { length: 6 },
      (_, i) => `BP01PGR${String(i + 1).padStart(2, "0")}`
    ),
    PCR: Array.from(
      { length: 12 },
      (_, i) => `BP01PCR${String(i + 1).padStart(2, "0")}`
    ),
    PRR: Array.from(
      { length: 6 },
      (_, i) => `BP01PRR${String(i + 1).padStart(2, "0")}`
    ),
  };

  return Object.entries(structures).flatMap(([rarity, keys]) =>
    keys.map((card_key) => ({
      set_id: "FW",
      rarity,
      card_key,
    }))
  );
}

  if (setId === "tcgpromos") {
    return Array.from({ length: 6 }, (_, i) => ({
      set_id: "tcgpromos",
      rarity: "PR",
      card_key: `RR${String(i + 1).padStart(2, "0")}`,
    }));
  }

  return [];
}

function getWishlistCardImage(card: {
  set_id: string;
  card_key: string;
}) {
  if (!card) return "";

  if (
    String(card.set_id) === "SD" ||
    String(card.set_id) === "friendshipsbegin"
  ) {
    const key = String(card.card_key)
      .replace(/^BONUS-/, "")
      .replace(/^STARTER-/, "");

    return `/friendships-begin/${key}.webp`;
  }

  if (String(card.set_id) === "FW") {
    const key = String(card.card_key);

    return key.startsWith("BP01ER")
      ? `/fantasy-wonderland/SD01ER${key.slice(-2)}.webp`
      : key.startsWith("BP01PER")
      ? `/fantasy-wonderland/SD01PER${key.slice(-2)}.webp`
      : `/fantasy-wonderland/${key}.webp`;
  }

  if (String(card.set_id) === "tcgpromos") {
    return `/tcgpromos/${card.card_key}.webp`;
  }

  if (String(card.set_id) === "9") {
    const number = String(card.card_key).split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  if (String(card.set_id) === "10") {
    return "/serialized-limited-cards/andypricepromo.webp";
  }

  const [rarityRaw, number] = String(card.card_key).split("-");
  const rarity = rarityRaw === "SHINING ZR" ? "SZR" : rarityRaw;

const config: Record<string, { folder: string; prefix: string }> = {
  "1": { folder: "first-edition-moon", prefix: "M1" },
  "2": { folder: "second-edition-moon", prefix: "M2" },
  "3": { folder: "third-edition-moon", prefix: "M3" },
  "4": { folder: "star-one", prefix: "S1" },
  "5": { folder: "rainbow-one", prefix: "R1" },
  "6": { folder: "rainbow-two", prefix: "R2" },
  "7": { folder: "fun-moments-one", prefix: "FM1" },
  "8": { folder: "fun-moments-two", prefix: "FM2" },
  "11": { folder: "fun-moments-three", prefix: "FM3" },
};

  const c = config[String(card.set_id)];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(
  number
).padStart(3, "0")}${
  String(card.set_id) === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
}


const Wishlist = () => {
  const [mode, setMode] = useState<"CCG" | "TCG">("CCG");
  const [selectedSetId, setSelectedSetId] = useState<string>("1");
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);
const [hideISO, setHideISO] = useState(false);
const [hideWishlist, setHideWishlist] = useState(false);
const [showSetList, setShowSetList] = useState(true);
const [expandedGroup, setExpandedGroup] = useState<string | null>("Moon");
const [showBackToTop, setShowBackToTop] = useState(false);
    
useEffect(() => {
  const loadWishlist = async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    setUserId(user.id);

const { data: profile } = await supabase
  .from("profiles")
  .select("hide_iso, hide_wishlist")
  .eq("id", user.id)
  .single();

setHideISO(profile?.hide_iso ?? false);
setHideWishlist(profile?.hide_wishlist ?? false);

    const { data: items } = await supabase
      .from("wishlists")
      .select("card_key")
      .eq("user_id", user.id);

    const saved = new Set(
      (items || []).map((item) => item.card_key)
    );

    setWishlist(saved);
  };

  loadWishlist();
}, []);

useEffect(() => {
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 600);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

const toggleWishlist = async (
  setId: string,
  cardKey: string
) => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user) return;

  const fullKey = `${setId}:${cardKey}`;
  const isSaved = wishlist.has(fullKey);

  const next = new Set(wishlist);

  if (isSaved) {
    next.delete(fullKey);

    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("card_key", fullKey);
  } else {
    next.add(fullKey);

    await supabase.from("wishlists").insert({
      user_id: user.id,
      card_key: fullKey,
    });
  }

  setWishlist(next);
};

const toggleHideISO = async () => {
  if (!userId) return;

  const next = !hideISO;
  setHideISO(next);

  await supabase
    .from("profiles")
    .update({ hide_iso: next })
    .eq("id", userId);
};

const toggleHideWishlist = async () => {
  if (!userId) return;

  const next = !hideWishlist;
  setHideWishlist(next);

  await supabase
    .from("profiles")
    .update({ hide_wishlist: next })
    .eq("id", userId);
};

  return (
<div
  className="relative min-h-screen"
    style={{
  backgroundColor: "#F8F3FF",
  backgroundImage: `
    radial-gradient(circle at 15% 20%, rgba(244, 200, 74, 0.12) 0%, transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 25% 75%, rgba(168, 85, 247, 0.10) 0%, transparent 35%),
    radial-gradient(circle at 75% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(
      180deg,
      #FCF9FF 0%,
      #F8F1FF 35%,
      #F5EEFF 65%,
      #FAF6FF 100%
    )
  `,
}}
    >


{/* Background Cutie Marks */}
<div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
  {(() => {
    const placed: Array<{
      left: number;
      top: number;
      size: number;
    }> = [];

    const marks: React.ReactNode[] = [];
    const targetCount =
      typeof window !== "undefined" && window.innerWidth < 768
        ? 70
        : 140;
    const maxAttempts = 5000;

    // Use actual viewport dimensions so spacing is calculated correctly
    // on both desktop and mobile.
    const viewportWidth =
      typeof window !== "undefined"
        ? window.innerWidth
        : 1920;
    const viewportHeight =
      typeof window !== "undefined"
        ? window.innerHeight
        : 1080;

    for (
      let i = 0, attempts = 0;
      i < targetCount && attempts < maxAttempts;
      attempts++
    ) {
      const mark =
        backgroundCutieMarks[
          i % backgroundCutieMarks.length
        ];

      const size = 36 + ((i * 17) % 52);
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const rotation = Math.random() * 360;
      const flip = Math.random() > 0.5 ? -1 : 1;

      // Convert percentage positions to real pixel coordinates
      const x = (left / 100) * viewportWidth;
      const y = (top / 100) * viewportHeight;

      const tooClose = placed.some((p) => {
        const px = (p.left / 100) * viewportWidth;
        const py = (p.top / 100) * viewportHeight;

        const dx = x - px;
        const dy = y - py;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Require enough room based on both icon sizes
        const minDistance =
          (size + p.size) / 2 + 20;

        return distance < minDistance;
      });

      if (tooClose) {
        continue;
      }

      placed.push({ left, top, size });

      marks.push(
        <img
          key={i}
          src={mark}
          alt=""
          className="absolute select-none"
          style={{
            width: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            opacity: 0.1,
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${flip})`,
          }}
        />
      );

      i++;
    }

    return marks;
  })()}
</div>

      <div className="relative z-10 container py-8">
        {/* Header */}
        <div className="relative z-40 rounded-3xl border border-[#d4af37]/40 bg-white/70 backdrop-blur-md shadow-lg px-5 py-5 mb-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
<div className="flex items-center justify-center gap-3">

  <h1
    className="text-4xl sm:text-5xl md:text-6xl font-bold
               tracking-[0.04em] text-[#5a3e84]"
    style={{
      fontFamily:
        '"Playfair Display", "Cormorant Garamond", "Garamond", serif',
      fontStyle: "italic",
      letterSpacing: "0.06em",
    }}
  >
    Wishlist
  </h1>
</div>

            <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
              You can choose to display your wishlist and your ISO, or hide your ISO from public view and display only your wishlist.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
  <button
    onClick={toggleHideISO}
    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition ${
      hideISO
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84] border-[#d4af37]/40"
    }`}
  >
    {hideISO ? "✓ " : ""}DO NOT SHOW ISO
  </button>

  <button
    onClick={toggleHideWishlist}
    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition ${
      hideWishlist
        ? "bg-[#5a3e84] text-[#f5e6a8] border-[#d4af37]"
        : "bg-white text-[#5a3e84] border-[#d4af37]/40"
    }`}
  >
    {hideWishlist ? "✓ " : ""}DO NOT SHOW WISHLIST
  </button>
</div>
          </div>
        </div>

{/* CONTENT AREA */}
<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:gap-6">
  {/* LEFT SIDEBAR — ALL SETS */}
  <div className="rounded-3xl border border-[#d4af37]/40 bg-white/70 backdrop-blur-md shadow-lg p-3 sm:p-4 h-fit">
    <button
  onClick={() => setSelectedSetId("FULL_WISHLIST")}
  className={`w-full mb-4 px-4 py-3 rounded-2xl border font-semibold text-sm transition ${
    selectedSetId === "FULL_WISHLIST"
      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-md"
      : "bg-white/80 text-pink-600 border-pink-200 hover:bg-pink-50"
  }`}
>
  See Full Wishlist
</button>

<button
onClick={() => setShowSetList(!showSetList)}
  className="w-full flex items-center justify-between mb-4 px-4 py-3 rounded-2xl border bg-white/50 hover:bg-white border-transparent hover:border-[#d4af37]/30 text-[#5a3e84] transition"
>
  <span className="text-xs tracking-[0.25em] font-semibold uppercase text-[#8b6a2b]">
    All Sets
  </span>
  <span className="text-lg leading-none">
    {expandedGroup === "__ALL_SETS__" ? "−" : "+"}
  </span>
</button>

{showSetList && (
  <div className="space-y-2">
  {setGroups.map((group) => (
    <div key={group.label} className="space-y-2">
      {/* Category Button */}
      <button
        onClick={() =>
          setExpandedGroup(
            expandedGroup === group.label ? null : group.label
          )
        }
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border bg-white/50 hover:bg-white border-transparent hover:border-[#d4af37]/30 text-[#5a3e84] transition"
      >
        <span className="font-semibold text-sm">
          {group.label}
        </span>
        <span className="text-lg leading-none">
          {expandedGroup === group.label ? "−" : "+"}
        </span>
      </button>

      {/* Set Buttons */}
      {expandedGroup === group.label &&
        group.setIds.map((setId) => {
          const set = sets.find((s) => s.id === setId);
          if (!set) return null;

          return (
            <button
              key={set.id}
              onClick={() => setSelectedSetId(set.id)}
              className={`w-full text-left px-4 py-2 rounded-xl border transition ${
                selectedSetId === set.id
                  ? "bg-gray-200 text-[#5a3e84] border-gray-300 shadow-sm"
                  : "bg-white/40 hover:bg-white border-transparent hover:border-[#d4af37]/30 text-[#5a3e84]"
              }`}
            >
              <div className="font-medium text-sm leading-tight text-gray-500">
{set.name
  .replace(/^Eternal Moon:?\s*/, "")
  .replace(/^Rainbow:?\s*/, "")
  .replace(/^Fun Moments:?\s*/, "")}
              </div>
            </button>
          );
        })}
    </div>
  ))}
  </div>
)}
  </div>

  {/* RIGHT CONTENT — WISHLIST CARDS */}
  <div className="rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-white/80 to-[#f6f0ff]/70 backdrop-blur-sm shadow-lg p-3 sm:p-6 lg:p-8">
    {(() => {
        if (selectedSetId === "FULL_WISHLIST") {
const wishlistCards = Array.from(wishlist)
  .filter((entry) => entry !== "9:PR-006")
  .map((entry) => {
    const [set_id, card_key] = entry.split(":");
    return { set_id, card_key };
  });

  if (wishlistCards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Your wishlist is empty.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
        <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
          Full Wishlist
        </span>
        <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {wishlistCards.map((card) => (
          <div
  key={`${card.set_id}:${card.card_key}`}
  className={`relative w-full group cursor-pointer ${
    card.set_id === "3" &&
    card.card_key === "SZR-001"
      ? "col-span-2 aspect-[10/7]"
      : "aspect-[5/7]"
  }`}
  onClick={() =>
    toggleWishlist(card.set_id, card.card_key)
  }
>
  <img
    src={getWishlistCardImage(card)}
    alt={card.card_key}
    className="rounded-xl w-full h-full object-cover shadow-md ring-4 ring-pink-400 ring-offset-2"
  />

  <div className="absolute top-2 right-2 z-10 bg-white/95 rounded-full p-1.5 shadow-lg">
    <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
  </div>
</div>
        ))}
      </div>
    </div>
  );
}
      const selectedSet = sets.find((set) => set.id === selectedSetId);

      if (!selectedSet) {
        return (
          <div className="text-center py-12">
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Select a Set
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose a set from the left to view all available cards.
            </p>
          </div>
        );
      }

const cards =
  selectedSet.id === "9"
    ? [1, 2, 3, 4, 5, 7].map((number) => ({
        rarity: "PR",
        number,
      }))
    : selectedSet.id === "SD" ||
      selectedSet.id === "FW" ||
      selectedSet.id === "tcgpromos"
    ? getWishlistCardsForSet(selectedSet.id)
    : Object.entries(selectedSet.rarities).flatMap(
        ([rarity, count]) =>
          Array.from({ length: count as number }, (_, i) => ({
            rarity,
            number: i + 1,
          }))
      );

      const getRarityCode = (rarity: string) => {
        if (rarity === "SHINING ZR") return "SZR";
        return rarity;
      };

      return (
        <div>
          {/* Set Title */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
            <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
              {selectedSet.name}
            </span>
            <div className="h-px bg-[#d4af37]/50 flex-1 max-w-[120px]" />
          </div>

          

{/* Rarity Navigation */}
{!["9", "10", "tcgpromos"].includes(selectedSet.id) && (
  <div className="flex flex-wrap justify-center gap-2 mb-6">
    {[...new Set(cards.map((card) => card.rarity))].map((rarity) => (
      <button
        key={rarity}
        onClick={() => {
          document
            .getElementById(`rarity-${rarity}`)
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }}
        className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white border border-[#d4af37]/40 text-[#5a3e84] hover:bg-[#f8f3ff] transition"
      >
        {rarity === "LC"
          ? "PR"
          : rarity === "SHINING ZR"
          ? "◇ZR"
          : rarity === "SZR"
          ? "◇ZR"
          : rarity === "SCR"
          ? "◇CR"
          : rarity === "SN"
          ? "◇N"
          : rarity === "PER"
          ? "※ER"
          : rarity === "PSPR"
          ? "※SPR"
          : rarity === "PGR"
          ? "※GR"
          : rarity === "PCR"
          ? "※CR"
          : rarity === "PRR"
          ? "※RR"
          : rarity}
      </button>
    ))}
  </div>
)}

{/* Cards Grouped by Rarity */}
<div className="space-y-8">
  {[...new Set(cards.map((card) => card.rarity))].map((rarity) => {
    const rarityCards = cards.filter((card) => card.rarity === rarity);

    return (
<div
  key={rarity}
  id={`rarity-${rarity}`}
  className="scroll-mt-32"
>
  {!["9", "10", "tcgpromos"].includes(selectedSet.id) && (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[120px]" />
      <span className="text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
            {rarity === "LC"
  ? "PR"
  : rarity === "SHINING ZR"
  ? "◇ZR"
  : rarity === "SZR"
  ? "◇ZR"
  : rarity === "SCR"
          ? "◇CR"
          : rarity === "SN"
          ? "◇N"
  : rarity === "PER"
  ? "※ER"
  : rarity === "PSPR"
  ? "※SPR"
  : rarity === "PGR"
  ? "※GR"
  : rarity === "PCR"
  ? "※CR"
  : rarity === "PRR"
  ? "※RR"
  : rarity}
          </span>
          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[120px]" />
        </div>
          )}

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-w-none">
          {rarityCards.map((card) => {
            const imageSrc =
              "card_key" in card
                ? getWishlistCardImage(card)
                : selectedSet.id === "9"
                ? `/promo-cards/mlpepr${String(card.number).padStart(
                    3,
                    "0"
                  )}.webp`
                : selectedSet.id === "10"
                ? "/serialized-limited-cards/andypricepromo.webp"
                : `/cards/${selectedSet.folder}/${selectedSet.prefix}${getRarityCode(
  card.rarity
)}${String(card.number).padStart(3, "0")}${
  selectedSet.id === "6" &&
  ["ST", "TR", "TGR"].includes(card.rarity)
    ? ".webp"
    : ".webp"
}`;

                  const cardKey =
  "card_key" in card
    ? card.card_key
    : `${card.rarity}-${String(card.number).padStart(3, "0")}`;

const fullKey = `${selectedSet.id}:${cardKey}`;
const isWishlisted = wishlist.has(fullKey);

return (
  <div
  key={
    "card_key" in card
      ? `${card.set_id}-${card.card_key}`
      : `${selectedSet.id}-${card.rarity}-${card.number}`
  }
  className={`relative w-full group cursor-pointer ${
    selectedSet.id === "3" &&
    card.rarity === "SZR" &&
    !("card_key" in card) &&
    card.number === 1
      ? "col-span-2 aspect-[10/7]"
      : "aspect-[5/7]"
  }`}
  onClick={() => toggleWishlist(selectedSet.id, cardKey)}
>
    <img
      src={imageSrc}
      alt={
        "card_key" in card
          ? card.card_key
          : `${selectedSet.prefix}${card.rarity}${card.number}`
      }
      className={`rounded-xl w-full h-full object-cover shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-xl ${
        isWishlisted
          ? "ring-4 ring-pink-400 ring-offset-2"
          : ""
      }`}
    />

    {isWishlisted && (
  <div className="absolute top-2 right-2 z-10 bg-white/95 rounded-full p-1.5 shadow-lg">
    <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
  </div>
)}
  </div>
);
          })}
        </div>
      </div>
    );
  })}
</div>
        </div>
      );
    })()}
  </div>
</div>
      </div>

{showBackToTop && (
  <button
    onClick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
    className="
      fixed
      bottom-32 sm:bottom-6
      right-4 sm:right-6
      z-[99999]
      w-11 h-11
      rounded-full
      bg-gradient-to-r
      from-[#7c5aa6]
      to-[#5a3e84]
      text-[#f5e6a8]
      border border-[#d4af37]/60
      shadow-2xl
      active:scale-95
      transition
      flex items-center justify-center
    "
    aria-label="Back to top"
  >
    <ChevronUp className="w-5 h-5" />
  </button>
)}
    </div>
  );
};

export default Wishlist;