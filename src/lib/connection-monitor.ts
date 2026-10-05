export type ConnectionIssue = "offline" | "slow" | "unreachable" | "service";
type Service = "database" | "images";
type Sample = { key: string; time: number; kind: "slow" | "unreachable" | "service" };
export type ConnectionHealth = { issue: ConnectionIssue | null; episode: number; checking: boolean };
const IMAGE_ORIGIN = "https://mlpekayou-images.keegan-586.workers.dev";
const nativeFetch = globalThis.fetch.bind(globalThis);
const listeners = new Set<() => void>();
const samples: Record<Service, Sample[]> = { database: [], images: [] };
const issues: Record<Service, ConnectionIssue | null> = { database: null, images: null };
const lastSuccess: Record<Service, number> = { database: 0, images: 0 };
let databaseOrigin = "";
let publishableKey = "";
let installed = false;
let offline = typeof navigator !== "undefined" && !navigator.onLine;
let health: ConnectionHealth = { issue: offline ? "offline" : null, episode: offline ? 1 : 0, checking: false };
let retryPromise: Promise<boolean> | null = null;
function notify(checking = health.checking) {
  const issue = offline ? "offline" : issues.database || issues.images;
  if (issue === health.issue && checking === health.checking) return;
  health = { issue, checking, episode: health.episode + (!health.issue && issue ? 1 : 0) };
  listeners.forEach(listener => listener());
}
export const getConnectionHealth = (): ConnectionHealth => health;
export function subscribeConnection(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function visible() {
  return typeof document === "undefined" || document.visibilityState === "visible";
}
function record(service: Service, key: string, kind: Sample["kind"], started: number) {
  if (!visible() || started < lastSuccess[service]) return;
  const now = Date.now();
  samples[service] = samples[service].filter(sample => now - sample.time < 30000);
  samples[service].push({ key, kind, time: now });
  const matching = samples[service].filter(sample => sample.kind === kind);
  const count = kind === "slow" ? new Set(matching.map(sample => sample.key)).size : matching.length;
  if (count >= (kind === "slow" ? 2 : 3)) {
    issues[service] = kind;
    notify();
  }
}
function recovered(service: Service) {
  lastSuccess[service] = Date.now();
  samples[service] = [];
  issues[service] = null;
  offline = false;
  notify();
}
function identify(input: RequestInfo | URL): { service: Service; key: string } | null {
  try {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, typeof location === "undefined" ? "https://mlpekayou.com" : location.origin);
    if (databaseOrigin && url.origin === databaseOrigin) return { service: "database", key: url.pathname };
    if (url.origin === IMAGE_ORIGIN) return { service: "images", key: url.pathname };
  } catch { return null; }
  return null;
}
export const monitoredFetch: typeof fetch = async (input, init) => {
  const target = identify(input);
  if (!target) return nativeFetch(input, init);
  const started = Date.now();
  const signal = init?.signal ?? (input instanceof Request ? input.signal : null);
  const beganVisible = visible();
  let wentHidden = false;
  const onVisibility = () => { if (!visible()) wentHidden = true; };
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
  const timer = setTimeout(() => {
    if (beganVisible && !wentHidden && !signal?.aborted) record(target.service, target.key, "slow", started);
  }, 12000);
  try {
    const response = await nativeFetch(input, init);
    if (response.status >= 500) {
      record(target.service, target.key, "service", started);
    } else if (response.type !== "opaque") {
      recovered(target.service);
    }
    return response;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (!signal?.aborted && name !== "AbortError" && beganVisible && !wentHidden) {
      record(target.service, target.key, "unreachable", started);
    }
    throw error;
  } finally {
    clearTimeout(timer);
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
  }
};
export function configureConnectionMonitor(url: string, key: string) {
  databaseOrigin = new URL(url).origin;
  publishableKey = key;
  if (typeof window === "undefined" || installed) return;
  installed = true;
  const previousFetch = window.fetch.bind(window);
  window.fetch = (input, init) => identify(input)?.service === "images" ? monitoredFetch(input, init) : previousFetch(input, init);
  window.addEventListener("offline", () => { offline = true; notify(); });
  window.addEventListener("online", () => { void retryConnection(); });
}
async function probe(service: Service) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = service === "database" ? `${databaseOrigin}/auth/v1/health` : `${IMAGE_ORIGIN}/`;
    const response = await nativeFetch(url, {
      signal: controller.signal,
      cache: "no-store",
      ...(service === "database" ? { headers: { apikey: publishableKey } } : {}),
    });
    if (response.type === "opaque") throw new Error("Unverifiable response");
    if (response.status >= 500) {
      issues[service] = "service";
      notify();
      return false;
    }
    recovered(service);
    return true;
  } catch {
    issues[service] = "unreachable";
    notify();
    return false;
  } finally { clearTimeout(timer); }
}
export function retryConnection(): Promise<boolean> {
  if (retryPromise) return retryPromise;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    offline = true;
    notify();
    return Promise.resolve(false);
  }
  offline = false;
  notify(true);
  const affected = (Object.keys(issues) as Service[]).filter(service => issues[service]);
  const targets: Service[] = affected.length ? affected : ["database"];
  retryPromise = Promise.all(targets.map(probe)).then(results => results.every(Boolean)).finally(() => {
    retryPromise = null;
    notify(false);
  });
  return retryPromise;
}
