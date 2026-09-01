import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, Loader2, MoreVertical, Search, Shield, UserX, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
type LeaderboardBan = {
  userId: string;
  username: string;
  createdAt: string;
};
type ModerationHistoryItem = {
  id: number;
  moderatorUsername: string;
  moderatorAvatar: string;
  targetUsername: string;
  targetAvatar: string;
  createdAt: string;
};
const LeaderboardModeration = () => {
const navigate = useNavigate();
const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light"
  );
const [authorized, setAuthorized] = useState<boolean | null>(null);
const [bans, setBans] = useState<LeaderboardBan[]>([]);
const [loading, setLoading] = useState(true);
const [selectedBan, setSelectedBan] = useState<LeaderboardBan | null>(null);
const [unbanning, setUnbanning] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [currentView, setCurrentView] = useState<"active" | "history">("active");
const [historyItems, setHistoryItems] = useState<ModerationHistoryItem[]>([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyLoaded, setHistoryLoaded] = useState(false);
  useEffect(() => {
const syncTheme = () => {
      setIsLightMode(document.documentElement.dataset.theme === "light");
    };
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
let active = true;
const loadModerationPage = async () => {
      setLoading(true);
      setErrorMessage("");
const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (active) {
          setAuthorized(false);
          setLoading(false);
        }
        return;
      }
const { data: moderator, error: moderatorError } = await supabase
        .from("leaderboard_moderators")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (moderatorError || !moderator) {
        if (active) {
          setAuthorized(false);
          setLoading(false);
        }
        return;
      }
      if (active) setAuthorized(true);
const { data: exclusionRows, error: exclusionsError } = await supabase
        .from("leaderboard_exclusions")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });
      if (exclusionsError) {
        if (active) {
          setErrorMessage("Unable to load leaderboard bans.");
          setLoading(false);
        }
        return;
      }
const userIds = (exclusionRows || []).map((row) => row.user_id);
      if (userIds.length === 0) {
        if (active) {
          setBans([]);
          setLoading(false);
        }
        return;
      }
const { data: profileRows, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
      if (profilesError) {
        if (active) {
          setErrorMessage("Unable to load the banned users' names.");
          setLoading(false);
        }
        return;
      }
const usernameById = new Map(
        (profileRows || []).map((profile) => [profile.id, profile.username])
      );
const combinedBans = (exclusionRows || []).map((row) => ({
        userId: row.user_id,
        username: usernameById.get(row.user_id) || "Deleted User",
        createdAt: row.created_at,
      }));
      if (active) {
        setBans(combinedBans);
        setLoading(false);
      }
    };
    loadModerationPage();
    return () => {
      active = false;
    };
  }, []);
const unbanUser = async () => {
    if (!selectedBan || unbanning) return;
    setUnbanning(true);
    setErrorMessage("");
    setSuccessMessage("");
const { error } = await supabase.rpc("lift_leaderboard_ban", {
      target_user_id: selectedBan.userId,
    });
    if (error) {
      console.error("Unable to unban leaderboard user:", error);
      setErrorMessage(error.message || "Unable to unban this user.");
      setUnbanning(false);
      return;
    }
    setBans((currentBans) =>
      currentBans.filter((ban) => ban.userId !== selectedBan.userId)
    );
    setSuccessMessage(`${selectedBan.username} was unbanned from the leaderboard.`);
    setSelectedBan(null);
    setUnbanning(false);
    setHistoryLoaded(false);
  };
const loadHistory = async () => {
    if (historyLoaded || historyLoading) return;
    setHistoryLoading(true);
    setErrorMessage("");
const { data: logRows, error: logError } = await supabase
      .from("moderation_logs")
      .select("id, moderator_user_id, moderator_username, target_user_id, target_username, action, created_at")
      .in("action", ["leaderboard_user_unbanned", "leaderboard_ban_lifted"])
      .order("created_at", { ascending: false });
    if (logError) {
      console.error("Unable to load moderation history:", logError);
      setErrorMessage("Unable to load moderation history.");
      setHistoryLoading(false);
      return;
    }
const profileIds = Array.from(
      new Set(
        (logRows || []).flatMap((row) => [
          row.moderator_user_id,
          row.target_user_id,
        ])
      )
    );
let profileById = new Map<string, any>();
    if (profileIds.length > 0) {
const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", profileIds);
      if (profileError) {
        console.error("Unable to load moderation history profiles:", profileError);
        setErrorMessage("Unable to load profile pictures for moderation history.");
        setHistoryLoading(false);
        return;
      }
      profileById = new Map((profileRows || []).map((profile) => [profile.id, profile]));
    }
const fallbackAvatar = getProfileAssets(null).avatar;
const nextHistoryItems = (logRows || []).map((row) => {
const moderatorProfile = profileById.get(row.moderator_user_id);
const targetProfile = profileById.get(row.target_user_id);
      return {
        id: row.id,
        moderatorUsername: row.moderator_username,
        moderatorAvatar: moderatorProfile
          ? getProfileAssets(moderatorProfile).avatar
          : fallbackAvatar,
        targetUsername: row.target_username,
        targetAvatar: targetProfile
          ? getProfileAssets(targetProfile).avatar
          : fallbackAvatar,
        createdAt: row.created_at,
      };
    });
    setHistoryItems(nextHistoryItems);
    setHistoryLoaded(true);
    setHistoryLoading(false);
  };
const openHistory = async () => {
    setCurrentView("history");
    setSearchQuery("");
    await loadHistory();
  };
const normalizedSearch = searchQuery.trim().toLowerCase();
const filteredBans = bans.filter((ban) =>
    ban.username.toLowerCase().includes(normalizedSearch)
  );
  if (authorized === false) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-6 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}>
        <div className={`w-full max-w-sm rounded-3xl border p-6 text-center ${
          isLightMode
            ? "border-red-600/20 bg-white shadow-lg"
            : "border-red-500/20 bg-red-500/[0.05]"
        }`}>
          <Shield className={`mx-auto h-10 w-10 ${isLightMode ? "text-red-600" : "text-red-400"}`} />
          <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
          <p className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
            This page is only available to the leaderboard moderation team.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mt-5 rounded-xl px-5 py-2.5 text-sm font-bold ${
              isLightMode ? "bg-[#c89d13] text-white" : "bg-[#FFD54A] text-black"
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`min-h-screen pb-12 ${
      isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
    }`}>
      <div className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
              isLightMode
                ? "border-black/10 bg-white text-zinc-700 shadow-sm hover:bg-zinc-100"
                : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09]"
            }`}
          >
            <ArrowLeft size={19} />
          </button>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            isLightMode
              ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
              : "border-[#FFD54A]/30 bg-[#FFD54A]/10 text-[#FFD54A]"
          }`}>
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Leaderboard Moderation</h1>
            <p className={`text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>Manage active leaderboard bans</p>
          </div>
        </div>
        {successMessage && (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            isLightMode
              ? "border-emerald-600/25 bg-emerald-50 text-emerald-700"
              : "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"
          }`}>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            isLightMode
              ? "border-red-600/25 bg-red-50 text-red-700"
              : "border-red-400/25 bg-red-400/[0.08] text-red-300"
          }`}>
            {errorMessage}
          </div>
        )}
        <div className={`mt-6 overflow-hidden rounded-3xl border ${
          isLightMode
            ? "border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,.08)]"
            : "border-white/[0.08] bg-[#151718] shadow-[0_12px_36px_rgba(0,0,0,.22)]"
        }`}>
          <div className={`flex items-center justify-between border-b px-5 py-4 ${
            isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"
          }`}>
            <div>
              <h2 className="font-semibold">
                {currentView === "active" ? "Active Bans" : "Moderation History"}
              </h2>
              <p className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-500"}`}>
                {currentView === "active"
                  ? normalizedSearch
                    ? `${filteredBans.length} of ${bans.length} users`
                    : `${bans.length} ${bans.length === 1 ? "user" : "users"}`
                  : `${historyItems.length} ${historyItems.length === 1 ? "action" : "actions"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (currentView === "active") {
                  openHistory();
                } else {
                  setCurrentView("active");
                }
              }}
              aria-label={currentView === "active" ? "View moderation history" : "Return to active bans"}
              title={currentView === "active" ? "Moderation History" : "Active Bans"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                isLightMode
                  ? "border-[#8a6a00]/25 bg-[#c89d13]/10 text-[#725700] hover:bg-[#c89d13]/20"
                  : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFD54A] hover:bg-[#FFD54A]/20"
              }`}
            >
              {currentView === "active" ? <History size={18} /> : <ArrowLeft size={18} />}
            </button>
          </div>
          {currentView === "active" ? (
            <>
              <div className={`border-b px-5 py-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"}`}>
                <label className="relative block">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by username..."
                    autoComplete="off"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-base outline-none transition-colors ${
                      isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-[#8a6a00]/50 focus:bg-white"
                        : "border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus:border-[#FFD54A]/50 focus:bg-white/[0.06]"
                    }`}
                  />
                </label>
              </div>
              {loading ? (
                <div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leaderboard bans...
                </div>
              ) : bans.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Shield className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`} />
                  <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>No active leaderboard bans</p>
                </div>
              ) : filteredBans.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Search className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`} />
                  <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>No matching usernames</p>
                  <p className="mt-1 text-xs text-zinc-500">Try a different search.</p>
                </div>
              ) : (
                <div>
                  {filteredBans.map((ban, index) => (
                    <div
                      key={ban.userId}
                      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        index !== filteredBans.length - 1
                          ? isLightMode ? "border-b border-black/[0.07]" : "border-b border-white/[0.07]"
                          : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`truncate font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}>{ban.username}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Banned {new Date(ban.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage("");
                          setSelectedBan(ban);
                        }}
                        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${
                          isLightMode
                            ? "border-[#8a6a00]/25 bg-[#c89d13]/10 text-[#725700] hover:border-[#8a6a00]/50 hover:bg-[#c89d13]/20"
                            : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFD54A] hover:border-[#FFD54A]/50 hover:bg-[#FFD54A]/15"
                        }`}
                      >
                        <MoreVertical size={15} />
                        MODERATOR ACTIONS
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : historyLoading ? (
            <div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading moderation history...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <History className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`} />
              <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>No moderation history yet</p>
            </div>
          ) : (
            <div>
              {historyItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-5 py-4 ${
                    index !== historyItems.length - 1
                      ? isLightMode ? "border-b border-black/[0.07]" : "border-b border-white/[0.07]"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={item.moderatorAvatar}
                        alt=""
                        className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`}
                      />
                      <span className={`flex min-w-0 items-center gap-1.5 font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                        <span className="truncate">{item.moderatorUsername}</span>
                        <Shield size={15} className={`shrink-0 ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`} />
                      </span>
                    </div>
                    <span className={`text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>unbanned</span>
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={item.targetAvatar}
                        alt=""
                        className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`}
                      />
                      <span className={`truncate font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                        {item.targetUsername}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 pl-12 text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedBan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => !unbanning && setSelectedBan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="moderator-actions-title"
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${
              isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`}>
                  Moderator Actions
                </p>
                <h2 id="moderator-actions-title" className={`mt-1 text-xl font-bold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                  {selectedBan.username}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBan(null)}
                disabled={unbanning}
                aria-label="Close moderator actions"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  isLightMode
                    ? "border-black/10 text-zinc-600 hover:bg-zinc-100"
                    : "border-white/10 text-zinc-400 hover:bg-white/[0.06]"
                }`}
              >
                <X size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={unbanUser}
              disabled={unbanning}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isLightMode
                  ? "border-red-600/30 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              }`}
            >
              {unbanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX size={17} />
              )}
              UNBAN USER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeaderboardModeration;