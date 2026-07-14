import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputRoot = path.join(root, "public/assets/generated");

const assets = [
  {
    id: "samir-idle",
    source: "public/assets/concept/samir-animation-board.png",
    output: "characters/samir/idle.png",
    category: "protagonist",
    crop: { left: 45, top: 210, width: 86, height: 132 },
    transparentPaper: true,
    targetHeight: 96,
    anchor: { x: 0.5, y: 0.94 },
    hitbox: { x: -18, y: -72, width: 36, height: 72 },
    hurtbox: { x: -22, y: -82, width: 44, height: 82 },
  },
  {
    id: "samir-run-1",
    source: "public/assets/concept/samir-animation-board.png",
    output: "characters/samir/run-1.png",
    category: "protagonist",
    animation: "run",
    duration: 90,
    crop: { left: 485, top: 210, width: 95, height: 132 },
    transparentPaper: true,
    targetHeight: 96,
    anchor: { x: 0.5, y: 0.94 },
  },
  {
    id: "samir-run-2",
    source: "public/assets/concept/samir-animation-board.png",
    output: "characters/samir/run-2.png",
    category: "protagonist",
    animation: "run",
    duration: 90,
    crop: { left: 565, top: 210, width: 100, height: 132 },
    transparentPaper: true,
    targetHeight: 96,
    anchor: { x: 0.5, y: 0.94 },
  },
  {
    id: "directorio-rifleman",
    source: "public/assets/concept/directorio-reference.png",
    output: "enemies/directorio/rifleman.png",
    category: "enemy",
    crop: { left: 394, top: 76, width: 58, height: 92 },
    transparentPaper: true,
    targetHeight: 88,
    anchor: { x: 0.5, y: 0.95 },
    hitbox: { x: -17, y: -66, width: 34, height: 66 },
    hurtbox: { x: -20, y: -74, width: 40, height: 74 },
  },
  {
    id: "ojo-del-cielo-prototype",
    source: "public/assets/concept/directorio-reference.png",
    output: "bosses/ojo-del-cielo.png",
    category: "boss",
    crop: { left: 552, top: 471, width: 76, height: 48 },
    transparentPaper: true,
    targetHeight: 104,
    anchor: { x: 0.5, y: 0.5 },
    hitbox: { x: -43, y: -29, width: 86, height: 58 },
    hurtbox: { x: -48, y: -34, width: 96, height: 68 },
  },
  {
    id: "barrio-del-olivo",
    source: "public/assets/concept/environments.png",
    output: "backgrounds/barrio-del-olivo.png",
    category: "background",
    crop: { left: 22, top: 164, width: 466, height: 435 },
    transparentPaper: false,
    resize: { width: 1280, height: 720, fit: "cover" },
    anchor: { x: 0, y: 0 },
  },
];

async function removePaperBackground(image) {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const isPaper = (pixelIndex) => {
    const offset = pixelIndex * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const brightness = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    return brightness > 125 && chroma < 95 && r + 8 >= g && g + 12 >= b;
  };
  const enqueue = (pixelIndex) => {
    if (visited[pixelIndex] || !isPaper(pixelIndex)) return;
    visited[pixelIndex] = 1;
    queue[tail++] = pixelIndex;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = queue[head++];
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    data[pixelIndex * 4 + 3] = 0;
    if (x > 0) enqueue(pixelIndex - 1);
    if (x + 1 < width) enqueue(pixelIndex + 1);
    if (y > 0) enqueue(pixelIndex - width);
    if (y + 1 < height) enqueue(pixelIndex + width);
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  });
}

async function extractAsset(spec) {
  const sourcePath = path.join(root, spec.source);
  const outputPath = path.join(outputRoot, spec.output);
  await mkdir(path.dirname(outputPath), { recursive: true });

  let pipeline = sharp(sourcePath).extract(spec.crop);
  if (spec.transparentPaper) {
    pipeline = await removePaperBackground(pipeline);
    pipeline = pipeline.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }
  if (spec.targetHeight) {
    pipeline = pipeline.resize({
      height: spec.targetHeight,
      kernel: sharp.kernel.nearest,
      withoutEnlargement: false,
    });
  }
  if (spec.resize) {
    pipeline = pipeline.resize({
      ...spec.resize,
      kernel: sharp.kernel.nearest,
    });
  }

  const info = await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
  return {
    id: spec.id,
    file: `/assets/generated/${spec.output}`,
    source: `/${spec.source.replace(/^public\//, "")}`,
    sourceCrop: spec.crop,
    category: spec.category,
    animation: spec.animation ?? null,
    duration: spec.duration ?? null,
    width: info.width,
    height: info.height,
    anchor: spec.anchor,
    hitbox: spec.hitbox ?? null,
    hurtbox: spec.hurtbox ?? null,
  };
}

await mkdir(outputRoot, { recursive: true });
const manifest = [];
for (const asset of assets) {
  manifest.push(await extractAsset(asset));
}

await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), assets: manifest }, null, 2)}\n`,
);

console.log(`Extracted ${manifest.length} prototype assets.`);
