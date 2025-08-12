import * as gulp from "gulp";
import { exec } from "child_process";

function buildWidget() {
  return exec("yarn build:prod", { cwd: "packages/bubble-widget" });
}

function bundleWidget() {
  return exec("yarn bundle", { cwd: "packages/bubble-widget" });
}

function buildFrontend() {
  return exec("yarn build:prod", { cwd: "packages/frontend" });
}

function copyWidgetToFrontend() {
  return exec(
    "cp -r packages/bubble-widget/dist/bundle packages/frontend/dist/qarinai-frontend/browser/widgets",
  );
}

function buildBackend() {
  return exec("yarn build", { cwd: "packages/backend" });
}

function copyFrontendToBackend() {
  return exec(
    "cp -r packages/frontend/dist/qarinai-frontend/browser/* packages/backend/public",
  );
}

export default gulp.series(
  buildWidget,
  bundleWidget,
  buildFrontend,
  copyWidgetToFrontend,
  buildBackend,
  copyFrontendToBackend,
);
