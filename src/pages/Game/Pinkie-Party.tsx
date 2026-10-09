import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import CardImage from "@/components/CardImage";
import { getStarOneBack, cardImagePaths } from "@/lib/card-images";

type Point = [number, number, number];
type Face = { points: Point[]; color: string; image?: number; label?: string; normal?: Point; normals?: Point[]; eye?: string };
type RoomId = "bakery" | "kitchen" | "bedroom";
type Phase = "intro" | "playing" | "paused" | "won";
type Props = { onClose: () => void; isLightMode?: boolean; returnFocusRef?: { readonly current: HTMLElement | null } };
type Snapshot = { found: number[]; nearPinkie: boolean; lastCard: string; room: RoomId; door: string; drawer: number | null };
type GameState = {
  x: number;
  z: number;
  angle: number;
  walk: number;
  moving: boolean;
  found: Set<number>;
  phase: Phase;
  nearPinkie: boolean;
  room: RoomId;
  door: string;
  drawer: number | null;
  openedDrawers: Set<number>;
  searchedDrawers: Set<number>;
  transitionCooldown: number;
};

const roomNames: Record<RoomId, string> = { bakery: "Sugarcube Corner", kitchen: "The kitchen", bedroom: "Pinkie's bedroom" };
const cards = [
  { rarity: "SSR", number: 1, x: -1.4, z: 2.6, room: "bakery" as RoomId },
  { rarity: "UR", number: 1, x: -3.15, z: 0.25, room: "bakery" as RoomId },
  { rarity: "AR", number: 1, x: -3.55, z: 0.7, room: "kitchen" as RoomId },
  { rarity: "SCR", number: 1, x: 2.86, z: -2.88, room: "kitchen" as RoomId },
  { rarity: "SAR", number: 1, x: -0.8, z: -2.1, room: "bedroom" as RoomId },
].map(card => ({
  ...card,
  code: `MLPSE01-${card.rarity === "SAR" ? "\u25c7AR" : card.rarity}-001`,
  src: cardImagePaths.ccg("star-one", "S1", card.rarity, "001"),
  back: getStarOneBack(card.rarity, card.number),
  hiddenInDrawer: card.rarity === "SCR",
}));
const roomObstacles: Record<RoomId, { x: number; z: number; w: number; d: number }[]> = {
  bakery: [{ x: 2.65, z: -3.38, w: 3.75, d: 1.39 }, { x: -4.8, z: 1.7, w: 1.55, d: 1.55 }, { x: 3.2, z: 1.1, w: 1.55, d: 1.55 }, { x: -4.35, z: -2.99, w: 1.8, d: 2.05 }],
  kitchen: [{ x: 0.59, z: -4.18, w: 7.3, d: 1.4 }, { x: -4.25, z: -3.75, w: 1.66, d: 1.5 }, { x: 0, z: 0.1, w: 2.6, d: 1.75 }],
  bedroom: [{ x: 3, z: -1.65, w: 2.3, d: 3.3 }, { x: -4.15, z: -3.48, w: 2, d: 1 }, { x: 4.66, z: -2.7, w: 0.83, d: 0.83 }],
};
const doorways: Record<RoomId, { key: string; label: string; x: number; z: number; target: RoomId; spawn: [number, number] }[]> = {
  bakery: [{ key: "kitchen", label: "Enter kitchen", x: -0.8, z: -4.15, target: "kitchen", spawn: [-4.6, 2.2] }, { key: "upstairs", label: "Go upstairs", x: -4.35, z: -1.36, target: "bedroom", spawn: [-4.6, 2.2] }],
  kitchen: [{ key: "bakery", label: "Back to bakery", x: -4.7, z: 3.5, target: "bakery", spawn: [-0.8, -3.15] }],
  bedroom: [{ key: "downstairs", label: "Go downstairs", x: -4.6, z: 3.5, target: "bakery", spawn: [-4.35, -0.3] }],
};
function initialState(): GameState {
  return { x: 0, z: 2.7, angle: Math.PI + 0.3, walk: 0, moving: false, found: new Set(), phase: "intro", nearPinkie: false, room: "bakery", door: "", drawer: null, openedDrawers: new Set(), searchedDrawers: new Set(), transitionCooldown: 0 };
}
function canStand(x: number, z: number, id: RoomId = "bakery") {
  return x >= -5.35 && x <= 5.35 && z >= -4.35 && z <= 4.3 && !roomObstacles[id].some(o =>
    Math.abs(x - o.x) < o.w / 2 + 0.29 && Math.abs(z - o.z) < o.d / 2 + 0.29
  );
}

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

function pony(pinkie: boolean, walk: number, moving: boolean) {
  const out: Face[] = [];
  const coat = pinkie ? "#fbb0d1" : "#fff1a5";
  const hair = pinkie ? "#f254a0" : "#f6b8d7";
  ellipsoid(out, 0, 0.89, 0.15, 0.34, 0.34, 0.66, coat, 14, 9);
  ellipsoid(out, 0, 0.94, 0.59, 0.33, 0.34, 0.3, coat, 12, 8);
  for (const x of [-0.235, 0.235]) {
    for (const z of [-0.3, 0.57]) {
      const swing = moving ? Math.sin(walk + (x * z > 0 ? Math.PI : 0)) * 0.12 : 0;
      const lift = Math.max(0, swing) * 0.28;
      if (pinkie && z < 0) {
        sweep(out, [[x, .955, -.98, .14, .17], [x, 1.08, -.92, .145, .17], [x, 1.25, -.61, .1, .115], [x, .81, z, .125, .14]], coat, 12);
        continue;
      }
      sweep(out, [[x, 0.04 + lift, z + swing, 0.14, 0.17], [x, 0.14 + lift, z + swing, 0.145, 0.17], [x, 0.46 + lift, z + swing * 0.45, 0.1, 0.115], [x, 0.81, z, 0.125, 0.14]], coat, 12);
    }
  }
  sweep(out, [[0, 0.85, -0.35, 0.27, 0.27], [0, 1.09, -0.46, 0.225, 0.24], [0, 1.34, -0.51, 0.24, 0.235], [0, 1.53, -0.55, 0.24, 0.26]], coat);
  ellipsoid(out, 0, 1.65, -0.6, 0.44, 0.44, 0.41, coat, 18, 12);
  ellipsoid(out, 0, 1.41, -0.95, 0.285, 0.17, 0.235, coat, 14, 8);
  ellipsoid(out, 0, 1.43, -1.085, 0.205, 0.13, 0.09, coat, 12, 6);
  for (const x of [-0.27, 0.27]) {
    sweep(out, [[x, 1.96, -0.46, 0.12, 0.11], [x * 1.03, 2.15, -0.45, 0.085, 0.06], [x * 1.1, 2.32, -0.47, 0.008, 0.008]], coat, 10);
    sweep(out, [[x, 2, -0.55, 0.065, 0.015], [x, 2.15, -0.52, 0.045, 0.015], [x * 1.08, 2.25, -0.5, 0.002, 0.002]], pinkie ? "#e68fb7" : "#e8cf86", 8);
  }
  for (const sign of [-1, 1]) {
    const x = sign * 0.425, y = 1.7, z = -0.902;
    const tangent: Point = [0.66, 0, sign * 0.75];
    const eyePoint = (horizontal: number, vertical: number): Point => [x + tangent[0] * horizontal, y + vertical, z + tangent[2] * horizontal];
    out.push({ points: [eyePoint(-0.155, 0.255), eyePoint(0.155, 0.255), eyePoint(0.155, -0.255), eyePoint(-0.155, -0.255)], color: "#fffdfa", normal: [sign * 0.75, 0, -0.66], eye: pinkie ? "#67bde2" : "#70c8c0" });
    ellipsoid(out, sign * 0.092, 1.487, -1.158, 0.021, 0.012, 0.01, "#bf9d86", 6, 3);
  }
  curve(out, [[-0.15, 1.33, -1.117, 0.01, 0.009], [0, 1.3, -1.183, 0.012, 0.009], [0.15, 1.33, -1.117, 0.006, 0.006]], pinkie ? "#c7769a" : "#c3a76e", 3, 6);
  if (pinkie) {
    curve(out, [[0.06, 2.1, -.22, .2, .19], [.15, 1.75, -.08, .24, .22], [.16, 1.4, .03, .25, .2], [.08, 1.02, -.1, .18, .14], [.03, .88, -.24, .04, .035]], hair, 6);
    curve(out, [[-0.2, 1.54, -0.14, 0.14, 0.2], [-0.28, 1.92, -0.16, 0.27, 0.23], [-0.14, 2.16, -0.45, 0.37, 0.25], [0.18, 2.16, -0.8, 0.25, 0.19], [0.26, 1.96, -0.9, 0.15, 0.11], [0.1, 1.9, -0.88, 0.03, 0.025]], hair, 6);
    curve(out, [[-0.29, 2, -0.21, 0.18, 0.18], [-0.46, 1.8, -0.12, 0.22, 0.2], [-0.39, 1.47, 0, 0.22, 0.22], [-0.42, 1.2, -0.1, 0.17, 0.18], [-0.32, 1.14, -0.24, 0.025, 0.025]], hair, 5);
    curve(out, [[0.06, 1.13, 0.73, 0.17, 0.16], [0.1, 1.28, 1.02, 0.25, 0.25], [0.1, 1.11, 1.3, 0.3, 0.25], [0.12, 0.72, 1.25, 0.23, 0.25], [0.05, 0.44, 1.38, 0.22, 0.16], [-0.06, 0.44, 1.54, 0.12, 0.11], [-0.08, 0.63, 1.5, 0.015, 0.015]], hair, 5);
    for (const [y, z, color] of [[1, 0.43, "#71c9e3"], [0.85, 0.52, "#f7df79"], [1.01, 0.63, "#71c9e3"]] as const) {
      ellipsoid(out, 0.324, y, z, 0.016, 0.083, 0.055, color, 8, 5);
      curve(out, [[0.33, y - 0.07, z, 0.005, 0.005], [0.33, y - 0.21, z + 0.035, 0.004, 0.004]], "#b59c9a", 2, 5);
    }
  } else {
    curve(out, [[.06, 2.08, -.2, .18, .16], [.16, 1.81, -.03, .2, .15], [.16, 1.4, .06, .21, .15], [.12, 1.05, -.03, .18, .12], [.04, .9, -.13, .025, .025]], hair, 6);
    curve(out, [[0.05, 2.04, -0.26, 0.17, 0.16], [-0.05, 2.13, -0.56, 0.29, 0.17], [-0.29, 2.02, -0.86, 0.2, 0.16], [-0.48, 1.77, -0.67, 0.16, 0.15], [-0.5, 1.25, -0.2, 0.2, 0.17], [-0.51, 0.83, -0.04, 0.2, 0.16], [-0.59, 0.72, -0.15, 0.15, 0.12], [-0.63, 0.86, -0.27, 0.015, 0.015]], hair, 6);
    curve(out, [[-0.07, 1.07, 0.75, 0.13, 0.13], [-0.09, 0.91, 1.09, 0.18, 0.18], [-0.08, 0.63, 1.34, 0.18, 0.17], [-0.08, 0.28, 1.6, 0.18, 0.15], [-0.1, 0.17, 1.91, 0.18, 0.12], [-0.16, 0.26, 2.08, 0.13, 0.1], [-0.22, 0.39, 2.03, 0.016, 0.016]], hair, 6);
    for (const sign of [-1, 1]) {
      ellipsoid(out, sign * 0.327, 1.035, 0.08, 0.12, 0.24, 0.37, coat, 12, 7);
      for (let i = 0; i < 4; i++) curve(out, [[sign * 0.35, 1.09, -0.05 + i * 0.12, 0.045, 0.05], [sign * 0.45, 0.92 - i * 0.035, 0.1 + i * 0.12, 0.049, 0.052], [sign * 0.4, 0.88 - i * 0.03, 0.29 + i * 0.1, 0.022, 0.02]], "#f3de94", 2, 8);
    }
    for (let i = 0; i < 3; i++) {
      const y = 0.8 + (i % 2) * 0.17, z = 0.39 + i * 0.085;
      ellipsoid(out, 0.33, y, z - 0.024, 0.013, 0.048, 0.035, "#efa9c9", 6, 4);
      ellipsoid(out, 0.33, y, z + 0.024, 0.013, 0.048, 0.035, "#efa9c9", 6, 4);
    }
  }
  if (pinkie) return out.map(face => ({ ...face, points: face.points.map(([x, y, z]): Point => [x, y + Math.min(.45, y * .6), z]) }));
  return out;
}

function moveFaces(faces: Face[], x: number, z: number, angle = 0, scale = 1) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return faces.map(face => ({ ...face, normals: face.normals?.map(([nx, ny, nz]): Point => [nx * c + nz * s, ny, -nx * s + nz * c]), normal: face.normal ? [face.normal[0] * c + face.normal[2] * s, face.normal[1], -face.normal[0] * s + face.normal[2] * c] as Point : undefined, points: face.points.map(([px, py, pz]): Point =>
    [x + (px * c + pz * s) * scale, py * scale, z + (-px * s + pz * c) * scale]
  ) }));
}

function flat(out: Face[], x: number, y: number, z: number, w: number, h: number, color: string, label?: string) {
  out.push({ points: [[x - w / 2, y + h / 2, z], [x + w / 2, y + h / 2, z], [x + w / 2, y - h / 2, z], [x - w / 2, y - h / 2, z]], color, label });
}

function ovalRug(out: Face[], x: number, z: number, rx: number, rz: number, color: string) {
  const points = Array.from({ length: 40 }, (_, i): Point => [x + Math.cos(i * Math.PI / 20) * rx, 0.015, z + Math.sin(i * Math.PI / 20) * rz]);
  out.push({ points, color });
}

function scroll(out: Face[], x: number, y: number, z: number, radius: number, color: string) {
  const path: SweepNode[] = Array.from({ length: 32 }, (_, i) => {
    const t = i / 31, a = t * Math.PI * 3.5, r = radius * (1 - t * 0.85);
    return [x + Math.cos(a) * r, y + Math.sin(a) * r, z, 0.02, 0.02];
  });
  sweep(out, path, color, 6);
}

function pillar(out: Face[], x: number, z: number) {
  box(out, x, 0.13, z, 0.62, 0.26, 0.62, "#754c35");
  sweep(out, [[x, 0.2, z, 0.19, 0.19], [x, 2.6, z, 0.19, 0.19]], "#fff1cd", 16);
  for (let i = 0; i < 40; i++) {
    const a = i * Math.PI / 8;
    const b = (i + 1) * Math.PI / 8;
    out.push({ points: [[x + Math.cos(a) * 0.203, 0.24 + i * 0.05625, z + Math.sin(a) * 0.203], [x + Math.cos(b) * 0.203, 0.24 + (i + 1) * 0.05625, z + Math.sin(b) * 0.203], [x + Math.cos(b) * 0.203, 0.48 + (i + 1) * 0.05625, z + Math.sin(b) * 0.203], [x + Math.cos(a) * 0.203, 0.48 + i * 0.05625, z + Math.sin(a) * 0.203]], color: "#ed6d71" });
  }
  box(out, x, 2.72, z, 0.64, 0.23, 0.64, "#764d35");
}

function ovalWall(out: Face[], x: number, y: number, z: number, rx: number, ry: number, color: string) {
  out.push({ points: Array.from({ length: 32 }, (_, i): Point => [x + Math.cos(i * Math.PI / 16) * rx, y + Math.sin(i * Math.PI / 16) * ry, z]), color });
}

function archedWindow(out: Face[], x: number, z: number, bedroom = false) {
  flat(out, x, 1.95, z, 1.45, 1.65, "#7f553f");
  flat(out, x, 1.95, z + 0.04, 1.19, 1.39, bedroom ? "#d8b2db" : "#f9d4b9");
  ovalWall(out, x, 2.7, z + 0.03, 0.72, 0.36, "#7f553f");
  ovalWall(out, x, 2.67, z + 0.09, 0.58, 0.24, bedroom ? "#ead4eb" : "#ffe5c4");
  box(out, x, 1.95, z + 0.09, 0.055, 1.42, 0.035, "#f9f0d5");
  box(out, x, 1.95, z + 0.09, 1.2, 0.055, 0.035, "#f9f0d5");
  for (const sign of [-1, 1]) {
    curve(out, [[x + sign * 0.8, 2.8, z + 0.14, 0.16, 0.06], [x + sign * 0.73, 2.1, z + 0.16, 0.2, 0.08], [x + sign * 0.64, 1.6, z + 0.18, 0.1, 0.06], [x + sign * 0.77, 1.1, z + 0.2, 0.23, 0.06]], bedroom ? "#cf87b2" : "#ffebb2", 4, 10);
  }
}

function cupcake(out: Face[], x: number, y: number, z: number, color = "#f3a2bf") {
  sweep(out, [[x, y, z, 0.12, 0.12], [x, y + 0.18, z, 0.16, 0.16]], "#d6b67f", 10);
  curve(out, [[x, y + 0.21, z, 0.17, 0.16], [x, y + 0.35, z, 0.13, 0.13], [x, y + 0.42, z, 0.025, 0.025]], color, 3, 10);
  ellipsoid(out, x, y + 0.44, z, 0.035, 0.035, 0.035, "#d64761", 6, 4);
}

function room(id: RoomId = "bakery") {
  const out: Face[] = [];
  for (let z = -5; z < 5; z += 0.5) {
    for (let x = -6; x < 6; x += 2) {
      const offset = (Math.round(z * 2) % 2) * 0.7;
      const left = x === -6 ? -6 : Math.max(-6, x - offset), right = Math.min(6, x + 2 - offset);
      out.push({ points: [[left, 0, z], [right, 0, z], [right, 0, z + 0.5], [left, 0, z + 0.5]], color: ["#8cb6ad", "#94beb4", "#9bc4b8"][Math.abs(Math.round(z * 2) + x) % 3] });
      if (right < 6 && x === 4) out.push({ points: [[right, 0, z], [6, 0, z], [6, 0, z + 0.5], [right, 0, z + 0.5]], color: "#94beb4" });
    }
  }
  out.push({ points: [[-6, 0, 5], [6, 0, 5], [6, -0.22, 5], [-6, -0.22, 5]], color: "#759b97" });
  out.push({ points: [[6, 0, -5], [6, 0, 5], [6, -0.22, 5], [6, -0.22, -5]], color: "#668e8b" });
  const wallColor = id === "kitchen" ? "#e8d7c3" : id === "bedroom" ? "#f9dca9" : "#ffe2a1";
  for (let x = -6; x < 6; x++) {
    for (let y = 0; y < 3.3; y += 0.55) out.push({ points: [[x, y, -5], [x + 1, y, -5], [x + 1, y + 0.55, -5], [x, y + 0.55, -5]], color: wallColor });
  }
  for (let z = -5; z < 5; z++) {
    for (let y = 0; y < 3.3; y += 0.55) out.push({ points: [[-6, y, z], [-6, y, z + 1], [-6, y + 0.55, z + 1], [-6, y + 0.55, z]], color: tint(wallColor, 0.98) });
  }
  for (let x = -6; x < 6; x += 1) box(out, x + 0.5, 0.37, -4.94, 1, 0.7, 0.08, "#9b6a47");
  for (let z = -5; z < 5; z++) box(out, -5.94, 0.37, z + 0.5, 0.08, 0.7, 1, "#9b6a47");
  box(out, 0, 3.12, -4.9, 12, 0.26, 0.2, "#7b4f34");
  box(out, -5.9, 3.12, 0, 0.2, 0.26, 10, "#7b4f34");
  if (id === "bakery") {
    archedWindow(out, 3.5, -4.84);
    flat(out, -0.8, 1.32, -4.85, 1.48, 2.62, "#804d35");
    flat(out, -0.8, 1.33, -4.77, 1.24, 2.34, "#d9894b");
    scroll(out, -0.7, 1.65, -4.7, 0.33, "#ffdc8c");
    flat(out, -0.8, 2.85, -4.68, 1.55, 0.35, "#f4bd72", "Kitchen");
    for (let i = 0; i < 6; i++) box(out, 1.13 + i * 0.62, 0.64, -3.38, 0.62, 1.28, 1.2, "#906046", false);
    for (let i = 0; i < 6; i++) box(out, 1.13 + i * 0.62, 1.32, -3.38, 0.65, 0.16, 1.39, "#c38c55");
    box(out, 2.65, 0.82, -2.75, 3.2, 0.57, 0.02, "#f3c183");
    flat(out, 2.65, 0.82, -2.72, 2.7, 0.36, "#eac1d0");
    for (let i = 0; i < 4; i++) cupcake(out, 1.6 + i * 0.5, 1.4, -3.22);
    ellipsoid(out, 4, 1.42, -3.22, 0.16, 0.07, 0.16, "#92bcc4", 10, 5);
    ellipsoid(out, 4, 1.48, -3.22, 0.12, 0.06, 0.12, "#dceae7", 10, 5);
    for (let i = 0; i < 6; i++) box(out, -4.35, 0.1 + i * 0.17, -1.87 - i * 0.34, 1.8, 0.2 + i * 0.34, 0.36, "#c2894b");
    for (const x of [-5.26, -3.4]) curve(out, [[x, 0.65, -1.55, 0.05, 0.05], [x, 2.19, -3.8, 0.05, 0.05]], "#8e563b", 4, 8);
    for (let i = 0; i < 6; i++) {
      for (const x of [-5.25, -3.4]) sweep(out, [[x, 0.15 + i * 0.18, -1.72 - i * 0.35, 0.035, 0.035], [x, 0.68 + i * 0.23, -1.72 - i * 0.35, 0.035, 0.035]], "#975e3d", 8);
    }
    flat(out, -4.35, 2.95, -4.6, 2.2, 0.36, "#c78851", "Pinkie's bedroom");
    box(out, -3.1, 2.42, -4.54, 5.1, 0.17, 0.9, "#b9814c");
    for (let i = 0; i < 10; i++) box(out, -5.4 + i * 0.48, 2.72, -4.07, 0.06, 0.5, 0.06, "#b57c47");
    box(out, -3.18, 2.99, -4.08, 5, 0.09, 0.08, "#875238");
    for (const [x, z] of [[-2.9, -3.9], [4.95, -4.1], [-5.5, 3.6]]) pillar(out, x, z);
    for (let x = -5; x <= 5; x += 2) scroll(out, x, 2.74, -4.69, 0.23, "#bd8a4b");
    ovalRug(out, -0.3, 1.8, 2.05, 1.2, "#bbd878");
    ovalRug(out, -0.3, 1.8, 1.89, 1.09, "#cbe389");
    for (const o of roomObstacles.bakery.slice(1, 3)) {
      box(out, o.x, 0.45, o.z, 0.19, 0.9, 0.19, "#ac7847");
      ellipsoid(out, o.x, 0.08, o.z, 0.47, 0.07, 0.47, "#a5784c");
      ellipsoid(out, o.x, 0.99, o.z, 0.83, 0.09, 0.83, "#c6915b", 16, 5);
      cupcake(out, o.x - 0.2, 1.08, o.z);
      cupcake(out, o.x + 0.2, 1.08, o.z + 0.2, "#a38ecb");
    }
    out.push(...moveFaces(pony(true, 0, false), 2.6, -4.4, Math.PI, 1));
  } else if (id === "kitchen") {
    for (let i = 0; i < 8; i++) {
      box(out, -2.6 + i * 0.91, 0.58, -4.18, 0.89, 1.16, 1.27, "#8ab6a7");
      box(out, -2.6 + i * 0.91, 1.22, -4.18, 0.92, 0.14, 1.4, "#d4c594");
      box(out, -2.6 + i * 0.91, 0.59, -3.53, 0.66, 0.83, 0.02, "#9cc6b6");
      ellipsoid(out, -2.6 + i * 0.91, 0.6, -3.49, 0.035, 0.035, 0.025, "#dae1c7", 6, 4);
    }
    archedWindow(out, 1.1, -4.86);
    flat(out, 1.1, 1.3, -3.67, 0.9, 0.18, "#688b87");
    curve(out, [[1.1, 1.29, -4.12, 0.045, 0.045], [1.1, 1.8, -4.12, 0.045, 0.045], [1.1, 1.82, -3.87, 0.045, 0.045], [1.1, 1.63, -3.8, 0.04, 0.04]], "#446966", 5, 10);
    for (const x of [-2.2, 4.1]) {
      box(out, x, 2.16, -4.77, 1.72, 1.1, 0.3, "#72a696");
      flat(out, x, 2.15, -4.58, 1.4, 0.8, "#9fc7b8");
      for (let j = 0; j < 3; j++) box(out, x, 1.87 + j * 0.19, -4.45, 0.66, 0.05, 0.16, "#ebedc3");
      ellipsoid(out, x, 2.86, -4.64, 0.38, 0.19, 0.15, "#f0bfc5", 12, 6);
    }
    box(out, -4.25, 0.78, -3.75, 1.55, 1.56, 1.48, "#9c879e");
    flat(out, -4.25, 0.64, -2.98, 1.08, 0.73, "#7b687d");
    box(out, -4.25, 1.59, -3.75, 1.66, 0.12, 1.5, "#9e99a2");
    for (const x of [-4.6, -3.9]) for (const z of [-4.1, -3.45]) ellipsoid(out, x, 1.66, z, 0.22, 0.035, 0.22, "#615962", 10, 4);
    scroll(out, -4.22, 1.17, -2.94, 0.22, "#cfb2c6");
    box(out, 0, 0.56, 0.1, 2.4, 1.12, 1.55, "#b1c6a4");
    box(out, 0, 1.19, 0.1, 2.6, 0.15, 1.75, "#d7c399");
    ellipsoid(out, -0.45, 1.42, 0.1, 0.29, 0.17, 0.29, "#a6cbc3", 12, 6);
    box(out, 0.45, 1.35, 0.1, 0.57, 0.11, 0.06, "#9c714e");
    ovalRug(out, -4.6, 3.5, 0.8, 0.55, "#bbd18e");
    flat(out, -4.7, 1.15, 4.1, 1.45, 2.3, "#c67b99", "Bakery");
    for (let x = -4.6; x <= 4.6; x += 2.3) scroll(out, x, 2.82, -4.72, 0.22, "#cfa5a1");
  } else {
    archedWindow(out, 0.4, -4.85, true);
    for (const x of [-3.6, 4.2]) scroll(out, x, 2.48, -4.79, 0.48, "#d49aa7");
    ovalRug(out, -0.9, 1.4, 2.1, 1.2, "#b898cb");
    ovalRug(out, -0.9, 1.4, 1.9, 1.03, "#c6a8d6");
    box(out, 3, 0.37, -1.65, 2.06, 0.73, 3.1, "#875951");
    box(out, 3, 0.82, -1.65, 2.14, 0.22, 3.13, "#fce9e5");
    box(out, 3, 0.98, -1.2, 2.16, 0.11, 2.25, "#80c5d0");
    box(out, 3, 1.23, -3.27, 2.3, 1.43, 0.13, "#9f6689");
    ellipsoid(out, 3, 1.94, -3.24, 1.14, 0.35, 0.07, "#aa729a", 18, 6);
    ellipsoid(out, 3, 1.03, -2.69, 0.76, 0.16, 0.35, "#fff4e8", 14, 6);
    for (let i = 0; i < 6; i++) {
      const x = 2.32 + i % 3 * 0.64, z = -1.88 + Math.floor(i / 3) * 0.9;
      out.push({ points: [[x, 1.05, z - 0.18], [x + 0.17, 1.05, z], [x, 1.05, z + 0.18], [x - 0.17, 1.05, z]], color: "#b884bb" });
    }
    box(out, -4.15, 0.68, -3.48, 2, 1.36, 1, "#b47f9f");
    for (let i = 0; i < 3; i++) {
      box(out, -4.15, 0.3 + i * 0.4, -2.95, 1.74, 0.3, 0.03, "#cf9db7");
      ellipsoid(out, -4.15, 0.3 + i * 0.4, -2.9, 0.05, 0.05, 0.027, "#f7d9b0", 8, 4);
    }
    ovalWall(out, -4.15, 2.1, -3.72, 0.72, 0.72, "#bc8da7");
    ovalWall(out, -4.15, 2.1, -3.64, 0.58, 0.59, "#c9e4e3");
    box(out, 4.66, 0.42, -2.7, 0.83, 0.84, 0.83, "#ac7691");
    sweep(out, [[4.66, 0.87, -2.7, 0.03, 0.03], [4.66, 1.38, -2.7, 0.03, 0.03]], "#aa8a67", 8);
    sweep(out, [[4.66, 1.25, -2.7, 0.38, 0.38], [4.66, 1.75, -2.7, 0.22, 0.22]], "#f3ca9b", 12);
    for (let i = 0; i < 3; i++) {
      const x = -2.7 + i * 0.65;
      ellipsoid(out, x, 2.8, -4.4, 0.26, 0.32, 0.25, ["#e685bc", "#aad5b6", "#edce88"][i], 12, 7);
      curve(out, [[x, 2.52, -4.4, 0.008, 0.008], [x + 0.08, 1.7, -4.4, 0.006, 0.006]], "#bdad94", 4, 5);
    }
    flat(out, -4.6, 1.13, 4.1, 1.5, 2.26, "#b37a9c", "Downstairs");
  }
  return out;
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

function dynamicScene(game: GameState, time: number, ponyFrames?: Face[][]) {
  const template = ponyFrames ? ponyFrames[game.moving ? 1 + Math.floor((game.walk % (Math.PI * 2)) / (Math.PI * 2) * 8) : 0] : pony(false, game.walk, game.moving);
  const dynamic: Face[] = moveFaces(template, game.x, game.z, game.angle);
  for (let i = 0; i < cards.length; i++) {
    if (game.found.has(i) || cards[i].hiddenInDrawer || cards[i].room !== game.room) continue;
    const card = cards[i];
    const y = 0.58 + Math.sin(time * 2 + i) * 0.065;
    const a = time * 0.7 + i * 1.2;
    const frontFacing = Math.cos(a) * 0.69 - Math.sin(a) * 0.52 >= 0;
    const vx = Math.cos(a) * 0.26, vz = Math.sin(a) * 0.26;
    const cardPoints: Point[] = [[card.x - vx, y + 0.38, card.z - vz], [card.x + vx, y + 0.38, card.z + vz], [card.x + vx, y - 0.38, card.z + vz], [card.x - vx, y - 0.38, card.z - vz]];
    dynamic.push({ points: frontFacing ? cardPoints : [cardPoints[1], cardPoints[0], cardPoints[3], cardPoints[2]], color: "#ffe695", image: i * 2 + (frontFacing ? 0 : 1) });
    for (let n = 0; n < 3; n++) {
      const angle = time + n * Math.PI * 2 / 3 + i;
      const x = card.x + Math.cos(angle) * 0.43, z = card.z + Math.sin(angle) * 0.43;
      dynamic.push({ points: [[x - 0.04, y, z], [x, y + 0.09, z], [x + 0.04, y, z], [x, y - 0.09, z]], color: "#ffffff" });
    }
  }
  if (game.room === "kitchen") {
    for (const index of game.openedDrawers) {
      const x = -2.6 + index * .91;
      box(dynamic, x, .83, -3.14, .76, .12, 1.15, "#d4c19b");
      box(dynamic, x, .99, -2.57, .8, .25, .07, "#9cc6b6");
      box(dynamic, x - .37, .98, -3.14, .06, .2, 1.15, "#b6ae88");
      box(dynamic, x + .37, .98, -3.14, .06, .2, 1.15, "#b6ae88");
      ellipsoid(dynamic, x, .99, -2.52, .035, .035, .02, "#e0d8b8", 6, 4);
    }
  }
  return dynamic;
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
      attribute vec3 position; attribute vec3 normal; attribute vec3 color; attribute vec2 uv;
      uniform vec3 view; varying vec3 vNormal; varying vec3 vColor; varying vec2 vUv;
      void main(){
        float sx=(position.x*.8-position.z*.6)*view.z*2.0/view.x;
        float sy=-(1.6+position.x*.3+position.z*.4-position.y*.866)*view.z*2.0/view.y;
        float depth=-(position.x*.52+position.z*.69+position.y*.5)/20.0;
        gl_Position=vec4(sx,sy,depth,1.0);vNormal=normal;vColor=color;vUv=uv;
      }`);
    const fragment = this.shader(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec3 vNormal; varying vec3 vColor; varying vec2 vUv;
      uniform sampler2D art; uniform float textured;
      void main(){
        vec4 pixel=textured>.5?texture2D(art,vUv):vec4(vColor,1.0);
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
      if (!face.normal && normal[0] * .52 + normal[1] * .5 + normal[2] * .69 < 0) normal = normal.map(value => -value) as Point;
      const color = this.color(face.color);
      for (let i = 1; i < points.length - 1; i++) {
        for (const index of [0, i, i + 1]) {
          const point = points[index], n = face.normals?.[index] ?? normal;
          const magnitude = Math.hypot(...n) || 1;
          const uv = [[0, 0], [1, 0], [1, 1], [0, 1]][index] ?? [0, 0];
          data.push(...point, n[0] / magnitude, n[1] / magnitude, n[2] / magnitude, ...color, ...uv);
        }
      }
    }
    return new Float32Array(data);
  }
  private bind(buffer: WebGLBuffer) {
    const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const sizes = [3, 3, 3, 2], offsets = [0, 12, 24, 36];
    this.attributes.forEach((location, i) => { if (location >= 0) { gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, sizes[i], gl.FLOAT, false, 44, offsets[i]); } });
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
    const surface = document.createElement("canvas"); surface.width = image ? 256 : face.eye ? 128 : 512; surface.height = image ? 358 : face.eye ? 256 : 128;
    const ctx = surface.getContext("2d");
    if (!ctx) throw new Error("Card drawing unavailable.");
    if (image) ctx.drawImage(image, 0, 0, surface.width, surface.height);
    else if (face.eye) drawEye(ctx, [{ x: 0, y: 0, depth: 0 }, { x: 128, y: 0, depth: 0 }, { x: 128, y: 256, depth: 0 }, { x: 0, y: 256, depth: 0 }], face.eye);
    else {
      ctx.fillStyle = face.color; ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = "#65513d"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 36px Georgia,serif";
      ctx.fillText(face.label ?? "STAR 1", 256, 64);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
    this.textureCache.set(key, { texture, source }); return texture;
  }
  render(width: number, height: number, staticFaces: Face[], dynamicFaces: Face[], images: (HTMLImageElement | undefined)[], lightMode: boolean) {
    const gl = this.gl; if (gl.isContextLost()) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(...(lightMode ? [0.965, 0.957, 0.933, 1] : [0.067, 0.067, 0.067, 1]) as [number, number, number, number]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(this.program);
    gl.uniform3f(this.view, width, height, Math.min(width / 16.5, height / 11.4));
    gl.uniform1f(this.textured, 0);
    let cached = this.staticMeshes.get(staticFaces);
    if (!cached) {
      const data = this.mesh(staticFaces), buffer = this.buffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      cached = { buffer, count: data.length / 11 }; this.staticMeshes.set(staticFaces, cached);
    }
    this.bind(cached.buffer); gl.drawArrays(gl.TRIANGLES, 0, cached.count);
    const moving = this.mesh(dynamicFaces); this.bind(this.dynamicBuffer); gl.bufferData(gl.ARRAY_BUFFER, moving, gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLES, 0, moving.length / 11);
    gl.uniform1f(this.textured, 1);
    for (const face of [...staticFaces, ...dynamicFaces]) {
      if (face.image === undefined && !face.eye && !face.label) continue;
      const image = face.image !== undefined ? images[face.image] : undefined;
      const ready = image?.complete && image.naturalWidth > 0;
      const key = ready ? image : face.eye ? `eye-${face.eye}` : face.label ? `label-${face.label}-${face.color}` : `card-${face.image}`;
      const texture = this.texture(key!, face, ready ? image : undefined);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const data = this.mesh([face], true); this.bind(this.dynamicBuffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLES, 0, data.length / 11);
    }
  }
  dispose() {
    const gl = this.gl;
    this.buffers.forEach(buffer => gl.deleteBuffer(buffer)); this.textures.forEach(texture => gl.deleteTexture(texture)); this.shaders.forEach(shader => gl.deleteShader(shader));
    if (this.program) gl.deleteProgram(this.program);
    this.buffers = []; this.textures = []; this.shaders = []; this.textureCache.clear(); this.colors.clear();
  }
}

function renderScene(renderer: PartyRenderer, ctx: CanvasRenderingContext2D, width: number, height: number, faces: Face[], images: (HTMLImageElement | undefined)[], game: GameState, time: number, ponyFrames: Face[][], isLightMode: boolean) {
  renderer.render(width, height, faces, dynamicScene(game, time, ponyFrames), images, isLightMode);
  ctx.clearRect(0, 0, width, height);
  const scale = Math.min(width / 16.5, height / 11.4);
  const project = ([x, y, z]: Point): ScreenPoint => ({ x: width / 2 + (x * .8 - z * .6) * scale, y: height / 2 + (1.6 + x * .3 + z * .4 - y * .866) * scale, depth: 0 });
  const marker = project([game.x, 2.64, game.z]);
  ctx.fillStyle = "#756397";
  ctx.font = `bold ${Math.max(10, Math.min(13, scale * 0.2))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Fluttershy", marker.x, marker.y);
  if (game.room === "bakery") {
    const pinkieMarker = project([2.6, 3.15, -4.4]);
    ctx.fillStyle = "#aa326e";
    ctx.fillText("Pinkie Pie", pinkieMarker.x, pinkieMarker.y);
  }
  for (const door of doorways[game.room]) {
    const marker = project([door.x, 0.11, door.z]);
    ctx.beginPath();
    ctx.ellipse(marker.x, marker.y, scale * 0.4, scale * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = game.door === door.key ? "#fce3ae" : "#fff8d5a0";
    ctx.fill();
    ctx.fillStyle = "#80544c";
    ctx.font = `bold ${Math.max(9, scale * 0.19)}px sans-serif`;
    ctx.fillText(door.label, marker.x, marker.y + scale * 0.48);
  }
  if (game.phase === "won") {
    for (let i = 0; i < 36; i++) {
      ctx.fillStyle = ["#ee78b4", "#ffdf82", "#7bc9d7", "#b098d8"][i % 4];
      const x = ((i * 67.1) % width), y = (time * 50 + i * 37) % height;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time + i);
      ctx.fillRect(-3, -2, 6, 4);
      ctx.restore();
    }
  }
}

const styles = `
.pp-overlay{--pp-bg:#f6f4ee;--pp-panel:#ffffff;--pp-subtle:#f3f2ee;--pp-ink:#18181b;--pp-muted:#71717a;--pp-border:#00000026;--pp-accent-ink:#765d12;position:fixed;inset:0;z-index:31000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.83);font-family:Arial,Helvetica,sans-serif;color:var(--pp-ink);overscroll-behavior:contain}
.pp-dialog,.pp-dialog *{box-sizing:border-box}
.pp-dialog{display:flex;flex-direction:column;width:min(1060px,100%);height:min(820px,94dvh);max-height:94dvh;border:1px solid var(--pp-border);border-radius:24px;background:var(--pp-panel);box-shadow:0 25px 90px #0006;overflow:hidden;outline:none}
.pp-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 18px;background:var(--pp-panel);border-bottom:1px solid var(--pp-border);flex:none}
.pp-kicker{margin:0 0 3px;font-size:9px;letter-spacing:2px;font-weight:800;text-transform:uppercase;color:var(--pp-accent-ink)}
.pp-title{margin:0;font-size:20px;font-weight:900;letter-spacing:-.7px}
.pp-header-actions{display:flex;gap:7px;align-items:center}
.pp-count{font-size:12px;font-weight:800;padding:9px 12px;border:1px solid var(--pp-border);border-radius:20px;background:var(--pp-subtle);white-space:nowrap}
.pp-dialog button{font:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.pp-icon{min-width:44px;min-height:44px;border:1px solid var(--pp-border);border-radius:12px;background:var(--pp-panel);color:var(--pp-ink);font-weight:800!important;font-size:17px!important}
.pp-dialog button:focus-visible,.pp-canvas:focus-visible{outline:3px solid #E7C84B;outline-offset:-3px}
.pp-scene{position:relative;flex:1;min-height:0;background:var(--pp-bg);overflow:hidden}
.pp-canvas{display:block;width:100%;height:100%;outline:none;touch-action:none}
.pp-story{position:absolute;left:14px;top:13px;max-width:min(350px,calc(100% - 28px));border:1px solid var(--pp-border);background:var(--pp-panel);padding:10px 13px;border-radius:14px;pointer-events:none;box-shadow:0 3px 15px #4c2d5e12}
.pp-story strong{display:block;font-size:11px;color:var(--pp-accent-ink);margin-bottom:3px}.pp-story p{margin:0;font-size:12px;line-height:1.5}
.pp-panel-shade{position:absolute;inset:0;background:#00000060;display:flex;justify-content:center;align-items:center;padding:18px}
.pp-panel{width:min(390px,100%);max-height:100%;overflow:auto;background:var(--pp-panel);border:1px solid var(--pp-border);border-radius:22px;padding:24px;text-align:center;box-shadow:0 15px 50px #34233c30}
.pp-panel .pp-kicker{font-size:10px}.pp-panel h2{font-size:26px;letter-spacing:-1px;margin:7px 0 11px}.pp-panel p{font-size:14px;line-height:1.65;margin:0 0 14px;color:var(--pp-muted)}
.pp-panel-mark{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:17px;margin:0 auto 14px;background:#E7C84B26;color:var(--pp-accent-ink);font-size:24px;font-weight:900}
.pp-primary{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:0;border-radius:13px;background:#E7C84B;color:#111111;padding:11px 19px;font-size:13px!important;font-weight:800!important;box-shadow:0 4px 0 #b99b29}
.pp-secondary{min-height:42px;border:1px solid var(--pp-border);border-radius:13px;padding:9px 15px;background:var(--pp-panel);color:var(--pp-ink);font-size:12px!important;font-weight:700!important}
.pp-panel-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.pp-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 16px;flex:none;border-top:1px solid var(--pp-border);background:var(--pp-panel)}
.pp-deck{display:flex;gap:5px}.pp-slot{display:flex;justify-content:center;align-items:center;width:30px;height:41px;border:1px dashed var(--pp-border);border-radius:5px;background:var(--pp-subtle);color:var(--pp-muted);font-size:9px;font-weight:800;overflow:hidden}.pp-slot img{width:100%;height:100%;object-fit:cover}.pp-slot.is-found{border:1px solid #E7C84B;background:var(--pp-subtle)}
.pp-controls{display:flex;align-items:center;gap:12px}.pp-dpad{display:grid;grid-template-columns:44px 44px 44px;grid-template-rows:44px 44px;gap:3px}.pp-direction{border:1px solid var(--pp-border);border-radius:9px;background:var(--pp-panel);color:var(--pp-ink);touch-action:none!important;font-weight:800!important;font-size:17px!important;user-select:none}.pp-direction[aria-pressed="true"]{background:#E7C84B55}.pp-up{grid-column:2}.pp-left{grid-row:2;grid-column:1}.pp-down{grid-row:2;grid-column:2}.pp-right{grid-row:2;grid-column:3}.pp-control-copy{font-size:10px;color:var(--pp-muted);line-height:1.6;max-width:190px}.pp-talk{min-width:120px}.pp-talk:disabled{opacity:.45;cursor:default;box-shadow:none}
.pp-art-cache{position:absolute;left:-10000px;top:0;width:100px;height:140px;overflow:hidden;pointer-events:none}.pp-art-cache img{position:absolute;inset:0;width:100%;height:100%}.pp-card-preview{display:block;width:auto;max-width:100%;height:min(280px,35dvh);aspect-ratio:5/7;object-fit:contain;margin:12px auto 16px;border-radius:10px}.pp-card-code{font-size:18px!important}.pp-art-note{position:absolute;bottom:9px;left:12px;right:12px;margin:0;padding:7px 10px;background:var(--pp-panel);border-radius:9px;font-size:10px;color:var(--pp-muted);pointer-events:none}.pp-slot{padding:0}.pp-live{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pp-dark{--pp-bg:#111111;--pp-panel:#181818;--pp-subtle:#282828;--pp-ink:#ffffff;--pp-muted:#a1a1aa;--pp-border:#ffffff26;--pp-accent-ink:#E7C84B}
@media(max-width:600px){.pp-overlay{padding:6px}.pp-dialog{height:min(620px,72dvh);max-height:72dvh;border-radius:18px}.pp-header{padding:9px 11px;gap:6px}.pp-title{font-size:17px}.pp-count{font-size:10px;padding:8px 9px}.pp-header-actions{gap:4px}.pp-footer{padding:9px 10px;gap:7px;flex-wrap:wrap}.pp-controls{gap:9px}.pp-control-copy{display:none}.pp-deck{gap:3px}.pp-slot{width:23px;height:33px}.pp-talk{min-width:100px;padding:10px!important;font-size:11px!important}.pp-story{left:9px;top:9px;padding:8px 10px;max-width:260px}.pp-story p{font-size:11px}.pp-panel{padding:19px}.pp-panel h2{font-size:23px}.pp-panel p{font-size:13px}.pp-kicker{font-size:8px;letter-spacing:1.3px}}
@media(max-height:520px){.pp-dialog{height:80dvh;max-height:80dvh}.pp-header{padding:5px 12px}.pp-footer{padding:5px 12px}.pp-story{display:none}.pp-panel{padding:12px 18px;max-width:500px}.pp-panel h2{font-size:20px;margin:3px 0 6px}.pp-panel p{font-size:12px;margin-bottom:8px;line-height:1.4}.pp-panel-mark{display:none}.pp-dpad{grid-template-rows:44px 44px}.pp-kicker{margin-bottom:0}}
.pp-label-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none}.pp-primary:hover{background:#FFE477}.pp-direction:disabled{opacity:.45}.pp-panel-shade{z-index:2}

@media(max-width:900px) and (pointer:coarse){.pp-dialog{height:min(620px,72dvh);max-height:72dvh}.pp-dpad{display:none}.pp-controls{margin-left:auto}.pp-story{max-width:220px}.pp-story p{font-size:10px}.pp-panel h2{font-size:21px}.pp-panel{padding:15px}.pp-panel p{font-size:12px;line-height:1.5;margin-bottom:10px}}
.pp-reward-message{font-weight:700}.pp-primary:disabled{opacity:.6;cursor:default}
`;

export default function PinkieParty({ onClose, isLightMode = false, returnFocusRef }: Props) {
  const titleId = useId();
  const helpId = useId();
  const [portalHost] = useState(() => document.createElement("div"));
  const [phase, setPhase] = useState<Phase>("intro");
  const [snapshot, setSnapshot] = useState<Snapshot>({ found: [], nearPinkie: false, lastCard: "", room: "bakery", door: "", drawer: null });
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showCardBack, setShowCardBack] = useState(false);
  const [artFailures, setArtFailures] = useState<string[]>([]);
  const art = useRef<(HTMLImageElement | undefined)[]>([]);
  const dirty = useRef(true);
  const [error, setError] = useState("");
  const [reward, setReward] = useState<"idle" | "saving" | "unlocked" | "error">("idle");
  const [rewardMessage, setRewardMessage] = useState("");
  const rewardBusy = useRef(false);
  const rewardTicket = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number; horizontal: number; vertical: number } | null>(null);
  const [directions, setDirections] = useState<string[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlayCanvas = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(isLightMode);
  themeRef.current = isLightMode;
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const game = useRef<GameState>(initialState());
  const keys = useRef(new Set<string>());
  const touchKeys = useRef(new Map<number, string>());
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const interactRef = useRef<() => void>(() => {});
  const pauseRef = useRef<() => void>(() => {});
  const changePhase = (next: Phase) => {
    game.current.phase = next;
    game.current.moving = false;
    keys.current.clear();
    touchKeys.current.clear();
    drag.current = null;
    setDirections([]);
    setPhase(next);
    dirty.current = true;
  };
  useEffect(() => () => { ++rewardTicket.current; rewardBusy.current = false; }, []);
  const claimFrame = async () => {
    if (rewardBusy.current || game.current.phase !== "won") return;
    const ticket = ++rewardTicket.current;
    rewardBusy.current = true;
    setReward("saving");
    setRewardMessage("Saving your limited-time frame...");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error("Log in, then complete Pinkie's Party again to unlock this frame for your account.");
      const { data, error: claimError } = await (supabase as unknown as SupabaseClient).rpc("complete_pinkie_party");
      if (claimError) throw new Error(claimError.message === "pinkie_party_event_ended" ? "The limited-time frame unlock event has ended." : claimError.message === "avatar_frame_revoked" ? "This frame is unavailable for your account." : "Your frame could not be saved. Check your connection and retry.");
      if (data !== true) throw new Error("Your frame could not be saved. Please retry.");
      if (ticket !== rewardTicket.current) return;
      setReward("unlocked");
      setRewardMessage("Pinkie's Party frame unlocked! Choose it in your profile's frame selector.");
    } catch (reason) {
      if (ticket !== rewardTicket.current) return;
      setReward("error");
      setRewardMessage(reason instanceof Error ? reason.message : "Your frame could not be saved. Please retry.");
    } finally {
      if (ticket === rewardTicket.current) rewardBusy.current = false;
    }
  };
  const reset = () => {
    if (rewardBusy.current) return;
    ++rewardTicket.current;
    setReward("idle"); setRewardMessage("");
    game.current = initialState();
    setSelectedCard(null);
    setSnapshot({ found: [], nearPinkie: false, lastCard: "", room: "bakery", door: "", drawer: null });
    changePhase("playing");
    canvas.current?.focus();
  };
  const interact = () => {
    const state = game.current;
    if (state.phase !== "playing") return;
    if (state.room === "kitchen" && state.drawer !== null) {
      const index = state.drawer;
      if (state.openedDrawers.has(index)) {
        state.openedDrawers.delete(index);
        dirty.current = true;
        setSnapshot(previous => ({ ...previous, lastCard: "Drawer closed." }));
        return;
      }
      state.openedDrawers.add(index);
      state.searchedDrawers.add(index);
      const hiddenCard = cards.findIndex(card => card.hiddenInDrawer);
      const found = index === 6 && !state.found.has(hiddenCard);
      if (found) state.found.add(hiddenCard);
      dirty.current = true;
      setSnapshot(previous => ({ ...previous, found: Array.from(state.found), lastCard: found ? (state.found.size === cards.length ? "The last card was in this drawer! Return to Pinkie." : `Found ${cards[hiddenCard].code} tucked inside the drawer! ${state.found.size} of 5 collected.`) : "This drawer has baking supplies, but no missing card. Try another drawer." }));
      return;
    }
    if (!state.nearPinkie) return;
    if (state.found.size === cards.length) { changePhase("won"); void claimFrame(); }
    else setSnapshot(previous => ({ ...previous, lastCard: "Pinkie: Try the kitchen and my upstairs bedroom, too!" }));
  };
  interactRef.current = interact;
  pauseRef.current = () => {
    if (game.current.phase === "playing") changePhase("paused");
  };

  useEffect(() => {
    document.body.appendChild(portalHost);
    const previousFocus = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const previousOverflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== portalHost);
    const inertStates = siblings.map(node => ({ node, inert: node.inert }));
    inertStates.forEach(({ node }) => { node.inert = true; });
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]') ?? []).filter(node => node.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first || !last) { event.preventDefault(); dialog.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement as HTMLElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.body.style.overflow = previousOverflow;
      inertStates.forEach(({ node, inert }) => { node.inert = inert; });
      portalHost.remove();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [portalHost, returnFocusRef]);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const labelNode = overlayCanvas.current;
    if (!labelNode) return;
    const ctx = labelNode.getContext("2d");
    let renderer: PartyRenderer;
    try { renderer = new PartyRenderer(node); } catch { setError("The game could not start its 3D graphics. Close it and try again."); return; }
    if (!ctx) { renderer.dispose(); setError("The game could not start in this browser. Please try opening it again."); return; }
    let width = 1, height = 1, ratio = 1;
    let frame = 0, previous = 0, stopped = false;
    const frameInterval = window.matchMedia("(pointer: coarse)").matches ? 48 : 32;
    const roomCache: Partial<Record<RoomId, Face[]>> = {};
    const getRoom = (id: RoomId) => roomCache[id] ?? (roomCache[id] = room(id));
    const ponyFrames = [pony(false, 0, false), ...Array.from({ length: 8 }, (_, i) => pony(false, i * Math.PI / 4, true))];
    let lastRenderPhase: Phase | "" = "";
    const resize = () => {
      const rect = node.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      ratio = Math.min(1.25, window.devicePixelRatio || 1);
      node.width = Math.round(width * ratio);
      node.height = Math.round(height * ratio);
      labelNode.width = node.width; labelNode.height = node.height;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderScene(renderer, ctx, width, height, getRoom(game.current.room), art.current, game.current, 0, ponyFrames, themeRef.current);
    };
    const updateSnapshot = (message?: string) => setSnapshot(previousSnapshot => ({
      found: Array.from(game.current.found), nearPinkie: game.current.nearPinkie, room: game.current.room, door: game.current.door, drawer: game.current.drawer, lastCard: message ?? previousSnapshot.lastCard,
    }));
    const tick = (now: number) => {
      if (stopped || document.hidden) return;
      frame = requestAnimationFrame(tick);
      if (previous && now - previous < frameInterval) return;
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      const state = game.current;
      if (state.phase === "playing") {
        const input = new Set([...keys.current, ...touchKeys.current.values()]);
        const horizontal = drag.current?.horizontal ?? Number(input.has("right")) - Number(input.has("left"));
        const vertical = drag.current?.vertical ?? Number(input.has("down")) - Number(input.has("up"));
        const length = Math.max(1, Math.hypot(horizontal, vertical));
        const dx = (horizontal * 0.8 + vertical * 0.6) / length;
        const dz = (-horizontal * 0.6 + vertical * 0.8) / length;
        state.moving = horizontal !== 0 || vertical !== 0;
        if (state.moving) {
          const nextX = state.x + dx * dt * 2.9, nextZ = state.z + dz * dt * 2.9;
          if (canStand(nextX, state.z, state.room)) state.x = nextX;
          if (canStand(state.x, nextZ, state.room)) state.z = nextZ;
          state.angle = Math.atan2(-dx, -dz);
          state.walk += dt * 11;
        }
        cards.forEach((card, index) => {
          if (!card.hiddenInDrawer && card.room === state.room && !state.found.has(index) && Math.hypot(state.x - card.x, state.z - card.z) < 0.68) {
            state.found.add(index);
            updateSnapshot(state.found.size === cards.length ? "All five cards found! Return to Pinkie's counter." : `Found ${card.code}! ${state.found.size} of 5 cards collected.`);
          }
        });
        const near = state.room === "bakery" && state.z < -1.8 && state.z > -2.65 && Math.abs(state.x - 2.65) < 1.8;
        const nearDoor = doorways[state.room].find(door => Math.hypot(state.x - door.x, state.z - door.z) < 0.95)?.key ?? "";
        const nearDrawer = state.room === "kitchen" ? Array.from({ length: 8 }, (_, index) => ({ index, distance: Math.hypot(state.x - (-2.6 + index * .91), state.z + 2.88) })).sort((a, b) => a.distance - b.distance).find(candidate => candidate.distance < .79)?.index ?? null : null;
        if (near !== state.nearPinkie || nearDoor !== state.door || nearDrawer !== state.drawer) { state.nearPinkie = near; state.door = nearDoor; state.drawer = nearDrawer; updateSnapshot(); }
        if (nearDoor && state.moving && now >= state.transitionCooldown) {
          const door = doorways[state.room].find(candidate => candidate.key === nearDoor)!;
          state.room = door.target; [state.x, state.z] = door.spawn;
          state.angle = Math.PI + .3; state.nearPinkie = false; state.door = ""; state.drawer = null; state.moving = false; state.transitionCooldown = now + 700;
          keys.current.clear(); touchKeys.current.clear(); drag.current = null; setDirections([]); dirty.current = true;
          updateSnapshot(`Now exploring ${roomNames[state.room]}.`);
        }
      }
      if ((state.phase === "intro" || state.phase === "paused") && lastRenderPhase === state.phase && !dirty.current) return;
      lastRenderPhase = state.phase;
      dirty.current = false;
      try { renderScene(renderer, ctx, width, height, getRoom(state.room), art.current, state, now / 1000, ponyFrames, themeRef.current); }
      catch { stopped = true; cancelAnimationFrame(frame); setError("Something interrupted the game. Close it and try again."); }
    };
    const moveKeys: Record<string, string> = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
    const keydown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "p" && !event.repeat) { pauseRef.current(); return; }
      if (game.current.phase !== "playing") return;
      if (moveKeys[key]) { event.preventDefault(); keys.current.add(moveKeys[key]); }
      if (key === "e" && !event.repeat) { event.preventDefault(); interactRef.current(); }
    };
    const keyup = (event: KeyboardEvent) => { keys.current.delete(moveKeys[event.key.toLowerCase()]); };
    const blur = () => { keys.current.clear(); touchKeys.current.clear(); drag.current = null; setDirections([]); pauseRef.current(); };
    const visibility = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (document.hidden) blur();
      else if (!stopped) frame = requestAnimationFrame(tick);
    };
    const contextLost = (event: Event) => { event.preventDefault(); stopped = true; cancelAnimationFrame(frame); pauseRef.current(); setError("The game paused because its graphics were interrupted. Close it and reopen to continue playing."); };
    node.addEventListener("webglcontextlost", contextLost);
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      keys.current.clear();
      touchKeys.current.clear();
      node.removeEventListener("webglcontextlost", contextLost);
      renderer.dispose();
      art.current = [];
      labelNode.width = 1; labelNode.height = 1;
      node.width = 1;
      node.height = 1;
    };
  }, []);

  useEffect(() => { dirty.current = true; }, [isLightMode]);

  useEffect(() => {
    if (phase === "playing") return;
    const primary = dialog.current?.querySelector<HTMLButtonElement>(".pp-panel .pp-primary");
    primary?.focus();
  }, [phase]);

  const releaseDirection = (event: ReactPointerEvent<HTMLButtonElement>) => {
    touchKeys.current.delete(event.pointerId);
    setDirections(Array.from(touchKeys.current.values()));
  };
  const directionButton = (direction: string, label: string, symbol: string) => <button
    type="button" className={`pp-direction pp-${direction}`} aria-label={label} aria-pressed={directions.includes(direction)} disabled={phase !== "playing"}
    onPointerDown={event => {
      if (phase !== "playing" || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      touchKeys.current.set(event.pointerId, direction);
      setDirections(Array.from(touchKeys.current.values()));
    }} onPointerUp={releaseDirection} onPointerCancel={releaseDirection} onLostPointerCapture={releaseDirection}
    onKeyDown={event => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (phase === "playing") { keys.current.add(direction); setDirections(previousDirections => [...new Set([...previousDirections, direction])]); }
    }} onKeyUp={event => {
      if (event.key !== " " && event.key !== "Enter") return;
      keys.current.delete(direction);
      setDirections(previousDirections => previousDirections.filter(value => value !== direction));
    }} onBlur={() => { keys.current.delete(direction); setDirections(previousDirections => previousDirections.filter(value => value !== direction)); }}
  >{symbol}</button>;
  const endDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id === event.pointerId) drag.current = null;
  };
  const allFound = snapshot.found.length === cards.length;
  const canSearch = snapshot.room === "kitchen" && snapshot.drawer !== null;
  const drawerOpen = snapshot.drawer !== null && game.current.openedDrawers.has(snapshot.drawer);
  const hereFound = cards.filter((card, index) => card.room === snapshot.room && snapshot.found.includes(index)).length;
  const hereTotal = cards.filter(card => card.room === snapshot.room).length;
  return createPortal(
    <div className={`pp-overlay${isLightMode ? " pp-light" : " pp-dark"}`} onPointerDown={event => { if (event.target === event.currentTarget) closeRef.current(); }}>
      <style>{styles}</style>
      <div ref={dialog} className="pp-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={helpId} tabIndex={-1}>
        <header className="pp-header">
          <div><p className="pp-kicker">{roomNames[snapshot.room]} / {hereFound} of {hereTotal} found</p><h1 id={titleId} className="pp-title">Pinkie's Party</h1></div>
          <div className="pp-header-actions">
            <span className="pp-count" aria-label={`${snapshot.found.length} of 5 cards found`}>{snapshot.found.length} / 5 cards</span>
            {phase === "playing" && <button type="button" className="pp-icon" aria-label="Pause game" onClick={() => changePhase("paused")}>II</button>}
            <button ref={closeButton} type="button" className="pp-icon" aria-label="Close Pinkie's Party" onClick={onClose}>X</button>
          </div>
        </header>
        <div className="pp-scene">
          <canvas ref={canvas} className="pp-canvas" onPointerDown={event => {
            if (game.current.phase !== "playing" || drag.current || (event.pointerType === "mouse" && event.button !== 0)) return;
            event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: 0, vertical: 0 };
          }} onPointerMove={event => {
            const held = drag.current; if (!held || held.id !== event.pointerId) return;
            const dx = event.clientX - held.x, dy = event.clientY - held.y, distance = Math.hypot(dx, dy);
            const divisor = Math.max(48, distance);
            held.horizontal = distance < 7 ? 0 : dx / divisor; held.vertical = distance < 7 ? 0 : dy / divisor;
          }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} tabIndex={phase === "playing" ? 0 : -1} aria-label="Sugarcube Corner game. Play as Fluttershy. Drag a finger to move, or use arrow keys or W A S D. Walk into doorways and stairs to change rooms. Press E at kitchen drawers or Pinkie's counter.">Your browser needs canvas support to play this game.</canvas><canvas ref={overlayCanvas} className="pp-label-canvas" aria-hidden="true" />
          <div className="pp-art-cache" aria-hidden="true">{cards.flatMap((card, index) => [card.src, card.back].map((src, side) => <CardImage key={`${card.code}-${side}`} crossOrigin="anonymous" src={src} imageSize="grid" visible={card.room === snapshot.room || snapshot.found.includes(index)} loading="eager" alt="" draggable={false} onLoad={event => { art.current[index * 2 + side] = event.currentTarget; dirty.current = true; setArtFailures(previous => previous.filter(value => value !== `${index}-${side}`)); }} onError={() => { art.current[index * 2 + side] = undefined; dirty.current = true; setArtFailures(previous => previous.includes(`${index}-${side}`) ? previous : [...previous, `${index}-${side}`]); }} />))}</div>
          {phase === "playing" && <div className="pp-story"><strong>{allFound ? "Back to Pinkie!" : "Pinkie's missing party cards"}</strong><p>{snapshot.lastCard || "Find five Star 1 cards across the bakery, kitchen, and Pinkie's upstairs bedroom."}</p></div>}
          {artFailures.length > 0 && <p className="pp-art-note" role="status">Some card art could not load. You can still collect the cards.</p>}
          {(phase !== "playing" || error) && <div className="pp-panel-shade"><div className="pp-panel">
            <div className="pp-panel-mark" aria-hidden="true">{phase === "won" ? "5/5" : phase === "paused" ? "II" : "!"}</div>
            {selectedCard !== null && !error ? <><p className="pp-kicker">Star 1 / {showCardBack ? "Back" : "Front"}</p><h2 className="pp-card-code">{cards[selectedCard].code}</h2><CardImage className="pp-card-preview" src={showCardBack ? cards[selectedCard].back : cards[selectedCard].src} imageSize="grid" visible={true} loading="eager" alt={`${cards[selectedCard].code} ${showCardBack ? "back" : "front"}`} /><div className="pp-panel-actions"><button type="button" className="pp-secondary" onClick={() => setShowCardBack(value => !value)}>{showCardBack ? "Show front" : "Show back"}</button><button type="button" className="pp-primary" onClick={() => { setSelectedCard(null); changePhase("playing"); canvas.current?.focus(); }}>Keep exploring</button></div></> : error ? <><h2>The party needs a moment</h2><p role="alert">{error}</p><button type="button" className="pp-primary" onClick={onClose}>Close game</button></> : phase === "intro" ? <>
              <p className="pp-kicker">Pinkie has a favor to ask</p><h2>Oh, Fluttershy!</h2><p>"My five Star 1 cards are scattered across the bakery, kitchen, and my bedroom upstairs! Could you find them and bring them back to my counter? Then we can get this party started!"</p>
              <p>Play as Fluttershy. Drag your finger to move, or use arrow keys. Walk up to sparkling cards to collect them. Walk into the marked doorways and stairs to explore. Search the kitchen drawers, too! Then return to Pinkie.</p><p>Complete the game while logged in to unlock the limited-time Pinkie's Party avatar frame.</p><button type="button" className="pp-primary" onClick={() => { changePhase("playing"); canvas.current?.focus(); }}>Let's help Pinkie</button>
            </> : phase === "paused" ? <><p className="pp-kicker">Take your time</p><h2>Party on pause</h2><p>Your {snapshot.found.length} collected {snapshot.found.length === 1 ? "card is" : "cards are"} safe. Fluttershy will be right here.</p><div className="pp-panel-actions"><button type="button" className="pp-primary" onClick={() => { changePhase("playing"); canvas.current?.focus(); }}>Keep exploring</button><button type="button" className="pp-secondary" onClick={reset}>Start over</button></div></> : <>
              <p className="pp-kicker">Five cards. One happy Pinkie.</p><h2>You saved the party!</h2><p>"You found every single one! Thank you, Fluttershy! Now it's officially party time!"</p><p role="status" className="pp-reward-message">{rewardMessage}</p>{reward === "error" && <button type="button" className="pp-secondary" onClick={() => void claimFrame()}>Retry frame unlock</button>}<div className="pp-panel-actions"><button type="button" className="pp-primary" disabled={reward === "saving"} onClick={reset}>Play again</button><button type="button" className="pp-secondary" onClick={onClose}>Back to MLPEKAYOU</button></div>
            </>}
          </div></div>}
        </div>
        <footer className="pp-footer">
          <div className="pp-deck" aria-label="Collected cards">{cards.map((card, index) => <button type="button" key={card.code} className={`pp-slot${snapshot.found.includes(index) ? " is-found" : ""}`} disabled={!snapshot.found.includes(index) || phase === "intro" || phase === "won"} aria-label={snapshot.found.includes(index) ? `View ${card.code} front and back` : "Missing card"} title={snapshot.found.includes(index) ? card.code : "Missing card"} onClick={() => { setSelectedCard(index); setShowCardBack(false); changePhase("paused"); }}>{snapshot.found.includes(index) ? <CardImage src={card.src} imageSize="grid" visible={true} alt="" /> : "?"}</button>)}</div>
          <div className="pp-controls">
            <span id={helpId} className="pp-control-copy">Drag to move, or use arrow keys / W A S D.<br />E to search or talk. P to pause. Esc to close.</span>
            <div className="pp-dpad" aria-label="Movement controls">{directionButton("up", "Move up", "\u2191")}{directionButton("left", "Move left", "\u2190")}{directionButton("down", "Move down", "\u2193")}{directionButton("right", "Move right", "\u2192")}</div>
            <button type="button" className="pp-primary pp-talk" disabled={phase !== "playing" || (!snapshot.nearPinkie && !canSearch)} onClick={interact}>{canSearch ? (drawerOpen ? "Close drawer" : "Search drawer") : (allFound ? "Give Pinkie cards" : "Talk to Pinkie")}</button>
          </div>
        </footer>
        <div className="pp-live" role="status" aria-live="polite">{snapshot.lastCard}</div>
      </div>
    </div>, portalHost
  );
}
