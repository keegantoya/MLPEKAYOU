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
const [isLightMode, setIsLightMode] = useState(() => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.dataset.theme === "light" || root.classList.contains("light");
});
useEffect(() => {
  const syncTheme = () => {
    const root = document.documentElement;
    setIsLightMode(
      root.dataset.theme === "light" ||
      root.classList.contains("light") ||
      !root.classList.contains("dark")
    );
  };
  syncTheme();
  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  window.addEventListener("themechange", syncTheme);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", syncTheme);
  };
}, []);
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
if (card.set_id === "12") {
  return `/cards/discord/${card.card_key}.webp`;
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
      className={`min-h-screen pb-24 transition-colors ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-zinc-100"
      }`}
    >
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
        <button
          type="button"
          onClick={() => navigate("/inventory")}
          className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/10 bg-[#151718] text-zinc-200 hover:bg-white/[0.06]"
          }`}
        >
          <ArrowLeft size={17} />
          Back to My Trades
        </button>
        <section
          className={`rounded-[26px] border p-4 sm:p-5 ${
            isLightMode
              ? "border-black/10 bg-white"
              : "border-white/[0.08] bg-[#151718]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className={`text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Trade listings
              </div>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                My Trades
              </h1>
              <div className={`mt-1 text-sm ${
                isLightMode ? "text-zinc-500" : "text-zinc-400"
              }`}>
                {setId || "Current set"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
              <div
                className={`rounded-2xl border px-3 py-3 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-xl font-semibold">{cards.length}</div>
                <div className={`mt-1 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Listed
                </div>
              </div>
              <div
                className={`rounded-2xl border px-3 py-3 text-center ${
                  isLightMode
                    ? "border-black/10 bg-zinc-50"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="text-xl font-semibold">
                  {Object.keys(activeMap).filter((key) => activeMap[key]).length}
                </div>
                <div className={`mt-1 text-sm ${
                  isLightMode ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Active
                </div>
              </div>
            </div>
          </div>
        </section>
        {loading && (
          <section
            className={`mt-4 rounded-[24px] border px-6 py-12 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <div className="text-base font-semibold">Loading trades…</div>
          </section>
        )}
        {!loading && cards.length === 0 && (
          <section
            className={`mt-4 rounded-[24px] border px-6 py-12 text-center ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/[0.08] bg-[#151718]"
            }`}
          >
            <h2 className="text-lg font-semibold">No listed cards</h2>
            <p className={`mt-2 text-sm ${
              isLightMode ? "text-zinc-500" : "text-zinc-400"
            }`}>
              This set currently has no cards marked for trade or purchase.
            </p>
          </section>
        )}
        {!loading && cards.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {(Object.entries(
              cards.reduce((acc: Record<string, TradeCard[]>, card) => {
                let rarity = card.card_key.split("-")[0];
                if (card.set_id === "tcgpromos") {
                  rarity = "PR";
                } else if (
                  card.set_id === "FW" ||
                  card.set_id === "12" ||
                  card.set_id === "friendshipsbegin"
                ) {
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
                if (!acc[rarity]) acc[rarity] = [];
                acc[rarity].push(card);
                return acc;
              }, {})
            ) as [string, TradeCard[]][])
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
                  "FW": ["C","U","ER","SR","SPR","GR","CR","RR","※ER","※SPR","※GR","※CR","※RR"],
                  "12": ["C","U","ER","SR","SPR","GR","CR","RR","※ER","※SPR","※GR","※CR","※RR"],
                  "friendshipsbegin": ["C","U","SR","SPR","GR","CR","ER","※ER","※RR"],
                  "tcgpromos": ["PR"],
                };
                const currentOrder =
                  rarityOrders[
                    String(setId) === "discord" ? "12" : String(setId)
                  ] || [];
                return currentOrder.indexOf(a) - currentOrder.indexOf(b);
              })
              .map(([rarity, rarityCards]) => (
                <section
                  key={rarity}
                  className={`overflow-hidden rounded-[22px] border ${
                    isLightMode
                      ? "border-black/10 bg-white"
                      : "border-white/[0.08] bg-[#151718]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b px-4 py-3 ${
                      isLightMode ? "border-black/10" : "border-white/[0.08]"
                    }`}
                  >
                    <h2 className="text-base font-semibold">
                      {rarity === "SHINING ZR" || rarity === "SZR"
                        ? "◇ZR"
                        : rarity === "SN"
                        ? "◇N"
                        : rarity === "SCR" && String(setId) !== "4"
                        ? "◇CR"
                        : rarity === "SAR"
                        ? "◇AR"
                        : rarity}
                    </h2>
                    <span className={`text-sm ${
                      isLightMode ? "text-zinc-500" : "text-zinc-400"
                    }`}>
                      {rarityCards.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4 sm:gap-2.5">
                    {rarityCards
                      .sort((a, b) => {
                        const numA = parseInt(a.card_key.split("-")[1]);
                        const numB = parseInt(b.card_key.split("-")[1]);
                        return numA - numB;
                      })
                      .map((card) => {
                        const [rarityCode, number] = card.card_key.split("-");
                        const isDoubleCard =
                          card.set_id === "3" &&
                          rarityCode === "SZR" &&
                          Number(number) === 1;
                        const shouldZoom = ![
                          "12",
                          "FW",
                          "SD",
                          "FB",
                          "friendshipsbegin",
                        ].includes(String(card.set_id));
                        return (
                          <button
                            type="button"
                            key={card.id}
                            onClick={(e) => {
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();
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
                            className={`group relative cursor-pointer overflow-hidden rounded-xl border p-0.5 text-left transition ${
                              isLightMode
                                ? "border-black/10 bg-zinc-50 hover:border-[#9A7200]"
                                : "border-white/10 bg-[#0f1112] hover:border-[#FFD54A]/50"
                            } ${
                              isDoubleCard
                                ? "col-span-2 aspect-[10/7]"
                                : "aspect-[5/7]"
                            }`}
                          >
                            {card.set_id === "11" && card.card_key === "N-10" ? (
                              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-100 p-3 text-center">
                                <p className="text-sm font-semibold leading-relaxed text-zinc-600">
                                  FME03-N-010
                                  <br />
                                  Waiting for image.
                                </p>
                              </div>
                            ) : (
                              <div className="h-full w-full overflow-hidden rounded-[10px]">
                                <img
                                  src={getCardImage(card)}
                                  alt={card.card_key}
                                  className="h-full w-full object-cover object-center scale-[1.045] transition-transform duration-300 group-hover:scale-[1.06]"
                                />
                              </div>
                            )}
                            {activeMap[card.id] && (
                              <div className="absolute inset-1 flex items-center justify-center rounded-[10px] bg-black/65">
                                <span className="rounded-lg bg-emerald-500 px-2 py-1 text-sm font-semibold text-white">
                                  Active
                                </span>
                              </div>
                            )}
                            <div
                              className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
                                card.listing_type === "trade"
                                  ? "bg-emerald-500"
                                  : "bg-sky-500"
                              }`}
                            >
                              {card.listing_type === "trade" ? "⇄" : "$"}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </section>
              ))}
          </div>
        )}
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
            className={`w-64 overflow-hidden rounded-[20px] border shadow-2xl ${
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-[#17191a]"
            }`}
          >
            <div
              className={`border-b px-4 py-3 ${
                isLightMode ? "border-black/10" : "border-white/10"
              }`}
            >
              <h3 className="text-base font-semibold">Card Options</h3>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={markCompleted}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isLightMode
                    ? "hover:bg-zinc-100"
                    : "hover:bg-white/[0.06]"
                }`}
              >
                <span>Mark as Completed</span>
                <span className={isLightMode ? "text-[#806100]" : "text-[#FFD54A]"}>
                  ✓
                </span>
              </button>
              <button
                type="button"
                onClick={toggleActive}
                className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isLightMode
                    ? "hover:bg-zinc-100"
                    : "hover:bg-white/[0.06]"
                }`}
              >
                <span>
                  {activeMap[selectedCard.id]
                    ? "Stop Actively Trading"
                    : "Actively Trading"}
                </span>
                <span className="text-emerald-500">●</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className={`mt-1 w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                  isLightMode
                    ? "text-zinc-500 hover:bg-zinc-100"
                    : "text-zinc-400 hover:bg-white/[0.06]"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}