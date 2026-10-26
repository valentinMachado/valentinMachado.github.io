import { Vector3, AmbientLight, SpotLight, Object3D } from "three";
import { carouselModels } from "./carouselModels";
import { createSpaceDecor } from "./spaceDecor";

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

/**
 * @type {Platform}
 */
const cvPlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos(2 * Math.PI),
    -offsetYPlatform,
    radiusOffsetXZPlatform * Math.sin(2 * Math.PI)
  ),
};

// carousel items, in the order of their 3D models around the platform
projectsPlatform.itemIds = [
  "popup_builder",
  "smaio_i_plan",
  "open_source_contributions",
  "ud_imuv",
  "galeri3",
  "radiosity",
  "nodalab",
];
aboutPlatform.itemIds = [
  "guitar",
  "daw",
  "steampong",
  "souk",
  "covidjam",
  "meteoblocks",
  "subtitle_game",
  "guess_it",
];

/** angle of an item model around its platform */
const itemAngle = (platform, index) =>
  (2 * Math.PI * index) / platform.itemIds.length;

/**
 * Spread the item models evenly around the platform
 *
 * @param {Platform} platform
 */
const initItemModels = (platform) => {
  platform.itemModels = new Map();
  platform.itemIds.forEach((id, index) => {
    const model = carouselModels[id]();
    const angle = itemAngle(platform, index);
    model.position.set(
      0.8 * platform.size * Math.cos(angle),
      0,
      0.8 * platform.size * Math.sin(angle)
    );
    platform.itemModels.set(id, model);
    platform.object3D.add(model);
  });
};

/**
 * Let a carousel step rotate its platform to bring the selected item model to
 * the front
 *
 * @param {Step} step
 * @param {Platform} platform
 * @param {number} offset platform rotation bringing the first item model to the front
 * @param {string} firstId item selected at startup
 */
const initCarousel3D = (step, platform, offset, firstId) => {
  step.selectProject3D = (id) => {
    const index = platform.itemIds.indexOf(id);
    if (index < 0) return;

    platform.spotLight.target = platform.itemModels.get(id);
    step.rotationYDest = (itemAngle(platform, index) + offset) % (2 * Math.PI);

    // rotate the shortest way
    const ry = platform.object3D.rotation.y;
    const diff1 = Math.abs(ry + 2 * Math.PI - step.rotationYDest);
    const diff2 = Math.abs(ry - 2 * Math.PI - step.rotationYDest);
    const diff3 = Math.abs(ry - step.rotationYDest);
    if (diff1 < diff2 && diff1 < diff3) {
      platform.object3D.rotation.y += 2 * Math.PI;
    } else if (diff2 < diff1 && diff2 < diff3) {
      platform.object3D.rotation.y -= 2 * Math.PI;
    }
  };

  step.selectProject3D(firstId);
  platform.object3D.rotation.y = step.rotationYDest;
};

/**
 * @param {Step} step
 * @param {Platform} platform
 */
const tickCarousel3D = (step, platform) => {
  const dt = step.background3D.dt;

  // the models spin slowly to show all their sides
  platform.itemModels.forEach((model) => (model.rotation.y += 0.0005 * dt));

  const speed = 0.001;
  // step.rotationYDest 0 => 2pi
  const amount = speed * dt;
  const rotation = platform.object3D.rotation;
  if (Math.abs(rotation.y - step.rotationYDest) > amount) {
    rotation.y += rotation.y < step.rotationYDest ? amount : -amount;
  }
  platform.spotLight.target.updateMatrixWorld();
};

/** @type {ReturnType<typeof createSpaceDecor>} */
let spaceDecor = null;

/**
 *
 * @param {import("./Background3D").Background3D} background3D
 */
export const globalInit = (background3D) => {
  const ambientLight = new AmbientLight("white", 0.05);
  background3D.scene.add(ambientLight);

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
    spotLight.power = 10;
    spotLight.decay = 0.35;
    spotLight.angle = 0.2;
    spotLight.penumbra = 0.27;
    spotLight.shadow.mapSize.set(1024, 1024);
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.focus = 1;
    platform.spotLight = spotLight;
    background3D.scene.add(spotLight);
  };

  initPlatformScene(homePlatform);
  initPlatformScene(projectsPlatform);
  initItemModels(projectsPlatform);
  initPlatformScene(aboutPlatform);
  initItemModels(aboutPlatform);
  initPlatformScene(cvPlatform);

  spaceDecor = createSpaceDecor(
    [...globalParameters.steps.values()].map((step) => step.cameraPosition)
  );
  background3D.scene.add(spaceDecor.object3D);
};

/**
 * Called each frame, whatever the step
 *
 * @param {import("./Background3D").Background3D} background3D
 */
export const globalTick = (background3D) => spaceDecor.tick(background3D.dt);

// platform rotation bringing the first projects model to the front
const projectsOffset = Math.PI / 2 + Math.PI / 8;

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
  "nodalab",
  "steampong",
  "souk",
  "covidjam",
  "daw",
  "guitar",
  "meteoblocks",
  "subtitle_game",
  "guess_it",
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

          // radiosity is the first item of the carousel, selected at startup
          initCarousel3D(step, projectsPlatform, projectsOffset, "radiosity");
        },
        tick: (step) => {
          step.moveCameraCallback();
          tickCarousel3D(step, projectsPlatform);
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
        nextStepId: "cv",
        init: (step) => {
          // same view of the selected model as the projects platform, which
          // sits 2pi/3 further around the scene
          initCarousel3D(
            step,
            aboutPlatform,
            projectsOffset - (2 * Math.PI) / 3,
            "guitar"
          );
        },
        tick: (step) => tickCarousel3D(step, aboutPlatform),
        divId: "about",
        cameraPosition: new Vector3(
          aboutPlatform.size * 2.3 * Math.cos((4 * Math.PI) / 3),
          aboutPlatform.position.y + 4,
          aboutPlatform.size * 2.3 * Math.sin((4 * Math.PI) / 3)
        ),
        cameraTarget: aboutPlatform.position.clone(),
      }),
    ],
    [
      "cv",
      new Step({
        previousStepId: "about",
        divId: "cv",
        cameraPosition: new Vector3(
          cvPlatform.size * 2.3 * Math.cos(2 * Math.PI),
          cvPlatform.position.y + 4,
          cvPlatform.size * 2.3 * Math.sin(2 * Math.PI)
        ),
        cameraTarget: cvPlatform.position.clone(),
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
  initialStepId: "home",
  stepMoveDuration: 1000,
};
