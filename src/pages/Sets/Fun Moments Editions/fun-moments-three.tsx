import { funCatalog } from "@/lib/iso-card-catalog";
import { getFunMomentsThreeBack as getCardBack, cardImagePaths } from "@/lib/card-images";
import CollectionLoading from "@/components/CollectionLoading";
import CardImage from "@/components/CardImage";
import { useState, useEffect, useRef, useCallback, useId, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
import { ArrowLeft, Check, X, RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
const { getDisplayCardCode } = funCatalog;
const getDisplayRarityCode = (rarity: string) => rarity === "SN" ? "\u25c7N" : rarity === "SCR" ? "\u25c7CR" : rarity;
const hasSilverStamp = (key: string) => key.startsWith("CR-") || key.startsWith("SCR-");
const hasSidewaysStamp = (key: string) => key === "CR-10" || key === "CR-11" || key === "CR-12";
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
const getSealLighting = ([x, y, z, w]: Quaternion) => {
    const nx = -2 * (x * z + y * w);
    const ny = -2 * (y * z - x * w);
    const nz = -1 + 2 * (x * x + y * y);
    const spectralAngle = nx * 2.4 + ny * 1.7;
    const tiltEnergy = nx * nx + ny * ny;
    const verticalWeight = tiltEnergy > .001 ? ny * ny / tiltEnergy : 0;
    const horizontalWeight = tiltEnergy > .001 ? nx * nx / tiltEnergy : 0;
    const verticalReveal = Math.pow(Math.sin(ny * 4.2), 2) * verticalWeight;
    const horizontalReveal = Math.pow(Math.sin(nx * 4.2), 2) * horizontalWeight;
    const facing = Math.max(0, nz);
    return {
        x: 50 + nx * 48,
        y: 50 + ny * 48,
        angle: 115 + nx * 65 - ny * 45,
        hue: spectralAngle * 95,
        certificate: (.035 + verticalReveal * .965) * Math.pow(facing, .25),
        collection: (.025 + horizontalReveal * .975) * Math.pow(facing, .25),
        brightness: .78 + Math.max(0, nx * .4 - ny * .3 + nz * .85) * .5
    };
};
const getInspectorCardHeight = (width: number, height: number, aspect: number) => {
    const limit = Math.max(0, Math.min(width, height) / 2 - 12);
    const radius = limit / Math.sqrt(1 + (limit / 1000) ** 2);
    return Math.min(440, 2 * Math.sqrt(Math.max(0, radius * radius - .25)) / Math.hypot(1, aspect));
};
function CertificateSeal({ sideways = false }: { sideways?: boolean }) {
    const id = useId().replace(/:/g, "");
    return <span className={`fm3-certificate-seal${sideways ? " fm3-seal-sideways" : ""}`} aria-hidden="true">
        <span className="fm3-seal-foil"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="fm3-seal-art" focusable="false">
            <defs>
                <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6f8f9"/><stop offset=".23" stopColor="#bdc4ca"/><stop offset=".46" stopColor="#edf0f2"/><stop offset=".7" stopColor="#a6afb6"/><stop offset="1" stopColor="#eef2f4"/>
                </linearGradient>
                <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" style={{ stopColor: "hsl(calc(165 + var(--fm3-foil-hue,0)), 88%, 68%)" }}/><stop offset=".25" style={{ stopColor: "hsl(calc(85 + var(--fm3-foil-hue,0)), 90%, 65%)" }}/><stop offset=".5" style={{ stopColor: "hsl(calc(48 + var(--fm3-foil-hue,0)), 100%, 62%)" }}/><stop offset=".75" style={{ stopColor: "hsl(calc(22 + var(--fm3-foil-hue,0)), 95%, 70%)" }}/><stop offset="1" style={{ stopColor: "hsl(calc(265 + var(--fm3-foil-hue,0)), 90%, 80%)" }}/>
                </linearGradient>
                <pattern id={`${id}-dots`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <path d="M1.2 .3 L2 1.2 L1.2 2.1 L.4 1.2 Z" fill="#e6eef4" fillOpacity=".65"/>
                </pattern>
            </defs>
            <g>
                <path d="M0 0H100V100H0Z" fill={`url(#${id}-dots)`} opacity=".42"/>
                <path className="fm3-seal-letter-band" d="M-2-2H27V102H-2Z" fill="#19252f"/>
                <path d="M26-2H45V102H26Z" fill="#354149"/>
                <path d="M26-2H45V102H26Z" fill={`url(#${id}-dots)`} opacity=".8"/>
                <g>
                <path d="M44 31L73 0H102V21L77 39L102 69V102H74L51 65L44 73Z" fill={`url(#${id}-metal)`} stroke="#e4e9ed" strokeWidth=".6"/>
                <g transform="translate(83 83)" fontFamily="Arial,sans-serif" fontWeight="700" textAnchor="middle">
                    <text x=".35" y=".35" fontSize="5.2" fill="#f5f7f8">{"\u5361\u6e38"}</text>
                    <text x="0" y="0" fontSize="5.2" fill="#63717b">{"\u5361\u6e38"}</text>
                    <text x="0" y="3.4" fontSize="2.3" letterSpacing=".2" fill="#63717b">KAYOU</text>
                </g>
                </g>
                <g transform="rotate(90 50 50)">
                    <text className="fm3-seal-certificate" y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("CERTIFICATE").map((letter, index) => <tspan key={index} x={16 + index * 6.8}>{letter}</tspan>)}</text>
                    <g className="fm3-seal-collection">
                        <text y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("COLLECTION").map((letter, index) => <tspan key={index} x={16 + index * (68 / 9)}>{letter}</tspan>)}</text>
                    </g>
                </g>
            </g>
        </svg>
        <span className="fm3-seal-glint"/>
    </span>;
}
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
            const light = getSealLighting(next);
            model.current.style.setProperty("--fm3-foil-x", `${light.x}%`);
            model.current.style.setProperty("--fm3-foil-y", `${light.y}%`);
            model.current.style.setProperty("--fm3-foil-angle", `${light.angle}deg`);
            model.current.style.setProperty("--fm3-foil-hue", String(light.hue));
            model.current.style.setProperty("--fm3-cert-opacity", String(light.certificate));
            model.current.style.setProperty("--fm3-collection-opacity", String(light.collection));
            model.current.style.setProperty("--fm3-silver-brightness", String(light.brightness));
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
                        element.setAttribute("data-fm3-inspector-navigation", "");
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
            hiddenNavigation.forEach(element => element.removeAttribute("data-fm3-inspector-navigation"));
        };
    }, []);
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("fm3-inspector-open");
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
        return () => { document.body.classList.remove("fm3-inspector-open"); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
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
    return createPortal(<div className="fm3-inspector-overlay" onClick={event => { if (event.target === event.currentTarget)
        onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="fm3-inspector-title" className="fm3-inspector-dialog">
        <header className="fm3-inspector-header">
          <div><p className="fm3-eyebrow">3D card inspector</p><h2 id="fm3-inspector-title">{card.code}</h2></div>
          <button type="button" className="fm3-icon-button" onClick={onClose} aria-label="Close inspector"><X size={20}/></button>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`fm3-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
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
          <div className="fm3-card-ground"/>
          <div ref={model} className="fm3-card-model">
            <div className="fm3-card-face fm3-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="fm3-face-image fm3-front-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="fm3-card-sheen"/>
            </div>
            <div className="fm3-card-face fm3-card-back">
              <div className="fm3-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="fm3-face-image fm3-back-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="fm3-card-sheen"/>
              </div>
              {hasSilverStamp(card.key) && <CertificateSeal sideways={hasSidewaysStamp(card.key)}/>}
            </div>
          </div>
        </div>
        <div role="status" className="fm3-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="fm3-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="fm3-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
        <footer className="fm3-inspector-footer">
          <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={18}/><span>Previous</span></button>
          <span>Fun Moments Three</span>
          <button type="button" onClick={onNext} aria-label="Next card"><span>Next</span><ChevronRight size={18}/></button>
        </footer>
      </div>
    </div>, document.body);
}
const funMomentsThreeStyles = `
.fm3-page,.fm3-inspector-dialog{--fm3-bg:#f5f5f3;--fm3-panel:#fff;--fm3-subtle:#f0f0ec;--fm3-ink:#202125;--fm3-muted:#72747c;--fm3-border:rgba(0,0,0,.09);--fm3-accent:#ffd54a;--fm3-green:#15803d;color:var(--fm3-ink);font-family:Oxanium,system-ui,sans-serif;box-sizing:border-box}
.dark .fm3-page,.dark .fm3-inspector-dialog,[data-theme="dark"] .fm3-page,[data-theme="dark"] .fm3-inspector-dialog{--fm3-bg:#101112;--fm3-panel:#191b1d;--fm3-subtle:#242629;--fm3-ink:#f1f2f3;--fm3-muted:#a0a3ab;--fm3-border:rgba(255,255,255,.09);--fm3-green:#86efac}
.fm3-page *,.fm3-inspector-dialog *{box-sizing:border-box}
.fm3-page{min-height:calc(100dvh - var(--fm3-page-top,0px));background:var(--fm3-bg);padding-bottom:max(12px,env(safe-area-inset-bottom))}
.fm3-page button,.fm3-inspector-dialog button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.fm3-page button:focus-visible,.fm3-inspector-dialog button:focus-visible,.fm3-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:4px}
.fm3-main{width:100%;padding:16px 24px}
.fm3-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--fm3-panel);border:1px solid var(--fm3-border);border-radius:22px}
.fm3-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--fm3-subtle)}
.fm3-heading{flex:1;min-width:0}.fm3-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--fm3-muted)}
.fm3-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.fm3-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--fm3-muted);line-height:1.5}
.fm3-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.fm3-total strong{font-size:26px;line-height:1}.fm3-total strong span{font-size:16px;font-weight:500;color:var(--fm3-muted)}.fm3-total>span{font-size:11px;color:var(--fm3-muted)}
.fm3-progress-track{height:5px;border-radius:8px;background:var(--fm3-subtle);overflow:hidden}.fm3-progress-track>div{height:100%;background:var(--fm3-accent);border-radius:8px;transition:width .25s}
.fm3-mode,.fm3-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--fm3-subtle)}
.fm3-mode button,.fm3-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--fm3-muted)}
.fm3-mode .is-active{background:var(--fm3-accent);color:#27230f}.fm3-filters .is-active{background:var(--fm3-panel);color:var(--fm3-ink);box-shadow:0 1px 5px #00000008}
.fm3-rarities{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:8px;padding:14px 0}
.fm3-rarities button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--fm3-border);background:var(--fm3-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.fm3-rarities strong{font-size:14px}.fm3-rarities button>span{font-size:11px;color:var(--fm3-muted)}.fm3-rarities .is-complete{color:var(--fm3-green)}.fm3-rarities .is-active{background:var(--fm3-accent);border-color:transparent;color:#27230f}.fm3-rarities .is-active>span{color:#5b4b15}
.fm3-catalog{background:var(--fm3-panel);border:1px solid var(--fm3-border);border-radius:22px;padding:20px}
.fm3-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.fm3-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.fm3-catalog-header h2 span{font-size:11px;font-weight:500;color:var(--fm3-muted);border:1px solid var(--fm3-border);border-radius:8px;padding:4px 8px;margin-left:10px;vertical-align:middle}.fm3-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--fm3-muted)}
.fm3-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.fm3-grid-card{min-width:0}.fm3-card-button{display:block;position:relative;width:100%;aspect-ratio:5/7;border-radius:8px!important;background:var(--fm3-subtle);perspective:900px;transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.fm3-grid-model{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .4s}.fm3-grid-face{position:absolute;inset:0;overflow:hidden;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.1px)}.fm3-grid-back{transform:rotateY(180deg) translateZ(.1px)}
.fm3-grid-image{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;object-position:center;transform:scale(1.035);user-select:none}.fm3-grid-back-image{height:100%;top:0;transform:scale(1.035)}
.fm3-owned-badge,.fm3-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.fm3-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.fm3-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--fm3-muted);white-space:nowrap}.fm3-owned-dot,.fm3-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.fm3-missing-dot{background:var(--fm3-muted);opacity:.4}
.fm3-empty{text-align:center;padding:45px 20px;color:var(--fm3-muted);border:1px dashed var(--fm3-border);border-radius:16px}.fm3-empty>svg{margin:0 auto 10px}.fm3-empty h3{font-size:16px;color:var(--fm3-ink);margin:0 0 8px}.fm3-empty p{font-size:13px;margin:0}.fm3-empty button{margin-top:18px;padding:12px 18px;background:var(--fm3-accent);color:#27230f;border-radius:12px;font-size:12px;font-weight:600}
.fm3-inspector-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;--fm3-inspector-top:100px;padding:calc(var(--fm3-inspector-top) + env(safe-area-inset-top)) 16px max(12px,env(safe-area-inset-bottom));background:#05070bbd;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overscroll-behavior:contain}
.fm3-inspector-dialog{width:min(100%,780px);height:min(700px,calc(100dvh - var(--fm3-inspector-top) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));max-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;overflow:hidden;overscroll-behavior:contain;background:var(--fm3-panel);border:1px solid var(--fm3-border);border-radius:22px;box-shadow:0 24px 100px #00000060;scrollbar-width:thin}
.fm3-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.fm3-inspector-header h2{font-size:clamp(14px,3vw,20px);margin:0;letter-spacing:-.02em}
.fm3-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.fm3-inspector-stage.is-dragging{cursor:grabbing}
.fm3-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.fm3-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}
.fm3-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.fm3-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(.5px)}.fm3-card-back{transform:rotateY(180deg) translateZ(.5px)}
.fm3-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.fm3-front-image,.fm3-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border-radius:inherit}.fm3-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.fm3-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.fm3-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--fm3-muted);text-align:center}.fm3-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--fm3-subtle);font-size:11px}
.fm3-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.fm3-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--fm3-subtle);font-size:12px;font-weight:600}
.fm3-inspector-controls button[aria-pressed="true"]{background:var(--fm3-accent);color:#27230f}
.fm3-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--fm3-muted)}.fm3-inspector-zoom input{width:min(220px,50%);accent-color:var(--fm3-accent);cursor:pointer;touch-action:pan-x}.fm3-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.fm3-inspector-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--fm3-border);padding:6px 16px}.fm3-inspector-footer>span{font-size:11px;color:var(--fm3-muted)}.fm3-inspector-footer button{display:flex;align-items:center;gap:4px;min-height:40px;border-radius:11px;background:var(--fm3-subtle);padding:8px 10px;font-size:11px}

.fm3-certificate-seal{position:absolute;right:6%;bottom:6%;width:10.5%;aspect-ratio:1;border-radius:14%;overflow:hidden;isolation:isolate;background:#bbc2c8;box-shadow:0 .3px .8px #00000075;pointer-events:none}
.fm3-certificate-seal.fm3-seal-sideways{right:auto;left:5.5%;top:6%;bottom:auto;transform:rotate(180deg)}
.fm3-seal-foil{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 7%,#e4f4ff65 7.3% 8.3%,transparent 8.6% 19%),repeating-linear-gradient(125deg,#f5f6f875 0 .8px,#7f8c9930 .8px 1.6px),linear-gradient(var(--fm3-foil-angle,115deg),#d3d9dd 0%,#fafcfc 12%,#77838e 23%,#c1cbd3 33%,#eef4f7 41%,#505a66 49%,#c6d0d7 60%,#f5f8fa 68%,#88929b 80%,#dce1e5 92%,#f7f8f8 100%);background-size:100% 100%,100% 100%,240% 240%;background-position:center,center,var(--fm3-foil-x,50%) var(--fm3-foil-y,50%)}
.fm3-seal-art{position:absolute;inset:0;width:100%;height:100%}
.fm3-seal-letter-band{opacity:1}
.fm3-seal-collection{opacity:var(--fm3-collection-opacity,0)}
.fm3-seal-certificate{opacity:var(--fm3-cert-opacity,.55)}
.fm3-seal-glint{position:absolute;inset:0;background:linear-gradient(var(--fm3-foil-angle,115deg),transparent 25%,#c6efff18 36%,#ffffff60 48%,#ffe1ff16 57%,transparent 68%);background-size:230% 230%;background-position:var(--fm3-foil-x,50%) var(--fm3-foil-y,50%);opacity:.2}

@media(max-width:639px){body.fm3-inspector-open [data-fm3-inspector-navigation]{display:none!important}}
@media(max-width:600px){.fm3-card-button{perspective:none;background:transparent;overflow:hidden;-webkit-mask-image:linear-gradient(#fff,#fff)}.fm3-grid-model{transform:none!important;transform-style:flat;transition:none}.fm3-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;-webkit-mask-image:linear-gradient(#fff,#fff)}.fm3-grid-back{display:none;transform:none}.fm3-grid-model[data-show-back="true"]>.fm3-grid-face:first-child{display:none}.fm3-grid-model[data-show-back="true"]>.fm3-grid-back{display:block}.fm3-grid-back-image{left:0;width:100%}}
@media(hover:hover){.fm3-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.fm3-rarities button:hover{transform:translateY(-1px)}.fm3-icon-button:hover,.fm3-inspector-controls button:hover{filter:brightness(.95)}}
@media(min-width:1800px){.fm3-card-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
@media(max-width:1000px){.fm3-header{flex-wrap:wrap;gap:14px}.fm3-heading{flex-basis:calc(100% - 60px)}.fm3-total{max-width:none;min-width:120px}.fm3-mode{flex-shrink:0}.fm3-rarities{grid-template-columns:repeat(4,minmax(0,1fr))}.fm3-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:600px){.fm3-main{padding:10px 10px 0}.fm3-header{padding:14px;border-radius:18px;gap:12px}.fm3-heading h1{font-size:25px}.fm3-heading>p:last-child{font-size:11px}.fm3-total{flex-basis:100%;gap:6px}.fm3-total strong{font-size:23px}.fm3-mode{width:100%}.fm3-mode button{flex:1}.fm3-rarities{gap:6px;padding:10px 0}.fm3-rarities button{padding:8px 6px;gap:7px;min-height:44px}.fm3-rarities strong{font-size:12px}.fm3-rarities button>span{font-size:10px}.fm3-catalog{padding:12px;border-radius:18px}.fm3-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.fm3-catalog-header h2{font-size:17px}.fm3-filters{width:100%}.fm3-filters button{flex:1;min-height:36px;font-size:11px}.fm3-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}.fm3-card-caption{font-size:8px;letter-spacing:-.04em}.fm3-card-caption>span:first-child{overflow-wrap:anywhere;white-space:normal}.fm3-owned-badge{top:5px;right:5px;padding:4px}.fm3-inspect-badge{right:5px;bottom:5px;font-size:9px}.fm3-inspector-overlay{--fm3-inspector-top:94px;align-items:flex-start;padding-left:10px;padding-right:10px}.fm3-inspector-dialog{border-radius:19px}.fm3-inspector-header{padding:14px}.fm3-inspector-controls{padding:6px 12px 12px;gap:6px}.fm3-inspector-controls button{padding:10px 12px}.fm3-inspector-status{font-size:11px}}
@media(max-height:600px){.fm3-inspector-overlay{--fm3-inspector-top:66px}.fm3-inspector-header{padding:7px 12px}.fm3-inspector-header .fm3-eyebrow{display:none}.fm3-inspector-header h2{font-size:14px}.fm3-inspector-header .fm3-icon-button{height:34px;width:34px}.fm3-inspector-status{min-height:23px;font-size:10px;padding:2px 10px}.fm3-inspector-controls{padding:3px 12px 6px}.fm3-inspector-controls button{min-height:36px;min-width:36px;padding:7px 12px}.fm3-inspector-footer{padding:3px 12px}.fm3-inspector-footer button{min-height:34px;padding:5px 9px}}
@media(max-width:359px){.fm3-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fm3-card-caption{font-size:9px}}
.fm3-page .fm3-grid-image,.fm3-inspector-dialog .fm3-face-image{inset:-2px;width:calc(100% + 4px);height:calc(100% + 4px);max-width:none;max-height:none;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border:0;border-radius:0}
@media(prefers-reduced-motion:reduce){.fm3-page *{transition:none!important}.fm3-card-button:hover,.fm3-rarities button:hover{transform:none}}
`;
const FunMomentsThree = () => {
    const navigate = useNavigate();
    const [flipped, setFlipped] = useState<Record<string, boolean>>({});
    const [loaded, setLoaded] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const update = () => {
            if (pageRef.current)
                pageRef.current.style.setProperty("--fm3-page-top", `${pageRef.current.getBoundingClientRect().top + window.scrollY}px`);
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
    const [selectedRarity, setSelectedRarity] = useState("N");
    const [inspectKey, setInspectKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "owned" | "missing">("all");
    const set = { folder: "fun-moments-three", prefix: "FM3", setId: "11", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } };
    const rarityNames: Record<string, string> = { N: "Episode Cards", SN: "Shining Episode Cards", R: "Rare Cards", SR: "Super Rare Cards", SSR: "Super Spark Rare Cards", UR: "Ultra Rare Cards", UGR: "Ultra Golden Rare Cards", CR: "Creative Rare Cards", SCR: "Shining Creative Rare Cards" };
    const cards = Object.entries(set.rarities).flatMap(([rarity, count]) => Array.from({ length: count }, (_, index) => ({ rarity, number: index + 1 })));
    const collected = cards.filter(card => flipped[`${card.rarity}-${card.number}`]).length;
    const total = cards.length;
    const progress = Math.round(collected / total * 100);
    const rarityCards = cards.filter(card => card.rarity === selectedRarity);
    const rarityCollected = rarityCards.filter(card => flipped[`${card.rarity}-${card.number}`]).length;
    const visibleCards = rarityCards.filter(card => filter === "all" || (filter === "owned" ? flipped[`${card.rarity}-${card.number}`] : !flipped[`${card.rarity}-${card.number}`]));
    const closeInspector = useCallback(() => setInspectKey(null), []);
    const getInspection = (key: string): InspectCard => {
        const [rarity, numberText] = key.split("-");
        const number = Number(numberText);
        return { key, code: getDisplayCardCode(set.setId, rarity, number), front: cardImagePaths.ccg(set.folder, set.prefix, rarity, String(number).padStart(3, "0")), back: getCardBack(rarity, number) };
    };
    const stepInspection = (direction: number) => {
        const keys = visibleCards.map(card => `${card.rarity}-${card.number}`);
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
    return (<div ref={pageRef} className="fm3-page">
      <style>{funMomentsThreeStyles}</style>
      <main className="fm3-main">
        <header className="fm3-header">
          <button type="button" className="fm3-icon-button" onClick={() => navigate("/collections")} aria-label="Back to collections"><ArrowLeft size={20}/></button>
          <div className="fm3-heading"><p className="fm3-eyebrow">Third Edition</p><h1>Fun Moments Three</h1><p>{viewMode ? "Choose a card to explore its front and back in 3D." : "Tap a card to mark it owned or missing."}</p></div>
          <div className="fm3-total"><strong>{collected}<span> / {total}</span></strong><span>{total - collected} still to collect</span><div className="fm3-progress-track" role="progressbar" aria-label="Fun Moments Three collection completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }}/></div></div>
          <div className="fm3-mode" role="group" aria-label="Card interaction mode">
            <button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button>
            <button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><Box size={16}/>Inspect in 3D</button>
          </div>
        </header>
        <nav className="fm3-rarities" aria-label="Card rarity">
          {Object.entries(set.rarities).map(([rarity, count]) => {
            const owned = cards.filter(card => card.rarity === rarity && flipped[`${rarity}-${card.number}`]).length;
            return <button type="button" key={rarity} aria-pressed={selectedRarity === rarity} className={`${selectedRarity === rarity ? "is-active" : ""} ${owned === count ? "is-complete" : ""}`} onClick={() => setSelectedRarity(rarity)}><strong>{getDisplayRarityCode(rarity)}</strong><span>{owned}/{count}</span>{owned === count && <Check size={13}/>}</button>;
        })}
        </nav>
        <section className="fm3-catalog" aria-label={`${selectedRarity} cards`}>
          <div className="fm3-catalog-header"><div><h2>{rarityNames[selectedRarity]}<span>{getDisplayRarityCode(selectedRarity)}</span></h2><p>{rarityCollected} of {rarityCards.length} collected</p></div><div className="fm3-filters" role="group" aria-label="Filter cards">{(["all", "missing", "owned"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All cards" : value === "owned" ? "Owned" : "Missing"}</button>)}</div></div>
          {visibleCards.length === 0 ? <div className="fm3-empty"><Check size={24}/><h3>{filter === "missing" ? "This rarity is complete" : "No owned cards here yet"}</h3><p>{filter === "missing" ? "Every card in this rarity is in your collection." : "Switch to All cards to start tracking your collection."}</p><button type="button" onClick={() => setFilter("all")}>Show all cards</button></div> : <div className="fm3-card-grid">{visibleCards.map(card => {
                const key = `${card.rarity}-${card.number}`;
                const owned = !!flipped[key];
                const code = getDisplayCardCode(set.setId, card.rarity, card.number);
                return <article key={key} className={`fm3-grid-card ${owned ? "is-owned" : ""}`}>
              <button type="button" className="fm3-card-button" onClick={() => toggleCard(key)} aria-label={viewMode ? `Inspect ${code} in 3D` : `${code}, ${owned ? "owned. Mark missing" : "missing. Mark owned"}`} aria-pressed={viewMode ? undefined : owned}>
                <div className="fm3-grid-model" data-show-back={!viewMode && owned} style={{ transform: !viewMode && owned ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className="fm3-grid-face"><CardImage visible={loaded && (viewMode || !owned)} src={cardImagePaths.ccg(set.folder, set.prefix, card.rarity, String(card.number).padStart(3, "0"))} className="fm3-grid-image" draggable={false} alt={code}/></div>
                  <div className="fm3-grid-face fm3-grid-back"><div className="fm3-back-art"><CardImage visible={loaded && !viewMode && owned} src={getCardBack(card.rarity, card.number)} className="fm3-grid-image fm3-grid-back-image" draggable={false} alt={`${code} back`}/></div>{hasSilverStamp(key) && <CertificateSeal sideways={hasSidewaysStamp(key)}/>}</div>
                </div>
                {owned && <span className="fm3-owned-badge"><Check size={13}/><span className="sr-only">Owned</span></span>}
                {viewMode && <span className="fm3-inspect-badge"><Box size={13}/>3D</span>}
              </button>
              <div className="fm3-card-caption"><span>{code}</span><span className={owned ? "fm3-owned-dot" : "fm3-missing-dot"} aria-label={owned ? "Owned" : "Missing"}/></div>
            </article>;
            })}</div>}
        </section>
      </main>
      {inspectKey && <CardInspector card={getInspection(inspectKey)} onClose={closeInspector} onPrevious={() => stepInspection(-1)} onNext={() => stepInspection(1)}/>}
    </div>);
};
export default FunMomentsThree;
