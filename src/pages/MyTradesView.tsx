import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
  listing_type: "trade" | "purchase";
};

export default function MyTradesView() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState<TradeCard[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedCard, setSelectedCard] = useState<TradeCard | null>(null);
const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!setId) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

const { data: trades } = await supabase
  .from("for_trade")
  .select("id, user_id, set_id, card_key, listing_type")
  .eq("user_id", user.id);

      const filtered = (trades || []).filter((card) => {
  // Friendships Begin (bonus + starters all live under same set_id)
  if (setId === "SD_BONUS" || setId === "SD_STARTERS") {
    return card.set_id === "friendshipsbegin";
  }

  return String(card.set_id) === String(setId);
});

setCards(filtered);
const { data: activeCards } = await supabase
  .from("actively_trading_cards")
  .select("set_id, card_key")
  .eq("user_id", user.id);

const activeSet = new Set(
  (activeCards || []).map(
    (card) => `${card.set_id}-${card.card_key}`
  )
);

const map: Record<string, boolean> = {};
(filtered || []).forEach((c) => {
  map[c.id] = activeSet.has(`${c.set_id}-${c.card_key}`);
});

setActiveMap(map);
      setLoading(false);
    };

    load();
  }, [setId]);
  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      setSelectedCard(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const getRarityCode = (rarity: string) => {
  if (rarity === "SHINING ZR") return "SZR";
  return rarity;
};

  const getCardImage = (card: TradeCard) => {

 if (card.set_id === "friendshipsbegin") {
  return `/friendships-begin/${card.card_key}.webp`;
}

if (card.set_id === "FW") {

  const num = card.card_key.slice(-2);

  if (card.card_key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${num}.webp`;
  }

  if (card.card_key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${num}.webp`;
  }

  return `/fantasy-wonderland/${card.card_key}.webp`;
}

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.webp`;
  }

  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.webp`;
}

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity = getRarityCode(rarityRaw);

  const config: any = {
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

  const c = config[card.set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}${
  card.set_id === "6" &&
  ["ST", "TR", "TGR"].includes(rarity)
    ? ".webp"
    : ".webp"
}`;
};

const markCompleted = async () => {
  if (!selectedCard) return;

  await supabase
    .from("for_trade")
    .delete()
    .eq("id", selectedCard.id);

  setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
  setSelectedCard(null);
};

const toggleActive = async () => {
  if (!selectedCard) return;

  const current = activeMap[selectedCard.id];

  if (current) {
    await supabase
      .from("actively_trading_cards")
      .delete()
      .eq("user_id", selectedCard.user_id)
      .eq("set_id", selectedCard.set_id)
      .eq("card_key", selectedCard.card_key);
  } else {
    await supabase
      .from("actively_trading_cards")
      .insert({
        user_id: selectedCard.user_id,
        set_id: selectedCard.set_id,
        card_key: selectedCard.card_key,
      });
  }

  setActiveMap((prev) => ({
    ...prev,
    [selectedCard.id]: !current,
  }));

  setSelectedCard(null);
};

  return (
<div
  className="min-h-screen pb-[100px] sm:pb-0"
  style={{
    background: `
      radial-gradient(circle at top, rgba(255,255,255,.035), transparent 45%),
      linear-gradient(180deg,#090909 0%,#111111 45%,#0a0a0a 100%)
    `,
  }}
>

<div className="max-w-7xl mx-auto px-5 py-8">

  <div className="mb-10">
    <button
      onClick={() => navigate("/inventory")}
      className="
        group
        inline-flex
        items-center
        gap-3
        rounded-2xl
        border
        border-[#2f2f2f]
        bg-[#181818]
        px-5
        py-3
        text-white
        transition-all
        duration-200
        hover:border-[#d4af37]
        hover:bg-[#202020]
        hover:-translate-y-0.5
      "
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#393939] bg-[#232323]">
        <ArrowLeft className="h-5 w-5" />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#808080]">
          Inventory
        </div>
        <div className="font-semibold">
          Back to My Trades
        </div>
      </div>
    </button>
  </div>

  <div className="relative overflow-hidden rounded-[34px] border border-[#2b2b2b] bg-gradient-to-b from-[#1d1d1d] via-[#171717] to-[#101010] shadow-[0_22px_60px_rgba(0,0,0,.65)] mb-10">

    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,.06),transparent_55%)] pointer-events-none" />

    <div className="relative z-10 px-10 py-10 text-center">

      <div className="text-[11px] uppercase tracking-[0.4em] text-[#7f7f7f] mb-3">
        Trade Inventory
      </div>

      <h1 className="text-5xl font-black text-[#f5f5f5] tracking-tight">
        Your Active Duplicates
      </h1>

      <div className="mx-auto mt-6 mb-7 h-[3px] w-28 rounded-full bg-gradient-to-r from-[#8a6b19] via-[#d4af37] to-[#8a6b19]" />

      <p className="mx-auto max-w-3xl text-[15px] leading-7 text-[#b9b9b9]">
        Manage your active trades and purchase offers. Click a card to mark it as completed or indicate that it is actively being traded.
      </p>

    </div>

  </div>

        {loading && <div className="text-center">Loading...</div>}

        {!loading && cards.length === 0 && (
          <div className="text-center text-muted-foreground">
            You have no cards marked for trade in this set.
          </div>
        )}

       <div className="space-y-8">

  {Object.entries(
    cards.reduce((acc: Record<string, TradeCard[]>, card) => {

  let rarity = card.card_key.split("-")[0];

  // Fantasy Wonderland + Friendships Begin
  if (card.set_id === "FW" || card.set_id === "friendshipsbegin") {

    const match = card.card_key.match(
      /(PSPR|PCR|PGR|PER|PRR|SPR|SGR|LSR|SSR|SZR|GR|CR|RR|SR|ER|ZR|HR|UR|R|U|C)/
    );

    rarity = match?.[0] || "OTHER";

if (rarity === "PER") rarity = "※ER";
if (rarity === "PSPR") rarity = "※SPR";
if (rarity === "PCR") rarity = "※CR";
if (rarity === "PRR") rarity = "※RR";
if (rarity === "PGR") rarity = "※GR";
  }

  if (!acc[rarity]) {
    acc[rarity] = [];
  }

  acc[rarity].push(card);

  return acc;

}, {})
  )
    .sort(([a], [b]) => {

  const rarityOrders: Record<string, string[]> = {
    "1": ["R","SR","SSR","HR","UR","LSR","SGR","SC"],
    "2": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SHINING ZR"],
    "3": ["R","SR","SSR","HR","UR","LSR","SGR","ZR","SC","SZR"],
    "4": ["SSR","SCR","UR","USR","AR","OR","BP","SAR"],
    "5": ["R","SR","FR","TR","TGR","MTR","SSR","UR","USR","XR"],
    "6": ["BASE","R","SR","ST","SSR","FR","TR","TGR","UR","USR","XR"],
    "7": ["N","SN","R","SR","SSR","UR","CR"],
    "8": ["N","SN","R","SR","SSR","UR","UGR","CR"],
    "11": ["N","SN","R","SR","SSR","UR","UGR","CR","SCR"],
  };

  const currentOrder =
    rarityOrders[String(setId)] || [];

  return (
    currentOrder.indexOf(a) -
    currentOrder.indexOf(b)
  );
})
    .map(([rarity, rarityCards]) => (

      <div key={rarity}>

        {/* RARITY HEADER */}
        <div className="relative flex items-center justify-center gap-3 mb-4">

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[120px]" />

          <span className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold text-[#8b6a2b] uppercase">
  {rarity === "SHINING ZR" || rarity === "SZR"
    ? "◇ZR"
    : rarity === "SN"
    ? "◇N"
    : rarity === "SCR" && String(setId) !== "4"
? "◇CR"
    : rarity === "SAR"
    ? "◇AR"
    : rarity}
</span>

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[120px]" />

        </div>

        {/* CARD GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">

          {rarityCards
            .sort((a, b) => {
              const numA = parseInt(a.card_key.split("-")[1]);
              const numB = parseInt(b.card_key.split("-")[1]);
              return numA - numB;
            })
            .map((card) => {

              const [rarity, number] = card.card_key.split("-");

              const isDoubleCard =
                card.set_id === "3" &&
                rarity === "SZR" &&
                Number(number) === 1;

              return (
                <div
                  key={card.id}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const screenWidth = window.innerWidth;
                    const cardCenter = rect.left + rect.width / 2;

                    let adjustedLeft = cardCenter;

                    if (cardCenter < screenWidth * 0.3) {
                      adjustedLeft = rect.left + rect.width + 20;
                    } else if (cardCenter > screenWidth * 0.7) {
                      adjustedLeft = rect.left - 20;
                    }

                    setPopupPos({
                      top: rect.top + window.scrollY,
                      left: adjustedLeft + window.scrollX,
                    });

                    setSelectedCard(card);
                  }}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-black/20 transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl ${
                    isDoubleCard ? "col-span-2 aspect-[10/7]" : "aspect-[5/7]"
                  }`}
                >

                  {card.set_id === "11" &&
card.card_key === "N-10" ? (
  <div className="w-full h-full bg-slate-100 flex items-center justify-center p-3 text-center">
    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
      FME03-N-010
      <br />
      Waiting for Kayou to send image.
    </p>
  </div>
) : (
  <img
    src={getCardImage(card)}
    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
  />
)}

                  {activeMap[card.id] && (
                    <div className="absolute inset-0 rounded-md overflow-hidden bg-gradient-to-br from-purple-700/90 to-fuchsia-900/90 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs md:text-sm font-black tracking-wider text-center px-2 leading-tight drop-shadow-lg">
                        ACTIVELY
                        <br />
                        TRADING
                      </span>
                    </div>
                  )}

                  <div
  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white/20 ${
    card.listing_type === "trade"
      ? "bg-green-500"
      : "bg-blue-500"
  }`}
>
  {card.listing_type === "trade" ? "⇄" : "$"}
</div>

                </div>
              );
            })}

        </div>

      </div>
    ))}

</div>

      </div>
{selectedCard && popupPos && (
  <div
    className="absolute z-50"
    style={{
      top: popupPos.top + 10,
      left: popupPos.left,
      transform: "translateX(-50%)",
    }}
  >
    <div
      ref={popupRef}
      className="rounded-2xl overflow-hidden border border-[#2f2f2f] bg-[#181818] shadow-[0_20px_50px_rgba(0,0,0,.65)] w-60"
    >

      <div className="px-4 py-3 border-b border-[#2c2c2c] bg-[#202020]">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#808080]">
          Card Options
        </p>
      </div>

      <button
        onClick={markCompleted}
        className="w-full px-5 py-4 text-left transition hover:bg-[#232323] flex items-center justify-between"
      >
        <span className="font-medium text-[#f5f5f5]">
          Mark as Completed
        </span>
        <span className="text-[#d4af37] text-lg">✓</span>
      </button>

      <div className="h-px bg-[#2c2c2c]" />

      <button
        onClick={toggleActive}
        className="w-full px-5 py-4 text-left transition hover:bg-[#232323] flex items-center justify-between"
      >
        <span className="font-medium text-[#f5f5f5]">
          Actively Trading
        </span>
        <span className="text-[#d4af37] text-lg">●</span>
      </button>

      <div className="h-px bg-[#2c2c2c]" />

      <button
        onClick={() => setSelectedCard(null)}
        className="w-full px-5 py-4 text-left text-[#9d9d9d] transition hover:bg-[#232323]"
      >
        Cancel
      </button>

    </div>
  </div>
)}
    </div>
  );
}