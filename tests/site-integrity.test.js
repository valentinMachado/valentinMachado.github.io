import { describe, it, expect, beforeAll } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PAGES, ROOT, loadPage } from "./helpers";
import { globalParameters } from "../src/globalParameters";

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
  "move_to_cv",
];

const isLocalPath = (path) =>
  path && !/^(https?:|mailto:|data:|#|\/\/)/i.test(path);

// pages use absolute paths ("/assets/…"), the same from / and from /en/
const localFileExists = (path) =>
  existsSync(
    resolve(ROOT, decodeURI(path.split(/[?#]/)[0]).replace(/^\//, ""))
  );

const carouselItems = (carouselId) => [
  ...document
    .getElementById(carouselId)
    .getElementsByClassName("carousel_item"),
];

const itemStepId = (item) => item.id.replace(/_item$/, "");

const OG_LOCALES = { fr: "fr_FR", en: "en_US" };

describe.each(PAGES)("$path", ({ path, lang, url }) => {
  beforeAll(() => loadPage(path));

  describe("steps", () => {
    it("has the initial step", () => {
      expect(globalParameters.steps.has(globalParameters.initialStepId)).toBe(
        true
      );
    });

    it.each([...globalParameters.steps.keys()])(
      "step '%s' has its div in the page",
      (id) => {
        const div = document.getElementById(
          globalParameters.steps.get(id).divId
        );
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
        if (step.nextStepId)
          expect(steps.get(step.nextStepId).previousStepId).toBe(id);
        if (step.previousStepId)
          expect(steps.get(step.previousStepId).nextStepId).toBe(id);
      }
    });

    it("declares the detail steps in the order of the carousel items", () => {
      // the declaration order sets the direction of the transitions
      const itemIds = CAROUSEL_IDS.flatMap((id) =>
        carouselItems(id).map(itemStepId)
      );
      const stepIds = [...globalParameters.steps.keys()];
      expect(stepIds.filter((id) => itemIds.includes(id))).toEqual(itemIds);
    });

    it("every step div is hidden at startup", () => {
      for (const [, step] of globalParameters.steps) {
        expect(
          document.getElementById(step.divId).classList.contains("hidden")
        ).toBe(true);
      }
    });
  });

  describe.each(CAROUSEL_IDS)("carousel '%s'", (carouselId) => {
    it("is a step with a 3D selection hook once initialized", () => {
      expect(globalParameters.steps.has(carouselId)).toBe(true);
    });

    it("has on/off screen preview containers", () => {
      expect(
        document.getElementById(`${carouselId}_carousel_preview_on_screen`)
      ).not.toBeNull();
      expect(
        document.getElementById(`${carouselId}_carousel_preview_off_screen`)
      ).not.toBeNull();
      const preview = document
        .getElementById(`${carouselId}_carousel_preview_on_screen`)
        .querySelector("img");
      expect(preview).not.toBeNull();
    });

    it("has at least one item", () => {
      expect(carouselItems(carouselId).length).toBeGreaterThan(0);
    });

    it("each item has a preview, a step and a thumbnail", () => {
      const onScreen = document.getElementById(
        `${carouselId}_carousel_preview_on_screen`
      );
      for (const item of carouselItems(carouselId)) {
        const stepId = itemStepId(item);
        const preview = document.getElementById(`${stepId}_preview_content`);

        expect(preview, `${stepId}_preview_content`).not.toBeNull();
        expect(onScreen.contains(preview)).toBe(true);
        expect(
          preview.getElementsByClassName("custom_button").length
        ).toBeGreaterThan(0);
        expect(globalParameters.steps.has(stepId), `step ${stepId}`).toBe(true);

        // path built by src/index.js for the detail page header image
        expect(
          localFileExists(`assets/img/carousel/${carouselId}/${stepId}.png`)
        ).toBe(true);

        const match = item.style.backgroundImage.match(
          /url\(["']?(.*?)["']?\)/
        );
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

  describe("page", () => {
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
      expect(scripts).toContain("/dist/bundle.js");
      expect(localFileExists("dist/bundle.js")).toBe(true);
    });

    it("references only existing local files", () => {
      const paths = [
        ...[...document.querySelectorAll("[src]")].map((el) =>
          el.getAttribute("src")
        ),
        ...[...document.querySelectorAll("link[href], a[href]")].map((el) =>
          el.getAttribute("href")
        ),
        ...[...document.querySelectorAll("[style]")].flatMap((el) =>
          [...el.getAttribute("style").matchAll(/url\(["']?(.*?)["']?\)/g)].map(
            (m) => m[1]
          )
        ),
      ].filter(isLocalPath);

      expect(paths.length).toBeGreaterThan(0);
      expect(paths.filter((path) => !localFileExists(path))).toEqual([]);
      // relative paths would break in /en/
      expect(paths.filter((path) => !path.startsWith("/"))).toEqual([]);
    });

    it(`is declared in its language (${lang})`, () => {
      expect(document.documentElement.lang).toBe(lang);
    });

    it("declares its URL and the URL of each language", () => {
      const href = (selector) =>
        document.head.querySelector(selector)?.getAttribute("href");
      expect(href('link[rel="canonical"]')).toBe(url);
      expect(
        document.head
          .querySelector('meta[property="og:url"]')
          .getAttribute("content")
      ).toBe(url);
      for (const page of PAGES) {
        expect(href(`link[rel="alternate"][hreflang="${page.lang}"]`)).toBe(
          page.url
        );
      }
      expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe(
        PAGES[0].url
      );
    });

    it("declares its og:locale and the other one", () => {
      const locales = PAGES.map((page) => OG_LOCALES[page.lang]);
      const content = (selector) =>
        [...document.head.querySelectorAll(selector)].map((meta) =>
          meta.getAttribute("content")
        );
      expect(content('meta[property="og:locale"]')).toEqual([OG_LOCALES[lang]]);
      expect(content('meta[property="og:locale:alternate"]')).toEqual(
        locales.filter((locale) => locale != OG_LOCALES[lang])
      );
    });

    it("links to the page in the other language", () => {
      const link = document.getElementById("language_link");
      const other = PAGES.find((page) => page.lang != lang);
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe(new URL(other.url).pathname);
      expect(link.getAttribute("hreflang")).toBe(other.lang);
      expect(link.getAttribute("lang")).toBe(other.lang);
      expect(link.getAttribute("title")).toBeTruthy();
    });

    it("gives the back button its label", () => {
      // read by src/carousel.js, the only text the JS displays
      expect(
        document.getElementById("on_screen").dataset.backLabel
      ).toBeTruthy();
    });

    it("gives every image an alt and every iframe a title", () => {
      expect([...document.querySelectorAll("img:not([alt])")]).toEqual([]);
      expect([...document.querySelectorAll("iframe:not([title])")]).toEqual([]);
    });

    it("plays the demos as silent looping videos with a title", () => {
      const videos = [...document.querySelectorAll("video[data-autoplay]")];
      expect(videos.length).toBeGreaterThan(0);
      for (const video of videos) {
        expect(video.muted || video.hasAttribute("muted")).toBe(true);
        expect(video.hasAttribute("loop")).toBe(true);
        expect(video.hasAttribute("playsinline")).toBe(true);
        expect(video.getAttribute("preload")).toBe("none");
        expect(video.getAttribute("title")).toBeTruthy();
        expect(video.querySelectorAll("source").length).toBe(2);
      }
    });

    it("clickable elements are keyboard reachable buttons", () => {
      const clickables = document.querySelectorAll(
        ".custom_button:not(#language_link), .carousel_item"
      );
      expect(clickables.length).toBeGreaterThan(0);
      for (const element of clickables) {
        expect(element.tagName, element.id || element.textContent).toBe(
          "BUTTON"
        );
        expect(element.getAttribute("type")).toBe("button");
      }
    });

    it("social icons are real links", () => {
      const links = [...document.querySelectorAll(".network_container a")];
      expect(links.length).toBe(4);
      for (const link of links) {
        expect(link.getAttribute("href")).toMatch(/^(https:\/\/|mailto:)/);
        expect(link.querySelector("img[alt]")).not.toBeNull();
      }
    });

    it("the cv offers its PDF for download", () => {
      const link = document.querySelector("#cv .cv_download");
      expect(link.hasAttribute("download")).toBe(true);
      expect(localFileExists(link.getAttribute("href"))).toBe(true);
    });

    it("back button icon used by src/index.js exists", () => {
      expect(localFileExists("assets/img/icon/back_button.png")).toBe(true);
    });
  });
});
