import fs from "node:fs"
import { resolve } from "node:path"

const pkg = JSON.parse(
  fs.readFileSync(resolve(process.cwd(), "package.json"), "utf-8"),
)

const FOROCOCHES_MATCHES = [
  "https://forocoches.com/*",
  "https://*.forocoches.com/*",
]

/**
 * Generates a valid Manifest V3 object tailored to Chrome or Firefox.
 * @param {"chrome" | "firefox"} target
 */
export function createManifest(target) {
  const base = {
    manifest_version: 3,
    name: "Forocoching",
    version: pkg.version,
    description:
      pkg.description ||
      "Mejoras para ForoCoches: filtrado de hilos, usuarios ignorados, editor social y clasificación con IA.",
    icons: {
      "512": "icon.png",
    },
    permissions: ["storage", "cookies"],
    host_permissions: FOROCOCHES_MATCHES,
    optional_host_permissions: [
      "https://*/*",
      "http://localhost/*",
      "http://127.0.0.1/*",
    ],
    content_scripts: [
      {
        matches: FOROCOCHES_MATCHES,
        js: ["content-script/index.js"],
        css: ["content-script/index.css"],
        all_frames: true,
        run_at: "document_start",
      },
    ],
    action: {
      default_title: "Forocoching",
    },
    options_ui: {
      page: "settings/settings.html",
      open_in_tab: true,
    },
    web_accessible_resources: [
      {
        resources: ["content-script/index.css"],
        matches: FOROCOCHES_MATCHES,
      },
    ],
  }

  if (target === "firefox") {
    return {
      ...base,
      background: {
        scripts: ["background.js"],
        type: "module",
      },
      browser_specific_settings: {
        gecko: {
          id: "{a76f92a1-2d47-4b1f-bc2c-5fc9e8dfb93f}",
          strict_min_version: "121.0",
        },
        gecko_android: {},
      },
    }
  }

  // Chrome / Chromium MV3
  return {
    ...base,
    background: {
      service_worker: "background.js",
      type: "module",
    },
  }
}
