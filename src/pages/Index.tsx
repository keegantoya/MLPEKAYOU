import { ListingWarningGate } from "@/components/ListingModerationWarnings";
import CardImage from "@/components/CardImage";
import React, { useEffect, useRef, useState, useId, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { getStarOneBack, cardImagePaths } from "@/lib/card-images";
import { RotateCcw, RotateCw, Move } from "lucide-react";
import LGSApplications from "@/pages/Pop-Ups/LGSApplications";
const homepageSampleCard = {
    key: "SAR-1",
    code: "MLPSE01-\u25c7AR-001",
    front: cardImagePaths.ccg("star-one", "S1", "SAR", "001"),
    back: getStarOneBack("SAR", 1),
};
type Quaternion = [
    number,
    number,
    number,
    number
];
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
    return Math.min(440, 2 * radius / Math.hypot(1, aspect, .022));
};
function CertificateSeal({ centered = false }: { centered?: boolean }) {
    const id = useId().replace(/:/g, "");
    return <span className={`home3d-certificate-seal${centered ? " home3d-seal-centered" : ""}`} aria-hidden="true">
        <span className="home3d-seal-foil"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="home3d-seal-art" focusable="false">
            <defs>
                <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6f8f9"/><stop offset=".23" stopColor="#bdc4ca"/><stop offset=".46" stopColor="#edf0f2"/><stop offset=".7" stopColor="#a6afb6"/><stop offset="1" stopColor="#eef2f4"/>
                </linearGradient>
                <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" style={{ stopColor: "hsl(calc(165 + var(--home3d-foil-hue,0)), 88%, 68%)" }}/><stop offset=".25" style={{ stopColor: "hsl(calc(85 + var(--home3d-foil-hue,0)), 90%, 65%)" }}/><stop offset=".5" style={{ stopColor: "hsl(calc(48 + var(--home3d-foil-hue,0)), 100%, 62%)" }}/><stop offset=".75" style={{ stopColor: "hsl(calc(22 + var(--home3d-foil-hue,0)), 95%, 70%)" }}/><stop offset="1" style={{ stopColor: "hsl(calc(265 + var(--home3d-foil-hue,0)), 90%, 80%)" }}/>
                </linearGradient>
                <pattern id={`${id}-dots`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <path d="M1.2 .3 L2 1.2 L1.2 2.1 L.4 1.2 Z" fill="#e6eef4" fillOpacity=".65"/>
                </pattern>
            </defs>
            <g>
                <path d="M0 0H100V100H0Z" fill={`url(#${id}-dots)`} opacity=".42"/>
                <path className="home3d-seal-letter-band" d="M-2-2H27V102H-2Z" fill="#19252f"/>
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
                    <text className="home3d-seal-certificate" y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("CERTIFICATE").map((letter, index) => <tspan key={index} x={16 + index * 6.8}>{letter}</tspan>)}</text>
                    <g className="home3d-seal-collection">
                        <text y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("COLLECTION").map((letter, index) => <tspan key={index} x={16 + index * (68 / 9)}>{letter}</tspan>)}</text>
                    </g>
                </g>
            </g>
        </svg>
        <span className="home3d-seal-glint"/>
    </span>;
}
function SilverStampShowcase({ isLightMode }: { isLightMode: boolean }) {
    const [paused, setPaused] = useState(false);
    return <aside className="home-stamp-showcase" data-paused={paused} aria-labelledby="silver-stamp-heading">
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>A closer look</p>
        <h2 id="silver-stamp-heading" className="mt-1 text-lg font-bold">The silver stamp</h2>
        <div className="home-stamp-display" role="img" aria-label="Silver Kayou stamp, alternating between COLLECTION and CERTIFICATE in the same position">
            <CertificateSeal />
        </div>
        <p className={`text-sm leading-6 ${isLightMode ? "text-zinc-700" : "text-zinc-300"}`}>Built entirely in HTML code with SVG and CSS, the stamp is a 3D model that responds to the direction you drag the card.</p>
        <p className={`mt-2 text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>Horizontal movement reveals COLLECTION. Vertical movement reveals CERTIFICATE. This stationary preview flashes between the two. I did not have a good image of the Kayou China logo, so I changed it for the demo!</p>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)} className={`mt-3 min-h-11 rounded-xl border px-3 text-xs font-semibold ${isLightMode ? "border-black/10" : "border-white/15"}`}>{paused ? "Resume stamp preview" : "Pause stamp preview"}</button>
    </aside>;
}
function HomepageCardDemo({ isLightMode }: { isLightMode: boolean }) {
    const card = homepageSampleCard;
    const aspect = 5 / 7;
    const pan = useRef({ x: 0, y: 0 });
    const rotation = useRef<Quaternion>([0, 0, 0, 1]);
    const model = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
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
            model.current.style.setProperty("--home3d-foil-x", `${light.x}%`);
            model.current.style.setProperty("--home3d-foil-y", `${light.y}%`);
            model.current.style.setProperty("--home3d-foil-angle", `${light.angle}deg`);
            model.current.style.setProperty("--home3d-foil-hue", String(light.hue));
            model.current.style.setProperty("--home3d-cert-opacity", String(light.certificate));
            model.current.style.setProperty("--home3d-collection-opacity", String(light.collection));
            model.current.style.setProperty("--home3d-silver-brightness", String(light.brightness));
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
                model.current.style.setProperty("--home3d-card-depth", `${height * .022}px`);
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
    return <div className="home3d-inspector-dialog home-card-demo" data-home-theme={isLightMode ? "light" : "dark"}>
        <header className="home3d-inspector-header">
          <div><p className="home3d-eyebrow">Star 1 - Premium Thick Card</p><h2>{card.code}</h2></div>
          <span className="home-demo-badge">Live 3D</span>
        </header>
        <div ref={stage} tabIndex={0} role="group" aria-label={`${dragMode === "move" ? "Move card to inspect any area" : "Rotate card"}. Drag or use arrow keys. Press R to reset.`} className={`home3d-inspector-stage ${dragging ? "is-dragging" : ""}`} onKeyDown={handleKey} onPointerDown={event => {
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
          <div className="home3d-card-ground"/>
          <div ref={model} className="home3d-card-model">
            {Array.from({ length: 33 }, (_, index) => <div key={index} aria-hidden="true" className="home3d-card-core" style={{ transform: `translateZ(calc(var(--home3d-card-depth,6px) * ${(index / 32 - .5).toFixed(5)}))` }}/>) }
            <div className="home3d-card-face home3d-card-front">
              <CardImage key={`${card.front}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.front} draggable={false} alt={`${card.code} front`} className="home3d-face-image home3d-front-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.front]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.front]: "error" }))}/>
              <div className="home3d-card-sheen"/>
            </div>
            <div className="home3d-card-face home3d-card-back">
              <div className="home3d-back-art">
              <CardImage key={`${card.back}-${imageRetry}`} imageSize="original" visible={true} loading="eager" src={card.back} draggable={false} alt={`${card.code} back`} className="home3d-face-image home3d-back-image" onLoad={() => setImageStatus(previous => ({ ...previous, [card.back]: "loaded" }))} onError={() => setImageStatus(previous => ({ ...previous, [card.back]: "error" }))}/>
              <div className="home3d-card-sheen"/>
              </div>
              <CertificateSeal centered/>
            </div>
          </div>
        </div>
        <div role="status" className="home3d-inspector-status">{imageFailed ? <><span>Card image unavailable.</span><button type="button" onClick={() => { setImageStatus(previous => { const next = { ...previous }; delete next[card.front]; delete next[card.back]; return next; }); setImageRetry(value => value + 1); }}>Retry images</button></> : !imagesReady ? "Loading the front and back..." : <><Move size={14}/><span>{dragMode === "move" ? "Drag to inspect any area of the card" : "Drag to rotate in any direction"}</span></>}</div>
        <div className="home3d-inspector-controls">
          <button type="button" onClick={() => applyRotation([0, 0, 0, 1])}>Front</button>
          <button type="button" onClick={() => applyRotation([0, 1, 0, 0])}>Back</button>
          <button type="button" onClick={() => turn(0, 0, 1, -Math.PI / 6)} aria-label="Roll card counterclockwise"><RotateCcw size={17}/></button>
          <button type="button" onClick={() => turn(0, 0, 1, Math.PI / 6)} aria-label="Roll card clockwise"><RotateCw size={17}/></button>
          <button type="button" onClick={resetView}>Reset</button>
          <button type="button" aria-pressed={dragMode === "move"} onClick={() => setDragMode(value => value === "move" ? "rotate" : "move")}>{dragMode === "move" ? "Switch to Zoom" : "Switch to Reposition"}</button>
          <label className="home3d-inspector-zoom"><span>Zoom</span><input type="range" min="100" max="400" step="5" value={Math.round(zoom * 100)} onChange={event => changeZoom(Number(event.target.value) / 100)} aria-label="Card zoom" aria-valuetext={`${Math.round(zoom * 100)} percent`}/><output>{Math.round(zoom * 100)}%</output></label>
        </div>
    </div>;
}
const homepageDemoStyles = `
.home3d-inspector-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}.home3d-inspector-header h2{font-size:clamp(12px,2vw,16px);margin:0;letter-spacing:-.02em}
.home3d-inspector-stage{position:relative;height:auto;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;perspective:1000px;perspective-origin:50% 50%;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;background:radial-gradient(ellipse at 50% 44%,#bda05a14,transparent 65%);border-radius:18px;margin:0 10px;isolation:isolate}.home3d-inspector-stage.is-dragging{cursor:grabbing}
.home3d-back-art{position:absolute;inset:0;border-radius:inherit;transform-origin:50% 50%}
.home3d-card-model{position:relative;height:0;aspect-ratio:5/7;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}
.home3d-card-core{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:#fff;border:0;backface-visibility:visible;-webkit-backface-visibility:visible;pointer-events:none}
.home3d-card-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;background:transparent}.home3d-card-face{transform-style:flat;isolation:isolate;overflow:hidden;clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff);backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 9px 26px #00000024;transform:translateZ(calc(var(--home3d-card-depth,6px) / 2 + .1px))}.home3d-card-back{transform:rotateY(180deg) translateZ(calc(var(--home3d-card-depth,6px) / 2 + .1px))}
.home3d-face-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;-webkit-user-drag:none}.home3d-front-image,.home3d-back-image{display:block;max-width:none;max-height:none;margin:0;padding:0;border:0;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border-radius:inherit}.home3d-card-sheen{position:absolute;inset:0;background:linear-gradient(125deg,#ffffff0c,transparent 45%,#ffffff08);pointer-events:none;border-radius:inherit}.home3d-card-ground{position:absolute;bottom:4%;left:30%;right:30%;height:15px;border-radius:50%;background:#0000001a;filter:blur(13px);pointer-events:none}
.home3d-inspector-status{display:flex;align-items:center;justify-content:center;gap:7px;min-height:28px;padding:4px 12px;font-size:12px;color:var(--home3d-muted);text-align:center}.home3d-inspector-status button{padding:5px 9px;border-radius:8px;background:var(--home3d-subtle);font-size:11px}
.home3d-inspector-controls{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 16px 10px}.home3d-inspector-controls button{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;padding:10px 15px;border-radius:12px;background:var(--home3d-subtle);font-size:12px;font-weight:600}
.home3d-inspector-controls button[aria-pressed="true"]{background:var(--home3d-accent);color:#27230f}
.home3d-inspector-zoom{display:flex;align-items:center;justify-content:center;gap:10px;flex-basis:100%;min-height:28px;font-size:11px;color:var(--home3d-muted)}.home3d-inspector-zoom input{width:min(220px,50%);accent-color:var(--home3d-accent);cursor:pointer;touch-action:pan-x}.home3d-inspector-zoom output{min-width:36px;text-align:right;font-variant-numeric:tabular-nums}
.home3d-certificate-seal{position:absolute;right:13%;bottom:11.5%;width:9.5%;aspect-ratio:1;border-radius:14%;overflow:hidden;isolation:isolate;background:#bbc2c8;box-shadow:0 .3px .8px #00000075;pointer-events:none}
.home3d-certificate-seal.home3d-seal-centered{right:auto;left:50%;bottom:1%;transform:translateX(-50%)}
.home3d-seal-foil{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 7%,#e4f4ff65 7.3% 8.3%,transparent 8.6% 19%),repeating-linear-gradient(125deg,#f5f6f875 0 .8px,#7f8c9930 .8px 1.6px),linear-gradient(var(--home3d-foil-angle,115deg),#d3d9dd 0%,#fafcfc 12%,#77838e 23%,#c1cbd3 33%,#eef4f7 41%,#505a66 49%,#c6d0d7 60%,#f5f8fa 68%,#88929b 80%,#dce1e5 92%,#f7f8f8 100%);background-size:100% 100%,100% 100%,240% 240%;background-position:center,center,var(--home3d-foil-x,50%) var(--home3d-foil-y,50%)}
.home3d-seal-art{position:absolute;inset:0;width:100%;height:100%}
.home3d-seal-letter-band{opacity:1}
.home3d-seal-collection{opacity:var(--home3d-collection-opacity,0)}
.home3d-seal-certificate{opacity:var(--home3d-cert-opacity,.55)}
.home3d-seal-glint{position:absolute;inset:0;background:linear-gradient(var(--home3d-foil-angle,115deg),transparent 25%,#c6efff18 36%,#ffffff60 48%,#ffe1ff16 57%,transparent 68%);background-size:230% 230%;background-position:var(--home3d-foil-x,50%) var(--home3d-foil-y,50%);opacity:.2}
.home3d-inspector-dialog .home3d-face-image{inset:-2px;width:calc(100% + 4px);height:calc(100% + 4px);max-width:none;max-height:none;object-fit:cover;object-position:50% 50%;transform:scale(1.035);transform-origin:50% 50%;border:0;border-radius:0}
.home3d-inspector-dialog .home3d-back-image{transform:scale(1.05)}
.home-card-demo{--home3d-panel:#181818;--home3d-subtle:#282828;--home3d-ink:#fff;--home3d-muted:#a1a1aa;--home3d-border:rgba(255,255,255,.1);--home3d-accent:#ffd54a;color:var(--home3d-ink);width:100%;min-width:0;background:var(--home3d-panel);border:1px solid var(--home3d-border);border-radius:24px;overflow:hidden;box-shadow:0 20px 65px #00000018}
.home-card-demo[data-home-theme="light"]{--home3d-panel:#fff;--home3d-subtle:#f3f2ee;--home3d-ink:#18181b;--home3d-muted:#71717a;--home3d-border:rgba(0,0,0,.1)}
.home-card-demo *{box-sizing:border-box}
.home-card-demo button{font:inherit;cursor:pointer;color:inherit;border:0;touch-action:manipulation}
.home-card-demo button:focus-visible,.home-card-demo input:focus-visible,.home-card-demo .home3d-inspector-stage:focus-visible{outline:2px solid #c99a00;outline-offset:2px}
.home-card-demo .home3d-eyebrow{margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--home3d-muted)}
.home-card-demo .home3d-inspector-header{padding:12px 16px}
.home-demo-badge{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--home3d-ink);background:var(--home3d-subtle);border-radius:20px;padding:7px 10px}
.home-card-demo .home3d-inspector-stage{height:300px;margin:0 10px;background:radial-gradient(ellipse at center,#d4ad4820,transparent 70%)}
.home-card-demo .home3d-inspector-controls{padding:6px 12px 12px}
.home-card-demo .home3d-inspector-controls button{font-size:11px;padding:9px 12px}
.home-card-demo .home3d-inspector-zoom{padding-top:5px}
@media(max-width:639px){.home-card-demo .home3d-inspector-stage{height:270px}.home-card-demo .home3d-inspector-header{padding:14px 16px}.home-card-demo .home3d-inspector-controls{gap:6px;padding:8px 10px 14px}.home-card-demo .home3d-inspector-controls button{padding:9px 10px}.home-card-demo .home3d-inspector-status{font-size:11px}}
.home-stamp-showcase{min-width:0;align-self:center}
.home-stamp-display{position:relative;width:140px;height:140px;margin:20px auto 22px;perspective:1000px;--home3d-foil-angle:115deg;--home3d-foil-hue:0}
.home-stamp-display .home3d-certificate-seal{inset:0;width:100%;height:100%;transform:none;box-shadow:0 8px 24px #00000020}
.home-stamp-display .home3d-seal-certificate{animation:homeStampCertificate 4s linear infinite}
.home-stamp-display .home3d-seal-collection{animation:homeStampCollection 4s linear infinite}
.home-stamp-showcase[data-paused="true"] .home3d-seal-certificate,.home-stamp-showcase[data-paused="true"] .home3d-seal-collection{animation-play-state:paused}
@keyframes homeStampCertificate{0%,44%{opacity:1}49%,94%{opacity:0}99%,100%{opacity:1}}
@keyframes homeStampCollection{0%,44%{opacity:0}49%,94%{opacity:1}99%,100%{opacity:0}}
@media(max-width:1023px){.home-stamp-showcase{display:grid;grid-template-columns:140px minmax(0,1fr);column-gap:20px;padding-top:4px}.home-stamp-display{grid-column:1;grid-row:1 / span 5;margin:0}.home-stamp-showcase>p,.home-stamp-showcase>h2,.home-stamp-showcase>button{grid-column:2}.home-stamp-showcase>button{justify-self:start}}
@media(max-width:399px){.home-stamp-showcase{grid-template-columns:100px minmax(0,1fr);column-gap:14px}.home-stamp-display{width:100px;height:100px}.home-stamp-showcase>p:not(:first-child){grid-column:1 / -1;margin-top:12px}.home-stamp-showcase>button{grid-column:1 / -1}.home-stamp-display{grid-row:1 / span 2}}
@media(prefers-reduced-motion:reduce){.home-stamp-display .home3d-seal-certificate,.home-stamp-display .home3d-seal-collection{animation-duration:8s;animation-timing-function:steps(1,end)}}

`;

type Announcement = {
  label: string;
  date: string;
  title: string;
  body: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
  tone: "featured" | "warning" | "standard";
};
type CommunityReference = {
  title: string;
  href: string;
  description: string;
  image?: string;
  imageClass?: string;
};
const discordHref = "https://discord.gg/mlpekayou";
const redditHref = "https://www.reddit.com/r/MLPEKAYOU/s/L6kDyhN2aP";
function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
const announcements: Announcement[] = [
  {
    label: "Website update",
    date: "September 17, 2026",
    title: "MLPEKAYOU is Underfunded",
    body: "This database is entirely free to users and features no paywalls or advertisements. As it gets bigger and bigger, it becomes extremely hard to keep funded.",
    detail: "Typically, streaming for StonesTradingCo covers the costs. This last two months has, however, been a huge dry spell in products. I have not been paid in a while, but that doesn't stop the website from needing funding. StonesTradingCo sends me commission based on my sales, which goes to the website.",
    actionLabel: "Shop through Keegan",
    actionHref: "https://stonestradingco.com/collections/my-little-pony",
    tone: "featured",
  },
  {
    label: "Accessibility update",
    date: "August 26, 2026",
    title: "A simpler, more accessible MLPEKAYOU",
    body: "The website interface was rebuilt to be easier to navigate and more accessible for hard-of-sight and disabled collectors.",
    detail: "Light and dark themes are now supported throughout the website, with clearer spacing, simpler controls, and better readability.",
    tone: "standard",
  },
  {
    label: "Domain update",
    date: "August 11, 2026",
    title: "MLPEKAYOU is still MLPEKAYOU",
    body: "A copyright strike caused several hours of downtime and forced a temporary domain change. No user information was affected.",
    detail: "The rights to mlpekayou.com were returned to Keegan, and the original domain now redirects visitors to the active MLPEKAYOU website.",
    tone: "warning",
  },
  {
    label: "Account maintenance",
    date: "August 10, 2026",
    title: "Inactive account cleanup",
    body: "Accounts at least 30 days old with no collection progress, along with accounts that never confirmed their email address, were permanently removed.",
    detail: "If a confirmation or password-reset link does not work, mark the email as trusted and refresh the page before opening it again. Gmail is especially likely to interfere with these messages.",
    tone: "standard",
  },
];
const references: CommunityReference[] = [
  {
    title: "PonyRec",
    href: "https://www.ponyrec.net/",
    image: "/website-assets/ponyreclogo.webp",
    imageClass: "max-h-24 w-full object-contain",
    description: "Deck building, TCG mechanics, competitive play, and other gameplay resources created by Tangent.",
  },
  {
    title: "Doodle Binder",
    href: "https://www.doodlebinder.com/",
    image: "/website-assets/binder1custom.webp",
    imageClass: "h-full min-h-32 w-full object-cover object-center",
    description: "Individually customized binders made by Eternal using acrylic paint, mixed materials, and hand-finished artwork.",
  },
  {
    title: "Stones Trading Co",
    href: "https://stonestradingco.com/collections/my-little-pony",
    description: "Shop English Kayou products through Keegan and help support MLPEKAYOU at no additional cost.",
  },
  {
    title: "PakraCards",
    href: "https://pakracards.com",
    description: "A trusted Kayou CN shop run by Amber and Hao, offering singles, sealed products, live rips, and collectibles.",
  },
];
export default function Index() {
const [showLGSApplication, setShowLGSApplication] = useState(false);
const [activeAnnouncement, setActiveAnnouncement] = useState(0);
const [announcementDirection, setAnnouncementDirection] = useState<"forward" | "backward">("forward");
const [outgoingAnnouncement, setOutgoingAnnouncement] = useState<number | null>(null);
const [isAnnouncementTransitioning, setIsAnnouncementTransitioning] = useState(false);
const announcementTimer = useRef<number | null>(null);
const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
const syncTheme = () => setIsLightMode(document.documentElement.dataset.theme === "light");
const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    return () => {
      if (announcementTimer.current !== null) window.clearTimeout(announcementTimer.current);
    };
  }, []);
const announcement = announcements[activeAnnouncement];
const changeAnnouncement = (index: number, direction: "forward" | "backward") => {
    if (index === activeAnnouncement || isAnnouncementTransitioning) return;
    setOutgoingAnnouncement(activeAnnouncement);
    setAnnouncementDirection(direction);
    setActiveAnnouncement(index);
    setIsAnnouncementTransitioning(true);
    if (announcementTimer.current !== null) window.clearTimeout(announcementTimer.current);
    announcementTimer.current = window.setTimeout(() => {
      setOutgoingAnnouncement(null);
      setIsAnnouncementTransitioning(false);
      announcementTimer.current = null;
    }, 560);
  };
const previousAnnouncement = () => changeAnnouncement(activeAnnouncement === 0 ? announcements.length - 1 : activeAnnouncement - 1, "backward");
const nextAnnouncement = () => changeAnnouncement(activeAnnouncement === announcements.length - 1 ? 0 : activeAnnouncement + 1, "forward");
const openAnnouncement = (index: number) => changeAnnouncement(index, index > activeAnnouncement ? "forward" : "backward");
const pageBg = isLightMode ? "bg-[#f6f4ee] text-zinc-900" : "bg-[#111111] text-white";
const surface = isLightMode
    ? "border-black/10 bg-white text-zinc-900 shadow-[0_12px_35px_rgba(75,58,18,0.08)]"
    : "border-white/10 bg-[#181818] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)]";
const muted = isLightMode ? "text-zinc-600" : "text-zinc-400";
const bodyText = isLightMode ? "text-zinc-700" : "text-zinc-300";
const accentText = isLightMode ? "text-[#765d12]" : "text-[#E7C84B]";
const getAnnouncementSurface = (item: Announcement) => item.tone === "featured"
    ? isLightMode
      ? "border-[#D3AE18]/60 bg-gradient-to-br from-white via-white to-[#fff4bd]"
      : "border-[#E7C84B]/60 bg-gradient-to-br from-[#25200d] via-[#181818] to-[#111111]"
    : item.tone === "warning"
      ? isLightMode
        ? "border-red-300 bg-gradient-to-br from-white to-red-50"
        : "border-red-500/35 bg-gradient-to-br from-[#211616] to-[#181818]"
      : surface;
const renderAnnouncementCard = (item: Announcement, index: number, phase: "incoming" | "outgoing" | "sizing") => {
const motionClass = phase === "sizing" ? "" : phase === "incoming"
      ? announcementDirection === "forward" ? "mlpekayou-announcement-enter-forward" : "mlpekayou-announcement-enter-backward"
      : announcementDirection === "forward" ? "mlpekayou-announcement-exit-forward" : "mlpekayou-announcement-exit-backward";
    return (
      <article
        key={`${phase}-${index}-${announcementDirection}`}
        aria-live={phase === "incoming" ? "polite" : undefined}
        aria-hidden={phase !== "incoming" ? "true" : undefined}
        className={`relative flex [grid-area:1/1] flex-col justify-center overflow-hidden rounded-3xl border p-5 sm:p-7 ${getAnnouncementSurface(item)} ${motionClass} ${phase === "incoming" ? "z-10" : phase === "sizing" ? "invisible pointer-events-none z-0" : "pointer-events-none z-0"}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E7C84B]/15 blur-3xl" />
        <div className={`relative ${item.title === "MLPEKAYOU is Underfunded" ? "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.78fr)] md:gap-8" : ""}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`text-sm font-semibold ${item.tone === "warning" ? "text-red-500" : accentText}`}>{item.label}</span>
              <time className={`text-xs ${muted}`}>{item.date}</time>
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h3>
            <p className={`mt-4 max-w-4xl text-[15px] leading-7 ${bodyText}`}>{item.body}</p>
            <p className={`mt-3 max-w-4xl text-sm leading-6 ${muted}`}>{item.detail}</p>
            {item.actionHref && item.actionLabel && (
              <a href={item.actionHref} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E7C84B] px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477]">
                {item.actionLabel}<ExternalLinkIcon />
              </a>
            )}
          </div>
          {item.title === "MLPEKAYOU is Underfunded" && (
            <div className={`w-full rounded-2xl border p-4 ${isLightMode ? "border-[#D3AE18]/45 bg-white/80 text-zinc-950" : "border-[#E7C84B]/35 bg-black/20 text-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-[#E7C84B] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#111111]">At checkout</span>
                  <h4 className="mt-2 text-base font-black tracking-tight sm:text-lg">Select MLPEKAYOU</h4>
                </div>
                <span className={`pt-1 text-[9px] font-bold uppercase tracking-wide ${muted}`}>Required</span>
              </div>
              <p className={`mt-2 text-xs leading-5 ${muted}`}>Under "Where did you hear about us?"</p>
              <div className="relative mt-3 h-40">
                <div className={`relative flex min-h-12 items-center justify-between rounded-xl border-2 border-[#E7C84B] px-3 ${isLightMode ? "bg-[#fffdf3]" : "bg-[#17160f]"}`}>
                  <span className={`checkout-placeholder absolute left-3 text-sm font-semibold ${muted}`}>Select an option</span>
                  <span className="checkout-selected absolute left-3 text-sm font-black tracking-wide">MLPEKAYOU</span>
                  <span aria-hidden="true" className="checkout-chevron ml-auto h-2.5 w-2.5 border-b-2 border-r-2 border-current" />
                </div>
                <div className={`checkout-menu pointer-events-none absolute left-0 right-0 top-14 z-10 overflow-hidden rounded-xl border shadow-xl ${isLightMode ? "border-zinc-200 bg-white" : "border-white/15 bg-[#171717]"}`}>
                  <div className={`px-3 py-1.5 text-xs font-semibold ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>TikTok</div>
                  <div className={`border-t px-3 py-1.5 text-xs font-semibold ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>Discord</div>
                  <div className={`checkout-option border-t px-3 py-2 text-xs font-black ${isLightMode ? "border-zinc-200" : "border-white/10"}`}>MLPEKAYOU</div>
                  <span aria-hidden="true" className="checkout-cursor absolute right-5 top-1 h-5 w-3.5 bg-[#E7C84B] shadow-md [clip-path:polygon(0_0,0_100%,28%_73%,45%_100%,58%_93%,42%_67%,74%_67%)]" />
                </div>
                <div className="checkout-confirmation absolute inset-x-0 top-16 rounded-xl border border-[#E7C84B]/50 bg-[#E7C84B]/10 px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.1em]">MLPEKAYOU selected - order credited</div>
              </div>
              <p className={`mt-1 text-center text-[10px] font-semibold leading-4 ${muted}`}>Other choices do not credit MLPEKAYOU.</p>
            </div>
          )}
        </div>
      </article>
    );
  };
  return (
    <>
      <ListingWarningGate />
      <style>{homepageDemoStyles}</style>
      <style>{`
        @keyframes mlpekayouAnnouncementEnterForward {
          from { opacity: 0; transform: translate3d(46px, 0, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes mlpekayouAnnouncementExitForward {
          from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          to { opacity: 0; transform: translate3d(-46px, 0, 0) scale(0.985); }
        }
        @keyframes mlpekayouAnnouncementEnterBackward {
          from { opacity: 0; transform: translate3d(-46px, 0, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes mlpekayouAnnouncementExitBackward {
          from { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          to { opacity: 0; transform: translate3d(46px, 0, 0) scale(0.985); }
        }
        .mlpekayou-announcement-enter-forward { animation: mlpekayouAnnouncementEnterForward 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mlpekayou-announcement-exit-forward { animation: mlpekayouAnnouncementExitForward 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mlpekayou-announcement-enter-backward { animation: mlpekayouAnnouncementEnterBackward 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mlpekayou-announcement-exit-backward { animation: mlpekayouAnnouncementExitBackward 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes checkoutMenu {
          0%, 12%, 78%, 100% { opacity: 0; transform: translateY(-6px); visibility: hidden; }
          18%, 70% { opacity: 1; transform: translateY(0); visibility: visible; }
        }
        @keyframes checkoutCursor {
          0%, 20% { opacity: 0; transform: translate(24px, -8px); }
          26% { opacity: 1; transform: translate(24px, -8px); }
          50%, 62% { opacity: 1; transform: translate(0, 58px); }
          70%, 100% { opacity: 0; transform: translate(0, 58px); }
        }
        @keyframes checkoutOption {
          0%, 46% { background-color: transparent; }
          53%, 100% { background-color: rgba(231, 200, 75, 0.34); }
        }
        @keyframes checkoutPlaceholder { 0%, 68% { opacity: 1; } 74%, 100% { opacity: 0; } }
        @keyframes checkoutSelected { 0%, 68% { opacity: 0; } 76%, 100% { opacity: 1; } }
        @keyframes checkoutConfirmation {
          0%, 74% { opacity: 0; transform: translateY(6px); }
          82%, 96% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes checkoutChevron { 0%, 12%, 78%, 100% { transform: rotate(45deg); } 18%, 70% { transform: rotate(225deg); } }
        .checkout-menu { animation: checkoutMenu 6s ease-in-out infinite; }
        .checkout-cursor { animation: checkoutCursor 6s ease-in-out infinite; }
        .checkout-option { animation: checkoutOption 6s ease-in-out infinite; }
        .checkout-placeholder { animation: checkoutPlaceholder 6s ease-in-out infinite; }
        .checkout-selected { animation: checkoutSelected 6s ease-in-out infinite; }
        .checkout-confirmation { animation: checkoutConfirmation 6s ease-in-out infinite; }
        .checkout-chevron { animation: checkoutChevron 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mlpekayou-announcement-enter-forward, .mlpekayou-announcement-exit-forward,
          .mlpekayou-announcement-enter-backward, .mlpekayou-announcement-exit-backward { animation: none; }
          .checkout-menu, .checkout-cursor, .checkout-placeholder { display: none; animation: none; }
          .checkout-option, .checkout-selected, .checkout-confirmation { animation: none; opacity: 1; transform: none; }
          .checkout-chevron { animation: none; transform: rotate(45deg); }
        }
      `}</style>
      {showLGSApplication && <LGSApplications onClose={() => setShowLGSApplication(false)} isLightMode={isLightMode} />}
      <main className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${pageBg}`}>
        <section aria-labelledby="cards-rollout-heading" className={`border-b ${isLightMode ? "border-black/10 bg-white" : "border-white/10 bg-[#171717]"}`}>
          <div className="mx-auto grid w-full max-w-7xl items-center gap-5 px-4 py-5 sm:px-6 sm:py-6 md:px-8 lg:grid-cols-[0.9fr_1.2fr_0.7fr] lg:gap-6">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${accentText}`}>Officially rolled out</p>
              <h1 id="cards-rollout-heading" className="mt-2 max-w-xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">3D cards are live in every collection.</h1>
              <p className={`mt-3 max-w-xl text-sm leading-6 ${bodyText}`}>Explore your cards from every angle. Flip them over, rotate freely, and zoom up to 400% to see the details.</p>
              <p className={`mt-3 max-w-xl text-sm leading-6 ${muted}`}>Give {homepageSampleCard.code} a spin here. Drag to rotate, or switch to Reposition to move around the card while zoomed in.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <a href={discordHref} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 ${isLightMode ? "border-black/10" : "border-white/15"}`}>Join Discord<ExternalLinkIcon /></a>
                <a href={redditHref} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 ${isLightMode ? "border-black/10" : "border-white/15"}`}>Join Reddit<ExternalLinkIcon /></a>
              </div>
            </div>
            <HomepageCardDemo isLightMode={isLightMode} />
            <SilverStampShowcase isLightMode={isLightMode} />
          </div>
        </section>
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
          <section aria-labelledby="announcements-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-sm font-semibold ${accentText}`}>What's happening</p>
                <h2 id="announcements-heading" className="mt-1 text-3xl font-bold tracking-tight">Announcements</h2>
              </div>
              <p className={`text-sm ${muted}`}>{activeAnnouncement + 1} of {announcements.length}</p>
            </div>
            <div className="mt-5 grid overflow-hidden rounded-3xl">
              {announcements.map((item, index) => renderAnnouncementCard(item, index, "sizing"))}
              {outgoingAnnouncement !== null && renderAnnouncementCard(announcements[outgoingAnnouncement], outgoingAnnouncement, "outgoing")}
              {renderAnnouncementCard(announcement, activeAnnouncement, "incoming")}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <button type="button" onClick={previousAnnouncement} aria-label="Previous announcement" className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-bold transition-colors ${isLightMode ? "border-black/15 bg-white text-zinc-800 hover:border-[#E7C84B]" : "border-white/15 bg-[#181818] text-white hover:border-[#E7C84B]/60"}`}><ArrowLeftIcon /></button>
              <div className="flex items-center justify-center gap-2">
                {announcements.map((item, index) => (
                  <button key={item.title} type="button" onClick={() => openAnnouncement(index)} aria-label={`Open announcement ${index + 1}: ${item.title}`} aria-current={index === activeAnnouncement ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${index === activeAnnouncement ? "w-8 bg-[#E7C84B]" : isLightMode ? "w-2.5 bg-black/20 hover:bg-black/35" : "w-2.5 bg-white/20 hover:bg-white/35"}`} />
                ))}
              </div>
              <button type="button" onClick={nextAnnouncement} aria-label="Next announcement" className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-bold transition-colors ${isLightMode ? "border-black/15 bg-white text-zinc-800 hover:border-[#E7C84B]" : "border-white/15 bg-[#181818] text-white hover:border-[#E7C84B]/60"}`}><ArrowRightIcon /></button>
            </div>
          </section>
          <section className="space-y-7" aria-labelledby="community-heading">
            <article className={`flex flex-col gap-5 rounded-3xl border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between ${surface}`}>
              <div className="max-w-4xl">
                <p className={`text-sm font-semibold ${accentText}`}>For local game stores</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Bring organized play to your community.</h2>
                <p className={`mt-2 text-sm leading-6 ${bodyText}`}>Approved stores can manage tournaments, track attendance, and preserve event history in one shared space. Stores may apply whether they already host events or are preparing for their first one.</p>
              </div>
              <button type="button" onClick={() => setShowLGSApplication(true)} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#E7C84B] px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-[#FFE477] sm:w-auto">Apply for the LGS Program</button>
            </article>
            <div>
              <p className={`text-sm font-semibold ${accentText}`}>Trusted places to continue</p>
              <h2 id="community-heading" className="mt-1 text-2xl font-bold tracking-tight">Community references</h2>
              <div className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-4">
                {references.map((resource) => (
                  <a key={resource.title} href={resource.href} target="_blank" rel="noopener noreferrer" className={`group flex h-full min-h-36 overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 ${surface} ${isLightMode ? "hover:border-[#E7C84B]/70" : "hover:border-[#E7C84B]/45"}`}>
                    {resource.image && (
                      <div className={`flex w-24 shrink-0 items-center justify-center overflow-hidden sm:w-28 ${isLightMode ? "bg-[#f1eee5]" : "bg-[#101010]"}`}>
                        <CardImage src={resource.image} alt={resource.title} className={resource.title === "Doodle Binder" ? "h-full w-full object-cover object-center" : "max-h-20 w-full object-contain p-3"} />
                      </div>
                    )}
                    <div className={`flex min-w-0 flex-1 flex-col justify-center ${resource.image ? "p-4" : "p-5"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold tracking-tight">{resource.title}</h3>
                        <span aria-hidden="true" className={accentText}><ExternalLinkIcon className="h-4 w-4" /></span>
                      </div>
                      <p className={`mt-2 text-xs leading-5 ${bodyText}`}>{resource.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
          <footer className={`border-t pt-6 text-center text-xs leading-5 ${isLightMode ? "border-black/10 text-zinc-500" : "border-white/10 text-zinc-500"}`}>
            <p>MLPEKAYOU is a free fan website owned and operated by Keegan. It is not owned, operated, or managed by Kayou US.</p>
          </footer>
        </div>
      </main>
    </>
  );
}
