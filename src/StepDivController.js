import { globalParameters } from "./globalParameters";
import { playAnimation } from "./utils";

export class StepDivController {
  constructor(divOnScreen, divOffScreen) {
    this.currentStepId = globalParameters.initial_id;
    this._currentStepDiv().classList.remove("hidden");

    /**
     * @type {HTMLElement}
     */
    this.divOnScreen = divOnScreen;

    /**
     * @type {HTMLElement}
     */
    this.divOffScreen = divOffScreen;

    /**
     * @type {boolean}
     */
    this.isMoving = false;

    this._onMoveEndRequesters = [];
  }

  _initMove() {
    this.isMoving = true;

    let stepDivMovingOffScreen = null;
    for (let child of this.divOnScreen.children) {
      if (!child.classList.contains("hidden")) {
        stepDivMovingOffScreen = child;
        break;
      }
    }

    if (!stepDivMovingOffScreen) throw new Error("no visible step to move");

    this._currentStepDiv().classList.remove("hidden");

    stepDivMovingOffScreen.remove();
    this.divOffScreen.appendChild(stepDivMovingOffScreen);
    this.divOffScreen.classList.remove("hidden");
  }

  _currentStepDiv() {
    return document.getElementById(this.currentStep().divId);
  }

  currentStep() {
    return globalParameters.steps.get(this.currentStepId);
  }

  _endMove() {
    this.isMoving = false;

    this.divOffScreen.classList.add("hidden");
    const stepDivMovingOffScreen = this.divOffScreen.firstChild;
    stepDivMovingOffScreen.remove();
    stepDivMovingOffScreen.classList.add("hidden");
    this.divOnScreen.appendChild(stepDivMovingOffScreen);

    this._onMoveEndRequesters.forEach((r) => r());
  }

  /**
   *
   * @param {HTMLDivElement} div element to move up off screen (works if div has full_screen class)
   * @param {String} animationName animationName to style
   */
  async move(div, animationName) {
    // pause media
    document.querySelectorAll("video").forEach((video) => video.pause());
    document.querySelectorAll("audio").forEach((audio) => audio.pause());

    div.style.animationDuration =
      globalParameters.duration_step_move / 1000 + "s";
    return playAnimation(div, animationName, globalParameters.duration_step_move);
  }

  async moveNext() {
    return this._moveTo(this.currentStep().nextStepId, "up");
  }

  async movePrevious() {
    return this._moveTo(this.currentStep().previousStepId, "down");
  }

  async moveToStep(id) {
    // steps declared later are below the current one
    const ids = [...globalParameters.steps.keys()];
    const direction =
      ids.indexOf(id) > ids.indexOf(this.currentStepId) ? "up" : "down";
    return this._moveTo(id, direction);
  }

  /**
   *
   * @param {string} id step to display
   * @param {"up"|"down"} direction
   */
  async _moveTo(id, direction) {
    if (
      this.currentStepId == id ||
      this.isMoving ||
      !globalParameters.steps.has(id)
    )
      return;

    this.currentStepId = id;

    this._initMove();

    await Promise.all([
      this.move(this.divOnScreen, direction + "_on_screen"),
      this.move(this.divOffScreen, direction + "_off_screen"),
    ]);
    this._endMove();
  }

  addOnMoveEndRequester(requester) {
    this._onMoveEndRequesters.push(requester);
  }
}
