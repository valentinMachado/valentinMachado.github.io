import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadIndexHtml } from "./helpers";
import { initCarousel } from "../src/carousel";

const $ = (id) => document.getElementById(id);
const isVisible = (id) => !$(id).classList.contains("hidden");
const selectedItemIds = (carouselId) =>
  [...$(carouselId).getElementsByClassName("carousel_item_selected")].map(
    (item) => item.id
  );

/** jsdom does not run CSS animations: fire the end handlers by hand. */
const finishSlide = async (carouselId) => {
  $(`${carouselId}_carousel_preview_on_screen`).onanimationend();
  $(`${carouselId}_carousel_preview_off_screen`).onanimationend();
  await vi.advanceTimersByTimeAsync(0);
};

let moveToStepId;
let stopCarousel;

beforeEach(() => {
  vi.useFakeTimers();
  loadIndexHtml();
  // the carousel auto-selects only while its step is displayed
  $("projects").classList.remove("hidden");
  moveToStepId = vi.fn();
  stopCarousel = initCarousel("projects", moveToStepId);
});

afterEach(() => {
  stopCarousel();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("initCarousel", () => {
  it("selects the first item and shows its preview", () => {
    expect(selectedItemIds("projects")).toEqual(["radiosity_item"]);
    expect(isVisible("radiosity_preview_content")).toBe(true);
    expect(isVisible("galeri3_preview_content")).toBe(false);
  });

  it("slides to the clicked item", async () => {
    $("galeri3_item").onclick();

    expect(selectedItemIds("projects")).toEqual(["galeri3_item"]);
    expect(isVisible("galeri3_preview_content")).toBe(true);
    expect(isVisible("projects_carousel_preview_off_screen")).toBe(true);
    // item after the current one: the old preview leaves to the left
    expect($("projects_carousel_preview_off_screen").style.animationName).toBe(
      "move_carousel_preview_left_off_screen"
    );
    expect(
      $("projects_carousel_preview_on_screen")
        .querySelector("img")
        .getAttribute("src")
    ).toBe("./assets/img/carousel/projects/galeri3.png");

    await finishSlide("projects");
    expect(isVisible("projects_carousel_preview_off_screen")).toBe(false);
  });

  it("ignores clicks during a slide", async () => {
    $("galeri3_item").onclick();
    $("ud_imuv_item").onclick();
    expect(selectedItemIds("projects")).toEqual(["galeri3_item"]);
    await finishSlide("projects");

    $("ud_imuv_item").onclick();
    expect(selectedItemIds("projects")).toEqual(["ud_imuv_item"]);
    // item before the current one: the old preview leaves to the right
    expect($("projects_carousel_preview_off_screen").style.animationName).toBe(
      "move_carousel_preview_right_off_screen"
    );
  });

  it("adds a header image and a back button to each detail page", () => {
    const step = $("galeri3_step");
    expect(
      step.querySelector(".root_content_preview_img").getAttribute("src")
    ).toBe("./assets/img/carousel/projects/galeri3.png");
    expect(step.querySelector(".back_button").tagName).toBe("BUTTON");
    step.querySelector(".back_button").onclick();
    expect(moveToStepId).toHaveBeenCalledWith("projects");
  });

  it("opens the detail page from the preview button", () => {
    $("galeri3_preview_content")
      .getElementsByClassName("custom_button")[0]
      .onclick();
    expect(moveToStepId).toHaveBeenCalledWith("galeri3");
  });

  it("selects the next item automatically after 8 s", async () => {
    await vi.advanceTimersByTimeAsync(8200);
    expect(selectedItemIds("projects")).toEqual(["popup_builder_item"]);
  });

  it("does not auto-select while the preview is hovered", async () => {
    $("projects")
      .getElementsByClassName("carousel_preview_container")[0]
      .onmousemove();
    await vi.advanceTimersByTimeAsync(10000);
    expect(selectedItemIds("projects")).toEqual(["radiosity_item"]);
  });

  it("stops its timer while the tab is hidden", async () => {
    const setHidden = (hidden) => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => hidden,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    };
    try {
      expect(vi.getTimerCount()).toBe(1);
      setHidden(true);
      expect(vi.getTimerCount()).toBe(0);

      await vi.advanceTimersByTimeAsync(4000);
      setHidden(false);
      expect(vi.getTimerCount()).toBe(1);

      // the delay restarts from zero when the tab comes back
      await vi.advanceTimersByTimeAsync(7000);
      expect(selectedItemIds("projects")).toEqual(["radiosity_item"]);
      await vi.advanceTimersByTimeAsync(1200);
      expect(selectedItemIds("projects")).toEqual(["popup_builder_item"]);
    } finally {
      delete document.hidden;
    }
  });

  it("does not auto-select while its step is hidden", async () => {
    $("projects").classList.add("hidden");
    await vi.advanceTimersByTimeAsync(10000);
    expect(selectedItemIds("projects")).toEqual(["radiosity_item"]);
  });
});
