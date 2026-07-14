import {
  mission01Sections,
  objectiveDefinition,
  type CheckpointDefinition,
  type MissionSection,
} from "@/game/data/mission01";

export interface MissionProgressSnapshot {
  completedObjectives: string[];
  checkpointId: string;
  checkpointX: number;
  rescues: number;
  collectibles: number;
}

export class MissionProgress {
  private readonly completed = new Set<string>();
  private checkpoint: CheckpointDefinition = {
    id: "mission-start",
    name: "Refugio",
    x: 180,
    requires: [],
  };
  rescues = 0;
  collectibles = 0;

  constructor(snapshot?: Partial<MissionProgressSnapshot>) {
    snapshot?.completedObjectives?.forEach((id) => this.completed.add(id));
    const savedCheckpoint = mission01Sections
      .map((section) => section.checkpoint)
      .find((entry) => entry?.id === snapshot?.checkpointId);
    if (savedCheckpoint) this.checkpoint = savedCheckpoint;
    this.rescues = snapshot?.rescues ?? 0;
    this.collectibles = snapshot?.collectibles ?? 0;
  }

  complete(id: string): number {
    if (this.completed.has(id)) return 0;
    const definition = objectiveDefinition(id);
    if (!definition) throw new Error(`Unknown mission objective: ${id}`);
    this.completed.add(id);
    return definition.points;
  }

  isComplete(id: string): boolean {
    return this.completed.has(id);
  }

  requirementsMet(requirements: readonly string[] = []): boolean {
    return requirements.every((id) => this.completed.has(id));
  }

  sectionAt(x: number): MissionSection {
    return (
      mission01Sections.find((section) => x >= section.start && x < section.end) ??
      mission01Sections[mission01Sections.length - 1]
    );
  }

  tryCheckpoint(x: number): CheckpointDefinition | null {
    const candidates = mission01Sections
      .map((section) => section.checkpoint)
      .filter((entry): entry is CheckpointDefinition => Boolean(entry))
      .filter((entry) => entry.x <= x && this.requirementsMet(entry.requires));
    const reached = candidates.at(-1);
    if (!reached || reached.x <= this.checkpoint.x) return null;
    this.checkpoint = reached;
    return reached;
  }

  nextObjective(section: MissionSection): string {
    const pending = section.objectives.find(
      (objective) => objective.required && !this.completed.has(objective.id),
    );
    return pending?.label ?? "Avanza hacia la siguiente zona";
  }

  canActivateSentinel(): boolean {
    return this.requirementsMet(["repeater-1", "repeater-2", "repeater-3", "access-codes"]);
  }

  canActivateJammer(): boolean {
    return this.requirementsMet([
      "install-battery",
      "connect-transmitter",
      "blocker-1",
      "blocker-2",
      "blocker-3",
    ]);
  }

  canBroadcast(): boolean {
    return this.isComplete("defeat-jammer");
  }

  get checkpointX(): number {
    return this.checkpoint.x;
  }

  get checkpointId(): string {
    return this.checkpoint.id;
  }

  snapshot(): MissionProgressSnapshot {
    return {
      completedObjectives: [...this.completed],
      checkpointId: this.checkpoint.id,
      checkpointX: this.checkpoint.x,
      rescues: this.rescues,
      collectibles: this.collectibles,
    };
  }
}
