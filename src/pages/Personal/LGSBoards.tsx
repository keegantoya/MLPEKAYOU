import { onAuthIdentityChange } from "@/lib/auth-identity";
import { cardImagePaths } from "@/lib/card-images";
import CardImage from "@/components/CardImage";
import KayouHeader from "@/components/KayouHeader";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  | "player_details"
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
        {(page - 1) * 10 + 1}-{Math.min(page * 10, count)} of {count}
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
              ? `${player}'s deck`
              : field === "placement" && player
                ? `${player}'s placement`
                : field === "player_external_id" && player
                  ? `${player}'s Player ID`
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
          alt={`${edit.editor_username}'s profile`}
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
            X
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
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
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
  const [nameDraft, setNameDraft] = useState("");
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
  const closePhotoPreview = useCallback(() => setPhotoPreviewOpen(false), []);
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
      setPhotoPreviewOpen(false);
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
  const correctPlayer = (form: FormEvent) => {
    form.preventDefault();
    if (!event || !idPlayer || !canManage) return;
    void run(async () => {
      const { error: correctionError } = await db.rpc("lgs_correct_player", {
        p_event_id: event.id,
        p_player_id: idPlayer.player_id,
        p_name: nameDraft.trim(),
        p_external_id: idDraft.trim(),
      });
      if (correctionError) throw correctionError;
      closeDialog();
      await Promise.all([loadEvent(event.id), loadBoard()]);
      setTotals(null);
      setNotice("Player details updated across this store's events.");
    });
  };
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
        `${added.length} ${added.length === 1 ? "photo" : "photos"} added${skipped > 0 ? `  /  ${skipped} skipped because the gallery is full` : ""}.`,
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
      ? "All stores  /  View-only access"
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
  const pageLayoutRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const layout = pageLayoutRef.current;
    const header = layout?.querySelector<HTMLElement>(".kayou-header-scope > header");
    if (!layout || !header) return;
    const updateHeaderSpace = () => {
      const bottom = Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
      layout.style.setProperty("--lgs-header-bottom", `${bottom}px`);
    };
    updateHeaderSpace();
    const observer = new ResizeObserver(updateHeaderSpace);
    observer.observe(header);
    window.addEventListener("resize", updateHeaderSpace);
    window.addEventListener("orientationchange", updateHeaderSpace);
    window.visualViewport?.addEventListener("resize", updateHeaderSpace);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderSpace);
      window.removeEventListener("orientationchange", updateHeaderSpace);
      window.visualViewport?.removeEventListener("resize", updateHeaderSpace);
    };
  }, []);
  const safePhotoIndex = Math.min(
    photoIndex,
    Math.max(0, eventPhotos.length - 1),
  );
  const activePhoto = eventPhotos[safePhotoIndex] ?? null;
  return (
    <div ref={pageLayoutRef}>
    <KayouHeader />
    <main className={`lgs-ui lgs-page${isLightMode ? "" : " dark"}`}>
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
              {busy ? "Working..." : "Refresh"}
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
        <div className="lgs-workspace">
        {!dialog && !deckPlayer && messages}
        {loading && !staff ? (
          <div className="lgs-empty" role="status">
            Loading your boards...
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
              Back / All events
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
                  {event.league_name ? `  /  ${event.league_name}` : ""}
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
                You're viewing another store's event. This board is read-only.
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
                      Add a new name or check in someone from your store's
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
                          {canManage && (
                            <button
                              type="button"
                              className="lgs-id-edit"
                              disabled={busy}
                              aria-label={`Edit player details for ${person.player_name}`}
                              onClick={() => {
                                setIdPlayer(person);
                                setNameDraft(person.player_name);
                                setIdDraft(person.player_external_id ?? "");
                                setDialog("player_details");
                              }}
                            >
                              Edit player
                            </button>
                          )}
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
                          <strong>{person.player_external_id || "-"}</strong>
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
                              X
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
                            {count}  / {" "}
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
                    {dateLabel(event.league_start)} -{" "}
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
                      placeholder="Anything you want to remember about this event..."
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
                      <h2>Event gallery{eventPhotos.length > 0 ? ` (${eventPhotos.length})` : ""}</h2>
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
                  <div className="lgs-gallery-previews" aria-label="Event photos">
                    {eventPhotos.map((photo, index) => (
                      <button
                        type="button"
                        key={photo.id}
                        className="lgs-gallery-slot"
                        onClick={() => {
                          setPhotoIndex(index);
                          setPhotoPreviewOpen(true);
                        }}
                        aria-label={`Open event photo ${index + 1} of ${eventPhotos.length}`}
                      >
                        <img src={eventPhotoUrl(photo.storage_path)} alt="" loading="lazy" />
                      </button>
                    ))}
                    {Array.from({ length: Math.max(0, 10 - eventPhotos.length) }, (_, index) => (
                      <div key={`empty-${index}`} className="lgs-gallery-slot empty" aria-hidden="true" />
                    ))}
                  </div>
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
                <span aria-hidden="true">{historyOpen ? "-" : "+"}</span>
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
                      {loading ? "Loading..." : "Load more history"}
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
        </div>
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
              Start with a name and date. You'll add players on the next screen.
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
                <span className="lgs-muted">Optional  /  8 weeks by default</span>
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
              {busy ? "Creating event..." : "Create event & add players"}
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
            {dateLabel(event.league_start)} - {dateLabel(event.league_end)}
          </p>
          <p className="lgs-muted">
            All store events in this period. Weeks are seven-day blocks from
            the start date.
          </p>
          {busy && !totals && (
            <p className="lgs-empty" role="status">
              Loading attendance totals...
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
      {staff && event && photoPreviewOpen && activePhoto && (
        <Modal
          title={`Photo ${safePhotoIndex + 1} of ${eventPhotos.length}`}
          close={closePhotoPreview}
          className="lgs-photo-preview-dialog"
        >
          <div className="lgs-photo-preview-stage">
            <img
              src={eventPhotoUrl(activePhoto.storage_path)}
              alt={`Event photo ${safePhotoIndex + 1}`}
            />
            {eventPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="lgs-gallery-arrow lgs-gallery-previous"
                  onClick={() => setPhotoIndex((safePhotoIndex - 1 + eventPhotos.length) % eventPhotos.length)}
                  aria-label="Previous event photo"
                >
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="lgs-gallery-arrow lgs-gallery-next"
                  onClick={() => setPhotoIndex((safePhotoIndex + 1) % eventPhotos.length)}
                  aria-label="Next event photo"
                >
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          {canManage && (
            <button
              type="button"
              className="lgs-gallery-preview-delete"
              onClick={() => {
                setPhotoPreviewOpen(false);
                setPhotoToDelete(activePhoto);
              }}
            >
              <X size={16} aria-hidden="true" /> Delete photo
            </button>
          )}
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
              {busy ? "Deleting..." : "Delete photo"}
            </button>
          </div>
        </Modal>
      )}
      {staff && editable && deckPlayer && (
        <Modal
          title={`${deckPlayer.player_name}'s deck`}
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
      {staff && canManage && dialog === "player_details" && idPlayer && (
        <Modal
          title={`Edit player  /  ${idPlayer.player_name}`}
          close={closeDialog}
          busy={busy}
          className="lgs-id-dialog"
        >
          {messages}
          <form className="lgs-form" onSubmit={correctPlayer}>
            <label>
              Player name
              <input
                required
                value={nameDraft}
                onChange={(change) => setNameDraft(change.target.value)}
                maxLength={80}
                disabled={busy}
              />
            </label>
            <label>
              Player ID
              <input
                value={idDraft}
                onChange={(change) => setIdDraft(change.target.value)}
                maxLength={80}
                placeholder="Enter the player's ID"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={busy}
              />
            </label>
            <p className="lgs-muted">
              Corrections update this player's saved roster entry, past and
              current attendance, and raffle winner names. Leave the ID blank
              to clear it.
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
              <button type="submit" className="lgs-primary" disabled={busy || !nameDraft.trim()}>
                Save player
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
              Loading edit history...
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
              {busy ? "Saving..." : "Finish and save"}
            </button>
          </div>
        </Modal>
      )}
    </main>
    </div>
  );
}
const STYLES = `
.lgs-ui{--lgs-bg:#f5f5f2;--lgs-panel:#fff;--lgs-soft:#efefea;--lgs-text:#252726;--lgs-muted:#666b68;--lgs-line:#dedfd8;--lgs-accent:#836400;--lgs-accent-text:#191b1c;--lgs-good:#23633e;--lgs-good-bg:#e7f4eb;color:var(--lgs-text);font-family:inherit;font-size:14px;line-height:1.5;color-scheme:light;box-sizing:border-box}
.lgs-ui.dark,html:not([data-theme="light"]) .lgs-overlay{--lgs-bg:#111315;--lgs-panel:#191c1e;--lgs-soft:#232729;--lgs-text:#f2f3ee;--lgs-muted:#a4aca8;--lgs-line:#343a3b;--lgs-accent:#e7c84b;--lgs-accent-text:#191b1c;--lgs-good:#a2ddb6;--lgs-good-bg:#20362a;color-scheme:dark}
html[data-theme="spooky"] .lgs-ui{--lgs-accent:#c9acff;--lgs-accent-text:#1e152a}
.lgs-ui *{box-sizing:border-box}.lgs-page{min-height:100dvh;background:var(--lgs-bg);padding:96px 28px 100px}.lgs-shell{display:grid;grid-template-columns:220px minmax(0,1fr);gap:32px;width:100%;margin:auto}.lgs-workspace{min-width:0}.lgs-ui h1,.lgs-ui h2,.lgs-ui h3,.lgs-ui p{margin:0}.lgs-ui h1{font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-.035em;overflow-wrap:anywhere}.lgs-ui h2{font-size:19px;font-weight:650;letter-spacing:-.02em}.lgs-ui h3{font-size:16px;font-weight:650}.lgs-ui p{margin-top:7px}.lgs-muted{color:var(--lgs-muted);font-size:13px}.lgs-ui button,.lgs-ui input,.lgs-ui textarea,.lgs-ui select{font:inherit}.lgs-ui button{cursor:pointer;touch-action:manipulation;min-height:40px;transition:background .15s,border-color .15s;border:0}.lgs-ui button:disabled{opacity:.5;cursor:default}.lgs-ui button:focus-visible,.lgs-ui input:focus-visible,.lgs-ui select:focus-visible,.lgs-ui textarea:focus-visible,.lgs-ui summary:focus-visible{outline:2px solid var(--lgs-accent);outline-offset:3px}.lgs-primary,.lgs-secondary,.lgs-quiet{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 14px;border-radius:8px;font-weight:600}.lgs-ui .lgs-primary{background:var(--lgs-accent);color:var(--lgs-accent-text)}.lgs-secondary{background:var(--lgs-soft);color:var(--lgs-text);box-shadow:inset 0 0 0 1px var(--lgs-line)}.lgs-quiet{background:transparent;color:var(--lgs-text)}.lgs-ui button:hover:not(:disabled){filter:brightness(1.08)}.lgs-appbar{position:sticky;top:96px;align-self:start;display:flex;flex-direction:column;gap:24px;border-top:3px solid var(--lgs-accent);padding-top:20px}.lgs-brand{font-size:10px;font-weight:700;letter-spacing:.17em;color:var(--lgs-accent)}.lgs-appbar h1{font-size:27px;margin-top:10px}.lgs-app-title>.lgs-muted{margin-top:12px;padding-top:12px;border-top:1px solid var(--lgs-line);overflow-wrap:anywhere}.lgs-toolbar{display:grid;gap:8px}.lgs-toolbar button{justify-content:flex-start;width:100%}.lgs-toolbar .lgs-primary{order:-1}.lgs-panel{background:var(--lgs-panel);border:1px solid var(--lgs-line);border-radius:12px;padding:20px;min-width:0}.lgs-row,.lgs-heading,.lgs-section-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}.lgs-row>h2,.lgs-heading>div,.lgs-section-heading>div{min-width:0}.lgs-heading{align-items:flex-start;padding:18px 0;margin-bottom:10px;border-bottom:1px solid var(--lgs-line)}.lgs-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--lgs-accent);margin-bottom:7px!important}.lgs-back{padding-left:0}.lgs-pill{display:inline-flex;align-items:center;border:1px solid var(--lgs-line);border-radius:5px;padding:3px 7px;font-size:11px;font-weight:600;background:var(--lgs-soft);white-space:nowrap}.lgs-live{color:var(--lgs-good);background:var(--lgs-good-bg);border-color:transparent}.lgs-section{margin-bottom:30px}.lgs-section-heading{margin-bottom:16px;align-items:end}.lgs-section-heading h2{display:flex;align-items:center;gap:10px}.lgs-section-heading p{font-size:13px}.lgs-filter{min-width:180px;font-size:12px;color:var(--lgs-muted)}.lgs-events{display:grid;gap:0;border-top:1px solid var(--lgs-line)}.lgs-event-tile{min-width:0;border-bottom:1px solid var(--lgs-line);position:relative;background:transparent}.lgs-event-card{display:flex;align-items:center;text-align:left;width:100%;gap:20px;padding:18px 12px;background:transparent;color:var(--lgs-text)}.lgs-event-card:hover:not(:disabled){background:var(--lgs-soft)}.lgs-event-date{display:flex;flex-direction:column;align-items:center;flex:0 0 56px;gap:1px;color:var(--lgs-muted);border-right:1px solid var(--lgs-line);padding-right:16px}.lgs-event-date svg{display:none}.lgs-event-date strong{font-size:26px;line-height:1.1;font-weight:600;color:var(--lgs-text)}.lgs-event-date>span{font-size:11px;text-transform:uppercase;letter-spacing:.08em}.lgs-event-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;flex:1;min-width:0;align-items:center}.lgs-event-copy>.lgs-pill{grid-column:2;grid-row:1;justify-self:end}.lgs-event-copy>strong{grid-column:1;grid-row:1;font-size:18px;line-height:1.3;overflow-wrap:anywhere}.lgs-event-meta{grid-column:1;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:var(--lgs-muted)}.lgs-event-link{grid-column:2;grid-row:2;display:flex;align-items:center;gap:7px;font-size:12px;color:var(--lgs-accent)}.lgs-card-edits{display:flex;align-items:center;gap:6px;background:none;color:var(--lgs-accent);font-size:11px;padding:0 12px 10px 88px;min-height:28px!important}.lgs-history{border-top:1px solid var(--lgs-line);padding-top:6px}.lgs-history-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;text-align:left;background:none;color:var(--lgs-text);padding:14px 0}.lgs-history-heading{display:flex;align-items:center;gap:12px}.lgs-history-heading>svg{width:19px;color:var(--lgs-muted)}.lgs-history-heading strong{display:block;font-size:18px;font-weight:600}.lgs-history-heading .lgs-muted{display:block;font-size:12px;margin-top:2px}.lgs-history-toggle>span:last-child{font-size:23px}.lgs-empty,.lgs-open-empty{padding:32px 20px;text-align:center;color:var(--lgs-muted);border:1px dashed var(--lgs-line);border-radius:9px}.lgs-empty button{margin-top:16px}.lgs-stats{display:flex;flex-wrap:wrap;gap:24px;margin:16px 0 20px}.lgs-stats>div{display:flex;align-items:baseline;gap:8px}.lgs-stats strong{font-size:23px;font-weight:650}.lgs-stats span{font-size:12px;color:var(--lgs-muted)}.lgs-tabs{display:flex;gap:24px;border-bottom:1px solid var(--lgs-line);margin-bottom:20px}.lgs-tabs button{padding:10px 0;border-bottom:2px solid transparent;background:none;color:var(--lgs-muted);border-radius:0}.lgs-tabs button.selected{color:var(--lgs-accent);border-bottom-color:var(--lgs-accent)}
.lgs-ui label{font-size:13px;font-weight:550}.lgs-ui input,.lgs-ui textarea,.lgs-ui select{display:block;width:100%;min-width:0;background:var(--lgs-bg);color:var(--lgs-text);border:1px solid var(--lgs-line);border-radius:7px;padding:10px 12px;margin-top:6px;min-height:44px;font-size:16px}.lgs-ui textarea{resize:vertical}.lgs-ui input::placeholder,.lgs-ui textarea::placeholder{color:var(--lgs-muted)}.lgs-form{display:grid;gap:16px;margin-top:16px}.lgs-date-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.lgs-date-grid label{min-width:0}.lgs-ui input[readonly]{opacity:.65}.lgs-player-list{display:grid;margin-top:16px}.lgs-person{display:grid;grid-template-columns:48px minmax(0,1fr) minmax(100px,.5fr) 40px;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--lgs-line)}.lgs-person:last-child{border-bottom:0}.lgs-person-name{min-width:0;overflow-wrap:anywhere}.lgs-person-name strong,.lgs-person-name>span{display:block}.lgs-person-name strong{font-size:15px}.lgs-player-id{min-width:0;overflow-wrap:anywhere}.lgs-player-id>span{display:block;font-size:10px;color:var(--lgs-muted);text-transform:uppercase;letter-spacing:.06em}.lgs-player-id>strong{font-size:13px;font-weight:500}.lgs-id-edit{display:block;color:var(--lgs-accent);background:none;padding:2px 0;min-height:28px!important;text-align:left;font-size:12px!important}.lgs-deck-thumb{width:44px;min-height:60px!important;padding:0;background:var(--lgs-soft);border-radius:5px;color:var(--lgs-muted);font-size:10px!important;overflow:hidden}.lgs-deck-thumb:disabled{opacity:1!important}.lgs-deck-image-frame{display:block;width:100%;aspect-ratio:5/7;overflow:hidden;border-radius:6px;margin:0 auto 9px;max-width:95px}.lgs-deck-back-image{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.035)}.lgs-deck-image-thumb{height:61px;object-fit:cover}.lgs-winner-label{color:var(--lgs-good);font-size:12px}.lgs-deck-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;margin-top:18px}.lgs-deck-option{min-width:0;text-align:center;padding:10px 5px;background:var(--lgs-soft);color:var(--lgs-text);border-radius:8px}.lgs-deck-option strong{display:block;font-size:11px;overflow-wrap:anywhere}.lgs-deck-option>span:last-child{display:block;color:var(--lgs-muted);font-size:12px;margin-top:3px}.lgs-deck-option.selected{box-shadow:inset 0 0 0 2px var(--lgs-accent)}.lgs-entry-decks{min-width:0;margin:0;padding:0;border:0}.lgs-entry-decks legend{font-size:13px;font-weight:600}.lgs-modal .lgs-deck-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lgs-entry-decks .lgs-quiet{margin-top:8px}.lgs-overview{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,1fr);gap:16px;align-items:start}.lgs-overview-decks{grid-column:1/-1}.lgs-overview-notes{grid-column:1;grid-row:2}.lgs-overview-totals{grid-column:2;grid-row:2}.lgs-overview-placements{grid-column:1/-1}.lgs-overview-gallery{grid-column:1/-1}.lgs-overview-notes textarea{min-height:180px}.lgs-totals-button{margin-top:16px;width:100%}.lgs-prize-log{margin-top:20px;border-top:1px solid var(--lgs-line);padding-top:14px;max-height:220px;overflow:auto}.lgs-prize-log p{font-size:12px}.lgs-placement-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 20px;margin-top:12px}.lgs-placement{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--lgs-line);min-width:0}.lgs-placement>span{flex:1;min-width:0;overflow-wrap:anywhere}.lgs-placement select{width:145px;max-width:50%;margin:0;font-size:14px}.lgs-placement input{width:80px;margin:0}.lgs-finish{margin-top:24px;border-top:1px solid var(--lgs-line);padding-top:18px;display:flex;align-items:center;gap:16px}.lgs-finish p{font-size:12px;color:var(--lgs-muted)}
.lgs-prizes-panel{padding:0;overflow:hidden}.lgs-prizes-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 20px;border-bottom:1px solid var(--lgs-line)}.lgs-prizes-layout{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(0,1.2fr)}.lgs-prize-draw{padding:20px;border-right:1px solid var(--lgs-line)}.lgs-prize-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--lgs-accent)}.lgs-prize-draw>strong{display:block;font-size:24px;margin-top:6px}.lgs-prize-form{display:grid;gap:14px;margin-top:18px}.lgs-prize-readonly{font-size:13px;color:var(--lgs-muted)}.lgs-prize-history{padding:20px;min-width:0}.lgs-prize-history-heading{margin-bottom:16px}.lgs-raffle-results{display:grid;gap:0;max-height:440px;overflow:auto}.lgs-raffle{display:grid;grid-template-columns:28px minmax(0,1fr);gap:9px;padding:12px 0;border-bottom:1px solid var(--lgs-line)}.lgs-raffle-number{display:flex;align-items:center;justify-content:center;width:25px;height:25px;background:var(--lgs-soft);border-radius:5px;font-size:11px}.lgs-raffle-copy{min-width:0}.lgs-raffle-copy>strong,.lgs-raffle-copy>span{display:block;overflow-wrap:anywhere}.lgs-raffle-copy>strong{font-size:14px}.lgs-raffle-copy>span,.lgs-raffle time{font-size:11px;color:var(--lgs-muted)}.lgs-raffle time{grid-column:2}.lgs-prize-empty{font-size:13px;color:var(--lgs-muted);padding:20px 0}.lgs-table-wrap{overflow:auto;margin-top:16px}.lgs-ui table{width:100%;border-collapse:collapse;font-size:13px}.lgs-ui th,.lgs-ui td{padding:11px;text-align:left;border-bottom:1px solid var(--lgs-line)}.lgs-ui th{font-size:11px;color:var(--lgs-muted);font-weight:600;background:var(--lgs-soft)}.lgs-pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;color:var(--lgs-muted);font-size:12px}.lgs-pagination>div{display:flex;align-items:center;gap:8px}.lgs-pagination button{min-height:36px;font-size:12px;padding:7px 10px}.lgs-message{padding:12px 14px;background:var(--lgs-soft);border:1px solid var(--lgs-line);border-radius:8px;margin:12px 0}.lgs-error{color:#c34343;border-color:#c3434366}.lgs-success-notice{position:fixed;bottom:90px;right:24px;z-index:31000;background:var(--lgs-panel);border-color:var(--lgs-good);box-shadow:0 8px 30px #0003;max-width:min(440px,calc(100vw - 32px));pointer-events:none}.lgs-modal .lgs-success-notice{position:static;max-width:none;box-shadow:none}.lgs-viewer-notice{color:var(--lgs-muted)}
.lgs-overlay{position:fixed;inset:0;z-index:30000;display:flex;align-items:center;justify-content:center;background:#080a0cc9;padding:20px;backdrop-filter:blur(5px)}.lgs-modal{width:100%;max-width:650px;max-height:calc(100dvh - 40px);overflow:auto;overscroll-behavior:contain;background:var(--lgs-panel);border:1px solid var(--lgs-line);border-radius:14px;padding:24px;box-shadow:0 24px 90px #0006}.lgs-modal>.lgs-row:first-child{border-bottom:1px solid var(--lgs-line);padding-bottom:14px;margin-bottom:16px;align-items:center}.lgs-modal-title{font-size:21px!important}.lgs-modal>.lgs-row>.lgs-quiet{flex-shrink:0;width:40px;padding:0}.lgs-modal .lgs-form{margin-top:12px}.lgs-finish-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.lgs-finish-actions>button{flex:1;min-height:44px}.lgs-finish-description,.lgs-edit-intro{color:var(--lgs-muted)}.lgs-finish-dialog{max-width:480px}.lgs-saved-roster{border-top:1px solid var(--lgs-line);margin-top:24px;padding-top:18px}.lgs-roster-search{display:block;margin-top:12px}.lgs-roster{margin-top:12px;display:grid}.lgs-roster-player{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--lgs-line)}.lgs-roster-player>span{min-width:0;overflow-wrap:anywhere}.lgs-roster-player strong,.lgs-roster-player>span>span{display:block}.lgs-roster-player>span>span{font-size:12px}.lgs-roster-player button{flex-shrink:0}.lgs-league-settings{border-top:1px solid var(--lgs-line);padding-top:14px}.lgs-league-settings>summary{cursor:pointer;color:var(--lgs-accent)}.lgs-league-settings>summary>span{display:block;font-size:12px;margin-top:4px}.lgs-event-store{padding:12px;background:var(--lgs-soft);border-radius:7px}.lgs-event-store span{display:block}.lgs-edited-link{display:flex;align-items:center;gap:8px;padding:4px 0;background:none;color:var(--lgs-accent);font-size:12px!important}.lgs-edited-link>span{color:var(--lgs-muted)}.lgs-edit-list{display:grid;gap:12px;margin-top:16px}.lgs-edit-record{border:1px solid var(--lgs-line);padding:14px;border-radius:8px;min-width:0}.lgs-edit-author{display:flex;align-items:center;gap:10px}.lgs-edit-author>div{min-width:0}.lgs-edit-author strong{display:block;overflow-wrap:anywhere;font-size:14px}.lgs-edit-author time{display:block;color:var(--lgs-muted);font-size:11px}.lgs-editor-avatar{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:40px;height:40px;border-radius:9px;overflow:hidden;background:var(--lgs-soft);color:var(--lgs-accent)}.lgs-editor-avatar img{width:100%;height:100%;object-fit:cover}.lgs-edit-description{font-weight:600;margin-top:12px!important;font-size:13px}.lgs-edit-sentences{display:grid;gap:8px;margin-top:10px;font-size:12px}.lgs-edit-sentences p{margin:0;overflow-wrap:anywhere;line-height:1.6}.lgs-note-change>div{margin-top:8px;padding:10px;background:var(--lgs-soft);border-radius:6px}.lgs-note-change>div>span{font-size:10px;color:var(--lgs-muted)}.lgs-note-change p{white-space:pre-wrap}.lgs-event-activity{margin-top:20px;border-top:1px solid var(--lgs-line);padding-top:12px}.lgs-event-activity summary{cursor:pointer;color:var(--lgs-accent)}.lgs-more-edits,.lgs-refresh-totals{width:100%;margin-top:16px}.lgs-no-edits{padding:20px;background:var(--lgs-soft);border-radius:8px;margin-top:16px}.lgs-no-edits p{font-size:13px;color:var(--lgs-muted)}
.lgs-gallery-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}.lgs-gallery-heading p{font-size:12px}.lgs-gallery-input{display:none!important}.lgs-gallery-previews{display:flex;gap:8px;overflow-x:auto;padding:16px 0 4px}.lgs-gallery-slot{flex:0 0 100px;aspect-ratio:1;border-radius:7px;background:var(--lgs-soft);padding:0;overflow:hidden;border:1px solid var(--lgs-line)!important}.lgs-gallery-slot>img{width:100%;height:100%;object-fit:cover}.lgs-gallery-slot.empty{border-style:dashed!important}.lgs-gallery-slot.empty:nth-child(n+5){display:none}.lgs-photo-preview-dialog{max-width:1050px}.lgs-photo-preview-stage{position:relative;display:flex;align-items:center;justify-content:center;min-height:120px;background:#0b0d0f;border-radius:8px;overflow:hidden}.lgs-photo-preview-stage>img{display:block;max-width:100%;max-height:calc(100dvh - 220px);object-fit:contain}.lgs-gallery-arrow{position:absolute;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:42px;padding:0;background:#111c;color:#fff;border-radius:50%}.lgs-gallery-previous{left:12px}.lgs-gallery-next{right:12px}.lgs-gallery-preview-delete{display:block;margin:14px 0 0 auto;background:var(--lgs-soft);color:var(--lgs-text);padding:9px 14px;border-radius:7px}.lgs-delete-photo-preview{display:block;width:100%;max-height:200px;object-fit:contain;margin:14px 0}.lgs-delete-confirm{background:#ac3441;color:#fff;border-radius:8px;padding:10px 14px}.lgs-create-submit{width:100%;margin-top:6px}
@media(min-width:1600px){.lgs-shell{grid-template-columns:240px minmax(0,1fr);gap:44px}.lgs-overview{grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr)}}
@media(max-width:1050px){.lgs-shell{grid-template-columns:175px minmax(0,1fr);gap:22px}.lgs-appbar h1{font-size:24px}.lgs-page{padding-left:20px;padding-right:20px}.lgs-overview{grid-template-columns:minmax(0,1fr)}.lgs-overview>.lgs-panel{grid-column:1;grid-row:auto}.lgs-overview-notes{order:1}.lgs-overview-decks{order:0}.lgs-overview-totals{order:2}.lgs-overview-placements{order:3}.lgs-overview-gallery{order:4}.lgs-prizes-layout{grid-template-columns:1fr}.lgs-prize-draw{border-right:0;border-bottom:1px solid var(--lgs-line)}}
@media(max-width:719px){.lgs-page{padding:84px 14px 110px}.lgs-shell{display:block}.lgs-appbar{position:static;padding-top:12px;gap:14px;margin-bottom:26px}.lgs-app-title{display:flex;align-items:baseline;gap:8px 12px;flex-wrap:wrap}.lgs-brand{display:none}.lgs-appbar h1{font-size:25px;margin:0}.lgs-app-title>.lgs-muted{border:0;margin:0;padding:0;font-size:12px}.lgs-toolbar{display:flex;flex-wrap:wrap;gap:8px}.lgs-toolbar button{width:auto;min-height:44px;justify-content:center;flex:1}.lgs-toolbar .lgs-primary{order:0;flex:1.5}.lgs-section-heading{align-items:start;flex-wrap:wrap;gap:10px}.lgs-filter{width:100%}.lgs-event-card{gap:12px;padding:16px 0}.lgs-event-date{flex-basis:44px;padding-right:10px}.lgs-event-copy{gap:5px 8px}.lgs-event-copy>strong{font-size:16px}.lgs-event-copy>.lgs-pill{font-size:10px}.lgs-event-link{grid-column:1/-1;grid-row:3;font-size:11px}.lgs-event-meta{grid-column:1/-1;font-size:11px;gap:4px 10px}.lgs-card-edits{padding-left:56px}.lgs-panel{padding:16px;border-radius:9px}.lgs-row{flex-wrap:wrap;gap:10px}.lgs-heading{gap:12px}.lgs-heading h1{font-size:26px}.lgs-stats{gap:8px 18px;margin:14px 0}.lgs-stats>div{gap:5px}.lgs-stats strong{font-size:20px}.lgs-stats span{font-size:10px}.lgs-tabs{gap:28px}.lgs-tabs button{min-height:44px}.lgs-person{grid-template-columns:44px minmax(0,1fr) 36px;gap:4px 10px}.lgs-person .lgs-deck-thumb{grid-row:1/3}.lgs-person-name{grid-column:2;grid-row:1}.lgs-player-id{grid-column:2;grid-row:2}.lgs-player-id>span{display:inline;margin-right:6px}.lgs-person>.lgs-quiet{grid-column:3;grid-row:1/3;padding:0;width:36px;min-height:44px}.lgs-person-name strong{font-size:14px}.lgs-deck-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.lgs-deck-image-frame{max-width:76px}.lgs-placement-grid{grid-template-columns:1fr}.lgs-placement select{min-height:44px}.lgs-finish{align-items:start;flex-direction:column;gap:8px}.lgs-finish button{width:100%}.lgs-prizes-heading{padding:16px}.lgs-prize-draw,.lgs-prize-history{padding:16px}.lgs-prizes-heading h2{font-size:18px}.lgs-prizes-heading p{font-size:12px}.lgs-pagination{flex-wrap:wrap}.lgs-pagination button{min-height:44px}.lgs-overlay{padding:12px}.lgs-modal{max-height:calc(100dvh - 24px);padding:18px;border-radius:12px}.lgs-date-grid{grid-template-columns:1fr}.lgs-gallery-heading{align-items:start;flex-wrap:wrap}.lgs-gallery-add{min-height:44px}.lgs-success-notice{right:16px;bottom:90px}.lgs-photo-preview-stage>img{max-height:calc(100dvh - 230px)}.lgs-history-heading strong{font-size:17px}.lgs-history-heading .lgs-muted{font-size:11px}.lgs-finish-actions{flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){.lgs-ui *{transition:none!important;scroll-behavior:auto!important}}
.lgs-deck-image-frame{position:relative;width:78px;height:110px;aspect-ratio:auto}.lgs-deck-image-frame .lgs-deck-back-image{position:absolute;top:50%;left:50%;width:auto!important;max-width:none;height:114px!important;object-fit:contain;transform:translate(-50%,-50%)}.lgs-deck-thumb.has-deck{position:relative;height:62px;background:transparent}.lgs-person .lgs-deck-thumb.has-deck .lgs-deck-image-thumb{position:absolute;top:50%;left:50%;width:auto!important;max-width:none;height:66px!important;object-fit:contain;transform:translate(-50%,-50%)}.lgs-entry-decks .lgs-deck-image-frame{width:67px;height:94px}.lgs-entry-decks .lgs-deck-image-frame .lgs-deck-back-image{height:98px!important}@media(max-width:719px){.lgs-entry-decks .lgs-deck-image-frame{width:55px;height:78px}.lgs-entry-decks .lgs-deck-image-frame .lgs-deck-back-image{height:82px!important}}
.lgs-page{padding-top:calc(var(--lgs-header-bottom,96px) + 16px)}.lgs-appbar{top:calc(var(--lgs-header-bottom,96px) + 16px)}
`;
