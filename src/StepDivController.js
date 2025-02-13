import { globalParameters } from "./globalParameters";

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

    if (!stepDivMovingOffScreen) debugger;

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
    return new Promise((resolve, reject) => {
      // pause media
      document.querySelectorAll("video").forEach((video) => video.pause());
      document.querySelectorAll("audio").forEach((audio) => audio.pause());

      div.style.animationName = animationName;
      div.style.animationDuration =
        globalParameters.duration_step_move / 1000 + "s";
      div.onanimationend = () => {
        div.style.animationName = "";
        resolve();
      };
      div.onerror = reject;
    });
  }

  async movePrevious() {
    if (
      this.isMoving ||
      !globalParameters.steps.has(this.currentStep().previousStepId)
    )
      return Promise.resolve;

    this.currentStepId = this.currentStep().previousStepId;

    this._initMove();

    // launch animation
    return Promise.all([
      this.move(this.divOnScreen, "down_on_screen"),
      this.move(this.divOffScreen, "down_off_screen"),
    ]).then(() => this._endMove());
  }

  async moveNext() {
    if (
      this.isMoving ||
      !globalParameters.steps.has(this.currentStep().nextStepId)
    )
      return Promise.resolve;

    this.currentStepId = this.currentStep().nextStepId;

    this._initMove();

    // launch animation
    return Promise.all([
      this.move(this.divOnScreen, "up_on_screen"),
      this.move(this.divOffScreen, "up_off_screen"),
    ]).then(() => this._endMove());
  }

  async moveToStep(id) {
    if (
      this.currentStepId == id ||
      this.isMoving ||
      !globalParameters.steps.has(id)
    )
      return Promise.resolve;

    const lastId = this.currentStepId;
    this.currentStepId = id;

    let findLastFirst = false;
    for (const [stepId] of globalParameters.steps) {
      if (stepId == lastId) {
        findLastFirst = true;
        break;
      }
      if (stepId == id) {
        break;
      }
    }

    this._initMove();

    if (findLastFirst) {
      return Promise.all([
        this.move(this.divOnScreen, "up_on_screen"),
        this.move(this.divOffScreen, "up_off_screen"),
      ]).then(() => this._endMove());
    } else {
      return Promise.all([
        this.move(this.divOnScreen, "down_on_screen"),
        this.move(this.divOffScreen, "down_off_screen"),
      ]).then(() => this._endMove());
    }
  }

  addOnMoveEndRequester(requester) {
    this._onMoveEndRequesters.push(requester);
  }
}
