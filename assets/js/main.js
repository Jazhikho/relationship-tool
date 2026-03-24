import { initActions } from "./ui/actions.js";
import { renderAll } from "./ui/render.js";

/**
 * Bootstraps app actions and initial render cycle.
 */
function initApp() {
  initActions();
  renderAll();
}

initApp();
