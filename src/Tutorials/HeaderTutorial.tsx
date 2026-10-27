import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
export type HeaderTourPreparation = { sidebar: boolean; inventory?: boolean };
type Props = { userId?: string; light?: boolean; accent?: string; blocked?: boolean; onPrepare: (value: HeaderTourPreparation) => void; onActiveChange: (active: boolean) => void };
type Step = { title: string; body: string; target: string; prepare: HeaderTourPreparation };
const target = (name: string) => `[data-header-tour="${name}"]`;
const desktopSteps: Step[] = [
  { title: "Your profile", body: "Click your avatar to open this menu. This is where you’ll find your profile, inbox, friends, and collection tools. Choose Edit Profile to change your avatar and frame.", target: target("sidebar-profile"), prepare: { sidebar: true } },
  { title: "Inventory, binders, and ISO", body: "Inventory lists the cards you own and lets you manage your trade and sale listings. Binders let you arrange your cards. ISO lists what you’re missing, and Wishlist is for cards you want. Each has English and Chinese options.", target: [target("inventory"), target("binders"), target("iso")].join(","), prepare: { sidebar: true, inventory: true } },
  { title: "Collections", body: "Start here to track your cards. Choose English or Chinese, open a set, and click the cards you own. They’ll be added to your inventory too.", target: target("collections"), prepare: { sidebar: false } },
  { title: "Trading Post", body: "The arrows open Trading Post. Choose English or Chinese to see cards people have listed for trade or sale. You can manage your own listings from Inventory.", target: target("trade"), prepare: { sidebar: false } },
  { title: "Explore", body: "The people icon opens Explore. Look through other collectors’ profiles to see their cards, trade listings, ISO, and wishlist if they’ve chosen to share them.", target: target("explore"), prepare: { sidebar: false } },
  { title: "Leaderboards", body: "The medal opens the English and Chinese leaderboards. You can check your ranking here and read the requirements for appearing on them.", target: target("leaderboard"), prepare: { sidebar: false } },
  { title: "First Finishers", body: "The trophy opens First Finishers. This page shows who completed each set first and explains the requirements for being listed.", target: target("finishers"), prepare: { sidebar: false } },
  { title: "Inbox and friends", body: "Messages, friend requests, and trade offers go here. You can also read and reply to messages from staff in the Staff tab. A red number means there’s something unread.", target: target("inbox"), prepare: { sidebar: true } },
  { title: "Themes", body: "Use this menu to switch between light and dark mode or choose your own colors. Seasonal themes appear here when they’re available.", target: target("theme"), prepare: { sidebar: false } },
  { title: "Report a problem or contact staff", body: "The bug icon opens this menu. Use it to report something that isn’t working or send staff a message here on MLPEKAYOU.", target: target("help"), prepare: { sidebar: false } },
  { title: "Support Creators", body: "The heart opens Support Creators. You’ll find community projects here, along with ways to help cover MLPEKAYOU’s running costs.", target: target("support"), prepare: { sidebar: false } },
];
const mobileSteps: Step[] = [
  { title: "Your profile", body: "Tap here for your inbox, friends, inventory, binders, ISO, wishlist, and settings. Inventory lists your cards, binders let you arrange them, and ISO shows what you’re missing. Choose Edit Profile to change your avatar and frame. A red number means you have something unread in your inbox.", target: target("profile"), prepare: { sidebar: false } },
  { title: "Collections", body: "Tap Collections to choose English or Chinese checklists. Open a set and tap the cards you own. They’ll be added to your inventory too.", target: target("collections"), prepare: { sidebar: false } },
  { title: "Trading Post", body: "Choose English or Chinese to see cards people have listed for trade or sale. You can manage your own listings from Inventory in your profile.", target: target("trade"), prepare: { sidebar: false } },
  { title: "Explore", body: "Look through other collectors’ profiles here. You can see their trade listings, ISO, and wishlist if they’ve chosen to share them.", target: target("explore"), prepare: { sidebar: false } },
  { title: "Leaderboards", body: "The medal opens the English and Chinese leaderboards. You can check your ranking here and read the requirements for appearing on them.", target: target("leaderboard"), prepare: { sidebar: false } },
  { title: "First Finishers", body: "The trophy opens First Finishers. This page shows who completed each set first and explains the requirements for being listed.", target: target("finishers"), prepare: { sidebar: false } },
  { title: "Themes", body: "Tap here to switch between light and dark mode or choose your own colors. Seasonal themes appear here when they’re available.", target: target("theme"), prepare: { sidebar: false } },
  { title: "Report a problem or contact staff", body: "The bug icon opens this menu. Use it to report something that isn’t working or send staff a message here on MLPEKAYOU.", target: target("help"), prepare: { sidebar: false } },
  { title: "Support Creators", body: "The heart opens Support Creators. You’ll find community projects here, along with ways to help cover MLPEKAYOU’s running costs.", target: target("support"), prepare: { sidebar: false } },
];
type Box = { x: number; y: number; width: number; height: number };
type Position = { boxes: Box[]; context: Box | null; left: number; top: number; width: number; height: number; path: string; viewWidth: number; viewHeight: number };
const storageKey = (id: string, layout: string) => `mlpekayou:header-tour:v1:${id}:${layout}`;
const metadataKey = (layout: string) => `mlpekayou_header_tour_${layout}_v1`;
const rightOfSidebar = (boxes: Box[], left: number) => boxes.length > 0 && left > Math.max(...boxes.map(box => box.x + box.width));
const clamp = (value: number, low: number, high: number) => Math.min(Math.max(low, high), Math.max(low, value));
export default function HeaderTutorial({ userId, light = false, accent = "hsl(var(--primary))", blocked = false, onPrepare, onActiveChange }: Props) {
  const [layout, setLayout] = useState(() => window.innerWidth < 640 ? "mobile" : "desktop");
  const [phase, setPhase] = useState<"closed" | "checking" | "open">("closed");
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const account = useRef(userId);
  account.current = userId;
  const titleId = useId();
  const maskId = useId().replace(/:/g, "");
  const steps = layout === "mobile" ? mobileSteps : desktopSteps;
  const step = steps[Math.min(index, steps.length - 1)];
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const changed = () => setLayout(media.matches ? "mobile" : "desktop");
    media.addEventListener("change", changed);
    changed();
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    onPrepare({ sidebar: false });
    setIndex(0);
    setPosition(null);
    setPhase("closed");
    if (!userId) { onActiveChange(false); return; }
    onActiveChange(true);
    if (blocked) return;
    setPhase("checking");
    const check = async () => {
      try {
        let localSeen = false;
        try { localSeen = localStorage.getItem(storageKey(userId, layout)) === "done"; } catch {}
        if (localSeen) { if (active) { setPhase("closed"); onActiveChange(false); } return; }
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || data.user?.id !== userId) { setPhase("closed"); onActiveChange(false); return; }
        const saved = data.user.user_metadata?.[metadataKey(layout)];
        if (saved && typeof saved === "object" && saved.user_id === userId) {
          try { localStorage.setItem(storageKey(userId, layout), "done"); } catch {}
          setPhase("closed"); onActiveChange(false); return;
        }
        timer = window.setTimeout(() => { if (active) setPhase("open"); }, 700);
      } catch { if (active) { setPhase("closed"); onActiveChange(false); } }
    };
    void check();
    return () => { active = false; if (timer !== undefined) window.clearTimeout(timer); };
  }, [userId, layout, blocked, onActiveChange, onPrepare]);
  const finish = () => {
    const id = userId;
    setPhase("closed");
    setPosition(null);
    onPrepare({ sidebar: false });
    onActiveChange(false);
    if (!id) return;
    try { localStorage.setItem(storageKey(id, layout), "done"); } catch {}
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || data.user?.id !== id || account.current !== id) return;
        await supabase.auth.updateUser({ data: { [metadataKey(layout)]: { user_id: id, completed_at: new Date().toISOString() } } });
      } catch {}
    })();
  };
  useEffect(() => {
    if (phase !== "open" || !userId) return;
    onPrepare(step.prepare);
  }, [phase, index, layout, userId, onPrepare, step]);
  useEffect(() => () => { onPrepare({ sidebar: false }); onActiveChange(false); }, [onPrepare, onActiveChange]);
  useLayoutEffect(() => {
    if (phase !== "open") return;
    let frame = 0;
    let scrolled = false;
    const measure = () => {
      const viewport = window.visualViewport;
      const vx = viewport?.offsetLeft ?? 0, vy = viewport?.offsetTop ?? 0;
      const vw = viewport?.width ?? window.innerWidth, vh = viewport?.height ?? window.innerHeight;
      let elements = Array.from(document.querySelectorAll<HTMLElement>(step.target)).filter(node => {
        const r = node.getBoundingClientRect();
        const css = getComputedStyle(node);
        return r.width > 0 && r.height > 0 && css.display !== "none" && css.visibility !== "hidden" && r.right > vx && r.left < vx + vw;
      });
      if (!scrolled && step.prepare.sidebar && elements[0]) {
        elements[0].scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" as ScrollBehavior });
        scrolled = true;
      }
      const visibleBox = (node: HTMLElement, inset = 0): Box | null => {
        const r = node.getBoundingClientRect();
        const x = Math.max(vx + 6, r.left + inset), y = Math.max(vy + 6, r.top + inset);
        const right = Math.min(vx + vw - 6, r.right - inset), bottom = Math.min(vy + vh - 6, r.bottom - inset);
        return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
      };
      let boxes = elements.map(node => visibleBox(node, 2)).filter((box): box is Box => box !== null);
      if (step.prepare.sidebar && boxes.length > 1) {
        const x = Math.min(...boxes.map(box => box.x)), y = Math.min(...boxes.map(box => box.y));
        boxes = [{ x, y, width: Math.max(...boxes.map(box => box.x + box.width)) - x, height: Math.max(...boxes.map(box => box.y + box.height)) - y }];
      }
      const sidebar = step.prepare.sidebar ? elements[0]?.closest<HTMLElement>('[role="dialog"]') : null;
      const context = sidebar ? visibleBox(sidebar) : null;
      const width = Math.min(360, vw - 28);
      const height = panel.current?.getBoundingClientRect().height || 250;
      const first = boxes[0];
      let left = vx + (vw - width) / 2, top = vy + (vh - height) / 2;
      let fromX = left + width / 2, fromY = top, toX = fromX, toY = top - 16;
      if (first) {
        const right = Math.max(context ? context.x + context.width : 0, ...boxes.map(r => r.x + r.width));
        if (layout === "desktop" && step.prepare.sidebar && right + width + 48 < vx + vw) {
          left = right + 30; top = clamp(first.y + first.height / 2 - height / 2, vy + 16, vy + vh - height - 16);
          fromX = left - 4; fromY = top + Math.min(height - 30, 64); toX = first.x + first.width + 7; toY = first.y + first.height / 2;
        } else {
          left = clamp(first.x + first.width / 2 - width / 2, vx + 14, vx + vw - width - 14);
          const below = first.y + first.height + 36;
          const useBelow = below + height < vy + vh - 14;
          top = useBelow ? below : first.y - height - 36;
          top = clamp(top, vy + 14, vy + vh - height - 14);
          fromX = clamp(first.x + first.width / 2, left + 28, left + width - 28);
          fromY = useBelow ? top - 4 : top + height + 4;
          toX = first.x + first.width / 2; toY = useBelow ? first.y + first.height + 8 : first.y - 8;
        }
      }
      const horizontal = layout === "desktop" && step.prepare.sidebar && rightOfSidebar(boxes, left);
      const path = first ? horizontal
        ? `M ${fromX} ${fromY} C ${fromX - 16} ${fromY}, ${toX + 20} ${toY}, ${toX} ${toY}`
        : `M ${fromX} ${fromY} Q ${fromX} ${(fromY + toY) / 2}, ${toX} ${toY}` : "";
      const next = { boxes, context, left, top, width, height, path, viewWidth: window.innerWidth, viewHeight: window.innerHeight };
      setPosition(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    if (panel.current) observer.observe(panel.current);
    document.querySelectorAll(step.target).forEach(node => observer.observe(node));
    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, { childList: true, subtree: true });
    const timers = [0, 80, 180, 330, 500].map(delay => window.setTimeout(schedule, delay));
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    document.addEventListener("transitionend", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    schedule();
    const focusTimer = window.setTimeout(() => nextButton.current?.focus({ preventScroll: true }), 100);
    return () => {
      cancelAnimationFrame(frame); timers.forEach(timer => window.clearTimeout(timer)); window.clearTimeout(focusTimer); observer.disconnect(); mutation.disconnect();
      window.removeEventListener("resize", schedule); window.removeEventListener("scroll", schedule, true); document.removeEventListener("transitionend", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [phase, index, layout, step]);
  useEffect(() => {
    if (phase !== "open") return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finish(); }
      if (event.key !== "Tab") return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (!panel.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [phase, userId, layout]);
  if (phase !== "open" || !userId) return null;
  const style = { "--ht-accent": accent, "--ht-bg": light ? "#fffefb" : "#191b20", "--ht-ink": light ? "#24252a" : "#f5f5f7", "--ht-muted": light ? "#60636b" : "#bec0c9", "--ht-face": light ? "#382d14" : "#282024", left: position?.left ?? 14, top: position?.top ?? 100, width: position?.width ?? "calc(100% - 28px)" } as CSSProperties;
  return createPortal(<div data-header-tutorial="true" className="ht-layer" style={{ "--ht-accent": accent } as CSSProperties}>
    <style>{styles}</style>
    <div className="ht-catcher" onWheel={event => event.preventDefault()} onTouchMove={event => event.preventDefault()} />
    <svg className="ht-spotlight" width="100%" height="100%" aria-hidden="true"><defs><mask id={`${maskId}-mask`}><rect width="100%" height="100%" fill="white"/>{position?.context && <rect x={position.context.x} y={position.context.y} width={position.context.width} height={position.context.height} rx="12" fill="black"/>}{position?.boxes.map((r,i)=><rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} rx="13" fill="black"/>)}</mask><marker id={`${maskId}-arrow`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M1 1 7 4 1 7" fill="none" stroke="var(--ht-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></marker></defs><rect width="100%" height="100%" fill="#050611b3" mask={`url(#${maskId}-mask)`}/>{position?.boxes.map((r,i)=><rect key={i} className="ht-ring" x={r.x} y={r.y} width={r.width} height={r.height} rx="13"/>)}{position?.path && <path key={`${layout}-${index}`} className="ht-arrow" d={position.path} markerEnd={`url(#${maskId}-arrow)`}/>}</svg>
    <div ref={panel} data-header-tutorial="panel" className="ht-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} style={style}>
      <div className="ht-top"><span>SITE TOUR</span><button type="button" onClick={finish} aria-label="Skip tutorial">Skip</button></div>
      <div key={`${layout}-${index}`} className="ht-copy" aria-live="polite"><h2 id={titleId}>{step.title}</h2><p>{step.body}</p></div>
      <div className="ht-progress" aria-hidden="true"><span style={{width:`${(index+1)/steps.length*100}%`}}/></div>
      <footer><span>{index+1} of {steps.length}</span><div>{index>0 && <button type="button" onClick={()=>setIndex(value=>value-1)}>Back</button>}<button ref={nextButton} type="button" className="ht-next" onClick={()=>index===steps.length-1?finish():setIndex(value=>value+1)}>{index===steps.length-1?"Done":"Next"}<span aria-hidden="true">→</span></button></div></footer>
    </div>
  </div>,document.body);
}
const styles=`
.ht-layer{position:fixed;inset:0;z-index:140000;font-family:'Oxanium',sans-serif;isolation:isolate}.ht-catcher{position:absolute;inset:0;touch-action:none}.ht-spotlight{position:absolute;inset:0;pointer-events:none;overflow:visible}.ht-ring{fill:none;stroke:var(--ht-accent);stroke-width:2;opacity:.85}.ht-arrow{fill:none;stroke:var(--ht-accent);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:400;stroke-dashoffset:0;animation:ht-arrow-draw .65s ease-out both;}
.ht-panel{position:fixed;box-sizing:border-box;max-width:360px;max-height:min(350px,calc(100dvh - 28px));overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding:15px 17px 13px;border:1px solid color-mix(in srgb,var(--ht-accent) 35%,transparent);border-radius:18px;background:var(--ht-bg);color:var(--ht-ink);box-shadow:0 8px 30px #0004;transition:top .25s ease,left .25s ease;animation:ht-appear .32s ease-out both}.ht-top{display:flex;align-items:center;gap:9px;min-height:28px;color:var(--ht-accent)}.ht-top>span{font-size:10px;font-weight:600;letter-spacing:.07em}.ht-top>button{margin-left:auto;min-height:32px;border:0;background:transparent;color:var(--ht-muted);font:inherit;font-size:11px;cursor:pointer;padding:5px}
.ht-copy{animation:ht-copy-in .26s ease-out both}.ht-copy h2{margin:10px 0 7px;font-size:18px;font-weight:650;letter-spacing:-.025em;line-height:1.25}.ht-copy p{margin:0;font-size:12px;line-height:1.7;color:var(--ht-muted)}.ht-progress{height:3px;background:color-mix(in srgb,var(--ht-accent) 12%,transparent);border-radius:99px;margin-top:17px;overflow:hidden}.ht-progress>span{display:block;height:100%;border-radius:inherit;background:var(--ht-accent);transition:width .28s ease}
.ht-panel footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px}.ht-panel footer>span{font-size:10px;color:var(--ht-muted)}.ht-panel footer>div{display:flex;align-items:center;gap:8px}.ht-panel footer button{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:40px;padding:8px 12px;border:0;border-radius:12px;background:transparent;font:inherit;font-size:12px;font-weight:600;color:var(--ht-muted);cursor:pointer}.ht-panel footer .ht-next{background:var(--ht-accent);color:var(--ht-face)}.ht-next span{transition:transform .2s}.ht-next:hover span{transform:translateX(3px)}.ht-panel button:focus-visible{outline:2px solid var(--ht-accent);outline-offset:3px}
@keyframes ht-arrow-draw{from{stroke-dashoffset:400;opacity:0}to{stroke-dashoffset:0;opacity:1}}@keyframes ht-appear{from{opacity:0;transform:translateY(9px) scale(.97)}to{opacity:1;transform:none}}@keyframes ht-copy-in{from{opacity:0;transform:translateX(7px)}to{opacity:1;transform:none}}
@media(max-width:639px){.ht-panel{padding:14px 16px 12px;border-radius:20px}.ht-copy h2{font-size:18px}.ht-copy p{font-size:12px;line-height:1.6}.ht-top>span{font-size:10px}.ht-progress{margin-top:13px}}
@media(prefers-reduced-motion:reduce){.ht-layer *{animation:none!important;transition:none!important}}
`;
