import { getPromotionalCardsBack as getCardBack, cardImagePaths } from "@/lib/card-images";
import CollectionLoading from "@/components/CollectionLoading";
import CardImage from "@/components/CardImage";
import { useState, useEffect, useRef, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
import { ArrowLeft, Check, X, RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
const CCG_PROMO_SOURCES: Record<string, string> = {
  "PR-1": "Thailand Exclusive",
  "PR-2": "Moon One 24-Pack Box",
  "PR-3": "Rainbow One Box",
  "PR-4": "Fun Moments One Box",
  "PR-5": "Moon Two 12-Pack Box",
  "PR-7": "Rainbow Two Box",
  "PR-14": "Moon Four 12-Pack Box",
  "PR-8": "San Diego Comic-Con 2026",
  "PR-9": "San Diego Comic-Con 2026",
  "PR-10": "San Diego Comic-Con 2026",
  "PR-11": "San Diego Comic-Con 2026",
  "PR-12": "San Diego Comic-Con 2026",
  "PR-13": "San Diego Comic-Con 2026",
};
const TCG_PROMO_SOURCES: Record<string, string> = {
  RR01: "Tournament Prize",
  RR02: "Tournament Prize",
  RR03: "Tournament Prize",
  RR04: "Tournament Prize",
  RR05: "Tournament Prize",
  RR06: "Tournament Prize",
  RR07: "Anime Expo 2026",
  RR08: "Anime Expo 2026",
  RR09: "Anime Expo 2026",
  RR10: "Anime Expo 2026",
  RR11: "Anime Expo 2026",
  RR12: "Anime Expo 2026",
  RR13: "Discord Box",
  RR14: "Discord Box",
  RR15: "Discord Box",
  RR16: "Discord Box",
  RR17: "Discord Box",
  RR18: "Discord Box",
  RR19: "Nightmare Night Box",
  RR20: "Nightmare Night Box",
  RR21: "Nightmare Night Box",
  RR22: "Nightmare Night Binder Set",
  RR23: "Nightmare Night Binder Set",
  RR24: "Nightmare Night Binder Set",
  RR25: "Nightmare Night Binder Set",
  RR26: "Nightmare Night Binder Set",
  RR27: "Nightmare Night Binder Set",
  RR28: "NYCC 2026",
};
const CCG_CARD_ZOOM: Record<string, number> = {
  "PR-1": 1.009,
  "PR-2": 1.04,
  "PR-3": 1.035,
  "PR-4": 1.035,
  "PR-5": 1.033,
  "PR-7": 1.035,
  "PR-14": 1.035,
  "PR-8": 1.04,
  "PR-9": 1.04,
  "PR-10": 1.04,
  "PR-11": 1.04,
  "PR-12": 1.04,
  "PR-13": 1.04,
};
const TCG_CARD_ZOOM: Record<string, number> = {
  RR01: 0.99,
  RR02: 0.99,
  RR03: 0.99,
  RR04: 0.99,
  RR05: 0.99,
  RR06: 0.99,
  RR07: 0.99,
  RR08: 0.99,
  RR09: 1.035,
  RR10: 1.025,
  RR11: 1.025,
  RR12: 1.025,
  RR13: 0.99,
  RR14: 0.99,
  RR15: 0.99,
  RR16: 0.99,
  RR17: 0.99,
  RR18: 0.99,
  RR19: 0.99,
  RR20: 0.99,
  RR21: 0.99,
  RR22: 0.99,
  RR23: 0.99,
  RR24: 0.99,
  RR25: 0.99,
  RR26: 0.99,
  RR27: 0.99,
  RR28: 0.99,
};
const getPromoFrontStyle = (key: string): CSSProperties => ({
    backgroundColor: "transparent",
    backgroundImage: "none",
    transform: key === "RR09" ? "translateY(-0.75%) scale(1.035, 1.02)" : `scale(${key.startsWith("PR-") ? CCG_CARD_ZOOM[key] ?? 1 : TCG_CARD_ZOOM[key] ?? 1})`
});
type PromoCard = { key: string; category: "CCG" | "TCG"; front: string; back: string; source: string; original: boolean };
const promoCards: PromoCard[] = [
    ...[1, 2, 3, 4, 5, 7, 14, 8, 9, 10, 11, 12, 13].map(number => ({ key: `PR-${number}`, category: "CCG" as const, front: cardImagePaths.ccgPromo(String(number).padStart(3, "0")), back: getCardBack(number), source: CCG_PROMO_SOURCES[`PR-${number}`], original: number === 14 })),
    ...Array.from({ length: 28 }, (_, index) => {
        const number = index + 1;
        const key = `RR${String(number).padStart(2, "0")}`;
        return { key, category: "TCG" as const, front: cardImagePaths.tcgPromo(key), back: cardImagePaths.fixed.cardBacksTcgdefaultback, source: TCG_PROMO_SOURCES[key], original: number === 28 };
    })
];
type Quaternion = [
    number,
    number,
    number,
    number
];
type InspectCard = {
    key: string;
    code: string;
    front: string;
    back: string;
};
const multiplyRotation = (a: Quaternion, b: Quaternion): Quaternion => {
    const [x, y, z, w] = a;
    const [u, v, t, s] = b;
    const q: Quaternion = [w * u + x * s + y * t - z * v, w * v - x * t + y * s + z * u, w * t + x * v - y * u + z * s, w * s - x * u - y * v - z * t];
    const length = Math.hypot(...q) || 1;
    return q.map(value => value / length) as Quaternion;
};
const axisRotation = (x: number, y: number, z: number, angle: number): Quaternion => {
    const length = Math.hypot(x, y, z) || 1;
    const sine = Math.sin(angle / 2) / length;
    return [x * sine, y * sine, z * sine, Math.cos(angle / 2)];
};
const rotationMatrix = ([x, y, z, w]: Quaternion) => `matrix3d(${[
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1
].join(",")})`;
const getInspectorCardHeight = (width: number, height: number, aspect: number) => {
    const limit = Math.max(0, Math.min(width, height) / 2 - 12);
    const radius = limit / Math.sqrt(1 + (limit / 1000) ** 2);
    return Math.min(440, 2 * Math.sqrt(Math.max(0, radius * radius - .25)) / Math.hypot(1, aspect));
};
function CardInspector({ card, onClose, onPrevious, onNext }: {
    card: InspectCard;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}) {
    const aspect = 5 / 7;
    const pan = useRef({ x: 0, y: 0 });
    const rotation = useRef<Quaternion>([0, 0, 0, 1]);
    const model = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const dialog = useRef<HTMLDivElement>(null);
    const pointer = useRef<{
        id: number;
        action: "rotate" | "move";
        x: number;
        y: number;
    } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [dragMode, setDragMode] = useState<"rotate" | "move">("rotate");
    const [imageStatus, setImageStatus] = useState<Record<string, "loaded" | "error">>({});
    const [imageRetry, setImageRetry] = useState(0);
    const applyRotation = (next: Quaternion) => {
        rotation.current = next;
        if (model.current) {
            model.current.style.transform = `translate3d(${pan.current.x}px,${pan.current.y}px,0) ${rotationMatrix(next)}`;

        }
    };
    const moveCard = (dx: number, dy: number) => {
        pan.current = { x: pan.current.x + dx, y: pan.current.y + dy };
        applyRotation(rotation.current);
    };
    const resetView = () => {
        pan.current = { x: 0, y: 0 };
        setZoom(1);
        setDragMode("rotate");
        applyRotation([0, 0, 0, 1]);
    };
    const changeZoom = (next: number) => {
        const value = Math.max(1, Math.min(4, next));
        pan.current = { x: pan.current.x * value / zoom, y: pan.current.y * value / zoom };
        setZoom(value);
        if (value > 1) setDragMode("move");
        applyRotation(rotation.current);
    };
    const turn = (x: number, y: number, z: number, angle: number) => applyRotation(multiplyRotation(axisRotation(x, y, z, angle), rotation.current));
    const finishDrag = () => { pointer.current = null; setDragging(false); };
    useEffect(() => {
        const updateSize = () => {
            if (model.current && stage.current) {
                const height = Math.floor(getInspectorCardHeight(stage.current.clientWidth, stage.current.clientHeight, aspect) * zoom);
                model.current.style.height = `${height}px`;
                model.current.style.width = `${height * aspect}px`;
            }
        };
        const observer = new ResizeObserver(updateSize);
        if (stage.current) observer.observe(stage.current);
        updateSize();
        return () => observer.disconnect();
    }, [aspect, zoom]);
    useEffect(() => {
        resetView();
        finishDrag();
    }, [card.key]);
    useEffect(() => {
        const hiddenNavigation = new Set<HTMLElement>();
        const markNavigation = () => {
            const controls = document.querySelectorAll<HTMLElement>('svg.lucide-home, svg.lucide-house, [aria-label="Home"], [aria-label="Go home"], [title="Home"]');
            controls.forEach(control => {
                if (dialog.current?.contains(control)) return;
                let element: HTMLElement | null = control.closest<HTMLElement>("button, a") || control;
                while (element && element !== document.body) {
                    const bounds = element.getBoundingClientRect();
                    if (getComputedStyle(element).position === "fixed" && bounds.top > window.innerHeight / 2) {
                        element.setAttribute("data-promo-inspector-navigation", "");
                        hiddenNavigation.add(element);
                        break;
                    }
                    element = element.parentElement;
                }
            });
        };
        markNavigation();
        const observer = new MutationObserver(markNavigation);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener("resize", markNavigation);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", markNavigation);
            hiddenNavigation.forEach(element => element.removeAttribute("data-promo-inspector-navigation"));
        };
    }, []);
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("promo-inspector-open");
        stage.current?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
            if (event.key === "Tab") {
                const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]') || []);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && (document.activeElement === first || !dialog.current?.contains(document.activeElement))) {
                    event.preventDefault();
                    last?.focus();
                }
                else if (!event.shiftKey && (document.activeElement === last || !dialog.current?.contains(document.activeElement))) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => { document.body.classList.remove("promo-inspector-open"); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
    }, [onClose]);
    const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = pointer.current;
        if (!drag || drag.id !== event.pointerId)
            return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        if (drag.action === "move") { moveCard(dx, dy); return; }
        const distance = Math.hypot(dx, dy);
        if (!distance)
            return;
        const sensitivity = Math.PI / Math.max(180, Math.min(event.currentTarget.clientWidth, event.currentTarget.clientHeight));
        if (event.shiftKey)
            turn(0, 0, 1, dx * sensitivity);
        else
            turn(-dy, dx, 0, distance * sensitivity);
    };
    const handleKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (dragMode === "move" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            moveCard(event.key === "ArrowLeft" ? -24 : event.key === "ArrowRight" ? 24 : 0, event.key === "ArrowUp" ? -24 : event.key === "ArrowDown" ? 24 : 0);
            event.preventDefault();
            return;
        }
        const amount = Math.PI / 12;
        if (event.key === "ArrowLeft")
            event.shiftKey ? turn(0, 0, 1, -amount) : turn(0, 1, 0, -amount);
        else if (event.key === "ArrowRight")
            event.shiftKey ? turn(0, 0, 1, amount) : turn(0, 1, 0, amount);
        else if (event.key === "ArrowUp")
            turn(1, 0, 0, amount);
        else if (event.key === "ArrowDown")
            turn(1, 0, 0, -amount);
        else if (event.key.toLowerCase() === "r")
            { resetView(); }
        else
            return;
        event.preventDefault();
    };
    const imageFailed = imageStatus[card.front] === "error" || imageStatus[card.back] === "error";
    const imagesReady = imageStatus[card.front] === "loaded" && imageStatus[card.back] === "loaded";
    return createPortal(<div className="promo-inspector-overlay" onClick={event => { if (event.target === event.currentTarget)
        onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="promo-inspector-title" className="promo-inspector-dialog">
        <header className="promo-inspector-header">
          <div><p className="promo-eyebrow">3D card inspector</p><h2 id="promo-inspector-title">{card.code}</h2></div>
          <button type="button" className="promo-icon-button" onClick={onClose} aria-label="Close inspector"><X size={20}/></button>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`promo-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
            if (pointer.current || (event.pointerType === "mouse" && event.button !== 0))
                return;
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            pointer.current = { id: event.pointerId, action: dragMode, x: event.clientX, y: event.clientY };
            setDragging(true);
        }} onPointerMove={handleMove} onPointerUp={event => { if (pointer.current?.id === event.pointerId)
        finishDrag(); }} onPointerCancel={event => { if (pointer.current?.id === event.pointerId)
        finishDrag(); }} onLostPointerCapture={event => { if (pointer.current?.id === event.pointerId)
        finishDrag(); }}>
          <div className="promo-card-ground"/>
          <div ref={model} className="promo-card-model">
            <div className="promo-card-face promo-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="promo-face-image promo-front-image" style={getPromoFrontStyle(card.key)} onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="promo-card-sheen"/>
            </div>
            <div className="promo-card-face promo-card-back">
              <div className="promo-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="promo-face-image promo-back-image" style={{ transform: "scale(1.035)" }} onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="promo-card-sheen"/>
              </div>
            </div>
          </div>
        </div>
        <div role="status" className="promo-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="promo-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="promo-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
        <footer className="promo-inspector-footer">
          <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={18}/><span>Previous</span></button>
          <span>Fun Moments Three</span>
          <button type="button" onClick={onNext} aria-label="Next card"><span>Next</span><ChevronRight size={18}/></button>
        </footer>
      </div>
    </div>, document.body);
}
const promotionalStyles = `
.promo-page,.promo-inspector-dialog{--promo-bg:#f5f5f3;--promo-panel:#fff;--promo-subtle:#f0f0ec;--promo-ink:#202125;--promo-muted:#72747c;--promo-border:rgba(0,0,0,.09);--promo-accent:#ffd54a;--promo-green:#15803d;color:var(--promo-ink);font-family:Oxanium,system-ui,sans-serif;box-sizing:border-box}
.dark .promo-page,.dark .promo-inspector-dialog,[data-theme="dark"] .promo-page,[data-theme="dark"] .promo-inspector-dialog{--promo-bg:#101112;--promo-panel:#191b1d;--promo-subtle:#242629;--promo-ink:#f1f2f3;--promo-muted:#a0a3ab;--promo-border:rgba(255,255,255,.09);--promo-green:#86efac}
.promo-page *,.promo-inspector-dialog *{box-sizing:border-box}
.promo-page{min-height:calc(100dvh - var(--promo-page-top,0px));background:var(--promo-bg);padding-bottom:max(12px,env(safe-area-inset-bottom))}
.promo-page button,.promo-inspector-dialog button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.promo-page button:focus-visible,.promo-inspector-dialog button:focus-visible,.promo-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:4px}
.promo-main{width:100%;padding:16px 24px}
.promo-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--promo-panel);border:1px solid var(--promo-border);border-radius:22px}
.promo-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--promo-subtle)}
.promo-heading{flex:1;min-width:0}.promo-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--promo-muted)}
.promo-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.promo-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--promo-muted);line-height:1.5}
.promo-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.promo-total strong{font-size:26px;line-height:1}.promo-total strong span{font-size:16px;font-weight:500;color:var(--promo-muted)}.promo-total>span{font-size:11px;color:var(--promo-muted)}
.promo-progress-track{height:5px;border-radius:8px;background:var(--promo-subtle);overflow:hidden}.promo-progress-track>div{height:100%;background:var(--promo-accent);border-radius:8px;transition:width .25s}
.promo-mode,.promo-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--promo-subtle)}
.promo-mode button,.promo-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--promo-muted)}
.promo-mode .is-active{background:var(--promo-accent);color:#27230f}.promo-filters .is-active{background:var(--promo-panel);color:var(--promo-ink);box-shadow:0 1px 5px #00000008}
.promo-rarities{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px 0}
.promo-rarities button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--promo-border);background:var(--promo-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.promo-rarities strong{font-size:14px}.promo-rarities button>span{font-size:11px;color:var(--promo-muted)}.promo-rarities .is-complete{color:var(--promo-green)}.promo-rarities .is-active{background:var(--promo-accent);border-color:transparent;color:#27230f}.promo-rarities .is-active>span{color:#5b4b15}
.promo-catalog{background:var(--promo-panel);border:1px solid var(--promo-border);border-radius:22px;padding:20px}
.promo-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.promo-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.promo-catalog-header h2 span{font-size:11px;font-weight:500;color:var(--promo-muted);border:1px solid var(--promo-border);border-radius:8px;padding:4px 8px;margin-left:10px;vertical-align:middle}.promo-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--promo-muted)}
.promo-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.promo-grid-card{min-width:0}.promo-card-button{display:block;position:relative;width:100%;aspect-ratio:5/7;border-radius:8px!important;background:var(--promo-subtle);perspective:900px;transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.promo-grid-model{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .4s}.promo-grid-face{position:absolute;inset:0;overflow:hidden;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.1px)}.promo-grid-back{transform:rotateY(180deg) translateZ(.1px)}
.promo-grid-image{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;object-position:center;transform:scale(1);user-select:none}.promo-grid-back-image{height:100%;top:0;transform:scale(1.035)}
.promo-owned-badge,.promo-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.promo-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.promo-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--promo-muted);white-space:nowrap}.promo-owned-dot,.promo-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.promo-missing-dot{background:var(--promo-muted);opacity:.4}
.promo-empty{text-align:center;padding:45px 20px;color:var(--promo-muted);border:1px dashed var(--promo-border);border-radius:16px}.promo-empty>svg{margin:0 auto 10px}.promo-empty h3{font-size:16px;color:var(--promo-ink);margin:0 0 8px}.promo-empty p{font-size:13px;margin:0}.promo-empty button{margin-top:18px;padding:12px 18px;background:var(--promo-accent);color:#27230f;border-radius:12px;font-size:12px;font-weight:600}
.promo-inspector-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;--promo-inspector-top:100px;padding:calc(var(--promo-inspector-top) + env(safe-area-inset-top)) 16px max(12px,env(safe-area-inset-bottom));background:#05070bbd;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overscroll-behavior:contain}
.promo-inspector-dialog{width:min(100%,780px);height:min(700px,calc(100dvh - var(--promo-inspector-top) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));max-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;overflow:hidden;overscroll-behavior:contain;background:var(--promo-panel);border:1px solid var(--promo-border);border-radius:22px;box-shadow:0 24px 100px #00000060;scrollbar-width:thin}
.promo-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.promo-inspector-header h2{font-size:clamp(14px,3vw,20px);margin:0;letter-spacing:-.02em}
.promo-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.promo-inspector-stage.is-dragging{cursor:grabbing}
.promo-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.promo-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}
.promo-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.promo-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(.5px)}.promo-card-back{transform:rotateY(180deg) translateZ(.5px)}
.promo-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.promo-front-image,.promo-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1);transform-origin:50% 50%;border-radius:inherit}.promo-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.promo-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.promo-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--promo-muted);text-align:center}.promo-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--promo-subtle);font-size:11px}
.promo-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.promo-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--promo-subtle);font-size:12px;font-weight:600}
.promo-inspector-controls button[aria-pressed="true"]{background:var(--promo-accent);color:#27230f}
.promo-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--promo-muted)}.promo-inspector-zoom input{width:min(220px,50%);accent-color:var(--promo-accent);cursor:pointer;touch-action:pan-x}.promo-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.promo-inspector-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--promo-border);padding:6px 16px}.promo-inspector-footer>span{font-size:11px;color:var(--promo-muted)}.promo-inspector-footer button{display:flex;align-items:center;gap:4px;min-height:40px;border-radius:11px;background:var(--promo-subtle);padding:8px 10px;font-size:11px}


@media(max-width:639px){body.promo-inspector-open [data-promo-inspector-navigation]{display:none!important}}
@media(max-width:600px){.promo-card-button{perspective:none;background:transparent;overflow:hidden;-webkit-mask-image:linear-gradient(#fff,#fff)}.promo-grid-model{transform:none!important;transform-style:flat;transition:none}.promo-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;-webkit-mask-image:linear-gradient(#fff,#fff)}.promo-grid-back{display:none;transform:none}.promo-grid-model[data-show-back="true"]>.promo-grid-face:first-child{display:none}.promo-grid-model[data-show-back="true"]>.promo-grid-back{display:block}.promo-grid-back-image{left:0;width:100%}}
@media(hover:hover){.promo-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.promo-rarities button:hover{transform:translateY(-1px)}.promo-icon-button:hover,.promo-inspector-controls button:hover{filter:brightness(.95)}}
@media(min-width:1800px){.promo-card-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
@media(max-width:1000px){.promo-header{flex-wrap:wrap;gap:14px}.promo-heading{flex-basis:calc(100% - 60px)}.promo-total{max-width:none;min-width:120px}.promo-mode{flex-shrink:0}.promo-rarities{grid-template-columns:repeat(2,minmax(0,1fr))}.promo-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:600px){.promo-main{padding:10px 10px 0}.promo-header{padding:14px;border-radius:18px;gap:12px}.promo-heading h1{font-size:25px}.promo-heading>p:last-child{font-size:11px}.promo-total{flex-basis:100%;gap:6px}.promo-total strong{font-size:23px}.promo-mode{width:100%}.promo-mode button{flex:1}.promo-rarities{gap:6px;padding:10px 0}.promo-rarities button{padding:8px 6px;gap:7px;min-height:44px}.promo-rarities strong{font-size:12px}.promo-rarities button>span{font-size:10px}.promo-catalog{padding:12px;border-radius:18px}.promo-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.promo-catalog-header h2{font-size:17px}.promo-filters{width:100%}.promo-filters button{flex:1;min-height:36px;font-size:11px}.promo-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}.promo-card-caption{font-size:8px;letter-spacing:-.04em}.promo-card-caption>span:first-child{overflow-wrap:anywhere;white-space:normal}.promo-owned-badge{top:5px;right:5px;padding:4px}.promo-inspect-badge{right:5px;bottom:5px;font-size:9px}.promo-inspector-overlay{--promo-inspector-top:94px;align-items:flex-start;padding-left:10px;padding-right:10px}.promo-inspector-dialog{border-radius:19px}.promo-inspector-header{padding:14px}.promo-inspector-controls{padding:6px 12px 12px;gap:6px}.promo-inspector-controls button{padding:10px 12px}.promo-inspector-status{font-size:11px}}
@media(max-height:600px){.promo-inspector-overlay{--promo-inspector-top:66px}.promo-inspector-header{padding:7px 12px}.promo-inspector-header .promo-eyebrow{display:none}.promo-inspector-header h2{font-size:14px}.promo-inspector-header .promo-icon-button{height:34px;width:34px}.promo-inspector-status{min-height:23px;font-size:10px;padding:2px 10px}.promo-inspector-controls{padding:3px 12px 6px}.promo-inspector-controls button{min-height:36px;min-width:36px;padding:7px 12px}.promo-inspector-footer{padding:3px 12px}.promo-inspector-footer button{min-height:34px;padding:5px 9px}}
@media(max-width:359px){.promo-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.promo-card-caption{font-size:9px}}
.promo-promo-source{margin:8px 0 0;text-align:center;min-height:2.5rem;font-size:12px;line-height:1.4;color:var(--promo-muted);overflow-wrap:anywhere}.promo-hidden-overlay{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;padding:20px;background:#ffffff70;border-radius:inherit;backdrop-filter:blur(4px)}.dark .promo-hidden-overlay{background:#10111290}.promo-hidden-overlay>div{padding:18px;background:var(--promo-panel);border:1px solid var(--promo-border);border-radius:16px;text-align:center}.promo-hidden-overlay p{font-size:12px;color:var(--promo-muted);margin:6px 0 0}
@media(prefers-reduced-motion:reduce){.promo-page *{transition:none!important}.promo-card-button:hover,.promo-rarities button:hover{transform:none}}
`;
const PromotionalCards = () => {
    const navigate = useNavigate();
    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
    const [loaded, setLoaded] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const update = () => {
            if (pageRef.current)
                pageRef.current.style.setProperty("--promo-page-top", `${pageRef.current.getBoundingClientRect().top + window.scrollY}px`);
        };
        update();
        const observer = new ResizeObserver(update);
        if (pageRef.current?.parentElement)
            observer.observe(pageRef.current.parentElement);
        window.addEventListener("resize", update);
        window.visualViewport?.addEventListener("resize", update);
        return () => { observer.disconnect(); window.removeEventListener("resize", update); window.visualViewport?.removeEventListener("resize", update); };
    }, [loaded]);
    const [loadingFailed, setLoadingFailed] = useState(false);
    const [lastSavedProgress, setLastSavedProgress] = useState("");
    const [viewMode, setViewMode] = useState(false);
    const [hiddenSets, setHiddenSets] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<"CCG" | "TCG">("CCG");
    const [inspectKey, setInspectKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "owned" | "missing">("all");
    const collected = promoCards.filter(card => flipped[card.key]).length;
    const total = promoCards.length;
    const progress = Math.round(collected / total * 100);
    const categoryCards = promoCards.filter(card => card.category === selectedCategory);
    const categoryCollected = categoryCards.filter(card => flipped[card.key]).length;
    const visibleCards = categoryCards.filter(card => filter === "all" || (filter === "owned" ? flipped[card.key] : !flipped[card.key]));
    const categoryHidden = hiddenSets.includes(selectedCategory === "CCG" ? "9" : "tcgpromos");
    const closeInspector = useCallback(() => setInspectKey(null), []);
    const getInspection = (key: string): InspectCard => {
        const card = promoCards.find(card => card.key === key)!;
        return { key: card.key, code: card.source || "Promotional card", front: card.front, back: card.back };
    };
    const stepInspection = (direction: number) => {
        const keys = visibleCards.map(card => card.key);
        if (!keys.length) return;
        const current = keys.indexOf(inspectKey || "");
        setInspectKey(keys[(current + direction + keys.length) % keys.length]);
    };
    const toggleCard = (key: string) => {
        if (categoryHidden) return;
        if (viewMode) { setInspectKey(key); return; }
        setFlipped(previous => ({ ...previous, [key]: !previous[key] }));
    };
  useEffect(() => {
const loadProgress = async () => {
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
      if (!user) {
        setLoaded(true);
        return;
      }
const { data: profile } = await supabase
        .from("profiles")
        .select("iso_hidden_sets")
        .eq("id", user.id)
        .maybeSingle();
const hidden = (profile?.iso_hidden_sets || []).map((id: string) => {
        switch (id) {
          case "TCG_PROMOS":
            return "tcgpromos";
          default:
            return id;
        }
      });
      setHiddenSets(hidden);
const [{ data: ccg }, { data: tcg }] = await Promise.all([
        supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "9")
          .maybeSingle(),
        supabase
          .from("collection_progress_raw")
          .select("progress")
          .eq("user_id", user.id)
          .eq("set_id", "tcgpromos")
          .maybeSingle(),
      ]);
const merged = {
        ...(ccg?.progress || {}),
        ...(tcg?.progress || {}),
      };
      setFlipped(merged);
      setLastSavedProgress(JSON.stringify(merged));
      setLoaded(true);
    };
    void loadProgress().catch(() => setLoadingFailed(true));
  }, []);
  useEffect(() => {
    if (!loaded) return;
const current = JSON.stringify(flipped);
    if (current === lastSavedProgress) return;
const saveProgress = async () => {
const { data } = await supabase.auth.getSession();
const user = data.session?.user;
      if (!user) return;
const ccgProgress: Record<string, boolean> = {};
const tcgProgress: Record<string, boolean> = {};
      Object.entries(flipped).forEach(([key, value]) => {
        if (key.startsWith("PR-")) {
          ccgProgress[key] = value;
        } else if (key.startsWith("RR")) {
          tcgProgress[key] = value;
        }
      });
const saveErrors = await Promise.all([
        saveCollectionProgress("9", ccgProgress),
        saveCollectionProgress("tcgpromos", tcgProgress),
      ]);
const saveError = saveErrors.find(Boolean);
      if (saveError) {
        console.error("Unable to save promotional progress:", saveError);
        return;
      }
      setLastSavedProgress(JSON.stringify(flipped));
    };
const saveTimer = window.setTimeout(saveProgress, 400);
    return () => window.clearTimeout(saveTimer);
  }, [flipped, loaded, lastSavedProgress]);
    if (!loaded) return <CollectionLoading failed={loadingFailed}/>;
    return <div ref={pageRef} className="promo-page">
      <style>{promotionalStyles}</style>
      <main className="promo-main">
        <header className="promo-header">
          <button type="button" className="promo-icon-button" onClick={() => navigate("/collections")} aria-label="Back to collections"><ArrowLeft size={20}/></button>
          <div className="promo-heading"><p className="promo-eyebrow">Promotional Cards</p><h1>Promotional Cards</h1><p>{viewMode ? "Choose a card to explore its front and back in 3D." : "Tap a card to mark it owned or missing."}</p></div>
          <div className="promo-total"><strong>{collected}<span> / {total}</span></strong><span>{total - collected} still to collect</span><div className="promo-progress-track" role="progressbar" aria-label="Promotional collection completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }}/></div></div>
          <div className="promo-mode" role="group" aria-label="Card interaction mode">
            <button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button>
            <button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><Box size={16}/>Inspect in 3D</button>
          </div>
        </header>
        <nav className="promo-rarities" aria-label="Promo category">
          {(["CCG", "TCG"] as const).map(category => {
            const cards = promoCards.filter(card => card.category === category);
            const count = cards.filter(card => flipped[card.key]).length;
            return <button type="button" key={category} aria-pressed={selectedCategory === category} className={`${selectedCategory === category ? "is-active" : ""} ${count === cards.length ? "is-complete" : ""}`} onClick={() => setSelectedCategory(category)}><strong>{category}</strong><span>{count}/{cards.length}</span>{count === cards.length && <Check size={13}/>}</button>;
          })}
        </nav>
        <section className="promo-catalog" aria-label={`${selectedCategory} promos`} style={{ position: "relative" }}>
          {categoryHidden && <div className="promo-hidden-overlay"><div><strong>{selectedCategory} Promos are hidden</strong><p>This set is hidden in your ISO settings.</p></div></div>}
          <div style={categoryHidden ? { filter: "blur(4px)", pointerEvents: "none", userSelect: "none" } : undefined}>
          <div className="promo-catalog-header"><div><h2>{selectedCategory} Promos</h2><p>{categoryCollected} of {categoryCards.length} collected</p></div><div className="promo-filters" role="group" aria-label="Filter cards">{(["all", "missing", "owned"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} disabled={categoryHidden} onClick={() => setFilter(value)}>{value === "all" ? "All cards" : value === "owned" ? "Owned" : "Missing"}</button>)}</div></div>
          {visibleCards.length === 0 ? <div className="promo-empty"><Check size={24}/><h3>{filter === "missing" ? "This category is complete" : "No owned cards here yet"}</h3><p>{filter === "missing" ? "Every card in this category is in your collection." : "Switch to All cards to start tracking your collection."}</p><button type="button" disabled={categoryHidden} onClick={() => setFilter("all")}>Show all cards</button></div> : <div className="promo-card-grid">{visibleCards.map(card => {
            const owned = !!flipped[card.key];
            return <article key={card.key} className={`promo-grid-card ${owned ? "is-owned" : ""}`}>
              <button type="button" className="promo-card-button" disabled={categoryHidden} onClick={() => toggleCard(card.key)} aria-label={viewMode ? `Inspect ${card.source || "Promotional card"} in 3D` : `${card.source || "Promotional card"}, ${owned ? "owned. Mark missing" : "missing. Mark owned"}`} aria-pressed={viewMode ? undefined : owned}>
                <div className="promo-grid-model" data-show-back={!viewMode && owned} style={{ transform: !viewMode && owned ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className="promo-grid-face"><CardImage imageSize={card.original ? "original" : "grid"} visible={loaded && (viewMode || !owned)} src={card.front} className="promo-grid-image" style={getPromoFrontStyle(card.key)} draggable={false} alt={card.source || "Promotional card"}/></div>
                  <div className="promo-grid-face promo-grid-back"><CardImage visible={loaded && !viewMode && owned} src={card.back} className="promo-grid-image promo-grid-back-image" style={{ transform: "scale(1.035)" }} draggable={false} alt={`${card.source || "Promotional card"} back`}/></div>
                </div>
                {owned && <span className="promo-owned-badge"><Check size={13}/><span className="sr-only">Owned</span></span>}
                {viewMode && <span className="promo-inspect-badge"><Box size={13}/>3D</span>}
              </button>
              <p className="promo-promo-source">{card.source || "Source not added yet"}</p>
            </article>;
          })}</div>}
          </div>
        </section>
      </main>
      {inspectKey && <CardInspector card={getInspection(inspectKey)} onClose={closeInspector} onPrevious={() => stepInspection(-1)} onNext={() => stepInspection(1)}/>}
    </div>;
};
export default PromotionalCards;
