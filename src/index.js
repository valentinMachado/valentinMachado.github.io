import { Background3D } from "./Background3D";
import { StepDivController } from "./StepDivController";
import { initCarousel } from "./carousel";
import {
  isMobileUserAgent,
  keyDirection,
  swipeDirection,
  wheelDirection,
} from "./utils";

window.DEBUG_3D = false;

const warnMobileUsers = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (isMobileUserAgent(userAgent))
    alert("Pour une meilleure expérience, accédez au site sur un ordinateur");
};

/**
 * The 3D background is optional: the portfolio content must stay reachable
 * without WebGL.
 *
 * @return {Promise<Background3D | null>}
 */
const createBackground3D = async () => {
  try {
    const background3D = new Background3D(
      document.getElementById("three_canvas")
    );
    await background3D.load();
    return background3D;
  } catch (error) {
    console.error("3D background disabled:", error);
    return null;
  }
};

const hideLoadingScreen = () => {
  document
    .getElementById("loading_screen_top")
    .classList.add("loading_screen_top_end");
  document
    .getElementById("loading_screen_bottom")
    .classList.add("loading_screen_bottom_end");
  const loader = document.getElementById("loading_screen_loader");
  loader.classList.add("opacity_fade_out");
  loader.ontransitionend = () => loader.classList.add("hidden");
};

/**
 * @param {Background3D | null} background3D
 */
const fitBackground3DToWindow = (background3D) => {
  if (!background3D) return;
  const resize = () => {
    background3D.camera.aspect = window.innerWidth / window.innerHeight;
    background3D.camera.updateProjectionMatrix();
    background3D.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  resize();
  window.onresize = resize;
};

/**
 * Wheel, keyboard, touch and menu navigation between steps.
 *
 * @param {Background3D | null} background3D
 * @param {StepDivController} stepDivController
 * @return {(stepId: string) => void} moves to a step
 */
const initNavigation = (background3D, stepDivController) => {
  /**
   * Runs the same move on the 3D background and on the step divs.
   * Both must stay in sync: nothing moves while one of them is moving.
   *
   * @param {(controller: Background3D | StepDivController) => void} move
   */
  const navigate = (move) => {
    if (background3D?.isMoving || stepDivController.isMoving) return;
    if (background3D) move(background3D);
    move(stepDivController);
  };

  const moveToStepId = (id) => navigate((c) => c.moveToStep(id));

  /** @param {number} direction 1 = next, -1 = previous, 0 = none */
  const moveInDirection = (direction) => {
    if (direction > 0) navigate((c) => c.moveNext());
    else if (direction < 0) navigate((c) => c.movePrevious());
  };

  window.onwheel = (event) => {
    if (window.DEBUG_3D) return;
    moveInDirection(wheelDirection(event));
  };

  window.onkeydown = (event) => {
    // media players and fields use the arrow keys themselves
    if (event.target.closest?.("audio, video, input, textarea, select")) return;
    moveInDirection(keyDirection(event));
  };

  let touchStart = null;
  window.addEventListener(
    "touchstart",
    (event) => {
      touchStart = event.touches.length == 1 ? event.touches[0] : null;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;
      const touchEnd = event.changedTouches[0];
      moveInDirection(
        swipeDirection(
          touchEnd.clientX - touchStart.clientX,
          touchEnd.clientY - touchStart.clientY
        )
      );
      touchStart = null;
    },
    { passive: true }
  );

  // menu
  const menuStepIds = ["home", "projects", "about"];
  menuStepIds.forEach((id) => {
    document.getElementById("move_to_" + id).onclick = () => moveToStepId(id);
  });

  stepDivController.addOnMoveEndRequester(() => {
    for (let customButton of document.getElementsByClassName("custom_button")) {
      customButton.classList.remove("custom_button_selected");
    }
    const id = stepDivController.currentStepId;
    if (menuStepIds.includes(id)) {
      document
        .getElementById("move_to_" + id)
        .classList.add("custom_button_selected");
    }
  });

  return moveToStepId;
};

// external links open in a new tab (mailto: stays in place)
const openExternalLinksInNewTab = () => {
  document.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener";
  });
};

// lets the mouse reach the 3D inspector through the step divs
const enableDebugMode = () => {
  const style = document.createElement("style");
  style.innerHTML = ".debug { pointer-events: none; }";
  document.head.appendChild(style);
  document.getElementById("on_screen").classList.add("debug");
  document.getElementById("off_screen").classList.add("debug");
};

const main = async () => {
  warnMobileUsers();

  const background3D = await createBackground3D();
  hideLoadingScreen();
  fitBackground3DToWindow(background3D);

  const stepDivController = new StepDivController(
    document.getElementById("on_screen"),
    document.getElementById("off_screen")
  );
  const moveToStepId = initNavigation(background3D, stepDivController);

  initCarousel("projects", moveToStepId);
  initCarousel("about", moveToStepId);

  openExternalLinksInNewTab();

  if (window.DEBUG_3D) enableDebugMode();
};

window.onload = main;
