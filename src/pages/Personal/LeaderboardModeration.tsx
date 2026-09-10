import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Loader2,
  MessageCircle,
  MoreVertical,
  Search,
  Shield,
  UserX,
  X,
} from "lucide-react";
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
  action: string;
  actionLabel: string;
  createdAt: string;
};
type AccountReportGroup = {
  userId: string;
  username: string;
  avatar: string;
  tradeAccessRevoked: boolean;
  reports: { id: number; reporterUserId: string; reporterUsername: string; reporterAvatar: string; createdAt: string; comment: string; wantsStaffContact: boolean; contactDiscordUsername: string; contactedAt: string | null; contactedBy: string | null; contactedByUsername: string; contactedByAvatar: string }[];
};
type CardPriceReport = {
  id: number;
  setId: string;
  cardKey: string;
  reportedPrice: number;
  createdAt: string;
  reportedUserId: string;
  reportedUsername: string;
  reportedAvatar: string;
  reporterUsername: string;
  reporterAvatar: string;
};
const LeaderboardModeration = () => {
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [bans, setBans] = useState<LeaderboardBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBan, setSelectedBan] = useState<LeaderboardBan | null>(null);
  const [unbanning, setUnbanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"active" | "account_reports" | "history">("active");
  const [historyItems, setHistoryItems] = useState<ModerationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [accountReports, setAccountReports] = useState<AccountReportGroup[]>([]);
  const [cardReports, setCardReports] = useState<CardPriceReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const [selectedAccountReport, setSelectedAccountReport] = useState<AccountReportGroup | null>(null);
  const [selectedReportComment, setSelectedReportComment] = useState<AccountReportGroup["reports"][number] | null>(null);
  const [markingContacted, setMarkingContacted] = useState(false);
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
    if (!authorized) return;
    const loadAccountReports = async () => {
      setReportsLoading(true);
      const [accountResult, cardResult] = await Promise.all([
        supabase.from("trading_post_user_reports").select("id, reporter_user_id, reported_user_id, created_at, reporter_comment, wants_staff_contact, contact_discord_username, contacted_at, contacted_by").is("resolved_at", null).order("created_at", { ascending: true }),
        supabase.from("trading_post_card_reports").select("id, reporter_user_id, reported_user_id, set_id, card_key, reported_price, created_at").is("resolved_at", null).order("created_at", { ascending: false }),
      ]);
      if (accountResult.error || cardResult.error) {
        console.error("Unable to load reports:", accountResult.error || cardResult.error);
        setErrorMessage("Unable to load reports.");
        setReportsLoading(false);
        return;
      }
      const accountRows = accountResult.data || [];
      const cardRows = cardResult.data || [];
      const profileIds = Array.from(new Set([...accountRows.flatMap((row) => [row.reporter_user_id, row.reported_user_id, row.contacted_by]), ...cardRows.flatMap((row) => [row.reporter_user_id, row.reported_user_id])].filter(Boolean)));
      const { data: profileRows } = profileIds.length
        ? await supabase.from("profiles").select("id, username, avatar_url").in("id", profileIds)
        : { data: [] };
      const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]));
      const targetIds = Array.from(new Set(accountRows.map((row) => row.reported_user_id)));
      const { data: tradingRows } = targetIds.length ? await supabase.from("trading_profiles").select("user_id, trade_access_revoked").in("user_id", targetIds) : { data: [] };
      const revokedByUser = new Map((tradingRows || []).map((row) => [row.user_id, Boolean(row.trade_access_revoked)]));
      const grouped = new Map<string, AccountReportGroup>();
      accountRows.forEach((row) => {
        const target = profileMap.get(row.reported_user_id);
        const reporter = profileMap.get(row.reporter_user_id);
        const contactModerator = row.contacted_by ? profileMap.get(row.contacted_by) : null;
        if (!grouped.has(row.reported_user_id)) {
          grouped.set(row.reported_user_id, {
            userId: row.reported_user_id,
            username: target?.username || "Deleted User",
            avatar: getProfileAssets(target).avatar,
            tradeAccessRevoked: revokedByUser.get(row.reported_user_id) || false,
            reports: [],
          });
        }
        grouped.get(row.reported_user_id)?.reports.push({
          id: row.id,
          reporterUserId: row.reporter_user_id,
          reporterUsername: reporter?.username || "Deleted User",
          reporterAvatar: getProfileAssets(reporter).avatar,
          createdAt: row.created_at,
          comment: row.reporter_comment || "",
          wantsStaffContact: Boolean(row.wants_staff_contact),
          contactDiscordUsername: row.contact_discord_username || "",
          contactedAt: row.contacted_at,
          contactedBy: row.contacted_by,
          contactedByUsername: contactModerator?.username || "",
          contactedByAvatar: contactModerator ? getProfileAssets(contactModerator).avatar : "",
        });
      });
      setAccountReports(Array.from(grouped.values()).sort((a, b) => Math.max(...b.reports.map((report) => new Date(report.createdAt).getTime())) - Math.max(...a.reports.map((report) => new Date(report.createdAt).getTime()))));
      setCardReports(cardRows.map((row) => {
        const target = profileMap.get(row.reported_user_id);
        const reporter = profileMap.get(row.reporter_user_id);
        return {
          id: row.id,
          setId: row.set_id,
          cardKey: row.card_key,
          reportedPrice: Number(row.reported_price),
          createdAt: row.created_at,
          reportedUserId: row.reported_user_id,
          reportedUsername: target?.username || "Deleted User",
          reportedAvatar: getProfileAssets(target).avatar,
          reporterUsername: reporter?.username || "Deleted User",
          reporterAvatar: getProfileAssets(reporter).avatar,
        };
      }));
      setReportsLoading(false);
    };
    loadAccountReports();
    const reportChannel = supabase.channel("moderation-account-reports").on("postgres_changes", { event: "*", schema: "public", table: "trading_post_user_reports" }, () => loadAccountReports()).on("postgres_changes", { event: "*", schema: "public", table: "trading_profiles" }, () => loadAccountReports()).subscribe();
    return () => { supabase.removeChannel(reportChannel); };
  }, [authorized]);
  const revokeTradingAccess = async (report: AccountReportGroup) => {
    if (revokingUserId) return;
    setRevokingUserId(report.userId);
    setErrorMessage("");
    const { error } = await supabase.rpc("revoke_trading_access", {
      target_user_id: report.userId,
    });
    if (error) {
      console.error("Unable to revoke trading access:", error);
      setErrorMessage(error.message || "Unable to revoke trading access.");
      setRevokingUserId(null);
      return;
    }
    setAccountReports((current) => current.map((item) => item.userId === report.userId ? { ...item, tradeAccessRevoked: true } : item));
    setSuccessMessage(`${report.username}'s trade and sale access was revoked.`);
    setRevokingUserId(null);
    setHistoryLoaded(false);
  };
  const restoreTradingAccess = async (report: AccountReportGroup) => {
    if (revokingUserId) return;
    setRevokingUserId(report.userId);
    setErrorMessage("");
    const { error } = await supabase.rpc("restore_trading_access", { target_user_id: report.userId, new_discord_username: "" });
    if (error) {
      setErrorMessage(error.message || "Unable to reinstate trading access.");
      setRevokingUserId(null);
      return;
    }
    setAccountReports((current) => current.filter((item) => item.userId !== report.userId));
    setSelectedAccountReport(null);
    setSuccessMessage(`${report.username}'s trade and sale access was reinstated and their reports were cleared.`);
    setRevokingUserId(null);
    setHistoryLoaded(false);
  };
  const markReporterContacted = async () => {
    if (!selectedReportComment?.wantsStaffContact || selectedReportComment.contactedAt || markingContacted) return;
    setMarkingContacted(true);
    setErrorMessage("");
    const { error } = await supabase.rpc("mark_trading_report_contacted", { report_id: selectedReportComment.id });
    if (error) {
      setErrorMessage(error.message || "Unable to mark this reporter as contacted.");
      setMarkingContacted(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const { data: moderatorProfile } = session?.user ? await supabase.from("profiles").select("username, avatar_url").eq("id", session.user.id).maybeSingle() : { data: null };
    const updated = { ...selectedReportComment, contactedAt: new Date().toISOString(), contactedBy: session?.user.id || null, contactedByUsername: moderatorProfile?.username || "Moderator", contactedByAvatar: getProfileAssets(moderatorProfile).avatar };
    setSelectedReportComment(updated);
    setAccountReports((groups) => groups.map((group) => ({ ...group, reports: group.reports.map((report) => report.id === updated.id ? updated : report) })));
    setHistoryLoaded(false);
    setMarkingContacted(false);
  };
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
        (profileRows || []).map((profile) => [profile.id, profile.username]),
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
      currentBans.filter((ban) => ban.userId !== selectedBan.userId),
    );
    setSuccessMessage(
      `${selectedBan.username} was unbanned from the leaderboard.`,
    );
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
      .select(
        "id, moderator_user_id, moderator_username, target_user_id, target_username, action, created_at",
      )
      .in("action", ["leaderboard_user_unbanned", "leaderboard_ban_lifted", "trading_report_contacted", "trading_access_revoked", "trading_access_restored", "trading_access_restored_reports_cleared"])
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
        ]),
      ),
    );
    let profileById = new Map<string, any>();
    if (profileIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", profileIds);
      if (profileError) {
        console.error(
          "Unable to load moderation history profiles:",
          profileError,
        );
        setErrorMessage(
          "Unable to load profile pictures for moderation history.",
        );
        setHistoryLoading(false);
        return;
      }
      profileById = new Map(
        (profileRows || []).map((profile) => [profile.id, profile]),
      );
    }
    const fallbackAvatar = getProfileAssets(null).avatar;
    const nextHistoryItems = (logRows || []).map((row) => {
      const moderatorProfile = profileById.get(row.moderator_user_id);
      const targetProfile = profileById.get(row.target_user_id);
      const actionLabels: Record<string, string> = {
        leaderboard_user_unbanned: "unbanned",
        leaderboard_ban_lifted: "unbanned",
        trading_report_contacted: "contacted report author",
        trading_access_revoked: "revoked trade and sale rights for",
        trading_access_restored: "reinstated trade and sale rights for",
        trading_access_restored_reports_cleared: "reinstated rights and cleared reports for",
      };
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
        action: row.action,
        actionLabel: actionLabels[row.action] || row.action,
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
    ban.username.toLowerCase().includes(normalizedSearch),
  );
  if (authorized === false) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center px-6 ${
          isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
        }`}
      >
        <div
          className={`w-full max-w-sm rounded-3xl border p-6 text-center ${
            isLightMode
              ? "border-red-600/20 bg-white shadow-lg"
              : "border-red-500/20 bg-red-500/[0.05]"
          }`}
        >
          <Shield
            className={`mx-auto h-10 w-10 ${isLightMode ? "text-red-600" : "text-red-400"}`}
          />
          <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
          <p
            className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
          >
            This page is only available to the leaderboard moderation team.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mt-5 rounded-xl px-5 py-2.5 text-sm font-bold ${
              isLightMode
                ? "bg-[#c89d13] text-white"
                : "bg-[#FFD54A] text-black"
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`min-h-screen pb-12 ${
        isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"
      }`}
    >
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
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isLightMode
                ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
                : "border-[#FFD54A]/30 bg-[#FFD54A]/10 text-[#FFD54A]"
            }`}
          >
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Leaderboard Moderation</h1>
            <p
              className={`text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
            >
              Manage active leaderboard bans
            </p>
          </div>
        </div>
        {successMessage && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              isLightMode
                ? "border-emerald-600/25 bg-emerald-50 text-emerald-700"
                : "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"
            }`}
          >
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              isLightMode
                ? "border-red-600/25 bg-red-50 text-red-700"
                : "border-red-400/25 bg-red-400/[0.08] text-red-300"
            }`}
          >
            {errorMessage}
          </div>
        )}
        <div
          className={`mt-6 overflow-hidden rounded-3xl border ${
            isLightMode
              ? "border-black/[0.08] bg-white shadow-[0_12px_36px_rgba(0,0,0,.08)]"
              : "border-white/[0.08] bg-[#151718] shadow-[0_12px_36px_rgba(0,0,0,.22)]"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b px-5 py-4 ${
              isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"
            }`}
          >
            <div>
              <h2 className="font-semibold">
                {currentView === "active"
                  ? "Active Bans"
                  : currentView === "account_reports"
                    ? "Account Reports"
                    : "Moderation History"}
              </h2>
              <p
                className={`mt-0.5 text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-500"}`}
              >
                {currentView === "active"
                  ? normalizedSearch
                    ? `${filteredBans.length} of ${bans.length} users`
                    : `${bans.length} ${bans.length === 1 ? "user" : "users"}`
                  : currentView === "account_reports"
                    ? `${accountReports.length + cardReports.length} ${accountReports.length + cardReports.length === 1 ? "report" : "reports"}`
                    : `${historyItems.length} ${historyItems.length === 1 ? "action" : "actions"}`}
              </p>
            </div>
            <div className="flex gap-1.5">
              {([
                ["active", "Bans"],
                ["account_reports", "Reports"],
                ["history", "History"],
              ] as const).map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => view === "history" ? openHistory() : setCurrentView(view)}
                  className={`rounded-xl px-2.5 py-2 text-xs font-bold ${
                    currentView === view
                      ? "bg-[#FFD54A] text-black"
                      : isLightMode ? "bg-zinc-100 text-zinc-600" : "bg-white/[0.06] text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {currentView === "active" ? (
            <>
              <div
                className={`border-b px-5 py-4 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.08]"}`}
              >
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
                <div
                  className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leaderboard bans...
                </div>
              ) : bans.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Shield
                    className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}
                  />
                  <p
                    className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}
                  >
                    No active leaderboard bans
                  </p>
                </div>
              ) : filteredBans.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Search
                    className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}
                  />
                  <p
                    className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}
                  >
                    No matching usernames
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Try a different search.
                  </p>
                </div>
              ) : (
                <div>
                  {filteredBans.map((ban, index) => (
                    <div
                      key={ban.userId}
                      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        index !== filteredBans.length - 1
                          ? isLightMode
                            ? "border-b border-black/[0.07]"
                            : "border-b border-white/[0.07]"
                          : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`truncate font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}
                        >
                          {ban.username}
                        </p>
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
          ) : currentView === "account_reports" ? (
            reportsLoading ? (
              <div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading account reports...
              </div>
            ) : accountReports.length === 0 && cardReports.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Shield className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`} />
                <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                  No unresolved reports
                </p>
              </div>
            ) : (
              <div>
                {cardReports.map((report) => (
                  <div key={`card-${report.id}`} className={`px-5 py-5 ${isLightMode ? "border-b border-black/[0.07]" : "border-b border-white/[0.07]"}`}>
                    <div className="flex items-center gap-3">
                      <img src={report.reportedAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold"><span className="text-red-500">Overpriced card report</span> · {report.reportedUsername}</p>
                        <p className={`mt-0.5 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>{report.cardKey} from set {report.setId} was listed for ${report.reportedPrice.toFixed(2)}.</p>
                      </div>
                    </div>
                    <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 ${isLightMode ? "bg-zinc-50" : "bg-white/[0.04]"}`}>
                      <img src={report.reporterAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <p className="min-w-0 text-sm"><span className="font-semibold">{report.reporterUsername}</span>{" "}<span className={isLightMode ? "text-zinc-600" : "text-zinc-400"}>reported {report.reportedUsername} on {new Date(report.createdAt).toLocaleString()}</span></p>
                    </div>
                  </div>
                ))}
                {accountReports.map((report, index) => (
                  <div
                    key={report.userId}
                    className={`px-5 py-5 ${report.tradeAccessRevoked ? isLightMode ? "border-y border-violet-300 bg-violet-50" : "border-y border-violet-400/30 bg-violet-500/10" : report.reports.length >= 3 ? isLightMode ? "border-y-2 border-red-500 bg-red-50" : "border-y-2 border-red-500/70 bg-red-500/10" : index !== accountReports.length - 1 ? isLightMode ? "border-b border-black/[0.07]" : "border-b border-white/[0.07]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={report.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                      <div className="min-w-0 flex-1"><p className="font-semibold">{report.username} has been reported {report.reports.length} {report.reports.length === 1 ? "time" : "times"}.</p><p className={`mt-0.5 text-xs font-semibold ${report.tradeAccessRevoked ? "text-violet-500" : report.reports.length >= 3 ? "text-red-500" : "text-zinc-500"}`}>{report.tradeAccessRevoked ? "PUBLIC RIGHTS REVOKED" : report.reports.length >= 3 ? "THREE-REPORT RECOMMENDATION REACHED" : "Three reports are recommended before revocation."}</p></div>
                      {!report.tradeAccessRevoked && report.reports.length >= 3 && <div title="Three or more reports" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500 text-3xl font-black text-white shadow-[0_0_24px_rgba(239,68,68,.45)]">!</div>}
                      {report.tradeAccessRevoked && <Shield className="h-8 w-8 shrink-0 text-violet-500" />}
                    </div>
                    <div className="mt-4 space-y-2">
                      {report.reports.map((item) => (
                        <div key={item.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                          isLightMode ? "bg-zinc-50" : "bg-white/[0.04]"
                        }`}>
                          <img src={item.reporterAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                          <p className="min-w-0 flex-1 text-sm">
                            <span className="font-semibold">{item.reporterUsername}</span>{" "}
                            <span className={isLightMode ? "text-zinc-600" : "text-zinc-400"}>
                              reported on {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </p>
                          <button type="button" onClick={() => setSelectedReportComment(item)} aria-label="View report comment" title="View report comment" className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isLightMode ? "bg-zinc-200 text-zinc-700" : "bg-white/[0.08] text-zinc-200"}`}>
                            <MessageCircle size={17} />
                            {(item.comment || item.wantsStaffContact) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setSelectedAccountReport(report)} className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold ${report.tradeAccessRevoked ? "bg-violet-500 text-white" : report.reports.length >= 3 ? "bg-red-500 text-white" : "bg-red-500/10 text-red-500"}`}>MODERATION ACTIONS</button>
                  </div>
                ))}
              </div>
            )
          ) : historyLoading ? (
            <div
              className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading moderation history...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <History
                className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}
              />
              <p
                className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}
              >
                No moderation history yet
              </p>
            </div>
          ) : (
            <div>
              {historyItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`px-5 py-4 ${
                    index !== historyItems.length - 1
                      ? isLightMode
                        ? "border-b border-black/[0.07]"
                        : "border-b border-white/[0.07]"
                      : ""
                  }`}
                >
                  <div className={`rounded-2xl p-3 sm:hidden ${isLightMode ? "bg-zinc-50" : "bg-white/[0.04]"}`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img src={item.moderatorAvatar} alt="" className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`break-words text-sm font-bold ${isLightMode ? "text-zinc-900" : "text-white"}`}>{item.moderatorUsername}</p>
                          <Shield size={14} className={`shrink-0 ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`} />
                        </div>
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Moderator</p>
                      </div>
                    </div>
                    <div className={`my-3 border-l-2 pl-3 text-sm font-medium leading-relaxed ${isLightMode ? "border-[#c9a62d]/40 text-zinc-600" : "border-[#FFD54A]/30 text-zinc-300"}`}>{item.actionLabel}</div>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img src={item.targetAvatar} alt="" className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`} />
                      <p className={`min-w-0 break-words text-sm font-bold ${isLightMode ? "text-zinc-900" : "text-white"}`}>{item.targetUsername}</p>
                    </div>
                    <p className={`mt-3 border-t pt-2 text-xs ${isLightMode ? "border-black/[0.07] text-zinc-500" : "border-white/[0.07] text-zinc-500"}`}>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="hidden flex-wrap items-center gap-2.5 sm:flex">
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={item.moderatorAvatar}
                        alt=""
                        className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`}
                      />
                      <span
                        className={`flex min-w-0 items-center gap-1.5 font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}
                      >
                        <span className="truncate">
                          {item.moderatorUsername}
                        </span>
                        <Shield
                          size={15}
                          className={`shrink-0 ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`}
                        />
                      </span>
                    </div>
                    <span
                      className={`text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}
                    >
                      {item.actionLabel}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={item.targetAvatar}
                        alt=""
                        className={`h-10 w-10 shrink-0 rounded-full border object-cover ${isLightMode ? "border-black/10" : "border-white/10"}`}
                      />
                      <span
                        className={`truncate font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}
                      >
                        {item.targetUsername}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 hidden pl-12 text-xs text-zinc-500 sm:block">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedReportComment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => !markingContacted && setSelectedReportComment(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-comment-title" onClick={(event) => event.stopPropagation()} className={`max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border p-5 shadow-2xl ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}>
            <div className="flex items-center gap-3">
              <img src={selectedReportComment.reporterAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0"><p className="truncate font-bold">{selectedReportComment.reporterUsername}</p><p className="text-xs text-zinc-500">Reported on {new Date(selectedReportComment.createdAt).toLocaleString()}</p></div>
            </div>
            <h2 id="report-comment-title" className="mt-5 text-lg font-bold">Reporter comment</h2>
            <div className={`mt-2 whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-relaxed ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.05] text-zinc-300"}`}>{selectedReportComment.comment || "No comment was included with this report."}</div>
            {selectedReportComment.wantsStaffContact && (
              <div className={`mt-4 rounded-xl border px-4 py-3 ${isLightMode ? "border-[#5865F2]/20 bg-[#5865F2]/[0.07]" : "border-[#5865F2]/30 bg-[#5865F2]/10"}`}>
                <p className="text-sm font-semibold">This reporter asked to be contacted on Discord.</p>
                <p className="mt-1 text-base font-bold text-[#5865F2]">{selectedReportComment.contactDiscordUsername}</p>
                {selectedReportComment.contactedAt ? (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span>Contacted by</span>
                    {selectedReportComment.contactedByAvatar && <img src={selectedReportComment.contactedByAvatar} alt="" className="h-7 w-7 rounded-full object-cover" />}
                    <span className="font-semibold">{selectedReportComment.contactedByUsername || "Moderator"}</span>
                    <span className="text-zinc-500">on {new Date(selectedReportComment.contactedAt).toLocaleString()}</span>
                  </div>
                ) : (
                  <button type="button" onClick={markReporterContacted} disabled={markingContacted} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{markingContacted && <Loader2 className="h-4 w-4 animate-spin" />}Has this user been contacted?</button>
                )}
              </div>
            )}
            <button type="button" onClick={() => setSelectedReportComment(null)} disabled={markingContacted} className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-300"}`}>Close</button>
          </div>
        </div>
      )}
      {selectedAccountReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${
            isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"
          }`}>
            <div className="flex items-center gap-3">
              <img src={selectedAccountReport.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">Moderator Actions</p>
                <h2 className="mt-1 text-xl font-bold">{selectedAccountReport.username}</h2>
              </div>
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>{selectedAccountReport.tradeAccessRevoked ? "Reinstating this user restores their ability to trade and sell, unlocks their Discord username, removes every account report against them, and clears them from this page." : "Three reports are recommended, but moderators may act earlier when the report details justify it. Revoking removes their Discord username, removes them from the all public views, and prevents them from editing their Discord username until a moderator restores access."}</p>
            <button
              type="button"
              onClick={async () => { if (selectedAccountReport.tradeAccessRevoked) { await restoreTradingAccess(selectedAccountReport); } else { await revokeTradingAccess(selectedAccountReport); setSelectedAccountReport(null); } }}
              disabled={Boolean(revokingUserId)}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 ${selectedAccountReport.tradeAccessRevoked ? "bg-violet-500" : "bg-red-500"}`}
            >
              {revokingUserId ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX size={17} />}
              {selectedAccountReport.tradeAccessRevoked ? "REINSTATE PUBLIC ACCESS" : "REVOKE PLUBLIC ACCESS"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedAccountReport(null)}
              disabled={Boolean(revokingUserId)}
              className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
                isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-300"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
              isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-[#151718]"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-[0.16em] ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`}
                >
                  Moderator Actions
                </p>
                <h2
                  id="moderator-actions-title"
                  className={`mt-1 text-xl font-bold ${isLightMode ? "text-zinc-900" : "text-white"}`}
                >
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
