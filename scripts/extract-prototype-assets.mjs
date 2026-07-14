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
    crop: { left: 392, top: 72, width: 76, height: 150 },
    transparentPaper: true,
    targetHeight: 88,
    anchor: { x: 0.5, y: 0.95 },
    hitbox: { x: -17, y: -66, width: 34, height: 66 },
    hurtbox: { x: -20, y: -74, width: 40, height: 74 },
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

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const paperLike = brightness > 170 && chroma < 55 && r >= b;

    if (paperLike) {
      const alpha = Math.max(0, Math.min(255, (205 - brightness) * 8));
      data[i + 3] = alpha;
    }
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
