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

export function parallelTraverse(a, b, callback) {
  callback(a, b);

  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback);
  }
}

export function resetClonedSkinnedMeshes(source, clone) {
  const clonedMeshes = [];
  const meshSources = {};
  const boneClones = {};

  parallelTraverse(source, clone, function (sourceNode, clonedNode) {
    if (sourceNode.isSkinnedMesh) {
      meshSources[clonedNode.uuid] = sourceNode;
      clonedMeshes.push(clonedNode);
    }
    if (sourceNode.isBone) boneClones[sourceNode.uuid] = clonedNode;
  });

  for (let i = 0, l = clonedMeshes.length; i < l; i++) {
    const clone = clonedMeshes[i];
    const sourceMesh = meshSources[clone.uuid];
    const sourceBones = sourceMesh.skeleton.bones;

    clone.skeleton = sourceMesh.skeleton.clone();
    clone.bindMatrix.copy(sourceMesh.bindMatrix);

    clone.skeleton.bones = sourceBones.map(function (bone) {
      return boneClones[bone.uuid];
    });

    clone.bind(clone.skeleton, clone.bindMatrix);
  }
}

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
