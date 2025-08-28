import { exec } from "child_process";
import * as gulp from "gulp";

export function buildWidget() {
  return exec("yarn build:prod", { cwd: "packages/bubble-widget" });
}

export function bundleWidget() {
  return exec("yarn bundle", { cwd: "packages/bubble-widget" });
}

export function buildFrontend() {
  return exec("yarn build:prod", { cwd: "packages/frontend" });
}

export function copyWidgetToFrontend() {
  return exec(
    "cp -r packages/bubble-widget/dist/bundle packages/frontend/dist/qarinai-frontend/browser/widgets",
  );
}

export function buildBackend() {
  return exec("yarn build", { cwd: "packages/backend" });
}

export function copyFrontendToBackend() {
  return exec(
    "cp -r packages/frontend/dist/qarinai-frontend/browser/* packages/backend/public",
  );
}

gulp.task(
  "build",
  gulp.series(
    buildWidget,
    bundleWidget,
    buildFrontend,
    copyWidgetToFrontend,
    buildBackend,
    copyFrontendToBackend,
  ),
);
