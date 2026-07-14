import { create } from "zustand";

interface GameHudState {
  health: number;
  ammo: number;
  score: number;
  rescues: number;
  objective: string;
  checkpoint: string;
  paused: boolean;
  completed: boolean;
  bossHealth: number | null;
  setHud: (values: Partial<Omit<GameHudState, "setHud">>) => void;
}

export const useGameStore = create<GameHudState>((set) => ({
  health: 100,
  ammo: 30,
  score: 0,
  rescues: 0,
  objective: "Encuentra una radio funcional",
  checkpoint: "Inicio",
  paused: false,
  completed: false,
  bossHealth: null,
  setHud: (values) => set(values),
}));
