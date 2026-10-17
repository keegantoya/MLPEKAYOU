import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Trophy, Users, ChevronDown, ChevronUp, X, ArrowUpRight, ShieldCheck, Search } from "lucide-react";
import { getProfileAssets } from "./Everypony/profile-assets";
const sets: Record<string, { name: string; total: number }> = {
  "1": { name: "Eternal Moon First Edition", total: 186 },
  "2": { name: "Eternal Moon Second Edition", total: 189 },
  "3": { name: "Eternal Moon Third Edition", total: 290 },
  "13": { name: "Eternal Moon Fourth Edition", total: 162 },
  "4": { name: "Star First Edition", total: 105 },
  "5": { name: "Rainbow First Edition", total: 146 },
  "6": { name: "Rainbow Second Edition", total: 170 },
  "7": { name: "Fun Moments First Edition", total: 127 },
  "8": { name: "Fun Moments Second Edition", total: 136 },
  "11": { name: "Fun Moments Third Edition", total: 148 },
  friendshipsbegin: { name: "Friendships Begin", total: 194 },
  fantasywonderland: { name: "Fantasy Wonderland", total: 191 },
  discord: { name: "Discord", total: 191 },
  "14": { name: "Nightmare Night", total: 190 },
  "hearthswarming-eve": { name: "HeartsWarming Eve", total: 197 },
};
const isoSets = [
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
      SAR: 9,
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
    id: "6",
    name: "Rainbow: Second Edition",
    folder: "rainbow-two",
    prefix: "R2",
    rarities: {
      BASE: 18,
      R: 30,
      SR: 14,
      FR: 18,
      TR: 12,
      TGR: 8,
      ST: 20,
      SSR: 15,
      UR: 19,
      USR: 8,
      XR: 8,
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
    name: "Fun Moments: Second Edition",
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
    id: "3",
    name: "Eternal Moon: Third Edition",
    folder: "third-edition-moon",
    prefix: "M3",
    rarities: {
      R: 60,
      SR: 40,
      SSR: 40,
      HR: 60,
      LSR: 32,
      UR: 18,
      SGR: 16,
      ZR: 14,
      SC: 7,
      SZR: 3,
    },
  },
  {
    id: "13",
    name: "Eternal Moon: Fourth Edition",
    folder: "fourth-edition-moon",
    prefix: "M4",
    rarities: { R: 30, SR: 20, SSR: 26, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 2 },
  },
  {
    id: "11",
    name: "Fun Moments: Second Edition",
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
      SCR: 12,
    },
  },
  {
    id: "friendshipsbegin",
    name: "Friendships Begin",
    folder: "friendshipsbegin",
    prefix: "SD01",
    rarities: {},
  },
  {
    id: "fantasywonderland",
    name: "Fantasy Wonderland",
    folder: "fantasywonderland",
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
    id: "discord",
    name: "Discord",
    folder: "discord",
    prefix: "BP02",
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
    id: "14",
    name: "Nightmare Night",
    folder: "nightmare-night",
    prefix: "BP03",
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
      PGR: 5,
      PCR: 12,
      PRR: 6,
    },
  },
  {
    id: "hearthswarming-eve",
    name: "HeartsWarming Eve",
    folder: "hearthswarming-eve",
    prefix: "BP04",
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
      PGR: 6,
      PSPR: 11,
      PCR: 12,
      PRR: 6, TK: 6,
    },
  },
];
const forcedStillCollecting = [""];
const compareFinishers = (a: any, b: any) => {
const timestamp = (user: any) => {
const recorded = Date.parse(user.completedAt || "");
    if (Number.isFinite(recorded)) return recorded;
const fallback = Date.parse(user.updated || "");
    return Number.isFinite(fallback) ? fallback : Number.POSITIVE_INFINITY;
  };
const first = timestamp(a);
const second = timestamp(b);
  if (first !== second) return first < second ? -1 : 1;
  return String(a.id).localeCompare(String(b.id));
};
type CommunityQueryResult = { data: any[] | null; error: { message: string } | null };
async function readCommunityPages(query: (from: number, to: number) => PromiseLike<CommunityQueryResult>, onProgress?: (count: number) => void) {
const rows: any[] = [];
const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
const { data, error } = await query(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    onProgress?.(rows.length);
    if (!data || data.length < pageSize) return rows;
  }
}
async function readCommunityBatches(
  ids: string[],
  query: (ids: string[]) => PromiseLike<CommunityQueryResult>,
  isCancelled: () => boolean,
  onProgress?: (count: number) => void,
) {
const rows: any[] = [];
let offset = 0;
let processed = 0;
  await Promise.all(Array.from({ length: Math.min(4, Math.ceil(ids.length / 100)) }, async () => {
    while (offset < ids.length && !isCancelled()) {
const start = offset;
      offset += 100;
const { data, error } = await query(ids.slice(start, start + 100));
      if (error) throw new Error(error.message);
      rows.push(...(data || []));
      processed += Math.min(100, ids.length - start);
      onProgress?.(processed);
    }
  }));
  return rows;
}
const communitySetStyles = `
.cs-redesign{--cs-accent:#e7c84b;--cs-muted:#9ca3af;--cs-panel:#181b1e;--cs-soft:#202428;--cs-line:#ffffff15;--cs-text:#f4f4f5;color:var(--cs-text)}.light .cs-redesign,[data-theme="light"] .cs-redesign{--cs-muted:#64707a;--cs-panel:#fff;--cs-soft:#f1f3f5;--cs-line:#19242d18;--cs-text:#20262b}.spooky .cs-redesign,[data-theme="spooky"] .cs-redesign{--cs-accent:#be9af9}.cs-redesign *{box-sizing:border-box}.cs-redesign button:focus-visible,.cs-redesign input:focus-visible,.cs-redesign textarea:focus-visible{outline:2px solid var(--cs-accent);outline-offset:3px}.cs-heading{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:8px 0 26px}.cs-eyebrow{display:block;color:var(--cs-accent);font-size:10px;font-weight:700;letter-spacing:.13em}.cs-heading h1{font-size:clamp(26px,3vw,40px);font-weight:750;letter-spacing:-.04em;line-height:1.15;margin:8px 0 10px}.cs-heading p{font-size:13px;color:var(--cs-muted);line-height:1.65;margin:0}.cs-set-total{text-align:right;flex-shrink:0}.cs-set-total strong{display:block;font-size:42px;line-height:1.1;font-weight:700;letter-spacing:-.04em}.cs-set-total span{font-size:11px;color:var(--cs-muted)}.cs-section-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}.cs-section-heading h2{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:650;margin:7px 0 0;letter-spacing:-.03em}.cs-section-heading h2 svg{color:var(--cs-accent)}.cs-muted{font-size:12px;color:var(--cs-muted)}.cs-finishers{border-top:1px solid var(--cs-line);padding:24px 0 28px}.cs-finisher-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}.cs-finisher{display:flex;flex-direction:column;align-items:center;min-width:0;gap:12px;border:1px solid var(--cs-line);border-radius:19px;background:var(--cs-panel);padding:18px 22px 22px;position:relative;overflow:hidden;color:var(--cs-text);animation:cs-arrive .4s ease both;transition:transform .2s,border-color .2s;cursor:pointer}.cs-finisher:hover{transform:translateY(-3px);border-color:var(--cs-accent)}.cs-finisher-banner{display:flex;align-items:center;gap:7px;width:100%;color:var(--cs-accent);font-size:11px}.cs-finisher-banner svg:last-child{margin-left:auto}.cs-finisher-avatar{width:78px;height:78px;border-radius:21px;object-fit:cover;margin:6px 0}.cs-user-name{display:flex;align-items:center;gap:7px;min-width:0;overflow-wrap:anywhere;font-size:18px;font-weight:650;line-height:1.3}.cs-badge{width:18px;height:18px;object-fit:contain;flex-shrink:0}.cs-complete-line{height:3px;border-radius:4px;background:var(--cs-accent);width:100%;margin-top:5px}.cs-complete-label{color:var(--cs-accent);font-size:11px}.cs-more{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--cs-line);border-radius:11px;background:var(--cs-panel);padding:10px 16px;font-size:12px;color:var(--cs-text);margin:16px auto 0;cursor:pointer}.cs-collectors{border-top:1px solid var(--cs-line);padding-top:24px}.cs-search{display:flex;align-items:center;gap:8px;max-width:100%;width:260px;padding:0 12px;border:1px solid var(--cs-line);border-radius:11px;background:var(--cs-panel);color:var(--cs-muted)}.cs-search input{min-width:0;width:100%;border:0;background:none;color:var(--cs-text);font-size:16px;padding:10px 0;outline:none}.cs-search input::placeholder{font-size:12px}.cs-rank-head,.cs-rank-row{display:grid;grid-template-columns:48px minmax(160px,1fr) minmax(180px,1.1fr) 105px;gap:22px;align-items:center}.cs-rank-head{padding:0 18px 11px;color:var(--cs-muted);font-size:10px}.cs-rank-head span:last-child{text-align:right}.cs-rankings{display:grid;gap:9px}.cs-rank-row{width:100%;border:1px solid var(--cs-line);border-radius:14px;background:var(--cs-panel);color:var(--cs-text);padding:17px 18px;text-align:left;transition:border-color .2s,background .2s;cursor:pointer}.cs-rank-row:hover{border-color:var(--cs-accent);background:var(--cs-soft)}.cs-rank{color:var(--cs-muted);font-size:20px;font-variant-numeric:tabular-nums}.cs-collector-person{display:flex;align-items:center;gap:13px;min-width:0}.cs-collector-avatar{width:48px;height:48px;border-radius:14px;object-fit:cover;flex-shrink:0}.cs-collector-person .cs-user-name{font-size:16px}.cs-progress{display:block;min-width:0}.cs-progress-copy{display:flex;justify-content:space-between;gap:8px;font-size:11px;margin-bottom:8px;color:var(--cs-muted)}.cs-progress-copy strong{font-size:13px;color:var(--cs-text)}.cs-track{display:block;height:6px;background:var(--cs-soft);border-radius:8px;overflow:hidden}.cs-track>span{display:block;height:100%;border-radius:inherit;background:var(--cs-accent);transition:width .6s ease}.cs-remaining{text-align:right;position:relative;padding-right:20px}.cs-remaining strong{display:block;font-size:20px}.cs-remaining>span{font-size:10px;color:var(--cs-muted)}.cs-remaining svg{position:absolute;right:0;top:9px;color:var(--cs-accent)}.cs-empty{border:1px dashed var(--cs-line);border-radius:15px;padding:30px 16px;text-align:center;color:var(--cs-muted)}.cs-empty>svg{margin:auto;color:var(--cs-accent)}.cs-empty h3{font-size:16px;color:var(--cs-text);margin:12px 0 8px}.cs-empty p{font-size:12px}.cs-eligibility-note{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin:20px 0 0;font-size:11px;color:var(--cs-muted)}.cs-eligibility-note svg{color:var(--cs-accent)}
.cs-modal-overlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;background:#0009;backdrop-filter:blur(7px)}.cs-modal{position:relative;width:100%;max-width:440px;max-height:85dvh;overflow-y:auto;padding:28px;border:1px solid var(--cs-line);border-radius:22px;background:var(--cs-panel);color:var(--cs-text);box-shadow:0 24px 80px #0005}.cs-modal-close{position:absolute;right:14px;top:14px;padding:8px;background:var(--cs-soft);border:0;border-radius:50%;color:var(--cs-text);cursor:pointer}.cs-modal-avatar{width:76px;height:76px;border-radius:21px;object-fit:cover}.cs-modal h2{font-size:24px;font-weight:700;margin:16px 0 12px;overflow-wrap:anywhere}.cs-profile-link{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:11px;border:1px solid var(--cs-line);background:var(--cs-soft);color:var(--cs-text);font-size:13px;cursor:pointer}.cs-moderation{border-top:1px solid var(--cs-line);margin-top:22px;padding-top:20px}.cs-moderation h3{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:650;margin:0 0 10px}.cs-moderation p{font-size:12px;line-height:1.7;color:var(--cs-muted)}.cs-moderation label{display:block;font-size:12px;margin:16px 0 8px}.cs-moderation textarea{display:block;width:100%;border:1px solid var(--cs-line);background:var(--cs-soft);border-radius:11px;padding:12px;font-size:16px;color:var(--cs-text);resize:vertical}.cs-revoke{width:100%;padding:12px;margin-top:14px;border-radius:11px;background:#be3541;border:0;color:#fff;font-size:13px;font-weight:600;cursor:pointer}.cs-revoke:disabled{opacity:.4;cursor:not-allowed}.cs-error{color:#ef8891!important}@keyframes cs-arrive{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:720px){.cs-heading{align-items:start;gap:14px;padding-bottom:22px}.cs-heading h1{font-size:27px}.cs-heading p{font-size:12px}.cs-set-total strong{font-size:30px}.cs-set-total span{font-size:9px}.cs-section-heading{align-items:start;flex-wrap:wrap;gap:12px}.cs-section-heading h2{font-size:20px}.cs-finishers{padding-top:20px}.cs-finisher-grid{grid-template-columns:1fr;gap:12px}.cs-finisher{display:grid;grid-template-columns:64px minmax(0,1fr);gap:7px 15px;padding:18px;text-align:left;align-items:center}.cs-finisher-banner{grid-column:1 / -1;margin-bottom:4px}.cs-finisher-avatar{grid-column:1;grid-row:2 / span 2;width:62px;height:62px;margin:0;border-radius:18px}.cs-finisher .cs-user-name{grid-column:2;grid-row:2;font-size:20px}.cs-finisher>.cs-muted{grid-column:2;grid-row:3}.cs-complete-line{grid-column:1 / -1;margin-top:10px}.cs-complete-label{grid-column:1 / -1;font-size:10px}.cs-search{width:100%}.cs-rank-head{display:none}.cs-rank-row{grid-template-columns:28px minmax(0,1fr) auto;gap:12px;padding:15px}.cs-rank{font-size:17px;grid-column:1;grid-row:1}.cs-collector-person{grid-column:2;grid-row:1;gap:10px}.cs-collector-avatar{width:42px;height:42px;border-radius:12px}.cs-collector-person .cs-user-name{font-size:15px}.cs-progress{grid-column:2 / -1;grid-row:2}.cs-remaining{grid-column:3;grid-row:1;padding-right:0}.cs-remaining strong{font-size:18px}.cs-remaining>span{font-size:9px}.cs-remaining svg{display:none}.cs-progress-copy{margin-bottom:6px}.cs-modal{padding:22px;max-height:82dvh}.cs-eligibility-note{align-items:start;line-height:1.7}}
@media(prefers-reduced-motion:reduce){.cs-redesign *{animation:none!important;transition:none!important}.cs-finisher:hover{transform:none}}
`;
const CommunitySet = () => {
const { id } = useParams();
const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(true);
const [loadingStage, setLoadingStage] = useState(0);
const [loadingDetail, setLoadingDetail] = useState("Connecting to your community...");
const [loadingSeconds, setLoadingSeconds] = useState(0);
const [loadError, setLoadError] = useState<string | null>(null);
const [reloadVersion, setReloadVersion] = useState(0);
const [collectors, setCollectors] = useState<any[]>([]);
const [completed, setCompleted] = useState<any[]>([]);
const [showAllFinishers, setShowAllFinishers] = useState(false);
const [isModerator, setIsModerator] = useState(false);
const [selectedUser, setSelectedUser] = useState<any | null>(null);
const [moderationReason, setModerationReason] = useState("");
const [moderationError, setModerationError] = useState("");
const [revoking, setRevoking] = useState(false);
const [collectorSearch, setCollectorSearch] = useState("");
useEffect(() => {
  let active = true;
  const loadModerator = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data, error } = await supabase.from("leaderboard_moderators").select("user_id").eq("user_id", session.user.id).maybeSingle();
    if (active) setIsModerator(!error && !!data);
  };
  void loadModerator();
  return () => { active = false; };
}, []);
useEffect(() => {
  if (!selectedUser) return;
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const close = (event: KeyboardEvent) => { if (event.key === "Escape" && !revoking) setSelectedUser(null); };
  window.addEventListener("keydown", close);
  return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
}, [selectedUser, revoking]);
const openCollector = (user: any) => {
  setModerationReason("");
  setModerationError("");
  setSelectedUser(user);
};
const revokeEligibility = async () => {
  if (!isModerator || !selectedUser || revoking) return;
  setRevoking(true);
  setModerationError("");
  try {
    const { error } = await supabase.rpc("revoke_leaderboard_eligibility", { p_target_user_id: selectedUser.id, p_reason: moderationReason.trim() });
    if (error) throw error;
    setCollectors(previous => previous.filter(user => user.id !== selectedUser.id));
    setCompleted(previous => previous.filter(user => user.id !== selectedUser.id));
    setSelectedUser(null);
    setReloadVersion(value => value + 1);
  } catch (error: unknown) {
    setModerationError(error instanceof Error ? error.message : String((error as { message?: string })?.message || "Unable to revoke eligibility."));
  } finally { setRevoking(false); }
};

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
  if (!isLoading) return;
const started = Date.now();
  setLoadingSeconds(0);
const timer = window.setInterval(() => setLoadingSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
  return () => window.clearInterval(timer);
}, [isLoading, id, reloadVersion]);
const set = id ? sets[id] : undefined;
  useEffect(() => {
    if (!id || !set) return;
let cancelled = false;
setIsLoading(true);
setLoadingStage(0);
setLoadingDetail("Connecting to your community...");
setShowAllFinishers(false);
setLoadError(null);
setCollectors([]);
setCompleted([]);
const load = async () => {
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!session?.user) throw new Error("Please log in to view community collections.");
if (cancelled) return;
setLoadingStage(1);
setLoadingDetail("Reading collections for this set...");
const databaseSetId = id === "friendshipsbegin" ? "SD" : id === "fantasywonderland" ? "FW" : id === "discord" ? "12" : id;
const [progress, excludedUsers] = await Promise.all([
  readCommunityPages((from, to) => supabase
    .from("collection_progress_raw")
    .select("user_id, progress, updated_at, completed_at")
    .eq("set_id", databaseSetId)
    .order("user_id")
    .range(from, to), count => {
      if (!cancelled) setLoadingDetail(`${count.toLocaleString()} collections read...`);
    }),
  readCommunityPages((from, to) => supabase
    .from("leaderboard_exclusions")
    .select("user_id").order("user_id").range(from, to)),
]);
if (cancelled) return;
const excludedUserIds = new Set(excludedUsers.map(row => String(row.user_id)));
const progressUserIds = Array.from(new Set(progress
  .filter(row => !excludedUserIds.has(String(row.user_id)))
  .map(row => String(row.user_id))));
if (progressUserIds.length === 0) return;
setLoadingStage(2);
setLoadingDetail(`Checking ${progressUserIds.length.toLocaleString()} collectors...`);
const tradingProfiles = await readCommunityBatches(progressUserIds,
  ids => supabase.from("trading_profiles").select("user_id, discord_username").in("user_id", ids),
  () => cancelled, count => {
    if (!cancelled) setLoadingDetail(`${count.toLocaleString()} of ${progressUserIds.length.toLocaleString()} collectors checked...`);
  });
if (cancelled) return;
const eligibleUserIds = new Set(
        (tradingProfiles || [])
          .filter(
            (p: any) =>
              p.discord_username &&
              p.discord_username.trim() !== ""
          )
          .map((p: any) => p.user_id)
      );
const active: any[] = [];
const finished: any[] = [];
      progress.forEach((row: any) => {
        if (
          !eligibleUserIds.has(row.user_id) ||
          excludedUserIds.has(row.user_id)
        ) {
          return;
        }
let owned = 0;
        if (id === "friendshipsbegin") {
const BONUS_STRUCTURE = [
            { prefix: "SD01C", count: 9 },
            { prefix: "SD01U", count: 7 },
            { prefix: "SD01SR", count: 6 },
            { prefix: "SD01SPR", count: 10 },
            { prefix: "SD01GR", count: 6 },
            { prefix: "SD01CR", count: 6 },
            { prefix: "SD01ER", count: 6 },
            { prefix: "SD01PER", count: 12 },
            { prefix: "SD01PRR", count: 6 },
          ];
const getDeckCards = (deckCode: string) => {
const cards: string[] = [];
const deckLetter = deckCode.slice(-1);
const deckIndex =
              deckLetter.charCodeAt(0) - 64;
const add = (
              rarity: string,
              count: number
            ) => {
              for (let i = 1; i <= count; i++) {
                cards.push(
                  `${deckCode}${rarity}${String(i).padStart(
                    2,
                    "0"
                  )}`
                );
              }
            };
            add("C", 9);
            add("U", 4);
            add("SR", 2);
            cards.push(
              `SD01ER${String(deckIndex).padStart(2, "0")}`
            );
            add("SPR", 4);
            cards.push(
              `SD01RR${String(deckIndex).padStart(2, "0")}`
            );
            return cards;
          };
const starterDecks = [
            "SD01A",
            "SD01B",
            "SD01C",
            "SD01D",
            "SD01E",
            "SD01F",
          ];
          starterDecks.forEach((deck) => {
const cards = getDeckCards(deck);
            cards.forEach((cardKey) => {
const stateKey = `STARTER-${cardKey}`;
              if (row.progress?.[stateKey]) {
                owned++;
              }
            });
          });
          BONUS_STRUCTURE.forEach(
            ({ prefix, count }) => {
              for (let i = 1; i <= count; i++) {
let actualIndex = i;
                if (prefix === "SD01PER") {
                  actualIndex = i + 6;
                }
const key = `${prefix}${String(
                  actualIndex
                ).padStart(2, "0")}`;
const stateKey = `BONUS-${key}`;
                if (row.progress?.[stateKey]) {
                  owned++;
                }
              }
            }
          );
        } else if (id === "discord") {
          owned = Object.values(
            row.progress || {}
          ).filter(
            (v: any) =>
              v === true || v?.owned === true
          ).length;
        } else {
const isoSet = isoSets.find(
            (s) => s.id === id
          );
          if (!isoSet) return;
          owned = Object.values(
            row.progress || {}
          ).filter(
            (v: any) =>
              v === true || v?.owned === true
          ).length;
        }
const user = {
  id: row.user_id,
  username: "Anonymous",
  avatar_url: undefined as string | undefined,
  owned,
  updated: row.updated_at,
  completedAt: row.completed_at,
};
const actualTotal = set.total;
        if (owned === actualTotal) {
          finished.push(user);
        } else {
          active.push(user);
        }
      });
const hasForcedCollectors = forcedStillCollecting.some(name => name.trim() !== "");
const activeCandidates = hasForcedCollectors ? active : [...active].sort((a, b) => b.owned - a.owned).slice(0, 10);
const finishedCandidates = [...finished].sort(compareFinishers).slice(0, 10);
const visibleIds = Array.from(new Set([...activeCandidates, ...finishedCandidates].map(user => String(user.id))));
      setLoadingStage(3);
      setLoadingDetail("Preparing finishers and top collectors...");
const profiles = await readCommunityBatches(visibleIds,
        ids => supabase.from("profiles").select("id, username, avatar_url").in("id", ids),
        () => cancelled);
      if (cancelled) return;
const profileMap = new Map(profiles.map(profile => [String(profile.id), profile]));
      for (const user of [...active, ...finished]) {
const profile = profileMap.get(String(user.id));
        user.username = profile?.username || "Anonymous";
        user.avatar_url = profile?.avatar_url;
      }
      active.sort((a, b) => {
        if (
          forcedStillCollecting.includes(a.username)
        )
          return -1;
        if (
          forcedStillCollecting.includes(b.username)
        )
          return 1;
        return b.owned - a.owned;
      });
      finished.sort(compareFinishers);
      if (cancelled) return;
      setCollectors(active.slice(0, 10));
      setCompleted(finished.slice(0, 10));
    };
    void load().catch((error: unknown) => {
      if (!cancelled) {
        console.error("Community collection loading failed:", error);
        setLoadError(error instanceof Error ? error.message : "Unable to load this community collection.");
      }
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id, set, reloadVersion]);
  if (!set) return null;
const completionPercentage = (owned: number) =>
  Math.min(100, (owned / set.total) * 100);
const finisherAward = { label: "Finisher" };
return (
  <div
    className={`min-h-screen pb-20 transition-colors ${
      isLightMode
        ? "bg-[#f6f4ef] text-zinc-900"
        : "bg-[#0d0f10] text-zinc-100"
    }`}
  >
    <div className="cs-redesign w-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/community")}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
            isLightMode
              ? "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
              : "border-white/[0.08] bg-[#17191a] text-zinc-300 hover:bg-white/[0.05]"
          }`}
        >
          <ArrowLeft size={16} />
          Community
        </button>
      </div>
      <style>{communitySetStyles}</style>
      <header className="cs-heading">
        <div><span className="cs-eyebrow">COLLECTION LEADERBOARD</span><h1>{set.name}</h1><p>Every collection tells a story. Meet the finishers and the collectors closing in.</p></div>
        <div className="cs-set-total"><strong>{set.total}</strong><span>cards in this set</span></div>
      </header>
      {isLoading && !loadError && (
        <section aria-label="Loading community rankings" aria-busy="true" className={`mb-4 overflow-hidden rounded-[26px] border px-5 py-8 sm:py-10 ${isLightMode ? "border-black/10 bg-white" : "border-white/[0.08] bg-[#151718]"}`}>
          <div className="mx-auto max-w-lg text-center">
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-2 ${isLightMode ? "border-[#c29a00]/15" : "border-[#FFD54A]/15"}`} />
              <div className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent motion-reduce:animate-none ${isLightMode ? "border-t-[#a17c00] border-r-[#a17c00]/40" : "border-t-[#FFD54A] border-r-[#FFD54A]/40"}`} />
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isLightMode ? "bg-[#fff3b8] text-[#806100]" : "bg-[#FFD54A]/10 text-[#FFD54A]"}`}>
                <Trophy size={25} className="animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Getting the community ready</h2>
            <p role="status" aria-live="polite" aria-atomic="true" className={`mt-2 min-h-6 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>{loadingDetail}</p>
            <ol className="mt-6 grid grid-cols-4 gap-2 text-xs sm:gap-3 sm:text-sm">
              {["Connect", "Collections", "Eligibility", "Rankings"].map((label, index) => (
                <li key={label} aria-current={index === loadingStage ? "step" : undefined} className={index <= loadingStage ? isLightMode ? "text-[#806100]" : "text-[#E8CA55]" : isLightMode ? "text-zinc-400" : "text-zinc-600"}>
                  <div className={`mb-2 h-1.5 rounded-full transition-colors duration-300 ${index < loadingStage ? "bg-[#D2AD28]" : index === loadingStage ? "animate-pulse bg-[#D2AD28] motion-reduce:animate-none" : isLightMode ? "bg-zinc-200" : "bg-white/[0.08]"}`} />
                  {label}
                </li>
              ))}
            </ol>
            <p className={`mt-5 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-500"}`}>
              {loadingSeconds >= 12 ? "Larger sets can take a little longer. Still loading - no need to refresh." : "Finding finishers and collectors closest to completing this set."}
              {loadingSeconds >= 5 && <span className="ml-2 tabular-nums" aria-hidden="true">{loadingSeconds}s</span>}
            </p>
          </div>
        </section>
      )}
      {loadError && (
        <div role="alert" className="mb-4 rounded-2xl border border-zinc-400/20 p-6 text-center">
          <p>{loadError}</p>
          <button type="button" onClick={() => setReloadVersion(value => value + 1)} className="mt-3 rounded-full bg-[#FFD54A] px-5 py-2 font-semibold text-zinc-900">Try again</button>
        </div>
      )}
      <div hidden={isLoading || !!loadError}>
        <section className="cs-finishers" aria-labelledby="cs-finishers-title">
          <div className="cs-section-heading"><div><span className="cs-eyebrow">THE FINISH LINE</span><h2 id="cs-finishers-title"><Trophy size={21} />Completed collections</h2></div><span className="cs-muted">{completed.length} finishers</span></div>
          {completed.length > 0 ? <div className="cs-finisher-grid">{(showAllFinishers ? completed : completed.slice(0, 3)).map((user, index) => {
            const assets = getProfileAssets(user);
            return <button type="button" key={user.id} className="cs-finisher" style={{ animationDelay: `${index * 45}ms` }} onClick={() => openCollector(user)} aria-label={`View ${user.username}`}>
              <div className="cs-finisher-banner"><Trophy size={17}/><span>{finisherAward.label}</span><ArrowUpRight size={17}/></div>
              <ProfileAvatar profile={user} src={assets.avatar} alt="" className="cs-finisher-avatar"/>
              <div className="cs-user-name">{user.username}{assets.verification && <CardImage src={assets.verification.badge} alt={assets.verification.label} className="cs-badge"/>}</div>
              <span className="cs-muted">{set.total} / {set.total} cards</span>
              <div className="cs-complete-line"/><span className="cs-complete-label">Collection complete</span>
            </button>;
          })}</div> : <div className="cs-empty"><Trophy size={28}/><h3>The first finish is still waiting.</h3><p>Complete your collection to join this set's finishers.</p></div>}
          {completed.length > 3 && <button type="button" className="cs-more" onClick={() => setShowAllFinishers(value => !value)}>{showAllFinishers ? "Show fewer finishers" : `View all ${completed.length} finishers`}{showAllFinishers ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>}
        </section>
        <section className="cs-collectors" aria-labelledby="cs-collectors-title">
          <div className="cs-section-heading"><div><span className="cs-eyebrow">THE NEXT FINISHERS</span><h2 id="cs-collectors-title"><Users size={21}/>Still collecting</h2></div><label className="cs-search"><Search size={16}/><input type="search" value={collectorSearch} onChange={event => setCollectorSearch(event.target.value)} placeholder="Find a collector" aria-label="Find a collector"/></label></div>
          <div className="cs-rank-head"><span>Rank</span><span>Collector</span><span>Collection progress</span><span>Remaining</span></div>
          <div className="cs-rankings">{collectors.filter(user => String(user.username || "").toLowerCase().includes(collectorSearch.trim().toLowerCase())).map(user => {
            const assets = getProfileAssets(user);
            const percentage = completionPercentage(user.owned);
            const rank = collectors.indexOf(user) + 1;
            return <button type="button" key={user.id} className="cs-rank-row" onClick={() => openCollector(user)} aria-label={`View ${user.username}, ${percentage.toFixed(1)} percent complete`}>
              <span className="cs-rank">{String(rank).padStart(2, "0")}</span>
              <span className="cs-collector-person"><ProfileAvatar profile={user} src={assets.avatar} alt="" className="cs-collector-avatar"/><span className="cs-user-name">{user.username}{assets.verification && <CardImage src={assets.verification.badge} alt={assets.verification.label} className="cs-badge"/>}</span></span>
              <span className="cs-progress"><span className="cs-progress-copy"><strong>{percentage.toFixed(1)}%</strong><span>{user.owned} / {set.total}</span></span><span className="cs-track"><span style={{ width: `${percentage}%` }}/></span></span>
              <span className="cs-remaining"><strong>{Math.max(0, set.total - user.owned)}</strong><span>cards to go</span><ArrowUpRight size={16}/></span>
            </button>;
          })}</div>
          {collectors.length === 0 ? <div className="cs-empty"><Users size={26}/><h3>No active collectors yet</h3></div> : !collectors.some(user => String(user.username || "").toLowerCase().includes(collectorSearch.trim().toLowerCase())) && <div className="cs-empty"><p>No collectors match this name.</p><button type="button" className="cs-more" onClick={() => setCollectorSearch("")}>Clear search</button></div>}
        </section>
        <p className="cs-eligibility-note"><ShieldCheck size={15}/>Discord verification is required for leaderboard eligibility.{isModerator && <span> Select a collector to manage eligibility.</span>}</p>
      </div>
      {selectedUser && <div className="cs-modal-overlay" onClick={event => { if (event.target === event.currentTarget && !revoking) setSelectedUser(null); }}>
        <section className="cs-modal" role="dialog" aria-modal="true" aria-labelledby="cs-collector-title" onKeyDown={event => {
          if (event.key !== "Tab") return;
          const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), a[href], input:not(:disabled)'));
          const first = elements[0];
          const last = elements[elements.length - 1];
          if (!first) { event.preventDefault(); return; }
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}>
          <button autoFocus type="button" className="cs-modal-close" disabled={revoking} onClick={() => setSelectedUser(null)} aria-label="Close collector"><X size={20}/></button>
          <ProfileAvatar profile={selectedUser} src={getProfileAssets(selectedUser).avatar} alt="" className="cs-modal-avatar"/>
          <h2 id="cs-collector-title">{selectedUser.username}</h2>
          <button type="button" className="cs-profile-link" disabled={revoking} onClick={() => navigate(`/${encodeURIComponent(selectedUser.username)}`)}>Open public profile<ArrowUpRight size={17}/></button>
          {isModerator && <div className="cs-moderation"><h3><ShieldCheck size={17}/>Leaderboard eligibility</h3><p>Revoking eligibility removes this collector from every set leaderboard. The reason and your moderator identity are recorded.</p><label htmlFor="cs-reason">Reason for revocation</label><textarea id="cs-reason" value={moderationReason} onChange={event => setModerationReason(event.target.value)} minLength={5} maxLength={1000} rows={3} disabled={revoking} placeholder="Explain the eligibility decision"/>{moderationError && <p role="alert" className="cs-error">{moderationError}</p>}<button type="button" className="cs-revoke" disabled={revoking || moderationReason.trim().length < 5} onClick={() => void revokeEligibility()}>{revoking ? "Revoking eligibility..." : "Revoke leaderboard eligibility"}</button></div>}
        </section>
      </div>}

    </div>
  </div>
);
};
export default CommunitySet;
