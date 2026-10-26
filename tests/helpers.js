import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ROOT = resolve(__dirname, "..");

/** The portfolio in each language: same structure, translated texts. */
export const PAGES = [
  { path: "index.html", lang: "fr", url: "https://valentinmachado.github.io/" },
  {
    path: "en/index.html",
    lang: "en",
    url: "https://valentinmachado.github.io/en/",
  },
];

export const readPage = (path = "index.html") =>
  readFileSync(resolve(ROOT, path), "utf8");

/** Parses a page into a detached document (scripts are not executed). */
export const parsePage = (path) =>
  new DOMParser().parseFromString(readPage(path), "text/html");

/** Loads a page into the jsdom document (scripts are not executed). */
export const loadPage = (path = "index.html") => {
  const doc = parsePage(path);
  document.documentElement.lang = doc.documentElement.lang;
  document.head.innerHTML = doc.head.innerHTML;
  document.body.innerHTML = doc.body.innerHTML;
};

export const loadIndexHtml = () => loadPage("index.html");
