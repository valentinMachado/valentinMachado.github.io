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
   * @param {number} maxMovingDistCamera
   * @param {number} movingSpeedCamera
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

    this.maxMovingDistCamera = params.maxMovingDistCamera;
    this.movingSpeedCamera = params.movingSpeedCamera;
    this.divId = params.divId;
    this.cameraPosition = params.cameraPosition;
    this.cameraTarget = params.cameraTarget;
  }
}

const raycaster = new Raycaster();

const setAction = (object, toActionId, duration) => {
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
};

export const config = {
  steps: [
    new Step({
      init: function (_this) {
        // parquet
        const floor = new Mesh(
          new PlaneGeometry(8, 8),
          _this.background3D.materials.get("parquet").clone()
        );
        floor.name = "floor_home";
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        _this.background3D.scene.add(floor);

        // piano
        const piano = _this.background3D.createFromFBX("piano");
        piano.position.set(1.04, -0.01, 0.08);
        piano.rotation.set(-3.14, 0, -3.14);

        // piano player
        const pianoPlayer = _this.background3D.createFromFBX("pink_guy", [
          "piano_playing",
        ]);

        // guy laying
        const guyLaying = _this.background3D.createFromFBX("blue_guy", [
          "laying_pose",
        ]);
        guyLaying.position.set(2, 0, -0.38);
        guyLaying.rotation.set(0, -0.97, 0);

        // lighting
        const spotLight = new SpotLight();
        spotLight.position.set(-6.04, 7, -6);
        spotLight.lookAt(_this.background3D.currentStep.cameraTarget);
        spotLight.castShadow = true;
        spotLight.power = 5;
        spotLight.decay = 0.35;
        spotLight.angle = 0.2;
        spotLight.penumbra = 0.27;
        spotLight.shadow.mapSize.set(4096, 4096);
        spotLight.shadow.camera.far = 20;
        spotLight.shadow.camera.focus = 1;
        _this.spotLight = spotLight;
      },
      onFocus: function (_this) {
        console.log("home focus");
        _this.background3D.scene.add(_this.spotLight);
        _this.spotLight.intensity = 0;
      },
      onLeave: function (_this) {
        console.log("home leave");
        _this.background3D.scene.remove(_this.spotLight);
      },
      tick: function (_this) {
        _this.spotLight.intensity = Math.min(
          1,
          _this.spotLight.intensity + 0.0005 * _this.background3D.dt
        );
      },
      maxMovingDistCamera: 0.5,
      movingSpeedCamera: 0.0001,
      divId: "home",
      cameraPosition: new Vector3(
        3.7354148383591115,
        0.9804391930761558,
        -2.353622511697072
      ),
      cameraTarget: new Vector3(
        0.36694807032506643,
        0.45683091777905876,
        1.519738438552838
      ),
    }),
    new Step({
      init: function (_this) {
        // parquet
        const floor = new Mesh(
          new PlaneGeometry(20, 20),
          _this.background3D.materials.get("parquet").clone()
        );
        floor.name = "floor_projects";
        floor.position.set(50, 0, 0);
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        _this.background3D.scene.add(floor);

        _this.cursorMesh = new Mesh(
          new TorusGeometry(0.25, 0.05),
          new MeshBasicMaterial()
        );
        _this.cursorMesh.scale.set(1, 1, 0.01);
        _this.cursorMesh.rotation.x = -Math.PI * 0.5;
        _this.cursorMesh.position.set(50, 0, 0);

        _this.happyWalker = _this.background3D.createFromFBX("blue_guy", [
          "happy_walk",
          "happy_idle",
        ]);
        setAction(_this.happyWalker, "happy_idle");
        _this.happyWalker.position.set(50, 0, 0);

        _this.happyWalkerDestination = null;
        _this.onClick = () => {
          if (!_this.cursorMesh.visible) return;
          _this.happyWalkerDestination = new Vector3().copy(
            _this.cursorMesh.position
          );
        };

        _this.onMouseMove = (event) => {
          raycaster.setFromCamera(
            _this.background3D.computeMouseCoord(event),
            _this.background3D.camera
          );
          const intersects = raycaster.intersectObject(floor);
          if (intersects.length) {
            _this.cursorMesh.position.copy(intersects[0].point);
            _this.cursorMesh.visible = true;
          } else {
            _this.cursorMesh.visible = false;
          }
        };
      },
      onFocus: function (_this) {
        _this.background3D.scene.add(_this.cursorMesh);
        window.addEventListener("mousemove", _this.onMouseMove);
        window.addEventListener("mouseup", _this.onClick);
      },
      onLeave: function (_this) {
        _this.background3D.scene.remove(_this.cursorMesh);
        window.removeEventListener("mousemove", _this.onMouseMove);
        window.removeEventListener("mouseup", _this.onClick);
        setAction(_this.happyWalker, "happy_idle", 700);
      },
      tick: function (_this) {
        if (!_this.happyWalkerDestination) {
          setAction(_this.happyWalker, "happy_idle", 700);
          return;
        }

        const dir = _this.happyWalkerDestination
          .clone()
          .sub(_this.happyWalker.position);

        if (dir.lengthSq() < 0.1) {
          setAction(_this.happyWalker, "happy_idle", 700);
          _this.happyWalkerDestination = null;
        } else {
          setAction(_this.happyWalker, "happy_walk", 500);

          _this.happyWalker.rotation.y = Math.atan2(dir.x, dir.z);

          dir.normalize();
          const runnerSpeed = 0.001;
          _this.happyWalker.position.x +=
            dir.x * runnerSpeed * _this.background3D.dt;
          _this.happyWalker.position.y +=
            dir.y * runnerSpeed * _this.background3D.dt;
          _this.happyWalker.position.z +=
            dir.z * runnerSpeed * _this.background3D.dt;
        }
      },
      maxMovingDistCamera: 5,
      movingSpeedCamera: 0.0004,
      divId: "projects",
      cameraPosition: new Vector3(
        71.34198651645929,
        15.39871668428058,
        11.708677691740093
      ),
      cameraTarget: new Vector3(
        37.098902988223216,
        -10.14009132383449,
        17.2727541581751
      ),
    }),
    new Step({
      init: function (_this) {},
      onFocus: function (_this) {},
      onLeave: function (_this) {},
      tick: function (_this) {},
      maxMovingDistCamera: 1,
      movingSpeedCamera: 0.0002,
      divId: "about",
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
  initial_index: 1,
  duration_step_move: 1000,
  fbx: {
    models: {
      blue_guy: { scale: 0.01, path: "./assets/fbx/blue_guy_model.fbx" },
      pink_guy: { scale: 0.01, path: "./assets/fbx/pink_guy_model.fbx" },
      piano: { scale: 0.01, path: "./assets/fbx/piano_model.fbx" },
    },
    animations: {
      start_plank: { scale: 1, path: "./assets/fbx/start_plank_anim.fbx" },
      happy_walk: { scale: 1, path: "./assets/fbx/happy_walk_anim.fbx" },
      running: { scale: 1, path: "./assets/fbx/running_anim.fbx" },
      happy_idle: { scale: 1, path: "./assets/fbx/happy_idle_anim.fbx" },
      laying_pose: { scale: 1, path: "./assets/fbx/laying_pose_anim.fbx" },
      sitting_laughing: {
        scale: 1,
        path: "./assets/fbx/sitting_laughing_anim.fbx",
      },
      breakdance_1990: {
        scale: 1,
        path: "./assets/fbx/breakdance_1990_anim.fbx",
      },
      rumba_dancing: { scale: 1, path: "./assets/fbx/rumba_dancing_anim.fbx" },
      piano_playing: { scale: 1, path: "./assets/fbx/piano_playing_anim.fbx" },
    },
  },
  materials: {
    parquet: {
      scale: 2,
      color: "./assets/img/material/parquet/parquet_color.jpg",
      ao: "./assets/img/material/parquet/parquet_ao.jpg",
      normal: "./assets/img/material/parquet/parquet_normal.jpg",
      roughness: "./assets/img/material/parquet/parquet_roughness.jpg",
    },
  },
  project_carousel_items: {
    popup_builder: {
      path_image: "./assets/img/carousel/popup_builder.png",
      innerHTML: "Popup builder was a web tool to easily build a 3D model of a popup house<br><div>Details</div>",
    },
    smaio_i_plan: {
      path_image: "./assets/img/carousel/smaio_i_plan.png",
      innerHTML: "rien",
    },
    open_source_contributions: {
      path_image: "./assets/img/carousel/open_source_contributions.png",
      innerHTML: "rien",
    },
    ud_imuv: {
      path_image: "./assets/img/carousel/ud_imuv.png",
      innerHTML: "rien",
    },
    galeri3: {
      path_image: "./assets/img/carousel/galeri3.png",
      innerHTML: "rien",
    },
  },
};
