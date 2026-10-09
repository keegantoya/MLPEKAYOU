import { getStarOneBack as getCardBack, cardImagePaths } from "@/lib/card-images";
import CollectionLoading from "@/components/CollectionLoading";
import CardImage from "@/components/CardImage";
import { useState, useEffect, useRef, useCallback, useId, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveCollectionProgress } from "@/lib/saveCollectionProgress";
import { ArrowLeft, Check, X, RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
const getDisplayRarityCode = (rarity: string) => rarity === "SAR" ? "\u25c7AR" : rarity;
const hasSilverStamp = (key: string) => key.startsWith("BP-") || key.startsWith("SAR-");
const hasCenteredStamp = (key: string) => key.startsWith("SAR-");
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
const getPremiumCardEdges = (height: number, aspect: number) => {
    if (height <= 0) return [];
    const width = height * aspect;
    const radius = height * .032;
    const points: { x: number; y: number }[] = [];
    const corners = [
        { x: width - radius, y: radius, angle: -Math.PI / 2 },
        { x: width - radius, y: height - radius, angle: 0 },
        { x: radius, y: height - radius, angle: Math.PI / 2 },
        { x: radius, y: radius, angle: Math.PI },
    ];
    for (const corner of corners) {
        for (let step = 0; step <= 4; step++) {
            const angle = corner.angle + step * Math.PI / 8;
            points.push({ x: corner.x + Math.cos(angle) * radius, y: corner.y + Math.sin(angle) * radius });
        }
    }
    return points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        return {
            left: `${(point.x + next.x) / 2}px`,
            top: `${(point.y + next.y) / 2}px`,
            width: `${Math.hypot(dx, dy) + .2}px`,
            transform: `translate(-50%, -50%) rotateZ(${Math.atan2(dy, dx)}rad) rotateX(90deg)`,
        };
    });
};
const getInspectorCardHeight = (width: number, height: number, aspect: number) => {
const limit = Math.max(0, Math.min(width, height) / 2 - 12);
const radius = limit / Math.sqrt(1 + (limit / 1000) ** 2);
    return Math.min(440, 2 * radius / Math.hypot(1, aspect, .022));
};
function CertificateSeal({ centered = false }: { centered?: boolean }) {
const id = useId().replace(/:/g, "");
    return <span className={`s1-certificate-seal${centered ? " s1-seal-centered" : ""}`} aria-hidden="true">
        <span className="s1-seal-foil"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="s1-seal-art" focusable="false">
            <defs>
                <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6f8f9"/><stop offset=".23" stopColor="#bdc4ca"/><stop offset=".46" stopColor="#edf0f2"/><stop offset=".7" stopColor="#a6afb6"/><stop offset="1" stopColor="#eef2f4"/>
                </linearGradient>
                <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" style={{ stopColor: "hsl(calc(165 + var(--s1-foil-hue,0)), 88%, 68%)" }}/><stop offset=".25" style={{ stopColor: "hsl(calc(85 + var(--s1-foil-hue,0)), 90%, 65%)" }}/><stop offset=".5" style={{ stopColor: "hsl(calc(48 + var(--s1-foil-hue,0)), 100%, 62%)" }}/><stop offset=".75" style={{ stopColor: "hsl(calc(22 + var(--s1-foil-hue,0)), 95%, 70%)" }}/><stop offset="1" style={{ stopColor: "hsl(calc(265 + var(--s1-foil-hue,0)), 90%, 80%)" }}/>
                </linearGradient>
                <pattern id={`${id}-dots`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <path d="M1.2 .3 L2 1.2 L1.2 2.1 L.4 1.2 Z" fill="#e6eef4" fillOpacity=".65"/>
                </pattern>
            </defs>
            <g>
                <path d="M0 0H100V100H0Z" fill={`url(#${id}-dots)`} opacity=".42"/>
                <path className="s1-seal-letter-band" d="M-2-2H27V102H-2Z" fill="#19252f"/>
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
                    <text className="s1-seal-certificate" y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("CERTIFICATE").map((letter, index) => <tspan key={index} x={16 + index * 6.8}>{letter}</tspan>)}</text>
                    <g className="s1-seal-collection">
                        <text y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("COLLECTION").map((letter, index) => <tspan key={index} x={16 + index * (68 / 9)}>{letter}</tspan>)}</text>
                    </g>
                </g>
            </g>
        </svg>
        <span className="s1-seal-glint"/>
    </span>;
}
function CardInspector({ card, onClose, onPrevious, onNext }: {
    card: InspectCard;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}) {
const aspect = 5 / 7;
    const [baseHeight, setBaseHeight] = useState(0);
    const zoomRef = useRef(1);
    const renderFrame = useRef<number | null>(null);
    useEffect(() => () => {
        if (renderFrame.current !== null) cancelAnimationFrame(renderFrame.current);
        renderFrame.current = null;
    }, []);
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
        if (renderFrame.current !== null) return;
        renderFrame.current = requestAnimationFrame(() => {
            renderFrame.current = null;
        if (model.current) {
            model.current.style.transform = `translate3d(${pan.current.x}px,${pan.current.y}px,0) ${rotationMatrix(rotation.current)} scale3d(${zoomRef.current},${zoomRef.current},${zoomRef.current})`;
const light = getSealLighting(rotation.current);
            model.current.style.setProperty("--s1-foil-x", `${light.x}%`);
            model.current.style.setProperty("--s1-foil-y", `${light.y}%`);
            model.current.style.setProperty("--s1-foil-angle", `${light.angle}deg`);
            model.current.style.setProperty("--s1-foil-hue", String(light.hue));
            model.current.style.setProperty("--s1-cert-opacity", String(light.certificate));
            model.current.style.setProperty("--s1-collection-opacity", String(light.collection));
            model.current.style.setProperty("--s1-silver-brightness", String(light.brightness));
        }
        });
    };
    const moveCard = (dx: number, dy: number) => {
        pan.current = { x: pan.current.x + dx, y: pan.current.y + dy };
        applyRotation(rotation.current);
    };
const resetView = () => {
        pan.current = { x: 0, y: 0 };
        zoomRef.current = 1;
        setZoom(1);
        setDragMode("rotate");
        applyRotation([0, 0, 0, 1]);
    };
const changeZoom = (next: number) => {
const value = Math.max(1, Math.min(4, next));
        pan.current = { x: pan.current.x * value / zoomRef.current, y: pan.current.y * value / zoomRef.current };
        zoomRef.current = value;
        setZoom(value);
        if (value > 1) setDragMode("move");
        applyRotation(rotation.current);
    };
const turn = (x: number, y: number, z: number, angle: number) => applyRotation(multiplyRotation(axisRotation(x, y, z, angle), rotation.current));
const finishDrag = () => { pointer.current = null; setDragging(false); };
    useEffect(() => {
const updateSize = () => {
            if (model.current && stage.current) {
const height = Math.floor(getInspectorCardHeight(stage.current.clientWidth, stage.current.clientHeight, aspect));
                model.current.style.height = `${height}px`;
                model.current.style.width = `${height * aspect}px`;
                model.current.style.setProperty("--s1-card-depth", `${height * .022}px`);
                setBaseHeight(previous => previous === height ? previous : height);
            }
        };
const observer = new ResizeObserver(updateSize);
        if (stage.current) observer.observe(stage.current);
        updateSize();
        return () => observer.disconnect();
    }, [aspect]);
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
                        element.setAttribute("data-s1-inspector-navigation", "");
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
            hiddenNavigation.forEach(element => element.removeAttribute("data-s1-inspector-navigation"));
        };
    }, []);
    useEffect(() => {
const previousFocus = document.activeElement as HTMLElement | null;
const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("s1-inspector-open");
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
        return () => { document.body.classList.remove("s1-inspector-open"); document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
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
    return createPortal(<div className="s1-inspector-overlay" onClick={event => { if (event.target === event.currentTarget)
        onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="s1-inspector-title" className="s1-inspector-dialog">
        <header className="s1-inspector-header">
          <div><p className="s1-eyebrow">3D card inspector</p><h2 id="s1-inspector-title">{card.code}</h2></div>
          <button type="button" className="s1-icon-button" onClick={onClose} aria-label="Close inspector"><X size={20}/></button>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`s1-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
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
          <div className="s1-card-ground"/>
          <div ref={model} className="s1-card-model">
            {getPremiumCardEdges(baseHeight, aspect).map((edge, index) => <div key={index} aria-hidden="true" className="s1-card-edge" style={edge}/>)}
            <div className="s1-card-face s1-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="s1-face-image s1-front-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="s1-card-sheen"/>
            </div>
            <div className="s1-card-face s1-card-back">
              <div className="s1-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="s1-face-image s1-back-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="s1-card-sheen"/>
              </div>
              {hasSilverStamp(card.key) && <CertificateSeal centered={hasCenteredStamp(card.key)}/>}
            </div>
          </div>
        </div>
        <div role="status" className="s1-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="s1-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="s1-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
        <footer className="s1-inspector-footer">
          <button type="button" onClick={onPrevious} aria-label="Previous card"><ChevronLeft size={18}/><span>Previous</span></button>
          <span>Star One</span>
          <button type="button" onClick={onNext} aria-label="Next card"><span>Next</span><ChevronRight size={18}/></button>
        </footer>
      </div>
    </div>, document.body);
}
const starOneStyles = `
.s1-page,.s1-inspector-dialog{--s1-bg:#f5f5f3;--s1-panel:#fff;--s1-subtle:#f0f0ec;--s1-ink:#202125;--s1-muted:#72747c;--s1-border:rgba(0,0,0,.09);--s1-accent:#ffd54a;--s1-green:#15803d;color:var(--s1-ink);font-family:Oxanium,system-ui,sans-serif;box-sizing:border-box}
.dark .s1-page,.dark .s1-inspector-dialog,[data-theme="dark"] .s1-page,[data-theme="dark"] .s1-inspector-dialog{--s1-bg:#101112;--s1-panel:#191b1d;--s1-subtle:#242629;--s1-ink:#f1f2f3;--s1-muted:#a0a3ab;--s1-border:rgba(255,255,255,.09);--s1-green:#86efac}
.s1-page *,.s1-inspector-dialog *{box-sizing:border-box}
.s1-page{min-height:calc(100dvh - var(--s1-page-top,0px));background:var(--s1-bg);padding-bottom:max(12px,env(safe-area-inset-bottom))}
.s1-page button,.s1-inspector-dialog button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.s1-page button:focus-visible,.s1-inspector-dialog button:focus-visible,.s1-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:4px}
.s1-main{width:100%;padding:16px 24px}
.s1-header{display:flex;align-items:center;gap:18px;padding:20px;background:var(--s1-panel);border:1px solid var(--s1-border);border-radius:22px}
.s1-icon-button{width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--s1-subtle)}
.s1-heading{flex:1;min-width:0}.s1-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--s1-muted)}
.s1-heading h1{font-size:clamp(24px,2.5vw,34px);line-height:1.1;margin:0;letter-spacing:-.035em}
.s1-heading>p:last-child{margin:8px 0 0;font-size:12px;color:var(--s1-muted);line-height:1.5}
.s1-total{display:flex;flex-direction:column;gap:7px;min-width:175px;max-width:260px;flex:1}
.s1-total strong{font-size:26px;line-height:1}.s1-total strong span{font-size:16px;font-weight:500;color:var(--s1-muted)}.s1-total>span{font-size:11px;color:var(--s1-muted)}
.s1-progress-track{height:5px;border-radius:8px;background:var(--s1-subtle);overflow:hidden}.s1-progress-track>div{height:100%;background:var(--s1-accent);border-radius:8px;transition:width .25s}
.s1-mode,.s1-filters{display:flex;padding:4px;gap:4px;border-radius:14px;background:var(--s1-subtle)}
.s1-mode button,.s1-filters button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:40px;white-space:nowrap;border-radius:11px;background:transparent;padding:9px 13px;font-size:12px;font-weight:600;color:var(--s1-muted)}
.s1-mode .is-active{background:var(--s1-accent);color:#27230f}.s1-filters .is-active{background:var(--s1-panel);color:var(--s1-ink);box-shadow:0 1px 5px #00000008}
.s1-rarities{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px;padding:14px 0}
.s1-rarities button{min-height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--s1-border);background:var(--s1-panel);border-radius:13px;padding:9px 12px;transition:background .15s,transform .15s}
.s1-rarities strong{font-size:14px}.s1-rarities button>span{font-size:11px;color:var(--s1-muted)}.s1-rarities .is-complete{color:var(--s1-green)}.s1-rarities .is-active{background:var(--s1-accent);border-color:transparent;color:#27230f}.s1-rarities .is-active>span{color:#5b4b15}
.s1-catalog{background:var(--s1-panel);border:1px solid var(--s1-border);border-radius:22px;padding:20px}
.s1-catalog-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.s1-catalog-header h2{font-size:20px;margin:0;letter-spacing:-.02em}.s1-catalog-header h2 span{font-size:11px;font-weight:500;color:var(--s1-muted);border:1px solid var(--s1-border);border-radius:8px;padding:4px 8px;margin-left:10px;vertical-align:middle}.s1-catalog-header p{margin:5px 0 0;font-size:12px;color:var(--s1-muted)}
.s1-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:18px 14px}.s1-grid-card{min-width:0}.s1-card-button{display:block;position:relative;width:100%;aspect-ratio:5/7;border-radius:8px!important;background:var(--s1-subtle);perspective:900px;transition:transform .18s,box-shadow .18s;box-shadow:0 3px 10px #0000000a;padding:0}
.s1-grid-model{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .4s}.s1-grid-face{position:absolute;inset:0;overflow:hidden;border-radius:8px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.1px)}.s1-grid-back{transform:rotateY(180deg) translateZ(.1px)}
.s1-grid-image{position:absolute;width:100%;height:100%;inset:0;object-fit:cover;object-position:center;transform:scale(1.035);user-select:none}.s1-grid-back-image{height:100%;top:0;transform:scale(1.035)}
.s1-owned-badge,.s1-inspect-badge{position:absolute;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:8px;background:#128347;color:#fff;top:7px;right:7px;pointer-events:none;box-shadow:0 2px 7px #00000020}.s1-inspect-badge{background:#151719d9;color:#fff;top:auto;bottom:7px;font-size:10px;padding:5px 7px}
.s1-card-caption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:9px 1px 0;font-size:clamp(9px,.8vw,11px);font-weight:500;color:var(--s1-muted);white-space:nowrap}.s1-owned-dot,.s1-missing-dot{width:5px;height:5px;flex-shrink:0;border-radius:5px;background:#22c55e}.s1-missing-dot{background:var(--s1-muted);opacity:.4}
.s1-empty{text-align:center;padding:45px 20px;color:var(--s1-muted);border:1px dashed var(--s1-border);border-radius:16px}.s1-empty>svg{margin:0 auto 10px}.s1-empty h3{font-size:16px;color:var(--s1-ink);margin:0 0 8px}.s1-empty p{font-size:13px;margin:0}.s1-empty button{margin-top:18px;padding:12px 18px;background:var(--s1-accent);color:#27230f;border-radius:12px;font-size:12px;font-weight:600}
.s1-inspector-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;--s1-inspector-top:100px;padding:calc(var(--s1-inspector-top) + env(safe-area-inset-top)) 16px max(12px,env(safe-area-inset-bottom));background:#05070bbd;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overscroll-behavior:contain}
.s1-inspector-dialog{width:min(100%,780px);height:min(700px,calc(100dvh - var(--s1-inspector-top) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));max-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto;overflow:hidden;overscroll-behavior:contain;background:var(--s1-panel);border:1px solid var(--s1-border);border-radius:22px;box-shadow:0 24px 100px #00000060;scrollbar-width:thin}
.s1-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.s1-inspector-header h2{font-size:clamp(14px,3vw,20px);margin:0;letter-spacing:-.02em}
.s1-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.s1-inspector-stage.is-dragging{cursor:grabbing}
.s1-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.s1-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;pointer-events:none}
.s1-card-edge{position:absolute;height:var(--s1-card-depth,6px);background:#fff;backface-visibility:visible;-webkit-backface-visibility:visible;pointer-events:none;transform-origin:center center}
.s1-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.s1-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(calc(var(--s1-card-depth,6px) / 2 + .1px))}.s1-card-back{transform:rotateY(180deg) translateZ(calc(var(--s1-card-depth,6px) / 2 + .1px))}
.s1-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.s1-front-image,.s1-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border-radius:inherit}.s1-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.s1-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.s1-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--s1-muted);text-align:center}.s1-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--s1-subtle);font-size:11px}
.s1-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.s1-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--s1-subtle);font-size:12px;font-weight:600}
.s1-inspector-controls button[aria-pressed="true"]{background:var(--s1-accent);color:#27230f}
.s1-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--s1-muted)}.s1-inspector-zoom input{width:min(220px,50%);accent-color:var(--s1-accent);cursor:pointer;touch-action:pan-x}.s1-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.s1-inspector-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--s1-border);padding:6px 16px}.s1-inspector-footer>span{font-size:11px;color:var(--s1-muted)}.s1-inspector-footer button{display:flex;align-items:center;gap:4px;min-height:40px;border-radius:11px;background:var(--s1-subtle);padding:8px 10px;font-size:11px}
.s1-certificate-seal{position:absolute;right:13%;bottom:11.5%;width:9.5%;aspect-ratio:1;border-radius:14%;overflow:hidden;isolation:isolate;background:#bbc2c8;box-shadow:0 .3px .8px #00000075;pointer-events:none}
.s1-certificate-seal.s1-seal-centered{right:auto;left:50%;bottom:1%;transform:translateX(-50%)}
.s1-seal-foil{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 7%,#e4f4ff65 7.3% 8.3%,transparent 8.6% 19%),repeating-linear-gradient(125deg,#f5f6f875 0 .8px,#7f8c9930 .8px 1.6px),linear-gradient(var(--s1-foil-angle,115deg),#d3d9dd 0%,#fafcfc 12%,#77838e 23%,#c1cbd3 33%,#eef4f7 41%,#505a66 49%,#c6d0d7 60%,#f5f8fa 68%,#88929b 80%,#dce1e5 92%,#f7f8f8 100%);background-size:100% 100%,100% 100%,240% 240%;background-position:center,center,var(--s1-foil-x,50%) var(--s1-foil-y,50%)}
.s1-seal-art{position:absolute;inset:0;width:100%;height:100%}
.s1-seal-letter-band{opacity:1}
.s1-seal-collection{opacity:var(--s1-collection-opacity,0)}
.s1-seal-certificate{opacity:var(--s1-cert-opacity,.55)}
.s1-seal-glint{position:absolute;inset:0;background:linear-gradient(var(--s1-foil-angle,115deg),transparent 25%,#c6efff18 36%,#ffffff60 48%,#ffe1ff16 57%,transparent 68%);background-size:230% 230%;background-position:var(--s1-foil-x,50%) var(--s1-foil-y,50%);opacity:.2}
@media(max-width:639px){body.s1-inspector-open [data-s1-inspector-navigation]{display:none!important}}
@media(max-width:600px){.s1-card-button{perspective:none;background:transparent;overflow:hidden;-webkit-mask-image:linear-gradient(#fff,#fff)}.s1-grid-model{transform:none!important;transform-style:flat;transition:none}.s1-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible;-webkit-mask-image:linear-gradient(#fff,#fff)}.s1-grid-back{display:none;transform:none}.s1-grid-model[data-show-back="true"]>.s1-grid-face:first-child{display:none}.s1-grid-model[data-show-back="true"]>.s1-grid-back{display:block}.s1-grid-back-image{left:0;width:100%}}
@media(hover:hover){.s1-card-button:hover{transform:translateY(-3px);box-shadow:0 7px 18px #00000018}.s1-rarities button:hover{transform:translateY(-1px)}.s1-icon-button:hover,.s1-inspector-controls button:hover{filter:brightness(.95)}}
@media(min-width:1800px){.s1-card-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}
@media(max-width:1000px){.s1-header{flex-wrap:wrap;gap:14px}.s1-heading{flex-basis:calc(100% - 60px)}.s1-total{max-width:none;min-width:120px}.s1-mode{flex-shrink:0}.s1-rarities{grid-template-columns:repeat(4,minmax(0,1fr))}.s1-card-grid{grid-template-columns:repeat(auto-fill,minmax(145px,1fr))}}
@media(max-width:600px){.s1-main{padding:10px 10px 0}.s1-header{padding:14px;border-radius:18px;gap:12px}.s1-heading h1{font-size:25px}.s1-heading>p:last-child{font-size:11px}.s1-total{flex-basis:100%;gap:6px}.s1-total strong{font-size:23px}.s1-mode{width:100%}.s1-mode button{flex:1}.s1-rarities{gap:6px;padding:10px 0}.s1-rarities button{padding:8px 6px;gap:7px;min-height:44px}.s1-rarities strong{font-size:12px}.s1-rarities button>span{font-size:10px}.s1-catalog{padding:12px;border-radius:18px}.s1-catalog-header{flex-wrap:wrap;gap:10px;margin-bottom:14px}.s1-catalog-header h2{font-size:17px}.s1-filters{width:100%}.s1-filters button{flex:1;min-height:36px;font-size:11px}.s1-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 8px}.s1-card-caption{font-size:8px;letter-spacing:-.04em}.s1-card-caption>span:first-child{overflow-wrap:anywhere;white-space:normal}.s1-owned-badge{top:5px;right:5px;padding:4px}.s1-inspect-badge{right:5px;bottom:5px;font-size:9px}.s1-inspector-overlay{--s1-inspector-top:94px;align-items:flex-start;padding-left:10px;padding-right:10px}.s1-inspector-dialog{border-radius:19px}.s1-inspector-header{padding:14px}.s1-inspector-controls{padding:6px 12px 12px;gap:6px}.s1-inspector-controls button{padding:10px 12px}.s1-inspector-status{font-size:11px}}
@media(max-height:600px){.s1-inspector-overlay{--s1-inspector-top:66px}.s1-inspector-header{padding:7px 12px}.s1-inspector-header .s1-eyebrow{display:none}.s1-inspector-header h2{font-size:14px}.s1-inspector-header .s1-icon-button{height:34px;width:34px}.s1-inspector-status{min-height:23px;font-size:10px;padding:2px 10px}.s1-inspector-controls{padding:3px 12px 6px}.s1-inspector-controls button{min-height:36px;min-width:36px;padding:7px 12px}.s1-inspector-footer{padding:3px 12px}.s1-inspector-footer button{min-height:34px;padding:5px 9px}}
@media(max-width:359px){.s1-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.s1-card-caption{font-size:9px}}
.s1-page .s1-grid-image,.s1-inspector-dialog .s1-face-image{inset:-2px;width:calc(100% + 4px);height:calc(100% + 4px);max-width:none;max-height:none;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border:0;border-radius:0}
.s1-page .s1-grid-back-image,.s1-inspector-dialog .s1-back-image{transform:scale(1.05)}
@media(prefers-reduced-motion:reduce){.s1-page *{transition:none!important}.s1-card-button:hover,.s1-rarities button:hover{transform:none}}
@media(hover:none) and (pointer:coarse){.s1-card-face{box-shadow:none;-webkit-mask-image:none;clip-path:none}.s1-card-ground{filter:none;background:transparent}.s1-inspector-overlay{backdrop-filter:none;-webkit-backdrop-filter:none}.s1-card-button{perspective:none;background:transparent;overflow:hidden}.s1-grid-model{transform:none!important;transform-style:flat;transition:none}.s1-grid-face{transform:none;backface-visibility:visible;-webkit-backface-visibility:visible}.s1-grid-back{display:none;transform:none}.s1-grid-model[data-show-back="true"]>.s1-grid-face:first-child{display:none}.s1-grid-model[data-show-back="true"]>.s1-grid-back{display:block}}

`;
const StarOne = () => {
const navigate = useNavigate();
const [flipped, setFlipped] = useState<Record<string, boolean>>({});
const [loaded, setLoaded] = useState(false);
const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
const update = () => {
            if (pageRef.current)
                pageRef.current.style.setProperty("--s1-page-top", `${pageRef.current.getBoundingClientRect().top + window.scrollY}px`);
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
const [selectedRarity, setSelectedRarity] = useState("SSR");
const [inspectKey, setInspectKey] = useState<string | null>(null);
const [filter, setFilter] = useState<"all" | "owned" | "missing">("all");
const set = { folder: "star-one", prefix: "S1", setId: "4", rarities: { SSR: 20, SCR: 18, UR: 18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 } };
const rarityNames: Record<string, string> = { SSR: "Super Spark Rare", SCR: "Sketch Rare", UR: "Ultra Rare", USR: "Ultra Special Rare", AR: "Art Rare", OR: "Origin Rare", BP: "Brilliant Print", SAR: "Shining Art Rare" };
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
        return { key, code: `MLPSE01-${getDisplayRarityCode(rarity)}-${String(number).padStart(3, "0")}`, front: cardImagePaths.ccg(set.folder, set.prefix, rarity, String(number).padStart(3, "0")), back: getCardBack(rarity, number) };
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
    return (<div ref={pageRef} className="s1-page">
      <style>{starOneStyles}</style>
      <main className="s1-main">
        <header className="s1-header">
          <button type="button" className="s1-icon-button" onClick={() => navigate("/collections")} aria-label="Back to collections"><ArrowLeft size={20}/></button>
          <div className="s1-heading"><p className="s1-eyebrow">Premium Collection</p><h1>Star One</h1><p>{viewMode ? "Choose a card to explore its front and back in 3D." : "Tap a card to mark it owned or missing."}</p></div>
          <div className="s1-total"><strong>{collected}<span> / {total}</span></strong><span>{total - collected} still to collect</span><div className="s1-progress-track" role="progressbar" aria-label="Star One collection completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }}/></div></div>
          <div className="s1-mode" role="group" aria-label="Card interaction mode">
            <button type="button" aria-pressed={!viewMode} className={!viewMode ? "is-active" : ""} onClick={() => setViewMode(false)}><Check size={16}/>Collect</button>
            <button type="button" aria-pressed={viewMode} className={viewMode ? "is-active" : ""} onClick={() => setViewMode(true)}><Box size={16}/>Inspect in 3D</button>
          </div>
        </header>
        <nav className="s1-rarities" aria-label="Card rarity">
          {Object.entries(set.rarities).map(([rarity, count]) => {
const owned = cards.filter(card => card.rarity === rarity && flipped[`${rarity}-${card.number}`]).length;
            return <button type="button" key={rarity} aria-pressed={selectedRarity === rarity} className={`${selectedRarity === rarity ? "is-active" : ""} ${owned === count ? "is-complete" : ""}`} onClick={() => setSelectedRarity(rarity)}><strong>{getDisplayRarityCode(rarity)}</strong><span>{owned}/{count}</span>{owned === count && <Check size={13}/>}</button>;
        })}
        </nav>
        <section className="s1-catalog" aria-label={`${selectedRarity} cards`}>
          <div className="s1-catalog-header"><div><h2>{rarityNames[selectedRarity]}<span>{getDisplayRarityCode(selectedRarity)}</span></h2><p>{rarityCollected} of {rarityCards.length} collected</p></div><div className="s1-filters" role="group" aria-label="Filter cards">{(["all", "missing", "owned"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All cards" : value === "owned" ? "Owned" : "Missing"}</button>)}</div></div>
          {visibleCards.length === 0 ? <div className="s1-empty"><Check size={24}/><h3>{filter === "missing" ? "This rarity is complete" : "No owned cards here yet"}</h3><p>{filter === "missing" ? "Every card in this rarity is in your collection." : "Switch to All cards to start tracking your collection."}</p><button type="button" onClick={() => setFilter("all")}>Show all cards</button></div> : <div className="s1-card-grid">{visibleCards.map(card => {
const key = `${card.rarity}-${card.number}`;
const owned = !!flipped[key];
const code = `MLPSE01-${getDisplayRarityCode(card.rarity)}-${String(card.number).padStart(3, "0")}`;
                return <article key={key} className={`s1-grid-card ${owned ? "is-owned" : ""}`}>
              <button type="button" className="s1-card-button" onClick={() => toggleCard(key)} aria-label={viewMode ? `Inspect ${code} in 3D` : `${code}, ${owned ? "owned. Mark missing" : "missing. Mark owned"}`} aria-pressed={viewMode ? undefined : owned}>
                <div className="s1-grid-model" data-show-back={!viewMode && owned} style={{ transform: !viewMode && owned ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  <div className="s1-grid-face"><CardImage visible={loaded && (viewMode || !owned)} src={cardImagePaths.ccg(set.folder, set.prefix, card.rarity, String(card.number).padStart(3, "0"))} className="s1-grid-image" draggable={false} alt={code}/></div>
                  <div className="s1-grid-face s1-grid-back"><div className="s1-back-art"><CardImage visible={loaded && !viewMode && owned} src={getCardBack(card.rarity, card.number)} className="s1-grid-image s1-grid-back-image" draggable={false} alt={`${code} back`}/></div>{hasSilverStamp(key) && <CertificateSeal centered={hasCenteredStamp(key)}/>}</div>
                </div>
                {owned && <span className="s1-owned-badge"><Check size={13}/><span className="sr-only">Owned</span></span>}
                {viewMode && <span className="s1-inspect-badge"><Box size={13}/>3D</span>}
              </button>
              <div className="s1-card-caption"><span>{code}</span><span className={owned ? "s1-owned-dot" : "s1-missing-dot"} aria-label={owned ? "Owned" : "Missing"}/></div>
            </article>;
            })}</div>}
        </section>
      </main>
      {inspectKey && <CardInspector card={getInspection(inspectKey)} onClose={closeInspector} onPrevious={() => stepInspection(-1)} onNext={() => stepInspection(1)}/>}
    </div>);
};
export default StarOne;
