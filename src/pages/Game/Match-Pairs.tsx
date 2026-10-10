import CardImage from "@/components/CardImage";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
type SetConfig = {
  id: string;
  name: string;
  folder: string;
  prefix: string;
  rarities: Record<string, number>;
};
type GameCard = {
  id: string;
  pairId: string;
  setId: string;
  rarity: string;
  front: string;
  back: string;
  label: string;
};
const CCG_SETS: SetConfig[] = [
  { id: "1", name: "Moon 1", folder: "first-edition-moon", prefix: "M1", rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  { id: "2", name: "Moon 2", folder: "second-edition-moon", prefix: "M2", rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 1 } },
  { id: "3", name: "Moon 3", folder: "third-edition-moon", prefix: "M3", rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, SZR: 3 } },
  { id: "13", name: "Moon 4", folder: "fourth-edition-moon", prefix: "M4", rarities: { R: 30, SR: 20, SSR: 26, HR: 30, LSR: 16, UR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 2 } },
  { id: "4", name: "Star 1", folder: "star-one", prefix: "S1", rarities: { SSR: 20, SCR: 18, UR: 18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 } },
  { id: "5", name: "Rainbow 1", folder: "rainbow-one", prefix: "R1", rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  { id: "6", name: "Rainbow 2", folder: "rainbow-two", prefix: "R2", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 } },
  { id: "7", name: "Fun Moments 1", folder: "fun-moments-one", prefix: "FM1", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  { id: "8", name: "Fun Moments 2", folder: "fun-moments-two", prefix: "FM2", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
  { id: "11", name: "Fun Moments 3", folder: "fun-moments-three", prefix: "FM3", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } },
];
const PROMO_CARDS = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14];
const PAIR_OPTIONS = [8, 12, 16];
const BOT_LEVELS = [
  { id: "easy", label: "Easy", memory: 0.35 },
  { id: "normal", label: "Normal", memory: 0.7 },
  { id: "hard", label: "Hard", memory: 1 },
] as const;
type BotLevel = (typeof BOT_LEVELS)[number]["id"];
function pad(value: number) {
  return String(value).padStart(3, "0");
}
function cardFront(set: SetConfig, rarity: string, number: number) {
const code = rarity === "SHINING ZR" ? "SZR" : rarity;
const numberCode = set.id === "13" ? String(number).padStart(code === "SZR" ? 3 : 2, "0") : pad(number);
  return `/cards/${set.folder}/${set.prefix}${code}${numberCode}.webp`;
}
function cardBack(set: SetConfig, rarity: string, number: number) {
const n = pad(number);
  if (set.id === "13") {
const folder = "/card-backs/moon-four";
    if (rarity === "R") return `${folder}/M4R${String(number).padStart(2, "0")}BACK.webp`;
    if (rarity === "SR") return `${folder}/M4SR22BACK.webp`;
    if (rarity === "SSR") return `${folder}/M4SSRBACK.webp`;
    if (rarity === "HR") return `${folder}/${number <= 22 ? "M4HRSIDEWAYSBACK" : "M4HRBACK"}.webp`;
    if (rarity === "ZR") return `${folder}/${number === 7 ? "M4ZRBACKSIDEWAYS" : "M4ZRBACK"}.webp`;
    return `${folder}/M4${rarity}BACK.webp`;
  }
  if (set.id === "1") {
    if (rarity === "R") return `/moon-1-other-backs/M1RBK${n}.webp`;
    if (rarity === "SR") return `/moon-1-other-backs/M1SRB${n}.webp`;
    if (rarity === "HR") return [8, 9, 10, 18, 19, 21, 23, 27, 32, 34, 36].includes(number) ? "/card-backs/M1HRSIDEWAYSBACK.webp" : "/card-backs/M1HRBACK.webp";
    if (rarity === "SSR") return "/card-backs/M1SSRBACK.webp";
    if (rarity === "UR") return number === 16 ? "/card-backs/M1URSIDEWAYSBACK.webp" : "/card-backs/M1URBACK.webp";
    if (rarity === "SGR") return "/card-backs/M1SGRBACK.webp";
    if (rarity === "SC") return number === 7 ? "/card-backs/M1SCBACK.webp" : "/card-backs/M1R-SR-SGR-SCBACK.webp";
    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  }
  if (set.id === "2") {
    if (rarity === "R") return `/moon-2-other-backs/M2RB${n}.webp`;
    if (rarity === "SR") return `/moon-2-other-backs/M2SRB${n}.webp`;
    if (rarity === "HR") return number <= 22 ? "/card-backs/M1SCBACK.webp" : "/card-backs/M1R-SR-SGR-SCBACK.webp";
    if (rarity === "SSR") return "/card-backs/M2SSRBACK.webp";
    if (rarity === "UR") return "/card-backs/M1URBACK.webp";
    if (rarity === "SGR") return "/card-backs/M2SGRBACK.webp";
    if (rarity === "ZR") return "/card-backs/M2ZRBACK.webp";
    if (rarity === "SC") return number === 7 ? "/card-backs/M2SC007BACK.webp" : "/card-backs/M2SCBACK.webp";
    if (rarity === "SHINING ZR" || rarity === "SZR") return "/card-backs/M2SZRBACK.webp";
    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  }
  if (set.id === "3") {
    if (rarity === "SZR") return number === 1 ? "/card-backs/third-moon-edition-backs/M3SZR001BACK.webp" : "/card-backs/third-moon-edition-backs/moon3zrback2.webp";
    if (rarity === "SC") return "/card-backs/third-moon-edition-backs/m3scback.webp";
    if (rarity === "ZR") return number === 14 ? "/card-backs/third-moon-edition-backs/moon3sdzrback2.webp" : number >= 8 ? "/card-backs/third-moon-edition-backs/moon3zrback2.webp" : "/card-backs/third-moon-edition-backs/m3zrback1.webp";
    if (rarity === "UR") return number >= 15 ? "/card-backs/third-moon-edition-backs/moon3sdurback.webp" : "/card-backs/third-moon-edition-backs/moon3urback.webp";
    if (rarity === "SGR") return number <= 8 ? "/card-backs/third-moon-edition-backs/moon3sgrback1.webp" : "/card-backs/third-moon-edition-backs/moon3sgrback2.webp";
    if (rarity === "HR" && (number <= 22 || (number >= 31 && number <= 52))) return "/card-backs/third-moon-edition-backs/moon3sdhrback.webp";
    if (rarity === "SR") return "/card-backs/third-moon-edition-backs/moon3srback.webp";
    if (rarity === "SSR") return "/card-backs/third-moon-edition-backs/moon3ssrback.webp";
    return "/card-backs/third-moon-edition-backs/moon3defaultback.webp";
  }
  if (set.id === "4") {
    if (rarity === "SAR") return "/card-backs/star-one/S1SARBACK.webp";
    if (rarity === "OR") return "/card-backs/star-one/S1ORBACK.webp";
    if (rarity === "BP") return `/card-backs/star-one/S1BPBACK${n}.webp`;
    if (rarity === "AR") return "/card-backs/star-one/S1ARBACK.webp";
    if (rarity === "USR") return [1, 3, 6, 13, 14].includes(number) ? "/card-backs/star-one/S1USRBACK2.webp" : "/card-backs/star-one/S1USRBACK1.webp";
    if (rarity === "UR") return "/card-backs/star-one/S1URBACK.webp";
    if (rarity === "SCR") return "/card-backs/star-one/S1SCRBACK.webp";
    return "/card-backs/star-one/S1SSRBACK.webp";
  }
  if (set.id === "5") {
    if (rarity === "R") return `/rainbow-1-backs/R1RB${n}.webp`;
    if (rarity === "SR") return `/rainbow-1-backs/R1SRB${n}.webp`;
    if (rarity === "FR") return "/card-backs/R1FRBACK.webp";
    if (rarity === "UR") return "/card-backs/M1URBACK.webp";
    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  }
  if (set.id === "6") {
    if (rarity === "BASE") return "/card-backs/rainbow-two/R2BASEBACKS.webp";
    if (rarity === "SR") return "/card-backs/rainbow-two/R2SRBACK.webp";
    if (rarity === "SSR") return "/card-backs/rainbow-two/R2SSRBACK.webp";
    if (rarity === "UR") return "/card-backs/rainbow-two/R2URBACK.webp";
    if (rarity === "FR") return "/card-backs/rainbow-two/R2FRBACK.webp";
    if (rarity === "XR") return number === 8 ? "/card-backs/rainbow-two/R2XRBACK2.webp" : "/card-backs/rainbow-two/R2XRBACK1.webp";
    return "/card-backs/rainbow-two/R2USRBACK.webp";
  }
  if (set.id === "7" || set.id === "8" || set.id === "11") {
const volume = set.id === "7" ? "one" : set.id === "8" ? "two" : "three";
const prefix = set.id === "7" ? "FM1" : set.id === "8" ? "FM2" : "FM3";
    if (rarity === "CR" || rarity === "SCR") {
      if (rarity === "SCR" && set.id === "11") return "/fun-moments-three-backs/FM3SCRBACK.webp";
const crPrefix = set.id === "11" ? "FM3" : "FM1";
const crFolder = set.id === "11" ? "three" : "one";
      return `/fun-moments-${crFolder}-backs/${crPrefix}CRBACK00${number <= 9 ? "1" : "2"}.webp`;
    }
    if (rarity === "UGR") return set.id === "8" ? "/fun-moments-two-backs/FM2UGRBACKS.webp" : "/fun-moments-three-backs/FM3UGRBACK.webp";
    if (rarity === "N" || rarity === "SN") return set.id === "7" ? `/fun-moments-one-backs/FM1BACKN${n}.webp` : `/fun-moments-${volume}-backs/${prefix}NBACK${n}.webp`;
    if (rarity === "R") return `/fun-moments-${volume}-backs/${prefix}RBACK${n}.webp`;
    if (rarity === "SR") {
      if (set.id === "7") return `/fun-moments-one-backs/FM1SRB${n}.webp`;
      if (set.id === "8") return `/fun-moments-two-backs/FM2SRBACK${n}.webp`;
      return "/fun-moments-three-backs/FM3SRBACK.webp";
    }
    if (rarity === "SSR") return set.id === "11" ? "/fun-moments-three-backs/FM3SSRBACK.webp" : "/card-backs/M1R-SR-SGR-SCBACK.webp";
    if (rarity === "UR") return set.id === "11" ? "/fun-moments-three-backs/FM3URBACK.webp" : "/card-backs/M1URBACK.webp";
    return "/card-backs/M1R-SR-SGR-SCBACK.webp";
  }
  return "/card-backs/M1R-SR-SGR-SCBACK.webp";
}
function makePool(set: SetConfig): GameCard[] {
  return Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count }, (_, index) => {
const number = index + 1;
const key = `${set.id}:${rarity}:${number}`;
      return { id: key, pairId: key, setId: set.id, rarity, front: cardFront(set, rarity, number), back: cardBack(set, rarity, number), label: `${set.name} ${rarity} ${pad(number)}` };
    }),
  );
}
function makePromoPool(): GameCard[] {
  return PROMO_CARDS.map((number) => {
const key = `9:PR:${number}`;
    return { id: key, pairId: key, setId: "9", rarity: "PR", front: `/promo-cards/mlpepr${pad(number)}.webp`, back: "/card-backs/promos/sdccboombacks.webp", label: `CCG Promo PR-${number}` };
  });
}
function shuffle<T>(items: T[]) {
const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function selectCardsByRarity(pool: GameCard[], pairCount: number) {
const grouped = new Map<string, GameCard[]>();
  pool.forEach((card) => {
const key = `${card.setId}:${card.rarity}`;
    grouped.set(key, [...(grouped.get(key) ?? []), card]);
  });
const eligibleGroups = shuffle([...grouped.entries()].filter(([, cards]) => cards.length >= 3));
const groupCount = Math.min(Math.floor(pairCount / 3), eligibleGroups.length);
const selectedGroups: Array<[string, GameCard[]]> = [];
  eligibleGroups.forEach((group) => {
    if (selectedGroups.length < groupCount && !selectedGroups.some(([key]) => key === group[0])) selectedGroups.push(group);
  });
const selected = selectedGroups.flatMap(([, cards]) => shuffle(cards).slice(0, 3));
const selectedIds = new Set(selected.map((card) => card.id));
const fillCards = shuffle(selectedGroups.flatMap(([, cards]) => cards).filter((card) => !selectedIds.has(card.id)));
  return shuffle([...selected, ...fillCards.slice(0, pairCount - selected.length)]);
}
const MatchPairs = () => {
const navigate = useNavigate();
const [selectedSet, setSelectedSet] = useState("13");
const [pairCount, setPairCount] = useState(8);
const [botLevel, setBotLevel] = useState<BotLevel>("normal");
const [hardMode, setHardMode] = useState(false);
const [cards, setCards] = useState<GameCard[]>([]);
const [revealed, setRevealed] = useState<number[]>([]);
const [matched, setMatched] = useState<number[]>([]);
const [botMemory, setBotMemory] = useState<Record<number, string>>({});
const [turn, setTurn] = useState<"player" | "bot">("player");
const [score, setScore] = useState({ player: 0, bot: 0 });
const [running, setRunning] = useState(false);
const [busy, setBusy] = useState(false);
const [seconds, setSeconds] = useState(0);
const botPlaying = useRef(false);
const resolveTimer = useRef<number | null>(null);
const botTimers = useRef<number[]>([]);
  useEffect(() => {
    if (!running) return;
const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => () => {
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    botTimers.current.forEach(window.clearTimeout);
  }, []);
  useEffect(() => {
    if (!running || turn !== "bot" || busy || revealed.length || botPlaying.current) return;
    botPlaying.current = true;
const memoryChance = BOT_LEVELS.find((level) => level.id === botLevel)?.memory ?? 0.7;
const matchedSet = new Set(matched);
const available = cards.map((_, index) => index).filter((index) => !matchedSet.has(index));
const usableMemory = Object.entries(botMemory)
      .map(([index, pairId]) => ({ index: Number(index), pairId }))
      .filter(({ index }) => !matchedSet.has(index) && available.includes(index) && Math.random() <= memoryChance);
const firstKnownPair = usableMemory.find(({ pairId }, _, list) => list.some((entry) => entry.pairId === pairId && entry.index !== list.find((item) => item.pairId === pairId)?.index));
const first = firstKnownPair?.index ?? available[Math.floor(Math.random() * available.length)];
const firstPair = cards[first]?.pairId;
const knownSecond = usableMemory.find((entry) => entry.pairId === firstPair && entry.index !== first)?.index;
const remaining = available.filter((index) => index !== first);
const second = knownSecond ?? remaining[Math.floor(Math.random() * remaining.length)];
const firstTimer = window.setTimeout(() => {
      setRevealed([first]);
      setBotMemory((current) => ({ ...current, [first]: cards[first].pairId }));
    }, 550);
const secondTimer = window.setTimeout(() => {
      setRevealed([first, second]);
      setBotMemory((current) => ({ ...current, [first]: cards[first].pairId, [second]: cards[second].pairId }));
      botPlaying.current = false;
    }, 1250);
    botTimers.current.push(firstTimer, secondTimer);
  }, [running, turn, busy, revealed, cards, matched, botMemory, botLevel]);
  useEffect(() => {
    if (!running || revealed.length !== 2 || busy) return;
    setBusy(true);
const [first, second] = revealed;
const isMatch = cards[first]?.pairId === cards[second]?.pairId;
    if (isMatch) {
      setMatched((current) => [...current, first, second]);
      setScore((current) => ({ ...current, [turn]: current[turn] + 1 }));
    }
    resolveTimer.current = window.setTimeout(() => {
      setRevealed([]);
      setTurn(isMatch ? turn : turn === "player" ? "bot" : "player");
      setBusy(false);
      botPlaying.current = false;
    }, isMatch ? 700 : 1100);
  }, [revealed, running, busy, cards, turn]);
  useEffect(() => {
    if (running && matched.length === pairCount * 2) setRunning(false);
  }, [running, matched, pairCount]);
const startGame = (nextPairCount = pairCount) => {
const sourceSets = selectedSet === "all" ? CCG_SETS : CCG_SETS.filter((set) => set.id === selectedSet);
const pool = [
      ...sourceSets.flatMap(makePool),
      ...(selectedSet === "all" || selectedSet === "9" ? makePromoPool() : selectedSet === "9" ? makePromoPool() : []),
    ];
const selected = selectCardsByRarity(pool, nextPairCount);
const sharedBack = hardMode ? selected[Math.floor(Math.random() * selected.length)]?.back : undefined;
const board = shuffle(selected.flatMap((card, index) => [
      { ...card, back: sharedBack ?? card.back, id: `${card.id}:a:${index}` },
      { ...card, back: sharedBack ?? card.back, id: `${card.id}:b:${index}` },
    ]));
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    botTimers.current.forEach(window.clearTimeout);
    botTimers.current = [];
    botPlaying.current = false;
    setCards(board);
    setRevealed([]);
    setMatched([]);
    setBotMemory({});
    setScore({ player: 0, bot: 0 });
    setTurn("player");
    setBusy(false);
    setSeconds(0);
    setRunning(true);
  };
const flipCard = (index: number) => {
    if (!running || busy || turn !== "player" || revealed.length >= 2 || matched.includes(index) || revealed.includes(index)) return;
    setRevealed((current) => [...current, index]);
    setBotMemory((current) => ({ ...current, [index]: cards[index].pairId }));
  };
const formatTime = (time: number) => `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
const complete = cards.length > 0 && matched.length === cards.length;
const winner = score.player === score.bot ? "It's a tie!" : score.player > score.bot ? "You win!" : "The bot wins!";
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-3 pb-24 pt-4 text-zinc-900 dark:bg-[#101112] dark:text-white sm:px-6 sm:pt-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-3xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-white/10">
            <span aria-hidden="true">{"\u2190"}</span><span>Back</span>
          </button>
          <div className="text-center"><h1 className="text-lg font-bold sm:text-2xl">Match Pairs</h1><p className="text-xs text-zinc-500 dark:text-zinc-400">A card memory game against the bot</p></div>
          <div className="w-14" />
        </header>
        <section className="mb-4 grid gap-3 rounded-3xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:grid-cols-2 sm:p-4 lg:grid-cols-[1.2fr_.8fr_.8fr_auto]">
          <label className="grid gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Card set
            <select value={selectedSet} onChange={(event) => setSelectedSet(event.target.value)} disabled={running} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 disabled:opacity-60 dark:border-white/10 dark:bg-[#252528] dark:text-white">
              <option value="all">Any CCG set</option>
              {CCG_SETS.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
              <option value="9">CCG Promos</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Pairs
            <select value={pairCount} onChange={(event) => setPairCount(Number(event.target.value))} disabled={running} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 disabled:opacity-60 dark:border-white/10 dark:bg-[#252528] dark:text-white">
              {PAIR_OPTIONS.map((count) => <option key={count} value={count}>{count} pairs</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Bot difficulty
            <select value={botLevel} onChange={(event) => setBotLevel(event.target.value as BotLevel)} disabled={running} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 disabled:opacity-60 dark:border-white/10 dark:bg-[#252528] dark:text-white">
              {BOT_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => startGame()} className="h-10 self-end rounded-xl bg-[#E7C84B] px-5 text-sm font-bold text-[#17191b] shadow-sm transition hover:bg-[#FFE477] active:scale-[.98]">{running ? "Restart game" : cards.length ? "Play again" : "Start game"}</button>
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 sm:col-span-2 lg:col-span-4">
            <input type="checkbox" checked={hardMode} onChange={(event) => setHardMode(event.target.checked)} disabled={running} className="h-4 w-4 accent-[#E7C84B]" />
            Hard mode: use the same card back for every card
          </label>
        </section>
        {cards.length > 0 && <section className="mb-4 grid grid-cols-3 gap-2 rounded-3xl border border-black/10 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Your pairs</p><p className="text-xl font-black text-[#8a6a12] dark:text-[#FFE477]">{score.player}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Turn</p><p className="text-sm font-bold">{complete ? "Finished" : turn === "player" ? "Your turn" : "Bot's turn"}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bot {"\u00b7"} {formatTime(seconds)}</p><p className="text-xl font-black text-zinc-600 dark:text-zinc-300">{score.bot}</p></div>
        </section>}
        {cards.length === 0 ? <section className="rounded-3xl border border-black/10 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-[#1c1c1e]">
          <h2 className="text-xl font-bold">Ready to play?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">Choose a CCG set, then find matching cards before the bot does. Your collection is never changed.</p>
          <button type="button" onClick={() => startGame()} className="mt-6 rounded-xl bg-[#E7C84B] px-6 py-3 text-sm font-bold text-[#17191b] hover:bg-[#FFE477]">Start game</button>
        </section> : <section className="rounded-3xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e] sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{selectedSet === "all" ? "Mixed CCG cards" : selectedSet === "9" ? "CCG Promos" : CCG_SETS.find((set) => set.id === selectedSet)?.name} {"\u00b7"} {pairCount} pairs{hardMode ? " \u00b7 Hard mode" : ""}</span>
            <span>{turn === "player" ? "Tap a card to reveal it" : "The bot is choosing..."}</span>
          </div>
          <div className={`grid gap-1.5 sm:gap-3 ${cards.length > 24 ? "grid-cols-8" : cards.length > 16 ? "grid-cols-6 lg:grid-cols-8" : "grid-cols-4 sm:grid-cols-6 lg:grid-cols-8"}`}>
            {cards.map((card, index) => {
const isFaceUp = revealed.includes(index) || matched.includes(index);
const isMatched = matched.includes(index);
              return <button key={card.id} type="button" onClick={() => flipCard(index)} disabled={!running || turn !== "player" || busy || isFaceUp} aria-label={isFaceUp ? card.label : "Face-down card"} className={`group relative aspect-[.72] overflow-hidden rounded-md border bg-zinc-100 shadow-sm transition duration-200 dark:bg-zinc-800 ${isMatched ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-black/10 dark:border-white/10"} ${!isFaceUp && running && turn === "player" ? "hover:-translate-y-0.5 hover:shadow-md active:scale-[.98]" : ""}`}>
                <span className={`absolute inset-0 transition-transform duration-300 ${isFaceUp ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"}`}>
                  <CardImage src={card.back} alt="" className="h-full w-full scale-[1.06] object-cover" />
                </span>
                <span className={`absolute inset-0 transition-transform duration-300 ${isFaceUp ? "rotate-y-0 opacity-100" : "rotate-y-180 opacity-0"}`}>
                  <CardImage src={card.front} alt="" className="h-full w-full scale-[1.06] object-cover" />
                  {isMatched && <span className="absolute left-1 top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow">MATCH</span>}
                </span>
              </button>;
            })}
          </div>
          {complete && <div className="mt-4 rounded-2xl border border-[#E7C84B]/35 bg-[#E7C84B]/10 p-4 text-center dark:border-[#E7C84B]/25 dark:bg-[#E7C84B]/[0.08]"><p className="text-xl font-black">{winner}</p><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Final score: You {score.player} {"\u00b7"} Bot {score.bot} {"\u00b7"} {formatTime(seconds)}</p><button type="button" onClick={() => startGame()} className="mt-3 rounded-xl bg-[#E7C84B] px-5 py-2.5 text-sm font-bold text-[#17191b] hover:bg-[#FFE477]">Play again</button></div>}
        </section>}
      </div>
    </main>
  );
};
export default MatchPairs;