import { globalParameters } from "./globalParameters";
import { getElementByClass, playAnimation } from "./utils";

// must match .carousel_preview animation-duration in style.css
const PREVIEW_MOVE_DURATION = 800;
// an item stays selected this long before the next one is selected automatically
const AUTO_SELECT_DELAY = 8000;

const SELECTED_CLASS = "carousel_item_selected";

const cssPath2tagPath = (cssPath) => {
  return cssPath.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
};

/**
 * @param {string} carouselId
 * @return {HTMLElement[]}
 */
const carouselItems = (carouselId) => [
  ...document.getElementById(carouselId).getElementsByClassName("carousel_item"),
];

/** carousel item id is `<stepId>_item` */
const itemStepId = (item) => item.id.replace("_item", "");

/**
 * Shows the preview content (`<stepId>_preview_content`) and image of an item
 * in a preview container.
 *
 * @param {HTMLElement} item
 * @param {HTMLElement} preview
 */
const setPreview = (item, preview) => {
  for (let content of preview.getElementsByClassName(
    "carousel_preview_content"
  )) {
    content.classList.add("hidden");
  }

  const content = document.getElementById(
    item.id.replace("_item", "_preview_content")
  );
  content.classList.remove("hidden");
  preview.appendChild(content);
  preview.querySelector("img").src = cssPath2tagPath(item.style.backgroundImage);
};

/**
 * Adds the header image and the back button on top of an item detail page.
 *
 * @param {string} carouselId
 * @param {string} stepId
 * @param {() => void} onBack
 */
const addDetailPageHeader = (carouselId, stepId, onBack) => {
  const stepDiv = document.getElementById(
    globalParameters.steps.get(stepId).divId
  );

  const previewImg = document.createElement("img");
  previewImg.loading = "lazy";
  previewImg.alt = "";
  previewImg.src = "./assets/img/carousel/" + carouselId + "/" + stepId + ".png";
  previewImg.classList.add("root_content_preview_img");
  stepDiv.insertBefore(previewImg, stepDiv.firstChild);

  const backButton = document.createElement("div");
  backButton.classList.add("back_button");
  const img = document.createElement("img");
  img.src = "./assets/img/icon/back_button.png";
  img.alt = "Retour";
  backButton.appendChild(img);
  backButton.onclick = onBack;
  stepDiv.insertBefore(backButton, stepDiv.firstChild);
};

/**
 * Wires a carousel of index.html: item selection with a sliding preview,
 * links to the item detail pages and automatic selection of the next item.
 *
 * @param {string} carouselId id of the carousel step
 * @param {(stepId: string) => void} moveToStepId
 */
export const initCarousel = (carouselId, moveToStepId) => {
  const previewOnScreen = document.getElementById(
    carouselId + "_carousel_preview_on_screen"
  );
  const previewOffScreen = document.getElementById(
    carouselId + "_carousel_preview_off_screen"
  );

  let isMoving = false;
  let lastSelectTimestamp = Date.now();

  const select = async (itemSelected) => {
    if (isMoving) return;
    const items = carouselItems(carouselId);
    const previousItem = items.find((item) =>
      item.classList.contains(SELECTED_CLASS)
    );
    if (previousItem == itemSelected) return;

    lastSelectTimestamp = Date.now();
    isMoving = true;

    previousItem.classList.remove(SELECTED_CLASS);
    itemSelected.classList.add(SELECTED_CLASS);

    // update 3D (unset when 3D is disabled)
    globalParameters.steps
      .get(carouselId)
      .selectProject3D?.(itemStepId(itemSelected));

    // the old preview slides out while the new one slides in
    setPreview(previousItem, previewOffScreen);
    setPreview(itemSelected, previewOnScreen);
    previewOffScreen.classList.remove("hidden");

    const toLeft = items.indexOf(previousItem) < items.indexOf(itemSelected);
    await Promise.all([
      playAnimation(
        previewOffScreen,
        toLeft
          ? "move_carousel_preview_left_off_screen"
          : "move_carousel_preview_right_off_screen",
        PREVIEW_MOVE_DURATION
      ),
      playAnimation(
        previewOnScreen,
        toLeft
          ? "move_carousel_preview_right_on_screen"
          : "move_carousel_preview_left_on_screen",
        PREVIEW_MOVE_DURATION
      ),
    ]);

    isMoving = false;
    previewOffScreen.classList.add("hidden");
  };

  const selectNext = () => {
    const items = carouselItems(carouselId);
    const current = items.findIndex((item) =>
      item.classList.contains(SELECTED_CLASS)
    );
    select(items[(current + 1) % items.length]);
  };

  // items: the first one is selected at startup
  carouselItems(carouselId).forEach((item, index) => {
    if (index == 0) {
      setPreview(item, previewOnScreen);
      item.classList.add(SELECTED_CLASS);
    }
    item.onclick = () => select(item);
  });

  // detail pages
  for (let content of previewOnScreen.getElementsByClassName(
    "carousel_preview_content"
  )) {
    const stepId = content.id.replace("_preview_content", "");
    addDetailPageHeader(carouselId, stepId, () => moveToStepId(carouselId));
    content.getElementsByClassName("custom_button")[0].onclick = () =>
      moveToStepId(stepId);
  }

  // automatic select, paused while the preview is hovered
  const previewContainer = getElementByClass(
    carouselId,
    "carousel_preview_container"
  );
  let previewContainerIsHovered = false;
  previewContainer.onmousemove = () => {
    previewContainerIsHovered = true;
  };
  previewContainer.onmouseleave = () => {
    previewContainerIsHovered = false;
  };

  setInterval(() => {
    if (
      previewContainerIsHovered ||
      document.getElementById(carouselId).classList.contains("hidden")
    ) {
      lastSelectTimestamp = Date.now();
      return;
    }
    if (Date.now() - lastSelectTimestamp > AUTO_SELECT_DELAY) selectNext();
  }, 100);
};
