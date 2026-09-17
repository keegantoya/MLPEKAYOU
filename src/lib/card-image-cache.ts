import { CARD_IMAGE_BYTES_CACHE, CARD_IMAGE_BYTES_TTL_MS, getCardImageRevision } from "@/lib/card-images";
type ImageData = { blob: Blob } | undefined;
type ImageLoader = (signal: AbortSignal) => Promise<Response | undefined>;
const inFlight = new Map<string, Promise<ImageData>>();
let epoch = 0;
function cacheKey(path: string, userId: string) {
  const key = new URL("/__card_image_cache__", window.location.origin);
  key.searchParams.set("user", userId);
  key.searchParams.set("path", path);
  key.searchParams.set("revision", getCardImageRevision(path));
  return key.href;
}
async function openImageCache() {
  try { return typeof caches === "undefined" ? undefined : await caches.open(CARD_IMAGE_BYTES_CACHE); }
  catch { return undefined; }
}
export function suspendCardImageLoads() {
  epoch++;
  inFlight.clear();
}
export function clearCardImageBytes() {
  suspendCardImageLoads();
  // Explicit cache removal only. Normal sign-out preserves account-scoped files.
  if (typeof caches !== "undefined") void caches.delete(CARD_IMAGE_BYTES_CACHE).catch(() => {});
}
async function readOrDownload(key: string, load: ImageLoader, bypass: boolean): Promise<ImageData> {
  const started = epoch;
  const disk = await openImageCache();
  if (disk) {
    try {
      const saved = bypass ? undefined : await disk.match(key);
      if (saved) {
        const expires = Number(saved.headers.get("X-Card-Expires"));
        if (expires > Date.now() && saved.headers.get("Content-Type")?.startsWith("image/")) {
          const blob = await saved.blob();
          if (blob.size && epoch === started) return { blob };
        }
      }
      await disk.delete(key);
    } catch { /* A storage failure must not prevent display. */ }
  }
  if (epoch !== started) return undefined;
  if (typeof URL.createObjectURL !== "function") return undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await load(controller.signal);
    if (!response?.ok || !response.headers.get("Content-Type")?.startsWith("image/")) return undefined;
    const blob = await response.blob();
    if (epoch !== started || !blob.size) return undefined;
    try {
      await disk.put(key, new Response(blob, { headers: {
        "Content-Type": blob.type,
        "X-Card-Expires": String(Date.now() + CARD_IMAGE_BYTES_TTL_MS),
      } }));
      if (epoch !== started) { await disk.delete(key); return undefined; }
    } catch { /* Quota full: display the downloaded image without storing it. */ }
    return epoch === started ? { blob } : undefined;
  } catch { return undefined; }
  finally { clearTimeout(timer); }
}
export async function getCachedCardImage(
  path: string,
  userId: string,
  load: ImageLoader,
  bypass = false,
): Promise<{ url: string; release: () => void } | undefined> {
  const key = cacheKey(path, userId);
  let pending = inFlight.get(key);
  if (!pending) {
    pending = readOrDownload(key, load, bypass);
    inFlight.set(key, pending);
    void pending.finally(() => { if (inFlight.get(key) === pending) inFlight.delete(key); }).catch(() => {});
  }
  const data = await pending;
  if (!data) return undefined;
  try {
    const url = URL.createObjectURL(data.blob);
    return { url, release: () => URL.revokeObjectURL(url) };
  } catch {
    return undefined;
  }
}
