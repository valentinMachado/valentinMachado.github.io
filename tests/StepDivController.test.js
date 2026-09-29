import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadIndexHtml } from "./helpers";

vi.mock("three-inspect/vanilla", () => ({ createInspector: () => {} }));

const { StepDivController } = await import("../src/StepDivController");

const onScreen = () => document.getElementById("on_screen");
const offScreen = () => document.getElementById("off_screen");
const isVisible = (id) => !document.getElementById(id).classList.contains("hidden");

/** jsdom does not run CSS animations: fire the end handlers by hand. */
const finishAnimations = () => {
  onScreen().onanimationend();
  offScreen().onanimationend();
};

const navigate = async (controller, action) => {
  const promise = action(controller);
  finishAnimations();
  await promise;
};

let controller;

beforeEach(() => {
  loadIndexHtml();
  controller = new StepDivController(onScreen(), offScreen());
});

describe("initial state", () => {
  it("shows the initial step only", () => {
    expect(controller.currentStepId).toBe("home");
    expect(controller.currentStep().divId).toBe("home");
    expect(isVisible("home")).toBe(true);
    expect(isVisible("projects")).toBe(false);
    expect(controller.isMoving).toBe(false);
  });
});

describe("moveNext", () => {
  it("starts an upward transition and locks navigation", () => {
    controller.moveNext();

    expect(controller.currentStepId).toBe("projects");
    expect(controller.isMoving).toBe(true);
    expect(onScreen().style.animationName).toBe("up_on_screen");
    expect(offScreen().style.animationName).toBe("up_off_screen");
    expect(offScreen().style.animationDuration).toBe("1s");
    // leaving step is moved to the off screen container during the transition
    expect(offScreen().contains(document.getElementById("home"))).toBe(true);
    expect(isVisible("off_screen")).toBe(true);
    expect(isVisible("projects")).toBe(true);
  });

  it("restores a clean state when the animation ends", async () => {
    const requester = vi.fn();
    controller.addOnMoveEndRequester(requester);

    await navigate(controller, (c) => c.moveNext());

    expect(controller.isMoving).toBe(false);
    expect(isVisible("projects")).toBe(true);
    expect(isVisible("home")).toBe(false);
    expect(onScreen().contains(document.getElementById("home"))).toBe(true);
    expect(offScreen().children.length).toBe(0);
    expect(isVisible("off_screen")).toBe(false);
    expect(onScreen().style.animationName).toBe("");
    expect(requester).toHaveBeenCalledTimes(1);
  });

  it("is ignored while a transition is running", () => {
    controller.moveNext();
    controller.moveNext();
    expect(controller.currentStepId).toBe("projects");
  });

  it("does nothing on the last step", async () => {
    await navigate(controller, (c) => c.moveNext());
    await navigate(controller, (c) => c.moveNext());
    expect(controller.currentStepId).toBe("about");

    controller.moveNext();
    expect(controller.currentStepId).toBe("about");
    expect(controller.isMoving).toBe(false);
  });
});

describe("movePrevious", () => {
  it("does nothing on the first step", () => {
    controller.movePrevious();
    expect(controller.currentStepId).toBe("home");
    expect(controller.isMoving).toBe(false);
  });

  it("goes back with a downward transition", async () => {
    await navigate(controller, (c) => c.moveNext());

    controller.movePrevious();
    expect(controller.currentStepId).toBe("home");
    expect(onScreen().style.animationName).toBe("down_on_screen");
    expect(offScreen().style.animationName).toBe("down_off_screen");
    finishAnimations();
  });
});

describe("moveToStep", () => {
  it("ignores the current step and unknown steps", () => {
    controller.moveToStep("home");
    controller.moveToStep("does_not_exist");
    expect(controller.currentStepId).toBe("home");
    expect(controller.isMoving).toBe(false);
  });

  it("moves up to a step declared later", async () => {
    controller.moveToStep("about");
    expect(onScreen().style.animationName).toBe("up_on_screen");
    finishAnimations();
    await Promise.resolve();
    expect(controller.currentStepId).toBe("about");
  });

  it("moves down to a step declared earlier", async () => {
    await navigate(controller, (c) => c.moveToStep("popup_builder"));
    expect(isVisible("popup_builder_step")).toBe(true);

    controller.moveToStep("projects");
    expect(onScreen().style.animationName).toBe("down_on_screen");
    finishAnimations();
  });

  it("reaches a detail step that is outside the next/previous chain", async () => {
    await navigate(controller, (c) => c.moveToStep("galeri3"));
    expect(controller.currentStepId).toBe("galeri3");
    expect(isVisible("galeri3_step")).toBe(true);
    expect(isVisible("home")).toBe(false);

    // detail steps have no neighbours
    controller.moveNext();
    controller.movePrevious();
    expect(controller.currentStepId).toBe("galeri3");
  });
});

describe("media", () => {
  it("pauses every video and audio when a transition starts", () => {
    const pauses = [...document.querySelectorAll("video, audio")].map((media) => {
      const pause = vi.fn();
      media.pause = pause;
      return pause;
    });
    expect(pauses.length).toBeGreaterThan(0);

    controller.moveNext();

    pauses.forEach((pause) => expect(pause).toHaveBeenCalled());
  });
});

describe("robustness", () => {
  it("unlocks navigation even if animationend never fires", async () => {
    vi.useFakeTimers();
    try {
      controller.moveNext();
      expect(controller.isMoving).toBe(true);

      await vi.advanceTimersByTimeAsync(2000);

      expect(controller.isMoving).toBe(false);
      expect(isVisible("projects")).toBe(true);
      expect(offScreen().children.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
