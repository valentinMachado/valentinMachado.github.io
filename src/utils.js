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
 * Plays a CSS animation on an element and resolves when it is over.
 * Also resolves on cancel and after a timeout, because animationend never
 * fires if the element is hidden mid-animation (the caller would stay locked).
 *
 * @param {HTMLElement} element
 * @param {string} animationName css @keyframes name
 * @param {number} duration expected duration in ms
 * @return {Promise<void>}
 */
export const playAnimation = (element, animationName, duration) =>
  new Promise((resolve) => {
    let timeoutId;
    const end = () => {
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
