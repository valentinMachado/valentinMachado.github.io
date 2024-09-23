export const quadraticInOut = (amount) => {
  if ((amount *= 2) < 1) {
    return 0.5 * amount * amount;
  }

  return -0.5 * (--amount * (amount - 2) - 1);
};

export const bounceOut = (amount) => {
  if (amount < 1 / 2.75) {
    return 7.5625 * amount * amount;
  } else if (amount < 2 / 2.75) {
    return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
  } else if (amount < 2.5 / 2.75) {
    return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
  } else {
    return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
  }
};

export const bounceIn = (amount) => {
  return 1 - bounceOut(1 - amount);
};

export const bounceInOut = (amount) => {
  if (amount < 0.5) {
    return bounceIn(amount * 2) * 0.5;
  }
  return bounceOut(amount * 2 - 1) * 0.5 + 0.5;
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
