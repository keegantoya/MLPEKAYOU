import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import {
  CalendarPlus,
  CalendarDays,
  ArrowUpRight,
  History,
  Store as StoreIcon,
} from "lucide-react";
// New tables may not be in your generated Supabase types yet.
const db = supabase as unknown as SupabaseClient;
const DECKS = [
  { id: "APPLEJACK", name: "Applejack", image: "SDAPPLEJACK.webp" },
  { id: "FLUTTERSHY", name: "Fluttershy", image: "SDFLUTTERSHY.webp" },
  { id: "PINKIEPIE", name: "Pinkie Pie", image: "SDPINKIEPIE.webp" },
  { id: "RAINBOWDASH", name: "Rainbow Dash", image: "SDRAINBOWDASH.webp" },
  { id: "RARITY", name: "Rarity", image: "SDRARITY.webp" },
  { id: "TWILIGHT", name: "Twilight Sparkle", image: "SDTWILIGHT.webp" },
] as const;
type DeckId = (typeof DECKS)[number]["id"];
type Staff = {
  user_id: string;
  store_id: string | null;
  role: "STAFF" | "ALLGS";
  active: boolean;
};
type Store = { id: string; name: string };
type LGSEvent = {
  edit_count?: number;
  id: string;
  store_id: string;
  name: string;
  event_date: string;
  league_name: string;
  league_start: string;
  league_end: string;
  notes: string;
  status: "active" | "completed";
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};
type Player = {
  id: string;
  store_id: string;
  name: string;
  external_id: string | null;
};
type Attendance = {
  event_id: string;
  player_id: string;
  player_name: string;
  player_external_id: string | null;
  deck: DeckId | null;
  placement: number | null;
};
type Raffle = {
  id: string;
  event_id: string;
  player_id: string;
  label: string;
  winner_name: string;
  drawn_at: string;
};
type Total = {
  player_id: string;
  player_name: string;
  events_attended: number;
  weeks_attended: number;
};
type Dialog = "new" | "players" | "finish" | "edits" | "player_id" | null;
type EventEdit = {
  id: string;
  editor_user_id: string | null;
  editor_username: string;
  editor_avatar_url: string | null;
  description: string;
  created_at: string;
  changes: Record<
    string,
    { before: string | number | null; after: string | number | null }
  >;
};
const EDIT_FIELDS: Record<string, string> = {
  name: "Event name",
  event_date: "Event date",
  league_name: "League",
  league_start: "League starts",
  league_end: "League ends",
  notes: "Event notes",
  status: "Status",
  player_name: "Player",
  player_external_id: "Player ID",
  deck: "Deck",
  placement: "Placement",
  label: "Raffle",
  winner_name: "Winner",
};
function editValue(field: string, value: string | number | null) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (field === "deck")
    return DECKS.find((deck) => deck.id === value)?.name ?? String(value);
  if (field === "status") return value === "active" ? "Open" : "Completed";
  if (["event_date", "league_start", "league_end"].includes(field))
    return dateLabel(String(value));
  return String(value);
}
function Pagination({
  count,
  page,
  onPage,
  disabled = false,
  label = "Players",
}: {
  count: number;
  page: number;
  onPage: (page: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  const pages = Math.max(1, Math.ceil(count / 10));
  if (count <= 10) return null;
  return (
    <nav className="lgs-pagination" aria-label={`${label} pagination`}>
      <span>
        {(page - 1) * 10 + 1}–{Math.min(page * 10, count)} of {count}
      </span>
      <div>
        <button
          type="button"
          className="lgs-secondary"
          disabled={disabled || page === 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          type="button"
          className="lgs-secondary"
          disabled={disabled || page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
function EditRecord({ edit }: { edit: EventEdit }) {
  const added = edit.description.startsWith("Checked in ");
  const removed = edit.description.startsWith("Removed ");
  const player =
    edit.description.startsWith("Updated ") &&
    edit.description !== "Updated the event" &&
    edit.description !== "Updated a raffle result"
      ? edit.description.slice(8)
      : "";
  const fields = Object.entries(edit.changes).filter(
    ([field]) => !(field === "status" && Object.keys(edit.changes).length > 1),
  );
  return (
    <article className="lgs-edit-record">
      <div className="lgs-edit-author">
        <EditorAvatar edit={edit} />
        <div>
          <strong>{edit.editor_username}</strong>
          <time dateTime={edit.created_at}>
            {new Date(edit.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </div>
      </div>
      {(added || removed || fields.length === 0) && (
        <p className="lgs-edit-description">{edit.description}.</p>
      )}
      <div className="lgs-edit-sentences">
        {fields.map(([field, change]) => {
          const before = editValue(field, change.before);
          const after = editValue(field, change.after);
          if (field === "player_name" && (added || removed)) return null;
          if (field === "notes")
            return (
              <div className="lgs-note-change" key={field}>
                <p>
                  <strong>Changed the event notes.</strong>
                </p>
                <div>
                  <span>Previously</span>
                  <p>{before}</p>
                </div>
                <div>
                  <span>Saved notes</span>
                  <p>{after}</p>
                </div>
              </div>
            );
          if (field === "status") return <p key={field}>{edit.description}.</p>;
          if (added || removed)
            return (
              <p key={field}>
                {EDIT_FIELDS[field] ?? field}:{" "}
                <strong>{removed ? before : after}</strong>.
              </p>
            );
          if (
            field === "winner_name" &&
            edit.description === "Drew a raffle winner"
          )
            return (
              <p key={field}>
                Selected <strong>{after}</strong> as the raffle winner.
              </p>
            );
          if (field === "label" && edit.description === "Drew a raffle winner")
            return (
              <p key={field}>
                Raffle: <strong>{after}</strong>.
              </p>
            );
          const label =
            field === "deck" && player
              ? `${player}’s deck`
              : field === "placement" && player
                ? `${player}’s placement`
                : field === "player_external_id" && player
                  ? `${player}’s Player ID`
                  : (EDIT_FIELDS[field] ?? field).toLowerCase();
          if (change.before === null || change.before === "")
            return (
              <p key={field}>
                Set {label} to <strong>{after}</strong>.
              </p>
            );
          if (change.after === null || change.after === "")
            return (
              <p key={field}>
                Cleared {label}. Previously <strong>{before}</strong>.
              </p>
            );
          return (
            <p key={field}>
              Changed {label} from <strong>{before}</strong> to{" "}
              <strong>{after}</strong>.
            </p>
          );
        })}
      </div>
    </article>
  );
}
function EditorAvatar({ edit }: { edit: EventEdit }) {
  const { avatar } = getProfileAssets({
    id: edit.editor_user_id ?? undefined,
    avatar_url: edit.editor_avatar_url ?? undefined,
  });
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className="lgs-editor-avatar">
      {avatar && failed !== avatar ? (
        <img
          src={avatar}
          alt={`${edit.editor_username}’s profile`}
          onError={() => setFailed(avatar)}
        />
      ) : (
        <span aria-label={edit.editor_username}>
          {edit.editor_username.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}
const PAGE_SIZE = 12;
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(value: string, days: number) {
  const d = new Date(`${value}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function errorMessage(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "Something went wrong. Please try again.";
}
function deckImage(id: DeckId) {
  return `/starter-decks-boxes/SD${id}.webp`;
}
// Explicit pagination keeps rosters and attendance from silently stopping at 1,000 rows.
async function fetchAll<T>(
  table: string,
  order: string,
  filter: Record<string, string> = {},
): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = db
      .from(table)
      .select("*")
      .order(order)
      .order("id", { ascending: true });
    // Attendance has a composite primary key, not an id column.
    if (table === "lgs_attendance")
      query = db.from(table).select("*").order(order).order("player_id");
    for (const [key, value] of Object.entries(filter))
      query = query.eq(key, value);
    const { data, error } = await query.range(offset, offset + 499);
    if (error) throw error;
    result.push(...((data ?? []) as unknown as T[]));
    if (!data || data.length < 500) return result;
  }
}
async function fetchHistory(
  storeId: string,
  limit: number,
): Promise<LGSEvent[]> {
  const result: LGSEvent[] = [];
  for (let offset = 0; offset <= limit; offset += 500) {
    const end = Math.min(offset + 499, limit);
    let query = db
      .from("lgs_events")
      .select("*")
      .eq("status", "completed")
      .order("event_date", { ascending: false })
      .order("id")
      .range(offset, end);
    if (storeId) query = query.eq("store_id", storeId);
    const { data, error } = await query;
    if (error) throw error;
    result.push(...((data ?? []) as LGSEvent[]));
    if (!data || data.length < end - offset + 1) break;
  }
  return result;
}
function Modal({
  title,
  close,
  children,
  busy = false,
  className = "",
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  busy?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) close();
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [busy, close]);
  return createPortal(
    <div className="lgs-ui lgs-overlay">
      <div
        className={`lgs-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lgs-modal-title"
        tabIndex={-1}
        ref={ref}
      >
        <div className="lgs-row">
          <h2 id="lgs-modal-title">{title}</h2>
          <button
            type="button"
            className="lgs-quiet"
            onClick={close}
            disabled={busy}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export default function LGSBoards() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeFilter, setStoreFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState<LGSEvent[]>([]);
  const [history, setHistory] = useState<LGSEvent[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [event, setEvent] = useState<LGSEvent | null>(null);
  const eventRef = useRef<string | null>(null);
  const [attendees, setAttendees] = useState<Attendance[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [eventEdits, setEventEdits] = useState<EventEdit[]>([]);
  const [moreEdits, setMoreEdits] = useState(false);
  const [eventActivity, setEventActivity] = useState<EventEdit[]>([]);
  const [moreActivity, setMoreActivity] = useState(false);
  const [auditTarget, setAuditTarget] = useState<LGSEvent | null>(null);
  const auditEventRef = useRef<string | null>(null);
  const [participantPage, setParticipantPage] = useState(1);
  const [totalsPage, setTotalsPage] = useState(1);
  const [rosterPage, setRosterPage] = useState(1);
  const [idPlayer, setIdPlayer] = useState<Attendance | null>(null);
  const [idDraft, setIdDraft] = useState("");
  const [deckPlayer, setDeckPlayer] = useState<Attendance | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerExternalId, setPlayerExternalId] = useState("");
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [entryDeck, setEntryDeck] = useState<DeckId | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [eventStoreId, setEventStoreId] = useState("");
  const resetPlayerEntry = () => {
    setPlayerSearch("");
    setPlayerExternalId("");
    setSelectedRosterId(null);
    setEntryDeck(null);
  };

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(today);
  const [leagueName, setLeagueName] = useState("");
  const [leagueStart, setLeagueStart] = useState(today);
  const [leagueEnd, setLeagueEnd] = useState(() => addDays(today(), 55));
  const [notes, setNotes] = useState("");
  const [raffleLabel, setRaffleLabel] = useState("");
  const [totals, setTotals] = useState<Total[] | null>(null);
  const [tab, setTab] = useState<"attendance" | "raffles" | "overview">(
    "attendance",
  );
  const requestId = useRef(0);
  const closeDialog = useCallback(() => {
    setDialog(null);
    setDeckPlayer(null);
  }, []);
  const ownStore = stores.find((store) => store.id === staff?.store_id);
  const canCreate = !!staff?.active && staff.role === "STAFF" && !!staff.store_id;
  const canManage =
    canCreate && !!event && event.store_id === staff?.store_id;
  const editable = canManage && event?.status === "active";
  const safeParticipantPage = Math.min(
    participantPage,
    Math.max(1, Math.ceil(attendees.length / 10)),
  );
  const pageAttendees = attendees.slice(
    (safeParticipantPage - 1) * 10,
    safeParticipantPage * 10,
  );
  const filteredRoster = roster.filter((player) =>
    `${player.name} ${player.external_id ?? ""}`
      .toLocaleLowerCase()
      .includes(rosterSearch.trim().toLocaleLowerCase()),
  );
  const safeRosterPage = Math.min(
    rosterPage,
    Math.max(1, Math.ceil(filteredRoster.length / 10)),
  );
  const safeTotalsPage = Math.min(
    totalsPage,
    Math.max(1, Math.ceil((totals?.length ?? 0) / 10)),
  );
  useEffect(() => {
    if (participantPage !== safeParticipantPage)
      setParticipantPage(safeParticipantPage);
  }, [participantPage, safeParticipantPage]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    let mounted = true;
    let authChanged = false;
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_type, session) => {
      authChanged = true;
      if (mounted) setUserId(session?.user.id ?? null);
    });
    db.auth
      .getSession()
      .then(({ data, error: authError }) => {
        if (!mounted || authChanged) return;
        if (authError) setError(authError.message);
        setUserId(data.session?.user.id ?? null);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(errorMessage(err));
          setUserId(null);
        }
      });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const loadBoard = useCallback(async () => {
    const ticket = ++requestId.current;
    if (!userId) {
      setStaff(null);
      setStores([]);
      setActive([]);
      setHistory([]);
      setEvent(null);
      eventRef.current = null;
      setDialog(null);
      setDeckPlayer(null);
      setAttendees([]);
      setRaffles([]);
      setRoster([]);
      setLoading(userId === undefined);
      return;
    }
    setLoading(true);
    try {
      const membership = await db
        .from("lgs_staff")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();
      if (membership.error) throw membership.error;
      if (ticket !== requestId.current) return;
      if (!membership.data) {
        setStaff(null);
        setEvent(null);
        eventRef.current = null;
        setDialog(null);
        setDeckPlayer(null);
        setStores([]);
        setActive([]);
        setHistory([]);
        setAttendees([]);
        setRaffles([]);
        setRoster([]);
        return;
      }
      const member = membership.data as Staff;
      const filter =
        member.role === "ALLGS" ? storeFilter : (member.store_id ?? "");
      const results = await Promise.all([
        fetchAll<Store>("lgs_stores", "name"),
        fetchAll<LGSEvent>("lgs_events", "event_date", {
          status: "active",
          ...(filter ? { store_id: filter } : {}),
        }),
        fetchHistory(filter, historyLimit),
      ]);
      if (ticket !== requestId.current) return;
      setStaff(member);
      setStores(results[0]);
      setActive(results[1].reverse());
      const past = results[2];
      setHistory(past.slice(0, historyLimit));
      setHasMore(past.length > historyLimit);
    } catch (err) {
      if (ticket === requestId.current) setError(errorMessage(err));
    } finally {
      if (ticket === requestId.current) setLoading(false);
    }
  }, [userId, storeFilter, historyLimit]);
  useEffect(() => {
    setStaff(null);
    setEvent(null);
    eventRef.current = null;
    setDialog(null);
    setDeckPlayer(null);
    setAttendees([]);
    setRaffles([]);
    setRoster([]);
    setTotals(null);
    setEventEdits([]);
    setEventActivity([]);
    setAuditTarget(null);
    auditEventRef.current = null;
  }, [userId]);
  useEffect(() => {
    void loadBoard();
    return () => {
      requestId.current++;
    };
  }, [loadBoard]);
  const loadEvent = async (id: string, resetNotes = false) => {
    const result = await db
      .from("lgs_events")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) {
      setEvent(null);
      eventRef.current = null;
      setDialog(null);
      setDeckPlayer(null);
      throw new Error("This event is no longer available to your account.");
    }
    const current = result.data as LGSEvent;
    const [people, winners, savedPlayers] = await Promise.all([
      fetchAll<Attendance>("lgs_attendance", "checked_in_at", { event_id: id }),
      fetchAll<Raffle>("lgs_raffles", "drawn_at", { event_id: id }),
      fetchAll<Player>("lgs_players", "name", { store_id: current.store_id }),
    ]);
    if (eventRef.current !== id) return;
    setEvent(current);
    setAttendees(people);
    setRaffles(winners);
    setRoster(savedPlayers);
    if (resetNotes) {
      setNotes(current.notes);
      setTotals(null);
      setParticipantPage(1);
    }
  };
  const run = async (work: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const openEvent = (id: string) =>
    void run(async () => {
      eventRef.current = id;
      setParticipantPage(1);
      setTab("attendance");
      setPlayerSearch("");
      setRaffleLabel("");
      await loadEvent(id, true);
    });
  const write = async (action: string, data: Record<string, unknown> = {}) => {
    if (!canCreate || (action !== "create_event" && !canManage)) {
      throw new Error("You have view-only access to this event.");
    }
    const { data: result, error: writeError } = await db.rpc("lgs_write", {
      p_action: action,
      p_data: { event_id: eventRef.current, ...data },
    });
    if (writeError) throw writeError;
    return result as { id: string };
  };
  const mutate = (
    action: string,
    data: Record<string, unknown> = {},
    message = "Saved.",
  ) =>
    void run(async () => {
      const result = await write(action, data);
      if (action === "check_in") resetPlayerEntry();
      else closeDialog();
      try {
        await loadEvent(result.id);
        await loadBoard();
      } catch {
        throw new Error(
          "Your change was saved, but the screen could not refresh. Tap Refresh before making another change.",
        );
      }
      if (action === "check_in" || action === "remove_player") setTotals(null);
      setNotice(message);
    });
  const createEvent = (form: FormEvent) => {
    form.preventDefault();
    void run(async () => {
      const result = await write("create_event", {
        store_id: staff?.role === "ALLGS" ? eventStoreId : staff?.store_id,
        name: title.trim(),
        event_date: eventDate,
        league_name: leagueName.trim(),
        league_start: leagueStart,
        league_end: leagueEnd,
      });
      closeDialog();
      setTitle("");
      eventRef.current = result.id;
      setTab("attendance");
      try {
        await loadEvent(result.id, true);
        await loadBoard();
      } catch {
        throw new Error(
          "The event was created, but the screen could not refresh. Tap Refresh to find it.",
        );
      }
      setNotice("Event created.");
    });
  };
  const refresh = () =>
    void run(async () => {
      await loadBoard();
      if (eventRef.current) await loadEvent(eventRef.current);
    });
  const showTotals = () =>
    void run(async () => {
      if (!event) return;
      const { data, error: totalError } = await db.rpc(
        "lgs_attendance_totals",
        {
          p_store: event.store_id,
          p_start: event.league_start,
          p_end: event.league_end,
        },
      );
      if (totalError) throw totalError;
      setTotals((data ?? []) as Total[]);
      setTotalsPage(1);
    });
  const messages = (
    <>
      {error && (
        <div className="lgs-message lgs-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="lgs-message lgs-success-notice" role="status">
          {notice}
        </div>
      )}
    </>
  );
  const loadEdits = async (offset: number, activityOnly = false) => {
    const eventId = auditEventRef.current;
    if (!eventId) return;
    const { data, error: editError } = await db
      .from("lgs_event_edits")
      .select("*")
      .eq("event_id", eventId)
      .eq("activity_only", activityOnly)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + 19);
    if (editError) throw editError;
    if (auditEventRef.current !== eventId) return;
    const rows = (data ?? []) as EventEdit[];
    if (activityOnly) {
      setEventActivity((previous) =>
        offset === 0 ? rows : [...previous, ...rows],
      );
      setMoreActivity(rows.length === 20);
    } else {
      setEventEdits((previous) =>
        offset === 0 ? rows : [...previous, ...rows],
      );
      setMoreEdits(rows.length === 20);
    }
  };
  const openEdits = (target: LGSEvent) =>
    void run(async () => {
      auditEventRef.current = target.id;
      setAuditTarget(target);
      setEventEdits([]);
      setEventActivity([]);
      setMoreEdits(false);
      setMoreActivity(false);
      setDialog("edits");
      await Promise.all([loadEdits(0), loadEdits(0, true)]);
    });
  const beginNewEvent = () => {
    if (!canCreate) return;
    setEventStoreId(staff?.role === "ALLGS" ? "" : (staff?.store_id ?? ""));
    setTitle("");
    setLeagueName("");
    setEventDate(today());
    setLeagueStart(today());
    setLeagueEnd(addDays(today(), 55));
    setError("");
    setNotice("");
    setDialog("new");
  };
  const boardStoreName =
    staff?.role === "ALLGS"
      ? "All stores · View-only access"
      : (ownStore?.name ?? "Your store");
  const eventCard = (item: LGSEvent) => (
    <article key={item.id} className="lgs-event-tile">
      <button
        type="button"
        className="lgs-event-card"
        disabled={busy}
        onClick={() => openEvent(item.id)}
      >
        <span className="lgs-event-date">
          <CalendarDays size={23} aria-hidden="true" />
          <strong>{new Date(`${item.event_date}T12:00:00`).getDate()}</strong>
          <span>
            {new Date(`${item.event_date}T12:00:00`).toLocaleDateString(
              undefined,
              { month: "short" },
            )}
          </span>
        </span>
        <span className="lgs-event-copy">
          <span
            className={`lgs-pill ${item.status === "active" ? "lgs-live" : ""}`}
          >
            {item.status === "active" ? "In progress" : "Completed"}
          </span>
          <strong>{item.name}</strong>
          <span className="lgs-muted">{dateLabel(item.event_date)}</span>
          {staff?.role === "ALLGS" && stores.length > 1 && (
            <span className="lgs-muted">
              {stores.find((store) => store.id === item.store_id)?.name ??
                "Store"}
            </span>
          )}
          {item.league_name && (
            <span className="lgs-muted">{item.league_name}</span>
          )}
          <span className="lgs-event-link">
            {item.status === "active" ? "Continue event" : "View results"}
            <ArrowUpRight size={17} aria-hidden="true" />
          </span>
        </span>
      </button>
      {(item.edit_count ?? 0) > 0 && (
        <button
          type="button"
          className="lgs-card-edits"
          disabled={busy}
          onClick={() => openEdits(item)}
        >
          <History size={15} aria-hidden="true" />
          This event was edited
        </button>
      )}
    </article>
  );
  return (
    <main className="lgs-ui lgs-page">
      <style>{STYLES}</style>
      <div className="lgs-shell">
        <header className="lgs-appbar">
          <div className="lgs-app-title">
            <span className="lgs-brand">MLPEKAYOU</span>
            <h1>LGS Boards</h1>
            {staff && <p className="lgs-muted">{boardStoreName}</p>}
          </div>
          <div className="lgs-toolbar">
            <button
              type="button"
              className="lgs-secondary"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              type="button"
              className="lgs-secondary"
              onClick={refresh}
              disabled={busy || loading}
            >
              {busy ? "Working…" : "Refresh"}
            </button>
            {canCreate && !event && (
              <button
                type="button"
                className="lgs-primary"
                onClick={beginNewEvent}
                disabled={busy || loading || stores.length === 0}
              >
                <CalendarPlus size={19} aria-hidden="true" /> New Event
              </button>
            )}
          </div>
        </header>
        {!dialog && !deckPlayer && messages}
        {loading && !staff ? (
          <div className="lgs-empty" role="status">
            Loading your boards…
          </div>
        ) : !staff ? (
          <section className="lgs-panel lgs-empty">
            <h1>Staff access only</h1>
            <p>
              {userId
                ? "Your account needs an active LGS staff assignment to open this page."
                : "Sign in with your assigned staff account to open this page."}
            </p>
            <button
              type="button"
              className="lgs-primary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </section>
        ) : event ? (
          <>
            <button
              type="button"
              className="lgs-quiet lgs-back"
              disabled={busy}
              onClick={() => {
                setEvent(null);
                eventRef.current = null;
                setTotals(null);
                setNotice("");
              }}
            >
              ← All events
            </button>
            <header className="lgs-heading">
              <div>
                <p className="lgs-eyebrow">
                  {stores.find((store) => store.id === event.store_id)?.name ??
                    "LGS"}
                </p>
                <h1>{event.name}</h1>
                <p className="lgs-muted">
                  {dateLabel(event.event_date)}
                  {event.league_name ? ` · ${event.league_name}` : ""}
                </p>
              </div>
              <span
                className={`lgs-pill ${event.status === "active" ? "lgs-live" : ""}`}
              >
                {event.status === "active" ? "Open event" : "Completed"}
              </span>
            </header>
            {(event.edit_count ?? 0) > 0 && (
              <button
                type="button"
                className="lgs-edited-link"
                onClick={() => openEdits(event)}
                disabled={busy}
              >
                <History size={16} aria-hidden="true" />
                This event was edited
                <span>
                  {event.edit_count}{" "}
                  {event.edit_count === 1 ? "update" : "updates"}
                </span>
              </button>
            )}
            {!canManage && (
              <p className="lgs-message lgs-viewer-notice">
                You’re viewing another store’s event. This board is read-only.
              </p>
            )}
            <div className="lgs-stats">
              <div>
                <strong>{attendees.length}</strong>
                <span>Checked in</span>
              </div>
              <div>
                <strong>{raffles.length}</strong>
                <span>Raffle winners</span>
              </div>
              <div>
                <strong>
                  {attendees.filter((person) => person.deck).length}
                </strong>
                <span>Decks selected</span>
              </div>
            </div>
            <nav className="lgs-tabs" aria-label="Event sections">
              {(
                [
                  ["attendance", "Players"],
                  ["raffles", "Raffles"],
                  ["overview", "Overview"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={tab === value}
                  className={tab === value ? "selected" : ""}
                  onClick={() => setTab(value)}
                >
                  {label}
                </button>
              ))}
            </nav>
            {tab === "attendance" && (
              <section className="lgs-panel">
                <div className="lgs-row">
                  <h2>Attendance</h2>
                  {editable && (
                    <button
                      type="button"
                      className="lgs-primary"
                      disabled={busy}
                      onClick={() => {
                        resetPlayerEntry();
                        setRosterSearch("");
                        setRosterPage(1);
                        setDialog("players");
                      }}
                    >
                      + Add players
                    </button>
                  )}
                </div>
                {attendees.length === 0 ? (
                  <div className="lgs-empty">
                    <h3>Ready for your first player</h3>
                    <p>
                      Add a new name or check in someone from your store’s
                      roster.
                    </p>
                  </div>
                ) : (
                  <div className="lgs-player-list">
                    {pageAttendees.map((person) => (
                      <div key={person.player_id} className="lgs-person">
                        <button
                          type="button"
                          className="lgs-deck-thumb"
                          disabled={!editable || busy}
                          onClick={() => setDeckPlayer(person)}
                          aria-label={`Choose deck for ${person.player_name}`}
                        >
                          {person.deck ? (
                            <img
                              src={deckImage(person.deck)}
                              alt={
                                DECKS.find((deck) => deck.id === person.deck)
                                  ?.name ?? "Deck"
                              }
                            />
                          ) : (
                            <span>
                              Choose
                              <br />
                              deck
                            </span>
                          )}
                        </button>
                        <div className="lgs-person-name">
                          <strong>{person.player_name}</strong>
                          <span className="lgs-muted">
                            {DECKS.find((deck) => deck.id === person.deck)
                              ?.name ?? "No deck selected"}
                          </span>
                          {raffles.some(
                            (raffle) => raffle.player_id === person.player_id,
                          ) && (
                            <span className="lgs-winner-label">
                              Raffle winner
                            </span>
                          )}
                        </div>
                        <div className="lgs-player-id">
                          <span>Player ID</span>
                          <strong>{person.player_external_id || "—"}</strong>
                          {editable && (
                            <button
                              type="button"
                              className="lgs-id-edit"
                              disabled={busy}
                              aria-label={`Edit Player ID for ${person.player_name}`}
                              onClick={() => {
                                setIdPlayer(person);
                                setIdDraft(person.player_external_id ?? "");
                                setDialog("player_id");
                              }}
                            >
                              {person.player_external_id ? "Edit ID" : "Add ID"}
                            </button>
                          )}
                        </div>
                        {editable &&
                          !raffles.some(
                            (raffle) => raffle.player_id === person.player_id,
                          ) && (
                            <button
                              type="button"
                              className="lgs-quiet"
                              disabled={busy}
                              onClick={() =>
                                mutate(
                                  "remove_player",
                                  { player_id: person.player_id },
                                  "Check-in removed. Player remains in your roster.",
                                )
                              }
                              aria-label={`Remove ${person.player_name} from this event`}
                            >
                              ✕
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
                <Pagination
                  count={attendees.length}
                  page={safeParticipantPage}
                  onPage={setParticipantPage}
                  disabled={busy}
                  label="Attendance"
                />
              </section>
            )}
            {tab === "raffles" && (
              <section className="lgs-panel">
                <h2>Event raffles</h2>
                <p className="lgs-muted">
                  Each attendee gets one chance per draw. Winners are excluded
                  from later draws in this event and eligible again next event.
                </p>
                {editable && (
                  <form
                    className="lgs-form"
                    onSubmit={(form) => {
                      form.preventDefault();
                      mutate(
                        "draw",
                        {
                          label:
                            raffleLabel.trim() ||
                            `Raffle ${raffles.length + 1}`,
                        },
                        "Raffle winner saved.",
                      );
                      setRaffleLabel("");
                    }}
                  >
                    <label>
                      Raffle label <span className="lgs-muted">(optional)</span>
                      <input
                        value={raffleLabel}
                        onChange={(change) =>
                          setRaffleLabel(change.target.value)
                        }
                        maxLength={100}
                        placeholder={`Raffle ${raffles.length + 1}`}
                        disabled={busy}
                      />
                    </label>
                    <button
                      className="lgs-primary"
                      type="submit"
                      disabled={busy || attendees.length <= raffles.length}
                    >
                      Draw winner ·{" "}
                      {Math.max(0, attendees.length - raffles.length)} eligible
                    </button>
                  </form>
                )}
                {raffles.length === 0 ? (
                  <p className="lgs-empty">No winners drawn yet.</p>
                ) : (
                  <div className="lgs-player-list">
                    {raffles.map((raffle) => (
                      <div className="lgs-raffle" key={raffle.id}>
                        <span className="lgs-muted">{raffle.label}</span>
                        <strong>{raffle.winner_name}</strong>
                        <span className="lgs-muted">
                          {new Date(raffle.drawn_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {tab === "overview" && (
              <div className="lgs-overview">
                <section className="lgs-panel">
                  <h2>Deck breakdown</h2>
                  <p className="lgs-muted">
                    Percentage of all {attendees.length} checked-in players.
                  </p>
                  <div className="lgs-deck-grid">
                    {DECKS.map((deck) => {
                      const count = attendees.filter(
                        (person) => person.deck === deck.id,
                      ).length;
                      return (
                        <div className="lgs-deck-option" key={deck.id}>
                          <img
                            src={`/starter-decks-boxes/${deck.image}`}
                            alt={deck.name}
                          />
                          <strong>{deck.name}</strong>
                          <span>
                            {count} ·{" "}
                            {attendees.length
                              ? Math.round((count / attendees.length) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="lgs-muted">
                    No deck selected:{" "}
                    {attendees.filter((person) => !person.deck).length}
                  </p>
                </section>
                <section className="lgs-panel">
                  <h2>Attendance totals</h2>
                  <p className="lgs-muted">
                    {dateLabel(event.league_start)} –{" "}
                    {dateLabel(event.league_end)}
                  </p>
                  <p className="lgs-muted">
                    All store events in this period. Weeks are seven-day blocks
                    from the start date.
                  </p>
                  <button
                    type="button"
                    className="lgs-secondary"
                    disabled={busy}
                    onClick={showTotals}
                  >
                    {totals ? "Refresh totals" : "Show totals"}
                  </button>
                  {totals && (
                    <div className="lgs-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th>Events</th>
                            <th>Weeks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {totals
                            .slice(
                              (safeTotalsPage - 1) * 10,
                              safeTotalsPage * 10,
                            )
                            .map((total) => (
                              <tr key={total.player_id}>
                                <td>{total.player_name}</td>
                                <td>{total.events_attended}</td>
                                <td>{total.weeks_attended}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <Pagination
                        count={totals.length}
                        page={safeTotalsPage}
                        onPage={setTotalsPage}
                        disabled={busy}
                        label="Attendance totals"
                      />
                      {totals.length === 0 && (
                        <p>No attendance in this period.</p>
                      )}
                    </div>
                  )}
                </section>
                <section className="lgs-panel">
                  <h2>Final placements</h2>
                  <p className="lgs-muted">
                    Choose a finishing place for each of the {attendees.length}{" "}
                    players.
                  </p>
                  {pageAttendees.map((person) => (
                    <label className="lgs-placement" key={person.player_id}>
                      <span>{person.player_name}</span>
                      <select
                        aria-label={`Placement for ${person.player_name}`}
                        value={person.placement ?? ""}
                        disabled={!editable || busy}
                        onChange={(change) =>
                          mutate(
                            "set_placement",
                            {
                              player_id: person.player_id,
                              placement: change.target.value,
                            },
                            "Placement saved.",
                          )
                        }
                      >
                        <option value="">Not placed</option>
                        {person.placement !== null &&
                          person.placement > attendees.length && (
                            <option value={person.placement} disabled>
                              Review saved place {person.placement}
                            </option>
                          )}
                        {Array.from(
                          { length: attendees.length },
                          (_, index) => (
                            <option key={index + 1} value={index + 1}>
                              Place {index + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  ))}
                  <Pagination
                    count={attendees.length}
                    page={safeParticipantPage}
                    onPage={setParticipantPage}
                    disabled={busy}
                    label="Placements"
                  />
                </section>
                <section className="lgs-panel">
                  <h2>Event notes</h2>
                  <form
                    className="lgs-form"
                    onSubmit={(form) => {
                      form.preventDefault();
                      mutate("notes", { notes });
                    }}
                  >
                    <textarea
                      aria-label="Event notes"
                      value={notes}
                      onChange={(change) => setNotes(change.target.value)}
                      maxLength={5000}
                      rows={5}
                      placeholder="Anything you want to remember about this event…"
                      disabled={!editable || busy}
                    />
                    {editable && (
                      <button
                        type="submit"
                        className="lgs-secondary"
                        disabled={busy || notes === event.notes}
                      >
                        Save notes
                      </button>
                    )}
                  </form>
                  <p className="lgs-muted">
                    {notes !== event.notes
                      ? "You have unsaved notes."
                      : "Notes saved."}
                  </p>
                </section>
              </div>
            )}
            {canManage && (
              <div className="lgs-finish">
                <button
                  type="button"
                  className="lgs-secondary"
                  disabled={busy}
                  onClick={() =>
                    event.status === "active"
                      ? setDialog("finish")
                      : mutate("reopen", {}, "Event reopened.")
                  }
                >
                  {event.status === "active" ? "Finish event" : "Reopen event"}
                </button>
                <p className="lgs-muted">
                  Attendance, deck selections, and raffle results save as you
                  go.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="lgs-section">
              <div className="lgs-section-heading">
                <div>
                  <h2>
                    Open events{" "}
                    <span className="lgs-pill">{active.length}</span>
                  </h2>
                  <p className="lgs-muted">Pick up where you left off.</p>
                </div>
                {staff.role === "ALLGS" && stores.length > 1 && (
                  <label className="lgs-filter">
                    View store
                    <select
                      value={storeFilter}
                      onChange={(change) => {
                        setStoreFilter(change.target.value);
                        setHistoryLimit(PAGE_SIZE);
                      }}
                      disabled={busy}
                    >
                      <option value="">All stores</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {active.length > 0 && (
                <div className="lgs-events">{active.map(eventCard)}</div>
              )}
            </section>
            <section className="lgs-section lgs-history">
              <button
                type="button"
                className="lgs-history-toggle"
                aria-expanded={historyOpen}
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                <span className="lgs-history-heading">
                  <History size={26} aria-hidden="true" />
                  <span>
                    <strong>Event history</strong>
                    <span className="lgs-muted">
                      Revisit attendance, decks, and raffle winners.
                    </span>
                  </span>
                </span>
                <span aria-hidden="true">{historyOpen ? "−" : "+"}</span>
              </button>
              {historyOpen && (
                <div className="lgs-events">
                  {history.length ? (
                    history.map(eventCard)
                  ) : (
                    <p className="lgs-empty">
                      Finish an event and it will appear here.
                    </p>
                  )}
                  {hasMore && (
                    <button
                      type="button"
                      className="lgs-secondary"
                      disabled={busy || loading}
                      onClick={() =>
                        setHistoryLimit((limit) => limit + PAGE_SIZE)
                      }
                    >
                      {loading ? "Loading…" : "Load more history"}
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      {staff && canCreate && dialog === "new" && (
        <Modal title="Create your event" close={closeDialog} busy={busy}>
          {messages}
          <form className="lgs-form lgs-create-form" onSubmit={createEvent}>
            {staff.role === "ALLGS" ? (
              <label>
                Event store
                <select
                  required
                  value={eventStoreId}
                  onChange={(change) => setEventStoreId(change.target.value)}
                  disabled={busy}
                >
                  <option value="">Choose a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="lgs-event-store">
                <StoreIcon size={22} aria-hidden="true" />
                <div>
                  <span className="lgs-muted">Event store</span>
                  <strong>{ownStore?.name}</strong>
                </div>
              </div>
            )}
            <p className="lgs-muted">
              Start with a name and date. You’ll add players on the next screen.
            </p>
            <label>
              Event name
              <input
                required
                maxLength={100}
                value={title}
                onChange={(change) => setTitle(change.target.value)}
                placeholder="Friday Night Pony"
                disabled={busy}
              />
            </label>
            <label>
              Event date
              <input
                type="date"
                required
                value={eventDate}
                onChange={(change) => {
                  const value = change.target.value;
                  setEventDate(value);
                  if (value && (value < leagueStart || value > leagueEnd)) {
                    setLeagueStart(value);
                    setLeagueEnd(addDays(value, 55));
                  }
                }}
                min={leagueStart}
                max={leagueEnd}
                disabled={busy}
              />
            </label>
            <details className="lgs-league-settings">
              <summary>
                League tracking{" "}
                <span className="lgs-muted">Optional · 8 weeks by default</span>
              </summary>
              <div className="lgs-form">
                <label>
                  League name
                  <input
                    maxLength={100}
                    value={leagueName}
                    onChange={(change) => setLeagueName(change.target.value)}
                    placeholder="Autumn league"
                    disabled={busy}
                  />
                </label>
                <div className="lgs-row">
                  <strong>Tracking period</strong>
                  <button
                    type="button"
                    className="lgs-quiet"
                    disabled={busy || !leagueStart}
                    onClick={() => setLeagueEnd(addDays(leagueStart, 55))}
                  >
                    Use 8 weeks
                  </button>
                </div>
                <div className="lgs-date-grid">
                  <label>
                    Starts
                    <input
                      required
                      type="date"
                      value={leagueStart}
                      onChange={(change) => setLeagueStart(change.target.value)}
                      disabled={busy}
                    />
                  </label>
                  <label>
                    Ends
                    <input
                      required
                      type="date"
                      min={leagueStart}
                      value={leagueEnd}
                      onChange={(change) => setLeagueEnd(change.target.value)}
                      disabled={busy}
                    />
                  </label>
                </div>
                <p className="lgs-muted">
                  Use the same dates for each event in your league.
                </p>
              </div>
            </details>
            <button
              type="submit"
              className="lgs-primary lgs-create-submit"
              disabled={
                busy ||
                !title.trim() ||
                !(staff.role === "ALLGS" ? eventStoreId : staff.store_id)
              }
            >
              <CalendarPlus size={21} aria-hidden="true" />
              {busy ? "Creating event…" : "Create event & add players"}
            </button>
          </form>
        </Modal>
      )}
      {staff && editable && dialog === "players" && (
        <Modal title="Add a player" close={closeDialog} busy={busy}>
          {messages}
          <form
            className="lgs-form"
            onSubmit={(form) => {
              form.preventDefault();
              mutate(
                "check_in",
                {
                  name: playerSearch.trim(),
                  player_id: selectedRosterId,
                  external_id: playerExternalId.trim(),
                  deck: entryDeck,
                },
                "Player, ID and deck saved.",
              );
            }}
          >
            <div className="lgs-date-grid">
              <label>
                Player name
                <input
                  required
                  maxLength={80}
                  value={playerSearch}
                  readOnly={!!selectedRosterId}
                  onChange={(change) => setPlayerSearch(change.target.value)}
                  placeholder="Name or nickname"
                  disabled={busy}
                />
              </label>
              <label>
                Player ID <span className="lgs-muted">(optional)</span>
                <input
                  maxLength={80}
                  value={playerExternalId}
                  readOnly={
                    !!selectedRosterId &&
                    !!roster.find((player) => player.id === selectedRosterId)
                      ?.external_id
                  }
                  onChange={(change) =>
                    setPlayerExternalId(change.target.value)
                  }
                  placeholder="e.g. AB12345"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={busy}
                />
              </label>
            </div>
            {selectedRosterId && (
              <button
                className="lgs-quiet"
                type="button"
                disabled={busy}
                onClick={resetPlayerEntry}
              >
                Clear selection / add someone new
              </button>
            )}
            <fieldset className="lgs-entry-decks">
              <legend>Deck for this event</legend>
              <div className="lgs-deck-grid">
                {DECKS.map((deck) => (
                  <button
                    type="button"
                    key={deck.id}
                    className={`lgs-deck-option ${entryDeck === deck.id ? "selected" : ""}`}
                    aria-pressed={entryDeck === deck.id}
                    disabled={busy}
                    onClick={() => setEntryDeck(deck.id)}
                  >
                    <img src={`/starter-decks-boxes/${deck.image}`} alt="" />
                    <strong>{deck.name}</strong>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="lgs-quiet"
                disabled={busy}
                aria-pressed={entryDeck === null}
                onClick={() => setEntryDeck(null)}
              >
                Deck not known yet
              </button>
            </fieldset>
            <button
              type="submit"
              className="lgs-primary"
              disabled={busy || !playerSearch.trim()}
            >
              Add player to event
            </button>
          </form>
          <div className="lgs-saved-roster">
            <h3>Returning players</h3>
            <label className="lgs-roster-search">
              Find by name or ID
              <input
                value={rosterSearch}
                onChange={(change) => {
                  setRosterSearch(change.target.value);
                  setRosterPage(1);
                }}
                placeholder="Search saved players"
                disabled={busy}
              />
            </label>
            <div className="lgs-roster">
              {filteredRoster
                .slice((safeRosterPage - 1) * 10, safeRosterPage * 10)
                .map((player) => {
                  const present = attendees.some(
                    (person) => person.player_id === player.id,
                  );
                  return (
                    <button
                      type="button"
                      className="lgs-roster-player"
                      key={player.id}
                      disabled={busy || present}
                      onClick={() => {
                        setSelectedRosterId(player.id);
                        setPlayerSearch(player.name);
                        setPlayerExternalId(player.external_id ?? "");
                        setEntryDeck(null);
                      }}
                    >
                      <span>
                        <strong>{player.name}</strong>
                        {player.external_id && (
                          <span className="lgs-muted">
                            {player.external_id}
                          </span>
                        )}
                      </span>
                      <span>
                        {present
                          ? "Checked in"
                          : selectedRosterId === player.id
                            ? "Selected"
                            : "Select"}
                      </span>
                    </button>
                  );
                })}
            </div>
            <Pagination
              count={filteredRoster.length}
              page={safeRosterPage}
              onPage={setRosterPage}
              disabled={busy}
              label="Saved players"
            />
            {roster.length === 0 && (
              <p className="lgs-muted">
                Players you add are saved here for future events.
              </p>
            )}
          </div>
        </Modal>
      )}
      {staff && editable && deckPlayer && (
        <Modal
          title={`${deckPlayer.player_name}’s deck`}
          close={closeDialog}
          busy={busy}
        >
          {messages}
          <div className="lgs-deck-grid">
            {DECKS.map((deck) => (
              <button
                type="button"
                key={deck.id}
                className={`lgs-deck-option ${deckPlayer.deck === deck.id ? "selected" : ""}`}
                aria-pressed={deckPlayer.deck === deck.id}
                disabled={busy}
                onClick={() =>
                  mutate(
                    "set_deck",
                    { player_id: deckPlayer.player_id, deck: deck.id },
                    "Deck saved.",
                  )
                }
              >
                <img src={`/starter-decks-boxes/${deck.image}`} alt="" />
                <strong>{deck.name}</strong>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="lgs-quiet"
            disabled={busy}
            onClick={() =>
              mutate(
                "set_deck",
                { player_id: deckPlayer.player_id, deck: "" },
                "Deck selection cleared.",
              )
            }
          >
            Clear selection
          </button>
        </Modal>
      )}
      {staff && editable && dialog === "player_id" && idPlayer && (
        <Modal
          title={`Player ID · ${idPlayer.player_name}`}
          close={closeDialog}
          busy={busy}
          className="lgs-id-dialog"
        >
          {messages}
          <form
            className="lgs-form"
            onSubmit={(form) => {
              form.preventDefault();
              mutate(
                "set_player_id",
                { player_id: idPlayer.player_id, external_id: idDraft.trim() },
                "Player ID saved.",
              );
            }}
          >
            <label>
              Player ID
              <input
                value={idDraft}
                onChange={(change) => setIdDraft(change.target.value)}
                maxLength={80}
                placeholder="Enter the player’s ID"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={busy}
              />
            </label>
            <p className="lgs-muted">
              Saved for this event and future check-ins. Leave blank to clear
              the ID.
            </p>
            <div className="lgs-finish-actions">
              <button
                type="button"
                className="lgs-secondary"
                disabled={busy}
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button type="submit" className="lgs-primary" disabled={busy}>
                Save Player ID
              </button>
            </div>
          </form>
        </Modal>
      )}
      {staff && dialog === "edits" && (
        <Modal
          title="Event edit history"
          close={closeDialog}
          busy={busy}
          className="lgs-edit-dialog"
        >
          {messages}
          <p className="lgs-edit-intro">{auditTarget?.name}</p>
          <div className="lgs-edit-list">
            {eventEdits.map((edit) => (
              <EditRecord key={edit.id} edit={edit} />
            ))}
          </div>
          {busy && (
            <p className="lgs-empty" role="status">
              Loading edit history…
            </p>
          )}
          {!busy && !error && eventEdits.length === 0 && (
            <div className="lgs-no-edits">
              <strong>No detailed edits were recorded.</strong>
              <p>
                {eventActivity.length
                  ? "The saved history only contains reopening or finishing the event. It does not record a change to players, IDs, decks, placements, notes, or raffles."
                  : "History begins when edit tracking is installed. Changes made before then cannot be reconstructed."}
              </p>
            </div>
          )}
          {moreEdits && !error && (
            <button
              type="button"
              className="lgs-secondary lgs-more-edits"
              disabled={busy}
              onClick={() => void run(() => loadEdits(eventEdits.length))}
            >
              Load more edits
            </button>
          )}
          {eventActivity.length > 0 && (
            <details className="lgs-event-activity">
              <summary>Reopened / finished activity</summary>
              <div className="lgs-edit-list">
                {eventActivity.map((edit) => (
                  <EditRecord key={edit.id} edit={edit} />
                ))}
              </div>
              {moreActivity && (
                <button
                  type="button"
                  className="lgs-secondary lgs-more-edits"
                  disabled={busy}
                  onClick={() =>
                    void run(() => loadEdits(eventActivity.length, true))
                  }
                >
                  Load more activity
                </button>
              )}
            </details>
          )}
          {!busy && error && (
            <button
              type="button"
              className="lgs-secondary"
              onClick={() =>
                void run(async () => {
                  await Promise.all([loadEdits(0), loadEdits(0, true)]);
                })
              }
            >
              Retry
            </button>
          )}
        </Modal>
      )}
      {staff && editable && dialog === "finish" && (
        <Modal
          title="Finish this event?"
          close={closeDialog}
          busy={busy}
          className="lgs-finish-dialog"
        >
          {messages}
          <p className="lgs-finish-description">
            Save this event to history. You can reopen it later if you need to
            make a correction.
          </p>
          {event && notes !== event.notes && (
            <p className="lgs-message">Your unsaved notes will be saved too.</p>
          )}
          <div className="lgs-finish-actions">
            <button
              type="button"
              className="lgs-secondary"
              onClick={closeDialog}
              disabled={busy}
            >
              Keep editing
            </button>
            <button
              type="button"
              className="lgs-primary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (event && notes !== event.notes)
                    await write("notes", { notes });
                  const result = await write("complete");
                  closeDialog();
                  try {
                    await loadEvent(result.id, true);
                    await loadBoard();
                  } catch {
                    throw new Error(
                      "Event completed, but the screen could not refresh. Tap Refresh.",
                    );
                  }
                  setNotice("Event saved to history.");
                })
              }
            >
              {busy ? "Saving…" : "Finish and save"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
const STYLES = `
.lgs-ui{--lgs-bg:#f7f4fa;--lgs-panel:#fff;--lgs-soft:#eee8f5;--lgs-text:#2b2238;--lgs-muted:#70647d;--lgs-accent:#7650a1;--lgs-accent-text:#fff;--lgs-good:#246345;--lgs-good-bg:#e3f3e9;color:var(--lgs-text);font-family:inherit;font-size:16px;line-height:1.5;box-sizing:border-box;color-scheme:light}
.dark .lgs-ui,.lgs-ui.dark,[data-theme="dark"] .lgs-ui{--lgs-bg:#15121c;--lgs-panel:#211b2b;--lgs-soft:#30263e;--lgs-text:#f6efff;--lgs-muted:#bfb0cd;--lgs-accent:#c6a4ed;--lgs-accent-text:#21122f;--lgs-good:#a8e4be;--lgs-good-bg:#203d30;color-scheme:dark}
.lgs-ui *{box-sizing:border-box}.lgs-page{min-height:100vh;min-height:100dvh;background:var(--lgs-bg);padding:max(12px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(32px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}.lgs-shell{width:100%;min-width:0;margin:0 auto}.lgs-ui h1,.lgs-ui h2,.lgs-ui h3,.lgs-ui p{margin:0}.lgs-ui h1{font-size:clamp(28px,6vw,38px);line-height:1.16;font-weight:750;overflow-wrap:anywhere}.lgs-ui h2{font-size:20px;font-weight:700;overflow-wrap:anywhere}.lgs-ui h3{font-size:18px;font-weight:650}.lgs-ui p{margin-top:8px}.lgs-ui button,.lgs-ui input,.lgs-ui select,.lgs-ui textarea{font:inherit}.lgs-ui button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;transition:opacity .15s,background .15s}.lgs-ui button:disabled{cursor:default;opacity:.55}.lgs-ui button:focus-visible,.lgs-ui input:focus-visible,.lgs-ui select:focus-visible,.lgs-ui textarea:focus-visible{outline:3px solid var(--lgs-accent);outline-offset:3px}.lgs-top,.lgs-row,.lgs-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.lgs-top{margin-bottom:24px}.lgs-heading{align-items:flex-start;margin:14px 0 24px;flex-wrap:wrap}.lgs-eyebrow{color:var(--lgs-accent);font-weight:650;margin-bottom:8px!important}.lgs-muted{color:var(--lgs-muted);font-size:15px}.lgs-primary,.lgs-secondary,.lgs-quiet{padding:10px 16px;border-radius:14px;font-weight:650}.lgs-primary{background:var(--lgs-accent);color:var(--lgs-accent-text)}.lgs-secondary{background:var(--lgs-soft);color:var(--lgs-text)}.lgs-quiet{background:transparent;color:var(--lgs-text)}.lgs-new{width:100%;min-height:56px!important;font-size:18px!important}.lgs-panel{background:var(--lgs-panel);border-radius:22px;padding:20px}.lgs-empty{padding:34px 18px;text-align:center;color:var(--lgs-muted)}.lgs-empty h1,.lgs-empty h3{color:var(--lgs-text)}.lgs-empty button{margin-top:18px}.lgs-section{margin-top:28px}.lgs-section>.lgs-row{margin-bottom:12px}.lgs-events{display:grid;gap:12px}.lgs-event-card{display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left;width:100%;padding:20px;border-radius:20px;background:var(--lgs-panel);color:var(--lgs-text)}.lgs-event-card strong{font-size:18px;overflow-wrap:anywhere}.lgs-event-card>span:first-child{min-width:0}.lgs-event-card .lgs-muted{display:block;margin-top:4px}.lgs-pill{display:inline-block;flex-shrink:0;background:var(--lgs-soft);border-radius:999px;padding:5px 11px;font-size:14px;font-weight:650}.lgs-live{background:var(--lgs-good-bg);color:var(--lgs-good)}.lgs-history{margin-top:40px}.lgs-history-toggle{display:flex;width:100%;justify-content:space-between;align-items:center;gap:16px;background:transparent;color:var(--lgs-text);text-align:left;padding:14px 0}.lgs-history-toggle strong{font-size:21px}.lgs-history-toggle .lgs-muted{display:block}.lgs-history-toggle>span:last-child{font-size:28px}.lgs-filter{display:block;margin-bottom:20px}.lgs-ui label{font-weight:600}.lgs-ui input,.lgs-ui select,.lgs-ui textarea{display:block;width:100%;min-width:0;background:var(--lgs-soft);color:var(--lgs-text);border:0;border-radius:12px;padding:12px;font-size:16px;min-height:48px;margin-top:6px}.lgs-ui textarea{resize:vertical}.lgs-ui input::placeholder,.lgs-ui textarea::placeholder{color:var(--lgs-muted);opacity:1}.lgs-form{display:grid;gap:16px;margin-top:16px}.lgs-date-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.lgs-date-grid label{min-width:0}.lgs-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:22px}.lgs-stats>div{background:var(--lgs-soft);padding:16px 8px;border-radius:17px;text-align:center}.lgs-stats strong{display:block;font-size:28px;line-height:1.2}.lgs-stats span{font-size:14px;color:var(--lgs-muted)}.lgs-tabs{display:flex;background:var(--lgs-soft);padding:5px;gap:4px;border-radius:16px;margin-bottom:18px}.lgs-tabs button{flex:1;min-width:0;background:transparent;border-radius:12px;color:var(--lgs-muted);font-weight:650;padding:10px 4px}.lgs-tabs .selected{background:var(--lgs-panel);color:var(--lgs-text)}.lgs-player-list{display:grid;gap:12px;margin-top:18px}.lgs-person{display:flex;align-items:center;gap:12px;background:var(--lgs-soft);padding:10px;border-radius:16px}.lgs-person-name{flex:1;min-width:0;overflow-wrap:anywhere}.lgs-person-name strong,.lgs-person-name span{display:block}.lgs-deck-thumb{width:64px;min-height:78px!important;flex-shrink:0;padding:4px;background:var(--lgs-panel);border-radius:10px;color:var(--lgs-text);font-size:12px!important}.lgs-deck-thumb:disabled{opacity:1!important}.lgs-deck-thumb img{display:block;width:100%;height:72px;object-fit:contain}.lgs-winner-label{color:var(--lgs-good);font-size:14px}.lgs-deck-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.lgs-deck-option{background:var(--lgs-soft);color:var(--lgs-text);border-radius:14px;padding:10px 5px;text-align:center;min-width:0}.lgs-deck-option img{display:block;width:100%;height:110px;object-fit:contain;margin-bottom:8px}.lgs-deck-option strong{display:block;font-size:14px;line-height:1.3;overflow-wrap:anywhere}.lgs-deck-option span{display:block;color:var(--lgs-muted);font-size:14px;margin-top:4px}.lgs-deck-option.selected{box-shadow:inset 0 0 0 3px var(--lgs-accent)}.lgs-raffle{background:var(--lgs-soft);padding:18px;border-radius:16px}.lgs-raffle strong{font-size:24px;display:block;overflow-wrap:anywhere}.lgs-raffle span{display:block}.lgs-overview{display:grid;gap:16px}.lgs-placement{display:flex;align-items:center;gap:12px;margin-top:10px}.lgs-placement span{flex:1;overflow-wrap:anywhere}.lgs-placement input{width:88px}.lgs-table-wrap{overflow-x:auto;margin-top:16px}.lgs-ui table{border-collapse:collapse;width:100%;text-align:left}.lgs-ui th,.lgs-ui td{padding:10px 8px;overflow-wrap:anywhere}.lgs-ui tbody tr:nth-child(odd){background:var(--lgs-soft)}.lgs-finish{margin-top:24px;text-align:center}.lgs-finish>button{width:100%}.lgs-message{padding:12px 16px;border-radius:14px;background:var(--lgs-soft);margin:12px 0;overflow-wrap:anywhere}.lgs-error{background:#fbe6e8;color:#872a39}.dark .lgs-error,[data-theme="dark"] .lgs-error{background:#482733;color:#ffd4dc}.lgs-overlay{position:fixed;inset:0;z-index:10000;background:rgba(12,8,20,.65);display:flex;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 16px max(16px,env(safe-area-inset-bottom));overscroll-behavior:contain}.lgs-modal{background:var(--lgs-panel);border-radius:24px;padding:20px;width:100%;max-width:520px;max-height:calc(100dvh - 48px);overflow-y:auto;overscroll-behavior:contain;outline:none}.lgs-roster{display:grid;gap:8px;margin-top:18px}.lgs-roster-player{display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:var(--lgs-soft);color:var(--lgs-text);border-radius:12px;padding:12px}.lgs-roster-player strong{overflow-wrap:anywhere}.lgs-roster-player span{flex-shrink:0;font-size:14px;color:var(--lgs-muted)}.lgs-back{padding-left:0}
@media(min-width:720px){.lgs-page{padding-top:24px}.lgs-events{grid-template-columns:repeat(2,minmax(0,1fr))}.lgs-panel{padding:26px}.lgs-overview{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.lgs-new{max-width:360px}.lgs-modal .lgs-new{max-width:none}.lgs-stats{gap:16px}.lgs-stats>div{padding:20px}.lgs-finish>button{max-width:360px}.lgs-filter{max-width:360px}}
@media(max-width:360px){.lgs-page{padding-left:12px;padding-right:12px}.lgs-panel,.lgs-modal{padding:16px}.lgs-deck-grid{gap:6px}.lgs-deck-option img{height:90px}.lgs-date-grid{grid-template-columns:1fr}.lgs-row{flex-wrap:wrap}}

.lgs-page{padding:24px clamp(16px,3vw,64px) 40px;background:radial-gradient(ellipse at 92% 0%,color-mix(in srgb,var(--lgs-accent) 9%,transparent),transparent 45%),var(--lgs-bg)}
.lgs-top{margin-bottom:18px}.lgs-dashboard-heading{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:26px}.lgs-dashboard-heading h1{font-size:clamp(28px,3vw,44px)}.lgs-dashboard-heading .lgs-eyebrow{font-size:15px;letter-spacing:.12em}.lgs-store-label{display:flex;align-items:center;gap:10px;background:var(--lgs-panel);border-radius:14px;padding:12px 18px;font-weight:650;max-width:50%;overflow-wrap:anywhere}.lgs-store-label svg{flex-shrink:0;color:var(--lgs-accent)}
.lgs-section{margin-top:32px}.lgs-section-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px}.lgs-section-heading h2{font-size:24px;display:flex;align-items:center;gap:12px}.lgs-section-heading .lgs-filter{margin:0;min-width:240px}.lgs-start-empty{display:flex;align-items:center;gap:22px;text-align:left;min-height:156px;padding:28px}.lgs-start-empty>div{flex:1;min-width:0}.lgs-start-empty h3{font-size:22px}.lgs-empty-calendar{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:74px;height:74px;border-radius:22px;background:var(--lgs-soft);color:var(--lgs-accent)}.lgs-start-empty button{display:flex;align-items:center;justify-content:center;gap:10px}.lgs-history{background:var(--lgs-panel);border-radius:24px;padding:8px 24px;margin-top:28px}.lgs-history-heading{display:flex;align-items:center;gap:16px}.lgs-history-heading>svg{color:var(--lgs-accent);flex-shrink:0}.lgs-history .lgs-events{padding-bottom:18px}.lgs-history .lgs-event-card{background:var(--lgs-soft)}
.lgs-events{grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));align-items:stretch}.lgs-event-card{justify-content:flex-start;align-items:flex-start;padding:24px;gap:20px;box-shadow:0 6px 20px #17102005}.lgs-event-date{display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:var(--lgs-soft);color:var(--lgs-accent);width:70px;padding:12px 8px;border-radius:16px}.lgs-event-date strong{font-size:28px;margin-top:4px;line-height:1.15}.lgs-event-date>span{font-size:14px}.lgs-event-copy{min-width:0}.lgs-event-copy>strong{display:block;margin-top:10px;font-size:21px}.lgs-event-copy .lgs-pill{font-size:13px}.lgs-event-link{display:flex;align-items:center;gap:6px;margin-top:16px;font-size:16px;font-weight:650;color:var(--lgs-accent)}.lgs-event-card:hover:not(:disabled){box-shadow:0 9px 26px #17102010}.lgs-event-store{display:flex;align-items:center;gap:12px;background:var(--lgs-soft);padding:16px;border-radius:16px}.lgs-event-store>svg{color:var(--lgs-accent);flex-shrink:0}.lgs-event-store strong,.lgs-event-store span{display:block}.lgs-create-submit{display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px!important}.lgs-league-settings{background:var(--lgs-soft);padding:16px;border-radius:14px}.lgs-league-settings summary{cursor:pointer;font-weight:650;min-height:44px}.lgs-league-settings summary>span{display:block;font-weight:400;margin-top:4px}.lgs-league-settings input{background:var(--lgs-panel)}
.lgs-panel{min-width:0}.lgs-overview{grid-template-columns:repeat(auto-fit,minmax(min(100%,350px),1fr));align-items:start}.lgs-player-list{grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}.lgs-modal{max-width:600px}.lgs-modal .lgs-deck-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lgs-modal .lgs-roster{grid-template-columns:1fr}.lgs-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.lgs-heading .lgs-muted{overflow-wrap:anywhere}
@media(min-width:1600px){.lgs-hero{grid-template-columns:minmax(0,1fr) minmax(440px,.7fr)}.lgs-hero-break{display:none}.lgs-hero-features{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.lgs-hero-features>div{align-items:flex-start;flex-direction:column}.lgs-hero h2{max-width:850px}.lgs-events{grid-template-columns:repeat(auto-fill,minmax(360px,1fr))}}
@media(max-width:850px){.lgs-hero{grid-template-columns:1fr;gap:28px}.lgs-hero-features{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:20px}.lgs-hero-features>div{flex-direction:column;align-items:flex-start;gap:10px}.lgs-hero-features strong{font-size:16px}.lgs-hero-features strong+span{font-size:14px}.lgs-hero-break{display:none}.lgs-start-empty{flex-wrap:wrap}.lgs-start-empty button{margin-left:96px}.lgs-dashboard-heading{align-items:flex-start}.lgs-store-label{font-size:15px}.lgs-section-heading{align-items:flex-start;flex-wrap:wrap}}
@media(max-width:540px){.lgs-page{padding:16px 16px max(28px,env(safe-area-inset-bottom))}.lgs-dashboard-heading{flex-direction:column;gap:14px}.lgs-store-label{max-width:100%;padding:10px 14px}.lgs-hero{padding:24px;border-radius:22px}.lgs-hero h2{font-size:34px}.lgs-hero p{font-size:16px}.lgs-create-cta{width:100%;padding:15px 12px;font-size:18px!important;gap:9px}.lgs-hero-features{grid-template-columns:1fr;gap:16px;padding:18px}.lgs-hero-features>div{flex-direction:row;align-items:center;gap:12px}.lgs-feature-icon{width:42px;height:42px;border-radius:12px}.lgs-hero-features strong+span{font-size:14px}.lgs-start-empty{padding:22px;gap:16px}.lgs-empty-calendar{width:54px;height:54px;border-radius:16px}.lgs-start-empty h3{font-size:20px}.lgs-start-empty>div{flex-basis:calc(100% - 72px)}.lgs-start-empty button{width:100%;margin-left:0}.lgs-history{padding:6px 18px}.lgs-history-heading{gap:10px}.lgs-history-toggle strong{font-size:20px}.lgs-history-toggle .lgs-muted{font-size:14px}.lgs-section-heading .lgs-filter{min-width:0;width:100%;max-width:none}.lgs-event-card{padding:20px}.lgs-event-date{width:58px}.lgs-event-copy>strong{font-size:19px}}

.lgs-ui{--lgs-bg:#f5f5f7;--lgs-panel:#fff;--lgs-soft:#f0f1f4;--lgs-text:#222328;--lgs-muted:#696c75;--lgs-accent:#006bd6;--lgs-accent-text:#fff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
.dark .lgs-ui,.lgs-ui.dark,[data-theme="dark"] .lgs-ui{--lgs-bg:#151517;--lgs-panel:#222225;--lgs-soft:#2e2e33;--lgs-text:#f5f5f7;--lgs-muted:#b2b3bd;--lgs-accent:#90bfff;--lgs-accent-text:#10233f}
.lgs-page{background:var(--lgs-bg);padding:clamp(20px,3vw,44px) clamp(18px,3vw,56px);min-height:100dvh}.lgs-appbar{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:28px}.lgs-app-title{min-width:0}.lgs-brand{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--lgs-muted)}.lgs-appbar h1{font-size:30px;letter-spacing:-.035em;margin-top:3px}.lgs-appbar p{margin-top:4px;font-size:14px}.lgs-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lgs-toolbar button{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:10px 15px}.lgs-panel,.lgs-event-card,.lgs-history{box-shadow:0 3px 14px #00000004;border-radius:22px}.lgs-section{margin-top:22px}.lgs-start-empty{min-height:150px}.lgs-start-empty h3{font-size:20px}.lgs-section-heading h2{font-size:21px}.lgs-history-toggle strong{font-size:20px}.lgs-event-date{color:var(--lgs-muted)}.lgs-primary{border-radius:12px}.lgs-tabs{max-width:560px}.lgs-person{display:grid;grid-template-columns:64px minmax(0,1fr) minmax(100px,.6fr) 44px;gap:12px;padding:12px 16px;background:var(--lgs-panel);border-radius:14px}.lgs-player-list{grid-template-columns:1fr}.lgs-person-name strong{font-weight:650}.lgs-player-id{min-width:0;overflow-wrap:anywhere}.lgs-player-id>span{display:block;color:var(--lgs-muted);font-size:12px}.lgs-player-id>strong{font-size:14px;font-weight:500;font-variant-numeric:tabular-nums}.lgs-panel .lgs-person{background:var(--lgs-soft)}.lgs-entry-decks{margin:0;padding:0;border:0;min-width:0}.lgs-entry-decks legend{font-weight:600;margin-bottom:0}.lgs-entry-decks .lgs-deck-grid{margin:10px 0 0;gap:10px}.lgs-entry-decks .lgs-deck-option img{height:94px}.lgs-entry-decks .lgs-deck-option strong{font-size:13px}.lgs-entry-decks .lgs-quiet{font-size:14px;margin-top:4px}.lgs-saved-roster{margin-top:24px;padding-top:18px;border-top:1px solid var(--lgs-soft)}.lgs-roster-search{display:block;margin-top:12px;font-size:14px}.lgs-modal{max-width:640px;padding:24px;border-radius:24px}.lgs-roster-player>span:first-child{min-width:0;overflow-wrap:anywhere}.lgs-roster-player strong{display:block}.lgs-roster-player>span:first-child>span{font-size:13px}.lgs-ui input[readonly]{opacity:.7}.lgs-overview{gap:18px}.lgs-roster{max-height:230px;overflow:auto}
@media(min-width:1700px){.lgs-panel .lgs-player-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.lgs-appbar{align-items:flex-start;flex-direction:column;gap:16px}.lgs-toolbar{width:100%}.lgs-toolbar .lgs-primary{margin-left:auto}.lgs-appbar h1{font-size:28px}.lgs-person{grid-template-columns:52px minmax(0,1fr) 44px;padding:12px;gap:10px}.lgs-person .lgs-deck-thumb{width:52px;grid-row:1/3}.lgs-person-name{grid-column:2}.lgs-player-id{grid-column:2;grid-row:2}.lgs-player-id>span{display:inline;margin-right:6px}.lgs-person>.lgs-quiet{grid-column:3;grid-row:1/3}.lgs-modal{padding:20px}.lgs-entry-decks .lgs-deck-option img{height:78px}}

.lgs-ui .lgs-modal.lgs-finish-dialog{width:min(100%,520px);max-width:520px;flex-shrink:0;padding:28px;border-radius:24px}.lgs-finish-dialog>.lgs-row{align-items:flex-start;flex-wrap:nowrap;gap:16px}.lgs-finish-dialog .lgs-row h2{font-size:24px;line-height:1.3;margin:6px 0 0}.lgs-finish-dialog .lgs-row>button{flex-shrink:0;width:44px;padding:0}.lgs-ui .lgs-finish-description{margin:18px 0 0;font-size:16px;line-height:1.65;color:var(--lgs-muted)}.lgs-finish-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}.lgs-ui .lgs-finish-actions>button{width:100%;max-width:none;min-height:48px;margin:0;padding:12px 16px;font-size:16px;font-weight:600;border-radius:13px;line-height:1.4}
@media(max-width:420px){.lgs-ui .lgs-modal.lgs-finish-dialog{padding:22px}.lgs-finish-dialog .lgs-row h2{font-size:22px}.lgs-finish-actions{grid-template-columns:1fr;margin-top:24px;gap:10px}.lgs-finish-actions>.lgs-primary{grid-row:1}}

.lgs-ui .lgs-edited-link{display:flex;align-items:center;gap:8px;padding:8px 0;margin:-12px 0 16px;background:transparent;color:var(--lgs-accent);font-size:14px}.lgs-edited-link>span{color:var(--lgs-muted);font-size:13px;margin-left:4px}.lgs-ui .lgs-modal.lgs-edit-dialog{max-width:660px;padding:26px}.lgs-edit-intro{color:var(--lgs-muted);overflow-wrap:anywhere}.lgs-edit-list{display:grid;gap:14px;margin-top:20px}.lgs-edit-record{background:var(--lgs-soft);border-radius:18px;padding:18px;min-width:0}.lgs-edit-author{display:flex;align-items:center;gap:12px}.lgs-edit-author>div{min-width:0}.lgs-edit-author strong{display:block;font-size:16px;overflow-wrap:anywhere}.lgs-edit-author time{display:block;color:var(--lgs-muted);font-size:13px;margin-top:2px}.lgs-editor-avatar{width:44px;height:44px;flex-shrink:0;border-radius:14px;overflow:hidden;background:var(--lgs-panel);display:flex;align-items:center;justify-content:center;color:var(--lgs-accent);font-weight:700}.lgs-editor-avatar img{width:100%;height:100%;object-fit:cover}.lgs-ui .lgs-edit-description{margin-top:14px;font-weight:600;overflow-wrap:anywhere}.lgs-edit-changes{margin:10px 0 0;font-size:14px;display:grid;gap:10px}.lgs-edit-changes>div{display:grid;grid-template-columns:100px minmax(0,1fr);gap:12px}.lgs-edit-changes dt{color:var(--lgs-muted)}.lgs-edit-changes dd{margin:0;overflow-wrap:anywhere;white-space:pre-wrap;line-height:1.6}.lgs-edit-before{color:var(--lgs-muted)}.lgs-edit-arrow{display:inline-block;margin:0 8px;color:var(--lgs-muted)}.lgs-edit-changes summary{cursor:pointer;color:var(--lgs-accent)}.lgs-note-diff{margin-top:10px}.lgs-note-diff>span{font-size:12px;color:var(--lgs-muted);display:block;margin-top:10px}.lgs-ui .lgs-note-diff p{margin-top:3px;white-space:pre-wrap}.lgs-more-edits{width:100%;margin-top:16px}@media(max-width:440px){.lgs-ui .lgs-modal.lgs-edit-dialog{padding:20px}.lgs-edit-record{padding:15px}.lgs-edit-changes>div{grid-template-columns:1fr;gap:2px}.lgs-edited-link{flex-wrap:wrap}}

.lgs-ui{--lgs-bg:#f5f5f3;--lgs-panel:#fff;--lgs-soft:#efefec;--lgs-text:#292b2d;--lgs-muted:#686a6e;--lgs-accent:#775900;--lgs-accent-text:#292b2d}
.dark .lgs-ui,.lgs-ui.dark,[data-theme="dark"] .lgs-ui{--lgs-bg:#141617;--lgs-panel:#202324;--lgs-soft:#2c3032;--lgs-text:#f5f5f3;--lgs-muted:#b6b8b8;--lgs-accent:#ffda4b;--lgs-accent-text:#252728}
.lgs-ui .lgs-primary{background:#ffda4b;color:#252728}.lgs-ui .lgs-primary:hover:not(:disabled){background:#ffe376}.lgs-ui .lgs-id-edit{display:block;background:transparent;color:var(--lgs-accent);padding:4px 0;min-height:32px;font-size:13px;text-decoration:underline;text-underline-offset:3px}.lgs-player-id{align-self:center}.lgs-person{grid-template-columns:52px minmax(0,1fr) minmax(130px,.6fr) 44px;padding:10px 14px;min-height:80px}.lgs-person .lgs-deck-thumb{width:52px;min-height:60px!important}.lgs-person .lgs-deck-thumb img{height:54px}.lgs-player-list{grid-template-columns:1fr!important;gap:8px}.lgs-placement select{width:170px;max-width:50%;margin:0;flex-shrink:0}.lgs-placement{min-height:56px}.lgs-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;font-size:14px;color:var(--lgs-muted)}.lgs-pagination>div{display:flex;align-items:center;gap:10px}.lgs-pagination button{font-size:14px;padding:8px 12px;min-height:40px}.lgs-roster{max-height:none}.lgs-success-notice{position:fixed;bottom:24px;right:24px;z-index:10020;max-width:min(420px,calc(100vw - 32px));background:var(--lgs-panel);box-shadow:0 5px 30px #0002;pointer-events:none}.lgs-modal .lgs-success-notice{position:static;max-width:none;box-shadow:none;background:var(--lgs-soft)}.lgs-event-tile{background:var(--lgs-panel);border-radius:22px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.lgs-event-tile .lgs-event-card{border-radius:0;box-shadow:none;background:transparent;flex:1}.lgs-history .lgs-event-tile{background:var(--lgs-soft)}.lgs-history .lgs-event-tile .lgs-event-card{background:transparent}.lgs-card-edits{display:flex;align-items:center;gap:7px;background:transparent;color:var(--lgs-accent);padding:0 24px 16px;font-size:14px;text-align:left}.lgs-event-activity{margin-top:20px}.lgs-event-activity>summary{color:var(--lgs-muted);cursor:pointer;padding:10px 0;font-size:14px}.lgs-edit-sentences{display:grid;gap:10px;margin-top:12px;font-size:15px}.lgs-ui .lgs-edit-sentences p{margin:0;line-height:1.65;overflow-wrap:anywhere}.lgs-no-edits{padding:18px;background:var(--lgs-soft);border-radius:16px;margin-top:16px}.lgs-no-edits p{color:var(--lgs-muted);font-size:14px;line-height:1.6}.lgs-note-change>div{margin-top:12px;padding:12px;background:var(--lgs-panel);border-radius:12px}.lgs-note-change>div>span{font-size:12px;color:var(--lgs-muted)}.lgs-ui .lgs-note-change>div>p{white-space:pre-wrap;margin-top:5px}.lgs-id-dialog .lgs-finish-actions{margin-top:6px}
@media(max-width:650px){.lgs-person{grid-template-columns:52px minmax(0,1fr) 44px}.lgs-pagination{flex-wrap:wrap}.lgs-pagination>div{gap:8px}.lgs-pagination button{padding:8px 10px}.lgs-placement select{width:145px}.lgs-success-notice{bottom:16px;right:16px}.lgs-card-edits{padding-left:20px}}

.lgs-ui p.lgs-viewer-notice{margin:20px 0 24px;padding:16px 18px;line-height:1.6}
@media(max-width:719px){
  .lgs-page{width:100%;min-width:0;padding:calc(96px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(40px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
  .lgs-appbar{align-items:flex-start;flex-direction:column;gap:18px;margin-bottom:28px}
  .lgs-app-title,.lgs-heading>div{min-width:0;max-width:100%;overflow-wrap:anywhere}
  .lgs-appbar h1{font-size:28px}
  .lgs-toolbar{display:flex;flex-wrap:wrap;width:100%;gap:10px}
  .lgs-toolbar button{flex:1 1 auto;padding:12px;min-height:48px}
  .lgs-toolbar .lgs-primary{margin-left:0}
  .lgs-heading{flex-direction:column;gap:12px;margin:16px 0 24px}
  .lgs-heading h1{font-size:28px}
  .lgs-ui p.lgs-viewer-notice{margin:20px 0 24px;padding:16px}
  .lgs-panel{padding:18px}
  .lgs-row{flex-wrap:wrap;gap:12px}
  .lgs-row>h2,.lgs-row>h3{min-width:0}
  .lgs-stats{gap:8px}
  .lgs-stats>div{min-width:0;padding:14px 6px}
  .lgs-stats strong{font-size:26px}
  .lgs-stats span{display:block;font-size:13px;line-height:1.4;margin-top:4px}
  .lgs-tabs{width:100%;max-width:none}
  .lgs-tabs button{min-height:48px}
  .lgs-events,.lgs-overview{grid-template-columns:minmax(0,1fr)}
  .lgs-event-card{padding:18px;gap:14px}
  .lgs-event-date{width:54px}
  .lgs-event-copy>strong{font-size:19px}
  .lgs-person{grid-template-columns:52px minmax(0,1fr) 44px;padding:12px;gap:8px 10px}
  .lgs-person .lgs-deck-thumb{grid-column:1;grid-row:1/3}
  .lgs-person-name{grid-column:2;grid-row:1}
  .lgs-player-id{grid-column:2;grid-row:2}
  .lgs-player-id>span{display:inline;margin-right:6px}
  .lgs-person>.lgs-quiet{grid-column:3;grid-row:1/3;padding:0;width:44px}
  .lgs-ui .lgs-id-edit{min-height:44px;padding:10px 0;font-size:14px}
  .lgs-pagination{flex-direction:column;align-items:flex-start;gap:10px}
  .lgs-pagination>div{width:100%;justify-content:space-between;gap:6px;flex-wrap:wrap}
  .lgs-pagination button{min-height:44px;padding:8px 10px}
  .lgs-placement{flex-wrap:wrap;gap:8px}
  .lgs-placement>span{min-width:0}
  .lgs-placement select{width:145px}
  .lgs-overlay{padding:calc(16px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) calc(16px + env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}
  .lgs-ui .lgs-modal{min-width:0;max-height:calc(100dvh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));padding:18px}
  .lgs-modal>.lgs-row{flex-wrap:nowrap;align-items:flex-start}
  .lgs-modal>.lgs-row>button{flex-shrink:0}
  .lgs-date-grid{grid-template-columns:minmax(0,1fr)}
  .lgs-event-store>div{min-width:0;overflow-wrap:anywhere}
  .lgs-roster-player{flex-wrap:wrap}
  .lgs-roster-player>span:first-child{flex:1 1 140px}
  .lgs-table-wrap{max-width:100%}
  .lgs-ui .lgs-edited-link{flex-wrap:wrap}
  .lgs-success-notice{bottom:calc(16px + env(safe-area-inset-bottom,0px))}
}
@media(max-width:380px){
  .lgs-toolbar .lgs-primary{flex-basis:100%}
  .lgs-panel{padding:14px}
  .lgs-history{padding:6px 12px}
  .lgs-event-card{padding:16px;gap:12px}
  .lgs-modal .lgs-deck-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;
