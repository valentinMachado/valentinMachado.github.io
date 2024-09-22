import { MeshBasicMaterial, Mesh, SphereGeometry, Vector3 } from "three";
import { Background3D } from "./Background3D";

class StepScene {
  constructor(init, onFocus, onLeave, tick) {
    this.dynamicObject3Ds = new Map();

    this.onFocus = onFocus.bind(this);
    this.onLeave = onLeave.bind(this);
    this.tick = tick.bind(this);

    init.call(this);
  }
}

export const config = {
  steps: [
    {
      div_id: "home",
      camera_position: new Vector3(10, 10, 10),
      camera_target: new Vector3(),
      stepScene: new StepScene(
        function () {
          const sphereCursor = new Mesh(
            new SphereGeometry(0.5),
            new MeshBasicMaterial()
          );

          this.dynamicObject3Ds.set("cursor", sphereCursor);
        },
        /**
         *
         * @param {Background3D} background3D
         */
        function (background3D) {
          console.log("home focus");
          // background3D.scene.add(this.dynamicObject3Ds.get("cursor"));
        },
        /**
         *
         * @param {Background3D} background3D
         */
        function (background3D) {
          console.log("home leave");
          // background3D.scene.remove(this.dynamicObject3Ds.get("cursor"));
        },
        function () {}
      ),
    },
    {
      div_id: "projects",
      camera_position: new Vector3(10, 10, 10),
      camera_target: new Vector3(),
      stepScene: new StepScene(
        function () {},
        function () {
          console.log("projects focus");
        },
        function () {
          console.log("projects leave");
        },
        function () {}
      ),
    },
    {
      div_id: "about",
      camera_position: new Vector3(10, 10, 10),
      camera_target: new Vector3(),
      stepScene: new StepScene(
        function () {},
        function () {
          console.log("about focus");
        },
        function () {
          console.log("about leave");
        },
        function () {}
      ),
    },
  ],
  duration_step_move: 1000,
  fbx: {
    models: {
      blue_guy: { scale: 0.01, path: "./assets/fbx/blue_guy_model.fbx" },
      pink_guy: { scale: 0.01, path: "./assets/fbx/pink_guy_model.fbx" },
    },
    animations: {
      start_plank: { scale: 1, path: "./assets/fbx/start_plank_anim.fbx" },
      sitting_laughing: {
        scale: 1,
        path: "./assets/fbx/sitting_laughing_anim.fbx",
      },
      breakdance_1990: {
        scale: 1,
        path: "./assets/fbx/breakdance_1990_anim.fbx",
      },
      rumba_dancing: { scale: 1, path: "./assets/fbx/rumba_dancing_anim.fbx" },
    },
  },
  materials: {
    parquet: {
      scale: 10,
      color: "./assets/img/material/parquet/parquet_color.jpg",
      ao: "./assets/img/material/parquet/parquet_ao.jpg",
      displacement: "./assets/img/material/parquet/parquet_displacement.jpg",
      normal: "./assets/img/material/parquet/parquet_normal.jpg",
      roughness: "./assets/img/material/parquet/parquet_roughness.jpg",
    },
  },
};
