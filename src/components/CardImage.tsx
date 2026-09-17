import { onAuthIdentityChange } from "@/lib/auth-identity";
import { suspendCardImageLoads, getCachedCardImage } from "@/lib/card-image-cache";
import { CARD_IMAGE_BUCKET as BUCKET, CARD_IMAGE_URL_LIFETIME_SECONDS as URL_LIFETIME_SECONDS, CARD_IMAGE_CACHE_LIFETIME_MS as CACHE_LIFETIME_MS, CARD_IMAGE_LOCAL_CACHE_KEY as LOCAL_CACHE_KEY, CARD_IMAGE_PLACEHOLDER as PLACEHOLDER, getProtectedCardPath as protectedPath } from "@/lib/card-images";
import { forwardRef, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { supabase } from "@/lib/supabase";
import { getCardImageStoragePath, type CardImageSize } from "@/lib/card-image-variants";
const unavailableThumbnails = new Set<string>();
type CacheEntry = { url: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<string | undefined>>();
const queue = new Map<string, (url?: string) => void>();
const failedUntil = new Map<string, number>();
const authListeners = new Set<() => void>();
let loaded = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
function loadCache() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || "{}");
    for (const [path, value] of Object.entries(stored)) {
      const entry = value as CacheEntry;
      if (typeof entry?.url === "string" && entry.expiresAt > Date.now()) cache.set(path, entry);
    }
  } catch { /* Storage may be blocked. */ }
}
function saveCache() {
  try {
    for (const [path, entry] of cache) if (entry.expiresAt <= Date.now()) cache.delete(path);
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch { /* In-memory caching remains available. */ }
}
async function flushQueue() {
  timer = undefined;
  const batch = [...queue];
  queue.clear();
  const epoch = generation;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || epoch !== generation) return;
    // Sequential chunks prevent a large mounted collection from flooding signing.
    for (let offset = 0; offset < batch.length; offset += 100) {
      if (epoch !== generation) break;
      const chunk = batch.slice(offset, offset + 100);
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(chunk.map(([path]) => path), URL_LIFETIME_SECONDS);
      if (epoch !== generation) break;
      for (let index = 0; index < chunk.length; index++) {
        const [path, resolve] = chunk[index];
        const result = data?.[index];
        if (!error && !result?.error && result?.signedUrl) {
          cache.set(path, { url: result.signedUrl, expiresAt: Date.now() + CACHE_LIFETIME_MS });
          failedUntil.delete(path);
          resolve(result.signedUrl);
        } else {
          failedUntil.set(path, Date.now() + 60_000);
        }
      }
    }
    if (epoch === generation) saveCache();
  } catch {
    if (epoch === generation) for (const [path] of batch) failedUntil.set(path, Date.now() + 60_000);
  } finally {
    for (const [, resolve] of batch) resolve(undefined);
  }
}
function requestUrl(path: string): Promise<string | undefined> {
  loadCache();
  const entry = cache.get(path);
  if (entry && entry.expiresAt > Date.now()) return Promise.resolve(entry.url);
  const existing = pending.get(path);
  if (existing) return existing;
  if ((failedUntil.get(path) || 0) > Date.now()) return Promise.resolve(undefined);
  const promise = new Promise<string | undefined>(resolve => queue.set(path, resolve));
  pending.set(path, promise);
  void promise.then(() => { if (pending.get(path) === promise) pending.delete(path); });
  if (!timer) timer = setTimeout(() => void flushQueue(), 10);
  return promise;
}
onAuthIdentityChange(event => {
  if (event === "SIGNED_OUT") {
    generation++;
    suspendCardImageLoads();
    cache.clear();
    failedUntil.clear();
    if (timer) clearTimeout(timer);
    timer = undefined;
    for (const resolve of queue.values()) resolve(undefined);
    queue.clear();
    pending.clear();
    try { localStorage.removeItem(LOCAL_CACHE_KEY); } catch { /* Storage may be blocked. */ }
  }
  if (event === "SIGNED_OUT" || event === "SIGNED_IN") authListeners.forEach(listener => listener());
});
type CardImageProps = ImgHTMLAttributes<HTMLImageElement> & { visible?: boolean; imageSize?: CardImageSize };
const CardImage = forwardRef<HTMLImageElement, CardImageProps>(function CardImage(
  { src, imageSize = "grid", visible = true, loading = "lazy", onError, onLoad, style, ...props }, forwardedRef,
) {
  const originalPath = protectedPath(src);
  const thumbnailPath = getCardImageStoragePath(originalPath, imageSize);
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const path = thumbnailPath && (unavailableThumbnails.has(thumbnailPath) || failedThumbnail === thumbnailPath)
    ? originalPath : thumbnailPath;
  const [revealedPath, setRevealedPath] = useState<string | null>(null);
  const active = visible || (!!path && revealedPath === path);
  useEffect(() => { if (visible) setRevealedPath(path); }, [visible, path]);
  const element = useRef<HTMLImageElement | null>(null);
  const [nearby, setNearby] = useState(loading === "eager");
  const [authVersion, setAuthVersion] = useState(0);
  const [retry, setRetry] = useState(0);
  const retries = useRef(0);
  const [image, setImage] = useState<{ path: string; url: string } | null>(null);
  useEffect(() => {
    const listener = () => { setImage(null); retries.current = 0; setAuthVersion(value => value + 1); };
    authListeners.add(listener);
    return () => { authListeners.delete(listener); };
  }, []);
  useEffect(() => { retries.current = 0; }, [path]);
  useEffect(() => {
    if (!path || loading === "eager" || nearby) return;
    if (typeof IntersectionObserver === "undefined") { setNearby(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, [path, loading, nearby]);
  useEffect(() => {
    if (!path || !active || (!nearby && loading !== "eager")) return;
    let cancelled = false;
    let release: (() => void) | undefined;
    const started = generation;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || cancelled || started !== generation) return;
      const source = await getCachedCardImage(path, session.user.id, () => requestUrl(path), retries.current > 0);
      if (cancelled || started !== generation) { source?.release(); return; }
      if (!source && path !== originalPath) {
        unavailableThumbnails.add(path);
        setFailedThumbnail(path);
        return;
      }
      release = source?.release;
      setImage(source ? { path, url: source.url } : null);
    })().catch(() => { if (!cancelled) setImage(null); });
    return () => { cancelled = true; release?.(); };
  }, [path, originalPath, active, nearby, loading, retry, authVersion]);
  const resolved = path ? (image?.path === path ? image.url : PLACEHOLDER) : (active ? src : undefined);
  const waiting = !!path && resolved === PLACEHOLDER;
  return <img
    {...props}
    ref={node => {
      element.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }}
    src={resolved}
    loading={loading}
    aria-busy={waiting || undefined}
    style={path ? { backgroundColor: "#e5e7eb", ...style } : style}
    onLoad={event => { if (!waiting) onLoad?.(event); }}
    onError={event => {
      if (!path || waiting) { onError?.(event); return; }
      if (path !== originalPath) {
        unavailableThumbnails.add(path);
        setFailedThumbnail(path);
        return;
      }
      // Refresh a failed URL once; never create an endless image-download loop.
      if (retries.current >= 1) { onError?.(event); return; }
      retries.current++;
      cache.delete(path); saveCache();
      setImage(null);
      setRetry(value => value + 1);
    }}
  />;
});
export default CardImage;
