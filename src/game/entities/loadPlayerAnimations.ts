import { Assets, Texture } from "pixi.js";
import type {
  PlayerAnimationLibrary,
  PlayerAnimationName,
} from "@/game/entities/PlayerView";

interface AtlasFrame {
  file: string;
  duration: number;
}

interface SamirAtlas {
  animations: Record<PlayerAnimationName, AtlasFrame[]>;
}

const nonLooping = new Set<PlayerAnimationName>([
  "land",
  "shoot",
  "hurt",
  "death",
]);

export async function loadPlayerAnimations(): Promise<PlayerAnimationLibrary> {
  const response = await fetch("/assets/characters/samir/samir.atlas.json");
  if (!response.ok) throw new Error("No se pudo cargar el atlas normalizado de Samir.");
  const atlas = (await response.json()) as SamirAtlas;
  const entries = await Promise.all(
    Object.entries(atlas.animations).map(async ([name, frames]) => {
      const textures = await Promise.all(
        frames.map(async (frame) => {
          const texture = await Assets.load<Texture>(frame.file);
          texture.source.scaleMode = "nearest";
          return texture;
        }),
      );
      return [
        name,
        {
          textures,
          durations: frames.map((frame) => frame.duration),
          loop: !nonLooping.has(name as PlayerAnimationName),
        },
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as PlayerAnimationLibrary;
}
