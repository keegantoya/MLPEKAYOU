import React, { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import CardImage from "@/components/CardImage";
import { getPromotionalCardsBack, cardImagePaths } from "@/lib/card-images";
import { supabase } from "@/lib/supabase";
const giveawayCards = Array.from({ length: 6 }, (_, index) => ({ number: index + 8, code: `MLPEPR${String(index + 8).padStart(3, "0")}`, front: cardImagePaths.ccgPromo(String(index + 8).padStart(3, "0")) }));
const giveawayBack = getPromotionalCardsBack(8);
const INTRO_DURATION = 10000;
const seenFlag = "mlpekayou_sdcc_giveaway_20261101_seen";
const discordUrl = "https://discord.gg/mlpekayou";
const kofiUrl = "https://ko-fi.com/Q2Y429HP6N";
type Phase = "checking" | "waiting" | "playing" | "fan";
const homeStyles = `
.giveaway-home{--gw-bg:hsl(var(--background));--gw-ink:hsl(var(--foreground));--gw-muted:hsl(var(--muted-foreground));--gw-accent:hsl(var(--primary));--gw-card-width:clamp(140px,16vw,228px);--gw-step:clamp(24px,4vw,58px);position:relative;isolation:isolate;width:100%;min-width:0;overflow:clip;background:var(--gw-bg);color:var(--gw-ink)}
.giveaway-home *{box-sizing:border-box}.gw-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:center;gap:clamp(12px,3vw,48px);min-height:clamp(540px,76svh,840px);padding:clamp(24px,4.5vw,74px);isolation:isolate}
.gw-copy{position:relative;z-index:2;min-width:0;max-width:640px}.gw-title{margin:0;font-size:clamp(38px,4.5vw,72px);font-weight:750;line-height:1.06;letter-spacing:-.025em}.gw-title span{display:block;color:var(--gw-accent)}.gw-deadline{margin:16px 0 0;font-size:14px;font-weight:650}.gw-discord-address{display:block;margin-top:9px;font-size:12px;color:var(--gw-muted)}.gw-enter svg{width:19px;height:19px}.gw-support svg{width:21px;height:21px;flex:none}.gw-description{max-width:410px;margin:20px 0 0;font-size:16px;line-height:1.6;color:var(--gw-muted)}.gw-enter{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:44px;margin-top:20px;padding:10px 18px;border:1px solid hsl(var(--primary)/.65);border-radius:8px;background:var(--gw-accent);color:hsl(var(--primary-foreground));font-size:14px;font-weight:650;text-decoration:none;transition:transform .2s,box-shadow .2s}.gw-enter:hover{transform:translateY(-2px);box-shadow:0 8px 28px hsl(var(--primary)/.18)}.gw-support{display:flex;width:fit-content;align-items:center;gap:8px;max-width:100%;margin-top:18px;color:var(--gw-muted);font-size:12px;line-height:1.5;text-decoration:none}.gw-support:hover{color:var(--gw-ink)}.gw-enter:focus-visible,.gw-support:focus-visible,.gw-fan-button:focus-visible{outline:2px solid var(--gw-accent);outline-offset:5px}
.gw-fan-stage{position:relative;width:100%;height:clamp(380px,42vw,570px);min-width:0;isolation:isolate}.gw-fan-stage:after{content:"";position:absolute;bottom:5%;left:12%;right:12%;height:12%;border-radius:50%;background:radial-gradient(ellipse,#0002,transparent 68%);pointer-events:none}.gw-scene{position:absolute;inset:0;perspective:1300px;perspective-origin:50% 50%;z-index:1}.gw-flight{position:absolute;left:50%;top:50%;width:var(--gw-card-width);aspect-ratio:5/7;margin-left:calc(var(--gw-card-width) / -2);margin-top:calc(var(--gw-card-width) * -.7);transform:translate3d(calc(var(--gw-index) * var(--gw-step)),calc(var(--gw-abs) * 8px),0) rotateZ(calc(var(--gw-index) * 9deg));transform-origin:50% 90%;transform-style:preserve-3d;z-index:var(--gw-order);transition:filter .2s}.gw-fan-button{position:relative;display:block;width:100%;height:100%;padding:0;border:0;border-radius:5.5% / 3.93%;background:transparent;transform-style:preserve-3d;transform-origin:50% 80%;cursor:pointer}.gw-card-art{position:absolute;inset:0;display:block;width:100%;height:100%;transform-style:preserve-3d;transform-origin:50% 80%;transition:transform .25s cubic-bezier(.2,.75,.25,1);pointer-events:none}.gw-face{position:absolute;inset:0;display:block;overflow:hidden;border-radius:5.5% / 3.93%;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 12px 28px #0003;background:var(--gw-bg);transform:translateZ(.5px)}.gw-face-back{transform:rotateY(180deg) translateZ(.5px)}.gw-face>img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;object-position:center!important;border:0!important;padding:0!important;margin:0!important;transform:none!important;border-radius:0!important;user-select:none;-webkit-user-drag:none}.gw-face-front:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 28%,#ffffff32 45%,transparent 65%);opacity:.4;transition:opacity .3s}.gw-hero[data-phase="fan"] .gw-flight:hover,.gw-hero[data-phase="fan"] .gw-flight:focus-within,.gw-flight[data-active="true"]{z-index:30}.gw-hero[data-phase="fan"] .gw-fan-button:hover .gw-card-art,.gw-hero[data-phase="fan"] .gw-fan-button:focus-visible .gw-card-art,.gw-hero[data-phase="fan"] .gw-flight[data-active="true"] .gw-card-art{transform:translateY(-22px) rotateY(-5deg) scale(1.06)}.gw-fan-button:hover .gw-face-front:after{opacity:.9}
.gw-hero[data-phase="checking"] .gw-flight,.gw-hero[data-phase="waiting"] .gw-flight{transform:translate3d(calc((6 - var(--gw-order)) * 1.2px),calc((6 - var(--gw-order)) * -1.2px),0) rotateZ(-3deg)}.gw-hero[data-phase="playing"] .gw-flight{will-change:transform;pointer-events:none}.gw-hero[data-phase="playing"] .gw-fan-button{transition:none}.gw-hero[data-phase="playing"] .gw-flight:last-child{z-index:25}.gw-flight-overlay{position:fixed!important;isolation:isolate;overflow:visible!important;background:transparent!important;pointer-events:none!important;z-index:2147483000!important}.gw-flight-overlay .gw-flight{will-change:transform;pointer-events:none}.gw-flight-overlay .gw-flight:last-child{z-index:25}.gw-flight-overlay .gw-fan-button{transition:none}.gw-face-front>img{transform:scale(1.04)!important;transform-origin:center!important}.gw-face-back>img{transform:scale(1.035)!important;transform-origin:center!important}
.gw-fan-stage[data-loading="true"]>.gw-scene{visibility:hidden;pointer-events:none}.gw-fan-stage[data-loading="true"]:after{opacity:0}.gw-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:20px;z-index:2}.gw-loading-logo{display:block;width:82px;height:62px;object-fit:contain;animation:gw-loading-bob 1.8s ease-in-out infinite}.gw-loading-name{font-size:18px;font-weight:750;letter-spacing:.04em;color:var(--gw-accent)}.gw-loading p{margin:0;font-size:14px;line-height:1.5;color:var(--gw-muted)}.gw-loading-track{width:90px;height:3px;border-radius:3px;overflow:hidden;background:hsl(var(--primary)/.15)}.gw-loading-track:after{content:"";display:block;width:36px;height:100%;border-radius:inherit;background:var(--gw-accent);animation:gw-loading-slide 1.2s ease-in-out infinite alternate}.gw-load-retry{min-height:44px;padding:8px 18px;border:1px solid hsl(var(--primary)/.45);border-radius:8px;background:transparent;color:var(--gw-ink);font:inherit;font-size:13px;cursor:pointer}.gw-load-retry:focus-visible{outline:2px solid var(--gw-accent);outline-offset:4px}@keyframes gw-loading-bob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}@keyframes gw-loading-slide{from{transform:translateX(0)}to{transform:translateX(54px)}}
@media(max-width:767px){.giveaway-home{--gw-card-width:clamp(104px,30vw,160px);--gw-step:clamp(24px,6vw,40px)}.gw-hero{grid-template-columns:minmax(0,1fr);gap:8px;min-height:0;padding:12px 18px 100px}.gw-fan-stage{grid-row:1;height:clamp(250px,68vw,360px);margin-bottom:10px}.gw-copy{grid-row:2;max-width:none}.gw-title{font-size:34px;max-width:560px}.gw-description{margin-top:14px;font-size:14px;line-height:1.6;max-width:470px}.gw-enter{margin-top:17px;min-height:46px;font-size:14px;padding:12px 20px}.gw-support{margin-top:18px;font-size:11px}.gw-hero[data-phase="fan"] .gw-fan-button:hover .gw-card-art,.gw-hero[data-phase="fan"] .gw-flight[data-active="true"] .gw-card-art{transform:translateY(-16px) rotateY(-4deg) scale(1.04)}}
@media(prefers-reduced-motion:reduce){.giveaway-home *,.giveaway-home *:before,.giveaway-home *:after{animation:none!important;transition:none!important}.gw-hero[data-phase="fan"] .gw-fan-button:hover .gw-card-art,.gw-hero[data-phase="fan"] .gw-flight[data-active="true"] .gw-card-art{transform:translateY(-12px)}}
`;
function hasLocalSeen(userId: string): boolean { try { return localStorage.getItem(`${seenFlag}:${userId}`) === "true"; } catch { return false; } }
export default function KayouNews() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [loadedFronts, setLoadedFronts] = useState(0);
  const [loadDelayed, setLoadDelayed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const cardsReady = loadedFronts === giveawayCards.length;
  const [viewerId, setViewerId] = useState("");
  const [overlayRect, setOverlayRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const flightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const loadedImages = useRef(new Set<string>());
  const handledViewer = useRef("");
  const completed = useRef(false);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const giveawayEnded = today > "2026-11-01";
  useEffect(() => {
    if (cardsReady) { setLoadDelayed(false); return; }
    const timer = window.setTimeout(() => setLoadDelayed(true), 15000);
    return () => window.clearTimeout(timer);
  }, [cardsReady]);
  useEffect(() => {
    let disposed = false, authRevision = 0;
    const accept = (user: { id: string; user_metadata?: Record<string, unknown> } | undefined) => {
      if (disposed) return;
      if (!user) { handledViewer.current = ""; setViewerId(""); setPhase("fan"); return; }
      if (handledViewer.current === user.id) return;
      handledViewer.current = user.id;
      completed.current = false;
      setViewerId(user.id);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPhase((hasLocalSeen(user.id) || user.user_metadata?.[seenFlag] === true) || reduced ? "fan" : "waiting");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { authRevision++; accept(session?.user); });
    const initialRevision = authRevision;
    void supabase.auth.getSession().then(({ data }) => { if (!disposed && initialRevision === authRevision) accept(data.session?.user); }).catch(() => { if (!disposed) setPhase("fan"); });
    return () => { disposed = true; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (phase !== "waiting") return;
    let cancelled = false, frame = 0;
    const started = performance.now();
    const check = () => {
      if (cancelled) return;
      const ready = giveawayCards.every(card => loadedImages.current.has(card.code)) && loadedImages.current.has("back");
      if (ready) { const rect = stageRef.current?.getBoundingClientRect(); if (rect) setOverlayRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }); setPhase("playing"); return; }
      if (performance.now() - started > 9000) { setPhase("fan"); return; }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [phase, viewerId]);
  useLayoutEffect(() => {
    if (phase !== "playing") { animationsRef.current.forEach(animation => animation.cancel()); animationsRef.current = []; }
  }, [phase]);
  useLayoutEffect(() => {
    if (phase !== "playing" || !stageRef.current || !viewerId) return;
    let cancelled = false;
    const stage = stageRef.current.getBoundingClientRect();
    const finish = () => {
      if (cancelled || completed.current) return;
      completed.current = true;
      try { localStorage.setItem(`${seenFlag}:${viewerId}`, "true"); } catch { /* Keep the account preference when browser storage is unavailable. */ }
      void supabase.auth.getSession().then(({ data }) => { if (data.session?.user.id === viewerId && data.session.user.user_metadata?.[seenFlag] !== true) return supabase.auth.updateUser({ data: { [seenFlag]: true } }); }).catch(() => {});
      setPhase("fan");
    };
    const transform = (x: number, y: number, z: number, rx: number, ry: number, rz: number, scale: number) => `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
    const created = flightRefs.current.map((node, index) => {
      if (!node) return null;
      const fanTransform = getComputedStyle(node).transform;
      const stack = transform((5 - index) * 1.2, (5 - index) * -1.2, 0, 0, 0, -3, 1);
      const lead = index === 5;
      const reach = Math.min(42, stage.width * .11);
      const frames: Keyframe[] = lead ? [
        { offset: 0, transform: stack },
        { offset: .1, transform: stack },
        { offset: .29, transform: transform(-reach, -28, 155, -13, -32, -13, 1.55) },
        { offset: .38, transform: transform(-reach, -28, 155, -13, -32, -13, 1.55) },
        { offset: .53, transform: transform(20, -14, 85, 7, 155, 6, 1.15) },
        { offset: .61, transform: transform(12, -8, 50, 3, 180, 1, 1.06) },
        { offset: .72, transform: transform(0, 0, 0, 0, 360, -3, 1) },
        { offset: .8, transform: transform(0, 0, 0, 0, 360, -3, 1) },
        { offset: 1, transform: fanTransform }
      ] : [
        { offset: 0, transform: stack },
        { offset: .8, transform: stack },
        { offset: 1, transform: fanTransform }
      ];
      return node.animate(frames.map(frame => ({ ...frame, easing: "cubic-bezier(.22,.65,.3,1)" })), { duration: INTRO_DURATION, easing: "linear", fill: "forwards" });
    }).filter((animation): animation is Animation => !!animation);
    animationsRef.current = created;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => { if (reducedMotion.matches) finish(); };
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", finish);
    reducedMotion.addEventListener("change", motionChanged);
    void Promise.all(created.map(animation => animation.finished)).then(finish).catch(() => {});
    return () => { cancelled = true; created.forEach(animation => animation.cancel()); window.removeEventListener("keydown", escape); window.removeEventListener("resize", finish); reducedMotion.removeEventListener("change", motionChanged); };
  }, [phase, viewerId]);
  const cardScene = <div className="gw-scene" ref={sceneRef}>{giveawayCards.map((card, index) => <div key={card.code} ref={node => { flightRefs.current[index] = node; }} className="gw-flight" data-active={activeCard === index} style={{ "--gw-index": index - 2.5, "--gw-abs": Math.abs(index - 2.5), "--gw-order": index + 1 } as CSSProperties}><button type="button" className="gw-fan-button" aria-label={`${card.code}: lift this giveaway card`} aria-pressed={activeCard === index} disabled={phase !== "fan"} onClick={() => setActiveCard(value => value === index ? null : index)}><span className="gw-card-art"><span className="gw-face gw-face-front"><CardImage src={card.front} publicProfile imageSize="original" visible loading="eager" onLoad={() => { loadedImages.current.add(card.code); setLoadedFronts(giveawayCards.filter(item => loadedImages.current.has(item.code)).length); }} draggable={false} alt={`${card.code} front`}/></span><span className="gw-face gw-face-back" aria-hidden="true">{viewerId && <CardImage src={giveawayBack} imageSize="original" visible loading="eager" onLoad={() => { loadedImages.current.add("back"); }} draggable={false} alt=""/>}</span></span></button></div>)}</div>;
  return <div className="giveaway-home" data-intro={phase === "playing"}><style>{homeStyles}</style>{phase === "playing" && overlayRect && createPortal(<div className="giveaway-home gw-flight-overlay" style={overlayRect} aria-hidden="true">{cardScene}</div>, document.body)}<main>
    <section className="gw-hero" data-phase={phase} aria-label="SDCC promo giveaway">
      <div className="gw-copy"><h1 className="gw-title">SDCC promo<span>giveaway :0</span></h1><p className="gw-description">A full set of SDCC Boom Promos!!! Join the server for details!</p><p className="gw-deadline">{giveawayEnded ? "This giveaway has ended. See what’s next in Discord." : "Ends this Sunday · November 1, 2026"}</p><a className="gw-enter" href={discordUrl} target="_blank" rel="noopener noreferrer">{giveawayEnded ? "Visit Discord" : "Enter on Discord"}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></a><span className="gw-discord-address">discord.gg/mlpekayou</span><a className="gw-support" href={kofiUrl} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 28 26" fill="none" aria-hidden="true"><path d="M4 6h17v8a8.5 8.5 0 0 1-17 0V6Z" fill="white" stroke="currentColor" strokeWidth="1.8"/><path d="M21 7h2a4 4 0 0 1 0 8h-2" stroke="currentColor" strokeWidth="1.8"/><path d="M12.5 18s-5-3-5-6a2.8 2.8 0 0 1 5-1.7 2.8 2.8 0 0 1 5 1.7c0 3-5 6-5 6Z" fill="#ff5e5b"/></svg><span>Support MLPEKAYOU on Ko-Fi</span><span className="sr-only"> (opens in a new tab)</span></a></div>
      <div className="gw-fan-stage" ref={stageRef} data-loading={!cardsReady} aria-busy={!cardsReady}>{phase !== "playing" ? cardScene : null}{!cardsReady && <div className="gw-loading"><div aria-hidden="true">{logoFailed ? <span className="gw-loading-name">MLPEKAYOU</span> : <img className="gw-loading-logo" src="/website-assets/darkmodelogo.webp" alt="" onError={() => setLogoFailed(true)}/>}</div><p role="status" aria-live="polite">{loadDelayed ? "The cards are taking a little longer to load." : "hold on just one second..."}</p>{loadDelayed ? <button type="button" className="gw-load-retry" onClick={() => window.location.reload()}>Try again</button> : <span className="gw-loading-track" aria-hidden="true"/>}</div>}</div>
    </section>
  </main></div>;
}
