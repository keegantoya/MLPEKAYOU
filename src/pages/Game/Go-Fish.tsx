import CardImage from "@/components/CardImage";
import { moonCatalog, starCatalog, rainbowCatalog, funCatalog, promosCatalog } from "@/lib/iso-card-catalog";
import { cardImagePaths, getMoonOneBack } from "@/lib/card-images";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
type SetConfig = {
  id: string;
  name: string;
  folder: string;
  prefix: string;
  rarities: Record<string, number>;
};
type GameCard = {
  id: string;
  pairId: string;
  setId: string;
  rarity: string;
  front: string;
  back: string;
  label: string;
};
type Turn = "player" | "bot";
type Phase = "setup" | "playing" | "complete";
type GameState = {
  phase: Phase;
  deck: GameCard[];
  playerHand: GameCard[];
  botHand: GameCard[];
  playerBooks: GameCard[];
  botBooks: GameCard[];
  turn: Turn;
  message: string;
  back: string;
};
const CCG_SETS: SetConfig[] = [
  { id: "1", name: "Moon 1", folder: "first-edition-moon", prefix: "M1", rarities: { R: 30, SR: 20, SSR: 54, HR: 36, UR: 16, LSR: 15, SGR: 8, SC: 7 } },
  { id: "2", name: "Moon 2", folder: "second-edition-moon", prefix: "M2", rarities: { R: 30, SR: 20, SSR: 54, HR: 30, UR: 16, LSR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 1 } },
  { id: "3", name: "Moon 3", folder: "third-edition-moon", prefix: "M3", rarities: { R: 60, SR: 40, SSR: 40, HR: 60, UR: 18, LSR: 32, SGR: 16, ZR: 14, SC: 7, SZR: 3 } },
  { id: "13", name: "Moon 4", folder: "fourth-edition-moon", prefix: "M4", rarities: { R: 30, SR: 20, SSR: 26, HR: 30, LSR: 16, UR: 16, SGR: 8, ZR: 7, SC: 7, SZR: 2 } },
  { id: "4", name: "Star 1", folder: "star-one", prefix: "S1", rarities: { SSR: 20, SCR: 18, UR: 18, USR: 15, AR: 9, OR: 7, BP: 9, SAR: 9 } },
  { id: "5", name: "Rainbow 1", folder: "rainbow-one", prefix: "R1", rarities: { R: 30, SR: 15, FR: 18, TR: 12, TGR: 8, MTR: 18, SSR: 15, UR: 15, USR: 8, XR: 7 } },
  { id: "6", name: "Rainbow 2", folder: "rainbow-two", prefix: "R2", rarities: { BASE: 18, R: 30, SR: 14, ST: 20, SSR: 15, FR: 18, TR: 12, TGR: 8, UR: 19, USR: 8, XR: 8 } },
  { id: "7", name: "Fun Moments 1", folder: "fun-moments-one", prefix: "FM1", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, CR: 12 } },
  { id: "8", name: "Fun Moments 2", folder: "fun-moments-two", prefix: "FM2", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12 } },
  { id: "11", name: "Fun Moments 3", folder: "fun-moments-three", prefix: "FM3", rarities: { N: 20, SN: 20, R: 35, SR: 15, SSR: 15, UR: 10, UGR: 9, CR: 12, SCR: 12 } },
];
const PROMO_CARDS = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14];
const GENERIC_CARD_BACK = getMoonOneBack("SC", 1);
const CCG_CATALOGS = [moonCatalog, starCatalog, rainbowCatalog, funCatalog];
function cardCode(setId: string, rarity: string, number: number) {
  const catalog = CCG_CATALOGS.find(candidate => candidate.sets.some(set => set.id === setId));
  if (!catalog) throw new Error(`Unknown CCG set: ${setId}`);
  return catalog.getDisplayCardCode(setId, rarity, number);
}
function cardCropClass(source: string) {
  const noZoom = /\.png(?:$|[?#])/i.test(source) || /BP0?[23](?:[^0-9]|$)/i.test(source);
  return noZoom ? "" : "scale-[1.035]";
}
function pad(value: number) {
  return String(value).padStart(3, "0");
}
function cardFront(set: SetConfig, rarity: string, number: number) {
  const code = rarity === "SHINING ZR" ? "SZR" : rarity;
  const numberCode = set.id === "13" ? String(number).padStart(code === "SZR" ? 3 : 2, "0") : pad(number);
  return cardImagePaths.ccg(set.folder, set.prefix, code, numberCode);
}
function cardBack(_set: SetConfig, _rarity: string, _number: number) {
  return GENERIC_CARD_BACK;
}
function makePool(set: SetConfig): GameCard[] {
  return Object.entries(set.rarities).flatMap(([rarity, count]) =>
    Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      const key = `${set.id}:${rarity}:${number}`;
      return { id: key, pairId: key, setId: set.id, rarity, front: cardFront(set, rarity, number), back: cardBack(set, rarity, number), label: cardCode(set.id, rarity, number) };
    }),
  );
}
function makePromoPool(): GameCard[] {
  return PROMO_CARDS.map((number) => {
    const key = `9:PR:${number}`;
    return { id: key, pairId: key, setId: "9", rarity: "PR", front: cardImagePaths.ccgPromo(number), back: GENERIC_CARD_BACK, label: promosCatalog.getDisplayCardCode("9", number) };
  });
}
function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const EMPTY_GAME: GameState = {
  phase: "setup",
  deck: [],
  playerHand: [],
  botHand: [],
  playerBooks: [],
  botBooks: [],
  turn: "player",
  message: "",
  back: GENERIC_CARD_BACK,
};
function collectBooks(hand: GameCard[], books: GameCard[]) {
  const counts = new Map<string, GameCard[]>();
  hand.forEach((card) => counts.set(card.pairId, [...(counts.get(card.pairId) ?? []), card]));
  const completed = [...counts.values()].filter((cards) => cards.length === 4);
  const completedIds = new Set(completed.map((cards) => cards[0].pairId));
  return {
    hand: hand.filter((card) => !completedIds.has(card.pairId)),
    books: [...books, ...completed.map((cards) => cards[0])],
  };
}
function drawOne(hand: GameCard[], deck: GameCard[]) {
  if (hand.length || deck.length === 0) return { hand, deck, drawn: null as GameCard | null };
  return { hand: [deck[0]], deck: deck.slice(1), drawn: deck[0] };
}
function finishGame(state: GameState, message: string): GameState {
  const allBooksCollected = state.playerBooks.length + state.botBooks.length >= 13;
  const hasPossibleMatch = state.playerHand.some((playerCard) =>
    state.botHand.some((botCard) => botCard.pairId === playerCard.pairId),
  );
  const stalled = state.deck.length === 0 &&
    (state.playerHand.length === 0 || state.botHand.length === 0 || !hasPossibleMatch);
  const complete = allBooksCollected || stalled;
  if (!complete) return { ...state, message };
  const result = state.playerBooks.length > state.botBooks.length
    ? "You win."
    : state.playerBooks.length < state.botBooks.length
      ? "Rarity wins."
      : "It is a tie.";
  const finalMessage = allBooksCollected ? message : "The draw pile is empty and no more ranks can be matched.";
  return { ...state, phase: "complete", message: `${result} ${finalMessage}` };
}
function beginGame(pool: GameCard[]): GameState {
  const ranks = shuffle(pool).slice(0, 13);
  const fullDeck = shuffle(ranks.flatMap((rank) =>
    Array.from({ length: 4 }, (_, copy) => ({ ...rank, id: `${rank.pairId}-${copy + 1}` })),
  ));
  const playerStart = fullDeck.slice(0, 7);
  const botStart = fullDeck.slice(7, 14);
  const playerCollected = collectBooks(playerStart, []);
  const botCollected = collectBooks(botStart, []);
  const drawnDeck = fullDeck.slice(14);
  const back = drawnDeck[0]?.back ?? ranks[0]?.back ?? GENERIC_CARD_BACK;
  let state: GameState = {
    phase: "playing",
    deck: drawnDeck,
    playerHand: playerCollected.hand,
    botHand: botCollected.hand,
    playerBooks: playerCollected.books,
    botBooks: botCollected.books,
    turn: "player",
    message: "Your turn. Ask Rarity for a rank in your hand.",
    back,
  };
  const player = drawOne(state.playerHand, state.deck);
  state = { ...state, playerHand: player.hand, deck: player.deck };
  const bot = drawOne(state.botHand, state.deck);
  state = { ...state, botHand: bot.hand, deck: bot.deck };
  return finishGame({ ...state, back: state.deck[0]?.back ?? state.back }, state.message);
}
function askForRank(state: GameState, actor: Turn, pairId: string): GameState {
  if (state.phase !== "playing" || state.turn !== actor) return state;
  const askerHand = actor === "player" ? state.playerHand : state.botHand;
  const targetHand = actor === "player" ? state.botHand : state.playerHand;
  const rank = askerHand.find((card) => card.pairId === pairId);
  if (!rank) return state;
  const matches = targetHand.filter((card) => card.pairId === pairId);
  let deck = state.deck;
  let playerHand = actor === "player" ? askerHand : targetHand;
  let botHand = actor === "bot" ? askerHand : targetHand;
  let playerBooks = state.playerBooks;
  let botBooks = state.botBooks;
  const name = rank.label;
  if (matches.length > 0) {
    const collected = collectBooks([...askerHand, ...matches], actor === "player" ? playerBooks : botBooks);
    if (actor === "player") {
      playerHand = collected.hand;
      playerBooks = collected.books;
    } else {
      botHand = collected.hand;
      botBooks = collected.books;
    }
    if (actor === "player") botHand = targetHand.filter((card) => card.pairId !== pairId);
    else playerHand = targetHand.filter((card) => card.pairId !== pairId);
    const playerDraw = drawOne(playerHand, deck);
    playerHand = playerDraw.hand;
    deck = playerDraw.deck;
    const botDraw = drawOne(botHand, deck);
    botHand = botDraw.hand;
    deck = botDraw.deck;
    const next: GameState = { ...state, deck, playerHand, botHand, playerBooks, botBooks, turn: actor, back: deck[0]?.back ?? state.back };
    return finishGame(next, actor === "player" ? `Rarity hands over ${name}.` : `Rarity gets ${name}.`);
  }
  const drawn = deck[0] ?? null;
  if (drawn) {
    deck = deck.slice(1);
    if (actor === "player") {
      const collected = collectBooks([...playerHand, drawn], playerBooks);
      playerHand = collected.hand;
      playerBooks = collected.books;
    } else {
      const collected = collectBooks([...botHand, drawn], botBooks);
      botHand = collected.hand;
      botBooks = collected.books;
    }
  }
  let nextTurn: Turn = actor === "player" ? "bot" : "player";
  let gotRequestedRank = Boolean(drawn && drawn.pairId === pairId);
  let message = actor === "player"
    ? "Rarity: Go Fish!"
    : drawn ? `Rarity asked for ${name} and drew a card.` : `Rarity asked for ${name}, but the draw pile is empty. Your turn.`;
  if (gotRequestedRank && drawn) {
    nextTurn = actor;
    message = actor === "player" ? "Rarity: Go Fish!" : "Rarity drew the rank she asked for and will go again.";
  }
  const playerDraw = drawOne(playerHand, deck);
  playerHand = playerDraw.hand;
  deck = playerDraw.deck;
  const botDraw = drawOne(botHand, deck);
  botHand = botDraw.hand;
  deck = botDraw.deck;
  const next: GameState = { ...state, deck, playerHand, botHand, playerBooks, botBooks, turn: nextTurn, back: deck[0]?.back ?? state.back };
  return finishGame(next, message);
}
type Point = [number, number, number];
type Face = { points: Point[]; color: string; opacity?: number; image?: number; label?: string; normal?: Point; normals?: Point[]; eye?: string };
function tint(hex: string, light: number) {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${[value >> 16, (value >> 8) & 255, value & 255].map(v => Math.round(Math.min(255, v * light))).join(",")})`;
}
function box(out: Face[], x: number, y: number, z: number, w: number, h: number, d: number, color: string, top = true) {
  const a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2;
  const low = y - h / 2, high = y + h / 2;
  if (top) out.push({ points: [[a, high, c], [b, high, c], [b, high, e], [a, high, e]], color: tint(color, 1.06) });
  out.push(
    { points: [[a, low, e], [b, low, e], [b, high, e], [a, high, e]], color: tint(color, 0.92) },
    { points: [[b, low, c], [b, low, e], [b, high, e], [b, high, c]], color: tint(color, 0.78) },
  );
}
function ellipsoid(out: Face[], x: number, y: number, z: number, rx: number, ry: number, rz: number, color: string, segments = 8, rings = 5) {
  const at = (u: number, v: number): Point => {
    const latitude = -Math.PI / 2 + v / rings * Math.PI;
    const longitude = u / segments * Math.PI * 2;
    return [x + Math.cos(latitude) * Math.cos(longitude) * rx, y + Math.sin(latitude) * ry, z + Math.cos(latitude) * Math.sin(longitude) * rz];
  };
  for (let v = 0; v < rings; v++) {
    for (let u = 0; u < segments; u++) {
      const longitude = (u + 0.5) / segments * Math.PI * 2;
      const latitude = -Math.PI / 2 + (v + 0.5) / rings * Math.PI;
      const normalAt = (u: number, v: number): Point => {
        const lat = -Math.PI / 2 + v / rings * Math.PI, lon = u / segments * Math.PI * 2;
        return [Math.cos(lat) * Math.cos(lon) / rx, Math.sin(lat) / ry, Math.cos(lat) * Math.sin(lon) / rz];
      };
      out.push({ points: [at(u, v), at(u + 1, v), at(u + 1, v + 1), at(u, v + 1)], color, normals: [normalAt(u, v), normalAt(u + 1, v), normalAt(u + 1, v + 1), normalAt(u, v + 1)], normal: [Math.cos(latitude) * Math.cos(longitude) / rx, Math.sin(latitude) / ry, Math.cos(latitude) * Math.sin(longitude) / rz] });
    }
  }
}
type SweepNode = [number, number, number, number, number];
function sweep(out: Face[], nodes: SweepNode[], color: string, sides = 12) {
  const directions = nodes.map((node, index) => {
    const before = nodes[Math.max(0, index - 1)], after = nodes[Math.min(nodes.length - 1, index + 1)];
    const tangent = [after[0] - before[0], after[1] - before[1], after[2] - before[2]];
    const length = Math.hypot(...tangent) || 1;
    return tangent.map(value => value / length) as Point;
  });
  const alignment = [0, 1, 2].map(axis => directions.reduce((sum, tangent) => sum + Math.abs(tangent[axis]), 0));
  const axis = alignment.indexOf(Math.min(...alignment));
  const bases = directions.map(tangent => {
    const u = tangent.map((value, index) => Number(index === axis) - tangent[axis] * value);
    const length = Math.hypot(...u) || 1;
    const horizontal = u.map(value => value / length) as Point;
    const vertical: Point = [horizontal[1] * tangent[2] - horizontal[2] * tangent[1], horizontal[2] * tangent[0] - horizontal[0] * tangent[2], horizontal[0] * tangent[1] - horizontal[1] * tangent[0]];
    return [horizontal, vertical];
  });
  const points = nodes.map(([x, y, z, width, depth], index) => Array.from({ length: sides }, (_, side): Point => {
    const a = side * Math.PI * 2 / sides, [u, v] = bases[index];
    return [x, y, z].map((value, axis) => value + Math.cos(a) * width * u[axis] + Math.sin(a) * depth * v[axis]) as Point;
  }));
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = 0; j < sides; j++) {
      const next = (j + 1) % sides;
      out.push({ points: [points[i][j], points[i + 1][j], points[i + 1][next], points[i][next]], color, normals: [[i, j], [i + 1, j], [i + 1, next], [i, next]].map(([ring, side]) => {
        const center = nodes[ring], [u, v] = bases[ring], a = side * Math.PI * 2 / sides;
        return u.map((value, axis) => Math.cos(a) * value / Math.max(.001, center[3]) + Math.sin(a) * v[axis] / Math.max(.001, center[4])) as Point;
      }) });
    }
  }
  out.push({ points: points[0], color }, { points: points[points.length - 1], color });
}
function curve(out: Face[], control: SweepNode[], color: string, resolution = 5, sides = 12) {
  const nodes: SweepNode[] = [];
  for (let i = 0; i < control.length - 1; i++) {
    const a = control[Math.max(0, i - 1)], b = control[i], c = control[i + 1], d = control[Math.min(control.length - 1, i + 2)];
    for (let j = 0; j < resolution; j++) {
      const t = j / resolution;
      nodes.push(b.map((value, k) => 0.5 * ((2 * value) + (-a[k] + c[k]) * t + (2 * a[k] - 5 * value + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * value - 3 * c[k] + d[k]) * t * t * t)) as SweepNode);
    }
  }
  nodes.push(control[control.length - 1]);
  sweep(out, nodes, color, sides);
}
type ScreenPoint = { x: number; y: number; depth: number };
function drawEye(ctx: CanvasRenderingContext2D, points: ScreenPoint[], color: string) {
  const a = points[0], b = points[1], d = points[3];
  ctx.save();
  ctx.transform(b.x - a.x, b.y - a.y, d.x - a.x, d.y - a.y, a.x, a.y);
  ctx.beginPath(); ctx.ellipse(0.5, 0.51, 0.46, 0.46, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fffef9"; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.ellipse(0.56, 0.56, 0.28, 0.365, 0, 0, Math.PI * 2);
  const iris = ctx.createLinearGradient(0, 0.15, 0, 0.96); iris.addColorStop(0, "#255d71"); iris.addColorStop(0.5, color); iris.addColorStop(1, "#c2eee5");
  ctx.fillStyle = iris; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.57, 0.52, 0.17, 0.28, 0, 0, Math.PI * 2); ctx.fillStyle = "#202d40"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.48, 0.36, 0.095, 0.11, 0, 0, Math.PI * 2); ctx.fillStyle = "white"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.69, 0.68, 0.041, 0.046, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#363045"; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.ellipse(0.5, 0.51, 0.46, 0.46, 0, Math.PI * 1.07, Math.PI * 1.96); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0.73 + i * 0.07, 0.13 + i * 0.045); ctx.lineTo(0.91 + i * 0.09, 0.025 + i * 0.065); ctx.stroke(); }
  ctx.restore();
}
class PartyRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private shaders: WebGLShader[] = [];
  private buffers: WebGLBuffer[] = [];
  private textures: WebGLTexture[] = [];
  private staticMeshes = new WeakMap<Face[], { buffer: WebGLBuffer; count: number }>();
  private textureCache = new Map<string | HTMLImageElement, { texture: WebGLTexture; source: string }>();
  private colors = new Map<string, number[]>();
  private dynamicBuffer: WebGLBuffer;
  private attributes: number[];
  private view: WebGLUniformLocation | null;
  private textured: WebGLUniformLocation | null;
  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true, depth: true, powerPreference: "low-power", preserveDrawingBuffer: false });
    if (!gl) throw new Error("3D graphics could not start. Try opening the game again.");
    this.gl = gl;
    const vertex = this.shader(gl.VERTEX_SHADER, `
      attribute vec3 position; attribute vec3 normal; attribute vec4 color; attribute vec2 uv;
      uniform vec3 view; varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv;
      void main(){
        float sx=position.x*view.z*2.0/view.x;
        float sy=(position.y*.951-position.z*.309-1.55)*view.z*2.0/view.y;
        float depth=-(position.z*.951+position.y*.309)/20.0;
        gl_Position=vec4(sx,sy,depth,1.0);vNormal=normal;vColor=color;vUv=uv;
      }`);
    const fragment = this.shader(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv;
      uniform sampler2D art; uniform float textured;
      void main(){
        vec4 pixel=textured>.5?texture2D(art,vUv):vColor;
        if(pixel.a<.1)discard;
        vec3 n=normalize(vNormal);
        float light=textured>.5?1.0:(.8+.2*max(dot(n,normalize(vec3(-.3,.8,.55))),0.0));
        gl_FragColor=vec4(pixel.rgb*light,pixel.a);
      }`);
    const program = gl.createProgram();
    if (!program) throw new Error("The game could not allocate graphics resources.");
    this.program = program;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { this.dispose(); throw new Error("The game could not initialize its graphics."); }
    gl.useProgram(program);
    this.attributes = ["position", "normal", "color", "uv"].map(name => gl.getAttribLocation(program, name));
    this.view = gl.getUniformLocation(program, "view"); this.textured = gl.getUniformLocation(program, "textured");
    gl.uniform1i(gl.getUniformLocation(program, "art"), 0);
    this.dynamicBuffer = this.buffer();
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.105, 0.11, 0.12, 1);
  }
  private shader(type: number, source: string) {
    const gl = this.gl, shader = gl.createShader(type);
    if (!shader) throw new Error("Graphics shader unavailable.");
    this.shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { this.dispose(); throw new Error("The game could not compile its graphics."); }
    return shader;
  }
  private buffer() {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error("Graphics buffer unavailable.");
    this.buffers.push(buffer); return buffer;
  }
  private color(value: string) {
    const cached = this.colors.get(value); if (cached) return cached;
    const hex = value.startsWith("#") ? parseInt(value.slice(1, 7), 16) : 0;
    const components = value.startsWith("#") ? [hex >> 16, (hex >> 8) & 255, hex & 255] : (value.match(/[\d.]+/g) ?? ["255", "255", "255"]).slice(0, 3).map(Number);
    const color = components.map(v => v / 255); this.colors.set(value, color); return color;
  }
  private mesh(faces: Face[], includeTextured = false) {
    const data: number[] = [];
    for (const face of faces) {
      if (!includeTextured && (face.image !== undefined || face.eye || face.label)) continue;
      const points = face.points;
      if (points.length < 3) continue;
      const a = points[0], b = points[1], c = points[2];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let normal: Point = face.normal ?? [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (!face.normal && normal[1] * .309 + normal[2] * .951 < 0) normal = normal.map(value => -value) as Point;
      const color = this.color(face.color);
      for (let i = 1; i < points.length - 1; i++) {
        for (const index of [0, i, i + 1]) {
          const point = points[index], n = face.normals?.[index] ?? normal;
          const magnitude = Math.hypot(...n) || 1;
          const uv = [[0, 0], [1, 0], [1, 1], [0, 1]][index] ?? [0, 0];
          data.push(...point, n[0] / magnitude, n[1] / magnitude, n[2] / magnitude, ...color, face.opacity ?? 1, ...uv);
        }
      }
    }
    return new Float32Array(data);
  }
  private bind(buffer: WebGLBuffer) {
    const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const sizes = [3, 3, 4, 2], offsets = [0, 12, 24, 40];
    this.attributes.forEach((location, i) => { if (location >= 0) { gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, sizes[i], gl.FLOAT, false, 48, offsets[i]); } });
  }
  private texture(key: string | HTMLImageElement, face: Face, image?: HTMLImageElement) {
    const gl = this.gl, source = image?.currentSrc || image?.src || "generated";
    const cached = this.textureCache.get(key);
    if (cached?.source === source) return cached.texture;
    const texture = cached?.texture ?? gl.createTexture();
    if (!texture) throw new Error("Graphics texture unavailable.");
    if (!cached) this.textures.push(texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const surface = document.createElement("canvas");
    surface.width = image ? 512 : face.eye ? 128 : 512;
    surface.height = image ? Math.max(1, Math.round(512 * image.naturalHeight / image.naturalWidth)) : face.eye ? 256 : 128;
    const ctx = surface.getContext("2d");
    if (!ctx) throw new Error("Card drawing unavailable.");
    if (image) {
      const zoom = face.image !== undefined && face.image >= 2 && cardCropClass(source) ? 1.035 : 1;
      ctx.save();
      ctx.translate(surface.width / 2, surface.height / 2);
      ctx.scale(zoom, zoom);
      ctx.drawImage(image, -surface.width / 2, -surface.height / 2, surface.width, surface.height);
      ctx.restore();
    }
    else if (face.eye) drawEye(ctx, [{ x: 0, y: 0, depth: 0 }, { x: 128, y: 0, depth: 0 }, { x: 128, y: 256, depth: 0 }, { x: 0, y: 256, depth: 0 }], face.eye);
    else {
      ctx.fillStyle = face.color; ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = "#65513d"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 36px Georgia,serif";
      if (face.label) ctx.fillText(face.label, 256, 64);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
    this.textureCache.set(key, { texture, source }); return texture;
  }
  private drawTexturedFace(face: Face, images: (HTMLImageElement | undefined)[]) {
    const gl = this.gl;
    const image = face.image !== undefined ? images[face.image] : undefined;
    const ready = image?.complete && image.naturalWidth > 0;
    if (face.image === 1 && !ready) return;
    const key = ready ? image : face.eye ? `eye-${face.eye}` : face.label ? `label-${face.label}-${face.color}` : `card-${face.image}`;
    const texture = this.texture(key!, face, ready ? image : undefined);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const data = this.mesh([face], true);
    this.bind(this.dynamicBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 12);
  }
  render(width: number, height: number, staticFaces: Face[], dynamicFaces: Face[], images: (HTMLImageElement | undefined)[], lightMode: boolean) {
    const gl = this.gl; if (gl.isContextLost()) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...(lightMode ? [0.965, 0.957, 0.933, 1] : [0.067, 0.067, 0.067, 1]) as [number, number, number, number]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(this.program);
    gl.uniform3f(this.view, width, height, Math.min(width / 3.2, height / 2.8));
    gl.uniform1f(this.textured, 0);
    let cached = this.staticMeshes.get(staticFaces);
    if (!cached) {
      const data = this.mesh(staticFaces), buffer = this.buffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      cached = { buffer, count: data.length / 12 }; this.staticMeshes.set(staticFaces, cached);
    }
    this.bind(cached.buffer); gl.drawArrays(gl.TRIANGLES, 0, cached.count);
    gl.uniform1f(this.textured, 1);
    dynamicFaces.filter(face => face.image === 1).forEach(face => this.drawTexturedFace(face, images));
    gl.uniform1f(this.textured, 0);
    const moving = this.mesh(dynamicFaces.filter(face => face.image !== 1));
    this.bind(this.dynamicBuffer); gl.bufferData(gl.ARRAY_BUFFER, moving, gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLES, 0, moving.length / 12);
    gl.uniform1f(this.textured, 1);
    for (const face of [...staticFaces, ...dynamicFaces.filter(item => item.image !== 1)]) {
      if (face.image === undefined && !face.eye && !face.label) continue;
      this.drawTexturedFace(face, images);
    }
  }
  dispose() {
    const gl = this.gl;
    this.buffers.forEach(buffer => gl.deleteBuffer(buffer)); this.textures.forEach(texture => gl.deleteTexture(texture)); this.shaders.forEach(shader => gl.deleteShader(shader));
    if (this.program) gl.deleteProgram(this.program);
    this.buffers = []; this.textures = []; this.shaders = []; this.textureCache.clear(); this.colors.clear();
  }
}
function buildTableScene() {
  const faces: Face[] = [];
  box(faces, 0, 0.68, 0.42, 4.38, 0.28, 1.42, "#7e542f");
  box(faces, 0, 0.84, 0.42, 4.54, 0.12, 1.5, "#c3914e");
  box(faces, 0, 0.74, 0.42, 4.18, 0.08, 1.23, "#b47c3d");
  box(faces, 0, 1.02, -1.28, 1.05, 0.92, 0.18, "#68462d");
  for (const x of [-1.66, 1.66]) {
    for (const z of [-0.05, 0.89]) box(faces, x, 0.32, z, 0.2, 0.78, 0.22, "#68462d");
  }
  box(faces, 0, 0.96, 0.49, 2.65, 0.025, 0.94, "#d2aa62");
  box(faces, -0.8, 1.01, 0.47, 0.72, 0.025, 0.48, "#ead29c");
  box(faces, 0.86, 1.01, 0.47, 0.72, 0.025, 0.48, "#ead29c");
  for (let i = 0; i < 3; i++) {
    const z = 0.18 + i * 0.035;
    faces.push({ points: [[-0.22, 1.04 + i * 0.012, z], [0.22, 1.04 + i * 0.012, z], [0.22, 0.98 + i * 0.012, z], [-0.22, 0.98 + i * 0.012, z]], color: ["#f1dca8", "#dfbd79", "#c99a52"][i] });
  }
  return faces;
}
function buildRarity(time: number, imageWidth: number, imageHeight: number) {
  const faces: Face[] = [];
  const bob = Math.sin(time * 0.65) * 0.012;
  const aspect = imageWidth > 0 && imageHeight > 0 ? Math.min(0.92, Math.max(0.48, imageWidth / imageHeight)) : 0.62;
  const spriteHeight = 1.82;
  const spriteWidth = spriteHeight * aspect;
  const left = -spriteWidth / 2;
  const right = spriteWidth / 2;
  const top = 2.42 + bob;
  const bottom = 0.6 + bob;
  faces.push({ points: [[left, top, -0.86], [right, top, -0.86], [right, bottom, -0.86], [left, bottom, -0.86]], color: "#ffffff", normal: [0, 0, -1], image: 1 });
  const angle = Math.PI;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const centerZ = -0.9;
  return faces.map((face) => ({
    ...face,
    points: face.points.map(([x, y, z]): Point => [x * cos + (z - centerZ) * sin, y, centerZ - x * sin + (z - centerZ) * cos]),
    normal: face.normal ? [face.normal[0] * cos + face.normal[2] * sin, face.normal[1], -face.normal[0] * sin + face.normal[2] * cos] as Point : undefined,
    normals: face.normals?.map(([x, y, z]): Point => [x * cos + z * sin, y, -x * sin + z * cos]),
  }));
}
function RarityTable({ backs, playerCards, onAsk, canAsk, speech, lightMode }: { backs: string[]; playerCards: { card: GameCard; count: number }[]; onAsk: (pairId: string) => void; canAsk: boolean; speech: string; lightMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphicsError, setGraphicsError] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState("");
  useEffect(() => {
    setDisplayedSpeech("");
    if (!speech) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(speech.length, index + 2);
      setDisplayedSpeech(speech.slice(0, index));
      if (index >= speech.length) window.clearInterval(timer);
    }, 55);
    return () => window.clearInterval(timer);
  }, [speech]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: PartyRenderer;
    try { renderer = new PartyRenderer(canvas); }
    catch { setGraphicsError(true); return; }
    const rarityImage = new Image();
    rarityImage.src = "/Game-Stuff/rarity.webp";
    let width = 1, height = 1, previous = 0, frame = 0, stopped = false;
    const staticFaces = buildTableScene();
    const interval = window.matchMedia("(pointer: coarse)").matches ? 60 : 42;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(1.25, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const tick = (now: number) => {
      if (stopped || document.hidden) return;
      frame = window.requestAnimationFrame(tick);
      if (previous && now - previous < interval) return;
      previous = now;
      try {
        renderer.render(width, height, staticFaces, buildRarity(now / 1000, rarityImage.naturalWidth, rarityImage.naturalHeight), [undefined, rarityImage], lightMode);
      }
      catch { setGraphicsError(true); stopped = true; }
    };
    const handleVisibility = () => {
      if (document.hidden) window.cancelAnimationFrame(frame);
      else if (!stopped) { previous = 0; frame = window.requestAnimationFrame(tick); }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    frame = window.requestAnimationFrame(tick);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
      renderer.dispose();
    };
  }, [lightMode]);
  return (
    <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-[#E7C84B]/25 dark:bg-[#111315] dark:shadow-[0_18px_48px_rgba(0,0,0,.28)]" aria-label="Rarity at the Go Fish table">
      <div className="flex min-h-10 items-center border-b border-black/10 bg-zinc-50 px-3 py-2 dark:border-[#E7C84B]/20 dark:bg-[#17191b]">
        <p role="status" aria-live="polite" className="sr-only">{speech}</p>
        <p aria-hidden="true" className="w-full text-center text-xs font-medium leading-5 text-zinc-700 dark:text-zinc-200 sm:text-sm">{displayedSpeech}</p>
      </div>
      <div className="relative">
      {!graphicsError ? <canvas ref={canvasRef} className="block h-[260px] w-full sm:h-[300px] lg:h-[330px]" aria-hidden="true" /> : (
        <div className={`flex h-[260px] items-center justify-center text-center sm:h-[300px] lg:h-[330px] ${lightMode ? "bg-[radial-gradient(ellipse_at_50%_65%,#f5e9cc_0%,#f5f5f7_68%)]" : "bg-[radial-gradient(ellipse_at_50%_65%,#40372a_0%,#17191b_68%)]"}`}>
          <div className="rounded-2xl border border-black/10 bg-white/90 px-5 py-4 shadow-xl dark:border-[#E7C84B]/30 dark:bg-[#17191b]/90">
            <p className="font-semibold text-[#80630b] dark:text-[#FFE477]">Rarity is ready to play</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your browser could not start the 3D table.</p>
          </div>
        </div>
      )}
      {backs.length > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-[43%] sm:top-[40%] z-[5] flex -translate-x-1/2 items-end overflow-visible" style={{ perspective: "700px" }} aria-label="Rarity's card backs">
          {backs.slice(0, 7).map((source, index) => {
            const offset = index - (Math.min(7, backs.length) - 1) / 2;
            const rotation = offset * -5;
            const lift = Math.abs(offset) * 1.5;
            return (
              <div key={index} className="-ml-6 h-[54px] w-[40px] shrink-0 origin-bottom first:ml-0 sm:-ml-7 sm:h-[60px] sm:w-[46px]" style={{ transform: "rotateX(7deg) rotate(" + rotation + "deg) translateY(" + lift + "px)", zIndex: index }}>
                <div className="relative h-full w-full overflow-hidden rounded-[4px] border border-black/15 bg-zinc-100 dark:border-white/70 dark:bg-zinc-900" style={{ boxShadow: "0 0 8px 3px rgba(72,160,255,.72), 0 0 3px 1px rgba(225,245,255,.8)" }}>
                  <CardImage src={source} alt={"Rarity card back " + (index + 1)} className={"h-full w-full object-cover " + cardCropClass(source)} />
                  {index % 2 === 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 h-2 w-2 rotate-45 bg-sky-100 shadow-[0_0_8px_3px_rgba(125,211,252,.95)]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {playerCards.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex h-[112px] items-end justify-center bg-gradient-to-t from-white/90 via-white/35 to-transparent px-1 pb-1 dark:from-[#111315]/90 dark:via-[#111315]/35 sm:h-[140px] sm:px-3 sm:pb-2" aria-label="Your hand">
          <div className="flex h-full w-full items-end overflow-x-auto px-2">
            <div className="mx-auto flex w-max shrink-0 items-end" style={{ perspective: "900px" }}>
            {playerCards.map(({ card, count }, index) => {
              const middle = (playerCards.length - 1) / 2;
              const offset = index - middle;
              const rotation = Math.max(-13, Math.min(13, offset * 2.5));
              const lift = Math.min(8, Math.abs(offset) * 1.2);
              return (
                <button key={card.pairId} type="button" disabled={!canAsk} onClick={() => onAsk(card.pairId)} aria-label={`Ask Rarity for ${card.label}${count > 1 ? `, you have ${count}` : ""}`} title={card.label} style={{ zIndex: index, transform: `rotate(${rotation}deg) translateY(${lift}px)` }} className="relative -ml-7 h-[104px] w-[66px] shrink-0 origin-bottom overflow-hidden rounded-md border border-[#E7C84B]/55 bg-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,.18)] dark:bg-zinc-800 dark:shadow-[0_6px_18px_rgba(0,0,0,.65)] transition enabled:hover:-translate-y-2 enabled:hover:border-[#FFE477] enabled:focus-visible:z-50 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-[#FFE477] disabled:cursor-not-allowed disabled:opacity-75 first:ml-0 sm:-ml-9 sm:h-[132px] sm:w-[84px]">
                  <span className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-white/15" />
                  <CardImage src={card.front} alt="" className={"h-full w-full object-cover " + cardCropClass(card.front)} />
                  {count > 1 && <span className="absolute right-1 top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#111315] bg-[#E7C84B] px-1 text-[10px] font-black text-[#111315]">{count}</span>}
                </button>
              );
            })}
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
export default function GoFish() {
  const navigate = useNavigate();
  const [setChoice, setSetChoice] = useState("any");
  const [game, setGame] = useState<GameState>(EMPTY_GAME);
  const [lightMode, setLightMode] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
    const syncTheme = () => setLightMode(document.documentElement.dataset.theme === "light");
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    syncTheme();
    return () => observer.disconnect();
  }, []);
  const pool = useMemo(() => {
    if (setChoice === "promos") return makePromoPool();
    if (setChoice === "any") return CCG_SETS.flatMap(makePool);
    const set = CCG_SETS.find((candidate) => candidate.id === setChoice);
    return set ? makePool(set) : [];
  }, [setChoice]);
  useEffect(() => {
    if (game.phase !== "playing" || game.turn !== "bot") return;
    const timer = window.setTimeout(() => {
      const ranks = [...new Map(game.botHand.map((card) => [card.pairId, card] as const)).values()];
      if (ranks.length === 0) {
        setGame((current) => finishGame(current, "Rarity has no cards to ask with."));
        return;
      }
      const chosen = ranks[Math.floor(Math.random() * ranks.length)];
      setGame((current) => askForRank(current, "bot", chosen.pairId));
    }, game.message === "Rarity: Go Fish!" ? 650 : Math.min(2200, Math.max(850, game.message.length * 28 + 200)));
    return () => window.clearTimeout(timer);
  }, [game]);
  const handRanks = useMemo(() => {
    const grouped = new Map<string, { card: GameCard; count: number }>();
    game.playerHand.forEach((card) => {
      const current = grouped.get(card.pairId);
      if (current) current.count += 1;
      else grouped.set(card.pairId, { card, count: 1 });
    });
    return [...grouped.values()].sort((a, b) => a.card.label.localeCompare(b.card.label));
  }, [game.playerHand]);
  const start = () => setGame(beginGame(pool));
  const speech = game.phase === "setup" ? "Choose a set, then deal the cards." : game.message;
  const books = [
    { label: "Your books", cards: game.playerBooks, score: game.playerBooks.length },
    { label: "Rarity's books", cards: game.botBooks, score: game.botBooks.length },
  ];
  const opponentBacks = game.phase === "setup" ? pool.slice(0, 7).map((card) => card.back) : game.botHand.map((card) => card.back);
  const askForPlayerCard = (pairId: string) => setGame((current) => askForRank(current, "player", pairId));
  return (
    <main className="min-h-[100svh] bg-[#f5f5f7] px-2 pb-3 pt-2 text-zinc-900 dark:bg-[#111315] dark:text-white sm:px-4 sm:pt-3">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => navigate("/explore")} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-[#E7C84B]/60 hover:text-[#80630b] dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:text-[#FFE477]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Explore
          </button>
          {game.phase !== "setup" && <button type="button" onClick={start} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-[#E7C84B]/60 hover:text-[#80630b] dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:text-[#FFE477]"><RotateCcw className="h-4 w-4" aria-hidden="true" /> New game</button>}
        </div>
        <header className="mb-2 flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#80630b] dark:text-[#E7C84B]">CCG mini game</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Go Fish</h1></div>
        </header>
        <details className="mb-2 rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#17191b]">
          <summary className="min-h-11 cursor-pointer px-3 py-2.5 text-sm font-semibold text-[#80630b] dark:text-[#FFE477]">Rules &amp; gameplay</summary>
          <div className="grid gap-2 border-t border-black/10 px-3 py-3 text-xs leading-5 text-zinc-600 dark:border-white/10 dark:text-zinc-300 sm:grid-cols-2 sm:gap-x-6 sm:text-sm">
            <p>Ask Rarity for a rank that appears in your hand. If she has it, you collect those cards and take another turn.</p>
            <p>If she does not have it, draw from the pile. Draw the rank you asked for and you keep your turn.</p>
            <p>Collect all four copies of a rank to make a book. Books are removed from your hand.</p>
            <p>The game ends when all books are made or no more matches are possible. The player with the most books wins.</p>
          </div>
        </details>
        {game.phase === "setup" ? (
          <section className="mx-auto mb-2 flex max-w-5xl items-center gap-2 rounded-xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#17191b]">
              <label htmlFor="go-fish-set" className="shrink-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300 sm:text-sm">Card set</label>
              <select id="go-fish-set" value={setChoice} onChange={(event) => setSetChoice(event.target.value)} className="min-h-10 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-[#E7C84B] dark:border-white/15 dark:bg-[#111315] dark:text-white sm:px-3">
                <option value="any">Any CCG set</option>
                {CCG_SETS.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
                <option value="promos">CCG Promos</option>
              </select>
              <button type="button" onClick={start} disabled={pool.length < 13} className="min-h-10 shrink-0 rounded-lg bg-[#E7C84B] px-3 text-sm font-bold text-[#111315] transition hover:bg-[#FFE477] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">Deal</button>
          </section>
        ) : null}
        <RarityTable backs={opponentBacks} playerCards={game.phase === "playing" ? handRanks : []} onAsk={askForPlayerCard} canAsk={game.phase === "playing" && game.turn === "player"} speech={speech} lightMode={lightMode} />
        {game.phase !== "setup" && (
          <div className="mt-2 space-y-2">
            <section className="grid gap-2 rounded-xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#17191b] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-3" aria-label="Game status">
              <p className="text-xs font-semibold leading-5 text-zinc-700 dark:text-zinc-200 sm:text-sm">{game.phase === "complete" ? "Game over" : game.turn === "player" ? "Your turn" : "Rarity's turn"}</p>
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="rounded-lg border border-[#E7C84B]/40 bg-[#E7C84B]/10 px-2 py-2 text-center dark:border-[#E7C84B]/25 dark:bg-[#E7C84B]/[0.07]"><span className="block text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Your books</span><span className="text-base font-bold text-[#80630b] dark:text-[#FFE477]">{game.playerBooks.length}</span></div>
                <div className="rounded-lg border border-black/10 bg-zinc-50 px-2 py-2 text-center dark:border-white/10 dark:bg-white/[0.035]"><span className="block text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Rarity's books</span><span className="text-base font-bold text-zinc-700 dark:text-zinc-200">{game.botBooks.length}</span></div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/[0.035]">
                  <div className="relative h-[58px] w-[40px] shrink-0 overflow-hidden rounded-md border border-[#E7C84B]/45 bg-zinc-100 shadow-sm dark:bg-zinc-800 sm:h-[68px] sm:w-[46px]"><CardImage src={game.back} alt="Top card in the draw pile" className={"h-full w-full object-cover " + cardCropClass(game.back)} /></div>
                  <p className="whitespace-nowrap text-[10px] text-zinc-600 dark:text-zinc-400 sm:text-xs">{game.playerHand.length} in hand<br />{game.deck.length} in pile</p>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#17191b]" aria-label={`Books collected: ${game.playerBooks.length + game.botBooks.length} of 13`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Books</h2>
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{game.playerBooks.length + game.botBooks.length} / 13</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {books.map(({ label, cards }) => (
                  <div key={label} className="min-w-0">
                    <p className="mb-1.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{label} ({cards.length})</p>
                    <div className={`flex gap-2 overflow-x-auto pb-1 ${cards.length ? "min-h-[100px] sm:min-h-[128px]" : "min-h-6"}`}>
                      {cards.map((book) => <div key={book.pairId} title={book.label} className="h-[96px] w-[68px] shrink-0 overflow-hidden rounded-md border border-[#E7C84B]/45 bg-zinc-100 shadow-sm dark:bg-zinc-800 sm:h-[124px] sm:w-[88px]"><CardImage src={book.front} alt={book.label} className={"h-full w-full object-cover " + cardCropClass(book.front)} /></div>)}
                      {!cards.length && <span className="self-center text-xs text-zinc-500 dark:text-zinc-400">No books yet</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {game.phase === "complete" && <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E7C84B]/35 bg-[#E7C84B]/10 px-3 py-2 dark:bg-[#E7C84B]/[0.08]"><p className="text-sm font-semibold text-[#80630b] dark:text-[#FFE477]">Game over</p><button type="button" onClick={start} className="min-h-9 rounded-lg bg-[#E7C84B] px-4 text-sm font-bold text-[#111315] transition hover:bg-[#FFE477]">Play again</button></div>}
          </div>
        )}
      </div>
    </main>
  );
}
