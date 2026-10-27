import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, Receipt, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import { FRAME_CATALOG, type ProfileAssetUser } from "@/pages/Everypony/profile-assets";
import { supabase } from "@/lib/supabase";
const membershipFrames = ["frame011", "frame012", "frame013"].map(id => FRAME_CATALOG.find(frame => frame.id === id)).filter((frame): frame is NonNullable<typeof frame> => Boolean(frame));
const receiptSections = [
  { title: "User Data Storage", items: ["Egress", "Cached Egress", "Realtime Concurrent Peak Connections", "Edge Functions Invocations", "Realtime Messages (Notifications, conversations, etc)", "Storage Size", "Monthly Active Users", "Disk Size Usage", "Compute Hours"] },
  { title: "Domain", items: ["MLPEKAYOU.COM (Previously copyright struck; now a redirect domain)", "MLPEKAYOU.COMMUNITY"] },
  { title: "Email Services", items: ["Sign-Ups", "Password Resets"] },
  { title: "Website Hosting Services", items: [] },
  { title: "Image Hosting Services", items: ["Workers & Pages", "Observability", "Object Storage for over 7,000 images that are called over 2 million times a week"] },
];
const receiptExtra = "…and many more intricate little things that keep it running…";
const receiptFunding = "Kayou offered funding assistance but did not follow through. Community support keeps this database running.";
function ReceiptText() {
  return <article className="sc-receipt-text" aria-label="MLPEKAYOU itemized running costs"><header><h3>MLPEKAYOU</h3><p>ITEMIZED RUNNING COSTS</p></header>{receiptSections.map(section => <section key={section.title}><h4>{section.title}</h4>{section.items.length > 0 && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}<p className="sc-receipt-extra">{receiptExtra}</p><dl className="sc-receipt-totals"><div><dt>Total / month</dt><dd>$319.99</dd></div><div><dt>Total / year</dt><dd>$3,839.88</dd></div></dl><p className="sc-receipt-funding">{receiptFunding}</p><footer>THANK YOU FOR SUPPORTING MLPEKAYOU</footer></article>;
}
function receiptTexture() {
const width = 340;
const lines: { text: string; y: number; size: number; bold: boolean; centered: boolean }[] = [];
const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("Receipt could not be drawn");
let y = 38;
const line = (text: string, size = 12, bold = false, centered = false) => {
    measure.font = `${bold ? 700 : 400} ${size}px "Courier New", monospace`;
const words = text.split(" ");
let current = "";
    for (const word of words) {
const next = current ? `${current} ${word}` : word;
      if (current && measure.measureText(next).width > width - 52) { lines.push({ text: current, y, size, bold, centered }); y += size * 1.55; current = word; }
      else current = next;
    }
    lines.push({ text: current, y, size, bold, centered }); y += size * 1.55;
  };
  line("MLPEKAYOU", 24, true, true);
  line("ITEMIZED RUNNING COSTS", 10, false, true);
  y += 22;
  for (const section of receiptSections) {
    line(section.title, 14, true);
    for (const item of section.items) line(item, 12);
    y += 17;
  }
  line(receiptExtra, 11);
  y += 22;
const totalsY = y;
  line("TOTAL: $319.99 / MO", 17, true);
  line("$3,839.88 / YR", 15, true);
  y += 19;
  line(receiptFunding, 11);
  y += 20;
  line("THANK YOU FOR SUPPORTING", 10, false, true);
  line("MLPEKAYOU", 12, true, true);
const height = Math.ceil(y + 25);
const canvas = document.createElement("canvas");
  canvas.width = width * 2; canvas.height = height * 2;
const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Receipt could not be drawn");
  ctx.scale(2, 2);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  for (let x = 0; x <= width; x += 4) ctx.lineTo(x, 2 + ((x * 17) % 7) * .45);
  ctx.lineTo(width, height - 5);
  for (let x = width; x >= 0; x -= 4) ctx.lineTo(x, height - 3 - ((x * 13) % 9) * .5);
  ctx.closePath(); ctx.fillStyle = "#f6f2e9"; ctx.fill();
  ctx.save(); ctx.clip();
  for (let index = 0; index < width * height / 95; index += 1) {
const x = (index * 73.391) % width;
const ty = (index * 139.127) % height;
    ctx.fillStyle = index % 2 ? "#756b5d09" : "#ffffff55";
    ctx.fillRect(x, ty, .5, 1);
  }
const folds = [height * .2, height * .4, height * .6, height * .8];
  for (const fold of folds) {
const shade = ctx.createLinearGradient(0, fold - 6, 0, fold + 7);
    shade.addColorStop(0, "#00000000"); shade.addColorStop(.44, "#695b4410"); shade.addColorStop(.51, "#ffffffa0"); shade.addColorStop(1, "#00000000");
    ctx.fillStyle = shade; ctx.fillRect(0, fold - 6, width, 13);
  }
  ctx.strokeStyle = "#41392e50"; ctx.setLineDash([3, 4]); ctx.lineWidth = .7;
  for (const dashY of [88, totalsY - 17]) { ctx.beginPath(); ctx.moveTo(25, dashY); ctx.lineTo(width - 25, dashY); ctx.stroke(); }
  ctx.fillStyle = "#27221c";
  ctx.textBaseline = "alphabetic";
  for (const entry of lines) {
    ctx.font = `${entry.bold ? 700 : 400} ${entry.size}px "Courier New", monospace`;
    ctx.textAlign = entry.centered ? "center" : "left";
    ctx.fillText(entry.text, entry.centered ? width / 2 : 26, entry.y);
  }
  ctx.restore();
  return { canvas, width, height };
}
function receiptMesh(width: number, height: number, time: number, columns = 20, rows = 280) {
const vertices = new Float32Array((columns + 1) * (rows + 1) * 8);
const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
const angles = [0, 1, 2, 3].map(index => (index % 2 ? -1 : 1) * (Math.PI - .095) * (1 - ease((time - index * .22) / .9)));
const step = height / rows;
const tilt = (1 - ease(time / 1.65)) * .1;
let py = 0, pz = 0;
  for (let row = 0; row <= rows; row += 1) {
const along = row / rows;
let angle = 0;
    for (let fold = 0; fold < 4; fold += 1) angle += angles[fold] * ease((along - (fold + 1) * .2 + .008) / .016);
    if (row > 0) { py += Math.cos(angle) * step; pz += Math.sin(angle) * step; }
    for (let column = 0; column <= columns; column += 1) {
const across = column / columns;
const arch = Math.sin(across * Math.PI) * 4 * Math.sin(angle);
const z = pz + arch;
const viewY = py * Math.cos(tilt) - z * Math.sin(tilt);
const viewZ = py * Math.sin(tilt) + z * Math.cos(tilt);
const perspective = 1400 / (1400 + viewZ);
const offset = (row * (columns + 1) + column) * 8;
      vertices[offset] = width / 2 + 24 + (across - .5) * width * perspective;
      vertices[offset + 1] = 20 + viewY * perspective;
      vertices[offset + 2] = viewZ;
      vertices[offset + 3] = -.08 * Math.cos(across * Math.PI) * Math.sin(angle);
      vertices[offset + 4] = Math.sin(angle + tilt);
      vertices[offset + 5] = Math.cos(angle + tilt);
      vertices[offset + 6] = across;
      vertices[offset + 7] = along;
    }
  }
  return vertices;
}
function ReceiptPaper({ replay }: { replay: number }) {
const ref = useRef<HTMLCanvasElement>(null);
const [fallback, setFallback] = useState(false);
  useEffect(() => {
const canvas = ref.current;
    if (!canvas) return;
let frame = 0;
let disposed = false;
let release = () => {};
const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); setFallback(true); };
    try {
const paper = receiptTexture();
const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
      if (!gl) { setFallback(true); return; }
const width = paper.width + 48, height = paper.height + 48;
const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * ratio); canvas.height = Math.ceil(height * ratio);
      canvas.style.aspectRatio = `${width} / ${height}`;
const shaders: WebGLShader[] = [];
const buffers: WebGLBuffer[] = [];
let program: WebGLProgram | null = null;
let texture: WebGLTexture | null = null;
      release = () => { for (const buffer of buffers) gl.deleteBuffer(buffer); for (const shader of shaders) gl.deleteShader(shader); if (program) gl.deleteProgram(program); if (texture) gl.deleteTexture(texture); };
const shader = (type: number, source: string) => {
const result = gl.createShader(type);
        if (!result) throw new Error("Receipt renderer unavailable");
        shaders.push(result); gl.shaderSource(result, source); gl.compileShader(result);
        if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error("Receipt renderer unavailable");
        return result;
      };
const vertex = shader(gl.VERTEX_SHADER, `attribute vec3 position;attribute vec3 normal;attribute vec2 uv;uniform vec2 resolution;varying vec2 paperUV;varying vec3 paperNormal;void main(){paperUV=uv;paperNormal=normal;gl_Position=vec4(position.x/resolution.x*2.0-1.0,1.0-position.y/resolution.y*2.0,position.z/2000.0,1.0);}`);
const fragment = shader(gl.FRAGMENT_SHADER, `precision mediump float;uniform sampler2D paper;varying vec2 paperUV;varying vec3 paperNormal;void main(){vec4 ink=texture2D(paper,paperUV);if(ink.a<0.08)discard;vec3 n=normalize(paperNormal);float lighting=0.65+0.35*abs(dot(n,normalize(vec3(-0.2,-0.35,1.0))));vec3 front=ink.rgb;vec3 back=mix(vec3(0.965,0.947,0.907),ink.rgb,0.045);vec3 color=gl_FrontFacing?front:back;gl_FragColor=vec4(color*lighting,ink.a);}`);
      program = gl.createProgram();
      if (!program) throw new Error("Receipt renderer unavailable");
      gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Receipt renderer unavailable");
      gl.useProgram(program); gl.frontFace(gl.CW); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
const columns = 20, rows = 280;
const indices = new Uint16Array(columns * rows * 6);
let cursor = 0;
      for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
const first = row * (columns + 1) + column, below = first + columns + 1;
        indices.set([first, first + 1, below, first + 1, below + 1, below], cursor); cursor += 6;
      }
const positionBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer();
      if (!positionBuffer || !indexBuffer) throw new Error("Receipt renderer unavailable");
      buffers.push(positionBuffer, indexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, (columns + 1) * (rows + 1) * 8 * 4, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      for (const [name, count, offset] of [["position", 3, 0], ["normal", 3, 12], ["uv", 2, 24]] as const) {
const location = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, count, gl.FLOAT, false, 32, offset);
      }
      texture = gl.createTexture();
      if (!texture) throw new Error("Receipt renderer unavailable");
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paper.canvas);
      gl.uniform1i(gl.getUniformLocation(program, "paper"), 0); gl.uniform2f(gl.getUniformLocation(program, "resolution"), width, height);
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0);
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
let start: number | undefined;
const draw = (now: number) => {
        if (disposed) return;
        if (start === undefined) start = now;
const time = reduceMotion ? 2 : Math.min((now - start) / 1000, 2);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferSubData(gl.ARRAY_BUFFER, 0, receiptMesh(paper.width, paper.height, time, columns, rows)); gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        if (time < 2) frame = requestAnimationFrame(draw);
      };
      canvas.addEventListener("webglcontextlost", lost);
      frame = requestAnimationFrame(draw);
    } catch { release(); setFallback(true); }
    return () => { disposed = true; cancelAnimationFrame(frame); canvas.removeEventListener("webglcontextlost", lost); release(); };
  }, [replay]);
  return fallback ? <ReceiptText/> : <div className="sc-receipt-paper"><canvas ref={ref} aria-hidden="true"/><div className="sr-only"><ReceiptText/></div></div>;
}
function FundingStory() {
  return <article className="sc-funding-story" aria-label="Why funding MLPEKAYOU is difficult"><h3>Why is it so hard to keep the website funded?</h3><p>I am a disabled veteran who has been deemed unable to get a job due to extensive heart and brain damage. I will likely be getting a stent in my heart in the next few years, and I am in cognitive therapy to attempt to regain what has been lost.</p><h3>What else is going on?</h3><p>I am attempting to get a house in this horrid economy at the big age of 25. My car is fifteen years old with over 230,000 miles on it, and I have rebuilt the engine myself.</p><p>I have been in a bad place for a long time now, even when I was enlisted.</p><p>I am very busy. I work several web development jobs. MLPEKAYOU has over 2,000 hours of unpaid work poured into it. I started the website in January 2026 and beta launched in April of 2026. Since then, it has changed and grown and become this massive website that is impossibly expensive to maintain in my current situation.</p><p>Web development doesn’t pay enough to support me, much less me and my baby… my baby being MLPEKAYOU. If it comes down to choosing MLPEKAYOU or myself, I will have to choose myself.</p></article>;
}
function RunningCostsReceipt({ open, onClose }: { open: boolean; onClose: () => void }) {
const [replay, setReplay] = useState(0);
const [textOnly, setTextOnly] = useState(false);
const [slide, setSlide] = useState<0 | 1>(0);
const scroll = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const transitionTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => { if (transitionTimer.current !== undefined) window.clearTimeout(transitionTimer.current); }, []);
  const changeSlide = (value: 0 | 1) => {
    if (value === slide || transitioning) return;
    setDirection(value > slide ? 1 : -1);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setSlide(value); if (scroll.current) scroll.current.scrollTop = 0; return; }
    setTransitioning(true);
    transitionTimer.current = window.setTimeout(() => { setSlide(value); setTransitioning(false); if (scroll.current) scroll.current.scrollTop = 0; transitionTimer.current = undefined; }, 160);
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="sc-receipt-dialog z-[120020]"><header className="sc-receipt-toolbar"><div><DialogTitle>{slide === 0 ? "Itemized receipt" : "Keeping MLPEKAYOU funded"}</DialogTitle><DialogDescription>{slide === 0 ? "What keeps MLPEKAYOU running" : "A note from Keegan"}</DialogDescription></div><button type="button" onClick={onClose} aria-label="Close itemized receipt"><X size={20}/></button></header><nav className="sc-receipt-tabs" aria-label="Running costs pages"><button type="button" aria-pressed={slide === 0} disabled={transitioning} onClick={() => changeSlide(0)}>Itemized costs</button><button type="button" aria-pressed={slide === 1} disabled={transitioning} onClick={() => changeSlide(1)}>Why funding is difficult</button></nav>{slide === 0 && <div className="sc-receipt-controls"><button type="button" aria-label="Replay receipt unfolding" title="Replay receipt unfolding" onClick={() => { setTextOnly(false); setReplay(value => value + 1); if (scroll.current) scroll.current.scrollTop = 0; }}><RotateCcw size={14}/>Replay sick animation that totally didn't take me two hours</button><button type="button" aria-pressed={textOnly} onClick={() => { setTextOnly(value => !value); if (scroll.current) scroll.current.scrollTop = 0; }}>{textOnly ? "Reciept Looking View" : "Easier On the Eyes View"}</button></div>}<div className="sc-receipt-scroll" data-phase={transitioning ? "leaving" : "entered"} style={{ "--sc-slide-direction": direction } as CSSProperties} ref={scroll} key={slide}>{slide === 1 ? <FundingStory/> : textOnly ? <ReceiptText/> : <ReceiptPaper replay={replay}/>}</div><footer className="sc-receipt-navigation"><button type="button" disabled={slide === 0 || transitioning} onClick={() => changeSlide(0)} aria-label="Previous slide"><ChevronLeft size={16}/>Back</button><span aria-live="polite">{slide + 1} of 2</span><button type="button" disabled={slide === 1 || transitioning} onClick={() => changeSlide(1)}>Next<ChevronRight size={16}/></button></footer></DialogContent></Dialog>;
}
const pageCSS = `
.sc-page{--sc-bg:#101213;--sc-panel:#16191a;--sc-text:#f4f4f1;--sc-muted:#a9aeac;--sc-line:#ffffff18;--sc-accent:hsl(var(--primary));width:100%;min-width:0;padding:24px clamp(16px,2.5vw,40px) max(30px,env(safe-area-inset-bottom,0px));background:var(--sc-bg);color:var(--sc-text);font-family:'Oxanium',sans-serif}.sc-page[data-light=true]{--sc-bg:#f5f5f3;--sc-panel:#fff;--sc-text:#242726;--sc-muted:#626864;--sc-line:#00000018}.sc-page *{box-sizing:border-box}.sc-page h1,.sc-page h2,.sc-page h3,.sc-page p{margin:0}.sc-page a:focus-visible{outline:2px solid var(--sc-accent);outline-offset:4px}.sc-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}.sc-heading h1{font-size:26px;font-weight:600;letter-spacing:-.025em;line-height:1.2}.sc-back{font-size:12px;color:var(--sc-muted);white-space:nowrap}.sc-feature-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:stretch}.sc-site-support,.sc-kofi{min-width:0;background:transparent;border:0;border-radius:0;padding:0}.sc-site-intro{display:grid;grid-template-columns:160px minmax(0,1fr);align-items:center;gap:24px}.sc-owner-photo{display:block;width:160px;height:172px;object-fit:cover;object-position:25% center;border-radius:12px}.sc-page h2{font-size:23px;font-weight:600;letter-spacing:-.025em;line-height:1.25}.sc-body{font-size:14px;line-height:1.7;color:var(--sc-muted)}.sc-site-intro .sc-body{margin-top:12px;max-width:62ch}.sc-store{display:flex;align-items:center;justify-content:space-between;gap:22px;margin-top:22px;padding-top:20px;border-top:1px solid var(--sc-line)}.sc-store>div{min-width:0;max-width:65ch}.sc-store h3{font-size:17px;font-weight:600;margin-bottom:6px}.sc-store .sc-body{font-size:13px}.sc-store strong{font-weight:600;color:var(--sc-text)}.sc-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;border-radius:10px;padding:9px 13px;color:var(--sc-accent);font-size:12px;font-weight:600;white-space:normal;text-decoration:none;line-height:1.4;transition:background-color .16s}.sc-action svg{width:15px;height:15px;flex-shrink:0}.sc-action--button{background:var(--sc-accent);color:hsl(var(--primary-foreground));flex-shrink:0}.sc-action--button:hover{filter:brightness(1.08)}.sc-action--link{padding-left:0;padding-right:0;justify-content:flex-start}.sc-action--link:hover{text-decoration:underline;text-underline-offset:4px}.sc-kofi-heading{display:flex;align-items:start;justify-content:space-between;gap:20px}.sc-kofi-heading>div{min-width:0}.sc-kofi-heading .sc-body{font-size:13px;margin-top:8px;max-width:50ch}.sc-kofi-heading .sc-action{margin-top:0}.sc-previews{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:600px;margin:7px auto 0}.sc-frame{min-width:0;text-align:center}.sc-frame-art{display:flex;align-items:center;justify-content:center;height:152px;padding:26px 18px;overflow:visible}.sc-frame-avatar{width:80px;max-width:100%}.sc-price{font-size:19px;font-weight:600;line-height:1.3}.sc-price span{display:block;margin-top:3px;font-size:11px;font-weight:400;color:var(--sc-muted)}.sc-preview-note{margin-top:10px!important;text-align:center;font-size:11px;color:var(--sc-muted);line-height:1.5}.sc-frame-footer{display:flex;align-items:center;justify-content:space-between;gap:22px;border-top:1px solid var(--sc-line);padding-top:16px;margin-top:17px}.sc-frame-footer .sc-body{font-size:12px;max-width:60ch}.sc-frame-footer strong{display:block;color:var(--sc-text);font-weight:600;margin-bottom:3px}.sc-frame-footer .sc-action{flex-shrink:0}.sc-approval-note{font-size:11px;line-height:1.6;color:var(--sc-muted);margin-top:7px!important}.sc-community{margin-top:28px}.sc-community>h2{font-size:20px;margin-bottom:15px}.sc-creators{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.sc-creator{display:grid;grid-template-columns:142px minmax(0,1fr);gap:20px;align-items:center;min-width:0;padding:18px 0;background:transparent;border:0;border-radius:0}.sc-product{display:flex;align-items:center;justify-content:center;width:142px;height:156px;overflow:hidden;border-radius:10px}.sc-product img{display:block;width:100%;height:100%;object-fit:contain}.sc-creator h3{font-size:21px;line-height:1.3;font-weight:600;letter-spacing:-.015em}.sc-creator .sc-body{font-size:13px;margin-top:7px}.sc-creator .sc-action{margin-top:7px}.sc-creator--site{display:flex;align-items:center;padding:18px 0}.sc-creator--site h3{font-size:29px;letter-spacing:-.035em}.sc-foot{padding-top:17px;font-size:11px;color:var(--sc-muted)}
@media(min-width:1600px){.sc-site-intro{grid-template-columns:200px minmax(0,1fr);gap:28px}.sc-owner-photo{width:200px;height:202px}.sc-creator{grid-template-columns:168px minmax(0,1fr);gap:24px}.sc-product{width:168px;height:174px}}
@media(max-width:1250px){.sc-site-support,.sc-kofi{padding:0}.sc-site-intro{grid-template-columns:118px minmax(0,1fr);gap:18px}.sc-owner-photo{width:118px;height:150px}.sc-store{display:block}.sc-store .sc-action{margin-top:12px}.sc-kofi-heading{display:block}.sc-kofi-heading .sc-action{margin-top:10px}.sc-previews{gap:10px}.sc-frame-footer{display:block}.sc-frame-footer .sc-action{margin-top:5px}.sc-creator{grid-template-columns:96px minmax(0,1fr);gap:14px;padding:16px 0}.sc-product{width:96px;height:118px}.sc-creator h3{font-size:18px}.sc-creator--site{display:flex}.sc-creator--site h3{font-size:26px}}
@media(max-width:850px){.sc-feature-grid{grid-template-columns:minmax(0,1fr);gap:16px}.sc-site-intro{grid-template-columns:130px minmax(0,1fr)}.sc-owner-photo{width:130px;height:140px}.sc-store{display:flex}.sc-store .sc-action{margin-top:0}.sc-kofi-heading{display:flex}.sc-kofi-heading .sc-action{margin-top:0}.sc-frame-footer{display:flex}.sc-frame-footer .sc-action{margin-top:0}.sc-previews{max-width:480px}.sc-frame-art{height:140px}.sc-frame-avatar{width:74px}.sc-creators{grid-template-columns:minmax(0,1fr)}.sc-creator{grid-template-columns:116px minmax(0,1fr);padding:16px 0;gap:20px}.sc-product{width:116px;height:116px}.sc-creator--site{display:flex;min-height:0;padding:16px 0}.sc-community{margin-top:24px}}
@media(max-width:540px){.sc-page{padding-top:16px}.sc-heading{margin-bottom:16px}.sc-heading h1{font-size:23px}.sc-back{font-size:11px}.sc-site-support,.sc-kofi{padding:0;border-radius:0}.sc-site-intro{grid-template-columns:92px minmax(0,1fr);gap:15px}.sc-owner-photo{width:92px;height:120px;border-radius:10px}.sc-page h2{font-size:19px}.sc-body{font-size:12px;line-height:1.65}.sc-site-intro .sc-body{margin-top:7px}.sc-store{display:block;margin-top:17px;padding-top:15px}.sc-store h3{font-size:15px}.sc-store .sc-body{font-size:12px}.sc-store .sc-action{margin-top:11px}.sc-action{min-height:42px;font-size:12px;padding:10px 12px}.sc-action--link{padding-left:0;padding-right:0}.sc-kofi-heading{display:block}.sc-kofi-heading .sc-body{font-size:12px;margin-top:6px}.sc-kofi-heading .sc-action{margin-top:10px}.sc-previews{gap:5px;margin-top:8px}.sc-frame-art{height:120px;padding:22px 12px}.sc-frame-avatar{width:60px}.sc-price{font-size:17px}.sc-price span{font-size:10px}.sc-preview-note{font-size:10px;margin-top:9px!important}.sc-frame-footer{display:block;padding-top:13px;margin-top:14px}.sc-frame-footer .sc-body{font-size:11px}.sc-frame-footer .sc-action{margin-top:4px}.sc-approval-note{font-size:10px;margin-top:3px!important}.sc-community{margin-top:22px}.sc-community>h2{font-size:18px;margin-bottom:12px}.sc-creators{gap:12px}.sc-creator{grid-template-columns:96px minmax(0,1fr);padding:13px 0;gap:15px;border-radius:0}.sc-product{width:96px;height:102px}.sc-creator h3{font-size:18px}.sc-creator .sc-body{font-size:12px;margin-top:5px}.sc-creator .sc-action{margin-top:3px}.sc-creator--site{display:flex;min-height:0;padding:13px 0}.sc-creator--site h3{font-size:25px}.sc-foot{font-size:10px;padding-top:14px}}
@media(max-width:359px){.sc-site-intro{grid-template-columns:76px minmax(0,1fr);gap:12px}.sc-owner-photo{width:76px;height:110px}.sc-site-intro h2{font-size:17px}.sc-creator{grid-template-columns:78px minmax(0,1fr);gap:12px}.sc-product{width:78px;height:96px}.sc-frame-avatar{width:52px}}
@media(prefers-reduced-motion:reduce){.sc-action{transition:none}}
.sc-feature-grid{gap:28px}.sc-kofi{border-left:1px solid var(--sc-line);padding-left:28px}.sc-community{border-top:1px solid var(--sc-line);padding-top:22px}.sc-creator+.sc-creator{border-left:1px solid var(--sc-line);padding-left:20px}@media(max-width:850px){.sc-feature-grid{gap:22px}.sc-kofi{border-left:0;border-top:1px solid var(--sc-line);padding:20px 0 0}.sc-creator+.sc-creator{border-left:0;border-top:1px solid var(--sc-line);padding-left:0}.sc-community{padding-top:18px}}
.sc-receipt-trigger{display:inline-flex;align-items:center;gap:7px;min-height:42px;margin-top:8px;padding:3px 0;border:0;background:none;color:var(--sc-accent);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.sc-receipt-trigger:hover{text-decoration:underline;text-underline-offset:4px}.sc-receipt-trigger:focus-visible{outline:2px solid var(--sc-accent);outline-offset:4px;border-radius:6px}
.sc-receipt-dialog{display:flex!important;flex-direction:column!important;gap:0!important;width:calc(100vw - 24px)!important;max-width:530px!important;max-height:min(940px,calc(100dvh - 24px))!important;padding:0!important;overflow:hidden!important;border-radius:16px!important;background:hsl(var(--background));color:hsl(var(--foreground));border:1px solid hsl(var(--border));font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.sc-receipt-dialog>button{display:none}.sc-receipt-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;border-bottom:1px solid hsl(var(--border));flex-shrink:0}.sc-receipt-toolbar h2{font-size:16px;font-weight:600;line-height:1.3}.sc-receipt-toolbar p{font-size:11px;line-height:1.5;margin-top:3px;color:hsl(var(--muted-foreground))}.sc-receipt-toolbar>button{display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex-shrink:0;border:1px solid hsl(var(--border));border-radius:12px;background:transparent}.sc-receipt-tabs{display:flex;gap:6px;padding:7px 12px;border-bottom:1px solid hsl(var(--border));flex-shrink:0}.sc-receipt-tabs button{min-height:40px;padding:8px 10px;border-radius:10px;background:transparent;font-size:12px;font-weight:600;color:hsl(var(--muted-foreground));line-height:1.4}.sc-receipt-tabs button[aria-pressed=true]{background:hsl(var(--primary)/.12);color:hsl(var(--primary))}.sc-receipt-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 16px;flex-shrink:0}.sc-receipt-controls button{display:flex;align-items:center;gap:6px;min-height:36px;padding:4px 0;background:transparent;font-size:11px;color:hsl(var(--muted-foreground))}.sc-receipt-scroll{min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:8px 12px 20px;flex:1;scrollbar-width:thin}.sc-receipt-paper{width:100%;max-width:388px;margin:0 auto}.sc-receipt-paper canvas{display:block;width:100%;height:auto;filter:drop-shadow(0 8px 10px #0003)}.sc-receipt-text{max-width:340px;margin:10px auto 8px;padding:28px 25px;background:#f6f2e9;color:#27221c;box-shadow:0 6px 20px #0002;font-family:"Courier New",monospace;font-size:12px;line-height:1.65;border-radius:1px}.sc-receipt-text header{text-align:center;border-bottom:1px dashed #6b6257;padding-bottom:17px;margin-bottom:20px}.sc-receipt-text h3{margin:0;font-size:24px;font-weight:700;letter-spacing:-1px}.sc-receipt-text header p{font-size:10px;margin:4px 0 0}.sc-receipt-text section{margin:0 0 19px}.sc-receipt-text h4{font-size:14px;line-height:1.4;font-weight:700;margin:0 0 6px}.sc-receipt-text ul{list-style:none;margin:0;padding:0;font-size:12px}.sc-receipt-text li{margin:3px 0;overflow-wrap:anywhere}.sc-receipt-extra{font-size:11px;margin:0 0 18px}.sc-receipt-totals{margin:0;padding-top:15px;border-top:1px dashed #6b6257}.sc-receipt-totals>div{display:flex;justify-content:space-between;gap:10px;font-size:14px;font-weight:700}.sc-receipt-totals dt,.sc-receipt-totals dd{margin:0}.sc-receipt-funding{font-size:11px;margin:19px 0}.sc-receipt-text footer{text-align:center;font-size:10px;border-top:1px dashed #6b6257;padding-top:16px}.sc-funding-story{margin:8px auto;max-width:450px;padding:23px 24px;background:#f6f2e9;color:#27221c;box-shadow:0 6px 20px #0002;border-radius:2px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.sc-funding-story h3{font-size:18px;font-weight:650;line-height:1.4;margin:0 0 12px}.sc-funding-story h3:not(:first-child){margin-top:26px}.sc-funding-story p{font-size:14px;line-height:1.8;margin:0 0 17px}.sc-funding-story p:last-child{margin-bottom:0}.sc-receipt-navigation{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid hsl(var(--border));padding:7px 12px;flex-shrink:0}.sc-receipt-navigation button{display:flex;align-items:center;gap:4px;min-height:40px;padding:7px 8px;font-size:12px;font-weight:600;background:transparent}.sc-receipt-navigation button:disabled{opacity:.3;cursor:default}.sc-receipt-navigation>span{font-size:11px;color:hsl(var(--muted-foreground))}.sc-receipt-dialog button:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:2px;border-radius:8px}
@media(max-width:540px){.sc-receipt-toolbar{padding:10px 12px}.sc-receipt-toolbar h2{font-size:15px}.sc-receipt-tabs{padding:5px 8px;gap:2px}.sc-receipt-tabs button{font-size:11px;padding:7px 8px}.sc-receipt-scroll{padding:4px 8px 15px}.sc-receipt-text{padding:24px 20px}.sc-funding-story{padding:20px}.sc-funding-story h3{font-size:17px}.sc-funding-story p{font-size:13px;line-height:1.75}.sc-receipt-controls{padding:4px 12px}}
.sc-page{position:relative;isolation:isolate}
.sc-page::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 8% 15%,hsl(var(--primary)/.065),transparent 46%),radial-gradient(ellipse at 88% 70%,hsl(var(--primary)/.04),transparent 42%);background-size:135% 140%;animation:scAmbientDrift 22s ease-in-out infinite alternate}
.sc-heading h1{position:relative;padding-bottom:7px}
.sc-heading h1::after{content:"";position:absolute;bottom:0;left:0;width:min(180px,70%);height:2px;background:linear-gradient(90deg,transparent,hsl(var(--primary)/.75),transparent);background-size:220% 100%;animation:scAccentTravel 7s ease-in-out infinite}
.sc-owner-photo{animation:scPhotoFloat 9s ease-in-out infinite;will-change:transform}
.sc-frame-art{animation:scFrameFloat 6s ease-in-out infinite;will-change:transform}
.sc-frame:nth-child(2) .sc-frame-art{animation-delay:-2s}
.sc-frame:nth-child(3) .sc-frame-art{animation-delay:-4s}
.sc-product img{animation:scProductBreathe 13s ease-in-out infinite;transform-origin:center}
.sc-creator:nth-child(2) .sc-product img{animation-delay:-6s}
.sc-action--button{position:relative;overflow:hidden;isolation:isolate;transition:filter .2s,box-shadow .2s}
.sc-action--button::after{content:"";position:absolute;inset:-70% -90%;pointer-events:none;background:linear-gradient(110deg,transparent 40%,#ffffff26 49%,transparent 58%);transform:translateX(-48%);animation:scButtonSheen 8s ease-in-out infinite}
.sc-kofi-heading .sc-action--button::after{animation-delay:-4s}
.sc-action svg,.sc-receipt-trigger svg{transition:transform .25s cubic-bezier(.2,.7,.2,1)}
.sc-action:hover svg{transform:translate(2px,-2px)}
.sc-receipt-trigger>svg{animation:scReceiptNudge 5.5s ease-in-out infinite;transform-origin:50% 30%}
.sc-receipt-trigger:hover>svg{animation-play-state:paused;transform:rotate(-8deg)}
.sc-action--button:hover{box-shadow:0 4px 18px hsl(var(--primary)/.18)}
.sc-creator .sc-product{transition:filter .3s}
.sc-creator:hover .sc-product{filter:brightness(1.07)}
[data-sc-reveal]{transition:opacity .7s ease,transform .7s cubic-bezier(.18,.75,.23,1)}
[data-sc-reveal=pending]{opacity:0;transform:translateY(14px)}
[data-sc-reveal=visible]{opacity:1;transform:translateY(0)}
.sc-funding-story{background:transparent;color:hsl(var(--foreground));box-shadow:none;border-radius:0;padding:20px 12px;max-width:450px}
.sc-funding-story h3{color:hsl(var(--foreground));font-size:19px;line-height:1.45}
.sc-funding-story h3:first-child{padding-bottom:13px;border-bottom:1px solid hsl(var(--primary)/.3)}
.sc-funding-story p{color:hsl(var(--muted-foreground));line-height:1.85}
.sc-funding-story>h3,.sc-funding-story>p{animation:scStoryReveal .55s both}
.sc-funding-story>:nth-child(2){animation-delay:.07s}.sc-funding-story>:nth-child(3){animation-delay:.12s}.sc-funding-story>:nth-child(4){animation-delay:.17s}.sc-funding-story>:nth-child(5){animation-delay:.22s}.sc-funding-story>:nth-child(6){animation-delay:.27s}.sc-funding-story>:nth-child(7){animation-delay:.32s}
.sc-receipt-scroll{animation:scSlideArrive .4s cubic-bezier(.2,.7,.2,1) both;transition:opacity .16s ease,transform .16s ease}
.sc-receipt-scroll[data-phase=leaving]{animation:none;opacity:0;transform:translateX(calc(var(--sc-slide-direction,1) * -18px))}
.sc-receipt-tabs button,.sc-receipt-navigation button,.sc-receipt-controls button{transition:color .2s,background-color .2s,opacity .2s}
.sc-receipt-controls button:hover,.sc-receipt-navigation button:not(:disabled):hover{color:hsl(var(--primary))}
.sc-receipt-text{animation:scTextAppear .4s ease both}
@keyframes scAmbientDrift{0%{background-position:0% 0%}100%{background-position:100% 75%}}
@keyframes scAccentTravel{0%,100%{background-position:0% 0;opacity:.45}50%{background-position:100% 0;opacity:1}}
@keyframes scPhotoFloat{0%,100%{transform:translateY(0) rotate(-.25deg)}50%{transform:translateY(-4px) rotate(.25deg)}}
@keyframes scFrameFloat{0%,100%{transform:translateY(1px)}50%{transform:translateY(-5px)}}
@keyframes scProductBreathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.025) translateY(-2px)}}
@keyframes scButtonSheen{0%,65%{transform:translateX(-48%);opacity:0}70%{opacity:1}90%{transform:translateX(48%);opacity:1}100%{transform:translateX(48%);opacity:0}}
@keyframes scReceiptNudge{0%,72%,100%{transform:rotate(0deg) translateY(0)}80%{transform:rotate(-8deg) translateY(-1px)}88%{transform:rotate(5deg) translateY(0)}}
@keyframes scStoryReveal{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
@keyframes scSlideArrive{from{opacity:0;transform:translateX(calc(var(--sc-slide-direction,1) * 18px))}to{opacity:1;transform:translateX(0)}}
@keyframes scTextAppear{from{opacity:.4;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:540px){.sc-funding-story{padding:16px 10px}.sc-funding-story h3{font-size:17px}.sc-page::before{background-size:170% 130%}}
@media(prefers-reduced-motion:reduce){.sc-page::before,.sc-heading h1::after,.sc-owner-photo,.sc-frame-art,.sc-product img,.sc-action--button::after,.sc-receipt-trigger>svg,.sc-funding-story>h3,.sc-funding-story>p,.sc-receipt-scroll,.sc-receipt-text{animation:none!important;transform:none!important}.sc-page *,.sc-receipt-dialog *{transition:none!important}[data-sc-reveal=pending]{opacity:1;transform:none}}
.sc-receipt-dialog{height:min(640px,74dvh)!important;max-height:min(640px,74dvh)!important}
.sc-receipt-toolbar{padding:9px 13px}.sc-receipt-tabs{padding:4px 9px}.sc-receipt-tabs button{min-height:36px;padding:6px 9px}.sc-receipt-controls{padding:2px 13px;min-height:36px}.sc-receipt-controls button{min-height:32px}.sc-receipt-navigation{padding:4px 9px}.sc-receipt-navigation button{min-height:36px}.sc-receipt-scroll{flex:1;min-height:0}
@media(max-width:540px){.sc-receipt-dialog{height:min(520px,68dvh)!important;max-height:min(520px,68dvh)!important}.sc-receipt-toolbar{padding:8px 11px}.sc-receipt-toolbar>button{width:34px;height:34px;border-radius:10px}.sc-receipt-toolbar h2{font-size:14px}.sc-receipt-toolbar p{font-size:10px}.sc-receipt-tabs{padding:3px 7px}.sc-receipt-tabs button{min-height:34px;padding:6px 7px;font-size:10px}.sc-receipt-controls{padding:1px 11px;gap:8px}.sc-receipt-controls>button:first-child{font-size:0;width:34px;height:34px;flex:0 0 34px;justify-content:center;padding:0;gap:0}.sc-receipt-controls>button:first-child svg{width:16px;height:16px}.sc-receipt-controls>button:last-child{font-size:10px}.sc-receipt-navigation{padding:3px 8px}.sc-receipt-navigation button{min-height:34px}.sc-receipt-scroll{padding-top:3px}}
`;
function Outbound({ href, children, button = false }: { href: string; children: ReactNode; button?: boolean }) {
  return <a className={`sc-action ${button ? "sc-action--button" : "sc-action--link"}`} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>;
}
export default function SupportCreators() {
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!pageRef.current || typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const sections = Array.from(pageRef.current.querySelectorAll<HTMLElement>(".sc-site-intro,.sc-store,.sc-kofi-heading,.sc-frame-footer,.sc-community>h2,.sc-creator,.sc-foot"));
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.scReveal = "visible"; observer.unobserve(entry.target); } }, { threshold: .08 });
    sections.forEach((section, index) => { section.dataset.scReveal = "pending"; section.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`; observer.observe(section); });
    return () => { observer.disconnect(); sections.forEach(section => { delete section.dataset.scReveal; section.style.removeProperty("transition-delay"); }); };
  }, []);
const [receiptOpen, setReceiptOpen] = useState(false);
const [light, setLight] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "light");
const client = useQueryClient();
const { data: viewer, isPending, isError } = useQuery({
    queryKey: ["support-creators-avatar"],
    queryFn: async (): Promise<ProfileAssetUser | null> => {
const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.user) return null;
const result = await supabase.from("profiles").select("id, avatar_url, avatar_frame").eq("id", data.session.user.id).maybeSingle();
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  useEffect(() => {
const sync = () => setLight(document.documentElement.dataset.theme === "light");
const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") client.setQueryData(["support-creators-avatar"], null);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void client.invalidateQueries({ queryKey: ["support-creators-avatar"] });
    });
    sync();
    return () => { observer.disconnect(); subscription.unsubscribe(); };
  }, [client]);
  return <main ref={pageRef} className="sc-page" data-light={light}>
    <style>{pageCSS}</style>
    <header className="sc-heading"><h1>Support MLPEKAYOU Or Other Community Creators</h1></header>
    <div className="sc-feature-grid">
      <section className="sc-site-support" aria-labelledby="sc-support-title">
        <div className="sc-site-intro"><img className="sc-owner-photo" src="/kayou's-assets/IMG_0567.webp" alt="Keegan, MLPEKAYOU developer" decoding="async"/><div><h2 id="sc-support-title">Support MLPEKAYOU</h2><p className="sc-body">MLPEKAYOU is operated by a disabled veteran and remains free of advertisements and paywalls. Support helps cover the website’s running costs, which are $319.99/mo and $3,839.88/yr. These bills were calculated before the adding of Chinese sets and will increase.</p><button type="button" className="sc-receipt-trigger" onClick={() => setReceiptOpen(true)} aria-haspopup="dialog"><Receipt size={15} aria-hidden="true"/>View itemized receipt</button></div></div>
        <div className="sc-store"><div><h3>StonesTradingCo</h3><p className="sc-body">Select <strong>MLPEKAYOU</strong> under “Where did you hear about us?” at checkout. The commission supports MLPEKAYOU at no additional cost... not to mention, if you order items available from the developer's location, you recieve free stickers of the MLPEKAYOU logo, or keychains and pins of the logo!</p></div><Outbound href="https://stonestradingco.com/collections/my-little-pony" button>Shop My Little Pony!</Outbound></div>
      </section>
      <section className="sc-kofi" aria-labelledby="sc-frames-title">
        <div className="sc-kofi-heading"><div><h2 id="sc-frames-title">Ko-Fi support</h2><p className="sc-body">Support MLPEKAYOU directly with a contribution or a monthly membership. There is no such thing as a contribution 'too small,' everything helps fund something here!</p></div><Outbound href="https://ko-fi.com/mlpekayou" button>Visit Ko-Fi</Outbound></div>
        <div className="sc-previews">{membershipFrames.map(frame => <div className="sc-frame" key={frame.id}><div className="sc-frame-art"><ProfileAvatar profile={viewer} preview frameId={frame.id} alt={`${frame.name} preview`} className="sc-frame-avatar rounded-2xl"/></div><div className="sc-price">${frame.kofiMonthly} <span>USD / month</span></div></div>)}</div><p className="sc-preview-note">{isPending ? "Loading your avatar…" : viewer ? "These are the unlockable frames through Ko-Fi memberships." : isError ? "Example previews · your avatar could not be loaded" : "Sign in to preview your avatar"}</p>
        <div className="sc-frame-footer"><p className="sc-body"><strong>Permanent supporter frames</strong>Approved frames stay unlocked permanently, even after a membership ends. Apply for these frames in your profile.</p><Link className="sc-action sc-action--link" to="/Personal/change-avatar">Request a frame <ArrowUpRight aria-hidden="true"/></Link></div>
      </section>
    </div>
    <section className="sc-community" aria-labelledby="sc-community-title"><h2 id="sc-community-title">Community creators</h2><div className="sc-creators">
      <article className="sc-creator"><a className="sc-product" href="https://www.doodlebinder.com" target="_blank" rel="noopener noreferrer" aria-label="Browse Eternal’s binders on DoodleBinder (opens in a new tab)"><img src="/website-assets/binder3custom.webp" alt="Eternal’s custom binder" loading="lazy" decoding="async"/></a><div><h3>Eternal’s binders</h3><p className="sc-body">Custom binders from DoodleBinder.</p><Outbound href="https://www.doodlebinder.com">Browse binders</Outbound></div></article>
      <article className="sc-creator"><a className="sc-product" href="https://trulynerdy.com/collections/playmats" target="_blank" rel="noopener noreferrer" aria-label="Browse Carly K’s work on Truly Nerdy (opens in a new tab)"><img src="/website-assets/carlykmats.webp" alt="Carly K’s custom playmats" loading="lazy" decoding="async"/></a><div><h3>Carly K</h3><p className="sc-body">Playmats, binders, and more.</p><Outbound href="https://trulynerdy.com/collections/playmats">Visit Truly Nerdy</Outbound></div></article>
      <article className="sc-creator sc-creator--site"><div><h3>PonyRec</h3><p className="sc-body">Tangent’s My Little Pony TCG website.</p><Outbound href="https://ponyrec.net">Visit PonyRec</Outbound></div></article>
    </div></section>
    <footer className="sc-foot">Support is optional. MLPEKAYOU stays free to use.</footer>
    {receiptOpen && <RunningCostsReceipt open={receiptOpen} onClose={() => setReceiptOpen(false)}/>}
  </main>;
}
