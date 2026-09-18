import { onAuthIdentityChange } from "@/lib/auth-identity";
import { cardImagePaths } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
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
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
// New tables may not be in your generated Supabase types yet.
const db = supabase as unknown as SupabaseClient;
const DECKS = [
  { id: "TWILIGHTSPARKLE", name: "Twilight", image: cardImagePaths.fixed.tcgCardBacksPRR01BACK },
  { id: "FLUTTERSHY", name: "Fluttershy", image: cardImagePaths.fixed.tcgCardBacksPRR02BACK },
  { id: "PINKIEPIE", name: "Pinkie Pie", image: cardImagePaths.fixed.tcgCardBacksPRR03BACK },
  { id: "APPLEJACK", name: "Applejack", image: cardImagePaths.fixed.tcgCardBacksPRR04BACK },
  { id: "RAINBOWDASH", name: "Rainbow Dash", image: cardImagePaths.fixed.tcgCardBacksPRR05BACK },
  { id: "RARITY", name: "Rarity", image: cardImagePaths.fixed.tcgCardBacksPRR06BACK },
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
type EventPhoto = {
  id: string;
  event_id: string;
  store_id: string;
  storage_path: string;
  uploaded_by: string | null;
  width: number;
  height: number;
  file_size: number;
  created_at: string;
};
type Total = {
  player_id: string;
  player_name: string;
  events_attended: number;
  weeks_attended: number;
};
type Dialog =
  | "new"
  | "players"
  | "finish"
  | "edits"
  | "player_id"
  | "totals"
  | null;
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
        <CardImage
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
  const deck = DECKS.find((item) => item.id === id);
  return deck?.image ?? "";
}
function eventPhotoUrl(path: string) {
  return db.storage.from("lgs-event-gallery").getPublicUrl(path).data.publicUrl;
}
const EVENT_PHOTO_TARGET_BYTES = 2097152;
const EVENT_PHOTO_MAX_BYTES = 15728640;
function eventPhotoExtension(type: string, sourceName: string) {
  const extensions: Record<string, string> = {
    "image/avif": "avif",
    "image/bmp": "bmp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/tiff": "tiff",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const sourceExtension = sourceName
    .split(".")
    .pop()
    ?.toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return extensions[type] || sourceExtension || "image";
}
function eventPhotoSourceType(file: File) {
  if (file.type.startsWith("image/")) return file.type.toLocaleLowerCase();
  const extension = file.name.split(".").pop()?.toLocaleLowerCase();
  const types: Record<string, string> = {
    avif: "image/avif",
    bmp: "image/bmp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    tif: "image/tiff",
    tiff: "image/tiff",
    webp: "image/webp",
  };
  return extension ? types[extension] || "" : "";
}
function eventPhotoFormat(path: string) {
  const extension = path.split(".").pop()?.toLocaleUpperCase();
  return extension || "IMAGE";
}
async function convertEventPhoto(file: File) {
  if (!eventPhotoSourceType(file))
    throw new Error(`${file.name} is not an image.`);
  const objectUrl = URL.createObjectURL(file);
  try {
    let image: HTMLImageElement;
    try {
      image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error(`${file.name} could not be read.`));
        element.src = objectUrl;
      });
    } catch {
      if (file.size > EVENT_PHOTO_MAX_BYTES)
        throw new Error(
          `${file.name} cannot be resized by this browser and is larger than 15 MB.`,
        );
      return { blob: file as Blob, width: 0, height: 0 };
    }
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (!sourceWidth || !sourceHeight)
      throw new Error(`${file.name} has invalid dimensions.`);
    let longestEdge = Math.min(1600, Math.max(sourceWidth, sourceHeight));
    let lastBlob: Blob | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const scale = Math.min(
        1,
        longestEdge / Math.max(sourceWidth, sourceHeight),
      );
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser cannot prepare event photos.");
      context.drawImage(image, 0, 0, width, height);
      const quality = Math.max(0.58, 0.78 - attempt * 0.04);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (!blob) {
        if (file.size <= EVENT_PHOTO_MAX_BYTES)
          return { blob: file as Blob, width: sourceWidth, height: sourceHeight };
        throw new Error(
          `${file.name} cannot be resized by this browser and is larger than 15 MB.`,
        );
      }
      lastBlob = blob;
      lastWidth = width;
      lastHeight = height;
      if (blob.size <= EVENT_PHOTO_TARGET_BYTES)
        return { blob, width, height };
      longestEdge = Math.max(720, Math.round(longestEdge * 0.82));
    }
    if (!lastBlob || lastBlob.size > EVENT_PHOTO_MAX_BYTES)
      throw new Error(`${file.name} could not be reduced below 15 MB.`);
    return { blob: lastBlob, width: lastWidth, height: lastHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.dataset.theme === "light",
  );
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
  const [eventPhotos, setEventPhotos] = useState<EventPhoto[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoToDelete, setPhotoToDelete] = useState<EventPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
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
    setPhotoToDelete(null);
  }, [event?.id]);
  useEffect(() => {
    let mounted = true;
    let authChanged = false;
    const {
      data: { subscription },
    } = onAuthIdentityChange((_type, session) => {
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
  useEffect(() => {
    let mounted = true;
    let themeChannel: ReturnType<typeof supabase.channel> | null = null;
    const syncFromDocument = () => {
      if (mounted)
        setIsLightMode(document.documentElement.dataset.theme === "light");
    };
    const observer = new MutationObserver(syncFromDocument);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    if (userId === null) {
      setIsLightMode(false);
    } else if (userId) {
      db.from("user_light_mode_preferences")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle()
        .then(({ data, error: themeError }) => {
          if (!mounted) return;
          if (themeError)
            console.error("Unable to load LGS Boards theme preference:", themeError);
          else setIsLightMode(Boolean(data));
        });
      themeChannel = supabase
        .channel(`lgs-boards-theme-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_light_mode_preferences",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (mounted) setIsLightMode(payload.eventType !== "DELETE");
          },
        )
        .subscribe();
    }
    return () => {
      mounted = false;
      observer.disconnect();
      if (themeChannel) supabase.removeChannel(themeChannel);
    };
  }, [userId]);
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
      setEventPhotos([]);
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
        setEventPhotos([]);
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
    setEventPhotos([]);
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
      setEventPhotos([]);
      throw new Error("This event is no longer available to your account.");
    }
    const current = result.data as LGSEvent;
    const [people, winners, savedPlayers, photos] = await Promise.all([
      fetchAll<Attendance>("lgs_attendance", "checked_in_at", { event_id: id }),
      fetchAll<Raffle>("lgs_raffles", "drawn_at", { event_id: id }),
      fetchAll<Player>("lgs_players", "name", { store_id: current.store_id }),
      fetchAll<EventPhoto>("lgs_event_photos", "created_at", { event_id: id }),
    ]);
    if (eventRef.current !== id) return;
    setEvent(current);
    setAttendees(people);
    setRaffles(winners);
    setEventPhotos(photos);
    setRoster(savedPlayers);
    if (resetNotes) {
      setNotes(current.notes);
      setTotals(null);
      setParticipantPage(1);
      setPhotoIndex(0);
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
  const showTotals = () => {
    setDialog("totals");
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
  };
  const uploadEventPhotos = (files: File[]) => {
    if (!files.length) return;
    void run(async () => {
      if (!event || !canManage || !userId)
        throw new Error("You do not have permission to add event photos.");
      const remaining = 24 - eventPhotos.length;
      if (remaining <= 0)
        throw new Error("This event gallery already has its maximum of 24 photos.");
      const selected = files.slice(0, remaining);
      const added: EventPhoto[] = [];
      for (const file of selected) {
        const converted = await convertEventPhoto(file);
        const contentType = converted.blob.type || eventPhotoSourceType(file);
        if (!contentType.startsWith("image/"))
          throw new Error(`${file.name} does not provide a supported image type.`);
        const extension = eventPhotoExtension(contentType, file.name);
        const path = `${event.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await db.storage
          .from("lgs-event-gallery")
          .upload(path, converted.blob, {
            cacheControl: "31536000",
            contentType,
            upsert: false,
          });
        if (upload.error) throw upload.error;
        const created = await db
          .from("lgs_event_photos")
          .insert({
            event_id: event.id,
            store_id: event.store_id,
            storage_path: path,
            uploaded_by: userId,
            width: converted.width,
            height: converted.height,
            file_size: converted.blob.size,
          })
          .select("*")
          .single();
        if (created.error) {
          await db.storage.from("lgs-event-gallery").remove([path]);
          throw created.error;
        }
        added.push(created.data as EventPhoto);
      }
      setPhotoIndex(eventPhotos.length);
      setEventPhotos((previous) => [...previous, ...added]);
      const skipped = files.length - selected.length;
      setNotice(
        `${added.length} ${added.length === 1 ? "photo" : "photos"} added${skipped > 0 ? ` · ${skipped} skipped because the gallery is full` : ""}.`,
      );
    });
  };
  const deleteEventPhoto = () => {
    if (!photoToDelete) return;
    void run(async () => {
      if (!event || !canManage)
        throw new Error("You do not have permission to delete event photos.");
      const target = photoToDelete;
      const storageDelete = await db.storage
        .from("lgs-event-gallery")
        .remove([target.storage_path]);
      if (storageDelete.error) throw storageDelete.error;
      const rowDelete = await db
        .from("lgs_event_photos")
        .delete()
        .eq("id", target.id)
        .eq("event_id", event.id)
        .eq("store_id", event.store_id)
        .select("id")
        .single();
      if (rowDelete.error) throw rowDelete.error;
      const remainingPhotos = eventPhotos.filter(
        (photo) => photo.id !== target.id,
      );
      setEventPhotos(remainingPhotos);
      setPhotoIndex(
        Math.min(photoIndex, Math.max(0, remainingPhotos.length - 1)),
      );
      setPhotoToDelete(null);
      setNotice("Photo deleted.");
    });
  };
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
          <span className="lgs-event-meta">
            <span>{dateLabel(item.event_date)}</span>
            {staff?.role === "ALLGS" && stores.length > 1 && (
              <span>{stores.find((store) => store.id === item.store_id)?.name ?? "Store"}</span>
            )}
            {item.league_name && <span>{item.league_name}</span>}
          </span>
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
  const safePhotoIndex = Math.min(
    photoIndex,
    Math.max(0, eventPhotos.length - 1),
  );
  const activePhoto = eventPhotos[safePhotoIndex] ?? null;
  return (
    <main className={`lgs-ui lgs-page${isLightMode ? "" : " dark"}`}>
      <style>{STYLES}</style>
      <header className="lgs-logo-header" aria-label="MLPEKAYOU">
        <span className="lgs-logo-rail" aria-hidden="true" />
        <button
          type="button"
          className="lgs-logo-home"
          onClick={() => navigate("/")}
          aria-label="MLPEKAYOU home"
        >
          <CardImage
            className="lgs-logo-light"
            src="/website-assets/mlpekayouwiki4.webp"
            alt="MLP Kayou Wiki"
          />
          <CardImage
            className="lgs-logo-dark"
            src="/website-assets/darkmodelogo.webp"
            alt="MLP Kayou Wiki"
          />
        </button>
        <span className="lgs-logo-rail lgs-logo-rail-right" aria-hidden="true" />
      </header>
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
                  <div className="lgs-player-list lgs-attendance-list">
                    {pageAttendees.map((person) => (
                      <div
                        key={person.player_id}
                        className={`lgs-person${person.deck ? " has-deck" : ""}`}
                      >
                        <button
                          type="button"
                          className={`lgs-deck-thumb${person.deck ? " has-deck" : ""}`}
                          disabled={!editable || busy}
                          onClick={() => setDeckPlayer(person)}
                          aria-label={`Choose deck for ${person.player_name}`}
                        >
                          {person.deck ? (
                            <CardImage
                              src={deckImage(person.deck)}
                              alt={
                                DECKS.find((deck) => deck.id === person.deck)
                                  ?.name ?? "Deck"
                              }
                              className="lgs-deck-back-image lgs-deck-image-thumb"
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
              <section className="lgs-panel lgs-prizes-panel">
                <div className="lgs-prizes-heading">
                  <div>
                    <h2>Event prizes</h2>
                    <p className="lgs-muted">
                      Every attendee gets one chance per drawing. Winners sit
                      out the remaining drawings for this event.
                    </p>
                  </div>
                  <span className="lgs-pill">
                    {raffles.length} of {attendees.length} awarded
                  </span>
                </div>
                <div className="lgs-prizes-layout">
                  <div className="lgs-prize-draw">
                    <span className="lgs-prize-kicker">Next drawing</span>
                    <strong>
                      {Math.max(0, attendees.length - raffles.length)} eligible
                      players
                    </strong>
                    <p className="lgs-muted">
                      Name the prize, then draw one eligible player at random.
                    </p>
                    {editable ? (
                      <form
                        className="lgs-prize-form"
                        onSubmit={(form) => {
                          form.preventDefault();
                          mutate(
                            "draw",
                            {
                              label:
                                raffleLabel.trim() ||
                                `Prize ${raffles.length + 1}`,
                            },
                            "Raffle winner saved.",
                          );
                          setRaffleLabel("");
                        }}
                      >
                        <label>
                          Prize name <span className="lgs-muted">(optional)</span>
                          <input
                            value={raffleLabel}
                            onChange={(change) =>
                              setRaffleLabel(change.target.value)
                            }
                            maxLength={100}
                            placeholder={`Prize ${raffles.length + 1}`}
                            disabled={busy}
                          />
                        </label>
                        <button
                          className="lgs-primary"
                          type="submit"
                          disabled={busy || attendees.length <= raffles.length}
                        >
                          Draw a winner
                        </button>
                      </form>
                    ) : (
                      <p className="lgs-prize-readonly">
                        Drawings are available while this event is open.
                      </p>
                    )}
                  </div>
                  <div className="lgs-prize-history">
                    <div className="lgs-prize-history-heading">
                      <h3>Prize history</h3>
                      <span>{raffles.length}</span>
                    </div>
                    {raffles.length === 0 ? (
                      <div className="lgs-prize-empty">
                        <strong>No prizes awarded yet</strong>
                        <span>The first winner will appear here.</span>
                      </div>
                    ) : (
                      <div className="lgs-raffle-results">
                        {raffles.map((raffle, index) => (
                          <div className="lgs-raffle" key={raffle.id}>
                            <span className="lgs-raffle-number">{index + 1}</span>
                            <span className="lgs-raffle-copy">
                              <span>{raffle.label}</span>
                              <strong>{raffle.winner_name}</strong>
                            </span>
                            <time dateTime={raffle.drawn_at}>
                              {new Date(raffle.drawn_at).toLocaleString()}
                            </time>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            {tab === "overview" && (
              <div className="lgs-overview">
                <section className="lgs-panel lgs-overview-decks">
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
                          <span className="lgs-deck-image-frame">
                            <CardImage
                              src={deck.image}
                              alt={deck.name}
                              className="lgs-deck-back-image"
                            />
                          </span>
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
                <section className="lgs-panel lgs-overview-totals">
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
                    className="lgs-secondary lgs-totals-button"
                    disabled={busy}
                    onClick={showTotals}
                  >
                    View attendance totals
                  </button>
                  <div className="lgs-prize-log">
                    <h3>Prizes given out</h3>
                    {raffles.length === 0 ? (
                      <p className="lgs-muted">No prizes have been given out yet.</p>
                    ) : (
                      <ul>
                        {raffles.map((raffle) => (
                          <li key={raffle.id}>
                            <strong>{raffle.label}</strong> given out!
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
                <section className="lgs-panel lgs-overview-placements">
                  <h2>Final placements</h2>
                  <p className="lgs-muted">
                    Choose a finishing place for each of the {attendees.length}{" "}
                    players.
                  </p>
                  <div className="lgs-placement-grid">
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
                  </div>
                  <Pagination
                    count={attendees.length}
                    page={safeParticipantPage}
                    onPage={setParticipantPage}
                    disabled={busy}
                    label="Placements"
                  />
                </section>
                <section className="lgs-panel lgs-overview-notes">
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
                <section className="lgs-panel lgs-overview-gallery">
                  <div className="lgs-gallery-heading">
                    <div>
                      <h2>Event gallery</h2>
                      <p className="lgs-muted">
                        Photos are optimized before upload when your browser supports it.
                      </p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        className="lgs-secondary lgs-gallery-add"
                        disabled={busy || eventPhotos.length >= 24}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <ImagePlus size={18} aria-hidden="true" />
                        {eventPhotos.length >= 24 ? "Gallery full" : "Add photos"}
                      </button>
                    )}
                    <input
                      ref={photoInputRef}
                      className="lgs-gallery-input"
                      type="file"
                      accept="image/*,.heic,.heif"
                      multiple
                      tabIndex={-1}
                      aria-hidden="true"
                      onChange={(change) => {
                        const files = Array.from(change.target.files ?? []);
                        change.target.value = "";
                        uploadEventPhotos(files);
                      }}
                    />
                  </div>
                  {activePhoto ? (
                    <>
                      <div className="lgs-gallery-stage">
                        <img
                          src={eventPhotoUrl(activePhoto.storage_path)}
                          alt={`Event photo ${safePhotoIndex + 1}`}
                        />
                        {canManage && (
                          <button
                            type="button"
                            className="lgs-gallery-delete"
                            disabled={busy}
                            onClick={() => setPhotoToDelete(activePhoto)}
                            aria-label={`Delete event photo ${safePhotoIndex + 1}`}
                          >
                            <X size={20} aria-hidden="true" />
                          </button>
                        )}
                        {eventPhotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="lgs-gallery-arrow lgs-gallery-previous"
                              onClick={() =>
                                setPhotoIndex(
                                  (safePhotoIndex - 1 + eventPhotos.length) %
                                    eventPhotos.length,
                                )
                              }
                              aria-label="Previous event photo"
                            >
                              <ChevronLeft size={24} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="lgs-gallery-arrow lgs-gallery-next"
                              onClick={() =>
                                setPhotoIndex(
                                  (safePhotoIndex + 1) % eventPhotos.length,
                                )
                              }
                              aria-label="Next event photo"
                            >
                              <ChevronRight size={24} aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="lgs-gallery-meta">
                        <span>
                          {safePhotoIndex + 1} of {eventPhotos.length}
                        </span>
                        <span>
                          {activePhoto.width > 0 && activePhoto.height > 0
                            ? `${activePhoto.width} × ${activePhoto.height} `
                            : ""}
                          {eventPhotoFormat(activePhoto.storage_path)} ·{" "}
                          {Math.max(1, Math.round(activePhoto.file_size / 1024))} KB
                        </span>
                      </div>
                      {eventPhotos.length > 1 && (
                        <div className="lgs-gallery-thumbnails" aria-label="Event photos">
                          {eventPhotos.map((photo, index) => (
                            <button
                              type="button"
                              key={photo.id}
                              className={index === safePhotoIndex ? "selected" : ""}
                              onClick={() => setPhotoIndex(index)}
                              aria-label={`Show event photo ${index + 1}`}
                              aria-current={index === safePhotoIndex ? "true" : undefined}
                            >
                              <img src={eventPhotoUrl(photo.storage_path)} alt="" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="lgs-gallery-empty">
                      <ImagePlus size={30} aria-hidden="true" />
                      <strong>No event photos yet</strong>
                      <span>
                        Add up to 24 photos. They appear here immediately with no approval step.
                      </span>
                    </div>
                  )}
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
              {!loading && active.length === 0 && (
                <p className="lgs-open-empty">
                  {canCreate ? "No open events. Use New Event to get started." : "No open events for this store right now."}
                </p>
              )}
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
                    <span className="lgs-deck-image-frame">
                      <CardImage
                        src={deck.image}
                        alt=""
                        className="lgs-deck-back-image"
                      />
                    </span>
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
      {staff && event && dialog === "totals" && (
        <Modal
          title="Attendance totals"
          close={closeDialog}
          busy={busy}
          className="lgs-totals-dialog"
        >
          {messages}
          <p className="lgs-muted">
            {dateLabel(event.league_start)} – {dateLabel(event.league_end)}
          </p>
          <p className="lgs-muted">
            All store events in this period. Weeks are seven-day blocks from
            the start date.
          </p>
          {busy && !totals && (
            <p className="lgs-empty" role="status">
              Loading attendance totals…
            </p>
          )}
          {totals && (
            <div className="lgs-table-wrap lgs-totals-table">
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
                <p className="lgs-empty">No attendance in this period.</p>
              )}
            </div>
          )}
          <button
            type="button"
            className="lgs-secondary lgs-refresh-totals"
            disabled={busy}
            onClick={showTotals}
          >
            Refresh totals
          </button>
        </Modal>
      )}
      {staff && event && photoToDelete && (
        <Modal
          title="Are you sure you wanna delete this photo?"
          close={() => setPhotoToDelete(null)}
          busy={busy}
          className="lgs-delete-photo-dialog"
        >
          {messages}
          <img
            src={eventPhotoUrl(photoToDelete.storage_path)}
            alt="Event photo selected for deletion"
            className="lgs-delete-photo-preview"
          />
          <p className="lgs-muted">
            This permanently removes the photo from the event gallery. It
            cannot be recovered.
          </p>
          <div className="lgs-finish-actions">
            <button
              type="button"
              className="lgs-secondary"
              disabled={busy}
              onClick={() => setPhotoToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="lgs-delete-confirm"
              disabled={busy}
              onClick={deleteEventPhoto}
            >
              {busy ? "Deleting…" : "Delete photo"}
            </button>
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
                <span className="lgs-deck-image-frame">
                  <CardImage
                    src={deck.image}
                    alt=""
                    className="lgs-deck-back-image"
                  />
                </span>
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
  .lgs-page{width:100%;min-width:0;padding:calc(48px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(40px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
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

.lgs-logo-header{display:none}
@media(min-width:720px){
  .lgs-page{padding-top:calc(64px + clamp(20px,3vw,44px))}
  .lgs-logo-header{position:fixed;inset:0 0 auto;z-index:100;height:64px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#fff 0%,#fffdf7 72%,#fffaf0 100%);box-shadow:0 10px 40px rgba(160,120,20,.14),0 0 30px rgba(231,200,75,.16),inset 0 -1px 0 rgba(190,145,30,.30)}
  .lgs-ui .lgs-logo-home{display:flex;align-items:center;justify-content:center;width:120px;height:54px;padding:0;background:transparent;border-radius:8px}
  .lgs-logo-home img{height:42px;width:auto;object-fit:contain;transform:translateY(1px) scale(1.9);filter:drop-shadow(0 4px 12px rgba(0,0,0,.18))}
  .lgs-logo-light{display:block}
  .lgs-logo-dark{display:none}
  .dark .lgs-logo-header,.lgs-ui.dark .lgs-logo-header,[data-theme="dark"] .lgs-logo-header{background:linear-gradient(180deg,#0d1113 0%,#0b0e10 72%,#090b0d 100%);box-shadow:0 10px 35px rgba(0,0,0,.45),inset 0 -1px 0 rgba(250,204,21,.10)}
  .dark .lgs-logo-light,.lgs-ui.dark .lgs-logo-light,[data-theme="dark"] .lgs-logo-light{display:none}
  .dark .lgs-logo-dark,.lgs-ui.dark .lgs-logo-dark,[data-theme="dark"] .lgs-logo-dark{display:block}
}

/* Compact boards and event history. */
.lgs-shell{max-width:1400px}
.lgs-appbar{margin-bottom:22px;gap:18px}
.lgs-appbar h1{font-size:28px}
.lgs-brand{display:none}
.lgs-appbar p{font-size:15px}
.lgs-toolbar .lgs-secondary{background:var(--lgs-panel)}
.lgs-section-heading{margin-bottom:14px;gap:14px}
.lgs-section-heading h2{font-size:20px;gap:10px}
.lgs-section-heading p{margin-top:4px;font-size:14px}
.lgs-section-heading h2 .lgs-pill{padding:3px 10px;font-size:14px;color:var(--lgs-muted)}
.lgs-events{gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}
.lgs-event-tile{border-radius:16px;box-shadow:0 2px 8px #00000006}
.lgs-event-tile .lgs-event-card{padding:18px;gap:14px;align-items:center}
.lgs-event-date{width:52px;padding:8px 6px;border-radius:12px;color:var(--lgs-accent)}
.lgs-event-date>svg{display:none}
.lgs-event-date strong{font-size:24px;margin:0}
.lgs-event-date>span{font-size:13px}
.lgs-event-copy{flex:1}
.lgs-event-copy>strong{font-size:18px;line-height:1.35;margin-top:6px}
.lgs-event-copy .lgs-pill{padding:3px 9px;font-size:12px}
.lgs-event-meta{display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:5px;color:var(--lgs-muted);font-size:14px;line-height:1.5}
.lgs-event-meta>span{overflow-wrap:anywhere}
.lgs-event-link{font-size:14px;margin-top:10px}
.lgs-ui .lgs-card-edits{padding:8px 18px;min-height:44px;font-size:13px;background:color-mix(in srgb,var(--lgs-accent) 5%,var(--lgs-panel))}
.lgs-ui p.lgs-open-empty{padding:18px;margin:0;background:var(--lgs-panel);border-radius:14px;color:var(--lgs-muted);font-size:15px}
.lgs-history{padding:0;margin-top:24px;background:transparent;box-shadow:none}
.lgs-history-toggle{padding:12px 0;margin-bottom:4px}
.lgs-history-heading{gap:10px}
.lgs-history-heading>svg{width:21px;height:21px}
.lgs-history-toggle strong{font-size:19px}
.lgs-history-toggle .lgs-muted{font-size:14px;margin-top:2px}
.lgs-history-toggle>span:last-child{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:var(--lgs-panel);font-size:22px}
.lgs-history .lgs-events{grid-template-columns:1fr;gap:8px;padding-bottom:0}
.lgs-history .lgs-event-tile{background:var(--lgs-panel);border-radius:12px}
.lgs-history .lgs-event-card{padding:12px 16px;gap:12px}
.lgs-history .lgs-event-date{width:44px;padding:6px;border-radius:9px}
.lgs-history .lgs-event-date strong{font-size:21px}
.lgs-history .lgs-event-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:16px;align-items:center}
.lgs-history .lgs-event-copy>.lgs-pill{display:none}
.lgs-history .lgs-event-copy>strong{grid-column:1;grid-row:1;margin:0;font-size:16px}
.lgs-history .lgs-event-meta{grid-column:1;grid-row:2;margin-top:3px;font-size:13px}
.lgs-history .lgs-event-link{grid-column:2;grid-row:1/3;margin:0;white-space:nowrap}
.lgs-history .lgs-card-edits{padding:6px 16px 6px 72px}
.lgs-stats{gap:10px;margin-bottom:18px}
.lgs-stats>div{padding:12px 10px;border-radius:14px;background:var(--lgs-panel)}
.lgs-stats strong{font-size:25px;color:var(--lgs-accent)}
.lgs-tabs{padding:4px;gap:4px;border-radius:12px}
.lgs-tabs button{border-radius:9px}
.lgs-tabs .selected{box-shadow:0 2px 5px #0000000a;color:var(--lgs-accent)}
.lgs-panel{border-radius:16px}
.lgs-heading{margin-bottom:18px}
@media(hover:hover){
  .lgs-event-tile .lgs-event-card:hover:not(:disabled){background:color-mix(in srgb,var(--lgs-accent) 5%,var(--lgs-panel));box-shadow:none}
  .lgs-toolbar .lgs-secondary:hover:not(:disabled){background:var(--lgs-soft)}
}
@media(min-width:720px){
  .lgs-logo-header{gap:28px}
  .lgs-logo-rail{display:flex;align-items:center;gap:4px}
  .lgs-logo-rail::before{content:"";width:32px;height:1px;background:linear-gradient(90deg,transparent,rgba(250,204,21,.5))}
  .lgs-logo-rail::after{content:"";width:4px;height:4px;background:#facc15;box-shadow:0 0 7px #facc15}
  .lgs-logo-rail-right{transform:rotate(180deg)}
  .lgs-logo-header::before,.lgs-logo-header::after{content:"";position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(250,204,21,.35),transparent);pointer-events:none}
  .lgs-logo-header::before{top:0}
  .lgs-logo-header::after{bottom:0}
}
@media(max-width:719px){
  .lgs-appbar{gap:14px;margin-bottom:20px}
  .lgs-history .lgs-event-card{padding:12px;gap:10px}
  .lgs-history .lgs-event-copy{column-gap:8px}
  .lgs-history .lgs-event-link{font-size:13px}
  .lgs-history .lgs-card-edits{padding-left:66px}
  .lgs-history-heading{align-items:flex-start}
  .lgs-history-heading>svg{margin-top:3px}
}
@media(max-width:420px){
  .lgs-history .lgs-event-copy{grid-template-columns:minmax(0,1fr)}
  .lgs-history .lgs-event-link{grid-column:1;grid-row:3;margin-top:5px}
}

/* Crop the white canvas baked around the six PRR deck-back images. */
.lgs-deck-image-frame{position:relative;display:block;width:78px;height:110px;margin:0 auto 8px;overflow:hidden;border-radius:6px;background:transparent}
.lgs-deck-image-frame .lgs-deck-back-image{position:absolute;top:50%;left:50%;display:block;width:auto!important;max-width:none;height:114px!important;object-fit:contain;transform:translate(-50%,-50%)}
.lgs-deck-thumb{overflow:hidden;border-radius:5px}
.lgs-person.has-deck{grid-template-columns:68px minmax(0,1fr) minmax(130px,.6fr) 44px}
.lgs-deck-thumb.has-deck{position:relative;width:68px;min-height:96px!important;height:96px;padding:0;background:transparent;border-radius:6px;overflow:hidden}
.lgs-person .lgs-deck-thumb.has-deck .lgs-deck-image-thumb{position:absolute;top:50%;left:50%;display:block;width:auto!important;max-width:none;height:100px!important;margin:0;border-radius:0;object-fit:contain;transform:translate(-50%,-50%)}
.lgs-entry-decks .lgs-deck-image-frame{width:67px;height:94px;border-radius:5px}
.lgs-entry-decks .lgs-deck-image-frame .lgs-deck-back-image{height:98px!important}

/* Attendance uses two compact entrant cards per row on desktop only. */
.lgs-attendance-list{grid-template-columns:minmax(0,1fr)!important}
@media(min-width:1000px){
  .lgs-panel .lgs-attendance-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
@media(max-width:650px){
  .lgs-person.has-deck{grid-template-columns:68px minmax(0,1fr) 44px}
  .lgs-entry-decks .lgs-deck-image-frame{width:55px;height:78px;border-radius:4px}
  .lgs-entry-decks .lgs-deck-image-frame .lgs-deck-back-image{height:82px!important}
}

/* Keep the overview compact and stable as participant counts grow. */
.lgs-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:"decks notes totals" "gallery gallery gallery" "placements placements placements";gap:18px;align-items:stretch}
.lgs-overview>.lgs-panel{align-self:stretch;height:auto;min-width:0}
.lgs-overview-decks{grid-area:decks}
.lgs-overview-notes{grid-area:notes;display:flex;flex-direction:column}
.lgs-overview-placements{grid-area:placements}
.lgs-overview-totals{grid-area:totals;display:flex;flex-direction:column}
.lgs-overview-gallery{grid-area:gallery;display:flex;flex-direction:column;align-self:stretch!important;height:auto!important;min-height:300px}
.lgs-gallery-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.lgs-gallery-heading>div{min-width:0}
.lgs-ui .lgs-gallery-add{display:flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;margin:0}
.lgs-ui input.lgs-gallery-input{display:none!important}
.lgs-gallery-stage{position:relative;flex:1;min-height:220px;margin-top:18px;overflow:hidden;border-radius:14px;background:var(--lgs-soft)}
.lgs-gallery-stage>img{display:block;width:100%;height:100%;min-height:220px;max-height:420px;object-fit:contain}
.lgs-gallery-delete{position:absolute;top:12px;right:12px;z-index:2;display:flex;align-items:center;justify-content:center;width:44px;min-height:44px!important;padding:0;border-radius:999px;background:rgba(20,22,23,.82);color:#fff;box-shadow:0 3px 14px rgba(0,0,0,.24);backdrop-filter:blur(8px)}
.lgs-gallery-delete:hover:not(:disabled){background:#a62b27}
.lgs-gallery-arrow{position:absolute;top:50%;display:flex;align-items:center;justify-content:center;width:44px;min-height:44px!important;padding:0;border-radius:999px;background:rgba(20,22,23,.78);color:#fff;transform:translateY(-50%);backdrop-filter:blur(8px)}
.lgs-gallery-previous{left:12px}.lgs-gallery-next{right:12px}
.lgs-gallery-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;color:var(--lgs-muted);font-size:12px}
.lgs-gallery-thumbnails{display:flex;gap:8px;margin-top:10px;padding-bottom:2px;overflow-x:auto;scrollbar-width:thin}
.lgs-gallery-thumbnails button{width:66px;height:50px;min-height:50px;flex:0 0 66px;padding:0;overflow:hidden;border-radius:8px;background:var(--lgs-soft);opacity:.62}
.lgs-gallery-thumbnails button.selected{opacity:1;box-shadow:inset 0 0 0 2px var(--lgs-accent)}
.lgs-gallery-thumbnails img{display:block;width:100%;height:100%;object-fit:cover}
.lgs-gallery-empty{display:flex;flex:1;min-height:220px;margin-top:18px;padding:24px;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed color-mix(in srgb,var(--lgs-muted) 38%,transparent);border-radius:14px;background:var(--lgs-soft);color:var(--lgs-muted)}
.lgs-gallery-empty strong{margin-top:12px;color:var(--lgs-text);font-size:17px}
.lgs-gallery-empty span{max-width:440px;margin-top:5px;font-size:14px;line-height:1.5}
.lgs-placement-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:10px;margin-top:16px}
.lgs-overview .lgs-placement{display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,160px);align-items:center;gap:12px;min-height:0;margin:0;padding:12px 14px;background:var(--lgs-soft);border-radius:12px}
.lgs-overview .lgs-placement>span{font-weight:650;line-height:1.35}
.lgs-overview .lgs-placement select{width:100%;max-width:none;min-height:44px;margin:0;padding:9px 10px;background:var(--lgs-panel)}
.lgs-overview .lgs-pagination{margin-top:16px}
.lgs-ui .lgs-totals-button{display:block;width:auto;margin:18px 0 0}
.lgs-overview-notes .lgs-form{display:flex;flex:1;min-height:0;margin-top:14px;gap:12px;flex-direction:column}
.lgs-overview-notes textarea{flex:1;min-height:260px;margin-top:0}
.lgs-prize-log{display:flex;flex:1;min-height:0;margin-top:24px;padding:16px;flex-direction:column;overflow:hidden;border-radius:12px;background:var(--lgs-soft)}
.lgs-prize-log h3{font-size:15px}
.lgs-prize-log>p{margin-top:8px}
.lgs-prize-log ul{flex:1;min-height:0;margin:10px -6px 0 0;padding:0 8px 0 20px;overflow-y:auto;scrollbar-width:thin}
.lgs-prize-log li{padding:8px 0;line-height:1.4}
.lgs-prize-log li+li{border-top:1px solid color-mix(in srgb,var(--lgs-muted) 20%,transparent)}
.lgs-ui .lgs-modal.lgs-totals-dialog{width:min(100%,720px);max-width:720px}
.lgs-totals-dialog .lgs-totals-table{margin-top:20px}
.lgs-ui .lgs-refresh-totals{width:100%;margin-top:18px}
.lgs-ui .lgs-modal.lgs-delete-photo-dialog{width:min(100%,520px);max-width:520px}
.lgs-delete-photo-preview{display:block;width:100%;max-height:300px;margin-top:18px;object-fit:contain;border-radius:14px;background:var(--lgs-soft)}
.lgs-ui .lgs-delete-photo-dialog>p{margin-top:16px;line-height:1.6}
.lgs-ui .lgs-delete-confirm{width:100%;min-height:48px;margin:0;padding:12px 16px;border-radius:13px;background:#b42318;color:#fff;font-weight:700}
.lgs-ui.dark .lgs-delete-confirm{background:#d84d47;color:#fff}
.lgs-ui .lgs-delete-confirm:hover:not(:disabled){background:#921f19}

/* Give the prize screen a clear drawing area and a compact winner history. */
.lgs-prizes-panel{padding:0;overflow:hidden}
.lgs-prizes-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:24px 26px;border-bottom:1px solid color-mix(in srgb,var(--lgs-muted) 16%,transparent)}
.lgs-prizes-heading>div{min-width:0;max-width:720px}
.lgs-prizes-heading .lgs-pill{flex-shrink:0}
.lgs-prizes-layout{display:grid;grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr);min-height:360px}
.lgs-prize-draw{display:flex;padding:26px;flex-direction:column;background:color-mix(in srgb,var(--lgs-soft) 62%,var(--lgs-panel))}
.lgs-prize-kicker{color:var(--lgs-accent);font-size:12px;font-weight:750;letter-spacing:.09em;text-transform:uppercase}
.lgs-prize-draw>strong{margin-top:8px;font-size:25px;line-height:1.2}
.lgs-prize-draw>p{margin-top:8px;line-height:1.55}
.lgs-prize-form{display:flex;flex:1;margin-top:24px;flex-direction:column;justify-content:flex-end;gap:14px}
.lgs-prize-form label{font-size:14px}
.lgs-prize-form input{background:var(--lgs-panel)}
.lgs-prize-form .lgs-primary{width:100%;min-height:50px}
.lgs-prize-readonly{margin-top:auto!important;padding:14px;border-radius:12px;background:var(--lgs-panel);color:var(--lgs-muted)}
.lgs-prize-history{min-width:0;padding:24px 26px}
.lgs-prize-history-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}
.lgs-prize-history-heading h3{font-size:17px}
.lgs-prize-history-heading>span{display:flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 8px;border-radius:999px;background:var(--lgs-soft);color:var(--lgs-muted);font-size:13px;font-weight:700}
.lgs-prize-empty{display:flex;min-height:250px;align-items:center;justify-content:center;flex-direction:column;text-align:center;color:var(--lgs-muted)}
.lgs-prize-empty strong{color:var(--lgs-text);font-size:17px}
.lgs-prize-empty span{margin-top:4px;font-size:14px}
.lgs-raffle-results{display:grid;gap:8px;max-height:330px;margin-top:16px;padding-right:4px;overflow-y:auto;scrollbar-width:thin}
.lgs-raffle-results .lgs-raffle{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px;border-radius:12px;background:var(--lgs-soft)}
.lgs-raffle-number{display:flex!important;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:var(--lgs-panel);color:var(--lgs-accent);font-size:14px!important;font-weight:750}
.lgs-raffle-copy{min-width:0}
.lgs-raffle-copy>span,.lgs-raffle-copy>strong{display:block;overflow-wrap:anywhere}
.lgs-raffle-copy>span{color:var(--lgs-muted);font-size:12px}
.lgs-raffle-copy>strong{margin-top:2px;font-size:16px;line-height:1.3}
.lgs-raffle-results time{color:var(--lgs-muted);font-size:12px;text-align:right;white-space:nowrap}
@media(max-width:1100px){
  .lgs-overview{grid-template-columns:minmax(0,1fr);grid-template-areas:"decks" "notes" "totals" "gallery" "placements";gap:14px;align-items:start}
  .lgs-overview>.lgs-panel{align-self:start;width:100%;height:auto}
  .lgs-ui .lgs-totals-button{width:100%}
  .lgs-overview-notes textarea{min-height:260px}
  .lgs-prize-log{flex:none;max-height:280px}
}
@media(max-width:600px){
  .lgs-placement-grid{grid-template-columns:minmax(0,1fr)}
  .lgs-overview .lgs-placement{grid-template-columns:minmax(0,1fr) minmax(120px,145px);padding:11px 12px}
  .lgs-prizes-heading{display:block;padding:20px}
  .lgs-prizes-heading .lgs-pill{margin-top:14px}
  .lgs-prizes-layout{grid-template-columns:minmax(0,1fr)}
  .lgs-prize-draw,.lgs-prize-history{padding:20px}
  .lgs-prize-history{border-top:1px solid color-mix(in srgb,var(--lgs-muted) 16%,transparent)}
  .lgs-prize-draw>strong{font-size:22px}
  .lgs-prize-form{margin-top:20px}
  .lgs-raffle-results{max-height:360px}
  .lgs-raffle-results .lgs-raffle{grid-template-columns:34px minmax(0,1fr);gap:10px}
  .lgs-raffle-number{width:34px;height:34px}
  .lgs-raffle-results time{grid-column:2;text-align:left;white-space:normal}
  .lgs-gallery-heading{display:block}
  .lgs-ui .lgs-gallery-add{width:100%;margin-top:14px}
  .lgs-gallery-stage{min-height:0;aspect-ratio:4/3}
  .lgs-gallery-stage>img{min-height:0;max-height:none}
  .lgs-gallery-delete{top:8px;right:8px}
  .lgs-gallery-meta{align-items:flex-start;flex-direction:column;gap:2px}
}
`;
