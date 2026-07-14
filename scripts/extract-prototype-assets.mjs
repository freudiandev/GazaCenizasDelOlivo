import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicRoot = path.join(root, "public/assets");
const generatedRoot = path.join(publicRoot, "generated");
const samirRoot = path.join(publicRoot, "characters/samir");
const samirSource = "public/assets/concept/samir-animation-board.png";

const samirFrames = [
  frame("idle", 0, { left: 48, top: 198, width: 88, height: 140 }, 180),
  frame("walk", 0, { left: 150, top: 198, width: 78, height: 140 }, 120),
  frame("walk", 1, { left: 236, top: 198, width: 78, height: 140 }, 120),
  frame("walk", 2, { left: 318, top: 198, width: 82, height: 140 }, 120),
  frame("run", 0, { left: 426, top: 188, width: 98, height: 150 }, 95),
  frame("run", 1, { left: 532, top: 188, width: 92, height: 150 }, 95),
  frame("run", 2, { left: 632, top: 194, width: 92, height: 144 }, 95),
  frame("jump", 0, { left: 48, top: 398, width: 76, height: 140 }, 110),
  frame("jump", 1, { left: 125, top: 370, width: 78, height: 168 }, 100),
  frame("jump", 2, { left: 210, top: 360, width: 75, height: 178 }, 100),
  frame("jump", 3, { left: 294, top: 378, width: 66, height: 160 }, 110),
  frame("fall", 0, { left: 370, top: 398, width: 84, height: 142 }, 125),
  frame("fall", 1, { left: 452, top: 374, width: 78, height: 166 }, 125),
  frame("land", 0, { left: 583, top: 398, width: 84, height: 142 }, 140),
  frame("crouch", 0, { left: 875, top: 224, width: 82, height: 116 }, 140),
  frame("crouch", 1, { left: 950, top: 214, width: 88, height: 126 }, 140),
  frame("roll", 0, { left: 1072, top: 235, width: 88, height: 106 }, 90),
  frame("roll", 1, { left: 1165, top: 238, width: 90, height: 103 }, 90),
  frame("roll", 2, { left: 1270, top: 228, width: 105, height: 113 }, 90),
  frame("shoot", 0, { left: 700, top: 385, width: 110, height: 156 }, 85),
  frame("shoot", 1, { left: 810, top: 385, width: 105, height: 156 }, 85),
  frame("hurt", 0, { left: 374, top: 612, width: 82, height: 120 }, 150),
  frame("hurt", 1, { left: 458, top: 603, width: 98, height: 129 }, 150),
  frame("death", 0, { left: 458, top: 603, width: 98, height: 129 }, 240),
];

function frame(animation, index, crop, duration) {
  return {
    id: `samir-${animation}-${index}`,
    source: samirSource,
    output: `${animation}/frame-${String(index).padStart(2, "0")}.png`,
    publicGroup: "characters/samir",
    category: "protagonist",
    animation,
    duration,
    crop,
    transparentPaper: true,
    normalize: { width: 112, height: 112, contentWidth: 104, contentHeight: 100 },
    anchor: { x: 0.5, y: 1 },
    hitbox: { x: -18, y: -76, width: 36, height: 76 },
    hurtbox: { x: -22, y: -84, width: 44, height: 84 },
  };
}

const assets = [
  ...samirFrames,
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
    id: "sentinel-dx4",
    source: "public/assets/concept/directorio-reference.png",
    output: "bosses/sentinel-dx4.png",
    category: "boss",
    crop: { left: 552, top: 471, width: 76, height: 48 },
    transparentPaper: true,
    targetHeight: 104,
    anchor: { x: 0.5, y: 0.5 },
    hitbox: { x: -43, y: -29, width: 86, height: 58 },
    hurtbox: { x: -48, y: -34, width: 96, height: 68 },
  },
  background("barrio-del-olivo", { left: 22, top: 164, width: 466, height: 408 }),
  background("hospital-interior", { left: 492, top: 164, width: 461, height: 408 }),
  background("azoteas", { left: 958, top: 164, width: 467, height: 408 }),
  background("mercado", { left: 22, top: 575, width: 466, height: 420 }),
  background("tuneles", { left: 492, top: 575, width: 461, height: 420 }),
  background("torre-frontera", { left: 958, top: 575, width: 467, height: 420 }),
];

function background(id, crop) {
  return {
    id,
    source: "public/assets/concept/environments.png",
    output: `backgrounds/${id}.png`,
    category: "background",
    crop,
    transparentPaper: false,
    resize: { width: 1280, height: 720, fit: "cover" },
    anchor: { x: 0, y: 0 },
  };
}

async function removePaperBackground(image) {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
  return sharp(data, { raw: { width, height, channels: 4 } });
}

async function normalizeFrame(pipeline, contract) {
  const trimmed = await pipeline
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({
      width: contract.contentWidth,
      height: contract.contentHeight,
      fit: "inside",
      kernel: sharp.kernel.nearest,
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const metadata = await sharp(trimmed).metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;
  return sharp({
    create: {
      width: contract.width,
      height: contract.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    {
      input: trimmed,
      left: Math.floor((contract.width - width) / 2),
      top: contract.height - height,
    },
  ]);
}

async function extractAsset(spec) {
  const publicGroup = spec.publicGroup ?? "generated";
  const outputPath = path.join(publicRoot, publicGroup, spec.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  let pipeline = sharp(path.join(root, spec.source)).extract(spec.crop);
  if (spec.transparentPaper) pipeline = await removePaperBackground(pipeline);
  if (spec.normalize) pipeline = await normalizeFrame(pipeline, spec.normalize);
  else if (spec.transparentPaper)
    pipeline = pipeline.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (spec.targetHeight)
    pipeline = pipeline.resize({ height: spec.targetHeight, kernel: sharp.kernel.nearest });
  if (spec.resize) pipeline = pipeline.resize({ ...spec.resize, kernel: sharp.kernel.nearest });

  const info = await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
  return {
    id: spec.id,
    file: `/assets/${publicGroup}/${spec.output}`,
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

await rm(samirRoot, { recursive: true, force: true });
await rm(path.join(generatedRoot, "characters/samir"), { recursive: true, force: true });
await mkdir(generatedRoot, { recursive: true });
const manifest = [];
for (const asset of assets) manifest.push(await extractAsset(asset));

const animations = {};
for (const asset of manifest.filter((entry) => entry.category === "protagonist")) {
  animations[asset.animation] ??= [];
  animations[asset.animation].push({ file: asset.file, duration: asset.duration });
}
const atlas = {
  version: 1,
  frameSize: { width: 112, height: 112 },
  anchor: { x: 0.5, y: 1 },
  hitbox: { x: -18, y: -76, width: 36, height: 76 },
  hurtbox: { x: -22, y: -84, width: 44, height: 84 },
  animations,
};
await writeFile(path.join(samirRoot, "samir.atlas.json"), `${JSON.stringify(atlas, null, 2)}\n`);
await writeFile(
  path.join(generatedRoot, "manifest.json"),
  `${JSON.stringify({ version: 2, generatedAt: new Date().toISOString(), assets: manifest }, null, 2)}\n`,
);

console.log(`Extracted ${manifest.length} runtime assets and ${samirFrames.length} Samir frames.`);
