import { describe, it, expect, beforeEach } from "vitest";
import { quadraticInOut, getElementByClass, wheelDirection } from "../src/utils";

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
