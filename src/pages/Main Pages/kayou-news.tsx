import React from "react";
import { cardImagePaths, getPromotionalCardsBack } from "@/lib/card-images";
const promoFront = cardImagePaths.ccgPromo("015");
const promoBack = getPromotionalCardsBack(15);
const boxImage = "https://stonestradingco.com/cdn/shop/files/funmoments004.png?v=1789970426&width=1064";
const preorderUrl = "https://stonestradingco.com/products/fun-moments-four";
const logoTiles = Array.from({ length: 24 }, (_, i) => i);
const tickerItems = ["NYCC 2026", "MLPEPR015", "Second weekend in October", "Fun Moments 4 arrives in November"];
const styles = `
.kayou-news{--page-bg:#111315;--page-text:#f5f5f5;--muted:#c5c7ca;--accent:#e7c84b;--accent-soft:#e7c84b18;--accent-border:#e7c84b66;--accent-text:#ffe891;--panel:#17191b;--panel-border:#ffffff15;--fun-bg:linear-gradient(125deg,#151e24,#182831 52%,#1c303a);--fun-title:#effaff;--fun-emphasis:#a9dbef;--fun-copy:#d0e7f0;--fun-eyebrow:#b6e3f3;--fun-button:#8bcde7;--fun-button-text:#173b4e;position:relative;width:100%;margin:0;padding:0;min-height:100vh;overflow:hidden;background:var(--page-bg);color:var(--page-text);isolation:isolate}
html.light .kayou-news,html[data-theme="light"] .kayou-news{--page-bg:hsl(var(--background));--page-text:#18181b;--muted:#52525b;--accent:#886900;--accent-soft:#88690012;--accent-border:#88690055;--accent-text:#725700;--panel:#fff;--panel-border:#00000018;--fun-bg:linear-gradient(125deg,#d9eff8,#c5e5f2 52%,#e6f4f9);--fun-title:#183d53;--fun-emphasis:#3984aa;--fun-copy:#294f63;--fun-eyebrow:#32779c;--fun-button:#246c8e;--fun-button-text:#fff}
html[data-theme="spooky"] .kayou-news{--accent:#c9acff;--accent-soft:#a77be81f;--accent-border:#c9acff88;--accent-text:#ddcaff}
.kayou-news *{box-sizing:border-box}
.kayou-news main,.kayou-news section{width:100%}
.kayou-news .news-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.9fr);align-items:start;gap:2vw;padding:0 clamp(18px,4vw,62px) 16px}
.kayou-news .hero-copy{position:relative;z-index:2;padding-top:10px}
.kayou-news .news-kicker{display:flex;align-items:center;gap:10px;color:var(--accent-text);font-size:12px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}
.kayou-news .news-live-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 16px var(--accent);animation:news-pulse 1.8s ease-in-out infinite}
.kayou-news .news-title{max-width:1000px;margin:14px 0 0;font-size:clamp(54px,9.4vw,148px);line-height:.83;letter-spacing:-.085em;font-weight:950}
.kayou-news .news-title span{display:block;color:var(--accent);text-shadow:0 0 45px color-mix(in srgb,var(--accent) 22%,transparent)}
.kayou-news .news-intro{max-width:640px;margin:22px 0 0;color:var(--muted);font-size:clamp(16px,1.5vw,21px);line-height:1.7}
.kayou-news .promo-stage{position:relative;display:grid;place-items:center;min-width:0;perspective:1200px;isolation:isolate}
.kayou-news .promo-logo-pattern{position:absolute;inset:-16px 0;z-index:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(4,minmax(72px,1fr));place-items:center;overflow:hidden;pointer-events:none}
.kayou-news .promo-logo-pattern img{display:block;width:min(5.8vw,72px);height:min(5.8vw,72px);object-fit:contain;opacity:.2;animation:logo-drift 9s ease-in-out infinite alternate}
.kayou-news .promo-logo-pattern img:nth-child(3n){animation-direction:alternate-reverse;opacity:.14}
.kayou-news .promo-logo-pattern img:nth-child(4n){animation-duration:12s;opacity:.1}
.kayou-news .promo-card{position:relative;z-index:1;width:min(39vw,330px);min-width:220px;aspect-ratio:5/7;transform-style:preserve-3d;animation:promo-slow-turn 28s linear infinite;box-shadow:0 28px 42px #0009}
.kayou-news .promo-card-face{position:absolute;inset:0;overflow:hidden;border:1px solid #ffffff90;border-radius:4.2% / 3%;background:#fff;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.kayou-news .promo-card-front{transform:translateZ(3px)}
.kayou-news .promo-card-back{transform:rotateY(180deg) translateZ(3px)}
.kayou-news .promo-card-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center;border:0;border-radius:inherit;user-select:none;-webkit-user-drag:none}
.kayou-news .promo-front-image{transform:scale(1.025);transform-origin:center}
.kayou-news .promo-card-face:after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(125deg,#fff0 27%,#ffffff44 45%,#fff0 62%);background-size:250% 250%;animation:foil-glint 8s ease-in-out infinite;pointer-events:none;mix-blend-mode:screen}
.kayou-news .promo-rim{position:absolute;inset:0;border:1px solid #ffffff88;border-radius:4.2% / 3%;pointer-events:none}
.kayou-news .promo-rim-front{transform:translateZ(3.4px)}
.kayou-news .promo-rim-back{transform:rotateY(180deg) translateZ(3.4px)}
.kayou-news .ticker{position:relative;overflow:hidden;border-top:1px solid var(--panel-border);border-bottom:1px solid var(--panel-border);background:color-mix(in srgb,var(--page-text) 4%,var(--page-bg))}
.kayou-news .ticker-track{display:flex;width:max-content;animation:ticker-loop 30s linear infinite;will-change:transform}
.kayou-news .ticker-group{display:flex;flex:0 0 auto;width:max-content;justify-content:flex-start;align-items:center}
.kayou-news .ticker span{padding:15px 18px;color:var(--accent);font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap}
.kayou-news .fun-feature{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);align-items:center;gap:4vw;min-height:580px;padding:clamp(28px,6vw,88px);overflow:hidden;background:var(--fun-bg)}
.kayou-news .fun-feature:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 15% 20%,#ffffff22,transparent 28%),radial-gradient(ellipse at 86% 88%,#7fc9ee18,transparent 34%);pointer-events:none}
.kayou-news .fun-content,.kayou-news .fun-art{position:relative;z-index:1}
.kayou-news .fun-eyebrow{color:var(--fun-eyebrow);font-size:13px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}
.kayou-news .fun-title{margin:15px 0 0;color:var(--fun-title);font-size:clamp(58px,10vw,148px);line-height:.82;letter-spacing:-.09em;font-weight:950}
.kayou-news .fun-title span{display:block;color:var(--fun-emphasis)}
.kayou-news .fun-copy{max-width:620px;margin:26px 0 0;color:var(--fun-copy);font-size:clamp(17px,1.7vw,23px);line-height:1.65}
.kayou-news .preorder-link{display:inline-flex;align-items:center;gap:14px;margin-top:30px;border:1px solid color-mix(in srgb,var(--fun-button) 70%,white);border-radius:999px;padding:15px 21px;background:var(--fun-button);color:var(--fun-button-text);font-size:15px;font-weight:900;text-decoration:none;box-shadow:0 12px 35px #397e9d55;transition:transform .2s,box-shadow .2s}
.kayou-news .preorder-link:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 18px 45px #397e9d77}
.kayou-news .preorder-arrow{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:color-mix(in srgb,var(--fun-button-text) 14%,var(--fun-button));font-size:18px}
.kayou-news .fun-art{display:grid;place-items:center;min-height:400px;text-decoration:none}
.kayou-news .fun-box{position:relative;z-index:2;display:block;width:min(100%,560px);max-height:550px;object-fit:contain;filter:drop-shadow(0 24px 30px #10212b66);animation:box-float 5s ease-in-out infinite}
.kayou-news .release-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--panel-border)}
.kayou-news .release-cell{padding:clamp(22px,3vw,42px);background:var(--panel)}
.kayou-news .release-label{color:var(--accent);font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
.kayou-news .release-name{margin-top:10px;color:var(--page-text);font-size:clamp(17px,2vw,25px);font-weight:800}
@keyframes promo-slow-turn{from{transform:rotateX(2deg) rotateY(0)}to{transform:rotateX(2deg) rotateY(360deg)}}
@keyframes foil-glint{0%,100%{background-position:130% 0;opacity:.12}50%{background-position:-30% 100%;opacity:.65}}
@keyframes logo-drift{from{transform:translate3d(-6px,6px,0) rotate(-7deg) scale(.95)}to{transform:translate3d(7px,-9px,0) rotate(7deg) scale(1.04)}}
@keyframes news-pulse{0%,100%{opacity:.55;box-shadow:0 0 8px var(--accent)}50%{opacity:1;box-shadow:0 0 20px var(--accent)}}
@keyframes ticker-loop{to{transform:translateX(-50%)}}
@keyframes box-float{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-12px) rotate(-1deg)}}
@media(max-width:850px){.kayou-news .news-hero,.kayou-news .fun-feature{grid-template-columns:1fr}.kayou-news .news-hero{gap:8px;padding-bottom:20px}.kayou-news .promo-stage{margin-top:4px}.kayou-news .promo-card{width:min(54vw,300px)}.kayou-news .fun-feature{gap:0}.kayou-news .fun-art{min-height:340px}.kayou-news .fun-box{width:min(82%,520px)}}
@media(max-width:560px){.kayou-news .news-title{font-size:clamp(56px,18vw,94px)}.kayou-news .promo-card{width:min(66vw,265px);min-width:205px}.kayou-news .promo-logo-pattern{grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(6,minmax(58px,1fr))}.kayou-news .promo-logo-pattern img{width:min(14vw,62px);height:min(14vw,62px)}.kayou-news .fun-title{font-size:clamp(58px,18vw,94px)}.kayou-news .fun-art{min-height:290px}.kayou-news .release-strip{grid-template-columns:1fr}.kayou-news .release-cell{padding:20px 24px}}
@media(prefers-reduced-motion:reduce){.kayou-news *, .kayou-news *:before,.kayou-news *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;
export default function KayouNews() {
return <div className="kayou-news"><style>{styles}</style><main><section className="news-hero"><div className="hero-copy"><div className="news-kicker"><span className="news-live-dot"/>NYCC 2026 PROMO</div><h1 className="news-title">Kayou US's <span>NYCC Magic</span></h1><p className="news-intro">MLPEPR015 was available at New York Comic Con over the second weekend in October. A special card from the show, slowly turning in 3D.</p></div><div className="promo-stage" aria-label="Slowly rotating 3D view of MLPEPR015"><div className="promo-logo-pattern" aria-hidden="true">{logoTiles.map((tile) => <img key={tile} src="/website-assets/KayouLogoPFP.webp" alt="" style={{ animationDelay: `${(tile % 9) * -0.8}s` }}/>)}</div><div className="promo-card"><div className="promo-card-face promo-card-front"><img className="promo-card-image promo-front-image" src={promoFront} alt="MLPEPR015 front" draggable={false}/><span className="promo-rim promo-rim-front"/></div><div className="promo-card-face promo-card-back"><img className="promo-card-image" src={promoBack} alt="MLPEPR015 back" draggable={false}/><span className="promo-rim promo-rim-back"/></div></div></div></section><div className="ticker" aria-hidden="true"><div className="ticker-track">{[0,1].map((copy) => <div className="ticker-group" key={copy}>{[...tickerItems,...tickerItems].map((item,index) => <span key={`${copy}-${index}`}>{item}</span>)}</div>)}</div></div><section className="fun-feature"><div className="fun-content"><div className="fun-eyebrow">Coming in November</div><h2 className="fun-title">Fun<span>Moments 4</span></h2><p className="fun-copy">A new box is on the way. Take a look at the Fun Moments 4 box and place your preorder through Stone's Trading Co.</p><a className="preorder-link" href={preorderUrl} target="_blank" rel="noopener noreferrer">Preorder Fun Moments 4<span className="preorder-arrow" aria-hidden="true">-&gt;</span></a></div><a className="fun-art" href={preorderUrl} target="_blank" rel="noopener noreferrer" aria-label="View Fun Moments 4 preorder at Stone's Trading Co."><img className="fun-box" src={boxImage} alt="Fun Moments 4 box" loading="lazy"/></a></section><section className="release-strip" aria-label="Release highlights"><div className="release-cell"><div className="release-label">On the table now</div><div className="release-name">Moon: Volume Four</div></div><div className="release-cell"><div className="release-label">Coming in November</div><div className="release-name">Fun Moments: Volume Four</div></div><div className="release-cell"><div className="release-label">From the convention</div><div className="release-name">NYCC Promo MLPEPR015</div></div></section></main></div>;
}
