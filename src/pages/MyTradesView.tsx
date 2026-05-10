import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import KayouHeader from "@/components/KayouHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MyTradesSets from "@/pages/MyTradesSets";
import watermark from "@/assets/avatars/mlpekayouwiki.png";

type TradeCard = {
  id: string;
  user_id: string;
  set_id: string;
  card_key: string;
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
  .select("*")
  .eq("user_id", user.id);

      const filtered = (trades || []).filter((card) => {
  // Friendships Begin (bonus + starters all live under same set_id)
  if (setId === "SD_BONUS" || setId === "SD_STARTERS") {
    return card.set_id === "friendshipsbegin";
  }

  return String(card.set_id) === String(setId);
});

setCards(filtered);
const map: Record<string, boolean> = {};
(filtered || []).forEach((c) => {
  map[c.id] = (c as any).actively_trading || false;
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
  return `/friendships-begin/${card.card_key}.png`;
}

if (card.set_id === "FW") {

  const num = card.card_key.slice(-2);

  if (card.card_key.startsWith("BP01ER")) {
    return `/fantasy-wonderland/SD01ER${num}.png`;
  }

  if (card.card_key.startsWith("BP01PER")) {
    return `/fantasy-wonderland/SD01PER${num}.png`;
  }

  return `/fantasy-wonderland/${card.card_key}.png`;
}

  if (card.set_id === "9") {
    const number = card.card_key.split("-")[1];
    return `/promo-cards/mlpepr${String(number).padStart(3, "0")}.jpg`;
  }

  if (card.set_id === "tcgpromos") {
  return `/tcgpromos/${card.card_key}.png`;
}

  const [rarityRaw, number] = card.card_key.split("-");
  const rarity = getRarityCode(rarityRaw);

  const config: any = {
    "1": { folder: "first-edition-moon", prefix: "M1" },
    "2": { folder: "second-edition-moon", prefix: "M2" },
    "5": { folder: "rainbow-one", prefix: "R1" },
    "7": { folder: "fun-moments-one", prefix: "FM1" },
    "8": { folder: "fun-moments-two", prefix: "FM2" },
    "3": { folder: "third-edition-moon", prefix: "M3" },
  };

  const c = config[card.set_id];
  if (!c) return "";

  return `/cards/${c.folder}/${c.prefix}${rarity}${String(number).padStart(3, "0")}.jpg`;
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

  await supabase
    .from("for_trade")
    .update({ actively_trading: !current })
    .eq("id", selectedCard.id);

  setActiveMap((prev) => ({
    ...prev,
    [selectedCard.id]: !current,
  }));

  setSelectedCard(null);
};

  return (
    <div className="min-h-screen bg-background pb-[100px] sm:pb-0">
      <KayouHeader />

      <div className="container py-8">

        <div className="flex justify-center sm:justify-start mb-6">
  <button
    onClick={() => navigate("/my-trades")}
    className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d4af37]/50 bg-gradient-to-r from-[#2a163d]/95 to-[#4b2a6b]/95 hover:from-[#3a1f55] hover:to-[#5b357d] text-[#f6e27a] font-semibold shadow-lg shadow-purple-900/30 transition-all duration-200 hover:scale-105"
  >
    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
    Back to My Trades
  </button>
</div>

        <h1 className="text-3xl sm:text-4xl font-black text-center mb-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
          Your Cards Marked for Trade
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
  Manage your active trades and completed cards
</p>

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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rarity, rarityCards]) => (

      <div key={rarity}>

        {/* RARITY HEADER */}
        <div className="relative flex items-center justify-center gap-3 mb-4">

          <div className="h-px bg-[#d4af37]/40 flex-1 max-w-[120px]" />

          <span className="text-[10px] sm:text-xs tracking-[0.3em] font-semibold text-[#d4af37] uppercase">
            {rarity}
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

                  <img
                    src={getCardImage(card)}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {activeMap[card.id] && (
                    <div className="absolute inset-0 rounded-md overflow-hidden bg-gradient-to-br from-purple-700/90 to-fuchsia-900/90 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-white text-[10px] sm:text-xs md:text-sm font-black tracking-wider text-center px-2 leading-tight drop-shadow-lg">
                        ACTIVELY
                        <br />
                        TRADING
                      </span>
                    </div>
                  )}

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
      className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl w-52 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      
      <button
        onClick={markCompleted}
        className="w-full px-4 py-2 text-sm text-left hover:bg-green-500/10 transition flex items-center justify-between"
      >
        <span>Mark as Completed</span>
        <span className="text-green-500">✓</span>
      </button>

      <div className="h-px bg-white/10" />

      <button
        onClick={toggleActive}
        className="w-full px-4 py-2 text-sm text-left hover:bg-purple-500/10 transition flex items-center justify-between"
      >
        <span>Actively Trading</span>
        <span className="text-purple-400">●</span>
      </button>

      <div className="h-px bg-white/10" />

      <button
        onClick={() => setSelectedCard(null)}
        className="w-full px-4 py-2 text-sm text-left text-muted-foreground hover:bg-white/5 transition"
      >
        Cancel
      </button>

    </div>
  </div>
)}
    </div>
  );
}