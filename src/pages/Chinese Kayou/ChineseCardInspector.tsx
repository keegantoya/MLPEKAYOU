import { useEffect, useRef, useState, useId, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RotateCcw, RotateCw, Move, Box, ChevronLeft, ChevronRight } from "lucide-react";
import { useChineseCardImage, getChineseCardBackStyle, type ChineseCardBack } from "./card-images-cn";
export type ChineseInspectCard = { key: string; code: string; front: string; back?: ChineseCardBack; frontStyle?: CSSProperties; aspectRatio?: number; notice?: string };
type Props = { card: ChineseInspectCard | null; onClose: () => void; onPrevious?: () => void; onNext?: () => void };
type Quaternion = [number, number, number, number];
const multiply = (a: Quaternion, b: Quaternion): Quaternion => {
  const [x,y,z,w] = a, [u,v,t,s] = b;
  const q = [w*u+x*s+y*t-z*v,w*v-x*t+y*s+z*u,w*t+x*v-y*u+z*s,w*s-x*u-y*v-z*t];
  const length = Math.hypot(...q) || 1;
  return q.map(value => value / length) as Quaternion;
};
const axis = (x: number, y: number, z: number, angle: number): Quaternion => {
  const sine = Math.sin(angle / 2) / (Math.hypot(x,y,z) || 1);
  return [x*sine,y*sine,z*sine,Math.cos(angle/2)];
};
const matrix = ([x,y,z,w]: Quaternion) => `matrix3d(${[1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0,2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0,2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0,0,0,0,1].join(",")})`;
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
const silverStampStyles = `.cn3d-certificate-seal{position:absolute;left:6%;bottom:3.5%;width:10.5%;aspect-ratio:1;border-radius:14%;overflow:hidden;isolation:isolate;background:#bbc2c8;box-shadow:0 .3px .8px #00000075;pointer-events:none}
.cn3d-certificate-seal.cn3d-seal-sideways{right:auto;left:7.5%;bottom:6%;transform:rotate(90deg)}
.cn3d-certificate-seal.cn3d-seal-landscape-left{right:auto;left:7.5%;top:6%;bottom:auto;transform:rotate(180deg)}
.cn3d-seal-foil{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 7%,#e4f4ff65 7.3% 8.3%,transparent 8.6% 19%),repeating-linear-gradient(125deg,#f5f6f875 0 .8px,#7f8c9930 .8px 1.6px),linear-gradient(var(--cn3d-foil-angle,115deg),#d3d9dd 0%,#fafcfc 12%,#77838e 23%,#c1cbd3 33%,#eef4f7 41%,#505a66 49%,#c6d0d7 60%,#f5f8fa 68%,#88929b 80%,#dce1e5 92%,#f7f8f8 100%);background-size:100% 100%,100% 100%,240% 240%;background-position:center,center,var(--cn3d-foil-x,50%) var(--cn3d-foil-y,50%)}
.cn3d-seal-art{position:absolute;inset:0;width:100%;height:100%}
.cn3d-seal-letter-band{opacity:1}
.cn3d-seal-collection{opacity:var(--cn3d-collection-opacity,0)}
.cn3d-seal-certificate{opacity:var(--cn3d-cert-opacity,.55)}
.cn3d-seal-glint{position:absolute;inset:0;background:linear-gradient(var(--cn3d-foil-angle,115deg),transparent 25%,#c6efff18 36%,#ffffff60 48%,#ffe1ff16 57%,transparent 68%);background-size:230% 230%;background-position:var(--cn3d-foil-x,50%) var(--cn3d-foil-y,50%);opacity:.2}
`;
export function ChineseSilverStamp({ sideways = false, landscapeLeft = false }: {
    sideways?: boolean;
    landscapeLeft?: boolean;
}) {
const id = useId().replace(/:/g, "");
    return <><style>{silverStampStyles}</style><span className={`cn3d-certificate-seal${sideways ? " cn3d-seal-sideways" : ""}${landscapeLeft ? " cn3d-seal-landscape-left" : ""}`} aria-hidden="true">
        <span className="cn3d-seal-foil"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cn3d-seal-art" focusable="false">
            <defs>
                <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6f8f9"/><stop offset=".23" stopColor="#bdc4ca"/><stop offset=".46" stopColor="#edf0f2"/><stop offset=".7" stopColor="#a6afb6"/><stop offset="1" stopColor="#eef2f4"/>
                </linearGradient>
                <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" style={{ stopColor: "hsl(calc(165 + var(--cn3d-foil-hue,0)), 88%, 68%)" }}/><stop offset=".25" style={{ stopColor: "hsl(calc(85 + var(--cn3d-foil-hue,0)), 90%, 65%)" }}/><stop offset=".5" style={{ stopColor: "hsl(calc(48 + var(--cn3d-foil-hue,0)), 100%, 62%)" }}/><stop offset=".75" style={{ stopColor: "hsl(calc(22 + var(--cn3d-foil-hue,0)), 95%, 70%)" }}/><stop offset="1" style={{ stopColor: "hsl(calc(265 + var(--cn3d-foil-hue,0)), 90%, 80%)" }}/>
                </linearGradient>
                <pattern id={`${id}-dots`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <path d="M1.2 .3 L2 1.2 L1.2 2.1 L.4 1.2 Z" fill="#e6eef4" fillOpacity=".65"/>
                </pattern>
            </defs>
            <g>
                <path d="M0 0H100V100H0Z" fill={`url(#${id}-dots)`} opacity=".42"/>
                <path className="cn3d-seal-letter-band" d="M-2-2H27V102H-2Z" fill="#19252f"/>
                <path d="M26-2H45V102H26Z" fill="#354149"/>
                <path d="M26-2H45V102H26Z" fill={`url(#${id}-dots)`} opacity=".8"/>
                <g transform="translate(44 4) scale(.92) translate(-44 0)">
                <path d="M44 31L73 0H86Q100 0 100 14V21L77 39L100 69V86Q100 100 86 100H74L51 65L44 73Z" fill={`url(#${id}-metal)`} stroke="#e4e9ed" strokeWidth=".6"/>
                <g transform="translate(83 83)" fontFamily="Arial,sans-serif" fontWeight="700" textAnchor="middle">
                    <text x=".35" y=".35" fontSize="5.2" fill="#f5f7f8">{"\u5361\u6e38"}</text>
                    <text x="0" y="0" fontSize="5.2" fill="#63717b">{"\u5361\u6e38"}</text>
                    <text x="0" y="3.4" fontSize="2.3" letterSpacing=".2" fill="#63717b">KAYOU</text>
                </g>
                </g>
                <g transform="rotate(90 50 50)">
                    <text className="cn3d-seal-certificate" y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("CERTIFICATE").map((letter, index) => <tspan key={index} x={16 + index * 6.8}>{letter}</tspan>)}</text>
                    <g className="cn3d-seal-collection">
                        <text y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("COLLECTION").map((letter, index) => <tspan key={index} x={16 + index * (68 / 9)}>{letter}</tspan>)}</text>
                    </g>
                </g>
            </g>
        </svg>
        <span className="cn3d-seal-glint"/>
    </span></>;
}
function InspectorImage({ src, alt, style }: { src: string; alt: string; style?: CSSProperties }) {
  const image = useChineseCardImage(src);
  const [failed, setFailed] = useState(false);
  return image.url && !failed ? <img src={image.url} alt={alt} draggable={false} onError={() => setFailed(true)} className="cn3d-image" style={style} /> : <span className="cn3d-image-status" role="status">{image.error || failed ? "Image unavailable" : "Loading card..."}</span>;
}
function CardStage({ card }: { card: ChineseInspectCard }) {
  const stage = useRef<HTMLDivElement>(null);
  const model = useRef<HTMLDivElement>(null);
  const rotation = useRef<Quaternion>([0,0,0,1]);
  const pan = useRef({x:0,y:0});
  const pointer = useRef<{id:number;x:number;y:number;mode:"rotate"|"move"} | null>(null);
  const [mode,setMode] = useState<"rotate"|"move">("rotate");
  const [zoom,setZoom] = useState(100);
  const [retry,setRetry] = useState(0);
  const [dragging,setDragging] = useState(false);
  const aspect = card.aspectRatio && card.aspectRatio > 0 ? card.aspectRatio : 5/7;
  const apply = (next: Quaternion) => {
    rotation.current = next;
    if (model.current) {
      model.current.style.transform = `translate3d(${pan.current.x}px,${pan.current.y}px,0) ${matrix(next)}`;
      const light = getSealLighting(next);
      model.current.style.setProperty("--cn3d-foil-x", `${light.x}%`);
      model.current.style.setProperty("--cn3d-foil-y", `${light.y}%`);
      model.current.style.setProperty("--cn3d-foil-angle", `${light.angle}deg`);
      model.current.style.setProperty("--cn3d-foil-hue", String(light.hue));
      model.current.style.setProperty("--cn3d-cert-opacity", String(light.certificate));
      model.current.style.setProperty("--cn3d-collection-opacity", String(light.collection));
    }
  };
  const turn = (x:number,y:number,z:number,angle:number) => apply(multiply(axis(x,y,z,angle),rotation.current));
  const finish = () => { pointer.current=null;setDragging(false); };
  const reset = () => { pan.current={x:0,y:0};setZoom(100);setMode("rotate");apply([0,0,0,1]);finish(); };
  useEffect(() => {
    const node=stage.current;
    if (!node) return;
    const measure=()=>{
      if (!model.current) return;
      const limit=Math.max(0,Math.min(node.clientWidth,node.clientHeight)/2-12);
      const radius=limit/Math.sqrt(1+(limit/1000)**2);
      const height=Math.min(440,2*radius/Math.hypot(1,aspect))*zoom/100;
      model.current.style.height=`${height}px`;
      model.current.style.width=`${height*aspect}px`;
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(node);
    return ()=>observer.disconnect();
  },[aspect,zoom]);
  const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const current=pointer.current;
    if (!current || current.id!==event.pointerId) return;
    const dx=event.clientX-current.x,dy=event.clientY-current.y;
    current.x=event.clientX;current.y=event.clientY;
    if(current.mode==="move"){pan.current={x:pan.current.x+dx,y:pan.current.y+dy};apply(rotation.current);return;}
    const distance=Math.hypot(dx,dy);
    if(!distance)return;
    const sensitivity=Math.PI/Math.max(180,Math.min(event.currentTarget.clientWidth,event.currentTarget.clientHeight));
    if(event.shiftKey)turn(0,0,1,dx*sensitivity);else turn(-dy,dx,0,distance*sensitivity);
  };
  const keyDown=(event:ReactKeyboardEvent<HTMLDivElement>)=>{
    if(event.key.toLowerCase()==="r"){event.preventDefault();reset();return;}
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
    event.preventDefault();
    const horizontal=event.key==="ArrowLeft"?-1:event.key==="ArrowRight"?1:0;
    const vertical=event.key==="ArrowUp"?-1:event.key==="ArrowDown"?1:0;
    if(mode==="move"){pan.current={x:pan.current.x+horizontal*24,y:pan.current.y+vertical*24};apply(rotation.current);}
    else if(event.shiftKey && horizontal)turn(0,0,1,horizontal*Math.PI/12);
    else if(horizontal)turn(0,1,0,horizontal*Math.PI/12);
    else turn(1,0,0,-vertical*Math.PI/12);
  };
  return <>
    <div ref={stage} tabIndex={0} role="group" aria-label={`${mode === "move" ? "Move" : "Rotate"} card. Drag or use arrow keys. Press R to reset.`} className={`cn3d-stage ${dragging ? "cn3d-dragging" : ""}`} onKeyDown={keyDown} onPointerDown={event=>{
      if(pointer.current || (event.pointerType==="mouse" && event.button!==0))return;
      event.currentTarget.focus();event.currentTarget.setPointerCapture(event.pointerId);
      pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY,mode};setDragging(true);
    }} onPointerMove={move} onPointerUp={event=>{if(pointer.current?.id===event.pointerId)finish();}} onPointerCancel={finish} onLostPointerCapture={finish}>
      <div ref={model} className="cn3d-model">
        <div className="cn3d-face cn3d-front"><InspectorImage key={`front-${retry}`} src={card.front} alt={`${card.code} front`} style={card.frontStyle} /></div>
        <div className="cn3d-face cn3d-back">{card.back ? <InspectorImage key={`back-${retry}`} src={card.back.image} alt={`${card.code} back`} style={getChineseCardBackStyle(card.back)} /> : <span className="cn3d-image-status">Back not available yet</span>}{card.back?.silverStamp && <ChineseSilverStamp/>}</div>
      </div>
    </div>
    {card.notice && <p role="note" className="cn3d-notice">{card.notice}</p>}
    <div className="cn3d-tools" role="group" aria-label="3D controls">
      <button type="button" aria-pressed={mode==="rotate"} onClick={()=>{finish();setMode("rotate");}}><Box size={15} aria-hidden="true"/>Rotate</button>
      <button type="button" aria-pressed={mode==="move"} onClick={()=>{finish();setMode("move");}}><Move size={15} aria-hidden="true"/>Move</button>
      <button type="button" onClick={()=>{finish();pan.current={x:0,y:0};apply(axis(0,1,0,Math.PI));}}>Show back</button>
      <button type="button" aria-label="Rotate card left" onClick={()=>turn(0,0,1,-Math.PI/2)}><RotateCcw size={16}/></button>
      <button type="button" aria-label="Rotate card right" onClick={()=>turn(0,0,1,Math.PI/2)}><RotateCw size={16}/></button>
      <button type="button" onClick={reset}>Reset</button>
    </div>
    <div className="cn3d-zoom"><label htmlFor="cn3d-zoom">Zoom</label><input id="cn3d-zoom" type="range" min={100} max={400} step={10} value={zoom} onChange={event=>setZoom(Number(event.target.value))}/><output htmlFor="cn3d-zoom">{zoom}%</output><button type="button" onClick={()=>setRetry(value=>value+1)}>Reload images</button></div>
  </>;
}
const styles=`
.cn3d-dialog{display:flex!important;flex-direction:column!important;width:calc(100% - 24px)!important;max-width:780px!important;height:min(640px,82dvh)!important;max-height:82dvh!important;padding:14px!important;gap:10px!important;overflow:hidden;border-radius:20px;background:hsl(var(--background));color:hsl(var(--foreground));z-index:120020!important;font-family:'Oxanium',sans-serif}
.cn3d-heading{padding-right:32px;flex:none}.cn3d-heading h2{font-size:16px;font-weight:600}.cn3d-heading p{font-size:11px;color:hsl(var(--muted-foreground));margin-top:3px}
.cn3d-stage{display:flex;align-items:center;justify-content:center;position:relative;min-height:0;flex:1;overflow:hidden;perspective:1000px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;border-radius:14px;background:radial-gradient(ellipse at center,hsl(var(--primary)/.05),transparent 70%)}.cn3d-dragging{cursor:grabbing}.cn3d-stage:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:-3px}
.cn3d-model{position:relative;flex:none;width:0;height:0;transform-style:preserve-3d;pointer-events:none}
.cn3d-face{position:absolute;inset:0;border-radius:4.5% / 3.2%;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.5px);background:hsl(var(--muted));clip-path:inset(0 round 4.5% / 3.2%);-webkit-mask-image:linear-gradient(#fff,#fff)}.cn3d-back{transform:rotateY(180deg) translateZ(.5px)}
.cn3d-image{display:block;position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center;transform-origin:center;-webkit-user-drag:none}.cn3d-image-status{display:flex;align-items:center;justify-content:center;text-align:center;position:absolute;inset:0;padding:10px;font-size:11px;color:hsl(var(--muted-foreground))}
.cn3d-notice{flex:none;margin:0;text-align:center;font-size:11px;line-height:1.45;color:hsl(var(--muted-foreground));padding:0 6px}
.cn3d-tools{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;flex:none}.cn3d-tools button,.cn3d-zoom button,.cn3d-footer button{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:36px;padding:6px 10px;border:1px solid hsl(var(--border));border-radius:10px;font:inherit;font-size:11px;background:transparent;color:inherit}.cn3d-tools button[aria-pressed=true]{background:hsl(var(--primary)/.12);border-color:hsl(var(--primary)/.4);color:hsl(var(--primary))}.cn3d-dialog button:focus-visible,.cn3d-dialog input:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:2px}
.cn3d-zoom{display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;flex:none}.cn3d-zoom input{width:min(220px,35vw);min-width:0;accent-color:hsl(var(--primary))}.cn3d-zoom output{width:34px;font-variant-numeric:tabular-nums}.cn3d-zoom button{border:none;color:hsl(var(--muted-foreground));padding:4px;min-height:32px;font-size:10px}
.cn3d-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid hsl(var(--border));padding-top:8px;flex:none}.cn3d-footer span{font-size:10px;color:hsl(var(--muted-foreground));text-align:center}
@media(max-width:600px){.cn3d-dialog{height:min(560px,78dvh)!important;max-height:78dvh!important;padding:10px!important;gap:7px!important}.cn3d-tools{gap:4px}.cn3d-tools button{min-height:36px;padding:5px 7px;font-size:10px}.cn3d-footer span{display:none}.cn3d-heading h2{font-size:14px}.cn3d-heading p{font-size:10px}}
@media(max-height:500px){.cn3d-dialog{height:90dvh!important;max-height:90dvh!important;gap:4px!important}.cn3d-heading p{display:none}.cn3d-tools button,.cn3d-footer button{min-height:28px;padding:3px 7px}.cn3d-zoom button{min-height:24px}.cn3d-footer{padding-top:4px}}
`;
export default function ChineseCardInspector({card,onClose,onPrevious,onNext}:Props){
  return <Dialog open={Boolean(card)} onOpenChange={open=>{if(!open)onClose();}}><DialogContent className="cn3d-dialog" style={{zIndex:120020}}><style>{styles}</style><header className="cn3d-heading"><DialogTitle>{card?.code}</DialogTitle><DialogDescription>Drag to turn the card in 3D. Zoom or switch to Move for a closer look.</DialogDescription></header>{card && <CardStage key={card.key} card={card}/>}<footer className="cn3d-footer"><button type="button" disabled={!onPrevious} onClick={onPrevious}><ChevronLeft size={15} aria-hidden="true"/>Previous</button><span>Arrow keys rotate · Shift + arrows roll · R resets</span><button type="button" disabled={!onNext} onClick={onNext}>Next<ChevronRight size={15} aria-hidden="true"/></button></footer></DialogContent></Dialog>;
}
