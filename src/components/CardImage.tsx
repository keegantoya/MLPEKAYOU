import { onAuthIdentityChange } from "@/lib/auth-identity";
import { getCachedCardImage, suspendCardImageLoads } from "@/lib/card-image-cache";
import {
  CARD_IMAGE_PLACEHOLDER as PLACEHOLDER,
  CARD_IMAGE_WORKER_URL,
  getCardImageRevision,
  getProtectedCardPath as protectedPath,
} from "@/lib/card-images";
import { getCardImageStoragePath, type CardImageSize } from "@/lib/card-image-variants";
import { supabase } from "@/lib/supabase";
import { forwardRef, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

const unavailableThumbnails = new Set<string>();
const authListeners = new Set<() => void>();
let generation = 0;

function imageUrl(path: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = new URL(encodedPath, `${CARD_IMAGE_WORKER_URL}/`);
  const revision = getCardImageRevision(path);
  if (revision !== "1") url.searchParams.set("v", revision);
  return url.href;
}

async function fetchImage(path: string, accessToken: string, signal: AbortSignal) {
  const request = (token: string) => fetch(imageUrl(path), {
    signal,
    credentials: "omit",
    cache: "default",
    headers: { Authorization: `Bearer ${token}` },
  });

  let response = await request(accessToken);
  if (response.status !== 401 || signal.aborted) return response;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token || signal.aborted) return response;
  response = await request(data.session.access_token);
  return response;
}

onAuthIdentityChange(event => {
  if (event === "SIGNED_OUT") {
    generation++;
    suspendCardImageLoads();
  }
  if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
    authListeners.forEach(listener => listener());
  }
});

type CardImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  visible?: boolean;
  imageSize?: CardImageSize;
};

const CardImage = forwardRef<HTMLImageElement, CardImageProps>(function CardImage(
  { src, imageSize = "grid", visible = true, loading = "lazy", onError, onLoad, style, ...props },
  forwardedRef,
) {
  const originalPath = protectedPath(src);
  const thumbnailPath = getCardImageStoragePath(originalPath, imageSize);
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const path = thumbnailPath && (unavailableThumbnails.has(thumbnailPath) || failedThumbnail === thumbnailPath)
    ? originalPath
    : thumbnailPath;
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
    const listener = () => {
      setImage(null);
      retries.current = 0;
      setAuthVersion(value => value + 1);
    };
    authListeners.add(listener);
    return () => { authListeners.delete(listener); };
  }, []);

  useEffect(() => { retries.current = 0; }, [path]);

  useEffect(() => {
    if (!path || loading === "eager" || nearby) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearby(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setNearby(true);
        observer.disconnect();
      }
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
      if (!session?.user || !session.access_token || cancelled || started !== generation) return;

      const source = await getCachedCardImage(
        path,
        session.user.id,
        signal => fetchImage(path, session.access_token, signal),
        retries.current > 0,
      );

      if (cancelled || started !== generation) {
        source?.release();
        return;
      }
      if (!source && path !== originalPath) {
        unavailableThumbnails.add(path);
        setFailedThumbnail(path);
        return;
      }
      release = source?.release;
      setImage(source ? { path, url: source.url } : null);
    })().catch(() => { if (!cancelled) setImage(null); });

    return () => {
      cancelled = true;
      release?.();
    };
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
      if (!path || waiting) {
        onError?.(event);
        return;
      }
      if (path !== originalPath) {
        unavailableThumbnails.add(path);
        setFailedThumbnail(path);
        return;
      }
      if (retries.current >= 1) {
        onError?.(event);
        return;
      }
      retries.current++;
      setImage(null);
      setRetry(value => value + 1);
    }}
  />;
});

export default CardImage;
