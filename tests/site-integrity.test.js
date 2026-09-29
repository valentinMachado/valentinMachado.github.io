import { describe, it, expect, beforeAll, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, loadIndexHtml } from "./helpers";

// three-inspect is a debug-only UI (svelte) that cannot run under jsdom
vi.mock("three-inspect/vanilla", () => ({ createInspector: () => {} }));

const { globalParameters } = await import("../src/globalParameters");

const CAROUSEL_IDS = ["projects", "about"];

// ids looked up with getElementById by src/index.js and src/Background3D.js
const ELEMENT_IDS_USED_BY_JS = [
  "three_canvas",
  "on_screen",
  "off_screen",
  "loading_screen_loader",
  "loading_screen_loader_label",
  "loading_screen_top",
  "loading_screen_bottom",
  "move_to_home",
  "move_to_projects",
  "move_to_about",
  "gmail_icon",
  "github_icon",
  "linkedin_icon",
  "instagram_icon",
];

const isLocalPath = (path) =>
  path && !/^(https?:|mailto:|data:|#|\/\/)/i.test(path);

const localFileExists = (path) =>
  existsSync(resolve(ROOT, decodeURI(path.split(/[?#]/)[0])));

const carouselItems = (carouselId) =>
  [...document.getElementById(carouselId).getElementsByClassName("carousel_item")];

const itemStepId = (item) => item.id.replace(/_item$/, "");

beforeAll(loadIndexHtml);

describe("steps", () => {
  it("has the initial step", () => {
    expect(globalParameters.steps.has(globalParameters.initial_id)).toBe(true);
  });

  it.each([...globalParameters.steps.keys()])(
    "step '%s' has its div in index.html",
    (id) => {
      const div = document.getElementById(globalParameters.steps.get(id).divId);
      expect(div).not.toBeNull();
      expect(div.parentElement.id).toBe("on_screen");
      expect(div.classList.contains("root_step")).toBe(true);
    }
  );

  it.each([...globalParameters.steps.keys()])(
    "step '%s' links only to existing steps",
    (id) => {
      const { nextStepId, previousStepId } = globalParameters.steps.get(id);
      for (const linkedId of [nextStepId, previousStepId]) {
        if (linkedId !== undefined) {
          expect(globalParameters.steps.has(linkedId)).toBe(true);
        }
      }
    }
  );

  it("main steps form a consistent next/previous chain", () => {
    const { steps } = globalParameters;
    for (const [id, step] of steps) {
      if (step.nextStepId) expect(steps.get(step.nextStepId).previousStepId).toBe(id);
      if (step.previousStepId) expect(steps.get(step.previousStepId).nextStepId).toBe(id);
    }
  });

  it("every step div is hidden at startup", () => {
    for (const [, step] of globalParameters.steps) {
      expect(document.getElementById(step.divId).classList.contains("hidden")).toBe(true);
    }
  });
});

describe.each(CAROUSEL_IDS)("carousel '%s'", (carouselId) => {
  it("is a step with a 3D selection hook once initialized", () => {
    expect(globalParameters.steps.has(carouselId)).toBe(true);
  });

  it("has on/off screen preview containers", () => {
    expect(document.getElementById(`${carouselId}_carousel_preview_on_screen`)).not.toBeNull();
    expect(document.getElementById(`${carouselId}_carousel_preview_off_screen`)).not.toBeNull();
    const preview = document
      .getElementById(`${carouselId}_carousel_preview_on_screen`)
      .querySelector("img");
    expect(preview).not.toBeNull();
  });

  it("has at least one item", () => {
    expect(carouselItems(carouselId).length).toBeGreaterThan(0);
  });

  it("each item has a preview, a step and a thumbnail", () => {
    const onScreen = document.getElementById(`${carouselId}_carousel_preview_on_screen`);
    for (const item of carouselItems(carouselId)) {
      const stepId = itemStepId(item);
      const preview = document.getElementById(`${stepId}_preview_content`);

      expect(preview, `${stepId}_preview_content`).not.toBeNull();
      expect(onScreen.contains(preview)).toBe(true);
      expect(preview.getElementsByClassName("custom_button").length).toBeGreaterThan(0);
      expect(globalParameters.steps.has(stepId), `step ${stepId}`).toBe(true);

      // path built by src/index.js for the detail page header image
      expect(localFileExists(`assets/img/carousel/${carouselId}/${stepId}.png`)).toBe(true);

      const match = item.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      expect(match, `${item.id} background-image`).not.toBeNull();
      expect(localFileExists(match[1]), match[1]).toBe(true);
    }
  });

  it("each preview content belongs to an item", () => {
    const itemIds = carouselItems(carouselId).map(itemStepId);
    const previews = document
      .getElementById(`${carouselId}_carousel_preview_on_screen`)
      .getElementsByClassName("carousel_preview_content");
    for (const preview of previews) {
      expect(itemIds).toContain(preview.id.replace(/_preview_content$/, ""));
    }
  });
});

describe("index.html", () => {
  it.each(ELEMENT_IDS_USED_BY_JS)("contains #%s", (id) => {
    expect(document.getElementById(id)).not.toBeNull();
  });

  it("has no duplicate ids", () => {
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("loads the committed bundle", () => {
    const scripts = [...document.querySelectorAll("script[src]")].map((s) =>
      s.getAttribute("src")
    );
    expect(scripts).toContain("./dist/bundle.js");
    expect(localFileExists("dist/bundle.js")).toBe(true);
  });

  it("references only existing local files", () => {
    const paths = [
      ...[...document.querySelectorAll("[src]")].map((el) => el.getAttribute("src")),
      ...[...document.querySelectorAll("link[href], a[href]")].map((el) =>
        el.getAttribute("href")
      ),
      ...[...document.querySelectorAll("[style]")].flatMap((el) =>
        [...el.getAttribute("style").matchAll(/url\(["']?(.*?)["']?\)/g)].map((m) => m[1])
      ),
    ].filter(isLocalPath);

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((path) => !localFileExists(path))).toEqual([]);
  });

  it("is declared in French", () => {
    expect(document.documentElement.lang).toBe("fr");
  });

  it("gives every image an alt and every iframe a title", () => {
    expect([...document.querySelectorAll("img:not([alt])")]).toEqual([]);
    expect([...document.querySelectorAll("iframe:not([title])")]).toEqual([]);
  });

  it("back button icon used by src/index.js exists", () => {
    expect(localFileExists("assets/img/icon/back_button.png")).toBe(true);
  });
});
