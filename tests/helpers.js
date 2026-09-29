import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ROOT = resolve(__dirname, "..");

export const readIndexHtml = () =>
  readFileSync(resolve(ROOT, "index.html"), "utf8");

/** Loads index.html into the jsdom document (scripts are not executed). */
export const loadIndexHtml = () => {
  const doc = new DOMParser().parseFromString(readIndexHtml(), "text/html");
  document.documentElement.lang = doc.documentElement.lang;
  document.head.innerHTML = doc.head.innerHTML;
  document.body.innerHTML = doc.body.innerHTML;
};
