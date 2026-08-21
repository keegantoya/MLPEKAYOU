import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "./Everypony/profile-assets";

type LeaderboardUser = {
  id: string;
  username: string;
  avatar_url?: string | null;
  total: number;
};

const CCG_SET_IDS = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
]);

const TCG_SET_IDS = new Set([
  "12",
  "SD",
  "FW",
  "tcgpromos",
]);

const LEADERBOARD_USER_ID =
  "94a1c998-d040-4dd2-b2fb-5f606287139d";

const Leaderboard = () => {
  const [ccgLeaders, setCcgLeaders] = useState<LeaderboardUser[]>([]);
  const [tcgLeaders, setTcgLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationNotice, setShowVerificationNotice] = useState(true);

  /*
   * ------------------------------------------------------------
   * LOAD BOTH LEADERBOARDS
   * ------------------------------------------------------------
   */

useEffect(() => {
  const loadLeaderboards = async () => {
    setLoading(true);

    try {
      /*
       * Get profiles using the SAME eligibility logic
       * the original leaderboard used.
       *
       * CCG eligibility: 1,300+
       * TCG eligibility: 450+
       *
       * We load both groups at once now instead of using
       * leaderboardMode.
       */

      const { data: ccgProfiles, error: ccgProfilesError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy"
          )
          .gte("collection_total", 1200);

      if (ccgProfilesError) {
        console.error(
          "CCG leaderboard profiles error:",
          ccgProfilesError
        );
        return;
      }

      const { data: tcgProfiles, error: tcgProfilesError } =
        await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, iso_hidden_sets, collection_total, rank_worthy"
          )
          .gte("collection_total", 450);

      if (tcgProfilesError) {
        console.error(
          "TCG leaderboard profiles error:",
          tcgProfilesError
        );
        return;
      }

      /*
       * Get verified Discord profiles.
       */

      const { data: tradingProfiles, error: tradingError } =
        await supabase
          .from("trading_profiles")
          .select("user_id, discord_username");

      if (tradingError) {
        console.error(
          "Leaderboard trading profile error:",
          tradingError
        );
        return;
      }

      const eligibleUserIds = new Set(
        (tradingProfiles || [])
          .filter(
            (profile: any) =>
              profile.discord_username &&
              profile.discord_username.trim() !== ""
          )
          .map((profile: any) => profile.user_id)
      );

      /*
       * Load centralized user exclusions.
       *
       * Anyone in leaderboard_exclusions is excluded from
       * both the leaderboard and community set pages.
       */

      const { data: excludedUsers, error: exclusionsError } =
        await supabase
          .from("leaderboard_exclusions")
          .select("user_id");

      if (exclusionsError) {
        console.error(
          "Leaderboard exclusions error:",
          exclusionsError
        );
        return;
      }

      const excludedUserIds = new Set(
        (excludedUsers || []).map(
          (user: any) => user.user_id
        )
      );

      /*
       * Apply Discord eligibility and centralized exclusions.
       */

      const filterEligible = (profiles: any[]) =>
        profiles.filter(
          (profile: any) =>
            eligibleUserIds.has(profile.id) &&
            !excludedUserIds.has(profile.id)
        );

      const eligibleCcgProfiles =
        filterEligible(ccgProfiles || []);

      const eligibleTcgProfiles =
        filterEligible(tcgProfiles || []);

      /*
       * We need progress for everyone who could appear
       * on either leaderboard.
       */

      const allEligibleIds = Array.from(
        new Set([
          ...eligibleCcgProfiles.map(
            (profile: any) => profile.id
          ),
          ...eligibleTcgProfiles.map(
            (profile: any) => profile.id
          ),
        ])
      );

      /*
       * No eligible users = simply show empty boards.
       */

      if (allEligibleIds.length === 0) {
        setCcgLeaders([]);
        setTcgLeaders([]);
        return;
      }

      /*
       * Pull collection progress ONCE for both boards.
       */

      const {
        data: rawProgress,
        error: progressError,
      } = await supabase
        .from("collection_progress_raw")
        .select("user_id, set_id, progress")
        .in("user_id", allEligibleIds);

      if (progressError) {
        console.error(
          "Leaderboard collection progress error:",
          progressError
        );
        return;
      }

      /*
       * Calculate CCG totals.
       */

      const ccgTotals = new Map<string, number>();

      /*
       * Calculate TCG totals.
       */

      const tcgTotals = new Map<string, number>();

      (rawProgress || []).forEach((row: any) => {
        const setId = String(row.set_id);

        const owned = Object.values(
          row.progress || {}
        ).filter(
          (value: any) =>
            value === true ||
            (typeof value === "object" &&
              value?.owned === true)
        ).length;

        if (CCG_SET_IDS.has(setId)) {
          const current =
            ccgTotals.get(row.user_id) || 0;

          ccgTotals.set(
            row.user_id,
            current + owned
          );
        }

        if (TCG_SET_IDS.has(setId)) {
          const current =
            tcgTotals.get(row.user_id) || 0;

          tcgTotals.set(
            row.user_id,
            current + owned
          );
        }
      });

      /*
       * --------------------------------------------------------
       * CCG
       * --------------------------------------------------------
       *
       * IMPORTANT:
       * Eligibility comes from profiles.collection_total,
       * exactly like the original leaderboard.
       *
       * The displayed ranking number comes from the
       * calculated CCG total.
       */

      const ccgLeaderboard = eligibleCcgProfiles
        .map((profile: any) => ({
          id: profile.id,
          username: profile.username || "Anonymous",
          avatar_url: profile.avatar_url,
          total:
            ccgTotals.get(profile.id) || 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 7);

      /*
       * --------------------------------------------------------
       * TCG
       * --------------------------------------------------------
       */

      const tcgLeaderboard = eligibleTcgProfiles
        .map((profile: any) => ({
          id: profile.id,
          username: profile.username || "Anonymous",
          avatar_url: profile.avatar_url,
          total:
            tcgTotals.get(profile.id) || 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 7);

      setCcgLeaders(ccgLeaderboard);
      setTcgLeaders(tcgLeaderboard);
    } catch (error) {
      console.error(
        "Leaderboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  loadLeaderboards();
}, []);

 /*
 * ------------------------------------------------------------
 * STARK-STYLE LEADERBOARD UI
 * ------------------------------------------------------------
 */

const renderAvatarEffects = (user: LeaderboardUser) => {
  if (user.id !== LEADERBOARD_USER_ID) {
    return null;
  }

  return (
    <>
      {[
        { left: "24%", delay: "0s" },
        { left: "50%", delay: ".45s" },
        { left: "76%", delay: ".9s" },
      ].map((line, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: line.left,
            top: "-16px",
            animation:
              "stinkFloat 2s ease-in-out infinite",
            animationDelay: line.delay,
          }}
        >
          <svg
            width="18"
            height="42"
            viewBox="0 0 18 42"
            fill="none"
          >
            <path
              d="M9 42C9 32 2 30 2 22C2 16 14 14 14 7C14 4 12 2 10 0"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </>
  );
};


/*
 * ------------------------------------------------------------
 * TECHNICAL CORNER BRACKETS
 * ------------------------------------------------------------
 */

const CornerBrackets = ({
  color = "#E7C84B",
}: {
  color?: string;
}) => (
  <>
    <div
      className="absolute left-0 top-0 h-4 w-4 border-l border-t"
      style={{ borderColor: color }}
    />

    <div
      className="absolute right-0 top-0 h-4 w-4 border-r border-t"
      style={{ borderColor: color }}
    />

    <div
      className="absolute bottom-0 left-0 h-4 w-4 border-b border-l"
      style={{ borderColor: color }}
    />

    <div
      className="absolute bottom-0 right-0 h-4 w-4 border-b border-r"
      style={{ borderColor: color }}
    />
  </>
);


/*
 * ------------------------------------------------------------
 * TOP THREE
 * ------------------------------------------------------------
 */

const renderTopThree = (
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  const topThree = leaders.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {topThree.map((user, index) => {
        const rank = index + 1;
        const { avatar, verification } =
          getProfileAssets(user);

        const isFirst = rank === 1;

        return (
          <div
            key={`${section}-${user.id}`}
            className={`
              relative
              h-[320px]
              overflow-hidden
              bg-[#0c1113]
              border
              ${
                isFirst
                  ? "border-[#E7C84B]/70"
                  : "border-[#30383b]"
              }
            `}
            style={{
              boxShadow: isFirst
                ? "0 0 35px rgba(231,200,75,.08), inset 0 0 45px rgba(73,217,255,.025)"
                : "inset 0 0 35px rgba(255,255,255,.015)",
            }}
          >
            <CornerBrackets
              color={
                isFirst
                  ? "#E7C84B"
                  : "#596467"
              }
            />

            {/* TOP TECH BAR */}
            <div className="absolute left-0 right-0 top-0 h-8 border-b border-[#293134] bg-[#080c0d]">
              <div className="flex h-full items-center justify-between px-4">
                <div className="font-mono text-[8px] tracking-[0.28em] text-[#9aa7aa]">
                  {section.toUpperCase()} // COLLECTOR
                </div>

                <div
                  className={`
                    font-mono
                    text-[9px]
                    font-bold
                    tracking-[0.2em]
                    ${
                      isFirst
                        ? "text-[#E7C84B]"
                        : "text-[#697579]"
                    }
                  `}
                >
                  {String(rank).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* AVATAR SYSTEM */}
            <div className="absolute left-1/2 top-[58px] -translate-x-1/2">
              {/* Outer targeting frame */}
              <div
                className={`
                  absolute
                  -inset-5
                  ${
                    isFirst
                      ? "border-[#E7C84B]/25"
                      : "border-[#596467]/25"
                  }
                `}
                style={{
                  clipPath:
                    "polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              />

              {/* Rotated HUD frame */}
              <div
                className={`
                  absolute
                  -inset-3
                  rotate-45
                  border
                  ${
                    isFirst
                      ? "border-[#E7C84B]/45"
                      : "border-[#596467]/35"
                  }
                `}
              />

              {/* Scan brackets */}
              <div
                className={`
                  absolute
                  -left-5
                  top-1/2
                  h-px
                  w-3
                  ${
                    isFirst
                      ? "bg-[#E7C84B]"
                      : "bg-[#596467]"
                  }
                `}
              />

              <div
                className={`
                  absolute
                  -right-5
                  top-1/2
                  h-px
                  w-3
                  ${
                    isFirst
                      ? "bg-[#E7C84B]"
                      : "bg-[#596467]"
                  }
                `}
              />

              {/* Avatar */}
              <div
                className={`
                  relative
                  h-[104px]
                  w-[104px]
                  overflow-hidden
                  ${
                    isFirst
                      ? "border-2 border-[#E7C84B]"
                      : "border border-[#667276]"
                  }
                `}
                style={{
                  clipPath:
                    "polygon(16% 0%, 84% 0%, 100% 16%, 100% 84%, 84% 100%, 16% 100%, 0% 84%, 0% 16%)",
                  boxShadow: isFirst
                    ? "0 0 25px rgba(73,217,255,.18)"
                    : "0 0 15px rgba(73,217,255,.05)",
                }}
              >
                <img
                  src={avatar}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

                {/* Avatar scan overlay */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-30
                  "
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent 0px,
                        transparent 4px,
                        rgba(73,217,255,.25) 5px
                      )
                    `,
                  }}
                />

                {/* Center targeting point */}
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E7C84B] shadow-[0_0_8px_#E7C84B]" />

                {renderAvatarEffects(user)}
              </div>
            </div>

            {/* USERNAME */}
            <div className="absolute left-4 right-4 top-[190px]">
              <div className="flex min-w-0 items-center justify-center gap-2">
                <div className="max-w-[80%] truncate text-center text-lg font-bold tracking-wide text-[#edf5f7]">
                  {user.username}
                </div>

                {verification && (
                  <img
                    src={verification.badge}
                    alt={verification.label}
                    title={verification.label}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                )}
              </div>
            </div>

            {/* BOTTOM DATA MODULE */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#293134] bg-[#080c0d]">
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#9aa7aa]">
                    COLLECTION
                  </div>

                  <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#9aa7aa]">
                    INVENTORY COUNT
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className={`
                      font-mono
                      font-black
                      leading-none
                      ${
                        isFirst
                          ? "text-3xl text-[#E7C84B]"
                          : "text-2xl text-[#dfe8eb]"
                      }
                    `}
                  >
                    {user.total.toLocaleString()}
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#9aa7aa]">
                    CRDS
                  </span>
                </div>
              </div>

              <div
                className={`
                  h-[2px]
                  w-full
                  ${
                    isFirst
                      ? "bg-[#E7C84B]"
                      : "bg-[#4d595d]"
                  }
                `}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/*
 * ------------------------------------------------------------
 * RANKS 4–11
 * ------------------------------------------------------------
 */

const renderRemainingRanks = (
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  const remaining = leaders.slice(3, 11);

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {remaining.map((user, index) => {
        const rank = index + 4;
        const { avatar, verification } =
          getProfileAssets(user);

        return (
          <div
            key={`${section}-${user.id}`}
            className="
              group
              relative
              min-w-0
              overflow-hidden
              border
              border-[#293134]
              bg-[#0e1214]
              px-4
              py-4
              transition-all
              duration-200
              hover:border-[#E7C84B]/50
              hover:bg-[#111719]
            "
          >
            <CornerBrackets color="#374347" />

            {/* Rank + status */}
            <div className="flex items-center justify-between">
              <div className="font-mono text-xl font-black text-[#E7C84B]">
                {String(rank).padStart(2, "0")}
              </div>

              <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#9aa7aa]">
                ONLINE
              </div>
            </div>

            {/* User */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt=""
                  className="
                    h-12
                    w-12
                    rounded-full
                    border
                    border-[#4b575a]
                    object-cover
                  "
                />

                {renderAvatarEffects(user)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="truncate text-sm font-bold text-[#e8edef]">
                    {user.username}
                  </div>

                  {verification && (
                    <img
                      src={verification.badge}
                      alt={verification.label}
                      title={verification.label}
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                  )}
                </div>

                <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.15em] text-[#9aa7aa]">
                  VERIFIED COLLECTOR
                </div>
              </div>
            </div>

            {/* Data */}
            <div className="mt-5 border-t border-[#252d30] pt-3">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#9aa7aa]">
                    TOTAL INVENTORY
                  </div>

                  <div className="mt-1 font-mono text-2xl font-black text-[#dfe8eb]">
                    {user.total.toLocaleString()}
                  </div>
                </div>

                <div className="font-mono text-[8px] text-[#9aa7aa]">
                  CARDS
                </div>
              </div>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#E7C84B] transition-all duration-300 group-hover:w-full" />
          </div>
        );
      })}
    </div>
  );
};


/*
 * ------------------------------------------------------------
 * LEADERBOARD SECTION
 * ------------------------------------------------------------
 */

const renderLeaderboardSection = (
  title: string,
  subtitle: string,
  leaders: LeaderboardUser[],
  section: "ccg" | "tcg"
) => {
  return (
    <section className="relative mt-20 first:mt-0">
      {/* Section header */}
      <div className="mb-6 border-y border-[#252d30] bg-[#0d1112]">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-[0.35em] text-[#9aa7aa]">
              KAYOU INDUSTRIES // COLLECTION SYSTEM
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="text-3xl font-black tracking-tight text-[#edf4f6]">
                {title}
              </h2>

              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E7C84B]">
                {subtitle}
              </span>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#9aa7aa]">
              SYSTEM
            </div>

            <div className="mt-1 font-mono text-xs text-[#E7C84B]">
              ACTIVE
            </div>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gradient-to-r from-[#E7C84B] via-[#E7C84B]/30 to-transparent" />
      </div>

      {leaders.length === 0 ? (
        <div className="relative border border-[#293134] bg-[#0e1214] px-6 py-14 text-center">
          <CornerBrackets />

          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E7C84B]">
            NO QUALIFIED PERSONNEL
          </div>

          <div className="mt-3 text-sm text-[#697579]">
            No eligible collectors are currently available.
          </div>
        </div>
      ) : (
        <>
          {renderTopThree(leaders, section)}
          {renderRemainingRanks(leaders, section)}
        </>
      )}
    </section>
  );
};


/*
 * ------------------------------------------------------------
 * PAGE
 * ------------------------------------------------------------
 */

return (
  <>
    {showVerificationNotice && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl overflow-hidden border border-[#E7C84B]/70 bg-[#0b0f10] shadow-[0_0_60px_rgba(231,200,75,.12)]">
          <CornerBrackets color="#E7C84B" />

          <div className="border-b border-[#293134] bg-[#080c0d] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#E7C84B] shadow-[0_0_12px_#E7C84B]" />
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-[#E7C84B]">
                LEADERBOARD ACCESS NOTICE
              </div>
            </div>

            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[#edf4f6] sm:text-3xl">
              VERIFIED COLLECTORS ONLY
            </h2>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="space-y-5 font-mono text-[11px] uppercase leading-[1.8] tracking-[0.08em] text-[#d5dddf]">
              <p>
                YOU ARE ONLY ALLOWED ON THIS LEADERBOARD IF YOU ARE A
                <span className="font-bold text-[#E7C84B]">
                  {" "}VERIFIED NORTH AMERICAN COLLECTOR.
                </span>
              </p>

              <p>
                IF YOU SHOW UP ON THIS LEADERBOARD AND NOBODY KNOWS WHO YOU ARE,
                <span className="font-bold text-[#E7C84B]">
                  {" "}YOU WILL BE BANNED FROM THE LEADERBOARD.
                </span>
              </p>

              <p>
                YOU MUST BE IN THE
                <span className="font-bold text-[#E7C84B]">
                  {" "}MLPEKAYOU DISCORD SERVER
                </span>
                {" "}TO VERIFY THAT YOU ARE NORTH AMERICAN AND COLLECT NORTH
                AMERICAN CARDS.
              </p>
            </div>

            <div className="mt-7 border-t border-[#293134] pt-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#7f8b8e]">
                DISCORD AUTHENTICATION REQUIRED // VERIFICATION REQUIRED
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowVerificationNotice(false)}
              className="mt-6 w-full border border-[#E7C84B]/70 bg-[#E7C84B] px-5 py-3.5 font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#080b0c] transition-all hover:bg-[#f0d66a]"
            >
              I UNDERSTAND — CONTINUE
            </button>
          </div>
        </div>
      </div>
    )}

    <div
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#07090a]
      font-['Oxanium']
      text-white
    "
  >
    {/* Industrial background */}
    <div className="pointer-events-none absolute inset-0">
      <div
        className="
          absolute
          inset-0
          opacity-[0.12]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(231,200,75,.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(231,200,75,.08) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="
          absolute
          inset-0
          opacity-30
        "
        style={{
          background: `
            radial-gradient(
              circle at 50% 0%,
              rgba(231,200,75,.08),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #07090a 0%,
              #0b0f11 55%,
              #080a0b 100%
            )
          `,
        }}
      />

      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#E7C84B]/50 to-transparent" />
    </div>
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">

      {/* -------------------------------------------------- */}
      {/* COMMAND HEADER */}
      {/* -------------------------------------------------- */}

      <header className="relative mb-10 border border-[#293134] bg-[#0b0f10]">
        <CornerBrackets color="#E7C84B" />

        <div className="grid md:grid-cols-[1fr_auto]">
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#E7C84B] shadow-[0_0_10px_#E7C84B]" />

              <div className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#aab5b8]">
                KAYOU INDUSTRIES // COLLECTOR NETWORK
              </div>
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-[#edf4f6]">
              LEADERBOARD
            </h1>

            <div className="mt-3 max-w-2xl font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.12em] leading-relaxed text-[#aab5b8]">
              GLOBAL COLLECTION ANALYTICS // CCG + TCG
              <br />
              VERIFIED COLLECTOR NETWORK // LIVE RANKING DATA
            </div>
          </div>

          <div className="hidden md:flex min-w-[230px] flex-col justify-between border-l border-[#293134] bg-[#080b0c] p-6">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#9aa7aa]">
              SYSTEM STATUS
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#E7C84B] shadow-[0_0_10px_#E7C84B]" />

                <span className="font-mono text-xs font-bold text-[#E7C84B]">
                  ONLINE
                </span>
              </div>

              <div className="mt-3 font-mono text-[8px] leading-relaxed text-[#9aa7aa]">
                COLLECTION ENGINE
                <br />
                OPERATIONAL
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#293134] px-6 py-3 sm:px-8">
          <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#9aa7aa]">
            ACCESS: NORTH AMERICAN VERIFIED COLLECTORS
            // DISCORD AUTHENTICATION REQUIRED
            // MUST BE IN MLPEKAYOU DISCORD SERVER TO QUALIFY
          </div>
        </div>
      </header>

      {loading ? (
        <div className="border border-[#293134] bg-[#0b0f10] py-24 text-center">
          <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border border-[#263034] border-t-[#E7C84B]" />

          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#aab5b8]">
            INITIALIZING COLLECTION DATABASE
          </div>
        </div>
      ) : (
        <>
          {/* CCG */}
          {renderLeaderboardSection(
            "CCG",
            "KAYOU",
            ccgLeaders,
            "ccg"
          )}

          {/* System divider */}
          <div className="my-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#293134]" />

            <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#465357]">
              NEXT SYSTEM
            </div>

            <div className="h-px flex-1 bg-[#293134]" />
          </div>

          {/* TCG */}
          {renderLeaderboardSection(
            "TCG",
            "TRADING CARD GAME",
            tcgLeaders,
            "tcg"
          )}
        </>
      )}
    </div>

    {/* Bottom scan line */}
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E7C84B]/40 to-transparent" />
  </div>
  </>
);

};

export default Leaderboard;