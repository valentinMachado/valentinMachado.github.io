import { config } from "./config";

export class StepDivController {
  constructor(divOnScreen, divOffScreen) {
    /**
     * @type {number}
     */
    this.currentIndex = 0;
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
    return document.getElementById(this.currentStepDivId());
  }

  currentStepDivId() {
    return config.steps[this.currentIndex]["div_id"];
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
      div.classList.add("move_animation");
      div.style.animationName = animationName;
      div.style.animationDuration = config.duration_step_move / 1000 + "s";
      div.onanimationend = () => {
        div.classList.remove("move_animation");
        div.style.animationName = "";
        resolve();
      };
      div.onerror = reject;
    });
  }

  async movePrevious() {
    if (this.isMoving || this.currentIndex - 1 < 0) return Promise.resolve; // cant move down

    this.currentIndex--;

    this._initMove();

    // launch animation
    return Promise.all([
      this.move(this.divOnScreen, "down_on_screen"),
      this.move(this.divOffScreen, "down_off_screen"),
    ]).then(() => this._endMove());
  }

  async moveNext() {
    if (this.isMoving || this.currentIndex + 1 > config.steps.length - 1)
      return Promise.resolve; // cant move up

    this.currentIndex++;

    this._initMove();

    // launch animation
    return Promise.all([
      this.move(this.divOnScreen, "up_on_screen"),
      this.move(this.divOffScreen, "up_off_screen"),
    ]).then(() => this._endMove());
  }

  async moveToIndex(index) {
    if (
      this.currentIndex == index ||
      this.isMoving ||
      index > config.steps.length - 1 ||
      index < 0
    )
      return Promise.resolve;

    const lastIndex = this.currentIndex;
    this.currentIndex = index;

    this._initMove();

    if (lastIndex < this.currentIndex) {
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
