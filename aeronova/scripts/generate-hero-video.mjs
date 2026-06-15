import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import ffmpegPath from "ffmpeg-static";

const width = 1280;
const height = 720;
const fps = 24;
const seconds = 6;
const frames = fps * seconds;
const root = process.cwd();
const outDir = join(root, "client", "public", "media");
const frameDir = join(tmpdir(), "aeronova-hero-frames");
const mp4Path = join(outDir, "aeronova-hero.mp4");
const webmPath = join(outDir, "aeronova-hero.webm");
const posterPath = join(outDir, "aeronova-hero-poster.ppm");
const posterJpgPath = join(outDir, "aeronova-hero-poster.jpg");

mkdirSync(outDir, { recursive: true });
if (existsSync(frameDir)) {
  rmSync(frameDir, { recursive: true, force: true });
}
mkdirSync(frameDir, { recursive: true });

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function colorMix(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function setPixel(buffer, x, y, color, alpha = 1) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || px >= width || py < 0 || py >= height) return;
  const index = (py * width + px) * 3;
  buffer[index] = clamp(mix(buffer[index], color[0], alpha));
  buffer[index + 1] = clamp(mix(buffer[index + 1], color[1], alpha));
  buffer[index + 2] = clamp(mix(buffer[index + 2], color[2], alpha));
}

function drawLine(buffer, x0, y0, x1, y1, color, thickness = 1, alpha = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    for (let oy = -thickness; oy <= thickness; oy += 1) {
      for (let ox = -thickness; ox <= thickness; ox += 1) {
        if (ox * ox + oy * oy <= thickness * thickness) {
          setPixel(buffer, x + ox, y + oy, color, alpha);
        }
      }
    }
  }
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function drawPolygon(buffer, polygon, color, alpha = 1) {
  const minX = Math.floor(Math.max(0, Math.min(...polygon.map((p) => p[0]))));
  const maxX = Math.ceil(Math.min(width - 1, Math.max(...polygon.map((p) => p[0]))));
  const minY = Math.floor(Math.max(0, Math.min(...polygon.map((p) => p[1]))));
  const maxY = Math.ceil(Math.min(height - 1, Math.max(...polygon.map((p) => p[1]))));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (pointInPolygon(x, y, polygon)) {
        setPixel(buffer, x, y, color, alpha);
      }
    }
  }
}

function drawGlow(buffer, cx, cy, radius, color, alpha = 0.4) {
  const minX = Math.floor(Math.max(0, cx - radius));
  const maxX = Math.ceil(Math.min(width - 1, cx + radius));
  const minY = Math.floor(Math.max(0, cy - radius));
  const maxY = Math.ceil(Math.min(height - 1, cy + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) / radius;
      if (d <= 1) {
        setPixel(buffer, x, y, color, alpha * (1 - d) * (1 - d));
      }
    }
  }
}

function drawPlane(buffer, t) {
  const sweep = easeInOut((t + 0.08) % 1);
  const cx = mix(width + 210, -240, sweep);
  const cy = 188 + Math.sin(t * Math.PI * 2) * 14;
  const scale = mix(0.62, 1.08, 1 - Math.abs(0.5 - sweep) * 2);
  const body = [
    [cx - 185 * scale, cy + 8 * scale],
    [cx + 215 * scale, cy - 12 * scale],
    [cx + 254 * scale, cy + 4 * scale],
    [cx + 214 * scale, cy + 20 * scale],
    [cx - 185 * scale, cy + 19 * scale]
  ];
  const wingTop = [
    [cx - 28 * scale, cy + 4 * scale],
    [cx + 114 * scale, cy - 116 * scale],
    [cx + 168 * scale, cy - 108 * scale],
    [cx + 42 * scale, cy + 17 * scale]
  ];
  const wingBottom = [
    [cx - 18 * scale, cy + 21 * scale],
    [cx + 126 * scale, cy + 135 * scale],
    [cx + 174 * scale, cy + 121 * scale],
    [cx + 42 * scale, cy + 10 * scale]
  ];
  const tail = [
    [cx - 160 * scale, cy + 9 * scale],
    [cx - 248 * scale, cy - 55 * scale],
    [cx - 220 * scale, cy + 12 * scale]
  ];
  const alpha = 0.82;
  drawLine(buffer, cx - 475 * scale, cy + 20 * scale, cx - 140 * scale, cy + 14 * scale, [174, 232, 224], 2, 0.5);
  drawPolygon(buffer, tail, [210, 232, 229], alpha * 0.8);
  drawPolygon(buffer, wingTop, [235, 244, 241], alpha);
  drawPolygon(buffer, wingBottom, [27, 153, 139], alpha * 0.78);
  drawPolygon(buffer, body, [247, 241, 232], alpha);
  drawGlow(buffer, cx + 236 * scale, cy + 5 * scale, 18 * scale, [244, 96, 54], 0.8);
}

function renderFrame(frame) {
  const buffer = Buffer.alloc(width * height * 3);
  const t = frame / frames;
  const skyA = [4, 25, 36];
  const skyB = [8, 86, 96];
  const skyC = [244, 96, 54];

  for (let y = 0; y < height; y += 1) {
    const v = y / height;
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const wave = Math.sin((u * 2.4 + t * 0.35) * Math.PI * 2) * 0.06;
      const c1 = colorMix(skyA, skyB, Math.min(1, u * 1.1 + wave));
      const c2 = colorMix(c1, skyC, Math.max(0, u - 0.52) * 1.4);
      const shade = 0.72 + 0.28 * (1 - v);
      const index = (y * width + x) * 3;
      buffer[index] = clamp(c2[0] * shade);
      buffer[index + 1] = clamp(c2[1] * shade);
      buffer[index + 2] = clamp(c2[2] * shade);
    }
  }

  drawGlow(buffer, 930 + Math.sin(t * Math.PI * 2) * 80, 210, 240, [244, 96, 54], 0.28);
  drawGlow(buffer, 265 + Math.cos(t * Math.PI * 2) * 40, 326, 190, [174, 232, 224], 0.18);

  for (let i = 0; i < 9; i += 1) {
    const y = 115 + i * 48 + Math.sin(t * Math.PI * 2 + i) * 8;
    const x = ((i * 171 - t * 440) % (width + 340)) - 170;
    drawLine(buffer, x, y, x + 210 + i * 15, y - 12, [247, 241, 232], 2, 0.18);
  }

  const horizonY = 514;
  drawPolygon(buffer, [[0, horizonY + 110], [width, horizonY - 18], [width, height], [0, height]], [6, 16, 22], 0.88);
  drawPolygon(buffer, [[0, height - 70], [width, height - 18], [width, height], [0, height]], [2, 11, 17], 0.92);
  drawLine(buffer, width * 0.5, horizonY, 390, height, [247, 241, 232], 1, 0.3);
  drawLine(buffer, width * 0.5, horizonY, 770, height, [247, 241, 232], 1, 0.25);
  drawLine(buffer, width * 0.5, horizonY, 520, height, [244, 96, 54], 2, 0.18);
  for (let i = 0; i < 18; i += 1) {
    const offset = (i * 46 + t * 360) % 680;
    const y = horizonY + offset * 0.42;
    const x = width * 0.5 + offset * 0.18;
    drawLine(buffer, x - 18, y, x + 18, y - 9, [247, 241, 232], 1, 0.35);
  }

  drawPlane(buffer, t);
  for (let i = 0; i < 18; i += 1) {
    const p = (t * 1.2 + i * 0.071) % 1;
    const x = mix(180, width - 180, p);
    const y = 640 + Math.sin(i * 2.1) * 34;
    drawGlow(buffer, x, y, i % 3 === 0 ? 7 : 4, i % 2 === 0 ? [244, 96, 54] : [174, 232, 224], 0.72);
  }

  const header = Buffer.from(`P6\n${width} ${height}\n255\n`);
  return Buffer.concat([header, buffer]);
}

for (let frame = 0; frame < frames; frame += 1) {
  const data = renderFrame(frame);
  const file = join(frameDir, `frame-${String(frame).padStart(4, "0")}.ppm`);
  writeFileSync(file, data);
  if (frame === 0) {
    writeFileSync(posterPath, data);
  }
}

const mp4Args = [
  "-y",
  "-framerate",
  String(fps),
  "-i",
  join(frameDir, "frame-%04d.ppm"),
  "-vf",
  "format=yuv420p",
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "20",
  "-movflags",
  "+faststart",
  mp4Path
];

const mp4Result = spawnSync(ffmpegPath, mp4Args, { stdio: "inherit" });
if (mp4Result.status !== 0) {
  rmSync(frameDir, { recursive: true, force: true });
  process.exit(mp4Result.status ?? 1);
}

const webmArgs = [
  "-y",
  "-framerate",
  String(fps),
  "-i",
  join(frameDir, "frame-%04d.ppm"),
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "0",
  "-crf",
  "34",
  "-pix_fmt",
  "yuv420p",
  webmPath
];

const webmResult = spawnSync(ffmpegPath, webmArgs, { stdio: "inherit" });
if (webmResult.status !== 0) {
  rmSync(frameDir, { recursive: true, force: true });
  process.exit(webmResult.status ?? 1);
}

const posterResult = spawnSync(
  ffmpegPath,
  ["-y", "-i", posterPath, "-frames:v", "1", "-q:v", "2", posterJpgPath],
  { stdio: "inherit" }
);
rmSync(frameDir, { recursive: true, force: true });
rmSync(posterPath, { force: true });

if (posterResult.status !== 0) {
  process.exit(posterResult.status ?? 1);
}

console.log(`Generated ${mp4Path}`);
console.log(`Generated ${webmPath}`);
console.log(`Generated ${posterJpgPath}`);
