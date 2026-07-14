export type MissionSectionId =
  | "shelter"
  | "olive-street"
  | "workshop"
  | "blocked-square"
  | "rooftops"
  | "injured-technician"
  | "sentinel-boss"
  | "communications-tower"
  | "jammer-boss";

export interface ObjectiveDefinition {
  id: string;
  label: string;
  required: boolean;
  points: number;
}

export interface CheckpointDefinition {
  id: string;
  name: string;
  x: number;
  requires: string[];
}

export interface MissionSection {
  id: MissionSectionId;
  name: string;
  start: number;
  end: number;
  background: string;
  musicState: "calm" | "explore" | "danger" | "boss" | "hope";
  objectives: ObjectiveDefinition[];
  checkpoint?: CheckpointDefinition;
}

export interface InteractableDefinition {
  id: string;
  x: number;
  y: number;
  label: string;
  objectiveId: string;
  kind: "story" | "supply" | "repair" | "rescue" | "collectible" | "signal";
  requires?: string[];
  optional?: boolean;
}

export interface EnemySpawnDefinition {
  id: string;
  x: number;
  section: MissionSectionId;
  role: "rifleman" | "shield" | "grenadier" | "engineer" | "officer";
}

const background = (name: string) => `/assets/generated/backgrounds/${name}.png`;

export const mission01Sections: MissionSection[] = [
  section("shelter", "1 · El refugio", 0, 1500, "tuneles", "calm", [
    objective("talk-radio-operator", "Habla con el operador de radio", 150),
    objective("take-medkit", "Recoge el botiquín", 100),
    objective("switch-lamp", "Enciende la lámpara del refugio", 100),
  ], checkpoint("shelter-exit", "Salida del refugio", 1420, ["talk-radio-operator", "take-medkit", "switch-lamp"])),
  section("olive-street", "2 · La calle del olivo", 1500, 3100, "barrio-del-olivo", "explore", [
    objective("street-message", "Recupera un mensaje de radio", 200, false),
    objective("reach-workshop", "Alcanza el taller de comunicaciones", 250),
  ], checkpoint("olive-street", "Calle del olivo", 2980, ["reach-workshop"])),
  section("workshop", "3 · El taller", 3100, 4700, "hospital-interior", "calm", [
    objective("radio-parts", "Localiza las piezas de la radio", 250),
    objective("radio-battery", "Encuentra una batería", 250),
    objective("repair-transmitter", "Repara el transmisor portátil", 500),
    objective("open-workshop-door", "Abre la puerta con la herramienta magnética", 300),
  ], checkpoint("workshop", "Transmisor reparado", 4580, ["repair-transmitter", "open-workshop-door"])),
  section("blocked-square", "4 · La plaza bloqueada", 4700, 6500, "mercado", "danger", [
    objective("rescue-square-technician", "Rescata al técnico de la plaza", 600),
    objective("disable-turret", "Desactiva la torreta", 500),
    objective("rescue-civil-1", "Rescata al primer civil", 350, false),
    objective("rescue-civil-2", "Rescata al segundo civil", 350, false),
    objective("rescue-civil-3", "Rescata al tercer civil", 350, false),
  ], checkpoint("blocked-square", "Plaza liberada", 6360, ["rescue-square-technician", "disable-turret"])),
  section("rooftops", "5 · Las azoteas", 6500, 8300, "azoteas", "explore", [
    objective("repeater-1", "Alinea el repetidor oeste", 300),
    objective("repeater-2", "Alinea el repetidor central", 300),
    objective("repeater-3", "Alinea el repetidor este", 300),
    objective("family-photo", "Encuentra la fotografía familiar", 500, false),
  ], checkpoint("rooftops", "Antena secundaria", 8180, ["repeater-1", "repeater-2", "repeater-3"])),
  section("injured-technician", "6 · El técnico herido", 8300, 9300, "hospital-interior", "calm", [
    objective("technician-decision", "Auxilia al técnico herido", 700),
    objective("access-codes", "Recibe los códigos de acceso", 350),
  ]),
  section("sentinel-boss", "7 · Centinela DX-4", 9300, 10600, "azoteas", "boss", [
    objective("defeat-sentinel", "Neutraliza el Centinela DX-4", 1800),
    objective("sentinel-component", "Recupera el estabilizador del dron", 450),
  ], checkpoint("sentinel", "Centinela neutralizado", 10480, ["defeat-sentinel", "sentinel-component"])),
  section("communications-tower", "8 · Torre de comunicaciones", 10600, 12800, "torre-frontera", "danger", [
    objective("install-battery", "Instala la batería", 350),
    objective("connect-transmitter", "Conecta el transmisor", 350),
    objective("blocker-1", "Desactiva el bloqueador inferior", 300),
    objective("blocker-2", "Desactiva el bloqueador central", 300),
    objective("blocker-3", "Desactiva el bloqueador superior", 300),
  ], checkpoint("communications-tower", "Torre preparada", 12650, ["install-battery", "connect-transmitter", "blocker-1", "blocker-2", "blocker-3"])),
  section("jammer-boss", "9 · El Bloqueador", 12800, 15000, "torre-frontera", "boss", [
    objective("defeat-jammer", "Destruye el núcleo de El Bloqueador", 3000),
    objective("broadcast-signal", "Emite la señal de emergencia", 2000),
  ], checkpoint("jammer-gate", "Antes de El Bloqueador", 12920, ["install-battery", "connect-transmitter", "blocker-1", "blocker-2", "blocker-3"])),
];

function section(
  id: MissionSectionId,
  name: string,
  start: number,
  end: number,
  backgroundName: string,
  musicState: MissionSection["musicState"],
  objectives: ObjectiveDefinition[],
  checkpointDefinition?: CheckpointDefinition,
): MissionSection {
  return { id, name, start, end, background: background(backgroundName), musicState, objectives, checkpoint: checkpointDefinition };
}

function objective(id: string, label: string, points: number, required = true): ObjectiveDefinition {
  return { id, label, points, required };
}

function checkpoint(id: string, name: string, x: number, requires: string[]): CheckpointDefinition {
  return { id, name, x, requires };
}

export const mission01Interactables: InteractableDefinition[] = [
  interaction("radio-operator", 260, "OPERADOR — E", "talk-radio-operator", "story"),
  interaction("medkit", 560, "BOTIQUÍN — E", "take-medkit", "supply"),
  interaction("lamp", 930, "LÁMPARA — E", "switch-lamp", "repair"),
  interaction("street-message", 2050, "MENSAJE 1/3 — E", "street-message", "collectible", [], true),
  interaction("workshop-entry", 2940, "TALLER — E", "reach-workshop", "story"),
  interaction("radio-parts", 3380, "PIEZAS — E", "radio-parts", "supply"),
  interaction("battery", 3740, "BATERÍA — E", "radio-battery", "supply"),
  interaction("transmitter", 4120, "TRANSMISOR — E", "repair-transmitter", "repair", ["radio-parts", "radio-battery"]),
  interaction("workshop-door", 4480, "PUERTA MAGNÉTICA — E", "open-workshop-door", "repair", ["repair-transmitter"]),
  interaction("civil-1", 4920, "CIVIL — E", "rescue-civil-1", "rescue", [], true),
  interaction("square-technician", 5350, "TÉCNICO — E", "rescue-square-technician", "rescue"),
  interaction("civil-2", 5570, "CIVIL — E", "rescue-civil-2", "rescue", [], true),
  interaction("turret", 5890, "TORRETA — E", "disable-turret", "repair", ["rescue-square-technician"]),
  interaction("civil-3", 6150, "CIVIL — E", "rescue-civil-3", "rescue", [], true),
  interaction("repeater-1", 6800, "REPETIDOR OESTE — E", "repeater-1", "signal"),
  interaction("family-photo", 7040, "FOTOGRAFÍA — E", "family-photo", "collectible", [], true),
  interaction("repeater-2", 7420, "REPETIDOR CENTRAL — E", "repeater-2", "signal"),
  interaction("repeater-3", 7920, "REPETIDOR ESTE — E", "repeater-3", "signal"),
  interaction("injured-technician", 8640, "TÉCNICO: E ESCOLTAR · K ESTABILIZAR", "technician-decision", "rescue"),
  interaction("access-codes", 9000, "CÓDIGOS — E", "access-codes", "story", ["technician-decision"]),
  interaction("sentinel-component", 10280, "ESTABILIZADOR — E", "sentinel-component", "supply", ["defeat-sentinel"]),
  interaction("tower-battery", 10850, "INSTALAR BATERÍA — E", "install-battery", "repair", ["sentinel-component"]),
  interaction("tower-transmitter", 11200, "CONECTAR TRANSMISOR — E", "connect-transmitter", "repair", ["install-battery"]),
  interaction("blocker-1", 11600, "BLOQUEADOR 1 — E", "blocker-1", "signal", ["connect-transmitter"]),
  interaction("blocker-2", 11950, "BLOQUEADOR 2 — E", "blocker-2", "signal", ["blocker-1"]),
  interaction("blocker-3", 12300, "BLOQUEADOR 3 — E", "blocker-3", "signal", ["blocker-2"]),
  interaction("broadcast", 14350, "EMITIR SEÑAL — E", "broadcast-signal", "signal", ["defeat-jammer"]),
];

function interaction(
  id: string,
  x: number,
  label: string,
  objectiveId: string,
  kind: InteractableDefinition["kind"],
  requires: string[] = [],
  optional = false,
): InteractableDefinition {
  return { id, x, y: 602, label, objectiveId, kind, requires, optional };
}

export const mission01Enemies: EnemySpawnDefinition[] = [
  enemy("street-rifle-1", 2250, "olive-street", "rifleman"),
  enemy("street-rifle-2", 2700, "olive-street", "rifleman"),
  enemy("workshop-engineer", 3900, "workshop", "engineer"),
  enemy("square-rifle-1", 4950, "blocked-square", "rifleman"),
  enemy("square-shield", 5480, "blocked-square", "shield"),
  enemy("square-grenadier", 6050, "blocked-square", "grenadier"),
  enemy("roof-rifle-1", 6900, "rooftops", "rifleman"),
  enemy("roof-rifle-2", 7700, "rooftops", "rifleman"),
  enemy("tower-engineer", 11000, "communications-tower", "engineer"),
  enemy("tower-shield", 11750, "communications-tower", "shield"),
  enemy("tower-officer", 12400, "communications-tower", "officer"),
];

function enemy(id: string, x: number, section: MissionSectionId, role: EnemySpawnDefinition["role"]): EnemySpawnDefinition {
  return { id, x, section, role };
}

export const mission01WorldWidth = 15000;

export function objectiveDefinition(id: string): ObjectiveDefinition | undefined {
  return mission01Sections.flatMap((sectionDefinition) => sectionDefinition.objectives).find((entry) => entry.id === id);
}
