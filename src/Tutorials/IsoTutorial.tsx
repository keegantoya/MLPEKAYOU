import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
type Props = { userId: string | null; isLightMode: boolean; onControlsChange: (open: boolean) => void };
type Step = { target: string; title: string; text: string; view: "page" | "card" | "controls" | "sets" };
const steps: Step[] = [
  { target: "categories", title: "Choose a card category", text: "Pick Moon, Fun Moments, Rainbow, Star, TCG, or Promos to see cards you are missing.", view: "page" },
  { target: "card", title: "Open a card", text: "Select a missing card to open its actions. We will open this menu for you in the next step.", view: "page" },
  { target: "buying", title: "Mark a purchase in progress", text: "Choose Buying when you are purchasing this card. The card gets a Buying badge so you can track it.", view: "card" },
  { target: "trading", title: "Mark a trade in progress", text: "Choose Trading when you are trading for this card. Its badge changes to Trading For. This tracks a card you are getting.", view: "card" },
  { target: "buying", title: "Clear a status", text: "To clear Buying or Trading, select the same active option again. You can also use Clear in-progress status when a status is set. The card stays missing until you mark it complete.", view: "card" },
  { target: "complete", title: "When your card arrives", text: "Choose Mark complete to add the card to your collection and clear its in-progress status. Only do this when you have the card.", view: "card" },
  { target: "wishlist-action", title: "Save to your wishlist", text: "Choose Add to wishlist to save a card. If it is already saved, this button says Remove from wishlist instead. The heart badge identifies saved cards.", view: "card" },
  { target: "controls-button", title: "Open ISO Controls", text: "Open Controls here to search and adjust what ISO shows. We will open the panel for you next.", view: "page" },
  { target: "all-cards", title: "Show all cards", text: "Turn this on to include owned cards and hidden sets. This is a browsing view, so normal card status menus are not available. Turn it off before using Wishlist mode.", view: "controls" },
  { target: "wishlist-mode", title: "Wishlist mode", text: "Turn this on to add or remove any card from your wishlist, including owned cards. Close Controls and select a card. The Wishlist category also becomes available. Show all cards must be off first.", view: "controls" },
  { target: "code-search", title: "Search by card code", text: "Enter a card code here. You can type # for the special ER-style symbol and <> for the diamond symbol. Empty the field to clear it. Changing category clears both searches.", view: "controls" },
  { target: "character-search", title: "Search by character", text: "Enter a character name here. In normal ISO, searches check across card categories. Clear both search fields to return to regular browsing. Wishlist mode also has a character search above the cards.", view: "controls" },
  { target: "private-iso", title: "Keep your ISO private", text: "Turn Private ISO on to hide your ISO from your public profile. Turn it off to show it again. Your saved cards and statuses stay intact.", view: "controls" },
  { target: "set-visibility", title: "Choose which sets appear", text: "Open Set visibility to hide or show individual sets in normal ISO. We will open it for the final step.", view: "controls" },
  { target: "hidden-set", title: "On means hidden", text: "Expand a category to find its sets. A switch that is on means that set is hidden. Turn it off to show the set again. Show all cards and Wishlist mode temporarily include hidden sets. Choose Done when finished.", view: "sets" }
];
function visibleTarget(name: string) {
  const isVisible = (el: HTMLElement) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  const anchored = Array.from(document.querySelectorAll<HTMLElement>(`[data-iso-tour="${name}"]`)).find(isVisible);
  if (anchored) return anchored;
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).filter(isVisible);
  if (name === "controls-button") return buttons.find(button => /^(ISO Controls|Controls)$/.test(button.textContent?.trim() || "") && !button.closest('[data-iso-arrow-tour]'));
  if (name === "categories") {
    const category = buttons.find(button => /^(Moon|Fun Moments|Rainbow|Star|TCG|Promos)$/.test(button.textContent?.trim() || "") && !button.closest('[data-iso-arrow-tour]'));
    return category?.closest<HTMLElement>("nav") || category?.parentElement || undefined;
  }
  return undefined;
}
function closeCard() { (visibleTarget("card-close") || visibleTarget("card-backdrop"))?.click(); }
function closeSets() { visibleTarget("sets-done")?.click(); }
export default function ISOTutorial({ userId, isLightMode, onControlsChange }: Props) {
const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);
const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
const [size, setSize] = useState({ width: 360, height: 700 });
const [boxHeight, setBoxHeight] = useState(240);
const [waiting, setWaiting] = useState(true);
const box = useRef<HTMLDivElement>(null);
const nextButton = useRef<HTMLButtonElement>(null);
const dismissals = useRef(new Set<string>());
const originalFocus = useRef<HTMLElement | null>(null);
const originalControls = useRef(false);
const originalScroll = useRef(0);
const step = steps[index];
const key = userId ? `mlpekayou:iso-arrow-tour:v3:${userId}:${mobile ? "mobile" : "desktop"}` : "";
  useEffect(() => {
const media = window.matchMedia("(max-width: 767px)");
const sync = () => setMobile(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!key) { setOpen(false); return; }
let seen = dismissals.current.has(key);
    try { seen = seen || localStorage.getItem(key) === "seen"; } catch {}
    if (!seen) {
      originalScroll.current = window.scrollY;
      originalControls.current = !!visibleTarget("controls-panel");
      originalFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIndex(0);
    setOpen(!seen);
  }, [key]);
  useEffect(() => {
    if (!open) return;
const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
let cancelled = false;
let attempts = 0;
let lastTarget: HTMLElement | undefined;
    setWaiting(true);
    setRect(null);
    if (box.current) box.current.scrollTop = 0;
    if (step.view !== "card") closeCard();
    if (step.view !== "sets") closeSets();
    onControlsChange(step.view === "controls" || step.view === "sets");
const measure = () => {
      if (cancelled) return;
      attempts += 1;
      if (step.view === "card" && !visibleTarget("card-menu")) visibleTarget("card")?.click();
      if (step.view === "sets" && !visibleTarget("sets-panel")) visibleTarget("set-visibility")?.click();
      if (step.view === "sets" && !visibleTarget("hidden-set")) visibleTarget("set-category")?.click();
const target = visibleTarget(step.target);
const viewport = window.visualViewport;
const width = viewport?.width || window.innerWidth;
const height = viewport?.height || window.innerHeight;
      setSize(current => current.width === width && current.height === height ? current : { width, height });
      if (target) {
        if (target !== lastTarget) {
          target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
          lastTarget = target;
        }
const bounds = target.getBoundingClientRect();
const left = Math.max(6, bounds.left - 5);
const top = Math.max(6, bounds.top - 5);
const right = Math.min(width - 6, bounds.right + 5);
const bottom = Math.min(height - 6, bounds.bottom + 5);
const next = right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : null;
        setRect(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
        setWaiting(false);
      } else if (attempts >= 15) { setRect(null); setWaiting(false); }
    };
const timer = window.setInterval(measure, 160);
const focusTimer = window.setTimeout(() => nextButton.current?.focus({ preventScroll: true }), 50);
    measure();
    return () => { cancelled = true; window.clearInterval(timer); window.clearTimeout(focusTimer); };
  }, [open, index, step, onControlsChange]);
  useLayoutEffect(() => {
    if (!open || !box.current) return;
const observer = new ResizeObserver(() => { if (box.current) setBoxHeight(box.current.getBoundingClientRect().height); });
    observer.observe(box.current);
    return () => observer.disconnect();
  }, [open]);
const finish = () => {
    if (key) {
      dismissals.current.add(key);
      try { localStorage.setItem(key, "seen"); } catch {}
    }
    closeCard();
    closeSets();
    onControlsChange(originalControls.current);
    setOpen(false);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: originalScroll.current, behavior: "auto" });
      originalFocus.current?.focus({ preventScroll: true });
    });
  };
const width = Math.min(mobile ? 350 : 380, size.width - 24);
const gap = 26;
const targetX = rect ? rect.left + rect.width / 2 : size.width / 2;
const left = Math.max(12, Math.min(size.width - width - 12, targetX - width / 2));
const below = rect ? size.height - rect.top - rect.height : 0;
const above = rect?.top || 0;
const under = !!rect && below >= above;
const top = rect ? Math.max(12, Math.min(size.height - boxHeight - 12, under ? rect.top + rect.height + gap : rect.top - boxHeight - gap)) : Math.max(12, (size.height - boxHeight) / 2);
const arrowX = Math.max(left + 18, Math.min(left + width - 18, targetX));
const endY = rect ? under ? rect.top + rect.height + 2 : rect.top - 2 : 0;
const startY = under ? top : top + boxHeight;
const overlaps = rect ? top < rect.top + rect.height && top + boxHeight > rect.top : false;
const panelStyle: CSSProperties = { position: "fixed", left, top, width, maxHeight: rect ? Math.max(120, (under ? below : above) - gap - 12) : size.height - 24, boxSizing: "border-box", overflowY: "auto", borderRadius: 20, padding: mobile ? 16 : 20, background: isLightMode ? "#ffffff" : "#17191b", color: isLightMode ? "#18181b" : "#f4f4f5", border: `1px solid ${isLightMode ? "#d4d4d8" : "#3f3f46"}`, boxShadow: "0 20px 70px #0008", pointerEvents: "auto" };
const buttonStyle: CSSProperties = { minHeight: 44, padding: "8px 14px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "1px solid #71717a", background: "transparent", color: "inherit" };
  return <>
    <button type="button" onClick={() => {
      originalFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      originalScroll.current = window.scrollY;
      originalControls.current = !!visibleTarget("controls-panel");
      setIndex(0); setOpen(true);
    }} className="mb-4 min-h-11 rounded-xl border border-current/20 px-4 py-2 text-sm font-semibold">ISO tutorial</button>
    {open && createPortal(<div data-iso-arrow-tour="true" role="dialog" aria-modal="true" aria-labelledby="iso-arrow-tour-title" aria-describedby="iso-arrow-tour-description" style={{ position: "fixed", inset: 0, zIndex: 2147483000, isolation: "isolate" }} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finish(); }
      if (event.key === "Tab") {
const buttons = Array.from(box.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
        if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1]?.focus(); }
        if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0]?.focus(); }
      }
    }}>
      <svg width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0, touchAction: "none" }}>
        <defs><mask id="iso-tour-mask"><rect width="100%" height="100%" fill="white" />{rect && <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx="12" fill="black" />}</mask><marker id="iso-tour-arrow" markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="#E7C84B" strokeWidth="2" /></marker></defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#iso-tour-mask)" />
        {rect && <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx="12" fill="none" stroke="#E7C84B" strokeWidth="3" />}
        {rect && !overlaps && <path d={`M ${arrowX} ${startY} Q ${arrowX} ${(startY + endY) / 2} ${targetX} ${endY}`} fill="none" stroke="#E7C84B" strokeWidth="3" markerEnd="url(#iso-tour-arrow)" />}
      </svg>
      <div ref={box} style={panelStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><span style={{ fontSize: 12, opacity: .7 }}>{mobile ? "Mobile" : "Desktop"} guide - {index + 1} / {steps.length}</span><button type="button" onClick={finish} style={{ ...buttonStyle, padding: "6px 10px" }}>Skip</button></div>
        <h2 id="iso-arrow-tour-title" style={{ fontSize: 20, fontWeight: 750, margin: "10px 0" }}>{step.title}</h2>
        <p id="iso-arrow-tour-description" style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{index === 0 ? mobile ? "Swipe these category buttons sideways and tap a category to see its missing cards." : "Use these categories in the left sidebar to choose which missing cards to browse." : index === 7 ? mobile ? "Tap this Controls button at the top of ISO. We will open it for you next." : "Click ISO Controls beneath the sidebar categories. We will open it for you next." : step.text}</p>
        {!rect && <p role="status" style={{ fontSize: 12, opacity: .75, marginTop: 10 }}>{waiting ? "Finding this control..." : step.view === "card" || step.target === "card" ? "There is no selectable missing card visible in this view. You can still read these steps, or replay the tour in a category with missing cards." : "This control is not visible in the current view. Continue or replay the guide when it is available."}</p>}
        <p style={{ fontSize: 11, opacity: .6, margin: "12px 0" }}>The guide opens menus only. It does not change your cards or settings.</p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><button type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)} style={{ ...buttonStyle, opacity: index === 0 ? .4 : 1 }}>Back</button><button ref={nextButton} type="button" onClick={() => index === steps.length - 1 ? finish() : setIndex(value => value + 1)} style={{ ...buttonStyle, borderColor: "#E7C84B", background: "#E7C84B", color: "#18181b" }}>{index === steps.length - 1 ? "Done" : "Next"}</button></div>
      </div>
    </div>, document.body)}
  </>;
}
