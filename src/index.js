import { Background3D } from "./Background3D";
import { StepDivController } from "./StepDivController";
import { initCarousel } from "./carousel";
import { globalParameters } from "./globalParameters";
import {
  canScroll,
  keyDirection,
  stepIdFromHash,
  swipeDirection,
  wheelDirection,
} from "./utils";

window.DEBUG_3D = false;

// step contents taller than the screen
const SCROLLER_SELECTOR = ".step_content, .cv_scroll";
// ms without wheel events that end a gesture
const WHEEL_GESTURE_GAP = 300;

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

  /** @param {EventTarget} target */
  const scrollerOf = (target) => target.closest?.(SCROLLER_SELECTOR) || null;

  // a wheel gesture (with its inertia) that scrolled a scroller to its edge
  // does not also change step: that takes a new gesture
  let lastScrollingWheelTime = -Infinity;
  window.onwheel = (event) => {
    if (window.DEBUG_3D) return;
    const direction = wheelDirection(event);
    const scroller = scrollerOf(event.target);
    const now = performance.now();
    // the scroller under the pointer scrolls by itself
    if (
      canScroll(scroller, direction) ||
      (scroller && now - lastScrollingWheelTime < WHEEL_GESTURE_GAP)
    ) {
      lastScrollingWheelTime = now;
      return;
    }
    moveInDirection(direction);
  };

  window.onkeydown = (event) => {
    // media players and fields use the arrow keys themselves
    if (event.target.closest?.("audio, video, input, textarea, select")) return;
    const direction = keyDirection(event);
    const scroller = document
      .getElementById(stepDivController.currentStep().divId)
      .querySelector(SCROLLER_SELECTOR);
    if (canScroll(scroller, direction)) {
      scroller.scrollBy({
        top: direction * scroller.clientHeight * 0.8,
        behavior: "smooth",
      });
      event.preventDefault();
      return;
    }
    moveInDirection(direction);
  };

  // scroll position when the touch began: the swipe has scrolled it by touchend
  let touchStart = null;
  let touchScroller = null;
  let touchScrollTop = 0;
  window.addEventListener(
    "touchstart",
    (event) => {
      touchStart = event.touches.length == 1 ? event.touches[0] : null;
      touchScroller = scrollerOf(event.target);
      touchScrollTop = touchScroller?.scrollTop || 0;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;
      const touchEnd = event.changedTouches[0];
      const direction = swipeDirection(
        touchEnd.clientX - touchStart.clientX,
        touchEnd.clientY - touchStart.clientY
      );
      touchStart = null;
      if (touchScroller) {
        const scrolledTop = touchScroller.scrollTop;
        touchScroller.scrollTop = touchScrollTop;
        const couldScroll = canScroll(touchScroller, direction);
        touchScroller.scrollTop = scrolledTop;
        if (couldScroll) return;
      }
      moveInDirection(direction);
    },
    { passive: true }
  );

  // menu
  const menuStepIds = ["home", "projects", "about", "cv"];
  menuStepIds.forEach((id) => {
    document.getElementById("move_to_" + id).onclick = () => moveToStepId(id);
  });

  // the language link opens the other page on the current step (/en/#cv)
  const languageLink = document.getElementById("language_link");
  const languagePath = languageLink.getAttribute("href").split("#")[0];

  const onStepDisplayed = () => {
    for (let customButton of document.getElementsByClassName("custom_button")) {
      customButton.classList.remove("custom_button_selected");
    }
    const id = stepDivController.currentStepId;
    if (menuStepIds.includes(id)) {
      document
        .getElementById("move_to_" + id)
        .classList.add("custom_button_selected");
    }
    languageLink.setAttribute(
      "href",
      id == "home" ? languagePath : languagePath + "#" + id
    );
  };
  onStepDisplayed();
  stepDivController.addOnMoveEndRequester(onStepDisplayed);

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
  // set before the 3D background and the step divs read it
  const hashStepId = stepIdFromHash(
    window.location.hash,
    globalParameters.steps
  );
  if (hashStepId) globalParameters.initialStepId = hashStepId;

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
