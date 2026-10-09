import { tcgCatalog } from "@/lib/iso-card-catalog";
import { getFantasyWonderlandBack as getCardBack, getFantasyWonderlandFront as getCardFront } from "@/lib/card-images";
import CollectionLoading from "@/components/CollectionLoading";
import CardImage from "@/components/CardImage";
import { useState, useEffect, useRef, useCallback, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
import { ArrowLeft, Check, X, RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
const fantasyCatalogSet = tcgCatalog.sets.find(set => set.id === "FW");
const fantasyCatalogCards = fantasyCatalogSet ? tcgCatalog.getCards(fantasyCatalogSet, {}) : [];
const getDisplayCardCode = (key: string) => {
    const card = fantasyCatalogCards.find(card => card.key === key);
    return card ? tcgCatalog.getDisplayCardCode("FW", card) : key;
};
const rarityLabel = (rarity: string) => tcgCatalog.getDisplayRarity(rarity);
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
                        element.setAttribute("data-fw-inspector-navigation", "");
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
            hiddenNavigation.forEach(element => element.removeAttribute("data-fw-inspector-navigation"));
        };
    }, []);
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("fw-inspector-open");
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
        return () => { document.body.classList.remove("fw-inspector-open"); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
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
    return createPortal(<div className="fw-inspector-overlay" onClick={event => { if (event.target === event.currentTarget)
        onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="fw-inspector-title" className="fw-inspector-dialog">
        <header className="fw-inspector-header">
          <div><p className="fw-eyebrow">3D card inspector</p><h2 id="fw-inspector-title">{card.code}</h2></div>
          <button type="button" className="fw-icon-button" onClick={onClose} aria-label="Close inspector"><X size={20}/></button>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`fw-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
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
          <div className="fw-card-ground"/>
          <div ref={model} className="fw-card-model">
            <div className="fw-card-face fw-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="fw-face-image fw-front-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="fw-card-sheen"/>
            </div>
            <div className="fw-card-face fw-card-back">
              <div className="fw-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="fw-face-image fw-back-image" style={{ transform: "scale(1.035)" }} onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="fw-card-sheen"/>
              </div>
            </div>
          </div>
        </div>
        <div role="status" className="fw-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="fw-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="fw-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
        <footer className="fw-inspector-footer">
          <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={18}/><span>Previous</span></button>
          <span>Discord</span>
          <button type="button" onClick={onNext} aria-label="Next card"><span>Next</span><ChevronRight size={18}/></button>
        </footer>
      </div>
    </div>, document.body);
}
const fantasyWonderlandStyles = `
.fw-page,.fw-inspector-dialog{--fw-bg:#f5f5f3;--fw-panel:#fff;--fw-subtle:#f0f0ec;--fw-ink:#202125;--fw-muted:#72747c;--fw-border:rgba(0,0,0,.09);--fw-accent:#ffd54a;--fw-green:#15803d;color:var(--fw-ink);font-family:Oxanium,system-ui,sans-serif;box-sizing:border-box}
.dark .fw-page,.dark .fw-inspector-dialog,[data-theme="dark"] .fw-page,[data-theme="dark"] .fw-inspector-dialog{--fw-bg:#101112;--fw-panel:#191b1d;--fw-subtle:#242629;--fw-ink:#f1f2f3;--fw-muted:#a0a3ab;--fw-border:rgba(255,255,255,.09);--fw-green:#86efac}
.fw-page *,.fw-inspector-dialog *{box-sizing:border-box}
.fw-page{min-height:calc(100dvh - var(--fw-page-top,0px));background:var(--fw-bg);padding-bottom:max(12px,env(safe-area-inset-bottom))}
.fw-page button,.fw-inspector-dialog button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.fw-page button:focus-visible,.fw-inspector-dialog button:focus-visible,.fw-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:4px}
.fw-main{width:100%;padding:16px 24px}
.fw-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--fw-panel);border:1px solid var(--fw-border);border-radius:22px}
.fw-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--fw-subtle)}
.fw-heading{flex:1;min-width:0}.fw-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--fw-muted)}
.fw-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.fw-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--fw-muted);line-height:1.5}
.fw-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.fw-total strong{font-size:26px;line-height:1}.fw-total strong span{font-size:16px;font-weight:500;color:var(--fw-muted)}.fw-total>span{font-size:11px;color:var(--fw-muted)}
.fw-progress-track{height:5px;border-radius:8px;background:var(--fw-subtle);overflow:hidden}.fw-progress-track>div{height:100%;background:var(--fw-accent);border-radius:8px;transition:width .25s}
.fw-mode,.fw-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--fw-subtle)}
.fw-mode button,.fw-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--fw-muted)}
.fw-mode .is-active{background:var(--fw-accent);color:#27230f}.fw-filters .is-active{background:var(--fw-panel);color:var(--fw-ink);box-shadow:0 1px 5px #00000008}
.fw-rarities{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:8px;padding:14px 0}
.fw-rarities button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--fw-border);background:var(--fw-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.fw-rarities strong{font-size:14px}.fw-rarities button>span{font-size:11px;color:var(--fw-muted)}.fw-rarities .is-complete{color:var(--fw-green)}.fw-rarities .is-active{background:var(--fw-accent);border-color:transparent;color:#27230f}.fw-rarities .is-active>span{color:#5b4b15}
.fw-catalog{background:var(--fw-panel);border:1px solid var(--fw-border);border-radius:22px;padding:20px}
.fw-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.fw-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.fw-catalog-header h2 span{font-size:11px;font-weight:500;color:var(--fw-muted);border:1px solid var(--fw-border);border-radius:8px;padding:4px 8px;margin-left:10px;vertical-align:middle}.fw-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--fw-muted)}
.fw-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.fw-grid-card{min-width:0}.fw-card-button{display:block;position:relative;width:100%;aspect-ratio:5/7;border-radius:8px!important;background:var(--fw-subtle);perspective:900px;transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.fw-grid-model{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .4s}.fw-grid-face{position:absolute;inset:0;overflow:hidden;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.1px)}.fw-grid-back{transform:rotateY(180deg) translateZ(.1px)}
.fw-grid-image{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;object-position:center;transform:scale(1);user-select:none}.fw-grid-back-image{height:100%;top:0;transform:scale(1)}
.fw-owned-badge,.fw-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.fw-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.fw-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--fw-muted);white-space:nowrap}.fw-owned-dot,.fw-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.fw-missing-dot{background:var(--fw-muted);opacity:.4}
.fw-empty{text-align:center;padding:45px 20px;color:var(--fw-muted);border:1px dashed var(--fw-border);border-radius:16px}.fw-empty>svg{margin:0 auto 10px}.fw-empty h3{font-size:16px;color:var(--fw-ink);margin:0 0 8px}.fw-empty p{font-size:13px;margin:0}.fw-empty button{margin-top:18px;padding:12px 18px;background:var(--fw-accent);color:#27230f;border-radius:12px;font-size:12px;font-weight:600}
.fw-inspector-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;--fw-inspector-top:100px;padding:calc(var(--fw-inspector-top) + env(safe-area-inset-top)) 16px max(12px,env(safe-area-inset-bottom));background:#05070bbd;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overscroll-behavior:contain}
.fw-inspector-dialog{width:min(100%,780px);height:min(700px,calc(100dvh - var(--fw-inspector-top) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));max-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;overflow:hidden;overscroll-behavior:contain;background:var(--fw-panel);border:1px solid var(--fw-border);border-radius:22px;box-shadow:0 24px 100px #00000060;scrollbar-width:thin}
.fw-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.fw-inspector-header h2{font-size:clamp(14px,3vw,20px);margin:0;letter-spacing:-.02em}
.fw-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.fw-inspector-stage.is-dragging{cursor:grabbing}
.fw-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.fw-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}
.fw-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.fw-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(.5px)}.fw-card-back{transform:rotateY(180deg) translateZ(.5px)}
.fw-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.fw-front-image,.fw-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1);transform-origin:50% 50%;border-radius:inherit}.fw-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.fw-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.fw-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--fw-muted);text-align:center}.fw-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--fw-subtle);font-size:11px}
.fw-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.fw-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--fw-subtle);font-size:12px;font-weight:600}
.fw-inspector-controls button[aria-pressed="true"]{background:var(--fw-accent);color:#27230f}
.fw-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--fw-muted)}.fw-inspector-zoom input{width:min(220px,50%);accent-color:var(--fw-accent);cursor:pointer;touch-action:pan-x}.fw-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.fw-inspector-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--fw-border);padding:6px 16px}.fw-inspector-footer>span{font-size:11px;color:var(--fw-muted)}.fw-inspector-footer button{display:flex;align-items:center;gap:4px;min-height:40px;border-radius:11px;background:var(--fw-subtle);padding:8px 10px;font-size:11px}


@media(max-width:639px){body.fw-inspector-open [data-fw-inspector-navigation]{display:none!important}}
@media(max-width:600px){.fw-card-button{perspective:none;background:transparent;overflow:hidden;-webkit-mask-image:linear-gradient(#fff,#fff)}.fw-grid-model{transform:none!important;transform-style:flat;transition:none}.fw-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;-webkit-mask-image:linear-gradient(#fff,#fff)}.fw-grid-back{display:none;transform:none}.fw-grid-model[data-show-back="true"]>.fw-grid-face:first-child{display:none}.fw-grid-model[data-show-back="true"]>.fw-grid-back{display:block}.fw-grid-back-image{left:0;width:100%}}
@media(hover:hover){.fw-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.fw-rarities button:hover{transform:translateY(-1px)}.fw-icon-button:hover,.fw-inspector-controls button:hover{filter:brightness(.95)}}
@media(min-width:1800px){.fw-card-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
@media(max-width:1000px){.fw-header{flex-wrap:wrap;gap:14px}.fw-heading{flex-basis:calc(100% - 60px)}.fw-total{max-width:none;min-width:120px}.fw-mode{flex-shrink:0}.fw-rarities{grid-template-columns:repeat(4,minmax(0,1fr))}.fw-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:600px){.fw-main{padding:10px 10px 0}.fw-header{padding:14px;border-radius:18px;gap:12px}.fw-heading h1{font-size:25px}.fw-heading>p:last-child{font-size:11px}.fw-total{flex-basis:100%;gap:6px}.fw-total strong{font-size:23px}.fw-mode{width:100%}.fw-mode button{flex:1}.fw-rarities{gap:6px;padding:10px 0}.fw-rarities button{padding:8px 6px;gap:7px;min-height:44px}.fw-rarities strong{font-size:12px}.fw-rarities button>span{font-size:10px}.fw-catalog{padding:12px;border-radius:18px}.fw-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.fw-catalog-header h2{font-size:17px}.fw-filters{width:100%}.fw-filters button{flex:1;min-height:36px;font-size:11px}.fw-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}.fw-card-caption{font-size:8px;letter-spacing:-.04em}.fw-card-caption>span:first-child{overflow-wrap:anywhere;white-space:normal}.fw-owned-badge{top:5px;right:5px;padding:4px}.fw-inspect-badge{right:5px;bottom:5px;font-size:9px}.fw-inspector-overlay{--fw-inspector-top:94px;align-items:flex-start;padding-left:10px;padding-right:10px}.fw-inspector-dialog{border-radius:19px}.fw-inspector-header{padding:14px}.fw-inspector-controls{padding:6px 12px 12px;gap:6px}.fw-inspector-controls button{padding:10px 12px}.fw-inspector-status{font-size:11px}}
@media(max-height:600px){.fw-inspector-overlay{--fw-inspector-top:66px}.fw-inspector-header{padding:7px 12px}.fw-inspector-header .fw-eyebrow{display:none}.fw-inspector-header h2{font-size:14px}.fw-inspector-header .fw-icon-button{height:34px;width:34px}.fw-inspector-status{min-height:23px;font-size:10px;padding:2px 10px}.fw-inspector-controls{padding:3px 12px 6px}.fw-inspector-controls button{min-height:36px;min-width:36px;padding:7px 12px}.fw-inspector-footer{padding:3px 12px}.fw-inspector-footer button{min-height:34px;padding:5px 9px}}
@media(max-width:359px){.fw-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fw-card-caption{font-size:9px}}
@media(prefers-reduced-motion:reduce){.fw-page *{transition:none!important}.fw-card-button:hover,.fw-rarities button:hover{transform:none}}
`;
const FantasyWonderland = () => {
    const navigate = useNavigate();
    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
    const [loaded, setLoaded] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const update = () => {
            if (pageRef.current)
                pageRef.current.style.setProperty("--fw-page-top", `${pageRef.current.getBoundingClientRect().top + window.scrollY}px`);
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
  folder: "fantasy-wonderland",
  setId: "FW",
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
    PSPR: 11,
    PGR: 6,
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
const cards = Object.entries(set.rarities).flatMap(([rarity, count]) => {
  if (rarity === "ER") {
    return Array.from({ length: 6 }, (_, i) => ({
      rarity,
      key: `BP01ER${String(i + 7).padStart(2, "0")}`,
    }));
  }
  if (rarity === "PSPR") {
const numbers = [1, 2, 3, 5, 7, 8, 9, 12, 13, 18, 21];
    return numbers.map((n) => ({
      rarity,
      key: `BP01PSPR${String(n).padStart(2, "0")}`,
    }));
  }
  return Array.from({ length: count }, (_, i) => ({
    rarity,
    key: `BP01${rarity}${String(i + 1).padStart(2, "0")}`,
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
    return (<div ref={pageRef} className="fw-page">
      <style>{fantasyWonderlandStyles}</style>
      <main className="fw-main">
        <header className="fw-header">
          <button type="button" className="fw-icon-button" onClick={() => navigate("/collections")} aria-label="Back to collections"><ArrowLeft size={20}/></button>
          <div className="fw-heading"><p className="fw-eyebrow">My Little Pony TCG</p><h1>Fantasy Wonderland</h1><p>{viewMode ? "Choose a card to explore its front and back in 3D." : "Tap a card to mark it owned or missing."}</p></div>
          <div className="fw-total"><strong>{collected}<span> / {total}</span></strong><span>{total - collected} still to collect</span><div className="fw-progress-track" role="progressbar" aria-label="Fantasy Wonderland collection completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }}/></div></div>
          <div className="fw-mode" role="group" aria-label="Card interaction mode">
            <button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button>
            <button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><Box size={16}/>Inspect in 3D</button>
          </div>
        </header>
        <nav className="fw-rarities" aria-label="Card rarity">
          {Object.entries(set.rarities).map(([rarity, count]) => {
            const owned = cards.filter(card => card.rarity === rarity && flipped[card.key]).length;
            return <button type="button" key={rarity} aria-pressed={selectedRarity === rarity} className={`${selectedRarity === rarity ? "is-active" : ""} ${owned === count ? "is-complete" : ""}`} onClick={() => setSelectedRarity(rarity)}><strong>{rarityLabel(rarity)}</strong><span>{owned}/{count}</span>{owned === count && <Check size={13}/>}</button>;
        })}
        </nav>
        <section className="fw-catalog" aria-label={`${selectedRarity} cards`}>
          <div className="fw-catalog-header"><div><h2>{rarityNames[selectedRarity]}<span>{rarityLabel(selectedRarity)}</span></h2><p>{rarityCollected} of {rarityCards.length} collected</p></div><div className="fw-filters" role="group" aria-label="Filter cards">{(["all", "missing", "owned"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All cards" : value === "owned" ? "Owned" : "Missing"}</button>)}</div></div>
          {visibleCards.length === 0 ? <div className="fw-empty"><Check size={24}/><h3>{filter === "missing" ? "This rarity is complete" : "No owned cards here yet"}</h3><p>{filter === "missing" ? "Every card in this rarity is in your collection." : "Switch to All cards to start tracking your collection."}</p><button type="button" onClick={() => setFilter("all")}>Show all cards</button></div> : <div className="fw-card-grid">{visibleCards.map(card => {
                const key = card.key;
                const owned = !!flipped[key];
                const code = getDisplayCardCode(key);
                return <article key={key} className={`fw-grid-card ${owned ? "is-owned" : ""}`}>
              <button type="button" className="fw-card-button" onClick={() => toggleCard(key)} aria-label={viewMode ? `Inspect ${code} in 3D` : `${code}, ${owned ? "owned. Mark missing" : "missing. Mark owned"}`} aria-pressed={viewMode ? undefined : owned}>
                <div className="fw-grid-model" data-show-back={!viewMode && owned} style={{ transform: !viewMode && owned ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className="fw-grid-face"><CardImage visible={loaded && (viewMode || !owned)} src={getCardFront(key)} className="fw-grid-image" draggable={false} alt={code}/></div>
                  <div className="fw-grid-face fw-grid-back"><div className="fw-back-art"><CardImage visible={loaded && !viewMode && owned} src={getCardBack(key)} className="fw-grid-image fw-grid-back-image" style={{ transform: "scale(1.035)" }} draggable={false} alt={`${code} back`}/></div></div>
                </div>
                {owned && <span className="fw-owned-badge"><Check size={13}/><span className="sr-only">Owned</span></span>}
                {viewMode && <span className="fw-inspect-badge"><Box size={13}/>3D</span>}
              </button>
              <div className="fw-card-caption"><span>{code}</span><span className={owned ? "fw-owned-dot" : "fw-missing-dot"} aria-label={owned ? "Owned" : "Missing"}/></div>
            </article>;
            })}</div>}
        </section>
      </main>
      {inspectKey && <CardInspector card={getInspection(inspectKey)} onClose={closeInspector} onPrevious={() => stepInspection(-1)} onNext={() => stepInspection(1)}/>}
    </div>);
};
export default FantasyWonderland;
