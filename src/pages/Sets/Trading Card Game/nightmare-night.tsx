import { tcgCatalog } from "@/lib/iso-card-catalog";
import { getNightmareNightBack as getCardBack, getNightmareNightFront as getCardFront } from "@/lib/card-images";
import CollectionLoading from "@/components/CollectionLoading";
import CardImage from "@/components/CardImage";
import { useState, useEffect, useRef, useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
import { ArrowLeft, Check, X, RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
const nightmareCatalogSet = tcgCatalog.sets.find(set => set.id === "14");
const nightmareCatalogCards = nightmareCatalogSet ? tcgCatalog.getCards(nightmareCatalogSet, {}) : [];
const getDisplayCardCode = (key: string) => {
    const card = nightmareCatalogCards.find(card => card.key === key);
    return card ? tcgCatalog.getDisplayCardCode("14", card) : key;
};
const rarityLabel = (rarity: string) => tcgCatalog.getDisplayRarity(rarity);
const isLandscapeCommon = (key: string) => {
const match = key.match(/^BP03-C(\d{2})$/);
const number = match ? Number(match[1]) : 0;
        return number >= 25 && number <= 48;
    };
const getFrontStyle = (key: string, inspect = false): CSSProperties => isLandscapeCommon(key) ? {
    inset: "auto", left: "50%", top: "50%", width: "140%", height: inspect ? "100%" : "71.4286%", maxWidth: "none", objectFit: inspect ? "contain" : "cover", transform: "translate(-50%, -50%) rotate(-90deg)"
} : { objectFit: inspect ? "scale-down" : "cover", transform: "none" };
const getBackStyle = (key: string, inspect = false): CSSProperties => isLandscapeCommon(key) ? {
    inset: "auto", left: "50%", top: "50%", width: "140%", height: "71.4285714286%", maxWidth: "none", objectFit: "cover", transform: `translate(-50%, -50%) rotate(-90deg)${inspect ? "" : " scale(1.035)"}`
} : { objectFit: inspect && /^BP03-RR0[1-6]$/.test(key) ? "scale-down" : "cover", transform: inspect && /^BP03-RR0[1-6]$/.test(key) ? "none" : `scale(${inspect ? 1.05 : 1.035})` };
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
                        element.setAttribute("data-nn-inspector-navigation", "");
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
            hiddenNavigation.forEach(element => element.removeAttribute("data-nn-inspector-navigation"));
        };
    }, []);
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("nn-inspector-open");
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
        return () => { document.body.classList.remove("nn-inspector-open"); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
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
    return createPortal(<div className="nn-inspector-overlay" onClick={event => { if (event.target === event.currentTarget)
        onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="nn-inspector-title" className="nn-inspector-dialog">
        <header className="nn-inspector-header">
          <div><p className="nn-eyebrow">3D card inspector</p><h2 id="nn-inspector-title">{card.code}</h2></div>
          <button type="button" className="nn-icon-button" onClick={onClose} aria-label="Close inspector"><X size={20}/></button>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`nn-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
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
          <div className="nn-card-ground"/>
          <div ref={model} className="nn-card-model">
            <div className="nn-card-face nn-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="nn-face-image nn-front-image" style={getFrontStyle(card.key, true)} onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="nn-card-sheen"/>
            </div>
            <div className="nn-card-face nn-card-back">
              <div className="nn-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="nn-face-image nn-back-image" style={getBackStyle(card.key, true)} onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="nn-card-sheen"/>
              </div>
            </div>
          </div>
        </div>
        <div role="status" className="nn-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="nn-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="nn-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
        <footer className="nn-inspector-footer">
          <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={18}/><span>Previous</span></button>
          <span>Discord</span>
          <button type="button" onClick={onNext} aria-label="Next card"><span>Next</span><ChevronRight size={18}/></button>
        </footer>
      </div>
    </div>, document.body);
}
const nightmareNightStyles = `
.nn-page,.nn-inspector-dialog{--nn-bg:#f5f5f3;--nn-panel:#fff;--nn-subtle:#f0f0ec;--nn-ink:#202125;--nn-muted:#72747c;--nn-border:rgba(0,0,0,.09);--nn-accent:#ffd54a;--nn-green:#15803d;color:var(--nn-ink);font-family:Oxanium,system-ui,sans-serif;box-sizing:border-box}
.dark .nn-page,.dark .nn-inspector-dialog,[data-theme="dark"] .nn-page,[data-theme="dark"] .nn-inspector-dialog{--nn-bg:#101112;--nn-panel:#191b1d;--nn-subtle:#242629;--nn-ink:#f1f2f3;--nn-muted:#a0a3ab;--nn-border:rgba(255,255,255,.09);--nn-green:#86efac}
.nn-page *,.nn-inspector-dialog *{box-sizing:border-box}
.nn-page{min-height:calc(100dvh - var(--nn-page-top,0px));background:var(--nn-bg);padding-bottom:max(12px,env(safe-area-inset-bottom))}
.nn-page button,.nn-inspector-dialog button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.nn-page button:focus-visible,.nn-inspector-dialog button:focus-visible,.nn-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:4px}
.nn-main{width:100%;padding:16px 24px}
.nn-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--nn-panel);border:1px solid var(--nn-border);border-radius:22px}
.nn-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--nn-subtle)}
.nn-heading{flex:1;min-width:0}.nn-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--nn-muted)}
.nn-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.nn-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--nn-muted);line-height:1.5}
.nn-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.nn-total strong{font-size:26px;line-height:1}.nn-total strong span{font-size:16px;font-weight:500;color:var(--nn-muted)}.nn-total>span{font-size:11px;color:var(--nn-muted)}
.nn-progress-track{height:5px;border-radius:8px;background:var(--nn-subtle);overflow:hidden}.nn-progress-track>div{height:100%;background:var(--nn-accent);border-radius:8px;transition:width .25s}
.nn-mode,.nn-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--nn-subtle)}
.nn-mode button,.nn-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--nn-muted)}
.nn-mode .is-active{background:var(--nn-accent);color:#27230f}.nn-filters .is-active{background:var(--nn-panel);color:var(--nn-ink);box-shadow:0 1px 5px #00000008}
.nn-rarities{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:8px;padding:14px 0}
.nn-rarities button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--nn-border);background:var(--nn-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.nn-rarities strong{font-size:14px}.nn-rarities button>span{font-size:11px;color:var(--nn-muted)}.nn-rarities .is-complete{color:var(--nn-green)}.nn-rarities .is-active{background:var(--nn-accent);border-color:transparent;color:#27230f}.nn-rarities .is-active>span{color:#5b4b15}
.nn-catalog{background:var(--nn-panel);border:1px solid var(--nn-border);border-radius:22px;padding:20px}
.nn-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.nn-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.nn-catalog-header h2 span{font-size:11px;font-weight:500;color:var(--nn-muted);border:1px solid var(--nn-border);border-radius:8px;padding:4px 8px;margin-left:10px;vertical-align:middle}.nn-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--nn-muted)}
.nn-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.nn-grid-card{min-width:0}.nn-card-button{display:block;position:relative;width:100%;aspect-ratio:5/7;border-radius:8px!important;background:var(--nn-subtle);perspective:900px;transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.nn-grid-model{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .4s}.nn-grid-face{position:absolute;inset:0;overflow:hidden;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.1px)}.nn-grid-back{transform:rotateY(180deg) translateZ(.1px)}
.nn-grid-image{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;object-position:center;transform:scale(1);user-select:none}.nn-grid-back-image{height:100%;top:0;transform:scale(1)}
.nn-owned-badge,.nn-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.nn-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.nn-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--nn-muted);white-space:nowrap}.nn-owned-dot,.nn-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.nn-missing-dot{background:var(--nn-muted);opacity:.4}
.nn-empty{text-align:center;padding:45px 20px;color:var(--nn-muted);border:1px dashed var(--nn-border);border-radius:16px}.nn-empty>svg{margin:0 auto 10px}.nn-empty h3{font-size:16px;color:var(--nn-ink);margin:0 0 8px}.nn-empty p{font-size:13px;margin:0}.nn-empty button{margin-top:18px;padding:12px 18px;background:var(--nn-accent);color:#27230f;border-radius:12px;font-size:12px;font-weight:600}
.nn-inspector-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;--nn-inspector-top:100px;padding:calc(var(--nn-inspector-top) + env(safe-area-inset-top)) 16px max(12px,env(safe-area-inset-bottom));background:#05070bbd;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overscroll-behavior:contain}
.nn-inspector-dialog{width:min(100%,780px);height:min(700px,calc(100dvh - var(--nn-inspector-top) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));max-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;overflow:hidden;overscroll-behavior:contain;background:var(--nn-panel);border:1px solid var(--nn-border);border-radius:22px;box-shadow:0 24px 100px #00000060;scrollbar-width:thin}
.nn-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.nn-inspector-header h2{font-size:clamp(14px,3vw,20px);margin:0;letter-spacing:-.02em}
.nn-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.nn-inspector-stage.is-dragging{cursor:grabbing}
.nn-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.nn-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}
.nn-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.nn-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(.5px)}.nn-card-back{transform:rotateY(180deg) translateZ(.5px)}
.nn-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.nn-front-image,.nn-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1);transform-origin:50% 50%;border-radius:inherit}.nn-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.nn-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.nn-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--nn-muted);text-align:center}.nn-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--nn-subtle);font-size:11px}
.nn-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.nn-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--nn-subtle);font-size:12px;font-weight:600}
.nn-inspector-controls button[aria-pressed="true"]{background:var(--nn-accent);color:#27230f}
.nn-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--nn-muted)}.nn-inspector-zoom input{width:min(220px,50%);accent-color:var(--nn-accent);cursor:pointer;touch-action:pan-x}.nn-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.nn-inspector-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--nn-border);padding:6px 16px}.nn-inspector-footer>span{font-size:11px;color:var(--nn-muted)}.nn-inspector-footer button{display:flex;align-items:center;gap:4px;min-height:40px;border-radius:11px;background:var(--nn-subtle);padding:8px 10px;font-size:11px}


@media(max-width:639px){body.nn-inspector-open [data-nn-inspector-navigation]{display:none!important}}
@media(max-width:600px){.nn-card-button{perspective:none;background:transparent;overflow:hidden;-webkit-mask-image:linear-gradient(#fff,#fff)}.nn-grid-model{transform:none!important;transform-style:flat;transition:none}.nn-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;-webkit-mask-image:linear-gradient(#fff,#fff)}.nn-grid-back{display:none;transform:none}.nn-grid-model[data-show-back="true"]>.nn-grid-face:first-child{display:none}.nn-grid-model[data-show-back="true"]>.nn-grid-back{display:block}.nn-grid-back-image{left:0;width:100%}}
@media(hover:hover){.nn-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.nn-rarities button:hover{transform:translateY(-1px)}.nn-icon-button:hover,.nn-inspector-controls button:hover{filter:brightness(.95)}}
@media(min-width:1800px){.nn-card-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
@media(max-width:1000px){.nn-header{flex-wrap:wrap;gap:14px}.nn-heading{flex-basis:calc(100% - 60px)}.nn-total{max-width:none;min-width:120px}.nn-mode{flex-shrink:0}.nn-rarities{grid-template-columns:repeat(4,minmax(0,1fr))}.nn-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:600px){.nn-main{padding:10px 10px 0}.nn-header{padding:14px;border-radius:18px;gap:12px}.nn-heading h1{font-size:25px}.nn-heading>p:last-child{font-size:11px}.nn-total{flex-basis:100%;gap:6px}.nn-total strong{font-size:23px}.nn-mode{width:100%}.nn-mode button{flex:1}.nn-rarities{gap:6px;padding:10px 0}.nn-rarities button{padding:8px 6px;gap:7px;min-height:44px}.nn-rarities strong{font-size:12px}.nn-rarities button>span{font-size:10px}.nn-catalog{padding:12px;border-radius:18px}.nn-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.nn-catalog-header h2{font-size:17px}.nn-filters{width:100%}.nn-filters button{flex:1;min-height:36px;font-size:11px}.nn-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}.nn-card-caption{font-size:8px;letter-spacing:-.04em}.nn-card-caption>span:first-child{overflow-wrap:anywhere;white-space:normal}.nn-owned-badge{top:5px;right:5px;padding:4px}.nn-inspect-badge{right:5px;bottom:5px;font-size:9px}.nn-inspector-overlay{--nn-inspector-top:94px;align-items:flex-start;padding-left:10px;padding-right:10px}.nn-inspector-dialog{border-radius:19px}.nn-inspector-header{padding:14px}.nn-inspector-controls{padding:6px 12px 12px;gap:6px}.nn-inspector-controls button{padding:10px 12px}.nn-inspector-status{font-size:11px}}
@media(max-height:600px){.nn-inspector-overlay{--nn-inspector-top:66px}.nn-inspector-header{padding:7px 12px}.nn-inspector-header .nn-eyebrow{display:none}.nn-inspector-header h2{font-size:14px}.nn-inspector-header .nn-icon-button{height:34px;width:34px}.nn-inspector-status{min-height:23px;font-size:10px;padding:2px 10px}.nn-inspector-controls{padding:3px 12px 6px}.nn-inspector-controls button{min-height:36px;min-width:36px;padding:7px 12px}.nn-inspector-footer{padding:3px 12px}.nn-inspector-footer button{min-height:34px;padding:5px 9px}}
@media(max-width:359px){.nn-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nn-card-caption{font-size:9px}}
@media(prefers-reduced-motion:reduce){.nn-page *{transition:none!important}.nn-card-button:hover,.nn-rarities button:hover{transform:none}}
`;
const NightmareNight = () => {
    const navigate = useNavigate();
    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
    const [loaded, setLoaded] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const update = () => {
            if (pageRef.current)
                pageRef.current.style.setProperty("--nn-page-top", `${pageRef.current.getBoundingClientRect().top + window.scrollY}px`);
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
    const [selectedRarity, setSelectedRarity] = useState("C");
    const [inspectKey, setInspectKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "owned" | "missing">("all");
const set = {
        folder: "nightmare-night",
        setId: "14",
        rarities: {
            C: 48,
            U: 18,
            ER: 6,
            SR: 14,
            SPR: 28,
            GR: 12,
            CR: 12,
            RR: 6,
            PER: 12,
            PGR: 5,
            PSPR: 11,
            PCR: 12,
            PRR: 6,
        },
    };
const rarityNames: Record<string, string> = {
        C: "COMMON",
        U: "UNCOMMON",
        ER: "EMERALD RARE",
        SR: "SILVER RARE",
        SPR: "SAPPHIRE RARE",
        GR: "GOLD RARE",
        CR: "COLORFUL RARE",
        RR: "RUBY RARE",
        PER: "SHINING EMERALD RARE",
        PSPR: "SHINING SAPPHIRE RARE",
        PGR: "SHINING GOLD RARE",
        PCR: "SHINING COLORFUL RARE",
        PRR: "SHINING RUBY RARE",
    };
const cards = Object.entries(set.rarities).flatMap(([rarity]) => {
        if (rarity === "ER") {
            return ["01", "02"].flatMap((number) => ["A", "B", "C"].map((variant) => ({
                rarity,
                key: `BP03-ER${number}-${variant}`,
            })));
        }
        if (rarity === "PER") {
            return ["01", "02"].flatMap((number) => ["A", "A2", "B", "B2", "C", "C2"].map((variant) => ({
                rarity,
                key: `PBP03-ER${number}-${variant}`,
            })));
        }
        if (rarity === "PGR") {
            return ["07", "08", "09", "11", "12"].map((number) => ({
                rarity,
                key: `PBP03-GR${number}`,
            }));
        }
        if (rarity === "PSPR") {
            return [
                "03",
                "04",
                "06",
                "08",
                "11",
                "16",
                "17",
                "19",
                "20",
                "23",
                "25",
            ].map((number) => ({ rarity, key: `PBP03-SPR${number}` }));
        }
        if (rarity === "PCR") {
            return Array.from({ length: 12 }, (_, i) => ({
                rarity,
                key: `PBP03-CR${String(i + 1).padStart(2, "0")}`,
            }));
        }
        if (rarity === "PRR") {
            return Array.from({ length: 6 }, (_, i) => ({
                rarity,
                key: `PBP03-RR${String(i + 1).padStart(2, "0")}`,
            }));
        }
const count = set.rarities[rarity as keyof typeof set.rarities];
        return Array.from({ length: count }, (_, i) => ({
            rarity,
            key: `BP03-${rarity}${String(i + 1).padStart(2, "0")}`,
        }));
    });
    const collected = cards.filter(card => flipped[card.key]).length;
    const total = cards.length;
    const progress = Math.round(collected / total * 100);
    const rarityCards = cards.filter(card => card.rarity === selectedRarity);
    const rarityCollected = rarityCards.filter(card => flipped[card.key]).length;
    const visibleCards = rarityCards.filter(card => filter === "all" || (filter === "owned" ? flipped[card.key] : !flipped[card.key]));
    const closeInspector = useCallback(() => setInspectKey(null), []);
    const getInspection = (key: string): InspectCard => {
        return { key, code: getDisplayCardCode(key), front: getCardFront(key), back: getCardBack(key) };
    };
    const stepInspection = (direction: number) => {
        const keys = visibleCards.map(card => card.key);
        if (!keys.length)
            return;
        const current = keys.indexOf(inspectKey || "");
        setInspectKey(keys[(current + direction + keys.length) % keys.length]);
    };
    const toggleCard = (key: string) => {
        if (viewMode) {
            setInspectKey(key);
            return;
        }
        setFlipped(previous => ({ ...previous, [key]: !previous[key] }));
    };
    useEffect(() => {
        let active = true;
        const loadProgress = async () => {
            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError)
                throw sessionError;
            const user = data.session?.user;
            if (!active)
                return;
            if (!user) {
                setLoaded(true);
                return;
            }
            const { data: saved, error: loadError } = await supabase
                .from("collection_progress_raw")
                .select("progress")
                .eq("user_id", user.id)
                .eq("set_id", set.setId)
                .single();
            if (!active)
                return;
            if (loadError && loadError.code !== "PGRST116")
                throw loadError;
            if (saved?.progress) {
                setFlipped(saved.progress);
                setLastSavedProgress(JSON.stringify(saved.progress));
            }
            setLoaded(true);
        };
        void loadProgress().catch(() => { if (active)
            setLoadingFailed(true); });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!loaded)
            return;
        const current = JSON.stringify(flipped);
        if (current === lastSavedProgress)
            return;
        const saveProgress = async () => {
            const { data } = await supabase.auth.getSession();
            const user = data.session?.user;
            if (!user)
                return;
            const saveError = await saveCollectionProgress(set.setId, flipped);
            if (saveError) {
                console.error("Unable to save collection progress:", saveError);
                return;
            }
            setLastSavedProgress(current);
        };
        const saveTimer = window.setTimeout(saveProgress, 400);
        return () => window.clearTimeout(saveTimer);
    }, [flipped, loaded, lastSavedProgress]);
    if (!loaded)
        return <CollectionLoading failed={loadingFailed}/>;
    return (<div ref={pageRef} className="nn-page">
      <style>{nightmareNightStyles}</style>
      <main className="nn-main">
        <header className="nn-header">
          <button type="button" className="nn-icon-button" onClick={() => navigate("/collections")} aria-label="Back to collections"><ArrowLeft size={20}/></button>
          <div className="nn-heading"><p className="nn-eyebrow">My Little Pony TCG</p><h1>Nightmare Night</h1><p>{viewMode ? "Choose a card to explore its front and back in 3D." : "Tap a card to mark it owned or missing."}</p></div>
          <div className="nn-total"><strong>{collected}<span> / {total}</span></strong><span>{total - collected} still to collect</span><div className="nn-progress-track" role="progressbar" aria-label="Nightmare Night collection completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }}/></div></div>
          <div className="nn-mode" role="group" aria-label="Card interaction mode">
            <button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button>
            <button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><Box size={16}/>Inspect in 3D</button>
          </div>
        </header>
        <nav className="nn-rarities" aria-label="Card rarity">
          {Object.entries(set.rarities).map(([rarity, count]) => {
            const owned = cards.filter(card => card.rarity === rarity && flipped[card.key]).length;
            return <button type="button" key={rarity} aria-pressed={selectedRarity === rarity} className={`${selectedRarity === rarity ? "is-active" : ""} ${owned === count ? "is-complete" : ""}`} onClick={() => setSelectedRarity(rarity)}><strong>{rarityLabel(rarity)}</strong><span>{owned}/{count}</span>{owned === count && <Check size={13}/>}</button>;
        })}
        </nav>
        <section className="nn-catalog" aria-label={`${selectedRarity} cards`}>
          <div className="nn-catalog-header"><div><h2>{rarityNames[selectedRarity]}<span>{rarityLabel(selectedRarity)}</span></h2><p>{rarityCollected} of {rarityCards.length} collected</p></div><div className="nn-filters" role="group" aria-label="Filter cards">{(["all", "missing", "owned"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All cards" : value === "owned" ? "Owned" : "Missing"}</button>)}</div></div>
          {visibleCards.length === 0 ? <div className="nn-empty"><Check size={24}/><h3>{filter === "missing" ? "This rarity is complete" : "No owned cards here yet"}</h3><p>{filter === "missing" ? "Every card in this rarity is in your collection." : "Switch to All cards to start tracking your collection."}</p><button type="button" onClick={() => setFilter("all")}>Show all cards</button></div> : <div className="nn-card-grid">{visibleCards.map(card => {
                const key = card.key;
                const owned = !!flipped[key];
                const code = getDisplayCardCode(key);
                return <article key={key} className={`nn-grid-card ${owned ? "is-owned" : ""}`}>
              <button type="button" className="nn-card-button" onClick={() => toggleCard(key)} aria-label={viewMode ? `Inspect ${code} in 3D` : `${code}, ${owned ? "owned. Mark missing" : "missing. Mark owned"}`} aria-pressed={viewMode ? undefined : owned}>
                <div className="nn-grid-model" data-show-back={!viewMode && owned} style={{ transform: !viewMode && owned ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className="nn-grid-face"><CardImage visible={loaded && (viewMode || !owned)} src={getCardFront(key)} className="nn-grid-image" style={getFrontStyle(key)} draggable={false} alt={code}/></div>
                  <div className="nn-grid-face nn-grid-back"><div className="nn-back-art"><CardImage visible={loaded && !viewMode && owned} src={getCardBack(key)} className="nn-grid-image nn-grid-back-image" style={getBackStyle(key)} draggable={false} alt={`${code} back`}/></div></div>
                </div>
                {owned && <span className="nn-owned-badge"><Check size={13}/><span className="sr-only">Owned</span></span>}
                {viewMode && <span className="nn-inspect-badge"><Box size={13}/>3D</span>}
              </button>
              <div className="nn-card-caption"><span>{code}</span><span className={owned ? "nn-owned-dot" : "nn-missing-dot"} aria-label={owned ? "Owned" : "Missing"}/></div>
            </article>;
            })}</div>}
        </section>
      </main>
      {inspectKey && <CardInspector card={getInspection(inspectKey)} onClose={closeInspector} onPrevious={() => stepInspection(-1)} onNext={() => stepInspection(1)}/>}
    </div>);
};
export default NightmareNight;
