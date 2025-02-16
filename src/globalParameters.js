import {
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  Vector3,
  Raycaster,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Color,
  SpotLight,
  TorusGeometry,
  CircleGeometry,
  Object3D,
  Quaternion,
  Euler,
  BoxGeometry,
} from "three";
import { Background3D } from "./Background3D";

/**
 * @callback StepCallback
 * @param {Step}
 */

export class Step {
  /**
   *
   * @param {Object} params
   * @param {StepCallback} params.onFocus
   * @param {StepCallback} params.onLeave
   * @param {StepCallback} params.tick
   * @param {StepCallback} params.init
   * @param {string} divId
   * @param {Vector3} cameraPosition
   * @param {Vector3} cameraTarget
   */
  constructor(params) {
    /**
     * @type {Background3D}
     */
    this.background3D = null;

    this.onFocus = params.onFocus.bind(this, this);
    this.onLeave = params.onLeave.bind(this, this);
    this.tick = params.tick.bind(this, this);
    this.init = (background3D) => {
      this.background3D = background3D;
      params.init(this);
    };

    this.divId = params.divId;
    this.cameraPosition = params.cameraPosition;
    this.cameraTarget = params.cameraTarget;

    this.nextStepId = params.nextStepId;
    this.previousStepId = params.previousStepId;
  }
}

const raycaster = new Raycaster();

const loopAction = (object, toActionId, duration, onLoopOnce) => {
  if (object.userData.currentActionId == toActionId) return;

  let a1, a2, idCurrent;
  for (const [id, action] of object.userData.actions) {
    if (id == object.userData.currentActionId) {
      a1 = action;
    } else if (id == toActionId) {
      a2 = action;
      idCurrent = id;
    }
  }
  object.userData.currentActionId = idCurrent;

  a2.enabled = true;
  a2.setEffectiveTimeScale(1);
  a2.setEffectiveWeight(1);
  a2.time = 0;
  a2.play();
  if (a1) {
    a1.play();
    a1.crossFadeTo(a2, duration / 1000, true);
  }

  if (onLoopOnce) {
    const c = () => {
      a2._mixer.removeEventListener("loop", c);
      onLoopOnce();
    };
    a2._mixer.addEventListener("loop", c);
  }
};

/**
 *
 * @param {Background3D} background3D
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

const positionBuffer = new Vector3();
const quaternionBuffer = new Quaternion();
const scaleBuffer = new Vector3();

const setWorldPosition = (object3D, position) => {
  object3D.parent.matrixWorld.decompose(
    positionBuffer,
    quaternionBuffer,
    scaleBuffer
  );

  quaternionBuffer.invert();
  object3D.position.copy(position);
  // in parent referential
  object3D.position.sub(positionBuffer).applyQuaternion(quaternionBuffer);
};

/**
 *
 * @param {Object3D} object3D
 * @param {Euler} euler
 */
const setWorldEuler = (object3D, euler) => {
  object3D.parent.matrixWorld.decompose(
    positionBuffer,
    quaternionBuffer,
    scaleBuffer
  );

  quaternionBuffer.invert();
  const quaternionWorld = new Quaternion().setFromEuler(euler);
  object3D.quaternion.multiplyQuaternions(quaternionBuffer, quaternionWorld);
};

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
 * @type {Mesh}
 */
let popupBuilderMesh,
  smaioIPlanMesh,
  openSourceContributionsMesh,
  udImuvMesh,
  galeri3Mesh,
  radiosityMesh;

/**
 *
 * @param {Background3D} background3D
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

    // ground
    // const ground = new Mesh(
    //   new CircleGeometry(platform.size),
    //   background3D.materials.get("parquet").clone()
    // );
    // ground.name = "ground";
    // ground.receiveShadow = true;
    // ground.rotation.x = -Math.PI / 2;
    // platform.object3D.add(ground);

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

  // projects meshes
  popupBuilderMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("red")
  );
  popupBuilderMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos(0),
    0,
    0.8 * projectsPlatform.size * Math.sin(0)
  );
  smaioIPlanMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("green")
  );
  smaioIPlanMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((2 * Math.PI) / 6),
    0,
    0.8 * projectsPlatform.size * Math.sin((2 * Math.PI) / 6)
  );
  openSourceContributionsMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("blue")
  );
  openSourceContributionsMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((4 * Math.PI) / 6),
    0,
    0.8 * projectsPlatform.size * Math.sin((4 * Math.PI) / 6)
  );
  udImuvMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("yellow")
  );
  udImuvMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((6 * Math.PI) / 6),
    0,
    0.8 * projectsPlatform.size * Math.sin((6 * Math.PI) / 6)
  );
  galeri3Mesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("orange")
  );
  galeri3Mesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((8 * Math.PI) / 6),
    0,
    0.8 * projectsPlatform.size * Math.sin((8 * Math.PI) / 6)
  );
  radiosityMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("brown")
  );
  radiosityMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((10 * Math.PI) / 6),
    0,
    0.8 * projectsPlatform.size * Math.sin((10 * Math.PI) / 6)
  );
  projectsPlatform.object3D.add(
    popupBuilderMesh,
    smaioIPlanMesh,
    openSourceContributionsMesh,
    udImuvMesh,
    galeri3Mesh,
    radiosityMesh
  );

  initPlatformScene(aboutPlatform);
};

export const globalParameters = {
  steps: new Map([
    [
      "home",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
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
        init: function (_this) {
          _this.moveCameraCallback = createMoveCameraCallback(
            _this.background3D,
            0.00005,
            1
          );

          // by default target radiosity
          const offset = Math.PI / 2 + Math.PI / 8;
          _this.rotationYDest = offset;
          projectsPlatform.object3D.rotation.y = _this.rotationYDest;
          radiosityMesh.getWorldPosition(
            projectsPlatform.spotLight.target.position
          );
          projectsPlatform.spotLight.target.updateMatrixWorld();

          _this.selectProject3D = (id) => {
            switch (id) {
              case "popup_builder":
                _this.rotationYDest = 0;
                projectsPlatform.spotLight.target = popupBuilderMesh;
                break;
              case "smaio_i_plan":
                _this.rotationYDest = (2 * Math.PI) / 6;
                projectsPlatform.spotLight.target = smaioIPlanMesh;
                break;
              case "open_source_contributions":
                _this.rotationYDest = (4 * Math.PI) / 6;
                projectsPlatform.spotLight.target = openSourceContributionsMesh;
                break;
              case "ud_imuv":
                _this.rotationYDest = (6 * Math.PI) / 6;
                projectsPlatform.spotLight.target = udImuvMesh;
                break;
              case "galeri3":
                _this.rotationYDest = (8 * Math.PI) / 6;
                projectsPlatform.spotLight.target = galeri3Mesh;
                break;
              case "radiosity":
                _this.rotationYDest = (10 * Math.PI) / 6;
                projectsPlatform.spotLight.target = radiosityMesh;
                break;
              default:
                break;
            }
            _this.rotationYDest += offset;
            _this.rotationYDest %= 2 * Math.PI;

            const ry = projectsPlatform.object3D.rotation.y;
            const diff1 = Math.abs(ry + 2 * Math.PI - _this.rotationYDest);
            const diff2 = Math.abs(ry - 2 * Math.PI - _this.rotationYDest);
            const diff3 = Math.abs(ry - _this.rotationYDest);
            if (diff1 < diff2 && diff1 < diff3) {
              projectsPlatform.object3D.rotation.y += 2 * Math.PI;
            } else if (diff2 < diff1 && diff2 < diff3) {
              projectsPlatform.object3D.rotation.y -= 2 * Math.PI;
            }
          };
        },
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {
          _this.moveCameraCallback();

          const speed = 0.001;
          // _this.rotationYDest 0 => 2pi
          const amount = speed * _this.background3D.dt;
          if (
            Math.abs(
              projectsPlatform.object3D.rotation.y - _this.rotationYDest
            ) > amount
          ) {
            if (
              projectsPlatform.object3D.rotation.y - _this.rotationYDest <
              0
            ) {
              projectsPlatform.object3D.rotation.y += amount;
            } else {
              projectsPlatform.object3D.rotation.y -= amount;
            }
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
        init: function (_this) {
          _this.selectProject3D = (id) => {
            console.log("select " + id);
          };
        },
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
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
      "popup_builder",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "popup_builder_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "smaio_i_plan",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "smaio_i_plan_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "ud_imuv",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "ud_imuv_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "open_source_contributions",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "open_source_contributions_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "galeri3",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "galeri3_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "radiosity",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "radiosity_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "steampong",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "steampong_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "souk",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "souk_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "covidjam",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "covidjam_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "daw",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "daw_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "guitar",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "guitar_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "portfolio",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "portfolio_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
  ]),
  initial_id: "home",
  duration_step_move: 1000,
  fbx: {
    models: {
      blue_guy: { scale: 0.01, path: "./assets/fbx/blue_guy_model.fbx" },
    },
    animations: {},
  },
  materials: {},
};
