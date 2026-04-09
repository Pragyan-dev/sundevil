import campusMapJson from "@/data/campus-map.json";
import type {
  CampusBuilding,
  CampusInteriorScene,
  CampusMapData,
  CampusPropDefinition,
  CampusVector3,
  CampusWorldBuilding,
  CampusWorldDefinition,
} from "@/lib/types";

const baseMap = campusMapJson as CampusMapData;
const MAP_SCALE = 0.055;

const buildingLookup = Object.fromEntries(
  baseMap.buildings.map((building) => [building.id, building]),
) as Record<string, CampusBuilding>;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function mapToWorld(x: number, y: number, lift = 0): CampusVector3 {
  return [
    round((x - baseMap.mapWidth / 2) * MAP_SCALE),
    lift,
    round((y - baseMap.mapHeight / 2) * MAP_SCALE),
  ];
}

function getBuilding(id: string) {
  const building = buildingLookup[id];

  if (!building) {
    throw new Error(`Unknown campus building "${id}"`);
  }

  return building;
}

function buildingCenter(id: string, lift = 0): CampusVector3 {
  const building = getBuilding(id);
  return mapToWorld(building.x + building.width / 2, building.y + building.height / 2, lift);
}

function entrancePosition(id: string, lift = 0.2): CampusVector3 {
  const building = getBuilding(id);
  return mapToWorld(building.entranceX, building.entranceY, lift);
}

function buildingFootprint(id: string, height: number): CampusVector3 {
  const building = getBuilding(id);
  return [
    round(building.width * MAP_SCALE * 0.82),
    height,
    round(building.height * MAP_SCALE * 0.82),
  ];
}

function portalFromEntrance(id: string): CampusWorldBuilding["portal"] {
  return {
    position: entrancePosition(id, 0.2),
    size: [2.2, 2.4, 1.8],
    promptOffset: [0, 2.2, 0],
  };
}

function makeExteriorProps(
  id: string,
  props: Omit<CampusPropDefinition, "id">[],
): CampusPropDefinition[] {
  return props.map((prop, index) => ({
    ...prop,
    id: `${id}-prop-${index + 1}`,
  }));
}

function makeInteriorProps(
  interiorId: string,
  props: Omit<CampusPropDefinition, "id">[],
): CampusPropDefinition[] {
  return props.map((prop, index) => ({
    ...prop,
    id: `${interiorId}-prop-${index + 1}`,
  }));
}

const buildings: Record<string, CampusWorldBuilding> = {
  tooker: {
    id: "tooker",
    position: buildingCenter("tooker", 0),
    rotationY: 0.08,
    scale: buildingFootprint("tooker", 5.6),
    height: 5.6,
    roofColor: "#d0b89a",
    wallColor: "#f7efe5",
    accentColor: "#ffc627",
    labelOffset: [0, 6.8, 0],
    beaconOffset: [0, 7.6, 0],
    collider: {
      position: buildingCenter("tooker", 2.8),
      size: buildingFootprint("tooker", 5.4),
    },
    portal: portalFromEntrance("tooker"),
    interiorSceneId: "tooker-dorm",
    npcPosition: [buildingCenter("tooker", 0)[0] + 2.6, 0.25, buildingCenter("tooker", 0)[2] + 4.1],
    npcRotationY: -1.2,
    props: makeExteriorProps("tooker", [
      { kind: "bench", position: [buildingCenter("tooker", 0)[0] - 5.2, 0, buildingCenter("tooker", 0)[2] + 3.2], rotationY: 0.4, scale: 1.05 },
      { kind: "palm", position: [buildingCenter("tooker", 0)[0] + 6.1, 0, buildingCenter("tooker", 0)[2] - 4.8], scale: 1.08 },
    ]),
  },
  byeng: {
    id: "byeng",
    position: buildingCenter("byeng", 0),
    rotationY: -0.05,
    scale: buildingFootprint("byeng", 6.3),
    height: 6.3,
    roofColor: "#dcc4a6",
    wallColor: "#f9f4ec",
    accentColor: "#8c1d40",
    labelOffset: [0, 7.4, 0],
    beaconOffset: [0, 8, 0],
    collider: {
      position: buildingCenter("byeng", 3.15),
      size: buildingFootprint("byeng", 6),
    },
    portal: portalFromEntrance("byeng"),
    interiorSceneId: "byeng-lecture",
    npcPosition: [buildingCenter("byeng", 0)[0], 0.25, buildingCenter("byeng", 0)[2] + 5.6],
    npcRotationY: Math.PI,
    props: makeExteriorProps("byeng", [
      { kind: "bench", position: [buildingCenter("byeng", 0)[0] + 7.4, 0, buildingCenter("byeng", 0)[2] + 6.8], rotationY: -0.2 },
      { kind: "palm", position: [buildingCenter("byeng", 0)[0] - 8.1, 0, buildingCenter("byeng", 0)[2] - 6.4], scale: 1.16 },
    ]),
  },
  hayden: {
    id: "hayden",
    position: buildingCenter("hayden", 0),
    rotationY: 0.06,
    scale: buildingFootprint("hayden", 6.4),
    height: 6.4,
    roofColor: "#e0c3a0",
    wallColor: "#faf4ea",
    accentColor: "#ffc627",
    labelOffset: [0, 7.8, 0],
    beaconOffset: [0, 8.4, 0],
    collider: {
      position: buildingCenter("hayden", 3.2),
      size: buildingFootprint("hayden", 6.1),
    },
    portal: portalFromEntrance("hayden"),
    interiorSceneId: "hayden-hub",
    npcPosition: [buildingCenter("hayden", 0)[0], 0.25, buildingCenter("hayden", 0)[2] + 5.8],
    npcRotationY: Math.PI,
    props: makeExteriorProps("hayden", [
      { kind: "palm", position: [buildingCenter("hayden", 0)[0] + 7.8, 0, buildingCenter("hayden", 0)[2] - 7.2], scale: 1.22 },
      { kind: "bench", position: [buildingCenter("hayden", 0)[0] - 6.6, 0, buildingCenter("hayden", 0)[2] + 7.1], rotationY: 0.38 },
    ]),
  },
  wexler: {
    id: "wexler",
    position: buildingCenter("wexler", 0),
    rotationY: 0.12,
    scale: buildingFootprint("wexler", 5.5),
    height: 5.5,
    roofColor: "#d4b18c",
    wallColor: "#f9f0e3",
    accentColor: "#ffc627",
    labelOffset: [0, 6.8, 0],
    beaconOffset: [0, 7.6, 0],
    collider: {
      position: buildingCenter("wexler", 2.75),
      size: buildingFootprint("wexler", 5.2),
    },
    portal: portalFromEntrance("wexler"),
    interiorSceneId: "wexler-hub",
    npcPosition: [buildingCenter("wexler", 0)[0], 0.25, buildingCenter("wexler", 0)[2] + 4.7],
    npcRotationY: Math.PI,
  },
  centerpoint: {
    id: "centerpoint",
    position: buildingCenter("centerpoint", 0),
    rotationY: -0.08,
    scale: buildingFootprint("centerpoint", 6),
    height: 6,
    roofColor: "#d8ba9d",
    wallColor: "#f6eee3",
    accentColor: "#8c1d40",
    labelOffset: [0, 7.4, 0],
    beaconOffset: [0, 8.2, 0],
    collider: {
      position: buildingCenter("centerpoint", 3),
      size: buildingFootprint("centerpoint", 5.7),
    },
    portal: portalFromEntrance("centerpoint"),
    interiorSceneId: "centerpoint-hub",
    npcPosition: [buildingCenter("centerpoint", 0)[0], 0.25, buildingCenter("centerpoint", 0)[2] + 5.2],
    npcRotationY: Math.PI,
    props: makeExteriorProps("centerpoint", [
      { kind: "bench", position: [buildingCenter("centerpoint", 0)[0] + 7.8, 0, buildingCenter("centerpoint", 0)[2] + 6.4], rotationY: -0.45 },
      { kind: "palm", position: [buildingCenter("centerpoint", 0)[0] - 9.1, 0, buildingCenter("centerpoint", 0)[2] - 5.8], scale: 1.08 },
    ]),
  },
  counseling: {
    id: "counseling",
    position: buildingCenter("counseling", 0),
    rotationY: 0.02,
    scale: buildingFootprint("counseling", 5.9),
    height: 5.9,
    roofColor: "#d8c0b2",
    wallColor: "#f4efe9",
    accentColor: "#7ab78a",
    labelOffset: [0, 7.2, 0],
    beaconOffset: [0, 8, 0],
    collider: {
      position: buildingCenter("counseling", 2.95),
      size: buildingFootprint("counseling", 5.6),
    },
    portal: portalFromEntrance("counseling"),
    interiorSceneId: "counseling-hub",
    npcPosition: [buildingCenter("counseling", 0)[0], 0.25, buildingCenter("counseling", 0)[2] + 5.2],
    npcRotationY: Math.PI,
    props: makeExteriorProps("counseling", [
      { kind: "plant", position: [buildingCenter("counseling", 0)[0] - 7.2, 0, buildingCenter("counseling", 0)[2] + 6.4], scale: 1.2 },
      { kind: "bench", position: [buildingCenter("counseling", 0)[0] + 6.8, 0, buildingCenter("counseling", 0)[2] + 6.2], rotationY: 0.22 },
    ]),
  },
  carey: {
    id: "carey",
    position: buildingCenter("carey", 0),
    rotationY: 0.1,
    scale: buildingFootprint("carey", 5.6),
    height: 5.6,
    roofColor: "#d2b290",
    wallColor: "#faf3e8",
    accentColor: "#ffc627",
    labelOffset: [0, 6.9, 0],
    beaconOffset: [0, 7.6, 0],
    collider: {
      position: buildingCenter("carey", 2.8),
      size: buildingFootprint("carey", 5.3),
    },
    portal: portalFromEntrance("carey"),
    interiorSceneId: "carey-hub",
    npcPosition: [buildingCenter("carey", 0)[0], 0.25, buildingCenter("carey", 0)[2] + 4.9],
    npcRotationY: Math.PI,
  },
  ecg: {
    id: "ecg",
    position: buildingCenter("ecg", 0),
    rotationY: -0.09,
    scale: buildingFootprint("ecg", 6.2),
    height: 6.2,
    roofColor: "#d6bc9a",
    wallColor: "#f8f1e6",
    accentColor: "#ffc627",
    labelOffset: [0, 7.6, 0],
    beaconOffset: [0, 8.1, 0],
    collider: {
      position: buildingCenter("ecg", 3.1),
      size: buildingFootprint("ecg", 5.9),
    },
    portal: portalFromEntrance("ecg"),
    interiorSceneId: "ecg-hub",
    npcPosition: [buildingCenter("ecg", 0)[0], 0.25, buildingCenter("ecg", 0)[2] + 5.3],
    npcRotationY: Math.PI,
    props: makeExteriorProps("ecg", [
      { kind: "bench", position: [buildingCenter("ecg", 0)[0] + 7.8, 0, buildingCenter("ecg", 0)[2] + 6.6], rotationY: -0.35 },
    ]),
  },
  computerlab: {
    id: "computerlab",
    position: buildingCenter("computerlab", 0),
    rotationY: 0.04,
    scale: buildingFootprint("computerlab", 5.8),
    height: 5.8,
    roofColor: "#d1b89a",
    wallColor: "#f7f1e7",
    accentColor: "#8c1d40",
    labelOffset: [0, 7.1, 0],
    beaconOffset: [0, 8.1, 0],
    collider: {
      position: buildingCenter("computerlab", 2.9),
      size: buildingFootprint("computerlab", 5.5),
    },
    portal: portalFromEntrance("computerlab"),
    interiorSceneId: "computerlab-hub",
    props: makeExteriorProps("computerlab", [
      { kind: "bench", position: [buildingCenter("computerlab", 0)[0] - 7.4, 0, buildingCenter("computerlab", 0)[2] + 6.7], rotationY: 0.42 },
      { kind: "palm", position: [buildingCenter("computerlab", 0)[0] + 8.6, 0, buildingCenter("computerlab", 0)[2] - 5.9], scale: 1.14 },
    ]),
  },
};

function room(
  scene: Omit<CampusInteriorScene, "props"> & { props?: Omit<CampusPropDefinition, "id">[] },
): CampusInteriorScene {
  return {
    ...scene,
    props: makeInteriorProps(scene.id, scene.props ?? []),
  };
}

const interiors: Record<string, CampusInteriorScene> = {
  "tooker-dorm": room({
    id: "tooker-dorm",
    buildingId: "tooker",
    type: "dialog",
    title: "Tooker dorm room",
    summary: "Jordan makes campus feel smaller when the room is familiar first.",
    roomSize: [18, 8.5, 14],
    accentColor: "#ffc627",
    floorColor: "#f4eadc",
    wallColor: "#fffaf1",
    spawn: { position: [0, 0.95, 4.2], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6], size: [3.4, 2.6, 2.2], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [3.5, 0.8, -0.4], size: [2.8, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [3.6, 0.1, -1.4],
    npcRotationY: -1.4,
    props: [
      { kind: "desk", position: [-4.8, 0, -3.4], rotationY: 0.18 },
      { kind: "plant", position: [5.8, 0, -4.4], scale: 1.1 },
      { kind: "sign", position: [-1.6, 0.6, -5.2], tint: "#8c1d40", scale: [2.4, 0.3, 0.2] },
    ],
  }),
  "byeng-lecture": room({
    id: "byeng-lecture",
    buildingId: "byeng",
    type: "dialog",
    title: "BYENG 210",
    summary: "A first-week lecture room where course language gets translated into something human.",
    roomSize: [28, 10, 22],
    accentColor: "#8c1d40",
    floorColor: "#efe2d2",
    wallColor: "#fff8ef",
    spawn: { position: [0, 0.95, 7.6], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 9.6], size: [4, 2.8, 2.4], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -4.8], size: [4, 3, 3], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -6.2],
    npcRotationY: 0,
    props: [
      { kind: "whiteboard", position: [0, 2.5, -10], scale: [7.2, 2.4, 0.35] },
      { kind: "table", position: [0, 0, -7.5], scale: [2.8, 1, 1.1], tint: "#8c1d40" },
      { kind: "bench", position: [-5, 0, -1.5], rotationY: 1.57, scale: 1.16 },
      { kind: "bench", position: [5, 0, -1.5], rotationY: 1.57, scale: 1.16 },
    ],
  }),
  "hayden-hub": room({
    id: "hayden-hub",
    buildingId: "hayden",
    type: "walkthrough",
    title: "Hayden tutoring front desk",
    summary: "You see the check-in desk, the tables, and where the first question actually gets asked.",
    roomSize: [22, 9, 16],
    accentColor: "#ffc627",
    floorColor: "#efe5d7",
    wallColor: "#fff8ef",
    spawn: { position: [0, 0.95, 5.2], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 7], size: [3.6, 2.8, 2.4], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.6], size: [3.2, 3, 3], promptOffset: [0, 2.3, 0] },
    npcPosition: [0, 0.1, -2.6],
    npcRotationY: 0,
    props: [
      { kind: "desk", position: [0, 0, -4.6], scale: [3.6, 1, 1.4], tint: "#8c1d40" },
      { kind: "whiteboard", position: [5.6, 2.4, -4.7], scale: [3.4, 1.8, 0.28] },
      { kind: "table", position: [-5.6, 0, -0.8], scale: [2.5, 1, 1.4] },
      { kind: "table", position: [-5.6, 0, 2.4], scale: [2.5, 1, 1.4] },
    ],
  }),
  "wexler-hub": room({
    id: "wexler-hub",
    buildingId: "wexler",
    type: "walkthrough",
    title: "Wexler math tutoring",
    summary: "Whiteboards, table clusters, and a tutor who expects half-finished homework, not perfection.",
    roomSize: [20, 8.5, 15],
    accentColor: "#ffc627",
    floorColor: "#f3e6d7",
    wallColor: "#fff9f1",
    spawn: { position: [0, 0.95, 4.8], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6.6], size: [3.6, 2.8, 2.3], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.2], size: [3.2, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -2.2],
    npcRotationY: 0,
    props: [
      { kind: "whiteboard", position: [5.4, 2.2, -3.8], scale: [3.2, 1.8, 0.28] },
      { kind: "table", position: [-4.8, 0, -0.6], scale: [2.4, 1, 1.4] },
      { kind: "table", position: [-4.8, 0, 2.5], scale: [2.4, 1, 1.4] },
    ],
  }),
  "centerpoint-hub": room({
    id: "centerpoint-hub",
    buildingId: "centerpoint",
    type: "walkthrough",
    title: "Centerpoint advising lobby",
    summary: "A check-in desk, a waiting pocket, and the exact first sentence to use if you are unsure why you are there.",
    roomSize: [22, 8.5, 16],
    accentColor: "#8c1d40",
    floorColor: "#efe3d6",
    wallColor: "#fffbf3",
    spawn: { position: [0, 0.95, 5.1], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6.9], size: [3.6, 2.8, 2.4], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.5], size: [3.2, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -2.6],
    npcRotationY: 0,
    props: [
      { kind: "desk", position: [0, 0, -4.7], scale: [3.8, 1, 1.4], tint: "#8c1d40" },
      { kind: "sofa", position: [-5.6, 0, 0.4], scale: [2.6, 1, 1.2], tint: "#d7c0aa" },
      { kind: "plant", position: [5.8, 0, -1.5], scale: 1.18 },
    ],
  }),
  "counseling-hub": room({
    id: "counseling-hub",
    buildingId: "counseling",
    type: "walkthrough",
    title: "Counseling lobby",
    summary: "A quieter room that makes it clear this is a support space, not a punishment room.",
    roomSize: [20, 8.5, 15],
    accentColor: "#7ab78a",
    floorColor: "#f1e5db",
    wallColor: "#fffaf3",
    spawn: { position: [0, 0.95, 4.8], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6.4], size: [3.4, 2.8, 2.2], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.3], size: [3.2, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -2.2],
    npcRotationY: 0,
    props: [
      { kind: "sofa", position: [-4.8, 0, 0.8], scale: [2.6, 1, 1.3], tint: "#d8ceb9" },
      { kind: "plant", position: [5.4, 0, -2.2], scale: 1.25 },
      { kind: "table", position: [4.1, 0, 1.6], scale: [1.6, 1, 1.2], tint: "#7ab78a" },
    ],
  }),
  "carey-hub": room({
    id: "carey-hub",
    buildingId: "carey",
    type: "walkthrough",
    title: "Carey tutoring room",
    summary: "A business tutoring room with table groups and casual one-problem-at-a-time help.",
    roomSize: [20, 8.5, 15],
    accentColor: "#ffc627",
    floorColor: "#f3e6d7",
    wallColor: "#fffaf2",
    spawn: { position: [0, 0.95, 4.8], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6.6], size: [3.4, 2.8, 2.2], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.2], size: [3.2, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -2.2],
    npcRotationY: 0,
    props: [
      { kind: "table", position: [-4.5, 0, -0.2], scale: [2.2, 1, 1.3] },
      { kind: "table", position: [4.2, 0, 1.8], scale: [2.2, 1, 1.3] },
      { kind: "whiteboard", position: [5.4, 2.1, -4.2], scale: [3, 1.8, 0.25] },
    ],
  }),
  "ecg-hub": room({
    id: "ecg-hub",
    buildingId: "ecg",
    type: "walkthrough",
    title: "Engineering tutoring floor",
    summary: "A CS and engineering help room where code, pseudocode, and error screenshots all count as a valid starting point.",
    roomSize: [22, 8.8, 16],
    accentColor: "#ffc627",
    floorColor: "#f0e3d4",
    wallColor: "#fff8ef",
    spawn: { position: [0, 0.95, 5.1], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 7], size: [3.5, 2.8, 2.3], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.6], size: [3.2, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    npcPosition: [0, 0.1, -2.5],
    npcRotationY: 0,
    props: [
      { kind: "terminal", position: [5.8, 0, -2.8], scale: 1.1 },
      { kind: "table", position: [-4.8, 0, -0.8], scale: [2.3, 1, 1.3] },
      { kind: "whiteboard", position: [5.6, 2.2, -5], scale: [3.4, 1.8, 0.28] },
    ],
  }),
  "computerlab-hub": room({
    id: "computerlab-hub",
    buildingId: "computerlab",
    type: "minigame",
    title: "Computer lab",
    summary: "A row of monitors and one terminal that lets you practice reading DARS before it matters.",
    roomSize: [20, 8.8, 14],
    accentColor: "#8c1d40",
    floorColor: "#ede0d1",
    wallColor: "#fffbf4",
    spawn: { position: [0, 0.95, 4.4], rotationY: Math.PI },
    exitPortal: { position: [0, 0.8, 6], size: [3.4, 2.8, 2.2], promptOffset: [0, 1.8, 0] },
    interactionPoint: { position: [0, 0.8, -1.4], size: [2.8, 2.8, 2.8], promptOffset: [0, 2.2, 0] },
    props: [
      { kind: "terminal", position: [0, 0, -3.2], scale: 1.25, tint: "#8c1d40" },
      { kind: "terminal", position: [-4.4, 0, -1.6], scale: 1.05 },
      { kind: "terminal", position: [4.4, 0, -1.6], scale: 1.05 },
      { kind: "desk", position: [0, 0, -4.5], scale: [4.2, 1, 1.4] },
    ],
  }),
};

export const campusWorld: CampusWorldDefinition = {
  mapScale: MAP_SCALE,
  outdoorSpawn: {
    position: mapToWorld(baseMap.spawnX, baseMap.spawnY, 0.95),
    rotationY: Math.PI,
  },
  groundSize: [
    round(baseMap.mapWidth * MAP_SCALE * 1.08),
    round(baseMap.mapHeight * MAP_SCALE * 1.08),
  ],
  buildings,
  interiors,
};
