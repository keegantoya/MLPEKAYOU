import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { supabase } from "@/lib/supabase";

const BUCKET = "card-images";
const URL_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const CACHE_LIFETIME_MS = (7 * 24 - 1) * 60 * 60 * 1000;
const LOCAL_CACHE_KEY = "mlpekayou:signed-card-images:v3";
const LOADING_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="744" height="1040" viewBox="0 0 744 1040">
    <rect width="744" height="1040" rx="28" fill="#e5e7eb"/>
    <circle cx="372" cy="464" r="30" fill="none" stroke="#6b7280" stroke-width="8" stroke-linecap="round" stroke-dasharray="138 52"/>
    <text x="372" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="600" fill="#4b5563">Loading…</text>
  </svg>
`)}`;
const PROTECTED_PREFIXES = [
  "cards/",
  "card-backs/",
  "fantasy-wonderland/",
  "friendships-begin/",
  "fun-moments-one-backs/",
  "fun-moments-two-backs/",
  "fun-moments-three-backs/",
  "moon-1-other-backs/",
  "moon-2-other-backs/",
  "promo-cards/",
  "rainbow-1-backs/",
  "tcg-card-backs/",
  "tcgpromos/",
] as const;

type CacheEntry = {
  url: string;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry>();
const listeners = new Map<string, Set<(url?: string) => void>>();
const queuedPaths = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let cacheLoaded = false;

function normalizeProtectedPath(src?: string) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return null;

  let pathname = src;
  try {
    if (/^https?:\/\//i.test(src)) pathname = new URL(src).pathname;
  } catch {
    return null;
  }

  const path = pathname.split("?")[0].split("#")[0].replace(/^\/+/, "");
  if (!PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) return null;

  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

function loadLocalCache() {
  if (cacheLoaded || typeof window === "undefined") return;
  cacheLoaded = true;

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(LOCAL_CACHE_KEY) ?? "{}",
    ) as Record<string, CacheEntry>;
    const now = Date.now();
    Object.entries(stored).forEach(([path, entry]) => {
      if (entry?.url && entry.expiresAt > now) memoryCache.set(path, entry);
    });
  } catch {
    window.localStorage.removeItem(LOCAL_CACHE_KEY);
  }
}

function saveLocalCache() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_CACHE_KEY,
      JSON.stringify(Object.fromEntries(memoryCache)),
    );
  } catch {
    // Memory caching still works if browser storage is unavailable.
  }
}

function invalidateSignedUrl(path: string) {
  memoryCache.delete(path);
  saveLocalCache();
}

function notify(path: string, url?: string) {
  listeners.get(path)?.forEach((listener) => listener(url));
}

async function flushQueue() {
  flushTimer = undefined;
  const paths = [...queuedPaths];
  queuedPaths.clear();
  if (!paths.length) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    paths.forEach((path) => notify(path));
    return;
  }

  const expiresAt = Date.now() + CACHE_LIFETIME_MS;
  const chunks = Array.from(
    { length: Math.ceil(paths.length / 100) },
    (_, index) => paths.slice(index * 100, index * 100 + 100),
  );

  const batches = await Promise.all(
    chunks.map(async (chunk) => ({
      chunk,
      response: await supabase.storage
        .from(BUCKET)
        .createSignedUrls(chunk, URL_LIFETIME_SECONDS),
    })),
  );

  batches.forEach(({ chunk, response: { data, error } }) => {
    if (error || !data) {
      console.error("Unable to sign protected card images", error);
      chunk.forEach((path) => notify(path));
      return;
    }

    data.forEach((result, index) => {
      const path = chunk[index];
      if (!path || result.error || !result.signedUrl) {
        if (path) notify(path);
        return;
      }
      memoryCache.set(path, { url: result.signedUrl, expiresAt });
      notify(path, result.signedUrl);
    });
  });
  saveLocalCache();
}

function requestSignedUrl(path: string, listener: (url?: string) => void) {
  loadLocalCache();
  const cached = memoryCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    listener(cached.url);
    return () => undefined;
  }

  if (cached) memoryCache.delete(path);
  let pathListeners = listeners.get(path);
  if (!pathListeners) {
    pathListeners = new Set();
    listeners.set(path, pathListeners);
  }
  pathListeners.add(listener);
  queuedPaths.add(path);
  if (!flushTimer) flushTimer = setTimeout(() => void flushQueue(), 10);

  return () => {
    const current = listeners.get(path);
    current?.delete(listener);
    if (!current?.size) listeners.delete(path);
  };
}

supabase.auth.onAuthStateChange((event) => {
  if (event !== "SIGNED_OUT") return;
  memoryCache.clear();
  queuedPaths.clear();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_CACHE_KEY);
  }
  listeners.forEach((pathListeners) => {
    pathListeners.forEach((listener) => listener());
  });
});

const CardImage = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement>
>(function CardImage({ src, loading, ...props }, ref) {
  const protectedPath = normalizeProtectedPath(src);
  const retryAttempt = useRef(0);
  const previousPath = useRef(protectedPath);
  const [retryVersion, setRetryVersion] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(() => {
    if (!protectedPath) return src;
    loadLocalCache();
    const cached = memoryCache.get(protectedPath);
    return cached && cached.expiresAt > Date.now()
      ? cached.url
      : LOADING_PLACEHOLDER;
  });

  useEffect(() => {
    if (!protectedPath) {
      retryAttempt.current = 0;
      previousPath.current = protectedPath;
      setResolvedSrc(src);
      return;
    }

    if (previousPath.current !== protectedPath) {
      retryAttempt.current = 0;
      previousPath.current = protectedPath;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    const retryDelay =
      retryAttempt.current === 0
        ? 0
        : Math.min(1000 * 2 ** (retryAttempt.current - 1), 30_000);

    setResolvedSrc(LOADING_PLACEHOLDER);
    const timer = window.setTimeout(() => {
      unsubscribe = requestSignedUrl(protectedPath, (url) => {
        if (cancelled) return;
        if (url) {
          setResolvedSrc(url);
          return;
        }

        retryAttempt.current += 1;
        setRetryVersion((version) => version + 1);
      });
    }, retryDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, [protectedPath, retryVersion, src]);

  const { onError, onLoad, style, ...imageProps } = props;
  const isWaiting = protectedPath && resolvedSrc === LOADING_PLACEHOLDER;

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      loading={loading ?? "lazy"}
      aria-busy={isWaiting || undefined}
      onError={(event) => {
        if (!protectedPath || resolvedSrc === LOADING_PLACEHOLDER) {
          onError?.(event);
          return;
        }

        invalidateSignedUrl(protectedPath);
        retryAttempt.current += 1;
        setResolvedSrc(LOADING_PLACEHOLDER);
        setRetryVersion((version) => version + 1);
      }}
      onLoad={(event) => {
        if (!protectedPath || resolvedSrc !== LOADING_PLACEHOLDER) {
          retryAttempt.current = 0;
          onLoad?.(event);
        }
      }}
      style={
        protectedPath
          ? {
              backgroundColor: "#e5e7eb",
              backgroundImage: `url("${LOADING_PLACEHOLDER}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              ...style,
            }
          : style
      }
      {...imageProps}
    />
  );
});

export default CardImage;
