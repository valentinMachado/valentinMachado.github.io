import { describe, it, expect } from "vitest";
import { PAGES, parsePage } from "./helpers";

// the pages are written by hand in each language: only the texts, the text
// attributes and the external links may differ
const [reference, ...translations] = PAGES.map((page) => ({
  ...page,
  doc: parsePage(page.path),
}));

const ids = (doc) =>
  [...doc.body.querySelectorAll("[id]")].map((element) => element.id);

// inline text tags without a class move with the wording of each language
const TEXT_TAGS = ["A", "B", "I", "BR", "STRONG", "EM"];

const classes = (doc) =>
  [...doc.body.querySelectorAll("*")]
    .filter(
      (element) => element.className || !TEXT_TAGS.includes(element.tagName)
    )
    .map((element) => element.tagName + "." + element.className);

const sources = (doc) =>
  [...doc.body.querySelectorAll("[src]")].map((element) =>
    element.getAttribute("src")
  );

const styles = (doc) =>
  [...doc.body.querySelectorAll("[style]")].map((element) =>
    element.getAttribute("style")
  );

describe.each(translations)("$path matches index.html", ({ doc }) => {
  it("has the same ids in the same order", () => {
    expect(ids(doc)).toEqual(ids(reference.doc));
  });

  it("has the same elements and classes in the same order", () => {
    expect(classes(doc)).toEqual(classes(reference.doc));
  });

  it("shows the same media and iframes in the same order", () => {
    expect(sources(doc)).toEqual(sources(reference.doc));
  });

  it("has the same inline styles (carousel thumbnails)", () => {
    expect(styles(doc)).toEqual(styles(reference.doc));
  });
});
