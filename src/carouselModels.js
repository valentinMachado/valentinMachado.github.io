import {
  Mesh,
  Group,
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
  CapsuleGeometry,
  MeshStandardMaterial,
} from "three";

// simple low-poly models standing for the carousel items, about one unit wide

/**
 * @param {Group} group
 * @param {import("three").BufferGeometry} geometry
 * @param {string} color
 * @param {number[]} [position]
 * @returns {Mesh}
 */
const addMesh = (group, geometry, color, position = [0, 0, 0]) => {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: color }));
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
};

/** house in kit: walls and a pyramid roof */
const house = () => {
  const group = new Group();
  addMesh(group, new BoxGeometry(1, 0.7, 1), "red", [0, -0.15, 0]);
  addMesh(
    group,
    new ConeGeometry(0.85, 0.6, 4),
    "darkred",
    [0, 0.5, 0]
  ).rotation.y = Math.PI / 4;
  return group;
};

/** spine: a slightly curved stack of vertebrae */
const spine = () => {
  const group = new Group();
  for (let i = 0; i < 6; i++) {
    const y = -0.65 + i * 0.26;
    addMesh(group, new CylinderGeometry(0.22, 0.22, 0.16, 16), "ivory", [
      0.12 * Math.sin(i * 0.9),
      y,
      0,
    ]);
  }
  return group;
};

/** globe with its equator and a meridian */
const globe = () => {
  const group = new Group();
  addMesh(group, new SphereGeometry(0.5, 24, 16), "royalblue");
  addMesh(group, new TorusGeometry(0.6, 0.03, 8, 32), "lightblue").rotation.x =
    Math.PI / 2;
  addMesh(group, new TorusGeometry(0.6, 0.03, 8, 32), "lightblue");
  return group;
};

/** city block: buildings of various heights on a base */
const city = () => {
  const group = new Group();
  addMesh(group, new BoxGeometry(1.2, 0.08, 1.2), "gray", [0, -0.5, 0]);
  [
    [-0.35, -0.35, 0.5],
    [0.3, -0.3, 1],
    [-0.3, 0.3, 0.75],
    [0.35, 0.35, 0.35],
  ].forEach(([x, z, height]) =>
    addMesh(group, new BoxGeometry(0.4, height, 0.4), "gold", [
      x,
      -0.46 + height / 2,
      z,
    ])
  );
  return group;
};

/** map pin */
const pin = () => {
  const group = new Group();
  addMesh(group, new SphereGeometry(0.35, 24, 16), "orange", [0, 0.3, 0]);
  addMesh(
    group,
    new ConeGeometry(0.3, 0.7, 24),
    "orange",
    [0, -0.2, 0]
  ).rotation.x = Math.PI;
  addMesh(group, new SphereGeometry(0.13, 16, 12), "white", [0, 0.3, 0.27]);
  return group;
};

/** Cornell box, the classic global illumination test scene */
const cornellBox = () => {
  const group = new Group();
  const wall = (color, position, size) =>
    addMesh(group, new BoxGeometry(...size), color, position);
  wall("white", [0, -0.5, 0], [1, 0.05, 1]);
  wall("white", [0, 0.5, 0], [1, 0.05, 1]);
  wall("white", [0, 0, -0.5], [1, 1, 0.05]);
  wall("red", [-0.5, 0, 0], [0.05, 1, 1]);
  wall("green", [0.5, 0, 0], [0.05, 1, 1]);
  addMesh(group, new SphereGeometry(0.18, 24, 16), "white", [0.2, -0.3, 0.1]);
  addMesh(
    group,
    new BoxGeometry(0.3, 0.5, 0.3),
    "white",
    [-0.18, -0.23, -0.15]
  ).rotation.y = 0.4;
  return group;
};

/** guitar: two body bouts, a neck and a head */
const guitar = () => {
  const group = new Group();
  const bout = (radius, y) =>
    (addMesh(group, new CylinderGeometry(radius, radius, 0.15, 24), "peru", [
      0,
      y,
      0,
    ]).rotation.x = Math.PI / 2);
  bout(0.38, -0.45);
  bout(0.3, -0.05);
  addMesh(
    group,
    new CylinderGeometry(0.1, 0.1, 0.16, 16),
    "black",
    [0, -0.25, 0.01]
  ).rotation.x = Math.PI / 2;
  addMesh(group, new BoxGeometry(0.1, 0.8, 0.06), "saddlebrown", [0, 0.6, 0]);
  addMesh(group, new BoxGeometry(0.16, 0.2, 0.06), "saddlebrown", [0, 1.1, 0]);
  return group;
};

/** eighth note */
const musicNote = () => {
  const group = new Group();
  const head = addMesh(
    group,
    new SphereGeometry(0.22, 24, 16),
    "purple",
    [-0.15, -0.5, 0]
  );
  head.scale.set(1.3, 0.9, 0.7);
  head.rotation.z = 0.4;
  addMesh(
    group,
    new CylinderGeometry(0.04, 0.04, 1.1, 8),
    "purple",
    [0.11, 0.05, 0]
  );
  addMesh(
    group,
    new BoxGeometry(0.3, 0.1, 0.06),
    "purple",
    [0.24, 0.5, 0]
  ).rotation.z = -0.6;
  return group;
};

/** pong: two paddles and a ball */
const pong = () => {
  const group = new Group();
  addMesh(group, new BoxGeometry(0.1, 0.6, 0.2), "white", [-0.6, 0.15, 0]);
  addMesh(group, new BoxGeometry(0.1, 0.6, 0.2), "white", [0.6, -0.15, 0]);
  addMesh(group, new SphereGeometry(0.1, 16, 12), "darkorange", [0.1, 0.1, 0]);
  return group;
};

/** brilliant cut diamond: a crown above a pointed pavilion */
const diamond = () => {
  const group = new Group();
  const facets = (mesh) => {
    mesh.material.flatShading = true;
    mesh.material.metalness = 0.3;
    mesh.material.roughness = 0.1;
    return mesh;
  };
  // table and crown
  facets(
    addMesh(
      group,
      new CylinderGeometry(0.32, 0.55, 0.25, 8),
      "lightcyan",
      [0, 0.3, 0]
    )
  );
  // pavilion
  facets(
    addMesh(
      group,
      new ConeGeometry(0.55, 0.75, 8),
      "paleturquoise",
      [0, -0.2, 0]
    )
  ).rotation.x = Math.PI;
  return group;
};

/** crowd of demonstrators, one of them holding a sign */
const crowd = () => {
  const group = new Group();
  [
    [-0.4, 0.1],
    [0, -0.2],
    [0.4, 0.1],
    [-0.2, 0.4],
    [0.2, 0.4],
  ].forEach(([x, z]) => {
    addMesh(group, new CapsuleGeometry(0.1, 0.3, 4, 12), "steelblue", [
      x,
      -0.35,
      z,
    ]);
    addMesh(group, new SphereGeometry(0.1, 16, 12), "bisque", [x, -0.05, z]);
  });
  addMesh(
    group,
    new CylinderGeometry(0.02, 0.02, 0.6, 8),
    "sienna",
    [0.15, 0.1, -0.2]
  );
  addMesh(group, new BoxGeometry(0.5, 0.3, 0.03), "white", [0.15, 0.45, -0.2]);
  return group;
};

/** T tetromino under a cloud */
const tetromino = () => {
  const group = new Group();
  [
    [-0.3, -0.3],
    [0, -0.3],
    [0.3, -0.3],
    [0, 0],
  ].forEach(([x, y]) =>
    addMesh(group, new BoxGeometry(0.28, 0.28, 0.28), "mediumseagreen", [
      x,
      y,
      0,
    ])
  );
  [
    [-0.2, 0.55, 0.15],
    [0.05, 0.62, 0.2],
    [0.28, 0.55, 0.14],
  ].forEach(([x, y, radius]) =>
    addMesh(group, new SphereGeometry(radius, 16, 12), "lightgray", [x, y, 0])
  );
  return group;
};

/** model factory of each carousel item */
export const carouselModels = {
  popup_builder: house,
  smaio_i_plan: spine,
  open_source_contributions: globe,
  ud_imuv: city,
  galeri3: pin,
  radiosity: cornellBox,
  guitar: guitar,
  daw: musicNote,
  steampong: pong,
  souk: diamond,
  covidjam: crowd,
  meteoblocks: tetromino,
};
