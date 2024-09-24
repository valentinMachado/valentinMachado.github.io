import { Background3D } from "./Background3D";
import { StepDivController } from "./StepDivController";
import { globalParameters } from "./globalParameters";
import { getElementByClass } from "./utils";

window.DEBUG_3D = false;

window.onload = async () => {
  const mobileCheck = function () {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  };
  if (mobileCheck()) alert("For a better experience use a computer");

  // background3D
  const background3D = new Background3D(
    document.getElementById("three_canvas")
  );

  await background3D.load((amountLoaded) => {
    document.getElementById("loading_screen_loader_label").innerText =
      Math.round(amountLoaded * 100) + "%";
  });

  document
    .getElementById("loading_screen_top")
    .classList.add("loading_screen_top_end");
  document
    .getElementById("loading_screen_bottom")
    .classList.add("loading_screen_bottom_end");
  document
    .getElementById("loading_screen_loader")
    .classList.add("opacity_fade_out");
  document.getElementById("loading_screen_loader").ontransitionend = () => {
    document.getElementById("loading_screen_loader").classList.add("hidden");
  };

  const resize = () => {
    background3D.camera.aspect = window.innerWidth / window.innerHeight;
    background3D.camera.updateProjectionMatrix();
    background3D.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  resize();
  window.onresize = resize;

  // step div controller
  const stepDivController = new StepDivController(
    document.getElementById("on_screen"),
    document.getElementById("off_screen")
  );

  window.onwheel = (event) => {
    if (background3D.isMoving || stepDivController.isMoving || window.DEBUG_3D)
      return; // to keep sync
    if (event.deltaY > 0) {
      background3D.moveNext();
      stepDivController.moveNext();
    } else {
      background3D.movePrevious();
      stepDivController.movePrevious();
    }
  };

  const moveToStepId = (id) => {
    if (background3D.isMoving || stepDivController.isMoving) return; // to keep sync
    background3D.moveToStep(id);
    stepDivController.moveToStep(id);
  };

  document.getElementById("move_to_home").onclick = () => {
    moveToStepId("home");
  };

  document.getElementById("move_to_projects").onclick = () => {
    moveToStepId("projects");
  };

  document.getElementById("move_to_about").onclick = () => {
    moveToStepId("about");
  };

  stepDivController.addOnMoveEndRequester(() => {
    for (let customButton of document.getElementsByClassName("custom_button")) {
      customButton.classList.remove("custom_button_selected");
    }
    switch (stepDivController.currentStep().divId) {
      case "home":
        document
          .getElementById("move_to_home")
          .classList.add("custom_button_selected");
        break;
      case "projects":
        document
          .getElementById("move_to_projects")
          .classList.add("custom_button_selected");
        break;
      case "about":
        document
          .getElementById("move_to_about")
          .classList.add("custom_button_selected");
        break;
      default:
    }
  });

  // projects carousel

  /**
   *
   * @param {HTMLElement} item
   * @param {string} previewId
   */
  const setCarouselPreviewWithItem = (item, previewId) => {
    for (let content of document
      .getElementById(previewId)
      .getElementsByClassName("carousel_preview_content")) {
      content.classList.add("hidden");
    }

    const content = document.getElementById(
      item.id.replace("_item", "_preview_content")
    );
    content.classList.remove("hidden");
    document.getElementById(previewId).appendChild(content);
    document.getElementById(previewId).querySelector("img").src =
      item.style.backgroundImage
        .replace(/^url\(["']?/, "")
        .replace(/["']?\)$/, "");
  };

  let isMoving = false;
  let lastSelectTimestamp = 0;
  const selectCarouselItem = (itemSelected) => {
    if (isMoving) return;
    let alreadySelected = false;
    let previousItem = null;
    let previousItemBeforeItemSelected = false;
    for (let item of document
      .getElementById("projects")
      .getElementsByClassName("carousel_item")) {
      if (item.classList.contains("carousel_item_selected")) {
        if (item == itemSelected) {
          alreadySelected = true;
          break;
        } else {
          previousItem = item;
          previousItem.classList.remove("carousel_item_selected");
        }
      }

      if (item == itemSelected && previousItem) {
        previousItemBeforeItemSelected = true;
      }
    }

    if (alreadySelected) return;

    isMoving = true;

    // update 3D
    globalParameters.steps
      .get("projects")
      .selectProject3D(itemSelected.id.replace("_item", ""));

    itemSelected.classList.add("carousel_item_selected");

    setCarouselPreviewWithItem(
      previousItem,
      "projects_carousel_preview_off_screen"
    );
    setCarouselPreviewWithItem(
      itemSelected,
      "projects_carousel_preview_on_screen"
    );

    document
      .getElementById("projects_carousel_preview_off_screen")
      .classList.remove("hidden");

    const move = async (div, animationName) => {
      return new Promise((resolve, reject) => {
        div.style.animationName = animationName;
        div.onanimationend = () => {
          div.style.animationName = "";
          resolve();
        };
        div.onerror = reject;
      });
    };

    const promises = [];
    if (previousItemBeforeItemSelected) {
      // left move
      promises.push(
        move(
          document.getElementById("projects_carousel_preview_off_screen"),
          "move_carousel_preview_left_off_screen"
        )
      );
      promises.push(
        move(
          document.getElementById("projects_carousel_preview_on_screen"),
          "move_carousel_preview_right_on_screen"
        )
      );
    } else {
      // right move
      promises.push(
        move(
          document.getElementById("projects_carousel_preview_off_screen"),
          "move_carousel_preview_right_off_screen"
        )
      );
      promises.push(
        move(
          document.getElementById("projects_carousel_preview_on_screen"),
          "move_carousel_preview_left_on_screen"
        )
      );
    }

    Promise.all(promises).then(() => {
      lastSelectTimestamp = Date.now();
      isMoving = false;
      document
        .getElementById("projects_carousel_preview_off_screen")
        .classList.add("hidden");
    });
  };

  let carouselInitialized = false;
  for (let item of document
    .getElementById("projects")
    .getElementsByClassName("carousel_item")) {
    if (!carouselInitialized) {
      setCarouselPreviewWithItem(item, "projects_carousel_preview_on_screen");
      item.classList.add("carousel_item_selected");
      carouselInitialized = true;
    }
    item.onclick = selectCarouselItem.bind(null, item);
  }

  for (let content of document
    .getElementById("projects_carousel_preview_on_screen")
    .getElementsByClassName("carousel_preview_content")) {
    content.getElementsByClassName("custom_button")[0].onclick =
      moveToStepId.bind(null, content.id.replace("_preview_content", ""));
  }

  // link icon

  document.getElementById("gmail_icon").onclick = () => {
    location.href = "mailto:valentin.machado.cpe@gmail.com";
  };
  document.getElementById("github_icon").onclick = () => {
    const a = document.createElement("a");
    a.href = "https://github.com/valentinMachado";
    a.target = "_blank";
    a.click();
  };
  document.getElementById("linkedin_icon").onclick = () => {
    const a = document.createElement("a");
    a.href = "https://www.linkedin.com/in/valentin-machado-6b408110b/";
    a.target = "_blank";
    a.click();
  };

  const nextSelectDuration = 10000;
  setInterval(() => {
    if (Date.now() - lastSelectTimestamp > nextSelectDuration) {
      for (let item of document
        .getElementById("projects")
        .getElementsByClassName("carousel_item")) {
        if (item.classList.contains("carousel_item_selected")) {
          if (item.nextElementSibling) {
            selectCarouselItem(item.nextElementSibling);
          } else {
            selectCarouselItem(item.parentElement.firstElementChild);
          }
          break;
        }
      }
    }
  }, nextSelectDuration);

  if (window.DEBUG_3D) {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = ".debug { pointer-events: none; }";
    document.getElementsByTagName("head")[0].appendChild(style);
    document.getElementById("on_screen").classList.add("debug");
    document.getElementById("off_screen").classList.add("debug");
  }
};
