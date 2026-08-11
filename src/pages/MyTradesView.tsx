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
<div className="relative min-h-screen overflow-hidden bg-[#040606] pb-[120px] text-white sm:pb-0">
  <div className="pointer-events-none fixed inset-0 opacity-[0.38]" style={{backgroundImage:"linear-gradient(rgba(255,212,74,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,74,.032) 1px, transparent 1px)",backgroundSize:"44px 44px"}} />
  <div className="pointer-events-none fixed inset-0 opacity-[0.06] bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(255,255,255,.08)_4px)]" />
  <div className="pointer-events-none fixed left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FFD54A] to-transparent opacity-80" />

<div className="relative mx-auto max-w-[1550px] px-3 py-4 sm:px-6 sm:py-6">

  <header className="mb-4 border border-white/[0.08] bg-[#080b0b] shadow-[0_18px_55px_rgba(0,0,0,.45)]">
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#050707] px-3 py-2"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.8)]" /><span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-300/95">TRADE NETWORK // ONLINE</span></div><span className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">MLPEKAYOU / NODE TR-07</span></div>
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4"><button onClick={() => navigate("/inventory")} className="group flex items-center gap-3 border border-[#FFD54A]/20 bg-[#0b0f0f] px-3 py-2 text-left transition hover:border-[#FFD54A]/60 hover:bg-[#101515]"><span className="flex h-8 w-8 items-center justify-center border border-[#FFD54A]/20 bg-[#070a0a] text-[#FFD54A] transition group-hover:border-[#FFD54A]/60"><ArrowLeft size={16} /></span><span><span className="block font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-300">INVENTORY</span><span className="mt-1 block font-['Oxanium'] text-[9px] font-black uppercase tracking-[0.15em] text-zinc-200">Back to My Trades</span></span></button><div className="hidden items-center gap-3 sm:flex"><div className="text-right"><div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">CONTROL STATUS</div><div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-300">SECURE LINK</div></div><span className="flex h-8 w-8 items-center justify-center border border-emerald-400/20 bg-emerald-400/[0.04]"><span className="h-2 w-2 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" /></span></div></div>
  </header>

  <section className="relative mb-4 overflow-hidden border border-[#FFD54A]/25 bg-[#080b0b] shadow-[0_30px_100px_rgba(0,0,0,.62)]">
    <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-[#FFD54A]/80" /><div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-r-2 border-t-2 border-[#FFD54A]/45" /><div className="pointer-events-none absolute bottom-0 left-0 h-10 w-28 border-b-2 border-l-2 border-[#FFD54A]/40" /><div className="pointer-events-none absolute bottom-0 right-0 h-10 w-28 border-b-2 border-r-2 border-[#FFD54A]/35" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,212,74,.11),transparent_32%)]" />
    <div className="relative grid lg:grid-cols-[1fr_360px]">
      <div className="border-b border-white/[0.07] p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10"><div className="flex items-center gap-3"><span className="font-mono text-[8px] font-bold uppercase tracking-[0.34em] text-zinc-300">SYSTEM MODULE / TR-07</span><span className="h-px w-10 bg-[#FFD54A]/30" /><span className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[#FFD54A]">DUPLICATE CONTROL</span></div><h1 className="mt-5 max-w-3xl font-['Oxanium'] text-4xl font-black uppercase leading-[0.9] tracking-[0.015em] text-white sm:text-6xl lg:text-7xl">Active<span className="block text-[#FFD54A]">Trade Assets</span></h1><p className="mt-6 max-w-2xl border-l border-[#FFD54A]/25 pl-4 font-mono text-[9px] uppercase leading-6 tracking-[0.08em] text-zinc-300 sm:text-[10px]">Manage duplicate cards, purchase offers, and active trading states from a single asset-control interface.</p><div className="mt-7 flex flex-wrap gap-2"><div className="border border-[#FFD54A]/20 bg-[#0a0d0d] px-3 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-300">SET NODE</span><span className="ml-2 font-mono text-[8px] font-bold text-[#FFD54A]">{setId || "UNKNOWN"}</span></div><div className="border border-emerald-400/15 bg-emerald-400/[0.025] px-3 py-2"><span className="font-mono text-[8px] uppercase tracking-[0.24em] text-zinc-300">LINK</span><span className="ml-2 font-mono text-[8px] font-bold text-emerald-300">ACTIVE</span></div></div></div>
      <div className="grid grid-cols-2 gap-px bg-white/[0.06] lg:grid-cols-1"><div className="bg-[#070a0a] p-4 sm:p-5"><div className="font-mono text-[8px] uppercase tracking-[0.28em] text-zinc-400">TOTAL ASSETS</div><div className="mt-2 font-['Oxanium'] text-3xl font-black text-[#FFD54A]">{cards.length}</div></div><div className="bg-[#070a0a] p-4 sm:p-5"><div className="font-mono text-[8px] uppercase tracking-[0.28em] text-zinc-400">ACTIVE TRADES</div><div className="mt-2 font-['Oxanium'] text-3xl font-black text-emerald-400">{Object.keys(activeMap).filter((key) => activeMap[key]).length}</div></div><div className="bg-[#070a0a] p-4 sm:p-5"><div className="font-mono text-[8px] uppercase tracking-[0.28em] text-zinc-400">TRADE LISTINGS</div><div className="mt-2 font-['Oxanium'] text-3xl font-black text-white">{cards.filter((c) => c.listing_type === "trade").length}</div></div><div className="bg-[#070a0a] p-4 sm:p-5"><div className="font-mono text-[8px] uppercase tracking-[0.28em] text-zinc-400">PURCHASE OFFERS</div><div className="mt-2 font-['Oxanium'] text-3xl font-black text-sky-400">{cards.filter((c) => c.listing_type === "purchase").length}</div></div></div>
    </div>
  </section>
  <div className="mb-4 grid grid-cols-2 gap-px border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4"><div className="bg-[#080b0b] px-3 py-2.5"><div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">MODE</div><div className="mt-1 font-mono text-[8px] font-bold text-[#FFD54A]">TRADE CONTROL</div></div><div className="bg-[#080b0b] px-3 py-2.5"><div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">SELECTION</div><div className="mt-1 font-mono text-[7px] font-bold text-zinc-300">CARD ASSET</div></div><div className="bg-[#080b0b] px-3 py-2.5"><div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">ACTION</div><div className="mt-1 font-mono text-[7px] font-bold text-zinc-300">CLICK TO CONTROL</div></div><div className="bg-[#080b0b] px-3 py-2.5"><div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">NETWORK</div><div className="mt-1 font-mono text-[8px] font-bold text-emerald-300">CONNECTED</div></div></div>
        {loading && <div className="border border-dashed border-[#FFD54A]/15 bg-[#050707] px-6 py-14 text-center"><div className="mx-auto mb-4 h-px w-24 bg-[#FFD54A]/50" /><div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#FFD54A]">Synchronizing inventory</div><div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">Establishing secure data link</div></div>}

        {!loading && cards.length === 0 && (
          <div className="border border-dashed border-[#FFD54A]/15 bg-[#050707] px-6 py-14 text-center">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-500">No trade assets detected</div>
            <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400">This inventory node contains no listed cards</div>
          </div>
        )}

       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">

  {(Object.entries(
    cards.reduce((acc: Record<string, TradeCard[]>, card) => {

let rarity = card.card_key.split("-")[0];

if (card.set_id === "tcgpromos") {
  rarity = "PR";
}

// Fantasy Wonderland + Friendships Begin
else if (
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

  if (!acc[rarity]) {
    acc[rarity] = [];
  }

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

  "FW": [
    "C",
    "U",
    "ER",
    "SR",
    "SPR",
    "GR",
    "CR",
    "RR",
    "※ER",
    "※SPR",
    "※GR",
    "※CR",
    "※RR",
  ],

  "12": [
    "C",
    "U",
    "ER",
    "SR",
    "SPR",
    "GR",
    "CR",
    "RR",
    "※ER",
    "※SPR",
    "※GR",
    "※CR",
    "※RR",
  ],

  "friendshipsbegin": [
    "C",
    "U",
    "SR",
    "SPR",
    "GR",
    "CR",
    "ER",
    "※ER",
    "※RR",
  ],

  "tcgpromos": ["PR"],
};

const currentOrder =
  rarityOrders[
    String(setId) === "discord" ? "12" : String(setId)
  ] || [];

  return (
    currentOrder.indexOf(a) -
    currentOrder.indexOf(b)
  );
})
    .map(([rarity, rarityCards]) => (

      <div key={rarity} className="relative overflow-hidden border border-white/[0.08] bg-[#080b0b] p-3 shadow-[0_14px_35px_rgba(0,0,0,.35)]">

        {/* RARITY HEADER */}
        <div className="relative mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">

          <div className="hidden h-px flex-1 bg-[#FFD54A]/20 max-w-[90px] sm:block" />

          <span className="border border-[#FFD54A]/15 bg-[#0b0e0e] px-2 py-1 font-mono text-[7px] font-black uppercase tracking-[0.18em] text-[#FFD54A]">
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

          <div className="hidden h-px flex-1 bg-[#FFD54A]/20 max-w-[90px] sm:block" />

        </div>

        {/* CARD GRID */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">

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

              const shouldZoom = !["12", "FW", "SD", "FB", "friendshipsbegin"].includes(String(card.set_id));

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
                  className={`group relative cursor-pointer rounded-md overflow-hidden border border-white/[0.08] bg-[#050707] transition-all duration-200 hover:-translate-y-1 hover:border-[#FFD54A]/40 hover:shadow-[0_14px_30px_rgba(0,0,0,.55)] ${
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
    className={`h-full w-full object-cover object-center transition-transform duration-300 ${shouldZoom ? "scale-[1.10] group-hover:scale-[1.14]" : "scale-100 group-hover:scale-[1.03]"}`}
  />
)}

                  {activeMap[card.id] && (
                    <div className="absolute inset-0 rounded-md overflow-hidden bg-[#07100d]/90 backdrop-blur-sm flex items-center justify-center">
                      <span className="border border-emerald-400/35 bg-[#07100d]/85 px-2 py-2 text-center font-mono text-[7px] font-black uppercase tracking-[0.14em] text-emerald-300">
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
      className="w-60 overflow-hidden border border-[#FFD54A]/30 bg-[#070a0a] shadow-[0_26px_70px_rgba(0,0,0,.78)]"
    >

      <div className="border-b border-white/[0.07] bg-[#050707] px-4 py-3">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-[#FFD54A]/90">
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