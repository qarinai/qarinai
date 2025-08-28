import { src, series, task } from "gulp";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";
import { execSync } from "child_process";

const rootDir = process.cwd();
const versionFile = path.join(rootDir, ".version");
let newVersion: string;
let currentVersion: string;

const imageName = "qarinai/qarinai";

// Step 1: bump version in .version file
function bumpVersion(cb: any) {
  if (!fs.existsSync(versionFile)) {
    cb(
      new Error(
        ".version file not found. Please create it with an initial version like 1.0.0",
      ),
    );
    return;
  }

  currentVersion = fs.readFileSync(versionFile, "utf8").trim();
  const bumpType = (process.env.BUMP || "prerelease") as semver.ReleaseType; // default to prerelease
  const preid = process.env.PREID || "dev"; // default prerelease identifier

  if (!semver.valid(currentVersion)) {
    cb(new Error(`Invalid version in .version file: ${currentVersion}`));
    return;
  }

  newVersion = semver.inc(currentVersion, bumpType, preid) as string;
  if (!newVersion) {
    cb(new Error(`Invalid bump type: ${bumpType}`));
    return;
  }

  fs.writeFileSync(versionFile, newVersion + "\n");
  console.log(`Bumped version: ${currentVersion} → ${newVersion}`);
  cb();
}

// Step 2: update all package.json files
function updatePackages(cb: any) {
  function updatePackageJson(pkgPath: string) {
    const filePath = path.join(pkgPath, "package.json");
    if (fs.existsSync(filePath)) {
      const pkg = JSON.parse(fs.readFileSync(filePath, "utf8"));
      pkg.version = newVersion;
      fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + "\n");
      console.log(`Updated version in ${filePath}`);
    }
  }

  // assumes structure: ./packages/*
  const packagesDir = path.join(rootDir, "packages");
  if (fs.existsSync(packagesDir)) {
    for (const dir of fs.readdirSync(packagesDir)) {
      const pkgPath = path.join(packagesDir, dir);
      if (fs.lstatSync(pkgPath).isDirectory()) {
        updatePackageJson(pkgPath);
      }
    }
  }

  cb();
}

// Step 3: commit and tag in git
function gitTag(cb: any) {
  try {
    execSync("git add .", { stdio: "inherit" });
    execSync(`git commit -m "chore(release): v${newVersion}"`, {
      stdio: "inherit",
    });
    execSync(`git tag v${newVersion}`, { stdio: "inherit" });
    console.log(`Git commit and tag created: v${newVersion}`);
    cb();
  } catch (err: any) {
    cb(new Error("Git commit/tag failed: " + err.message));
  }
}

// Step 4: docker build & push
function dockerBuild(cb: any) {
  try {
    execSync(`docker build -t ${imageName}:${newVersion} .`, {
      stdio: "inherit",
    });
    execSync(`docker push ${imageName}:${newVersion}`, { stdio: "inherit" });
    console.log(`Docker image pushed: ${imageName}:${newVersion}`);
    cb();
  } catch (err: any) {
    cb(new Error("Docker build/push failed: " + err.message));
  }
}

// Register gulp tasks
task("release", series(bumpVersion, updatePackages, gitTag, dockerBuild));
