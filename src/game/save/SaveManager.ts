import { openDB } from "idb";

export interface SaveData {
  version: number;
  profileId: string;
  currentMission: string;
  checkpointId: string;
  playerX: number;
  unlockedMissions: string[];
  rescues: number;
  moral: number;
  updatedAt: string;
}

const databaseName = "gaza-cenizas-del-olivo";
const storeName = "saves";

async function database() {
  return openDB(databaseName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName))
        db.createObjectStore(storeName);
    },
  });
}

export async function saveGame(data: SaveData): Promise<void> {
  const db = await database();
  await db.put(storeName, data, data.profileId);
}

export async function loadGame(
  profileId = "default",
): Promise<SaveData | null> {
  const db = await database();
  return (await db.get(storeName, profileId)) ?? null;
}
