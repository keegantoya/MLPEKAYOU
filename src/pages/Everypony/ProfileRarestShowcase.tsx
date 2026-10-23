import { englishViewEligible, englishViewImage, englishViewStyle, englishViewDetails } from "@/lib/english-card-views";
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import CardImage from "@/components/CardImage";
import { getChineseCard, isWideChineseCard } from "@/pages/Chinese Kayou/Chinese ISO/catalog/catalog";
import ChineseISOImage from "@/pages/Chinese Kayou/Chinese ISO/components/card-image";
import { supabase } from "@/lib/supabase";
export type ShowcaseCard = {
    set_id: string;
    card_key: string;
    owner_count: number;
};
export const getShowcaseDetails = (card: ShowcaseCard) => {
    const chinese = getChineseCard(card.set_id, card.card_key);
    return chinese ? { rarity: chinese.rarity, number: chinese.number, code: chinese.code, name: chinese.setName, wide: isWideChineseCard(chinese), back: chinese.image, stamp: false, sideways: false, stampCenter: false } : englishViewDetails(card);
};
function CertificateSeal({ sideways = false }: {
    sideways?: boolean;
}) {
    const id = useId().replace(/:/g, "");
    return <span className={`ps-certificate-seal${sideways ? " ps-seal-sideways" : ""}`} aria-hidden="true">
        <span className="ps-seal-foil"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ps-seal-art" focusable="false">
            <defs>
                <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6f8f9"/><stop offset=".23" stopColor="#bdc4ca"/><stop offset=".46" stopColor="#edf0f2"/><stop offset=".7" stopColor="#a6afb6"/><stop offset="1" stopColor="#eef2f4"/>
                </linearGradient>
                <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" style={{ stopColor: "hsl(calc(165 + var(--ps-foil-hue,0)), 88%, 68%)" }}/><stop offset=".25" style={{ stopColor: "hsl(calc(85 + var(--ps-foil-hue,0)), 90%, 65%)" }}/><stop offset=".5" style={{ stopColor: "hsl(calc(48 + var(--ps-foil-hue,0)), 100%, 62%)" }}/><stop offset=".75" style={{ stopColor: "hsl(calc(22 + var(--ps-foil-hue,0)), 95%, 70%)" }}/><stop offset="1" style={{ stopColor: "hsl(calc(265 + var(--ps-foil-hue,0)), 90%, 80%)" }}/>
                </linearGradient>
                <pattern id={`${id}-dots`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <path d="M1.2 .3 L2 1.2 L1.2 2.1 L.4 1.2 Z" fill="#e6eef4" fillOpacity=".65"/>
                </pattern>
            </defs>
            <g>
                <path d="M0 0H100V100H0Z" fill={`url(#${id}-dots)`} opacity=".42"/>
                <path className="ps-seal-letter-band" d="M-2-2H27V102H-2Z" fill="#19252f"/>
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
                    <text className="ps-seal-certificate" y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("CERTIFICATE").map((letter, index) => <tspan key={index} x={16 + index * 6.8}>{letter}</tspan>)}</text>
                    <g className="ps-seal-collection">
                        <text y="89" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#14222b" strokeWidth=".25" paintOrder="stroke fill" fill={`url(#${id}-spectrum)`}>{Array.from("COLLECTION").map((letter, index) => <tspan key={index} x={16 + index * (68 / 9)}>{letter}</tspan>)}</text>
                    </g>
                </g>
            </g>
        </svg>
        <span className="ps-seal-glint"/>
    </span>;
}
export function ShowcaseSpinner({ card, index }: {
    card: ShowcaseCard;
    index: number;
}) {
    const details = getShowcaseDetails(card);
    const chinese = getChineseCard(card.set_id, card.card_key);
    const [rotation, setRotation] = useState({ x: -7, y: index ? -12 : 12 });
    const [failedFront, setFailedFront] = useState(false);
    const [failedBack, setFailedBack] = useState(false);
    const drag = useRef<{
        id: number;
        x: number;
        y: number;
        rx: number;
        ry: number;
    } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [retried, setRetried] = useState(0);
    const variables = { "--ps-foil-x": `${50 + Math.sin(rotation.y * Math.PI / 180) * 45}%`, "--ps-foil-y": `${50 + Math.sin(rotation.x * Math.PI / 180) * 45}%`, "--ps-foil-angle": `${115 + rotation.y % 120}deg`, "--ps-foil-hue": rotation.y % 180, "--ps-collection-opacity": Math.abs(Math.sin(rotation.y * Math.PI / 180)), "--ps-cert-opacity": .35 + Math.abs(Math.sin(rotation.x * Math.PI / 180)) * .65 } as CSSProperties;
    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (drag.current?.id !== event.pointerId)
            return;
        drag.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
    };
    useEffect(() => { setFailedFront(false); setFailedBack(false); setRotation({ x: -7, y: index ? -12 : 12 }); }, [card.set_id, card.card_key, index]);
    return <article className={`ps-feature-card ps-feature-${index} ${details.wide ? "ps-is-wide" : ""}`}>
    <div className={`ps-spin-stage ${dragging ? "ps-is-dragging" : ""}`} role="group" tabIndex={0} aria-label={`${details.code}. Drag left or right to spin; use arrow keys to rotate.`} onPointerDown={event => {
            if (event.pointerType === "mouse" && event.button !== 0)
                return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rx: rotation.x, ry: rotation.y };
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        }} onPointerMove={event => {
            const current = drag.current;
            if (!current || current.id !== event.pointerId)
                return;
            setRotation({ x: Math.max(-65, Math.min(65, current.rx - (event.clientY - current.y) * .22)), y: current.ry + (event.clientX - current.x) * .7 });
        }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; setDragging(false); }} onKeyDown={event => {
            const direction = event.key === "ArrowLeft" ? -20 : event.key === "ArrowRight" ? 20 : 0;
            if (direction) {
                event.preventDefault();
                setRotation(previous => ({ ...previous, y: previous.y + direction }));
            }
            else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                setRotation(previous => ({ ...previous, x: Math.max(-65, Math.min(65, previous.x + (event.key === "ArrowUp" ? -10 : 10))) }));
            }
            else if (event.key.toLowerCase() === "r")
                setRotation({ x: -7, y: index ? -12 : 12 });
        }}>
      <div className="ps-card-model" style={{ ...variables, aspectRatio: details.wide ? "10/7" : "5/7", transform: `rotateZ(${index ? 2 : -2}deg) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
        <div className="ps-card-face ps-card-front">
          {chinese ? <ChineseISOImage key={`chinese-front-${retried}`} card={chinese} /> : failedFront ? <div className="ps-image-missing">Front unavailable</div> : <CardImage key={`front-${retried}`} src={englishViewImage(card)} imageSize="original" visible={true} loading="eager" draggable={false} alt={`${details.code} front`} className="ps-face-image" style={englishViewStyle(card, { inspect: true })} onError={() => setFailedFront(true)}/>}
          <span className="ps-card-sheen"/>
        </div>
        <div className={`ps-card-face ps-card-back ${details.stampCenter ? "ps-stamp-center" : ""} ${details.wide ? "ps-wide-back" : ""} ps-stamp-set-${card.set_id}`}>
          {chinese ? <ChineseISOImage key={`chinese-back-${retried}`} card={chinese} /> : failedBack || !details.back ? <div className="ps-image-missing">Back unavailable</div> : <CardImage key={`back-${retried}`} src={details.back} imageSize="original" visible={true} loading="eager" draggable={false} alt={`${details.code} back`} className="ps-face-image" style={englishViewStyle(card, { side: "back", inspect: true })} onError={() => setFailedBack(true)}/>}
          {details.stamp && !failedBack && details.back && <CertificateSeal sideways={details.sideways}/>}
          <span className="ps-card-sheen"/>
        </div>
      </div>
    </div>
    <div className="ps-card-caption"><strong>{details.code}</strong><span>{details.name}{chinese ? " / Chinese" : " / English"}</span><small>{card.owner_count.toLocaleString()} {card.owner_count === 1 ? "collector owns" : "collectors own"} this card</small></div>
    <div className="ps-card-controls"><button type="button" onClick={() => setRotation(previous => ({ ...previous, y: previous.y + 180 }))} aria-label={`Flip ${details.code}`}>Flip card</button>{(failedFront || failedBack) && <button type="button" onClick={() => { setFailedFront(false); setFailedBack(false); setRetried(previous => previous + 1); }}>Retry image</button>}</div>
  </article>;
}
export default function ProfileRarestShowcase({ profileId }: {
    profileId?: string;
}) {
    const [result, setResult] = useState<{
        profileId?: string;
        cards: ShowcaseCard[];
        status: "loading" | "ready" | "error";
    }>({ cards: [], status: "loading" });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        if (!profileId)
            return;
        setResult({ profileId, cards: [], status: "loading" });
        const load = async () => {
            const { data, error } = await supabase.rpc("get_profile_showcase", { p_profile_id: profileId });
            if (!active)
                return;
            if (error) {
                setResult({ profileId, cards: [], status: "error" });
                return;
            }
            setResult({ profileId, cards: (data || []).filter((card: ShowcaseCard) => !!getChineseCard(card.set_id, card.card_key) || englishViewEligible(card)).map((card: {
                    set_id: string;
                    card_key: string;
                    owner_count: number | string;
                }) => ({ ...card, owner_count: Number(card.owner_count) })), status: "ready" });
        };
        void load().catch(() => {
            if (active)
                setResult({ profileId, cards: [], status: "error" });
        });
        return () => { active = false; };
    }, [profileId, retry]);
    const current = result.profileId === profileId ? result : { cards: [], status: "loading" };
    return <aside className="ps-rarest-showcase" aria-label="Rarest owned cards">
    <div className="ps-rarest-heading"><span>Rarest cards</span></div>
    {current.status === "loading" ? <div className="ps-rarest-empty" role="status"><span className="ps-loading-dot"/>Finding their rarest pulls...</div> : current.status === "error" ? <div className="ps-rarest-empty"><p>Rarest cards could not be loaded.</p><button type="button" onClick={() => setRetry(previous => previous + 1)}>Try again</button></div> : current.cards.length ? <><div className="ps-rarest-pair">{current.cards.map((card, index) => <ShowcaseSpinner key={`${card.set_id}:${card.card_key}`} card={card} index={index}/>)}</div></> : <div className="ps-rarest-empty">Their rarest pulls will appear here as they collect top hits.</div>}
  </aside>;
}
export const profileShowcaseStyles = `
.pp-shell{display:block!important}.pp-profile-hero{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start;margin-bottom:16px}.pp-hero-copy{min-width:0}.pp-hero-copy>section{border-radius:18px}.pp-hero-copy>section>div.relative{padding:18px!important}.pp-hero-copy .pp-identity{margin-top:8px;gap:14px}.pp-hero-copy .pp-name{font-size:25px!important;line-height:1.2!important;letter-spacing:normal;overflow-wrap:anywhere}.pp-hero-copy .pp-avatar{width:72px!important;height:72px!important;border-radius:18px!important}.pp-hero-copy .pp-stats{display:grid;grid-template-columns:1.2fr repeat(3,minmax(0,1fr));gap:10px;margin-top:12px;padding:12px 16px;border-radius:14px}.pp-hero-copy .pp-owned{padding:0}.pp-hero-copy .pp-owned strong{font-size:26px;margin:4px 0}.pp-hero-copy .pp-owned>span{font-size:9px}.pp-hero-copy .pp-metric{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;padding:0 0 0 10px;border-top:0;border-left:1px solid var(--pp-line);font-size:10px}.pp-hero-copy .pp-metric strong{font-size:18px}.ps-rarest-showcase{min-width:0;border:1px solid var(--pp-line);border-radius:18px;background:var(--pp-panel);padding:12px;color:var(--pp-ink)}.ps-rarest-heading{margin-bottom:10px;font-size:12px;font-weight:600}.ps-rarest-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:3px 3px 0}.ps-feature-card{min-width:0;text-align:center}.ps-feature-1{padding-top:0}.ps-spin-stage{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:5/7;width:100%;max-width:132px;margin:auto;perspective:1000px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab;outline:none}.ps-spin-stage:focus-visible{outline:2px solid var(--pp-accent);outline-offset:8px;border-radius:12px}.ps-is-dragging{cursor:grabbing}.ps-card-model{position:relative;width:100%;flex:none;transform-style:preserve-3d;will-change:transform;pointer-events:none}.ps-card-face{position:absolute;inset:0;overflow:hidden;border-radius:4.5% / 3.2%;background:var(--pp-soft);backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:translateZ(.6px);isolation:isolate;box-shadow:0 12px 25px #00000030}.ps-card-back{transform:rotateY(180deg) translateZ(.6px)}.ps-face-image{display:block;position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center;transform-origin:center;user-select:none;-webkit-user-drag:none}.ps-card-sheen{position:absolute;inset:0;pointer-events:none;background:linear-gradient(125deg,#ffffff12,transparent 38%,#ffffff05);border-radius:inherit}.ps-card-caption{display:flex;flex-direction:column;gap:2px;margin-top:7px;color:var(--pp-muted);font-size:10px;line-height:1.4;overflow-wrap:anywhere}.ps-card-rank{font-size:8px;letter-spacing:.11em;color:var(--pp-accent);font-weight:700}.ps-card-caption strong{font-size:10px;font-weight:650;color:var(--pp-ink)}.ps-card-caption small{font-size:10px;color:var(--pp-muted)}.ps-spin-hint{text-align:center;font-size:10px;color:var(--pp-muted);margin:17px 0 0}.ps-card-controls{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:8px}.ps-card-controls button,.ps-rarest-empty button{font:inherit;font-size:10px;border:1px solid var(--pp-line);color:var(--pp-ink);background:var(--pp-soft);padding:6px 10px;border-radius:999px;cursor:pointer;min-height:30px}.ps-rarest-empty{display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;text-align:center;min-height:150px;border:1px dashed var(--pp-line);border-radius:12px;color:var(--pp-muted);font-size:12px;padding:12px}.ps-loading-dot{width:9px;height:9px;border-radius:50%;background:var(--pp-accent);animation:ps-pulse 1s ease-in-out infinite alternate}.ps-image-missing{position:absolute;inset:0;display:grid;place-items:center;background:var(--pp-soft);color:var(--pp-muted);font-size:12px;padding:20px;text-align:center}@keyframes ps-pulse{to{opacity:.25}}
.ps-certificate-seal{position:absolute;right:6%;bottom:7.5%;width:10.5%;aspect-ratio:1;border-radius:14%;overflow:hidden;isolation:isolate;background:#bbc2c8;box-shadow:0 .3px .8px #00000075;pointer-events:none}
.ps-certificate-seal.ps-seal-sideways{right:auto;left:7.5%;top:6%;bottom:auto;transform:rotate(180deg)}
.ps-seal-foil{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 7%,#e4f4ff65 7.3% 8.3%,transparent 8.6% 19%),repeating-linear-gradient(125deg,#f5f6f875 0 .8px,#7f8c9930 .8px 1.6px),linear-gradient(var(--ps-foil-angle,115deg),#d3d9dd 0%,#fafcfc 12%,#77838e 23%,#c1cbd3 33%,#eef4f7 41%,#505a66 49%,#c6d0d7 60%,#f5f8fa 68%,#88929b 80%,#dce1e5 92%,#f7f8f8 100%);background-size:100% 100%,100% 100%,240% 240%;background-position:center,center,var(--ps-foil-x,50%) var(--ps-foil-y,50%)}
.ps-seal-art{position:absolute;inset:0;width:100%;height:100%}
.ps-seal-letter-band{opacity:1}
.ps-seal-collection{opacity:var(--ps-collection-opacity,0)}
.ps-seal-certificate{opacity:var(--ps-cert-opacity,.55)}
.ps-seal-glint{position:absolute;inset:0;background:linear-gradient(var(--ps-foil-angle,115deg),transparent 25%,#c6efff18 36%,#ffffff60 48%,#ffe1ff16 57%,transparent 68%);background-size:230% 230%;background-position:var(--ps-foil-x,50%) var(--ps-foil-y,50%);opacity:.2}
.ps-stamp-center .ps-certificate-seal{right:auto;left:50%;bottom:4%;transform:translateX(-50%)}.ps-stamp-center.ps-wide-back .ps-certificate-seal{left:25%;width:5.25%}.ps-feature-card .ps-certificate-seal{box-shadow:0 .3px .8px #0008}.ps-card-controls button:focus-visible{outline:2px solid var(--pp-accent);outline-offset:3px}
@media(max-width:850px){.pp-profile-hero{grid-template-columns:minmax(0,1fr);gap:12px}.pp-hero-copy .pp-name{font-size:23px!important}.pp-hero-copy .pp-avatar{width:60px!important;height:60px!important}.ps-rarest-showcase{padding:10px 12px}.ps-rarest-heading{margin-bottom:7px}.ps-rarest-pair{max-width:320px;margin:auto;gap:24px}.ps-spin-stage{max-width:112px}.ps-card-caption{font-size:9px;margin-top:6px}.ps-card-caption small{font-size:9px}.ps-card-controls{margin-top:5px}.ps-card-controls button{padding:4px 9px;min-height:28px}}
@media(max-width:420px){.pp-hero-copy>section>div.relative{padding:14px!important}.pp-hero-copy .pp-stats{padding:10px;gap:7px}.pp-hero-copy .pp-metric{font-size:9px;padding-left:7px}.pp-hero-copy .pp-owned strong{font-size:24px}.pp-hero-copy .pp-owned>span{font-size:8px}}
@media(prefers-reduced-motion:reduce){.ps-loading-dot{animation:none}.ps-card-model{will-change:auto}}
`;
