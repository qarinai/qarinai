import { exec } from "child_process";
import * as gulp from "gulp";

export function installFrontendDependencies() {
  return exec("yarn install", { cwd: "packages/frontend" });
}

export function installBackendDependencies() {
  return exec("yarn install", { cwd: "packages/backend" });
}

export function installWidgetDependencies() {
  return exec("yarn install", { cwd: "packages/bubble-widget" });
}

gulp.task(
  "install:packages",
  gulp.series(
    installWidgetDependencies,
    installFrontendDependencies,
    installBackendDependencies,
  ),
);
