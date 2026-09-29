// jsdom does not implement media playback
if (typeof window !== "undefined") {
  window.HTMLMediaElement.prototype.pause = () => {};
}
