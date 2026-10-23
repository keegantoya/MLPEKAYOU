import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import { useEffect, useRef, useState } from "react";
const stonesUrl = "https://stonestradingco.com/collections/my-little-pony";
const pakraUrl = "https://pakracards.com/collections/mlpekayou-guest-picks";
const frontUrl = "/website-assets/keychainfront.png";
const backUrl = "/website-assets/keychainback.png";
type Vec3 = [number, number, number];
type Mesh = { values: number[]; material: number; start: number; count: number };
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, n: number): Vec3 => [a[0] * n, a[1] * n, a[2] * n];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => scale(a, 1 / Math.max(0.00001, Math.hypot(...a)));
const identity = (): Float32Array => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
  return out;
}
function rotation(x: number, y: number, z: number) {
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  const rx = new Float32Array([1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1]);
  const ry = new Float32Array([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
  const rz = new Float32Array([cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  return multiply(rz, multiply(ry, rx));
}
function projection(aspect: number, distance: number) {
  const f = 1 / Math.tan(38 * Math.PI / 360), near = 0.1, far = 30;
  const p = new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
  const view = identity();
  view[14] = -distance;
  return multiply(p, view);
}
function vertex(mesh: Mesh, p: Vec3, normal: Vec3, u = 0, v = 0) { mesh.values.push(...p, ...normal, u, v); }
function quad(mesh: Mesh, a: Vec3, b: Vec3, c: Vec3, d: Vec3, normal: Vec3) {
  vertex(mesh, a, normal); vertex(mesh, b, normal); vertex(mesh, c, normal);
  vertex(mesh, a, normal); vertex(mesh, c, normal); vertex(mesh, d, normal);
}
function tube(mesh: Mesh, path: Vec3[], radius: number, closed = true) {
  const steps = path.length, segments = 12;
  const rings = path.map((p, i) => {
    const previous = path[closed ? (i + steps - 1) % steps : Math.max(0, i - 1)];
    const next = path[closed ? (i + 1) % steps : Math.min(steps - 1, i + 1)];
    const tangent = unit(add(next, scale(previous, -1)));
    const normal = unit(cross(tangent, Math.abs(tangent[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]));
    const binormal = unit(cross(tangent, normal));
    return Array.from({ length: segments }, (_, j) => {
      const angle = j / segments * Math.PI * 2;
      const n = add(scale(normal, Math.cos(angle)), scale(binormal, Math.sin(angle)));
      return { p: add(p, scale(n, radius)), n };
    });
  });
  for (let i = 0; i < steps - (closed ? 0 : 1); i++) for (let j = 0; j < segments; j++) {
    const a = rings[i][j], b = rings[(i + 1) % steps][j], c = rings[(i + 1) % steps][(j + 1) % segments], d = rings[i][(j + 1) % segments];
    for (const point of [a, b, c, a, c, d]) vertex(mesh, point.p, point.n);
  }
}
function ellipse(mesh: Mesh, center: Vec3, rx: number, ry: number, radius: number, turn = 0) {
  const matrix = rotation(0, turn, 0);
  tube(mesh, Array.from({ length: 72 }, (_, i): Vec3 => {
    const angle = i / 72 * Math.PI * 2, x = rx * Math.cos(angle), y = ry * Math.sin(angle);
    return add(center, [matrix[0] * x, y, matrix[2] * x]);
  }), radius);
}
async function loadArt(url: string) {
  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error(`Could not load ${url}`)); image.src = url; });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Artwork could not be prepared.");
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (pixels[(y * canvas.width + x) * 4 + 3] > 24) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right <= left || bottom <= top) throw new Error("The keychain artwork is empty.");
  const crop = document.createElement("canvas");
  crop.width = 1536;
  crop.height = Math.round(crop.width * (bottom - top + 1) / (right - left + 1));
  const target = crop.getContext("2d");
  if (!target) throw new Error("Artwork could not be prepared.");
  target.drawImage(image, left, top, right - left + 1, bottom - top + 1, 0, 0, crop.width, crop.height);
  return crop;
}
const vertexShader = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 model;
uniform mat4 camera;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main(){vec4 p=model*vec4(position,1.0);vPosition=p.xyz;vNormal=mat3(model)*normal;vUv=uv;gl_Position=camera*p;}
`;
const fragmentShader = `
precision mediump float;
uniform sampler2D artwork;
uniform float material;
uniform float lightMode;
uniform vec2 hole;
uniform vec2 bodySize;
uniform float holeRadius;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main(){
vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
vec3 light=normalize(vec3(-0.6,1.0,1.4));
vec3 eye=normalize(vec3(0.0,0.1,5.8)-vPosition);
float diffuse=max(dot(n,light),0.0);
float gloss=pow(max(dot(n,normalize(light+eye)),0.0),75.0);
float rim=pow(1.0-max(dot(n,eye),0.0),3.0);
vec3 color;
if(material<1.5){
vec2 point=(vUv-vec2(0.5))*bodySize;
if(distance(point,hole)<holeRadius)discard;
vec4 art=texture2D(artwork,vUv);
if(art.a<0.18)discard;
color=art.rgb*(0.90+0.12*diffuse)+vec3(0.14,0.15,0.19)*gloss+vec3(0.05,0.04,0.09)*rim;
}else if(material<2.5){
color=mix(vec3(0.13,0.12,0.28),vec3(0.63,0.60,0.85),diffuse)*0.8+vec3(0.42)*gloss+vec3(0.13,0.12,0.22)*rim;
}else{
float band=pow(abs(n.y*0.55+n.x*0.3+n.z*0.7),16.0);
float reflection=0.5+0.5*sin(n.y*13.0+n.x*6.0+n.z*9.0);
color=vec3(0.56,0.47,0.30)+vec3(0.30,0.28,0.21)*diffuse+vec3(0.17,0.16,0.13)*band+vec3(0.42,0.41,0.36)*gloss+vec3(0.10,0.095,0.075)*rim+vec3(0.065,0.06,0.045)*reflection;
color=mix(color,color*1.08,lightMode);
}
gl_FragColor=vec4(color,1.0);
}
`;
function KeychainPreview({ isLightMode }: { isLightMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(isLightMode);
  const controls = useRef({ x: -0.12, y: -0.25, targetX: -0.12, targetY: -0.25, spin: false, dragging: false, lastX: 0, lastY: 0, zoom: 1 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");
  const [retry, setRetry] = useState(0);
  useEffect(() => { themeRef.current = isLightMode; }, [isLightMode]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false, frame = 0, resize: ResizeObserver | undefined, intersection: IntersectionObserver | undefined, visible = true;
    let gl: WebGLRenderingContext | null = null;
    const textures: WebGLTexture[] = [], buffers: WebGLBuffer[] = [], shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    setReady(false); setError("");
    const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); if (!disposed) { setReady(false); setError("The 3D preview paused. Reload it to continue."); } };
    canvas.addEventListener("webglcontextlost", lost);
    const init = async () => {
      try {
        const [front, back] = await Promise.all([loadArt(frontUrl), loadArt(backUrl)]);
        if (disposed) return;
        gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: "low-power" });
        if (!gl) throw new Error("3D is unavailable in this browser. You can still view both designs below.");
        const context = gl;
        program = context.createProgram();
        if (!program) throw new Error("The 3D preview could not start.");
        for (const [type, source] of [[context.VERTEX_SHADER, vertexShader], [context.FRAGMENT_SHADER, fragmentShader]] as const) {
          const shader = context.createShader(type);
          if (!shader) throw new Error("The 3D preview could not start.");
          shaders.push(shader); context.shaderSource(shader, source); context.compileShader(shader);
          if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error("This browser could not display the 3D materials.");
          context.attachShader(program, shader);
        }
        context.linkProgram(program);
        if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error("This browser could not display the 3D materials.");
        context.useProgram(program);
        context.enable(context.DEPTH_TEST);
        context.clearColor(0, 0, 0, 0);
        const width = 3.1, height = width * front.height / front.width, depth = 0.065;
        const holeX = -0.035, holeY = height * 0.298, holeRadius = 0.047;
        const meshes: Mesh[] = Array.from({ length: 7 }, (_, index) => ({ values: [], material: Math.min(index, 3), start: 0, count: 0 }));
        const face = (mesh: Mesh, z: number, reverse: boolean) => {
          const corners: Vec3[] = [[-width / 2, -height / 2, z], [width / 2, -height / 2, z], [width / 2, height / 2, z], [-width / 2, height / 2, z]];
          for (const i of [0, 1, 2, 0, 2, 3]) {
            const p = corners[i];
            vertex(mesh, p, [0, 0, reverse ? -1 : 1], p[0] / width + 0.5, p[1] / height + 0.5);
          }
        };
        face(meshes[0], depth / 2, false);
        face(meshes[1], -depth / 2, true);
        const sample = document.createElement("canvas");
        sample.width = 320; sample.height = Math.round(320 * height / width);
        const sampleContext = sample.getContext("2d", { willReadFrequently: true });
        if (!sampleContext) throw new Error("The keychain outline could not be prepared.");
        sampleContext.drawImage(front, 0, 0, sample.width, sample.height);
        const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
        const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < sample.width && y < sample.height && pixels[(y * sample.width + x) * 4 + 3] > 110;
        const point = (x: number, y: number, z: number): Vec3 => [(x / sample.width - 0.5) * width, (0.5 - y / sample.height) * height, z];
        for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width; x++) if (filled(x, y)) {
          const edges = [
            { empty: !filled(x, y - 1), a: [x, y], b: [x + 1, y], normal: [0, 1, 0] },
            { empty: !filled(x + 1, y), a: [x + 1, y], b: [x + 1, y + 1], normal: [1, 0, 0] },
            { empty: !filled(x, y + 1), a: [x + 1, y + 1], b: [x, y + 1], normal: [0, -1, 0] },
            { empty: !filled(x - 1, y), a: [x, y + 1], b: [x, y], normal: [-1, 0, 0] },
          ];
          for (const edge of edges) if (edge.empty) quad(meshes[2], point(edge.a[0], edge.a[1], depth / 2), point(edge.b[0], edge.b[1], depth / 2), point(edge.b[0], edge.b[1], -depth / 2), point(edge.a[0], edge.a[1], -depth / 2), edge.normal as Vec3);
        }
        for (let i = 0; i < 64; i++) {
          const a = i / 64 * Math.PI * 2, b = (i + 1) / 64 * Math.PI * 2;
          const pa: Vec3 = [holeX + Math.cos(a) * holeRadius, holeY + Math.sin(a) * holeRadius, depth / 2];
          const pb: Vec3 = [holeX + Math.cos(b) * holeRadius, holeY + Math.sin(b) * holeRadius, depth / 2];
          quad(meshes[2], pa, pb, [pb[0], pb[1], -depth / 2], [pa[0], pa[1], -depth / 2], [-Math.cos((a + b) / 2), -Math.sin((a + b) / 2), 0]);
        }
        ellipse(meshes[3], [holeX, holeY + 0.09, 0], 0.091, 0.11, 0.016, Math.PI / 2);
        ellipse(meshes[4], [holeX, holeY + 0.26, 0], 0.066, 0.095, 0.016);
        ellipse(meshes[5], [holeX, holeY + 0.405, 0], 0.063, 0.086, 0.016, Math.PI / 2);
        const gold = meshes[6];
        ellipse(gold, [holeX, holeY + 0.555, 0], 0.115, 0.11, 0.023);
        const collar = (y: number, radius: number, thickness: number) => tube(gold, Array.from({ length: 64 }, (_, i): Vec3 => { const angle = i / 64 * Math.PI * 2; return [holeX + radius * Math.cos(angle), y, radius * Math.sin(angle)]; }), thickness);
        collar(holeY + 0.665, 0.045, 0.012);
        collar(holeY + 0.69, 0.035, 0.014);
        collar(holeY + 0.715, 0.048, 0.012);
        const box = (x: number, y: number, z: number, w: number, h: number, d: number) => {
          const a: Vec3 = [x-w/2,y-h/2,z+d/2], b: Vec3 = [x+w/2,y-h/2,z+d/2], c: Vec3 = [x+w/2,y+h/2,z+d/2], e: Vec3 = [x-w/2,y+h/2,z+d/2];
          const f: Vec3 = [x-w/2,y-h/2,z-d/2], g: Vec3 = [x+w/2,y-h/2,z-d/2], k: Vec3 = [x+w/2,y+h/2,z-d/2], l: Vec3 = [x-w/2,y+h/2,z-d/2];
          quad(gold,a,b,c,e,[0,0,1]); quad(gold,g,f,l,k,[0,0,-1]); quad(gold,e,c,k,l,[0,1,0]); quad(gold,f,g,b,a,[0,-1,0]); quad(gold,b,g,k,c,[1,0,0]); quad(gold,f,a,e,l,[-1,0,0]);
        };
        box(holeX, holeY + 0.775, 0, 0.255, 0.10, 0.075);
        for (const z of [-0.038, 0.038]) {
          tube(gold, [[holeX-.115,holeY+.732,z],[holeX+.115,holeY+.732,z],[holeX+.125,holeY+.743,z],[holeX+.125,holeY+.807,z],[holeX+.115,holeY+.818,z],[holeX-.115,holeY+.818,z],[holeX-.125,holeY+.807,z],[holeX-.125,holeY+.743,z]], 0.009);
        }
        const arch: Vec3[] = [[holeX-.105,holeY+.82,0],[holeX-.105,holeY+1.05,0]];
        for (let i=0;i<=48;i++) { const a=Math.PI-i/48*Math.PI; arch.push([holeX+.105*Math.cos(a),holeY+1.05+.12*Math.sin(a),0]); }
        arch.push([holeX+.105,holeY+.99,0]);
        tube(gold,arch,0.022,false);
        tube(gold,[[holeX+.105,holeY+.82,0],[holeX+.105,holeY+.983,0]],0.015,false);
        box(holeX+.105,holeY+.985,0,0.026,0.018,0.047);
        ellipse(gold,[holeX+.075,holeY+.762,0.046],0.017,0.017,0.005);
        const data: number[] = [];
        for (const mesh of meshes) { mesh.start = data.length / 8; mesh.count = mesh.values.length / 8; for (const value of mesh.values) data.push(value); }
        const buffer = context.createBuffer();
        if (!buffer) throw new Error("The 3D preview could not start.");
        buffers.push(buffer); context.bindBuffer(context.ARRAY_BUFFER, buffer); context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW);
        for (const [name, size, offset] of [["position", 3, 0], ["normal", 3, 12], ["uv", 2, 24]] as const) {
          const attribute = context.getAttribLocation(program, name); context.enableVertexAttribArray(attribute); context.vertexAttribPointer(attribute, size, context.FLOAT, false, 32, offset);
        }
        for (const art of [front, back]) {
          const texture = context.createTexture();
          if (!texture) throw new Error("The artwork could not be uploaded.");
          textures.push(texture); context.bindTexture(context.TEXTURE_2D, texture); context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1); context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, art);
          context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE); context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
          context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR); context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
        }
        const uniforms = { model: context.getUniformLocation(program, "model"), camera: context.getUniformLocation(program, "camera"), material: context.getUniformLocation(program, "material"), light: context.getUniformLocation(program, "lightMode"), hole: context.getUniformLocation(program, "hole"), body: context.getUniformLocation(program, "bodySize"), radius: context.getUniformLocation(program, "holeRadius") };
        context.uniform1i(context.getUniformLocation(program, "artwork"), 0);
        context.uniform2f(uniforms.body, width, height); context.uniform1f(uniforms.radius, holeRadius);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const fit = () => {
          const rect = canvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 1.75);
          canvas.width = Math.max(1, Math.round(rect.width * ratio)); canvas.height = Math.max(1, Math.round(rect.height * ratio));
          context.viewport(0, 0, canvas.width, canvas.height);
        };
        resize = new ResizeObserver(fit); resize.observe(canvas); fit();
        if (typeof IntersectionObserver !== "undefined") { intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; }); intersection.observe(canvas); }
        let previous = 0, previousWidth = 0, previousHeight = 0, previousTheme: boolean | undefined;
        type Particle = { position: Vec3; previous: Vec3 };
        const lengths = [0.155, 0.14, 0.695];
        const weights = [0, 1, 1, 0.35];
        let particles: Particle[] = [], previousModel: Float32Array | null = null, awake = true, quietFrames = 0;
        const transform = (matrix: Float32Array, p: Vec3): Vec3 => [matrix[0]*p[0]+matrix[4]*p[1]+matrix[8]*p[2]+matrix[12],matrix[1]*p[0]+matrix[5]*p[1]+matrix[9]*p[2]+matrix[13],matrix[2]*p[0]+matrix[6]*p[1]+matrix[10]*p[2]+matrix[14]];
        const local = (matrix: Float32Array, p: Vec3): Vec3 => {
          const x=p[0]-matrix[12],y=p[1]-matrix[13],z=p[2]-matrix[14];
          return [matrix[0]*x+matrix[1]*y+matrix[2]*z,matrix[4]*x+matrix[5]*y+matrix[6]*z,matrix[8]*x+matrix[9]*y+matrix[10]*z];
        };
        const pose = (a: Vec3, b: Vec3, pivot: number, reference: Vec3) => {
          const y=unit(add(b,scale(a,-1)));
          let x=unit(cross(y,reference));
          if(Math.hypot(...x)<0.01)x=unit(cross(y,[1,0,0]));
          const z=unit(cross(x,y)),m=identity();
          m.set(x,0);m.set(y,4);m.set(z,8);
          const origin:Vec3=[holeX,holeY+pivot,0];
          m[12]=a[0]-x[0]*origin[0]-y[0]*origin[1];m[13]=a[1]-x[1]*origin[0]-y[1]*origin[1];m[14]=a[2]-x[2]*origin[0]-y[2]*origin[1];
          return m;
        };
        const stepHardware = (model: Float32Array, duration: number) => {
          const anchor=transform(model,[holeX,holeY+0.18,0.025]);
          if(!particles.length){
            particles=[0,0.155,0.295,0.99].map((length,index)=>{const position=transform(model,[holeX+length*0.14,holeY+0.18+length*0.98,0.025+index*0.02]);return {position,previous:[...position] as Vec3};});
          }
          const before=particles.map(p=>[...p.position] as Vec3);
          const substeps=Math.max(1,Math.ceil(duration/(1/120))),dt=duration/substeps;
          const collide = (point: Vec3, oldPoint: Vec3, radius: number): Vec3 => {
            const q=local(model,point),old=local(previousModel??model,oldPoint);
            const x=Math.floor((q[0]/width+0.5)*sample.width),y=Math.floor((0.5-q[1]/height)*sample.height);
            if(!filled(x,y)||Math.hypot(q[0]-holeX,q[1]-holeY)<holeRadius)return point;
            const surface=depth/2+radius;
            const crossed=old[2]*q[2]<0&&Math.abs(old[2])>depth/2;
            if(Math.abs(q[2])<surface||crossed){q[2]=(old[2]<0?-1:1)*surface;return transform(model,q);}
            return point;
          };
          for(let sub=0;sub<substeps;sub++){
            const blend=(sub+1)/substeps;
            particles[0].position=add(scale(before[0],1-blend),scale(anchor,blend));
            for(let i=1;i<particles.length;i++){
              const p=particles[i],velocity=scale(add(p.position,scale(p.previous,-1)),Math.pow(0.986,dt*60));
              p.previous=[...p.position] as Vec3;
              p.position=add(add(p.position,velocity),[0,-8.5*dt*dt,0]);
            }
            for(let iteration=0;iteration<14;iteration++){
              for(let i=0;i<lengths.length;i++){
                const a=particles[i],b=particles[i+1],delta=add(b.position,scale(a.position,-1)),distance=Math.max(0.00001,Math.hypot(...delta));
                const correction=scale(delta,(distance-lengths[i])/distance),sum=weights[i]+weights[i+1];
                a.position=add(a.position,scale(correction,weights[i]/sum));b.position=add(b.position,scale(correction,-weights[i+1]/sum));
              }
              for(let i=1;i<particles.length;i++)particles[i].position=collide(particles[i].position,particles[i].previous,i===3?0.052:0.021);
              for(let i=0;i<lengths.length;i++){
                const a=particles[i],b=particles[i+1],radius=i===2?0.052:0.021;
                for(let j=1;j<7;j++){
                  const t=j/7,point=add(scale(a.position,1-t),scale(b.position,t)),oldPoint=add(scale(a.previous,1-t),scale(b.previous,t));
                  const hit=collide(point,oldPoint,radius),correction=add(hit,scale(point,-1));
                  if(Math.hypot(...correction)<0.000001)continue;
                  const denominator=weights[i]*(1-t)*(1-t)+weights[i+1]*t*t;
                  if(denominator>0){a.position=add(a.position,scale(correction,weights[i]*(1-t)/denominator));b.position=add(b.position,scale(correction,weights[i+1]*t/denominator));}
                }
              }
            }
          }
          particles[0].previous=[...particles[0].position] as Vec3;
          const motion=Math.max(...particles.map((p,i)=>Math.hypot(...add(p.position,scale(before[i],-1)))));
          quietFrames=motion<0.00012?quietFrames+1:0;
          awake=quietFrames<45;
          previousModel=new Float32Array(model);
        };
        const render = (now: number) => {
          if (disposed || context.isContextLost()) return;
          frame = requestAnimationFrame(render);
          const elapsed = Math.min((now - previous) / 1000 || 0, 0.05); previous = now;
          if (!visible || document.hidden) return;
          const state = controls.current;
          if (state.spin && !state.dragging && !reduced.matches) state.targetY += elapsed * 0.27;
          const hardwareMoving = awake;
          const moving = hardwareMoving || state.spin && !reduced.matches || Math.abs(state.targetX - state.x) > 0.00001 || Math.abs(state.targetY - state.y) > 0.00001;
          if (!moving && previousWidth === canvas.width && previousHeight === canvas.height && previousTheme === themeRef.current) return;
          previousWidth = canvas.width; previousHeight = canvas.height; previousTheme = themeRef.current;
          const smooth = reduced.matches ? 1 : 1 - Math.exp(-elapsed * 10);
          state.x += (state.targetX - state.x) * smooth; state.y += (state.targetY - state.y) * smooth;
          const model = rotation(state.x, state.y, -0.065);
          model[13] = -0.3;
          const bodyMoved=!previousModel||previousModel.some((value,index)=>Math.abs(value-model[index])>0.00001);
          if(bodyMoved){awake=true;quietFrames=0;}
          if(reduced.matches){
            particles=[];
            stepHardware(model,0);
            for(let i=0;i<150;i++)stepHardware(model,1/60);
            awake=false;
          }else if(awake||!particles.length)stepHardware(model,elapsed);
          context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
          context.uniformMatrix4fv(uniforms.model, false, model);
          const aspect = canvas.width / canvas.height;
          context.uniformMatrix4fv(uniforms.camera, false, projection(aspect, Math.max(5.9, 5.1 / aspect) / state.zoom));
          context.uniform1f(uniforms.light, themeRef.current ? 1 : 0);
          const reference:Vec3=[model[8],model[9],model[10]];
          const linkOne = pose(particles[0].position,particles[1].position,0.18,reference);
          const linkTwo = pose(particles[1].position,particles[2].position,0.335,reference);
          const clasp = pose(particles[2].position,particles[3].position,0.475,reference);
          for (let index = 0; index < meshes.length; index++) {
            const mesh = meshes[index];
            context.uniformMatrix4fv(uniforms.model, false, index === 4 ? linkOne : index === 5 ? linkTwo : index === 6 ? clasp : model);
            if (mesh.material < 2) {
              const facingFront = Math.cos(state.y) * Math.cos(state.x) >= 0;
              if ((mesh.material === 0) !== facingFront) continue;
              context.bindTexture(context.TEXTURE_2D, textures[mesh.material]);
              context.uniform2f(uniforms.hole, holeX, holeY);
            }
            context.uniform1f(uniforms.material, mesh.material); context.drawArrays(context.TRIANGLES, mesh.start, mesh.count);
          }
        };
        setReady(true); frame = requestAnimationFrame(render);
      } catch (cause) { if (!disposed) { setReady(false); setError(cause instanceof Error ? cause.message : "The 3D preview could not load."); } }
    };
    void init();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize?.disconnect(); intersection?.disconnect(); canvas.removeEventListener("webglcontextlost", lost);
      if (gl) { for (const texture of textures) gl.deleteTexture(texture); for (const buffer of buffers) gl.deleteBuffer(buffer); for (const shader of shaders) gl.deleteShader(shader); if (program) gl.deleteProgram(program); }
    };
  }, [retry]);
  const chooseSide = (next: "front" | "back") => {
    const state = controls.current;
    state.spin = false; setSpinning(false); setSide(next);
    const turns = Math.round(state.targetY / (Math.PI * 2));
    state.targetY = turns * Math.PI * 2 + (next === "front" ? -0.2 : Math.PI + 0.2); state.targetX = -0.1;
  };
  return <figure className="keychain-figure">
    <div className={`keychain-stage ${ready ? "is-ready" : ""}`}>
      <div className="keychain-shadow" aria-hidden="true" />
      <canvas ref={canvasRef} role="img" aria-label="Interactive 3D preview of the MLPEKAYOU keychain with gold swivel clasp and a gravity-driven chain that drapes across the charm. Use the Front and Back buttons to view each side, or drag to rotate." className="keychain-canvas" onPointerDown={event => {
        if (!ready || event.button !== 0) return;
        const state = controls.current; state.dragging = true; state.spin = false; setSpinning(false); state.lastX = event.clientX; state.lastY = event.clientY; event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={event => {
        const state = controls.current; if (!state.dragging) return;
        state.targetY += (event.clientX - state.lastX) * 0.012; state.targetX = Math.max(-0.65, Math.min(0.65, state.targetX + (event.clientY - state.lastY) * 0.008)); state.lastX = event.clientX; state.lastY = event.clientY;
      }} onPointerUp={event => { controls.current.dragging = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { controls.current.dragging = false; }} onLostPointerCapture={() => { controls.current.dragging = false; }} />
      {!ready && !error && <div className="keychain-status" role="status"><span className="keychain-loader" />Preparing your preview...</div>}
      {error && <div className="keychain-fallback"><img src={side === "front" ? frontUrl : backUrl} alt={`${side === "front" ? "Front" : "Back"} of the MLPEKAYOU keychain`} /><p role="status">{error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Reload 3D preview</button></div>}
    </div>
    <figcaption className="keychain-caption"><span>{ready ? "Drag to turn it over" : "Keychain preview"}</span><div className="keychain-controls" aria-label="Keychain preview controls"><button type="button" onClick={() => chooseSide("front")} aria-pressed={side === "front" && !spinning}>Front</button><button type="button" onClick={() => chooseSide("back")} aria-pressed={side === "back" && !spinning}>Back</button><button type="button" disabled={!ready} onClick={() => { const next = !spinning; setSpinning(next); controls.current.spin = next; }} aria-pressed={spinning}>{spinning ? "Pause" : "Rotate"}</button></div></figcaption>
  </figure>;
}
export default function Support() {
  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const sync = () => { const root = document.documentElement; setIsLightMode(root.dataset.theme === "light" || root.classList.contains("light") || (!root.classList.contains("dark") && !root.dataset.theme)); };
    sync();
    const observer = new MutationObserver(sync); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] }); window.addEventListener("themechange", sync);
    return () => { observer.disconnect(); window.removeEventListener("themechange", sync); };
  }, []);
  return <div className={`keychain-support ${isLightMode ? "keychain-support-light" : ""}`}>
    <style>{`
.keychain-support{--support-bg:#0d0f10;--support-text:#f4f4f5;--support-muted:#a1a1aa;--support-line:#ffffff20;background:var(--support-bg);color:var(--support-text);min-height:100vh;padding:32px 24px 90px;font-family:"Oxanium",sans-serif}
.keychain-support-light{--support-bg:#f4f4f1;--support-text:#202124;--support-muted:#626269;--support-line:#00000020}
.keychain-support *{box-sizing:border-box}
.keychain-support main{max-width:1440px;margin:0 auto}
.keychain-hero{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);align-items:center;gap:clamp(24px,5vw,80px);min-height:620px}
.keychain-intro{padding:24px 0 36px;max-width:510px}
.keychain-kicker{margin:0 0 22px;color:hsl(var(--primary));font-size:12px;letter-spacing:.13em;font-weight:600;text-transform:uppercase}
.keychain-intro h1{font-size:clamp(30px,3.2vw,46px);font-weight:600;line-height:1.08;letter-spacing:-.055em;margin:0}
.keychain-intro h1 span{display:block;color:var(--support-muted);font-weight:400;font-size:.48em;letter-spacing:-.02em;margin-top:15px}
.keychain-discord-link{color:var(--support-text);text-underline-offset:4px}.keychain-description{color:var(--support-muted);font-size:16px;line-height:1.85;margin:24px 0 0;max-width:430px}
.keychain-prize-note{border-left:2px solid hsl(var(--primary));padding-left:15px;margin:28px 0;font-size:13px;line-height:1.8;color:var(--support-muted)}
.keychain-prize-note strong{display:block;color:var(--support-text);font-weight:600;font-size:14px}
.keychain-shop-link{display:inline-flex;align-items:center;justify-content:space-between;gap:22px;min-height:48px;padding:12px 0;border-bottom:1px solid hsl(var(--primary));color:var(--support-text);text-decoration:none;font-size:14px;font-weight:600;transition:color .2s}
.keychain-shop-link:hover{color:hsl(var(--primary))}
.keychain-shop-link svg{transition:transform .2s}.keychain-shop-link:hover svg{transform:translateX(4px)}
.keychain-support button,.keychain-support a{-webkit-tap-highlight-color:transparent}
.keychain-support button:focus-visible,.keychain-support a:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:5px}
.keychain-figure{margin:0;min-width:0;position:relative}
.keychain-stage{position:relative;height:clamp(430px,44vw,640px);isolation:isolate}
.keychain-stage:before{content:"";position:absolute;inset:14% 2% 2%;background:radial-gradient(ellipse at 50% 52%,#6d5ee812,transparent 64%);z-index:-1;pointer-events:none}
.keychain-shadow{position:absolute;bottom:4%;left:22%;right:16%;height:18px;border-radius:50%;background:#0009;filter:blur(19px);opacity:.34;pointer-events:none;transform:rotate(-4deg)}
.keychain-support-light .keychain-shadow{background:#393055;opacity:.22}
.keychain-canvas{display:block;position:relative;width:100%;height:100%;cursor:grab;touch-action:pan-y;opacity:0;transition:opacity .5s}
.keychain-canvas:active{cursor:grabbing}.keychain-stage.is-ready .keychain-canvas{opacity:1}
.keychain-status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-size:12px;color:var(--support-muted)}
.keychain-loader{width:15px;height:15px;border:1.5px solid var(--support-line);border-top-color:hsl(var(--primary));border-radius:50%;animation:keychain-loading .9s linear infinite}
.keychain-caption{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--support-line);padding:15px 0;font-size:11px;color:var(--support-muted)}
.keychain-controls{display:flex;gap:18px}.keychain-controls button{appearance:none;border:0;border-bottom:1px solid transparent;background:none;color:var(--support-muted);font:inherit;padding:7px 0;min-height:36px;cursor:pointer}
.keychain-controls button[aria-pressed=true]{border-color:hsl(var(--primary));color:var(--support-text)}.keychain-controls button:hover{color:var(--support-text)}.keychain-controls button:disabled{opacity:.4;cursor:default}
.keychain-fallback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.keychain-fallback img{width:100%;max-height:80%;object-fit:contain}.keychain-fallback p{color:var(--support-muted);font-size:12px;line-height:1.6}.keychain-fallback button{background:none;border:0;color:hsl(var(--primary));text-decoration:underline;cursor:pointer;font:inherit;font-size:12px;min-height:40px}
.keychain-partners{border-top:1px solid var(--support-line);padding:35px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px}
.keychain-partners h2{font-size:20px;font-weight:600;margin:0 0 12px;letter-spacing:-.025em}.keychain-partners p{font-size:13px;line-height:1.9;color:var(--support-muted);margin:0 0 14px;max-width:520px}.keychain-partners strong{color:var(--support-text);font-weight:600}.keychain-partners a{color:var(--support-text);font-size:13px;text-underline-offset:5px}
.keychain-footer{margin-top:35px;padding-top:20px;border-top:1px solid var(--support-line);color:var(--support-muted);font-size:11px;line-height:1.8}.keychain-footer a{color:var(--support-text);text-underline-offset:4px}
@keyframes keychain-loading{to{transform:rotate(360deg)}}
@media(max-width:900px){.keychain-hero{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:22px;min-height:520px}.keychain-intro h1{font-size:36px}.keychain-stage{height:470px}.keychain-description{font-size:14px}.keychain-intro{padding-bottom:15px}.keychain-partners{gap:35px}}
@media(max-width:639px){.keychain-support{padding:24px 18px 100px}.keychain-hero{display:flex;flex-direction:column;gap:0;min-height:0;align-items:stretch}.keychain-intro{display:contents}.keychain-kicker{order:0;margin-bottom:14px;font-size:10px}.keychain-intro h1{order:1;font-size:34px;max-width:380px}.keychain-figure{order:2;margin-top:8px}.keychain-stage{height:clamp(350px,104vw,460px)}.keychain-description{order:3;margin-top:22px;max-width:100%;font-size:14px}.keychain-prize-note{order:4;margin:20px 0 12px;font-size:12px}.keychain-shop-link{order:5;align-self:flex-start;font-size:13px}.keychain-caption{font-size:10px;gap:8px;padding:10px 0}.keychain-controls{gap:16px}.keychain-partners{grid-template-columns:1fr;gap:28px;margin-top:34px;padding-top:28px}.keychain-partners h2{font-size:18px}.keychain-footer{font-size:10px}.keychain-shadow{bottom:5%}}
@media(prefers-reduced-motion:reduce){.keychain-support *{animation:none!important;transition:none!important}}
    `}</style>
    <main>
      <section className="keychain-hero" aria-labelledby="keychain-title">
        <div className="keychain-intro"><h1 id="keychain-title">Upcoming Rewards</h1><p className="keychain-description">Rewards are coming to StonesTradingCo! Some are simple pins and keychains of the logo for lower tier prizes, and bigger prizes are coming! I commissioned a resident artist for these! In about a month, keep an eye out for tote bags and keychains! Join us in the <a href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer" className="keychain-discord-link">Discord server<span className="sr-only"> (opens in a new tab)</span></a> to know when they officially release!</p><p className="keychain-prize-note"><strong>Note: These are NOT yet available.</strong>The only merch tier rewards at the moment are keychains and pins of the standard logo.</p></div>
        <KeychainPreview isLightMode={isLightMode} />
      </section>
      <section className="keychain-partners" aria-label="Support MLPEKAYOU through our partners"><div><h2>Your order supports MLPEKAYOU.</h2><p>Qualifying purchases earn me a commission at no extra cost to you and help keep the website free. At StonesTradingCo checkout, choose <strong>MLPEKAYOU</strong> under "Where did you hear about us?" so your order is credited to me.</p><p>Choosing TikTok, Discord, Google, or another option means I do not receive the commission, even when you use my link. You can have your order shipped or arrange a live opening on StonesTradingCo TikTok or in the MLPEKAYOU Discord server.</p></div><div><h2>Looking for Chinese releases?</h2><p>Browse Chinese Kayou cards and merchandise through the MLPEKAYOU guest picks at PakraCards. Visit their store for current stock, prices, and preorder details.</p><a href={pakraUrl} target="_blank" rel="noopener noreferrer">Browse PakraCards<span className="sr-only"> (opens in a new tab)</span></a></div></section>
      <footer className="keychain-footer">Ordering from StonesTradingCo? Ask me about a poster. Each Kayou case typically includes five, so availability is limited. One per customer per day. <a href="https://discord.gg/mlpekayou" target="_blank" rel="noopener noreferrer">Join the Discord<span className="sr-only"> (opens in a new tab)</span></a></footer>
    </main>
  </div>;
}
