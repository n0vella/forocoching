import fs from "fs"
import manifest from "./manifest.json" assert { type: 'json' }
import archiver from "archiver"

console.log("Creating zip")

if (fs.existsSync("build")) {
  fs.rmSync("build", { recursive: true })
}

fs.mkdirSync("build")

fs.cpSync("dist", "build/dist", { recursive: true })
fs.copyFileSync("manifest.json", "build/manifest.json")
fs.copyFileSync("icon.png", "build/icon.png")

if (!fs.existsSync("releases")) {
  fs.mkdirSync("releases")
}

const outputFile = `releases/${manifest.name}_${manifest.version}.xpi`
const output = fs.createWriteStream(outputFile)
const archive = archiver("zip")

archive.pipe(output)
archive.directory("build", false)
archive.finalize().then(() => {
  fs.rmSync("build", { recursive: true, force: true })
  console.log(`Zip saved on ${outputFile}`)
})




