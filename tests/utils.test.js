import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  canScroll,
  quadraticInOut,
  getElementByClass,
  playAnimation,
  stepIdFromHash,
  wheelDirection,
  keyDirection,
  swipeDirection,
} from "../src/utils";

describe("quadraticInOut", () => {
  it("maps the bounds and the midpoint", () => {
    expect(quadraticInOut(0)).toBe(0);
    expect(quadraticInOut(0.5)).toBe(0.5);
    expect(quadraticInOut(1)).toBe(1);
  });

  it("eases in then out symmetrically", () => {
    expect(quadraticInOut(0.25)).toBeCloseTo(0.125);
    expect(quadraticInOut(0.75)).toBeCloseTo(0.875);
    for (let t = 0; t <= 1; t += 0.05) {
      expect(quadraticInOut(t) + quadraticInOut(1 - t)).toBeCloseTo(1);
    }
  });

  it("is monotonic on [0, 1]", () => {
    let previous = -Infinity;
    for (let t = 0; t <= 1; t += 0.01) {
      const value = quadraticInOut(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("getElementByClass", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="parent"><span class="a">1</span><span class="a">2</span></div>';
  });

  it("returns the first matching child", () => {
    expect(getElementByClass("parent", "a").textContent).toBe("1");
  });

  it("returns undefined when nothing matches", () => {
    expect(getElementByClass("parent", "missing")).toBeUndefined();
  });
});

describe("wheelDirection", () => {
  it("goes to the next step when scrolling down", () => {
    expect(wheelDirection({ deltaX: 0, deltaY: 120 })).toBe(1);
  });

  it("goes to the previous step when scrolling up", () => {
    expect(wheelDirection({ deltaX: 0, deltaY: -3 })).toBe(-1);
  });

  it("ignores purely horizontal scrolling", () => {
    expect(wheelDirection({ deltaX: 80, deltaY: 0 })).toBe(0);
    expect(wheelDirection({ deltaX: -80, deltaY: -0 })).toBe(0);
  });
});

describe("playAnimation", () => {
  let element;

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement("div");
  });

  afterEach(() => vi.useRealTimers());

  it("sets the animation and resolves on animationend", async () => {
    const promise = playAnimation(element, "up_on_screen", 1000);
    expect(element.style.animationName).toBe("up_on_screen");

    element.onanimationend();
    await promise;

    expect(element.style.animationName).toBe("");
    expect(element.onanimationend).toBeNull();
  });

  it("resolves on animationcancel", async () => {
    const promise = playAnimation(element, "up_on_screen", 1000);
    element.onanimationcancel();
    await expect(promise).resolves.toBeUndefined();
  });

  it("ignores animation events bubbling from descendants", async () => {
    const resolved = vi.fn();
    playAnimation(element, "up_on_screen", 1000).then(resolved);
    const child = document.createElement("span");

    element.onanimationcancel({ target: child });
    element.onanimationend({ target: child });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).not.toHaveBeenCalled();
    expect(element.style.animationName).toBe("up_on_screen");

    element.onanimationend({ target: element });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toHaveBeenCalled();
  });

  it("resolves after a timeout when no animation event fires", async () => {
    const resolved = vi.fn();
    playAnimation(element, "up_on_screen", 1000).then(resolved);

    await vi.advanceTimersByTimeAsync(1000);
    expect(resolved).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(resolved).toHaveBeenCalled();
    expect(element.style.animationName).toBe("");
  });
});

describe("keyDirection", () => {
  it("maps arrows and page keys", () => {
    expect(keyDirection({ key: "ArrowDown" })).toBe(1);
    expect(keyDirection({ key: "PageDown" })).toBe(1);
    expect(keyDirection({ key: "ArrowUp" })).toBe(-1);
    expect(keyDirection({ key: "PageUp" })).toBe(-1);
  });

  it("ignores other keys and shortcuts", () => {
    expect(keyDirection({ key: "Enter" })).toBe(0);
    expect(keyDirection({ key: "ArrowLeft" })).toBe(0);
    expect(keyDirection({ key: "ArrowDown", altKey: true })).toBe(0);
    expect(keyDirection({ key: "ArrowUp", ctrlKey: true })).toBe(0);
    expect(keyDirection({ key: "PageDown", metaKey: true })).toBe(0);
  });
});

describe("swipeDirection", () => {
  it("goes to the next step when swiping up, like the wheel", () => {
    expect(swipeDirection(0, -120)).toBe(1);
    expect(swipeDirection(0, 120)).toBe(-1);
  });

  it("ignores taps and short moves", () => {
    expect(swipeDirection(0, 0)).toBe(0);
    expect(swipeDirection(5, -49)).toBe(0);
  });

  it("ignores mostly horizontal swipes", () => {
    expect(swipeDirection(200, -100)).toBe(0);
  });
});

describe("canScroll", () => {
  const scroller = (scrollTop) => ({
    scrollTop,
    clientHeight: 100,
    scrollHeight: 300,
  });

  it("scrolls down until the bottom", () => {
    expect(canScroll(scroller(0), 1)).toBe(true);
    expect(canScroll(scroller(198), 1)).toBe(true);
    expect(canScroll(scroller(200), 1)).toBe(false);
  });

  it("scrolls up until the top", () => {
    expect(canScroll(scroller(200), -1)).toBe(true);
    expect(canScroll(scroller(1), -1)).toBe(true);
    expect(canScroll(scroller(0), -1)).toBe(false);
  });

  it("does not scroll without a scroller or a direction", () => {
    expect(canScroll(null, 1)).toBe(false);
    expect(canScroll(scroller(50), 0)).toBe(false);
  });

  it("does not scroll content that fits", () => {
    const fits = { scrollTop: 0, clientHeight: 100, scrollHeight: 100 };
    expect(canScroll(fits, 1)).toBe(false);
    expect(canScroll(fits, -1)).toBe(false);
  });
});

describe("stepIdFromHash", () => {
  const steps = new Map([
    ["home", {}],
    ["cv", {}],
  ]);

  it("returns the step named by the hash", () => {
    expect(stepIdFromHash("#cv", steps)).toBe("cv");
  });

  it("returns null for no hash, an unknown step or a malformed hash", () => {
    expect(stepIdFromHash("", steps)).toBeNull();
    expect(stepIdFromHash("#", steps)).toBeNull();
    expect(stepIdFromHash("#nope", steps)).toBeNull();
    expect(stepIdFromHash("#%E0", steps)).toBeNull();
  });
});
