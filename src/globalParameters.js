import {
  Mesh,
  Vector3,
  AmbientLight,
  SpotLight,
  Object3D,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";

/**
 * @callback StepCallback
 * @param {Step} step
 */

const noop = () => {};

export class Step {
  /**
   *
   * @param {Object} params
   * @param {StepCallback} [params.init] called once the 3D scene is ready
   * @param {StepCallback} [params.onFocus]
   * @param {StepCallback} [params.onLeave]
   * @param {StepCallback} [params.tick] called each frame while the step is displayed
   * @param {string} params.divId
   * @param {Vector3} params.cameraPosition
   * @param {Vector3} params.cameraTarget
   * @param {string} [params.nextStepId]
   * @param {string} [params.previousStepId]
   */
  constructor({
    init = noop,
    onFocus = noop,
    onLeave = noop,
    tick = noop,
    ...params
  }) {
    /**
     * @type {import("./Background3D").Background3D}
     */
    this.background3D = null;

    this.onFocus = () => onFocus(this);
    this.onLeave = () => onLeave(this);
    this.tick = () => tick(this);
    this.init = (background3D) => {
      this.background3D = background3D;
      init(this);
    };

    this.divId = params.divId;
    this.cameraPosition = params.cameraPosition;
    this.cameraTarget = params.cameraTarget;

    this.nextStepId = params.nextStepId;
    this.previousStepId = params.previousStepId;
  }
}

/**
 *
 * @param {import("./Background3D").Background3D} background3D
 */
const createMoveCameraCallback = (background3D, speed, maxDist) => {
  // camera move
  const currentCameraMoveDirection = new Vector3(
    Math.random(),
    Math.random(),
    Math.random()
  );
  const oldCameraPosition = new Vector3();
  const makeCameraDirectionValid = () => {
    // new direction vector have to be in half a space
    let normal;
    const ccp = background3D.currentStep.cameraPosition;
    const cp = background3D.camera.position;
    if (cp.distanceToSquared(ccp) > maxDist * maxDist) {
      normal = ccp.clone().sub(cp);
      currentCameraMoveDirection.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      // a bit naive but should works
      if (currentCameraMoveDirection.dot(normal) < 0) {
        currentCameraMoveDirection.x *= -1;
        if (currentCameraMoveDirection.dot(normal) < 0) {
          currentCameraMoveDirection.y *= -1;
          if (currentCameraMoveDirection.dot(normal) < 0) {
            currentCameraMoveDirection.z *= -1;
          }
        }
      }

      currentCameraMoveDirection.normalize();
      return true;
    }

    return false;
  };

  return () => {
    oldCameraPosition.copy(background3D.camera.position);

    // move the camera
    background3D.camera.position.x +=
      currentCameraMoveDirection.x * background3D.dt * speed;
    background3D.camera.position.y +=
      currentCameraMoveDirection.y * background3D.dt * speed;
    background3D.camera.position.z +=
      currentCameraMoveDirection.z * background3D.dt * speed;
    background3D.camera.lookAt(background3D.currentStep.cameraTarget);

    if (makeCameraDirectionValid()) {
      background3D.camera.position.copy(oldCameraPosition);
    }
  };
};

const offsetYPlatform = 50;
const radiusOffsetXZPlatform = 40;

/**
 * @typedef Platform
 * @property {string} name
 * @property {number} size
 * @property {Vector3} position
 * @property {Object3D} object3D
 * @property {SpotLight} spotLight
 */

/**
 * @type {Platform}
 */
const homePlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos(0),
    2 * offsetYPlatform,
    radiusOffsetXZPlatform * Math.sin(0)
  ),
};

/**
 * @type {Platform}
 */
const projectsPlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos((2 * Math.PI) / 3),
    offsetYPlatform,
    radiusOffsetXZPlatform * Math.sin((2 * Math.PI) / 3)
  ),
};

/**
 * @type {Platform}
 */
const aboutPlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos((4 * Math.PI) / 3),
    0,
    radiusOffsetXZPlatform * Math.sin((4 * Math.PI) / 3)
  ),
};

// projects carousel items, in the order of their 3D meshes around the platform
const projectMeshColors = new Map([
  ["popup_builder", "red"],
  ["smaio_i_plan", "green"],
  ["open_source_contributions", "blue"],
  ["ud_imuv", "yellow"],
  ["galeri3", "orange"],
  ["radiosity", "brown"],
]);

/**
 * @type {Map<string, Mesh>}
 */
const projectMeshes = new Map();

/** angle of a project mesh around the projects platform */
const projectAngle = (index) => (2 * Math.PI * index) / projectMeshColors.size;

/**
 *
 * @param {import("./Background3D").Background3D} background3D
 */
export const globalInit = (background3D) => {
  const ambienLight = new AmbientLight("white", 0.05);
  background3D.scene.add(ambienLight);

  /**
   *
   * @param {Platform} platform
   */
  const initPlatformScene = (platform) => {
    platform.object3D = new Object3D();
    platform.object3D.position.copy(platform.position);
    background3D.scene.add(platform.object3D);

    // lighting
    const spotLight = new SpotLight();
    spotLight.position
      .set(platform.size, platform.size, 0)
      .add(platform.position);
    spotLight.target.position.copy(platform.position);
    spotLight.castShadow = true;
    spotLight.power = 5;
    spotLight.decay = 0.35;
    spotLight.angle = 0.2;
    spotLight.penumbra = 0.27;
    spotLight.shadow.mapSize.set(4096, 4096);
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.focus = 1;
    platform.spotLight = spotLight;
    background3D.scene.add(spotLight);
  };

  initPlatformScene(homePlatform);
  initPlatformScene(projectsPlatform);

  // projects meshes, evenly spread around the platform
  [...projectMeshColors].forEach(([id, color], index) => {
    const mesh = new Mesh(
      new BoxGeometry(),
      new MeshStandardMaterial({ color: color })
    );
    const angle = projectAngle(index);
    mesh.position.set(
      0.8 * projectsPlatform.size * Math.cos(angle),
      0,
      0.8 * projectsPlatform.size * Math.sin(angle)
    );
    projectMeshes.set(id, mesh);
    projectsPlatform.object3D.add(mesh);
  });

  initPlatformScene(aboutPlatform);
};

// all detail pages share the same camera view
const detailCameraPosition = new Vector3(
  70.88385204449825,
  12.509098432068043,
  -6.149763100098089
);
const detailCameraTarget = new Vector3(
  35.62221594037345,
  -16.007222546768897,
  6.0484699638794295
);

// declaration order matters: it sets the direction of the transition between two steps
const detailStepIds = [
  "popup_builder",
  "smaio_i_plan",
  "ud_imuv",
  "open_source_contributions",
  "galeri3",
  "radiosity",
  "steampong",
  "souk",
  "covidjam",
  "daw",
  "guitar",
  "meteoblocks",
];

export const globalParameters = {
  steps: new Map([
    [
      "home",
      new Step({
        divId: "home",
        cameraPosition: new Vector3(
          homePlatform.size * 2.3,
          homePlatform.position.y + 4,
          0
        ),
        cameraTarget: homePlatform.position.clone(),
        nextStepId: "projects",
      }),
    ],
    [
      "projects",
      new Step({
        previousStepId: "home",
        nextStepId: "about",
        init: (step) => {
          step.moveCameraCallback = createMoveCameraCallback(
            step.background3D,
            0.00005,
            1
          );

          // by default target radiosity
          const offset = Math.PI / 2 + Math.PI / 8;
          step.rotationYDest = offset;
          projectsPlatform.object3D.rotation.y = step.rotationYDest;
          projectMeshes
            .get("radiosity")
            .getWorldPosition(projectsPlatform.spotLight.target.position);
          projectsPlatform.spotLight.target.updateMatrixWorld();

          step.selectProject3D = (id) => {
            const index = [...projectMeshColors.keys()].indexOf(id);
            if (index < 0) return;

            projectsPlatform.spotLight.target = projectMeshes.get(id);
            step.rotationYDest = (projectAngle(index) + offset) % (2 * Math.PI);

            // rotate the shortest way
            const ry = projectsPlatform.object3D.rotation.y;
            const diff1 = Math.abs(ry + 2 * Math.PI - step.rotationYDest);
            const diff2 = Math.abs(ry - 2 * Math.PI - step.rotationYDest);
            const diff3 = Math.abs(ry - step.rotationYDest);
            if (diff1 < diff2 && diff1 < diff3) {
              projectsPlatform.object3D.rotation.y += 2 * Math.PI;
            } else if (diff2 < diff1 && diff2 < diff3) {
              projectsPlatform.object3D.rotation.y -= 2 * Math.PI;
            }
          };
        },
        tick: (step) => {
          step.moveCameraCallback();

          const speed = 0.001;
          // step.rotationYDest 0 => 2pi
          const amount = speed * step.background3D.dt;
          const rotation = projectsPlatform.object3D.rotation;
          if (Math.abs(rotation.y - step.rotationYDest) > amount) {
            rotation.y += rotation.y < step.rotationYDest ? amount : -amount;
            projectsPlatform.spotLight.target.updateMatrixWorld();
          }
        },
        divId: "projects",
        cameraPosition: new Vector3(
          projectsPlatform.size * 2.3 * Math.cos((2 * Math.PI) / 3),
          projectsPlatform.position.y + 4,
          projectsPlatform.size * 2.3 * Math.sin((2 * Math.PI) / 3)
        ),
        cameraTarget: projectsPlatform.position.clone(),
      }),
    ],
    [
      "about",
      new Step({
        previousStepId: "projects",
        init: (step) => {
          // no 3D counterpart for this carousel
          step.selectProject3D = noop;
        },
        divId: "about",
        cameraPosition: new Vector3(
          aboutPlatform.size * 2.3 * Math.cos((4 * Math.PI) / 3),
          aboutPlatform.position.y + 4,
          aboutPlatform.size * 2.3 * Math.sin((4 * Math.PI) / 3)
        ),
        cameraTarget: aboutPlatform.position.clone(),
      }),
    ],
    ...detailStepIds.map((id) => [
      id,
      new Step({
        divId: id + "_step",
        cameraPosition: detailCameraPosition.clone(),
        cameraTarget: detailCameraTarget.clone(),
      }),
    ]),
  ]),
  initial_id: "home",
  duration_step_move: 1000,
};
