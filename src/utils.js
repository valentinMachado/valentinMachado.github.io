export const quadraticInOut = (amount) => {
  if ((amount *= 2) < 1) {
    return 0.5 * amount * amount;
  }

  return -0.5 * (--amount * (amount - 2) - 1);
};

/**
 * return the first el with class name in parent
 *
 * @param {HTMLElement} parentId
 * @param {string} className
 * @return {HTMLElement}
 */
export const getElementByClass = (parentId, className) => {
  return document.getElementById(parentId).getElementsByClassName(className)[0];
};

/**
 * Step navigation direction for a wheel event: 1 = next, -1 = previous,
 * 0 = none (horizontal scroll, e.g. trackpad swipe or shift + wheel).
 *
 * @param {WheelEvent} event
 * @return {number}
 */
export const wheelDirection = (event) => Math.sign(event.deltaY) || 0;

/**
 * Step navigation direction for a key: 1 = next, -1 = previous, 0 = none.
 *
 * @param {KeyboardEvent} event
 * @return {number}
 */
export const keyDirection = (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return 0;
  if (event.key == "ArrowDown" || event.key == "PageDown") return 1;
  if (event.key == "ArrowUp" || event.key == "PageUp") return -1;
  return 0;
};

// shorter swipes are taps or scroll attempts
const SWIPE_MIN_DISTANCE = 50;

/**
 * Step navigation direction for a touch swipe, like the wheel: swiping up
 * goes to the next step. 1 = next, -1 = previous, 0 = none (too short or
 * mostly horizontal).
 *
 * @param {number} deltaX touchend x - touchstart x
 * @param {number} deltaY touchend y - touchstart y
 * @return {number}
 */
export const swipeDirection = (deltaX, deltaY) => {
  if (
    Math.abs(deltaY) < SWIPE_MIN_DISTANCE ||
    Math.abs(deltaX) > Math.abs(deltaY)
  )
    return 0;
  return deltaY < 0 ? 1 : -1;
};

/**
 * Whether a scrollable element can still scroll in a direction: while it can,
 * the wheel, a swipe or a key scrolls it instead of changing step.
 *
 * @param {HTMLElement | null} element
 * @param {number} direction 1 = down, -1 = up
 * @return {boolean}
 */
export const canScroll = (element, direction) => {
  if (!element || direction == 0) return false;
  if (direction > 0)
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  return element.scrollTop > 0;
};

/**
 * Step named by a URL hash (`#cv`), so that a link can open the site on it.
 *
 * @param {string} hash `location.hash`
 * @param {Map<string, unknown>} steps
 * @return {string | null} null when the hash names no step
 */
export const stepIdFromHash = (hash, steps) => {
  let id;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null; // malformed escape, e.g. "#%E0"
  }
  return steps.has(id) ? id : null;
};

/**
 * URL hash naming a step, the inverse of stepIdFromHash: none for home, so
 * that the home URL stays bare (`/en/`, `/en/#cv`).
 *
 * @param {string} id step id
 * @return {string} "" for home, "#" + id otherwise
 */
export const stepHash = (id) => (id == "home" ? "" : "#" + id);

/**
 * Plays a CSS animation on an element and resolves when it is over.
 * Also resolves on cancel and after a timeout, because animationend never
 * fires if the element is hidden mid-animation (the caller would stay locked).
 * Animation events bubble: those of descendants (e.g. the infinite bounce
 * cancelled when a step div is moved) are ignored.
 *
 * @param {HTMLElement} element
 * @param {string} animationName css @keyframes name
 * @param {number} duration expected duration in ms
 * @return {Promise<void>}
 */
export const playAnimation = (element, animationName, duration) =>
  new Promise((resolve) => {
    let timeoutId;
    const end = (event) => {
      if (event && event.target !== element) return;
      clearTimeout(timeoutId);
      element.onanimationend = element.onanimationcancel = null;
      element.style.animationName = "";
      resolve();
    };
    element.style.animationName = animationName;
    element.onanimationend = end;
    element.onanimationcancel = end;
    timeoutId = setTimeout(end, duration + 500);
  });
