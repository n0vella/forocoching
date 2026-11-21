import archiver from "archiver"
import fs from "node:fs"
import { resolve } from "node:path"
import { createManifest } from "./manifest.mjs"

const ROOT = process.cwd()
const BASE_DIST = resolve(ROOT, "dist/base")
const RELEASES_DIR = resolve(ROOT, "releases")

const requestedTarget = process.argv[2]
const targets =
  requestedTarget === "chrome" || requestedTarget === "firefox"
    ? [requestedTarget]
    : ["chrome", "firefox"]

if (!fs.existsSync(BASE_DIST)) {
  console.error("Error: dist/base no existe. Ejecuta primero el build de Vite.")
  process.exit(1)
}

if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true })
}

async function zipDirectory(sourceDir, outputPath) {
  return new Promise((resolvePromise, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    output.on("close", resolvePromise)
    archive.on("error", reject)

    archive.pipe(output)
    archive.directory(sourceDir, false)
    archive.finalize()
  })
}

for (const target of targets) {
  const targetDir = resolve(ROOT, "dist", target)
  const manifest = createManifest(target)

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true })
  }

  fs.cpSync(BASE_DIST, targetDir, { recursive: true })
  fs.copyFileSync(resolve(ROOT, "icon.png"), resolve(targetDir, "icon.png"))
  fs.writeFileSync(
    resolve(targetDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8",
  )

  const ext = target === "firefox" ? "xpi" : "zip"
  const archivePath = resolve(
    RELEASES_DIR,
    `${manifest.name}_${manifest.version}.${ext}`,
  )

  await zipDirectory(targetDir, archivePath)
  console.log(`[${target}] Empaquetado en ${archivePath}`)
}
