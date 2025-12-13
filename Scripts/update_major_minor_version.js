#!/usr/bin/env node

/**
 * Cross-platform version updater.
 * Usage: node update_major_minor_version.js 1.2
 */

const fs = require("fs");

function exitWithError(msg) {
    console.error("ERROR:", msg);
    process.exit(1);
}

//
// --- 1. Read CLI param ---
const input = process.argv[2];
if (!input || !/^\d+\.\d+$/.test(input)) {
    exitWithError("Please pass major.minor version, e.g. 1.4");
}
const [newMajor, newMinor] = input.split(".");

console.log(`Updating version to major=${newMajor}, minor=${newMinor}`);

//
// --- Utility: safe file update ---
function updateFile(path, transformFn) {
    if (!fs.existsSync(path)) {
        console.warn(`Skipping ${path} (file not found)`);
        return;
    }
    const original = fs.readFileSync(path, "utf8");
    const updated = transformFn(original);
    fs.writeFileSync(path, updated, "utf8");
    console.log(`Updated ${path}`);
}

//
// --- 2. Update version.json ---
updateFile("../version.json", (text) => {
    let obj = JSON.parse(text);
    obj.major = Number(newMajor);
    obj.minor = Number(newMinor);
    return JSON.stringify(obj, null, 2) + "\n";
});

//
// --- 3. Update .env (CALIBRIX_SERVER_VERSION=...) ---
// keeps patch suffix if exists, e.g. "1.0.production"
updateFile("../server/.env", (text) => {
    return text.replace(
        /^CALIBRIX_SERVER_VERSION=.*/m,
        (line) => {
            const parts = line.split("=");
            // keep suffix if exists
            const suffix = parts[1].split(".").slice(2).join(".");
            const suffixPart = suffix ? "." + suffix : "";
            return `CALIBRIX_SERVER_VERSION=${newMajor}.${newMinor}${suffixPart}`;
        }
    );
});

//
// --- 4. Update frontend .env files ---
// REACT_APP_CALIBRIX_WEB_FRONTEND_VERSION=major.minor.suffix
function updateFrontendEnv(filename) {
    updateFile(filename, (text) => {
        return text.replace(
            /^REACT_APP_CALIBRIX_WEB_FRONTEND_VERSION=.*/m,
            (line) => {
                const parts = line.split("=");
                const suffix = parts[1].split(".").slice(2).join(".");
                const suffixPart = suffix ? "." + suffix : "";
                return `REACT_APP_CALIBRIX_WEB_FRONTEND_VERSION=${newMajor}.${newMinor}${suffixPart}`;
            }
        );
    });
}

updateFrontendEnv("../process-eng-app/.env.development");
updateFrontendEnv("../process-eng-app/.env.production");

console.log("✔ Version update complete.");
