import { Background3D } from "./Background3D";
import { StepDivController } from "./StepDivController";
import { config } from "./config";
import "./style.css";

window.DEBUG_3D = false;

window.onload = async () => {
  // background3D
  const background3D = new Background3D(
    document.getElementById("three_canvas")
  );

  await background3D.load((amountLoaded) => {
    document.getElementById("loading_screen_loader_label").innerText =
      Math.round(amountLoaded * 100) + "%";
  });

  document
    .getElementById("loading_screen_top")
    .classList.add("loading_screen_top_end");
  document
    .getElementById("loading_screen_bottom")
    .classList.add("loading_screen_bottom_end");
  document
    .getElementById("loading_screen_loader")
    .classList.add("opacity_fade_out");
  document.getElementById("loading_screen_loader").ontransitionend = () => {
    document.getElementById("loading_screen_loader").classList.add("hidden");
  };

  const resize = () => {
    background3D.camera.aspect = window.innerWidth / window.innerHeight;
    background3D.camera.updateProjectionMatrix();
    background3D.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  resize();
  window.onresize = resize;

  if (window.DEBUG_3D) {
    document.getElementById("on_screen").classList.add("hidden");
    return;
  }

  // step div controller
  const stepDivController = new StepDivController(
    document.getElementById("on_screen"),
    document.getElementById("off_screen")
  );

  window.onwheel = (event) => {
    if (background3D.isMoving || stepDivController.isMoving) return; // to keep sync
    if (event.deltaY > 0) {
      background3D.moveNext();
      stepDivController.moveNext();
    } else {
      background3D.movePrevious();
      stepDivController.movePrevious();
    }
  };

  const moveToDivId = (id) => {
    if (background3D.isMoving || stepDivController.isMoving) return; // to keep sync

    let indexHome = -1;
    config.steps.filter((el, index) => {
      if (el.div_id == id) {
        indexHome = index;
      }
    });
    background3D.moveToIndex(indexHome);
    stepDivController.moveToIndex(indexHome);
  };

  document.getElementById("move_to_home").onclick = () => {
    moveToDivId("home");
  };

  document.getElementById("move_to_projects").onclick = () => {
    moveToDivId("projects");
  };

  document.getElementById("move_to_about").onclick = () => {
    moveToDivId("about");
  };

  stepDivController.addOnMoveEndRequester(() => {
    for (let customButton of document.getElementsByClassName("custom_button")) {
      customButton.classList.remove("custom_button_selected");
    }
    switch (stepDivController.currentStepDivId()) {
      case "home":
        document
          .getElementById("move_to_home")
          .classList.add("custom_button_selected");
        break;
      case "projects":
        document
          .getElementById("move_to_projects")
          .classList.add("custom_button_selected");
        break;
      case "about":
        document
          .getElementById("move_to_about")
          .classList.add("custom_button_selected");
        break;
      default:
    }
  });
};
