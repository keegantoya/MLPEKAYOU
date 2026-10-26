import { StaffConversations, useStaffSummary } from "@/components/StaffCommunications";
import { EnglishLeaderboardAppealQueue } from "@/components/EnglishLeaderboardAppeals";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { englishViewCard, englishViewName, englishViewCode, englishViewImage, englishViewStyle } from "@/lib/english-card-views";
import { buildListingWarningMessage } from "@/components/ListingModerationWarnings";
import CardImage from "@/components/CardImage";
import rylandGraceAvatar from "@/assets/avatars/rylandgrace.webp";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, History, Loader2, MoreVertical, Search, Shield, UserX, X, RefreshCw, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
type AccessDirectoryRow = { user_id: string; username: string; discord_username: string | null; trade_access_revoked: boolean; frame_id: string | null; revoked_at: string | null; total_count: number | string };
const frameNames: Record<string, string> = { frame001: "Star One", frame002: "500 cards", frame003: "PakraCards Supporter", frame004: "Rainbow One", frame005: "Nightmare Night", frame006: "Moon Three", frame007: "Moon One", frame008: "Moon Two", frame009: "Rainbow Two", frame010: "Pinkie Party" };
const accessFrameLabel = (id: string | null) => id ? `${id}${frameNames[id] ? ` / ${frameNames[id]}` : ""}` : "Unknown frame";
const collectionFrames = new Set(["frame001", "frame002", "frame004", "frame005", "frame006", "frame007", "frame008", "frame009"]);
function ModerationFramePreview({ frameId, isLightMode }: { frameId: string | null; isLightMode: boolean }) {
    const frame = getProfileAssets({ avatar_frame: frameId }).frame;
    return <figure className="flex shrink-0 flex-col items-center gap-2"><div className="flex h-28 w-28 items-center justify-center">{frame ? <CardImage src={isLightMode && frame.lightImage ? frame.lightImage : frame.image} alt={frame.name} className="h-full w-full object-contain"/> : <span className="text-center text-xs text-muted-foreground">Frame preview unavailable</span>}</div><figcaption className="max-w-36 text-center text-xs font-semibold">{frame?.name ?? (frameId ? frameNames[frameId] ?? "Frame" : "Frame")}</figcaption></figure>;
}
function FrameRestrictionReason({ frameId }: { frameId: string | null }) {
    return <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{frameId && collectionFrames.has(frameId) ? <><span className="font-semibold">Usual reason: </span>The collection met the frame requirement, then later dropped below it.</> : <><span className="font-semibold">Reason: </span>No individual revocation reason was recorded for this frame.</>}</p>;
}
type LeaderboardBan = {
    userId: string;
    username: string;
    createdAt: string;
    reason?: string;
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
    details?: string;
};
type AccountReportGroup = {
    userId: string;
    username: string;
    avatar: string;
    tradeAccessRevoked: boolean;
    reports: {
        id: number;
        reporterUserId: string;
        reporterUsername: string;
        reporterAvatar: string;
        createdAt: string;
        comment: string;
        wantsStaffContact: boolean;
        contactDiscordUsername: string;
        contactedAt: string | null;
        contactedBy: string | null;
        contactedByUsername: string;
        contactedByAvatar: string;
    }[];
    expiredOffers: {
        id: number;
        senderUsername: string;
        senderAvatar: string;
        targetSetId: string;
        targetCardKey: string;
        expiredAt: string;
    }[];
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
const getHistoryActionTitle = (item: ModerationHistoryItem) => {
    const labels: Record<string, string> = {
        leaderboard_eligibility_revoked: "Leaderboard eligibility revoked",
        leaderboard_self_excluded: "Self-excluded from leaderboards",
        leaderboard_user_banned: "Leaderboard eligibility revoked",
        leaderboard_user_unbanned: "Leaderboard ban lifted",
        leaderboard_ban_lifted: "Leaderboard ban lifted",
        trading_report_contacted: "Report author contacted",
        trading_access_revoked: "Trading access revoked",
        frame_access_reinstated: "Frame access reinstated",
        english_appeal_approved: "English appeal approved",
        english_appeal_declined: "English appeal declined",
        english_appeal_response: "English appeal response",
        staff_conversation_message: "Staff conversation reply",
        staff_issue_escalated: "Collector issue escalated to Keegan",
        staff_escalation_resolved: "Owner escalation handled",
        trading_access_restored: "Trading access restored",
        trading_access_restored_reports_cleared: "Access restored - Reports cleared",
        trading_profile_report_dismissed: "Profile report dismissed",
        trading_card_report_dismissed: "Card report dismissed",
        overpriced_listing_removed: "Sale listing removed and user warned",
    };
    return labels[item.action] || item.actionLabel;
};
const getModerationSetName = englishViewName;
const getModerationCardCode = (setId: string, cardKey: string) => englishViewCode({ set_id: setId, card_key: cardKey });
const getReportedCardImage = (setId: string, cardKey: string) => englishViewImage({ set_id: setId, card_key: cardKey });
const ReportedCardThumbnail = ({ setId, cardKey }: {
    setId: string;
    cardKey: string;
}) => {
    const src = getReportedCardImage(setId, cardKey);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);
    const imageCard = { set_id: setId, card_key: cardKey };
    return (<div className="moderation-card-preview" aria-label={getModerationCardCode(setId, cardKey)}>
      {src && !failed ? (<div className="moderation-card-preview-crop">
          <CardImage src={src} alt={getModerationCardCode(setId, cardKey)} onError={() => setFailed(true)} className="h-full w-full object-cover object-center" imageSize={englishViewCard(imageCard)?.original ? "original" : "grid"} style={englishViewStyle(imageCard)}/>
        </div>) : <span className="text-center text-xs text-zinc-500">Image unavailable</span>}
    </div>);
};
const LeaderboardModeration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const staffSummary = useStaffSummary();
    const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [bans, setBans] = useState<LeaderboardBan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBan, setSelectedBan] = useState<LeaderboardBan | null>(null);
    const [unbanning, setUnbanning] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [historyAction, setHistoryAction] = useState("all");
    const [banRefresh, setBanRefresh] = useState(0);
    const [reportRefresh, setReportRefresh] = useState(0);
    const [currentView, setCurrentView] = useState<"active" | "account_reports" | "strikes" | "history" | "discord" | "frames" | "appeals" | "conversations">(() => {
        const value = new URLSearchParams(window.location.search).get("view");
        return ["account_reports", "strikes", "history", "discord", "frames", "appeals", "conversations"].includes(value ?? "") ? value as "account_reports" | "strikes" | "history" | "discord" | "frames" | "appeals" | "conversations" : "active";
    });
    useEffect(() => {
        const view = new URLSearchParams(location.search).get("view");
        if (["active", "account_reports", "strikes", "history", "discord", "frames", "appeals", "conversations"].includes(view ?? "")) setCurrentView(view as typeof currentView);
    }, [location.search]);
    const [directoryResult, setDirectoryResult] = useState<{ key: string; rows: AccessDirectoryRow[]; total: number }>({ key: "", rows: [], total: 0 });
    const [directoryLoading, setDirectoryLoading] = useState(false);
    const [directoryError, setDirectoryError] = useState("");
    const [directoryRefresh, setDirectoryRefresh] = useState(0);
    const [directoryTarget, setDirectoryTarget] = useState<{ mode: "discord" | "frames"; row: AccessDirectoryRow } | null>(null);
    const [directoryReason, setDirectoryReason] = useState("");
    const [directorySaving, setDirectorySaving] = useState(false);
    const [directoryActionError, setDirectoryActionError] = useState("");
    const directorySaveLock = useRef(false);
    const [appealRefresh, setAppealRefresh] = useState(0);
    const [reviewAppealId, setReviewAppealId] = useState<string | null>(null);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [categoryNotices, setCategoryNotices] = useState<{ id: string; category: string }[]>([]);
    useEffect(() => {
        if (!authorized || !staffSummary.userId) { setCategoryCounts({}); setCategoryNotices([]); return; }
        let active = true;
        void (async () => {
            try {
                const notices: { id: string; category: string }[] = [];
                for (let offset = 0; active; offset += 500) {
                    const { data, error } = await (supabase as any).from("staff_notifications").select("id,title,url").eq("recipient_id", staffSummary.userId).eq("staff_only", true).is("read_at", null).order("created_at").order("id").range(offset, offset + 499);
                    if (!active) return;
                    if (error) throw error;
                    for (const notice of data ?? []) {
                        if (/^Frame access |^Moderation history: frame/i.test(notice.title)) continue;
                        const category = new URL(notice.url, window.location.origin).searchParams.get("view") ?? "history";
                        notices.push({ id: notice.id, category });
                    }
                    if ((data ?? []).length < 500) break;
                }
                if (active) { const counts: Record<string, number> = {}; for (const notice of notices) counts[notice.category] = (counts[notice.category] ?? 0) + 1; setCategoryCounts(counts); setCategoryNotices(notices); }
            } catch { if (active) setErrorMessage("Unread counts could not be loaded. Refresh to retry."); }
        })();
        return () => { active = false; };
    }, [authorized, staffSummary.userId, staffSummary.version]);
    useEffect(() => {
        if (!authorized || currentView === "conversations") return;
        const notices = categoryNotices.filter(notice => notice.category === currentView);
        if (!notices.length) return;
        let active = true;
        void (async () => {
            for (let offset = 0; active && offset < notices.length; offset += 20) await Promise.all(notices.slice(offset, offset + 20).map(async notice => {
                const { error } = await (supabase as any).rpc("staff_communications", { p_action: "read_notification", p_data: { id: notice.id } });
                if (error) throw error;
            }));
        })().then(() => { if (active) { setCategoryCounts(previous => ({ ...previous, [currentView]: 0 })); window.dispatchEvent(new Event("staff-communications-changed")); } }).catch(() => { if (active) setErrorMessage("The category could not be marked as read. Refresh to retry."); });
        return () => { active = false; };
    }, [authorized, currentView, categoryNotices]);
    useEffect(() => { setReviewAppealId(currentView === "conversations" ? new URLSearchParams(location.search).get("review") : null); }, [currentView, location.search]);
    const closeAppealReview = () => {
        setReviewAppealId(null);
        const params = new URLSearchParams(location.search);
        if (params.has("review")) { params.delete("review"); navigate(`${location.pathname}?${params}`, { replace: true }); }
    };
    const appealChanged = () => { setBanRefresh(value => value + 1); setAppealRefresh(value => value + 1); setHistoryLoaded(false); window.dispatchEvent(new Event("staff-communications-changed")); };

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
    const [showOfferStrikeInfo, setShowOfferStrikeInfo] = useState(false);
    const [dismissTarget, setDismissTarget] = useState<{
        kind: "profile" | "card";
        id: number;
        username: string;
    } | null>(null);
    const [dismissing, setDismissing] = useState(false);
    const [warningTarget, setWarningTarget] = useState<CardPriceReport | null>(null);
    const [warningMode, setWarningMode] = useState<"template" | "custom">("template");
    const [suggestedPrice, setSuggestedPrice] = useState("");
    const [customExplanation, setCustomExplanation] = useState("");
    const [warningError, setWarningError] = useState("");
    const [sendingWarning, setSendingWarning] = useState(false);
    const warningMessage = warningTarget && warningMode === "template"
        ? buildListingWarningMessage(warningTarget.reportedUsername, getModerationCardCode(warningTarget.setId, warningTarget.cardKey), suggestedPrice.trim())
        : customExplanation.trim();
    const removeListingAndWarn = async () => {
        if (!warningTarget || sendingWarning)
            return;
        if (!/^\$?\d+(?:\.\d{1,2})?(?:\s*-\s*\$?\d+(?:\.\d{1,2})?)?$/.test(suggestedPrice.trim()) || !warningMessage.trim()) {
            setWarningError("Enter a price or range, such as $5.00 - $10.00, and a written explanation.");
            return;
        }
        setSendingWarning(true);
        setWarningError("");
        try {
            const { error } = await (supabase as any).rpc("remove_overpriced_listing_and_warn", {
                p_report_id: warningTarget.id,
                p_suggested_price: suggestedPrice.trim(),
                p_explanation: warningMode === "custom" ? customExplanation.trim() : null,
                p_card_code: getModerationCardCode(warningTarget.setId, warningTarget.cardKey),
                p_use_template: warningMode === "template",
            });
            if (error)
                throw error;
            setCardReports((current) => current.filter((item) => !(item.reportedUserId === warningTarget.reportedUserId && item.setId === warningTarget.setId && item.cardKey === warningTarget.cardKey)));
            setSuccessMessage(`${warningTarget.reportedUsername}'s sale listing was removed and their warning was saved.`);
            setWarningTarget(null);
            setHistoryLoaded(false);
        }
        catch (error: any) {
            setWarningError(error.message || "Unable to remove the listing. Please try again.");
        }
        finally {
            setSendingWarning(false);
        }
    };
    const hasOpenDialog = Boolean(selectedBan || selectedAccountReport || selectedReportComment || showOfferStrikeInfo || dismissTarget || warningTarget);
    useEffect(() => {
        if (!hasOpenDialog)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, [hasOpenDialog]);
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
        if (!authorized)
            return;
        const loadAccountReports = async () => {
            setReportsLoading(true);
            const [accountResult, cardResult, expirationResult] = await Promise.all([
                supabase
                    .from("trading_post_user_reports")
                    .select("id, reporter_user_id, reported_user_id, created_at, reporter_comment, wants_staff_contact, contact_discord_username, contacted_at, contacted_by")
                    .is("resolved_at", null)
                    .order("created_at", { ascending: true }),
                supabase
                    .from("trading_post_card_reports")
                    .select("id, reporter_user_id, reported_user_id, set_id, card_key, reported_price, created_at")
                    .is("resolved_at", null)
                    .order("created_at", { ascending: false }),
                supabase
                    .from("trade_offer_expiration_strikes")
                    .select("id, recipient_user_id, sender_user_id, target_set_id, target_card_key, expired_at")
                    .is("cleared_at", null)
                    .order("expired_at", { ascending: false }),
            ]);
            if (accountResult.error || cardResult.error || expirationResult.error) {
                console.error("Unable to load reports:", accountResult.error || cardResult.error || expirationResult.error);
                setErrorMessage("Unable to load reports.");
                setReportsLoading(false);
                return;
            }
            const accountRows = accountResult.data || [];
            const cardRows = cardResult.data || [];
            const expirationRows = expirationResult.data || [];
            const profileIds = Array.from(new Set([
                ...accountRows.flatMap((row) => [
                    row.reporter_user_id,
                    row.reported_user_id,
                    row.contacted_by,
                ]),
                ...cardRows.flatMap((row) => [
                    row.reporter_user_id,
                    row.reported_user_id,
                ]),
                ...expirationRows.flatMap((row) => [
                    row.recipient_user_id,
                    row.sender_user_id,
                ]),
            ].filter(Boolean)));
            const { data: profileRows } = profileIds.length
                ? await supabase
                    .from("profiles")
                    .select("id, username, avatar_url")
                    .in("id", profileIds)
                : { data: [] };
            const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]));
            const targetIds = Array.from(new Set([
                ...accountRows.map((row) => row.reported_user_id),
                ...expirationRows.map((row) => row.recipient_user_id),
            ]));
            const { data: tradingRows } = targetIds.length
                ? await supabase
                    .from("trading_profiles")
                    .select("user_id, trade_access_revoked")
                    .in("user_id", targetIds)
                : { data: [] };
            const revokedByUser = new Map((tradingRows || []).map((row) => [
                row.user_id,
                Boolean(row.trade_access_revoked),
            ]));
            const grouped = new Map<string, AccountReportGroup>();
            accountRows.forEach((row) => {
                const target = profileMap.get(row.reported_user_id);
                const reporter = profileMap.get(row.reporter_user_id);
                const contactModerator = row.contacted_by
                    ? profileMap.get(row.contacted_by)
                    : null;
                if (!grouped.has(row.reported_user_id)) {
                    grouped.set(row.reported_user_id, {
                        userId: row.reported_user_id,
                        username: target?.username || "Deleted User",
                        avatar: getProfileAssets(target).avatar,
                        tradeAccessRevoked: revokedByUser.get(row.reported_user_id) || false,
                        reports: [],
                        expiredOffers: [],
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
                    contactedByAvatar: contactModerator
                        ? getProfileAssets(contactModerator).avatar
                        : "",
                });
            });
            expirationRows.forEach((row) => {
                const target = profileMap.get(row.recipient_user_id);
                const sender = profileMap.get(row.sender_user_id);
                if (!grouped.has(row.recipient_user_id)) {
                    grouped.set(row.recipient_user_id, {
                        userId: row.recipient_user_id,
                        username: target?.username || "Deleted User",
                        avatar: getProfileAssets(target).avatar,
                        tradeAccessRevoked: revokedByUser.get(row.recipient_user_id) || false,
                        reports: [],
                        expiredOffers: [],
                    });
                }
                grouped.get(row.recipient_user_id)?.expiredOffers.push({
                    id: row.id,
                    senderUsername: sender?.username || "Deleted User",
                    senderAvatar: getProfileAssets(sender).avatar,
                    targetSetId: row.target_set_id,
                    targetCardKey: row.target_card_key,
                    expiredAt: row.expired_at,
                });
            });
            setAccountReports(Array.from(grouped.values()).sort((a, b) => {
                const latest = (group: AccountReportGroup) => Math.max(0, ...group.reports.map((report) => new Date(report.createdAt).getTime()), ...group.expiredOffers.map((offer) => new Date(offer.expiredAt).getTime()));
                return latest(b) - latest(a);
            }));
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
        const reportChannel = supabase
            .channel("moderation-account-reports")
            .on("postgres_changes", { event: "*", schema: "public", table: "trading_post_user_reports" }, () => loadAccountReports())
            .on("postgres_changes", { event: "*", schema: "public", table: "trading_post_card_reports" }, () => loadAccountReports())
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "trade_offer_expiration_strikes",
        }, () => loadAccountReports())
            .on("postgres_changes", { event: "*", schema: "public", table: "trading_profiles" }, () => loadAccountReports())
            .subscribe();
        return () => {
            supabase.removeChannel(reportChannel);
        };
    }, [authorized, reportRefresh]);
    const dismissReport = async () => {
        if (!dismissTarget || dismissing)
            return;
        setDismissing(true);
        setErrorMessage("");
        const { error } = await supabase.rpc("dismiss_moderation_report", {
            p_report_type: dismissTarget.kind,
            p_report_id: dismissTarget.id,
        });
        if (error) {
            setErrorMessage(error.message || "Unable to dismiss the report.");
            setDismissing(false);
            return;
        }
        if (dismissTarget.kind === "card") {
            setCardReports((current) => current.filter((item) => item.id !== dismissTarget.id));
        }
        else {
            setAccountReports((current) => current.map((group) => ({
                ...group,
                reports: group.reports.filter((item) => item.id !== dismissTarget.id),
            })).filter((group) => group.reports.length > 0 || group.expiredOffers.length > 0));
        }
        setSuccessMessage(`${dismissTarget.username}'s report was dismissed.`);
        setDismissTarget(null);
        setHistoryLoaded(false);
        setDismissing(false);
    };
    const revokeTradingAccess = async (report: AccountReportGroup) => {
        if (revokingUserId)
            return;
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
        setAccountReports((current) => current.map((item) => item.userId === report.userId
            ? { ...item, tradeAccessRevoked: true }
            : item));
        setSuccessMessage(`${report.username}'s trade and sale access was revoked.`);
        setRevokingUserId(null);
        setHistoryLoaded(false);
    };
    const restoreTradingAccess = async (report: AccountReportGroup) => {
        if (revokingUserId)
            return;
        setRevokingUserId(report.userId);
        setErrorMessage("");
        const { error } = await supabase.rpc("restore_trading_access", {
            target_user_id: report.userId,
            new_discord_username: "",
        });
        if (error) {
            setErrorMessage(error.message || "Unable to reinstate trading access.");
            setRevokingUserId(null);
            return;
        }
        setAccountReports((current) => current.filter((item) => item.userId !== report.userId));
        setSelectedAccountReport(null);
        setSuccessMessage(`${report.username}'s trade and sale access was reinstated and their reports and expired-offer strikes were cleared.`);
        setRevokingUserId(null);
        setHistoryLoaded(false);
    };
    const markReporterContacted = async () => {
        if (!selectedReportComment?.wantsStaffContact ||
            selectedReportComment.contactedAt ||
            markingContacted)
            return;
        setMarkingContacted(true);
        setErrorMessage("");
        const { error } = await supabase.rpc("mark_trading_report_contacted", {
            report_id: selectedReportComment.id,
        });
        if (error) {
            setErrorMessage(error.message || "Unable to mark this reporter as contacted.");
            setMarkingContacted(false);
            return;
        }
        const { data: { session }, } = await supabase.auth.getSession();
        const { data: moderatorProfile } = session?.user
            ? await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("id", session.user.id)
                .maybeSingle()
            : { data: null };
        const updated = {
            ...selectedReportComment,
            contactedAt: new Date().toISOString(),
            contactedBy: session?.user.id || null,
            contactedByUsername: moderatorProfile?.username || "Moderator",
            contactedByAvatar: getProfileAssets(moderatorProfile).avatar,
        };
        setSelectedReportComment(updated);
        setAccountReports((groups) => groups.map((group) => ({
            ...group,
            reports: group.reports.map((report) => report.id === updated.id ? updated : report),
        })));
        setHistoryLoaded(false);
        setMarkingContacted(false);
    };
    useEffect(() => {
        let active = true;
        const loadModerationPage = async () => {
            setLoading(true);
            setErrorMessage("");
            const { data: { session }, } = await supabase.auth.getSession();
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
            if (active)
                setAuthorized(true);
            const { data: exclusionRows, error: exclusionsError } = await supabase
                .from("leaderboard_exclusions")
                .select("user_id, reason, created_at")
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
            const usernameById = new Map((profileRows || []).map((profile) => [profile.id, profile.username]));
            const combinedBans = (exclusionRows || []).map((row) => ({
                userId: row.user_id,
                username: usernameById.get(row.user_id) || "Deleted User",
                createdAt: row.created_at,
                reason: row.reason || "",
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
    }, [banRefresh]);
    const unbanUser = async () => {
        if (!selectedBan || unbanning)
            return;
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
        setBans((currentBans) => currentBans.filter((ban) => ban.userId !== selectedBan.userId));
        setSuccessMessage(`${selectedBan.username} was reinstated on the English leaderboard.`);
        setSelectedBan(null);
        setUnbanning(false);
        setHistoryLoaded(false);
    };
    const loadHistory = async (force = false) => {
        if ((!force && historyLoaded) || historyLoading)
            return;
        setHistoryLoading(true);
        setErrorMessage("");
        const logRows: any[] = [];
        let logError: {
            message: string;
        } | null = null;
        for (let offset = 0;; offset += 500) {
            const { data, error } = await supabase.from("moderation_logs")
                .select("id, moderator_user_id, moderator_username, target_user_id, target_username, action, details, created_at")
                .order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + 499);
            if (error) {
                logError = error;
                break;
            }
            logRows.push(...(data || []));
            if (!data || data.length < 500)
                break;
        }
        const { data: strikeRows, error: strikeError } = await supabase
            .from("trade_offer_expiration_strikes")
            .select("id, recipient_user_id, expired_at")
            .order("expired_at", { ascending: false });
        if (logError || strikeError) {
            console.error("Unable to load moderation history:", logError || strikeError);
            setErrorMessage("Unable to load moderation history.");
            setHistoryLoading(false);
            return;
        }
        const profileIds = Array.from(new Set((logRows || []).flatMap((row) => [
            row.moderator_user_id,
            row.target_user_id,
        ]).concat((strikeRows || []).map((row) => row.recipient_user_id)).filter(Boolean)));
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
            const actionLabels: Record<string, string> = {
                leaderboard_eligibility_revoked: "revoked leaderboard eligibility for",
                leaderboard_self_excluded: "self-excluded from leaderboards",
                leaderboard_user_banned: "revoked leaderboard eligibility for",
                leaderboard_user_unbanned: "unbanned",
                leaderboard_ban_lifted: "unbanned",
                trading_report_contacted: "contacted report author",
                trading_access_revoked: "revoked trade and sale rights for",
                frame_access_reinstated: "reinstated frame access for",
                english_appeal_approved: "approved an English appeal for",
                english_appeal_declined: "declined an English appeal for",
                english_appeal_response: "responded to an English appeal from",
                staff_conversation_message: "sent a staff message to",
                staff_issue_escalated: "escalated an issue for",
                staff_escalation_resolved: "handled an escalation for",
                trading_access_restored: "reinstated trade and sale rights for",
                trading_access_restored_reports_cleared: "reinstated rights and cleared reports for",
                trading_profile_report_dismissed: "dismissed a profile report for",
                trading_card_report_dismissed: "dismissed a card report for",
                overpriced_listing_removed: "removed an overpriced listing and warned",
            };
            return {
                id: row.id,
                moderatorUsername: row.moderator_username || moderatorProfile?.username || "System",
                moderatorAvatar: row.moderator_username?.toLowerCase() === "system"
                    ? rylandGraceAvatar
                    : moderatorProfile ? getProfileAssets(moderatorProfile).avatar : fallbackAvatar,
                targetUsername: row.target_username,
                targetAvatar: targetProfile
                    ? getProfileAssets(targetProfile).avatar
                    : fallbackAvatar,
                action: row.action,
                actionLabel: actionLabels[row.action] || row.action,
                createdAt: row.created_at,
                details: row.action.startsWith("staff_") ? (row.details || "").replace(/^Conversation\s+[0-9a-f-]{36}(?:;\s*message\s+\d+:\s*|\s*)/i, "") : row.details || "",
            };
        });
        const strikeHistoryItems: ModerationHistoryItem[] = (strikeRows || []).map((row) => {
            const targetProfile = profileById.get(row.recipient_user_id);
            return {
                id: -row.id,
                moderatorUsername: "System",
                moderatorAvatar: rylandGraceAvatar,
                targetUsername: targetProfile?.username || "Deleted User",
                targetAvatar: targetProfile ? getProfileAssets(targetProfile).avatar : fallbackAvatar,
                action: "trade_offer_expiration_strike",
                actionLabel: "received an expired-offer strike",
                createdAt: row.expired_at,
            };
        });
        setHistoryItems([...nextHistoryItems, ...strikeHistoryItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setHistoryLoaded(true);
        setHistoryLoading(false);
    };
    const openHistory = async () => {
        setCurrentView("history");
        setSearchQuery("");
        await loadHistory(true);
    };
    const [pageByView, setPageByView] = useState({ active: 1, account_reports: 1, strikes: 1, history: 1, discord: 1, frames: 1, appeals: 1, conversations: 1 });
    const listPanelRef = useRef<HTMLDivElement>(null);
    const pageSize = 10;
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const isDirectoryView = currentView === "discord" || currentView === "frames";
    const directoryKey = `${currentView}:${normalizedSearch}:${pageByView[currentView]}`;
    useEffect(() => {
        if (!authorized || (currentView !== "discord" && currentView !== "frames")) return;
        let cancelled = false;
        setDirectoryLoading(true);
        setDirectoryError("");
        const timer = window.setTimeout(() => {
            void (async () => {
                try {
                    const { data, error } = await (supabase as any).rpc("moderator_access_directory", { p_mode: currentView, p_query: normalizedSearch, p_limit: pageSize, p_offset: (pageByView[currentView] - 1) * pageSize });
                    if (cancelled) return;
                    if (error) throw error;
                    const rows = (data ?? []) as AccessDirectoryRow[];
                    setDirectoryResult({ key: directoryKey, rows, total: Number(rows[0]?.total_count ?? 0) });
                } catch (cause) {
                    if (!cancelled) {
                        setDirectoryResult({ key: directoryKey, rows: [], total: 0 });
                        const detail = cause as { code?: string; message?: string };
                        setDirectoryError(detail.code === "PGRST202" || detail.code === "42883" ? "Run the moderator directory setup SQL, then refresh this section." : detail.message || "This directory could not be loaded.");
                    }
                } finally { if (!cancelled) setDirectoryLoading(false); }
            })();
        }, 250);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [authorized, currentView, normalizedSearch, pageByView[currentView], directoryRefresh]);
    const runDirectoryAction = async () => {
        if (!directoryTarget || directorySaveLock.current || directoryReason.trim().length < 3) return;
        directorySaveLock.current = true;
        setDirectorySaving(true);
        setDirectoryActionError("");
        const { mode, row } = directoryTarget;
        try {
            const { error } = mode === "discord"
                ? await (supabase as any).rpc("moderator_revoke_discord", { p_user_id: row.user_id, p_expected_discord: row.discord_username, p_reason: directoryReason.trim() })
                : await (supabase as any).rpc("moderator_reinstate_frame", { p_user_id: row.user_id, p_frame_id: row.frame_id, p_expected_revoked_at: row.revoked_at, p_reason: directoryReason.trim() });
            if (error) throw error;
            setDirectoryResult(previous => ({ ...previous, rows: previous.rows.filter(item => mode === "discord" ? item.user_id !== row.user_id : item.user_id !== row.user_id || item.frame_id !== row.frame_id), total: Math.max(0, previous.total - 1) }));
            setDirectoryTarget(null);
            setDirectoryReason("");
            setSuccessMessage(mode === "discord" ? `${row.username}'s Discord username was removed and trade and sale access was revoked.` : `${accessFrameLabel(row.frame_id)} access was reinstated for ${row.username}.`);
            setDirectoryRefresh(value => value + 1);
            setReportRefresh(value => value + 1);
            setHistoryLoaded(false);
        } catch (cause) { setDirectoryActionError((cause as { message?: string }).message || "The update could not be saved. Please retry."); }
        finally { directorySaveLock.current = false; setDirectorySaving(false); }
    };
    useEffect(() => {
        const invalidate = () => setHistoryLoaded(false);
        window.addEventListener("staff-communications-changed", invalidate);
        return () => window.removeEventListener("staff-communications-changed", invalidate);
    }, []);
    useEffect(() => { if (authorized && currentView === "history") void loadHistory(true); }, [authorized, currentView]);
    const filteredBans = bans.filter((ban) => ban.username.toLowerCase().includes(normalizedSearch));
    const reportedAccounts = accountReports.filter((group) => group.reports.length > 0 && `${group.username} ${group.reports.map(report => report.comment).join(" ")}`.toLowerCase().includes(normalizedSearch));
    const struckAccounts = accountReports.filter((group) => group.expiredOffers.length > 0 && group.username.toLowerCase().includes(normalizedSearch));
    const searchedCardReports = cardReports.filter(report => `${report.reportedUsername} ${report.reporterUsername} ${report.cardKey} ${report.setId}`.toLowerCase().includes(normalizedSearch));
    const filteredHistory = historyItems.filter(item => (historyAction === "all" || item.action === historyAction) && `${item.moderatorUsername} ${item.targetUsername} ${getHistoryActionTitle(item)} ${item.details || ""}`.toLowerCase().includes(normalizedSearch));
    const totalItems = currentView === "appeals" || currentView === "conversations" ? 0 : isDirectoryView ? directoryResult.total : currentView === "active" ? filteredBans.length
        : currentView === "account_reports" ? searchedCardReports.length + reportedAccounts.length
            : currentView === "strikes" ? struckAccounts.length
                : filteredHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(pageByView[currentView], totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageEnd = pageStart + pageSize;
    const pagedBans = filteredBans.slice(pageStart, pageEnd);
    const pagedCardReports = searchedCardReports.slice(pageStart, pageEnd);
    const pagedAccountReports = currentView === "strikes" ? struckAccounts.slice(pageStart, pageEnd)
        : reportedAccounts.slice(Math.max(0, pageStart - searchedCardReports.length), Math.max(0, pageEnd - searchedCardReports.length));
    const pagedHistoryItems = filteredHistory.slice(pageStart, pageEnd);
    const pageLoading = currentView === "appeals" || currentView === "conversations" ? false : isDirectoryView ? directoryLoading || directoryResult.key !== directoryKey : currentView === "active" ? loading
        : currentView === "account_reports" || currentView === "strikes" ? reportsLoading : historyLoading;
    useEffect(() => {
        setPageByView((pages) => pages[currentView] > totalPages
            ? { ...pages, [currentView]: totalPages } : pages);
    }, [currentView, totalPages]);
    const changePage = (nextPage: number) => {
        setPageByView((pages) => ({ ...pages, [currentView]: Math.max(1, Math.min(nextPage, totalPages)) }));
        listPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    };
    const refreshWorkspace = () => {
        setErrorMessage("");
        if (currentView === "appeals" || currentView === "conversations") setAppealRefresh(value => value + 1);
        else if (isDirectoryView) setDirectoryRefresh(value => value + 1);
        else if (currentView === "history")
            void loadHistory(true);
        else if (currentView === "active") {
            setLoading(true);
            setBanRefresh(value => value + 1);
        }
        else {
            setReportsLoading(true);
            setReportRefresh(value => value + 1);
        }
    };
    useEffect(() => {
        if (!authorized)
            return;
        const shortcut = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (event.key === "/" && !event.ctrlKey && !event.metaKey && !target?.closest("input, textarea, select, [contenteditable='true']")) {
                event.preventDefault();
                document.querySelector<HTMLInputElement>("[data-mc-search]")?.focus();
            }
        };
        window.addEventListener("keydown", shortcut);
        return () => window.removeEventListener("keydown", shortcut);
    }, [authorized]);
    if (authorized === false) {
        return (<div className={`flex min-h-screen items-center justify-center px-6 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
        <div className={`w-full max-w-sm rounded-3xl border p-6 text-center ${isLightMode
                ? "border-red-600/20 bg-white shadow-lg"
                : "border-red-500/20 bg-red-500/[0.05]"}`}>
          <Shield className={`mx-auto h-10 w-10 ${isLightMode ? "text-red-600" : "text-red-400"}`}/>
          <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
          <p className={`mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
            This page is only available to the leaderboard moderation team.
          </p>
          <button type="button" onClick={() => navigate(-1)} className={`mt-5 rounded-xl px-5 py-2.5 text-sm font-bold ${isLightMode
                ? "bg-[#c89d13] text-white"
                : "bg-[#FFD54A] text-black"}`}>
            Go Back
          </button>
        </div>
      </div>);
    }
    return (<div data-mobile-theme={isLightMode ? "light" : "dark"} className={`moderation-page min-h-screen pb-12 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <style>{`
.moderation-page{--mc-accent:#e7c84b;--mc-bg:#181b1e;--mc-soft:#22262a;--mc-line:#ffffff15;--mc-ink:#f4f4f5;--mc-muted:#9ca3af}.moderation-page[data-mobile-theme="light"]{--mc-bg:#fff;--mc-soft:#f0f2f4;--mc-line:#19242d18;--mc-ink:#20262b;--mc-muted:#68727b}.spooky .moderation-page,[data-theme="spooky"] .moderation-page{--mc-accent:#be9af9}.mc-shell{max-width:none!important;margin:0!important}.mc-kicker{font-size:9px;letter-spacing:.1em;color:var(--mc-accent);font-weight:650}.mc-title{font-size:25px;font-weight:700;line-height:1.2;letter-spacing:-.03em;margin:4px 0}.mc-query-bar{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--mc-line);color:var(--mc-ink)}.mc-query-bar>label{display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:0 10px;border:1px solid var(--mc-line);border-radius:9px;background:var(--mc-soft)}.mc-query-bar>label svg{flex-shrink:0;color:var(--mc-muted)}.mc-query-bar input{width:100%;min-width:0;border:0;background:none;color:var(--mc-ink);font-size:16px;padding:9px 0;outline:none}.mc-query-bar input::placeholder{font-size:12px}.mc-query-bar kbd{font:11px monospace;color:var(--mc-muted)}.mc-query-bar select{max-width:240px;background:var(--mc-soft);color:var(--mc-ink);border:1px solid var(--mc-line);border-radius:9px;padding:9px;font-size:12px;min-height:40px}.mc-query-bar>button{display:flex;align-items:center;gap:7px;border:1px solid var(--mc-line);background:var(--mc-bg);color:var(--mc-ink);padding:10px;border-radius:9px;font-size:11px;white-space:nowrap}.mc-query-bar>button:disabled{opacity:.4}.moderation-panel{scroll-margin-top:100px}.mc-shell button:focus-visible,.mc-shell select:focus-visible{outline:2px solid var(--mc-accent);outline-offset:3px}.mc-query-bar label:focus-within{border-color:var(--mc-accent)}
@media(max-width:680px){.mc-title{font-size:22px}.mc-query-bar{flex-wrap:wrap;padding:12px 0;gap:8px}.mc-query-bar>label{flex-basis:100%}.mc-query-bar select{flex:1;max-width:none;min-width:0;font-size:16px}.mc-query-bar>button{margin-left:auto;min-height:42px}.mc-query-bar kbd{display:none}}
        .listing-warning-editor { display: flex; flex-direction: column; width: 100%; max-width: 448px; max-height: min(520px, calc(100dvh - 32px)); overflow: hidden; }
        .listing-warning-editor-heading { flex-shrink: 0; padding: 12px 14px 10px; border-bottom: 1px solid rgba(128,128,128,.2); }
        .listing-warning-editor-body { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 12px 14px; }
        .listing-warning-card-summary .moderation-card-preview { width: 56px; height: 78px; flex-shrink: 0; }
        .listing-warning-message-preview { max-height: 110px; overflow-y: auto; overscroll-behavior: contain; font-size: 13px; line-height: 19px; }
        .listing-warning-custom-message { max-height: 120px; resize: vertical; }
        .listing-warning-editor-footer { flex-shrink: 0; display: grid; grid-template-columns: 80px minmax(0,1fr); gap: 8px; padding: 10px 14px; border-top: 1px solid rgba(128,128,128,.2); }
        @media (max-width: 639px) {
          .moderation-modal-overlay.listing-warning-overlay { align-items: center; padding: max(8px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom)); }
          .listing-warning-editor { max-height: min(520px, calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))); }
          .listing-warning-editor-heading { padding: 12px 14px 10px; }
          .listing-warning-editor-heading h2 { line-height: 22px; }
          .listing-warning-editor-body { padding: 12px 14px; }
          .listing-warning-card-summary .moderation-card-preview { width: 48px; height: 68px; border-radius: 6px; }
          .listing-warning-message-preview { max-height: min(120px, 20dvh); font-size: 13px; line-height: 19px; }
          .listing-warning-custom-message { max-height: min(120px, 20dvh); }
          .listing-warning-editor-footer { grid-template-columns: 80px minmax(0,1fr); padding: 10px 14px; }
        }
        .moderation-page p, .moderation-page h2 { overflow-wrap: anywhere; }
        .moderation-page button { min-height: 44px; }
        .moderation-price-card { display: grid; grid-template-columns: minmax(0, 1fr) 116px; grid-template-areas: "header preview" "reporter preview" "dismiss preview"; align-content: center; align-items: center; column-gap: 16px; min-height: 226px; }
        .moderation-price-card > .moderation-price-header { grid-area: header; min-width: 0; }
        .moderation-price-card > .moderation-price-header + div { grid-area: reporter; min-width: 0; }
        .moderation-price-card > .moderation-price-actions { grid-area: dismiss; width: 100%; }
        .moderation-card-preview { grid-area: preview; width: 116px; height: 163px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 9px; }
        .moderation-card-preview-crop { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 9px; }
        @media (max-width: 639px) {
          .moderation-price-card { min-height: 0; grid-template-columns: minmax(0, 1fr) 96px; grid-template-areas: "header preview" "reporter reporter" "dismiss dismiss"; gap: 12px; }
          .moderation-price-card > .moderation-price-header { padding: 0; flex-direction: row; align-items: flex-start; gap: 8px; }
          .moderation-price-card > .moderation-price-header > img { display: none; }
          .moderation-price-card > .moderation-card-preview { width: 96px; height: 135px; }
          .moderation-price-card > .moderation-price-actions { margin-top: 0; }
        }
        .moderation-panel { scroll-margin-top: 96px; }
        .moderation-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; }
        .moderation-pagination-controls { display: flex; align-items: center; gap: 10px; }
        @media (max-width: 639px) {
          .moderation-pagination { padding: 16px 0; margin-top: 12px; }
          .moderation-pagination-summary { width: 100%; text-align: center; }
          .moderation-pagination-controls { width: 100%; justify-content: space-between; }
        }
        .moderation-history-desktop { display: none; }
        .moderation-history-table { width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; font-size: 14px; }
        .moderation-history-table th { padding: 12px 20px; font-size: 12px; font-weight: 600; }
        .moderation-history-table td { padding: 12px 14px; vertical-align: middle; overflow-wrap: anywhere; }
        .moderation-history-person { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .moderation-history-avatar { width: 32px; height: 32px; flex: 0 0 32px; overflow: hidden; border-radius: 50%; }
        .moderation-history-action { display: inline-block; padding: 6px 10px; border-radius: 8px; font-size: 12px; line-height: 18px; font-weight: 500; }
        @media (min-width: 1024px) {
          .moderation-history-desktop { display: block; }
          .moderation-history-mobile { display: none; }
        }
        @media (max-width: 1023px) {
          .moderation-page { --moderation-card-bg: #151718; --moderation-line: rgba(255,255,255,.10); padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
          .moderation-page[data-mobile-theme="light"] { --moderation-card-bg: #fff; --moderation-line: rgba(0,0,0,.10); }
          .moderation-shell { padding: 28px 12px 0; }
          .moderation-heading { align-items: center; gap: 12px; }
          .moderation-heading > button { width: 44px; height: 44px; flex: 0 0 44px; }
          .moderation-heading-emblem { display: none; }
          .moderation-heading h1 { font-size: 20px; line-height: 26px; }
          .moderation-heading p { margin-top: 4px; line-height: 18px; }
          .moderation-panel { margin-top: 20px; border: 0; border-radius: 0; background: transparent; box-shadow: none; overflow: visible; }
          .moderation-toolbar { display: flex; flex-direction: column; align-items: stretch; padding: 0; border: 0; gap: 16px; }
          .moderation-tabs { order: -1; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 6px; padding: 5px; border: 1px solid var(--moderation-line); border-radius: 16px; background: var(--moderation-card-bg); }
          .moderation-tabs button { padding: 10px 6px; border-radius: 11px; font-size: 14px; line-height: 20px; }
          .moderation-toolbar > div:first-child { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 2px 12px; }
          .moderation-toolbar h2 { font-size: 15px; line-height: 21px; }
          .moderation-toolbar p { margin: 0; flex-shrink: 0; font-size: 12px; }
          .moderation-search { padding: 0 0 12px; border: 0; }
          .moderation-search input { font-size: 16px; min-height: 46px; }
          .moderation-ban-list { display: grid; gap: 10px; }
          .moderation-ban-row { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; padding: 14px; background: var(--moderation-card-bg); border: 1px solid var(--moderation-line); border-radius: 16px; }
          .moderation-ban-row p:first-child { white-space: normal; overflow-wrap: anywhere; font-size: 15px; }
          .moderation-ban-row > button { width: 100%; font-size: 14px; min-height: 44px; }
          .moderation-report-list { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; padding: 0; }
          .moderation-report-card { padding: 14px; border-radius: 16px; background-color: var(--moderation-card-bg); }
          .moderation-price-header { align-items: flex-start; gap: 12px; }
          .moderation-price-header > div { flex: 1; min-width: 0; }
          .moderation-price-header p { line-height: 22px; }
          .moderation-price-header p + p { margin-top: 8px; }
          .moderation-account-header { display: grid; grid-template-columns: 40px minmax(0,1fr); align-items: start; gap: 10px 12px; }
          .moderation-account-status { margin-top: 8px; font-size: 12px; line-height: 18px; font-weight: 500; }
          .moderation-report-alert, .moderation-revoked-icon { display: none; }
          .moderation-strike-badge { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 12px; }
          .moderation-strike-badge > div:first-child { gap: 10px; }
          .moderation-strike-badge button { width: 44px; height: 44px; }
          .moderation-report-details { margin-top: 14px; }
          .moderation-detail-row { align-items: flex-start; gap: 10px; padding: 12px 10px; }
          .moderation-detail-row p { font-size: 13px; line-height: 20px; }
          .moderation-detail-row > p > span:first-child { display: block; margin-bottom: 3px; }
          .moderation-history-mobile { display: grid; gap: 10px; }
          .moderation-history-entry { border: 1px solid var(--moderation-line); border-radius: 16px; background: var(--moderation-card-bg); padding: 14px; }
          .moderation-history-entry > div:last-child { padding-top: 10px; border-top: 1px solid var(--moderation-line); }
          .moderation-history-entry time { display: block; width: auto; margin-left: auto; }
          .moderation-modal-overlay { z-index: 2147483646; align-items: flex-end; padding: max(12px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom)); }
          .moderation-modal-panel { display: flex; flex-direction: column; width: 100%; max-width: 600px; min-height: 0; max-height: calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); padding: 0; border-radius: 20px; overflow: hidden; }
          .moderation-modal-body { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px; -webkit-overflow-scrolling: touch; }
          .moderation-modal-body h2 { font-size: 18px; line-height: 25px; }
          .moderation-modal-body p { line-height: 22px; overflow-wrap: anywhere; }
          .moderation-modal-body .flex > div { min-width: 0; }
          .moderation-modal-body img, .moderation-modal-body button[aria-label] { flex-shrink: 0; }
          .moderation-modal-footer { flex-shrink: 0; padding: 12px 16px; border-top: 1px solid var(--moderation-line); display: grid; gap: 8px; }
          .moderation-modal-footer > button { margin-top: 0; min-height: 46px; font-size: 14px; line-height: 20px; }
        }
.mr-case-list{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;padding:18px}.mr-case{background:var(--mc-bg);border:1px solid var(--mc-line);border-radius:15px;overflow:hidden;min-width:0;color:var(--mc-ink)}.mr-case-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:19px 20px;border-bottom:1px solid var(--mc-line)}.mr-person{display:flex;align-items:center;gap:12px;min-width:0}.mr-person>img{width:46px;height:46px;border-radius:13px;object-fit:cover;flex-shrink:0}.mr-label{display:block;font-size:9px;letter-spacing:.1em;color:var(--mc-muted);font-weight:650}.mr-person h3{font-size:18px;font-weight:650;line-height:1.3;margin:5px 0 0;overflow-wrap:anywhere}.mr-status{flex-shrink:0;font-size:11px;background:var(--mc-soft);border:1px solid var(--mc-line);padding:7px 10px;border-radius:8px;color:var(--mc-muted)}.mr-revoked{color:#d7b1ff;border-color:#b892e94d;background:#b892e911}.mr-listing{display:flex;align-items:center;gap:20px;padding:20px}.mr-listing .moderation-card-preview{position:relative!important;inset:auto!important;float:none!important;width:74px!important;height:104px!important;flex:0 0 74px!important;margin:0!important}.mr-listing h4{font-size:15px;font-weight:600;margin:0 0 6px}.mr-listing code,.mr-evidence-item code{display:block;font-size:12px;overflow-wrap:anywhere;color:var(--mc-muted)}.mr-price{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-top:13px;font-size:20px;font-weight:650}.mr-price>span{font-size:11px;color:var(--mc-muted);font-weight:400}.mr-source{display:flex;align-items:center;gap:10px;padding:14px 20px;font-size:12px;color:var(--mc-muted);border-top:1px solid var(--mc-line)}.mr-source>img{width:30px;height:30px;border-radius:9px;object-fit:cover;flex-shrink:0}.mr-source>div{min-width:0;flex:1}.mr-source strong{font-weight:600;color:var(--mc-ink);overflow-wrap:anywhere}.mr-source time{display:block;font-size:10px;margin-top:4px;color:var(--mc-muted)}.mr-reference{font-size:10px;flex-shrink:0;color:var(--mc-muted)}.mr-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--mc-line);background:var(--mc-soft)}.mr-actions>span{margin-right:auto;font-size:11px;color:var(--mc-muted)}.mr-secondary,.mr-danger{border:1px solid var(--mc-line);border-radius:9px;padding:10px 13px;font-size:12px;font-weight:550;line-height:1.4;cursor:pointer}.mr-secondary{background:var(--mc-bg);color:var(--mc-ink)}.mr-danger{background:#b9323e;border-color:transparent;color:white}.mr-secondary:hover{border-color:var(--mc-accent)}.mr-danger:hover{background:#a52c37}.mr-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:0;padding:18px 20px}.mr-facts>span{display:flex;flex-direction:column;gap:5px;color:var(--mc-muted);font-size:11px;border-right:1px solid var(--mc-line)}.mr-facts>span:last-child{border:0}.mr-facts strong{font-size:22px;font-weight:650;color:var(--mc-ink);font-variant-numeric:tabular-nums}.mr-context{margin:0;padding:0 20px 17px;font-size:12px;line-height:1.7;color:var(--mc-muted)}.mr-policy{display:block;margin:0 20px 15px;padding:0;background:none;border:0;font-size:11px;text-decoration:underline;text-underline-offset:3px;color:var(--mc-accent)}.mr-evidence{border-top:1px solid var(--mc-line)}.mr-evidence>summary{list-style:none;display:flex;align-items:center;gap:10px;padding:15px 20px;font-size:12px;cursor:pointer}.mr-evidence>summary::-webkit-details-marker{display:none}.mr-evidence>summary>span:first-child{font-weight:600}.mr-evidence>summary>span:nth-child(2){margin-left:auto;font-size:11px;color:var(--mc-muted)}.mr-evidence>summary svg{color:var(--mc-muted);transition:transform .15s}.mr-evidence[open]>summary svg{transform:rotate(180deg)}.mr-evidence-list{padding:0 20px 16px;display:grid;gap:12px}.mr-evidence-item{padding:14px;border:1px solid var(--mc-line);background:var(--mc-bg);border-radius:11px}.mr-evidence-item .mr-source{border:0;padding:0}.mr-evidence-item>p{font-size:12px;line-height:1.7;margin:12px 0 5px;overflow-wrap:anywhere}.mr-comment{white-space:pre-wrap;color:var(--mc-ink)}.mr-contact-status{display:block;margin-top:9px;font-size:10px;color:var(--mc-accent)}.mr-evidence-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--mc-line)}.mr-ban-reason{max-width:850px;margin:10px 0 0;font-size:12px;line-height:1.7;color:var(--mc-muted);white-space:pre-wrap;overflow-wrap:anywhere}.mr-ban-reason strong{font-weight:550;color:var(--mc-ink)}.moderation-ban-list{display:grid!important;gap:12px;padding:16px}.moderation-ban-row{border:1px solid var(--mc-line)!important;border-radius:13px;padding:18px!important;background:var(--mc-bg);align-items:center!important}.moderation-ban-row>div{flex:1;min-width:0}.moderation-ban-row>button{width:auto!important;min-width:130px;align-self:center}.moderation-history-table{table-layout:fixed}.moderation-history-table th,.moderation-history-table td{padding:17px 18px!important;vertical-align:top!important}.moderation-history-table th:nth-child(1){width:22%}.moderation-history-table th:nth-child(2){width:38%}.moderation-history-table th:nth-child(3){width:23%}.moderation-history-table th:nth-child(4){width:17%}.moderation-history-table td:nth-child(2)>p{padding:10px;border-left:2px solid var(--mc-line);background:var(--mc-soft);border-radius:0 7px 7px 0}.moderation-history-action{font-size:11px!important;line-height:1.5!important}.moderation-history-person{align-items:start!important}.mr-case-list summary:focus-visible{outline:2px solid var(--mc-accent);outline-offset:-3px}
@media(max-width:680px){.mr-case-list{padding:12px;gap:13px}.mr-case-heading{padding:16px;align-items:start}.mr-person{gap:10px}.mr-person>img{height:40px;width:40px;border-radius:11px}.mr-person h3{font-size:17px}.mr-status{font-size:10px;padding:6px 8px;max-width:115px;text-align:center}.mr-label{font-size:8px}.mr-listing{padding:16px;gap:14px}.mr-source{padding:13px 16px;align-items:start}.mr-source .mr-reference{font-size:9px}.mr-facts{padding:16px;gap:10px}.mr-facts>span{font-size:10px;line-height:1.5;padding-right:7px}.mr-facts strong{font-size:20px}.mr-context{padding:0 16px 15px;font-size:12px}.mr-evidence>summary{padding:15px 16px}.mr-evidence-list{padding:0 12px 12px}.mr-evidence-actions{display:grid;grid-template-columns:1fr}.mr-evidence-actions button{min-height:42px}.mr-actions{padding:13px 16px;flex-wrap:wrap}.mr-actions>span{width:100%;margin:0 0 3px}.mr-actions>button{flex:1;min-height:43px}.moderation-ban-list{padding:12px;gap:12px}.moderation-ban-row{padding:16px!important}.moderation-ban-row>button{align-self:stretch;width:100%!important}.moderation-history-entry{padding:16px!important}.moderation-history-entry>div:first-child{align-items:start}.moderation-history-entry>div:first-child p:last-child{font-size:12px;line-height:1.7}}
@media(prefers-reduced-motion:reduce){.mr-evidence>summary svg{transition:none}}
.mr-case-list{padding:12px;gap:10px}.mr-case{border-radius:12px}.mr-case-heading{padding:12px 15px;gap:12px}.mr-person{gap:10px}.mr-person>img{width:34px;height:34px;border-radius:10px}.mr-person h3{font-size:15px;margin-top:3px}.mr-label{font-size:8px;letter-spacing:.07em}.mr-status{font-size:10px;padding:5px 8px}.mr-facts{padding:11px 15px;gap:14px}.mr-facts>span{flex-direction:row;align-items:baseline;gap:6px;font-size:10px;line-height:1.5}.mr-facts strong{font-size:16px}.mr-context{font-size:11px;line-height:1.6;padding:0 15px 11px}.mr-policy{margin:0 15px 10px;font-size:10px}.mr-evidence>summary{padding:11px 15px;font-size:11px}.mr-evidence>summary>span:nth-child(2){font-size:10px}.mr-evidence-list{padding:0 12px 12px;gap:9px}.mr-evidence-item{padding:11px;border-radius:9px}.mr-source{padding:10px 15px;gap:8px;font-size:11px}.mr-source>img{height:26px;width:26px;border-radius:8px}.mr-source time{font-size:9px;margin-top:3px}.mr-evidence-item>p{font-size:11px;line-height:1.6;margin-top:9px}.mr-evidence-actions{margin-top:10px;padding-top:9px;gap:7px}.mr-actions{padding:10px 15px;gap:8px}.mr-secondary,.mr-danger{padding:8px 11px;font-size:11px;border-radius:8px}.mr-listing{padding:13px 15px;gap:14px}.mr-listing .moderation-card-preview{width:56px!important;height:78px!important;flex-basis:56px!important}.mr-listing h4{font-size:13px;margin-bottom:4px}.mr-listing code,.mr-evidence-item code{font-size:11px}.mr-price{font-size:17px;margin-top:8px;gap:7px}.mr-price>span{font-size:10px}.moderation-ban-list{padding:12px;gap:9px}.moderation-ban-row{padding:12px 15px!important;gap:12px!important}.mr-ban-reason{margin-top:6px;font-size:11px;line-height:1.6}.moderation-history-table th,.moderation-history-table td{padding:11px 13px!important}.moderation-history-avatar{width:27px!important;height:27px!important;flex-basis:27px!important}.moderation-history-table td:nth-child(2)>p{padding:7px;font-size:11px;line-height:1.6}.moderation-history-person{gap:8px!important}.moderation-history-entry{padding:12px!important}
@media(max-width:680px){.mr-case-list{padding:10px;gap:10px}.mr-case-heading{padding:12px;gap:10px}.mr-person>img{width:34px;height:34px}.mr-person h3{font-size:15px}.mr-facts{padding:10px 12px;gap:8px}.mr-facts>span{flex-direction:column;gap:3px;font-size:9px}.mr-facts strong{font-size:16px}.mr-context{padding:0 12px 10px;font-size:11px}.mr-evidence>summary{padding:11px 12px;min-height:44px}.mr-policy{margin:0 12px 10px;min-height:30px}.mr-listing{padding:12px;gap:12px}.mr-source{padding:10px 12px}.mr-actions{padding:10px 12px}.mr-actions>span{font-size:10px;margin-bottom:0}.mr-actions>button,.mr-evidence-actions button{min-height:42px;padding:9px 11px}.mr-evidence-actions{display:flex;flex-wrap:wrap}.mr-evidence-actions>button{flex:1;min-width:125px}.moderation-ban-row{padding:12px!important}.moderation-history-entry{padding:12px!important}}
.mr-case{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;padding:12px;gap:8px 16px}.mr-case-heading{grid-column:1;min-width:0;padding:0;border:0;align-items:center}.mr-facts{grid-column:2;grid-row:1;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px 14px;padding:0;align-self:center}.mr-facts>span{flex-direction:row;gap:5px;border:0;padding:0;align-items:baseline;white-space:normal}.mr-context{grid-column:1/-1;padding:0;margin:0;line-height:1.5}.mr-policy{grid-column:1/-1;justify-self:start;margin:0;min-height:0;padding:3px 0}.mr-evidence{grid-column:1;min-width:0;border:0;align-self:center}.mr-evidence>summary{padding:7px 0;min-height:36px;justify-content:flex-start;gap:8px}.mr-evidence>summary>span:nth-child(2){margin-left:0}.mr-evidence-list{padding:8px 0 0;gap:8px}.mr-evidence[open]{grid-column:1/-1}.mr-actions{grid-column:2;justify-self:end;align-self:center;padding:0;border:0;background:none;gap:8px;flex-wrap:wrap}.mr-actions>span{display:none}.mr-actions>button{flex:0 1 auto;min-height:36px}.mr-listing{grid-column:1;grid-row:2;padding:0;gap:12px}.mr-case>.mr-source{grid-column:2;grid-row:2;padding:0;border:0;align-self:center;max-width:310px;flex-wrap:wrap}.mr-case>.mr-source .mr-reference{width:100%;padding-left:34px}.mr-case:has(>.mr-listing)>.mr-actions{grid-column:1/-1}.mr-case:has(>.mr-listing)>.mr-case-heading{grid-column:1/-1}.mr-case-list{gap:8px;padding:10px}.mr-price{margin-top:4px}
@media(max-width:900px){.mr-case{grid-template-columns:minmax(0,1fr);gap:8px;padding:12px}.mr-case-heading,.mr-facts,.mr-context,.mr-policy,.mr-evidence,.mr-actions,.mr-listing,.mr-case>.mr-source{grid-column:1;grid-row:auto}.mr-facts{justify-content:flex-start;gap:5px 14px}.mr-facts>span{flex-direction:row;gap:5px;font-size:10px}.mr-evidence>summary{min-height:40px}.mr-actions{justify-self:stretch;justify-content:flex-end}.mr-actions>button{flex:0 1 auto;min-height:42px}.mr-case>.mr-source{max-width:none;flex-wrap:nowrap}.mr-case>.mr-source .mr-reference{width:auto;padding:0}.mr-case:has(>.mr-listing)>.mr-actions{grid-column:1}.mr-case:has(>.mr-listing)>.mr-case-heading{grid-column:1}}
.moderation-panel{border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}.moderation-panel .mr-case-list{gap:0;padding:0}.moderation-panel .mr-case{border:0;border-bottom:1px solid var(--mc-line);border-radius:0;background:transparent;box-shadow:none;padding:18px 0;overflow:visible}.moderation-panel .mr-case:last-child{border-bottom:0}.moderation-panel .moderation-ban-list{gap:0;padding:0}.moderation-panel .moderation-ban-row{border:0!important;border-bottom:1px solid var(--mc-line)!important;border-radius:0;background:transparent;box-shadow:none;padding:16px 0!important}.moderation-panel .moderation-ban-row:last-child{border-bottom:0!important}.moderation-panel .moderation-history-entry{background:transparent;border:0;border-bottom:1px solid var(--mc-line);border-radius:0;box-shadow:none;padding:16px 0!important}.moderation-panel .moderation-pagination{padding-left:0;padding-right:0}.moderation-panel .mr-evidence-item{background:var(--mc-soft)}@media(max-width:719px){.moderation-panel .mr-case{padding:16px 0}.moderation-panel .moderation-ban-row{padding:16px 0!important}}

.moderation-page .moderation-heading{padding:8px 0!important;min-height:0!important;border-bottom:1px solid var(--mc-line);gap:12px}.moderation-page .moderation-heading-emblem,.moderation-page .moderation-heading p{display:none}.moderation-page .mc-title{font-size:21px!important;line-height:1.2;margin:0}.moderation-page .moderation-shell{padding-top:8px!important}.moderation-page .moderation-panel{margin-top:14px}.moderation-directory-list{display:grid;gap:14px;padding:8px 0}.moderation-directory-row{border:1px solid var(--mc-line);border-radius:10px;padding:16px;background:var(--mc-bg)}.moderation-category-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;border:1px solid var(--mc-line);border-radius:10px;overflow:hidden;background:var(--mc-line)}.moderation-category-nav>button{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;min-height:48px;padding:10px 14px;background:var(--mc-bg);font-size:13px;font-weight:600;text-align:left;border-bottom:2px solid transparent;transition:background .18s,border-color .18s}.moderation-category-nav>button[aria-pressed=true]{background:var(--mc-soft);border-bottom-color:var(--mc-accent);color:var(--mc-ink)}.moderation-count{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:22px;height:22px;padding:0 5px;border-radius:50%;background:#dc2626;color:white;font-size:10px;font-weight:700}.moderation-section-heading{padding:22px 0 14px}.moderation-section-heading h2{font-size:19px;font-weight:650;margin:0}.moderation-section-heading p{margin:5px 0 0;font-size:12px;line-height:1.6;color:var(--mc-muted)}.moderation-page .moderation-panel .mr-case-list{gap:20px;padding:18px 0}.moderation-page .moderation-panel .mr-case{border:1px solid var(--mc-line);border-left:3px solid var(--mc-accent);border-radius:10px;padding:0;overflow:hidden;background:var(--mc-bg)}.moderation-page .moderation-panel .moderation-ban-list{gap:14px;padding:18px 0}.moderation-page .moderation-panel .moderation-ban-row{border:1px solid var(--mc-line)!important;border-radius:10px;background:var(--mc-bg);padding:16px!important}.moderation-page .moderation-history-table tbody tr:nth-child(even){background:var(--mc-soft)}.moderation-page .moderation-panel .moderation-history-entry{border:1px solid var(--mc-line);border-left:3px solid var(--mc-accent);border-radius:10px;background:var(--mc-bg);margin-top:14px}.moderation-page .mc-query-bar{padding-bottom:16px;margin-bottom:4px}@media(max-width:680px){.moderation-category-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.moderation-category-nav>button{padding:10px 12px;font-size:12px}.moderation-section-heading{padding-top:18px}.moderation-page .moderation-panel .mr-case-list{gap:16px}}@media(prefers-reduced-motion:reduce){.moderation-category-nav>button{transition:none}}
      `}</style>
      <div className="moderation-shell mc-shell w-full px-3 pt-4 sm:px-6 lg:pt-6">
        <div className="moderation-heading flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${isLightMode
            ? "border-black/10 bg-white text-zinc-700 shadow-sm hover:bg-zinc-100"
            : "border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09]"}`}>
            <ArrowLeft size={19}/>
          </button>
          <div className={`moderation-heading-emblem flex h-10 w-10 items-center justify-center rounded-xl border ${isLightMode
            ? "border-[#8a6a00]/25 bg-[#c89d13]/15 text-[#725700]"
            : "border-[#FFD54A]/30 bg-[#FFD54A]/10 text-[#FFD54A]"}`}>
            <Shield size={20}/>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="mc-title">Moderation</h1>
            <p className={`text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
              <span className="lg:hidden">Reports, strikes, bans, and activity</span><span className="hidden lg:inline">Review reports, strikes, bans, and moderator activity</span>
            </p>
          </div>
        </div>
        {successMessage && (<div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${isLightMode
                ? "border-emerald-600/25 bg-emerald-50 text-emerald-700"
                : "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300"}`}>
            {successMessage}
          </div>)}
        {errorMessage && (<div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${isLightMode
                ? "border-red-600/25 bg-red-50 text-red-700"
                : "border-red-400/25 bg-red-400/[0.08] text-red-300"}`}>
            {errorMessage}
          </div>)}
        <div ref={listPanelRef} className="moderation-panel mt-6 min-w-0">
          <nav className="moderation-category-nav" aria-label="Moderation sections">{([
            ["appeals", "English appeals"], ["conversations", "Conversations"], ["account_reports", "Reports"], ["strikes", "Strikes"],
            ["active", "English bans"], ["discord", "Discord users"], ["frames", "Frame restrictions"], ["history", "History"],
          ] as const).map(([view,label]) => <button key={view} type="button" aria-pressed={currentView === view} onClick={() => { setSearchQuery(""); setHistoryAction("all"); setPageByView(pages => ({ ...pages, [view]: 1 })); if (view === "history") void openHistory(); else setCurrentView(view); }}><span>{label}</span>{Number(categoryCounts[view] ?? 0) > 0 && <span className="moderation-count" aria-label={`${categoryCounts[view]} unread notifications`}>{categoryCounts[view] > 99 ? "99+" : categoryCounts[view]}</span>}</button>)}</nav>
          <header className="moderation-section-heading"><h2>{({ active:"English leaderboard bans", account_reports:"Reports", strikes:"Strikes", history:"Moderation history", discord:"Discord directory", frames:"Frame restrictions", appeals:"English appeals", conversations:"Conversations" })[currentView]}</h2><p>{currentView === "conversations" ? "Read and reply to collectors. Appeal decisions can be completed here." : currentView === "appeals" ? "Pending appeals and completed decisions." : currentView === "frames" ? "Review restricted frames and reinstate access." : currentView === "discord" ? "Search collectors and manage trading access." : currentView === "history" ? "Staff actions, most recent first." : currentView === "strikes" ? "Review unanswered trade offers." : currentView === "account_reports" ? "Review collector reports and listing concerns." : "Manage English leaderboard access."}</p></header>
          <div className="mc-query-bar"><label><Search size={16}/><input data-mc-search type="search" value={searchQuery} onChange={event => { setSearchQuery(event.target.value); setPageByView(pages => ({ ...pages, [currentView]: 1 })); }} maxLength={isDirectoryView || currentView === "appeals" ? 200 : undefined} placeholder={currentView === "conversations" ? "Search conversations by collector or Discord username" : currentView === "appeals" ? "Search appeals by collector, Discord, or message" : currentView === "discord" ? "Search site username, Discord username, or user ID" : currentView === "frames" ? "Search site username, Discord username, user ID, or frame ID" : currentView === "history" ? "Search moderator, collector, action, or reason" : currentView === "active" ? "Find an excluded collector" : "Search accounts or reports"} aria-label="Search current moderation queue"/><kbd>/</kbd></label>{currentView === "history" && <select aria-label="Filter audit action" value={historyAction} onChange={event => { setHistoryAction(event.target.value); setPageByView(pages => ({ ...pages, history: 1 })); }}><option value="all">All actions</option>{Array.from(new Set(historyItems.map(item => item.action))).map(action => <option key={action} value={action}>{getHistoryActionTitle(historyItems.find(item => item.action === action)!)}</option>)}</select>}<button type="button" onClick={refreshWorkspace} disabled={pageLoading}><RefreshCw size={15} className={pageLoading ? "animate-spin" : ""}/><span>Refresh queue</span></button></div>
          {currentView === "conversations" ? <><StaffConversations key={location.search.replace(/[?&]review=[^&]*/, "")} moderator search={searchQuery} refresh={appealRefresh} onOpenAppeal={id => setReviewAppealId(id)}/><EnglishLeaderboardAppealQueue search="" refresh={appealRefresh} onChanged={appealChanged} reviewOnly reviewAppealId={reviewAppealId} onCloseReview={closeAppealReview}/></> : currentView === "appeals" ? <EnglishLeaderboardAppealQueue search={searchQuery} refresh={appealRefresh} onChanged={appealChanged} onOpenReview={appeal => { setSearchQuery(""); navigate(`/leaderboard-moderation?view=conversations&user=${encodeURIComponent(appeal.user_id)}&review=${encodeURIComponent(appeal.id)}`); }}/> : isDirectoryView ? <div className="py-4">
            <p className="mb-4 text-sm text-muted-foreground">{currentView === "discord" ? "Find any collector with a Discord username. Revoking removes the username and blocks trade and sale access until reinstated." : "Each row is one revoked frame. Reinstating restores only that frame and applies a moderator override."}</p>
            {pageLoading ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">Loading {currentView === "discord" ? "Discord users" : "frame restrictions"}...</p> : directoryError ? <p role="alert" className="py-6 text-sm text-red-500">{directoryError}<button type="button" onClick={() => setDirectoryRefresh(value => value + 1)} className="ml-2 underline">Retry</button></p> : directoryResult.rows.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">{normalizedSearch ? "No users match this search." : currentView === "frames" ? "No frame restrictions are active." : "No collectors have a Discord username."}</p> : <ul className="moderation-directory-list">{directoryResult.rows.map(row => <li key={`${row.user_id}:${row.frame_id ?? "discord"}`} className="moderation-directory-row flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-wrap items-center gap-4">{currentView === "frames" && <ModerationFramePreview frameId={row.frame_id} isLightMode={isLightMode}/>}<div className="min-w-0 flex-1"><h3 className="break-words text-base font-semibold">{row.username}</h3>{row.discord_username && <p className="mt-1 break-all text-sm text-muted-foreground">Discord: {row.discord_username}</p>}{currentView === "frames" && <><FrameRestrictionReason frameId={row.frame_id}/><p className="mt-2 text-xs text-muted-foreground">Revoked {row.revoked_at ? new Date(row.revoked_at).toLocaleString() : "date unavailable"}</p></>}</div></div>
              <button type="button" disabled={directorySaving} onClick={() => { setDirectoryTarget({ mode: currentView as "discord" | "frames", row }); setDirectoryReason(""); setDirectoryActionError(""); }} className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50 ${currentView === "discord" ? "border-red-500/30 text-red-500" : "border-current/20"}`}>{currentView === "discord" ? "Revoke Discord access" : "Reinstate frame"}</button>
            </li>)}</ul>}
          </div> : currentView === "active" ? (<>
              {loading ? (<div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  <Loader2 className="h-4 w-4 animate-spin"/>
                  Loading leaderboard bans...
                </div>) : bans.length === 0 ? (<div className="px-5 py-14 text-center">
                  <Shield className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}/>
                  <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                    No active leaderboard bans
                  </p>
                </div>) : filteredBans.length === 0 ? (<div className="px-5 py-14 text-center">
                  <Search className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}/>
                  <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                    No matching usernames
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Try a different search.
                  </p>
                </div>) : (<div className="moderation-ban-list">
                  {pagedBans.map((ban, index) => (<div key={ban.userId} className={`moderation-ban-row flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${index !== pagedBans.length - 1
                        ? isLightMode
                            ? "border-b border-black/[0.07]"
                            : "border-b border-white/[0.07]"
                        : ""}`}>
                      <div className="min-w-0">
                        <p className={`truncate font-semibold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                          {ban.username}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Banned {new Date(ban.createdAt).toLocaleString()}
                        </p>
                        <p className="mr-ban-reason"><strong>Reason: </strong>{ban.reason || "No reason was recorded for this exclusion."}</p>
                      </div>
                      <button type="button" onClick={() => {
                        setErrorMessage("");
                        setSelectedBan(ban);
                    }} className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${isLightMode
                        ? "border-[#8a6a00]/25 bg-[#c89d13]/10 text-[#725700] hover:border-[#8a6a00]/50 hover:bg-[#c89d13]/20"
                        : "border-[#FFD54A]/25 bg-[#FFD54A]/10 text-[#FFD54A] hover:border-[#FFD54A]/50 hover:bg-[#FFD54A]/15"}`}>
                        <MoreVertical size={15}/>
                        <span className="lg:hidden">Review ban</span><span className="hidden lg:inline">MODERATOR ACTIONS</span>
                      </button>
                    </div>))}
                </div>)}
            </>) : currentView === "account_reports" || currentView === "strikes" ? (reportsLoading ? (<div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                <Loader2 className="h-4 w-4 animate-spin"/>
                Loading {currentView === "strikes" ? "strikes" : "reports"}...
              </div>) : (currentView === "strikes" ? struckAccounts.length === 0 : reportedAccounts.length === 0 && searchedCardReports.length === 0) ? (<div className="px-5 py-14 text-center">
                <Shield className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}/>
                <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                  {currentView === "strikes" ? "No active strikes" : "No unresolved reports"}
                </p>
              </div>) : (<div className="mr-case-list">
                {currentView === "account_reports" && pagedCardReports.map(report => <article key={`card-${report.id}`} className="mr-case">
                  <header className="mr-case-heading"><div className="mr-person"><CardImage src={report.reportedAvatar} alt=""/><div><span className="mr-label">LISTING REPORT</span><h3>{report.reportedUsername}</h3></div></div><span className="mr-status">Awaiting review</span></header>
                  <div className="mr-listing"><ReportedCardThumbnail setId={report.setId} cardKey={report.cardKey}/><div><h4>{getModerationSetName(report.setId)}</h4><code>{getModerationCardCode(report.setId, report.cardKey)}</code><span className="mr-price">${report.reportedPrice.toFixed(2)}<span>reported listing price</span></span></div></div>
                  <div className="mr-source"><CardImage src={report.reporterAvatar} alt=""/><div><span>Reported by <strong>{report.reporterUsername}</strong></span><time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString()}</time></div><span className="mr-reference">Report #{report.id}</span></div>
                  <footer className="mr-actions"><button type="button" className="mr-secondary" onClick={() => setDismissTarget({ kind: "card", id: report.id, username: report.reportedUsername })}>Dismiss report</button><button type="button" className="mr-danger" onClick={() => { setWarningTarget(report); setWarningMode("template"); setSuggestedPrice(""); setCustomExplanation(""); setWarningError(""); }}>Review removal and warning</button></footer>
                </article>)}
                {pagedAccountReports.map(report => <article key={report.userId} className="mr-case">
                  <header className="mr-case-heading"><div className="mr-person"><CardImage src={report.avatar} alt=""/><div><span className="mr-label">{currentView === "strikes" ? "OFFER RESPONSE RECORD" : "ACCOUNT REPORTS"}</span><h3>{report.username}</h3></div></div><span className={`mr-status ${report.tradeAccessRevoked ? "mr-revoked" : ""}`}>{report.tradeAccessRevoked ? "Access revoked" : "Access active"}</span></header>
                  <div className="mr-facts"><span><strong>{report.reports.length}</strong>account reports</span><span><strong>{report.expiredOffers.length}</strong>uncleared expirations</span><span><strong>{report.reports.filter(item => item.wantsStaffContact && !item.contactedAt).length}</strong>contact requests pending</span></div>
                  <p className="mr-context">{report.tradeAccessRevoked ? "Trading and selling access is currently revoked. Review the evidence before considering reinstatement." : currentView === "strikes" ? `${report.expiredOffers.length} unanswered offer ${report.expiredOffers.length === 1 ? "expiration is" : "expirations are"} recorded. The current access status is shown above.` : report.reports.length >= 3 ? "Three or more reports are recorded. Review the individual evidence before deciding on access." : "Review each report on its merits. The report count alone does not establish misconduct."}</p>
                  {currentView === "strikes" && <button type="button" className="mr-policy" onClick={() => setShowOfferStrikeInfo(true)}>How offer-response strikes work</button>}
                  <details className="mr-evidence"><summary><span>Review evidence</span><span>{currentView === "strikes" ? `${report.expiredOffers.length} expired offers` : `${report.reports.length} reports`}</span><ChevronDown size={15}/></summary><div className="mr-evidence-list">
                    {currentView === "strikes" ? report.expiredOffers.map(offer => <div key={offer.id} className="mr-evidence-item"><div className="mr-source"><CardImage src={offer.senderAvatar} alt=""/><div><strong>Offer from {offer.senderUsername}</strong><time dateTime={offer.expiredAt}>Expired {new Date(offer.expiredAt).toLocaleString()}</time></div><span className="mr-reference">#{offer.id}</span></div><p>{getModerationSetName(offer.targetSetId)}</p><code>{getModerationCardCode(offer.targetSetId, offer.targetCardKey)}</code></div>) : report.reports.map(item => <div key={item.id} className="mr-evidence-item"><div className="mr-source"><CardImage src={item.reporterAvatar} alt=""/><div><strong>{item.reporterUsername}</strong><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div><span className="mr-reference">Report #{item.id}</span></div><p className="mr-comment">{item.comment || "No written comment supplied."}</p>{item.wantsStaffContact && <span className="mr-contact-status">{item.contactedAt ? `Staff contact recorded ${new Date(item.contactedAt).toLocaleString()}` : "Reporter requested staff contact"}</span>}<div className="mr-evidence-actions"><button type="button" className="mr-secondary" onClick={() => setSelectedReportComment(item)}>Full report and contact details</button><button type="button" className="mr-secondary" onClick={() => setDismissTarget({ kind: "profile", id: item.id, username: report.username })}>Dismiss this report</button></div></div>)}
                  </div></details>
                  {(currentView === "account_reports" || report.tradeAccessRevoked) && <footer className="mr-actions"><span>Account-level decision</span><button type="button" className={report.tradeAccessRevoked ? "mr-secondary" : "mr-danger"} onClick={() => setSelectedAccountReport(report)}>{report.tradeAccessRevoked ? "Review reinstatement" : "Review access action"}</button></footer>}
                </article>)}
              </div>)) : historyLoading ? (<div className={`flex items-center justify-center gap-2 px-5 py-14 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
              <Loader2 className="h-4 w-4 animate-spin"/>
              Loading moderation history...
            </div>) : filteredHistory.length === 0 ? (<div className="px-5 py-14 text-center">
              <History className={`mx-auto h-9 w-9 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}/>
              <p className={`mt-3 font-medium ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>
                {normalizedSearch || historyAction !== "all" ? "No actions match these filters" : "No moderation history yet"}
              </p>
            </div>) : (<div>
              <div className="moderation-history-desktop">
                <table className="moderation-history-table">
                  <caption className="sr-only">Moderation history, most recent first</caption>
                  <colgroup>
                    <col style={{ width: "25%" }}/>
                    <col style={{ width: "29%" }}/>
                    <col style={{ width: "25%" }}/>
                    <col style={{ width: "21%" }}/>
                  </colgroup>
                  <thead className={isLightMode ? "bg-zinc-50 text-zinc-600" : "bg-white/[0.025] text-zinc-400"}>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Action</th>
                      <th scope="col">Moderator</th>
                      <th scope="col">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedHistoryItems.map((item) => (<tr key={item.id} className={isLightMode ? "border-t border-black/[0.07]" : "border-t border-white/[0.07]"}>
                        <td>
                          <div className="moderation-history-person">
                            <div className="moderation-history-avatar">
                              <CardImage src={item.targetAvatar} alt="" className="h-full w-full rounded-full object-cover"/>
                            </div>
                            <span className="min-w-0 break-words font-semibold">{item.targetUsername}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`moderation-history-action ${["trading_access_revoked", "leaderboard_eligibility_revoked", "leaderboard_user_banned"].includes(item.action) ? (isLightMode ? "bg-red-50 text-red-700" : "bg-red-500/10 text-red-300") : (isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-300")}`}>
                            {getHistoryActionTitle(item)}
                          </span>
                          {item.details && <p className="mt-2 max-w-md whitespace-pre-wrap break-words text-xs leading-5 opacity-80"><strong>Reason / details: </strong>{item.details}</p>}
                        </td>
                        <td>
                          <div className="moderation-history-person">
                            <div className="moderation-history-avatar">
                              <CardImage src={item.moderatorAvatar} alt="" className="h-full w-full rounded-full object-cover"/>
                            </div>
                            <span className="min-w-0 break-words font-medium">{item.moderatorUsername}</span>
                            <Shield size={14} className={`shrink-0 ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`} aria-label="Moderator"/>
                          </div>
                        </td>
                        <td>
                          <time dateTime={item.createdAt} className="block text-xs leading-5 tabular-nums">
                            <span className="block">{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span className={`block ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>{new Date(item.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                          </time>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
              <div className="moderation-history-mobile">
                {pagedHistoryItems.map((item) => (<article key={item.id} className={`moderation-history-entry px-4 py-4 ${isLightMode ? "border-t border-black/[0.07]" : "border-t border-white/[0.07]"}`}>
                    <div className="moderation-history-person">
                      <div className="moderation-history-avatar">
                        <CardImage src={item.moderatorAvatar} alt="" className="h-full w-full rounded-full object-cover"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                          <span className="break-words">{item.moderatorUsername}</span>
                          <Shield size={14} className={isLightMode ? "text-[#725700]" : "text-[#FFD54A]"} aria-label="Moderator"/>
                        </p>
                        <p className={`mt-1 text-sm leading-5 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>{getHistoryActionTitle(item)}</p>
                        {item.details && <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 opacity-80"><strong>Reason / details: </strong>{item.details}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs leading-5">
                      <div className="moderation-history-avatar">
                        <CardImage src={item.targetAvatar} alt="" className="h-full w-full rounded-full object-cover"/>
                      </div>
                      <span className="min-w-0 flex-1 break-words font-semibold">{item.targetUsername}</span>
                      <time dateTime={item.createdAt} className={`shrink-0 text-right ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        <span className="block">{new Date(item.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                      </time>
                    </div>
                  </article>))}
              </div>
            </div>)}
          {!pageLoading && totalItems > 0 && (<nav aria-label="List pagination" className={`moderation-pagination border-t ${isLightMode ? "border-black/10" : "border-white/10"}`}>
              <p aria-live="polite" className={`moderation-pagination-summary text-xs ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Showing {pageStart + 1}-{Math.min(pageEnd, totalItems)} of {totalItems}
              </p>
              <div className="moderation-pagination-controls">
                <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-200"}`}>
                  <ChevronLeft size={16} aria-hidden="true"/> Previous
                </button>
                <span className="whitespace-nowrap text-xs tabular-nums">Page {currentPage} of {totalPages}</span>
                <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-200"}`}>
                  Next <ChevronRight size={16} aria-hidden="true"/>
                </button>
              </div>
            </nav>)}
        </div>
      </div>
      {selectedReportComment && (<div className="moderation-modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => !markingContacted && setSelectedReportComment(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-comment-title" onClick={(event) => event.stopPropagation()} className={`moderation-modal-panel max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border p-4 sm:p-6 shadow-2xl ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}>
            <div className="moderation-modal-body">
            <div className="flex items-center gap-3">
              <CardImage src={selectedReportComment.reporterAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover"/>
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {selectedReportComment.reporterUsername}
                </p>
                <p className="text-xs text-zinc-500">
                  Reported on{" "}
                  {new Date(selectedReportComment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <h2 id="report-comment-title" className="mt-5 text-lg font-bold">
              Reporter comment
            </h2>
            <div className={`mt-2 whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.05] text-zinc-300"}`}>
              {selectedReportComment.comment ||
                "No comment was included with this report."}
            </div>
            {selectedReportComment.wantsStaffContact && (<div className={`mt-4 rounded-xl border px-4 py-3 ${isLightMode ? "border-[#5865F2]/20 bg-[#5865F2]/[0.07]" : "border-[#5865F2]/30 bg-[#5865F2]/10"}`}>
                <p className="text-sm font-semibold">
                  This reporter asked to be contacted on Discord.
                </p>
                <p className="mt-1 text-base font-bold text-[#5865F2]">
                  {selectedReportComment.contactDiscordUsername}
                </p>
                {selectedReportComment.contactedAt ? (<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span>Contacted by</span>
                    {selectedReportComment.contactedByAvatar && (<CardImage src={selectedReportComment.contactedByAvatar} alt="" className="h-7 w-7 rounded-full object-cover"/>)}
                    <span className="break-words font-semibold">
                      {selectedReportComment.contactedByUsername || "Moderator"}
                    </span>
                    <span className="text-zinc-500">
                      on{" "}
                      {new Date(selectedReportComment.contactedAt).toLocaleString()}
                    </span>
                  </div>) : (<button type="button" onClick={markReporterContacted} disabled={markingContacted} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                    {markingContacted && (<Loader2 className="h-4 w-4 animate-spin"/>)}
                    Has this user been contacted?
                  </button>)}
              </div>)}
            </div>
            <div className="moderation-modal-footer">
            <button type="button" onClick={() => setSelectedReportComment(null)} disabled={markingContacted} className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold ${isLightMode ? "bg-zinc-100 text-zinc-700" : "bg-white/[0.06] text-zinc-300"}`}>
              Close
            </button>
            </div>
          </div>
        </div>)}
      {selectedAccountReport && (<div className="moderation-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-label="Account moderation actions" className={`moderation-modal-panel max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border p-4 sm:p-6 shadow-2xl ${isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-[#151718]"}`}>
            <div className="moderation-modal-body">
            <div className="flex items-center gap-3">
              <CardImage src={selectedAccountReport.avatar} alt="" className="h-12 w-12 rounded-full object-cover"/>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                  Moderator Actions
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {selectedAccountReport.username}
                </h2>
              </div>
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              {selectedAccountReport.tradeAccessRevoked
                ? "Reinstating this user restores trading and sale access, unlocks their Discord username, and clears account reports and expired-offer strikes."
                : "Three reports are recommended, but moderators may act earlier when the report details justify it. Revoking removes their Discord username, removes them from all public views, and prevents them from editing their Discord username until a moderator restores access."}
            </p>
            </div>
            <div className="moderation-modal-footer">
            <button type="button" onClick={async () => {
                if (selectedAccountReport.tradeAccessRevoked) {
                    await restoreTradingAccess(selectedAccountReport);
                }
                else {
                    await revokeTradingAccess(selectedAccountReport);
                    setSelectedAccountReport(null);
                }
            }} disabled={Boolean(revokingUserId)} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 ${selectedAccountReport.tradeAccessRevoked ? "bg-violet-500" : "bg-red-500"}`}>
              {revokingUserId ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<UserX size={17}/>)}
              {selectedAccountReport.tradeAccessRevoked
                ? "REINSTATE PUBLIC ACCESS"
                : "REVOKE PUBLIC ACCESS"}
            </button>
            <button type="button" onClick={() => setSelectedAccountReport(null)} disabled={Boolean(revokingUserId)} className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold ${isLightMode
                ? "bg-zinc-100 text-zinc-700"
                : "bg-white/[0.06] text-zinc-300"}`}>
              Cancel
            </button>
            </div>
          </div>
        </div>)}
      {warningTarget && (<div className="moderation-modal-overlay listing-warning-overlay fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
          <form onSubmit={(event) => { event.preventDefault(); void removeListingAndWarn(); }} role="dialog" aria-modal="true" aria-labelledby="listing-warning-title" className={`listing-warning-editor w-full max-w-md rounded-2xl border shadow-2xl ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}>
            <div className="listing-warning-editor-heading">
              <h2 id="listing-warning-title" className="text-base font-bold">Remove listing and warn user</h2>
            </div>
            <div className="listing-warning-editor-body">
              <div className="listing-warning-card-summary flex items-center gap-3">
                <ReportedCardThumbnail setId={warningTarget.setId} cardKey={warningTarget.cardKey}/>
                <div className="min-w-0 break-words text-sm">
                  <p className="font-semibold">{warningTarget.reportedUsername}</p>
                  <p className="break-all font-mono text-xs sm:text-sm">{getModerationCardCode(warningTarget.setId, warningTarget.cardKey)}</p>
                  <p className="mt-1 text-xs text-red-500 sm:text-sm">Reported price: ${warningTarget.reportedPrice.toFixed(2)}</p>
                </div>
              </div>
              <label className="mt-3 block text-xs font-semibold" htmlFor="suggested-card-price">Typical price or range (USD)</label>
              <input id="suggested-card-price" value={suggestedPrice} onChange={(event) => setSuggestedPrice(event.target.value)} disabled={sendingWarning} required maxLength={100} placeholder="$5.00 - $10.00" className="mt-1.5 w-full rounded-xl border border-zinc-500/30 bg-transparent px-3 py-2 text-base"/>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" disabled={sendingWarning} onClick={() => setWarningMode("template")} aria-pressed={warningMode === "template"} className={`rounded-xl border px-2 py-2 text-xs font-semibold ${warningMode === "template" ? "border-red-500 bg-red-500/10" : "border-zinc-500/30"}`}>Prewritten message</button>
                <button type="button" disabled={sendingWarning} onClick={() => setWarningMode("custom")} aria-pressed={warningMode === "custom"} className={`rounded-xl border px-2 py-2 text-xs font-semibold ${warningMode === "custom" ? "border-red-500 bg-red-500/10" : "border-zinc-500/30"}`}>Write my own</button>
              </div>
              {warningMode === "custom" ? <>
                <label htmlFor="listing-warning-explanation" className="mt-3 block text-xs font-semibold sm:text-sm">Explanation of the card's true price range</label>
                <textarea id="listing-warning-explanation" required maxLength={5000} rows={3} disabled={sendingWarning} value={customExplanation} onChange={(event) => setCustomExplanation(event.target.value)} className="listing-warning-custom-message mt-1.5 w-full rounded-xl border border-zinc-500/30 bg-transparent p-3 text-base"/>
              </> : <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold opacity-70">Message preview</p>
                <div tabIndex={0} role="region" aria-label="Prewritten warning message preview" className="listing-warning-message-preview whitespace-pre-wrap break-words rounded-xl bg-red-500/10 p-3">{warningMessage}</div>
              </div>}
              <p className="mt-3 text-xs leading-4 opacity-70">The sale listing will be removed. The warning stays in inbox history.</p>
              {warningError && <p role="alert" className="mt-2 text-xs text-red-500 sm:text-sm">{warningError}</p>}
            </div>
            <div className="listing-warning-editor-footer">
              <button type="button" disabled={sendingWarning} onClick={() => setWarningTarget(null)} className="rounded-xl border border-zinc-500/30 px-3 py-2 text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={sendingWarning || !suggestedPrice.trim() || !warningMessage.trim()} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{sendingWarning ? "Removing..." : "Remove and warn"}</button>
            </div>
          </form>
        </div>)}
      {dismissTarget && (<div className="moderation-modal-overlay fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div role="alertdialog" aria-modal="true" aria-labelledby="dismiss-report-title" className={`moderation-modal-panel w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#151718]"}`}>
            <h2 id="dismiss-report-title" className="text-xl font-bold">Are you sure you want to dismiss this?</h2>
            <p className={`mt-3 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              This {dismissTarget.kind === "profile" ? "profile" : "card"} report for {dismissTarget.username} will leave the active reports list. The dismissal will appear in History.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" disabled={dismissing} onClick={() => setDismissTarget(null)} className={`min-h-11 flex-1 rounded-xl px-4 font-semibold ${isLightMode ? "bg-zinc-100 text-zinc-800" : "bg-white/[0.08] text-white"}`}>Cancel</button>
              <button type="button" disabled={dismissing} onClick={dismissReport} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 font-bold text-white disabled:opacity-60">
                {dismissing && <Loader2 className="h-4 w-4 animate-spin"/>}Dismiss
              </button>
            </div>
          </div>
        </div>)}
      {showOfferStrikeInfo && (<div className="moderation-modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    setShowOfferStrikeInfo(false);
                }
            }}>
          <div role="dialog" aria-modal="true" aria-labelledby="moderation-offer-strikes-title" className={`moderation-modal-panel max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border p-5 shadow-2xl ${isLightMode ? "border-black/10 bg-white text-zinc-900" : "border-white/10 bg-[#151718] text-white"}`}>
            <div className="moderation-modal-body">
            <div className="flex items-start justify-between gap-4">
              <h2 id="moderation-offer-strikes-title" className="text-xl font-bold">
                Offer response strikes
              </h2>
              <button type="button" onClick={() => setShowOfferStrikeInfo(false)} aria-label="Close offer strike explanation" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${isLightMode ? "border-black/10 text-zinc-600 hover:bg-zinc-100" : "border-white/10 text-zinc-400 hover:bg-white/[0.06]"}`}>
                <X size={18}/>
              </button>
            </div>
            <div className={`mt-3 space-y-3 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>
              <p>
                A user gains a strike when they receive a trade offer and do not
                accept or decline it within the seven days provided.
              </p>
              <p>
                At three strikes, the account is treated as inactive in the
                Trading Post. Its Discord username and trading privileges are
                removed from public view so active users can continue trading.
              </p>
              <p>
                To be reinstated, the user must open a ticket in the MLPEKAYOU
                Discord server and prove to a staff member that the account is
                active. After reinstatement, the user must set their Discord
                username again in their profile.
              </p>
            </div>
            </div>
            <div className="moderation-modal-footer">
            <button type="button" onClick={() => setShowOfferStrikeInfo(false)} className="mt-5 w-full rounded-xl bg-[#FFD54A] px-4 py-3 text-sm font-bold text-black hover:bg-[#FFE27A]">
              Done
            </button>
            </div>
          </div>
        </div>)}
      {selectedBan && (<div className="moderation-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => !unbanning && setSelectedBan(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="moderator-actions-title" className={`moderation-modal-panel max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border p-4 sm:p-6 shadow-2xl ${isLightMode
                ? "border-black/10 bg-white"
                : "border-white/10 bg-[#151718]"}`} onClick={(event) => event.stopPropagation()}>
            <div className="moderation-modal-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isLightMode ? "text-[#725700]" : "text-[#FFD54A]"}`}>
                  Moderator Actions
                </p>
                <h2 id="moderator-actions-title" className={`mt-1 text-xl font-bold ${isLightMode ? "text-zinc-900" : "text-white"}`}>
                  {selectedBan.username}
                </h2>
              </div>
              <button type="button" onClick={() => setSelectedBan(null)} disabled={unbanning} aria-label="Close moderator actions" className={`flex h-11 w-11 items-center justify-center rounded-xl border ${isLightMode
                ? "border-black/10 text-zinc-600 hover:bg-zinc-100"
                : "border-white/10 text-zinc-400 hover:bg-white/[0.06]"}`}>
                <X size={18}/>
              </button>
            </div>
            </div>
            <div className="moderation-modal-footer">
            <button type="button" onClick={unbanUser} disabled={unbanning} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isLightMode
                ? "border-red-600/30 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"}`}>
              {unbanning ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<UserX size={17}/>)}
              REINSTATE ENGLISH ACCESS
            </button>
            </div>
          </div>
        </div>)}
      <Dialog open={!!directoryTarget} onOpenChange={open => { if (!open && !directorySaveLock.current) setDirectoryTarget(null); }}>
        <DialogContent className="z-[120020] max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto border-border bg-background text-foreground [&>button]:hidden" onEscapeKeyDown={event => { if (directorySaveLock.current) event.preventDefault(); }} onPointerDownOutside={event => { if (directorySaveLock.current) event.preventDefault(); }}>
          <DialogTitle>{directoryTarget?.mode === "discord" ? "Revoke Discord and trading access?" : "Reinstate this frame?"}</DialogTitle>
          <DialogDescription>{directoryTarget?.row.username}{directoryTarget?.row.discord_username ? ` / ${directoryTarget.row.discord_username}` : ""}</DialogDescription>
          {directoryTarget?.mode === "frames" && <div className="flex flex-wrap items-center gap-4"><ModerationFramePreview frameId={directoryTarget.row.frame_id} isLightMode={isLightMode}/><FrameRestrictionReason frameId={directoryTarget.row.frame_id}/></div>}
          <p className="break-words text-sm leading-6">{directoryTarget?.mode === "discord" ? `This removes ${directoryTarget.row.discord_username} and revokes this collector's trade and sale access. Their collection stays saved.` : `This restores access to this frame and prevents collection thresholds from automatically revoking it again. Other frames are unchanged.`}</p>
          <label className="block text-sm font-semibold">Reason for the moderation log<textarea value={directoryReason} onChange={event => setDirectoryReason(event.target.value)} minLength={3} maxLength={1000} disabled={directorySaving} rows={3} className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-base font-normal"/></label>
          {directoryActionError && <p role="alert" className="text-sm text-red-500">{directoryActionError}</p>}
          <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={directorySaving} onClick={() => setDirectoryTarget(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm">Cancel</button><button type="button" disabled={directorySaving || directoryReason.trim().length < 3} onClick={() => void runDirectoryAction()} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{directorySaving ? "Saving..." : directoryTarget?.mode === "discord" ? "Revoke access" : "Reinstate frame"}</button></div>
        </DialogContent>
      </Dialog>
    </div>);
};
export default LeaderboardModeration;
