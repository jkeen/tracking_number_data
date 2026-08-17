// Rebuilds the supported carriers table in README.md from couriers/*.json, or with --check fails instead of writing.

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "../site/src/lib/definition.js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const README = join(ROOT, "README.md")
const SITE = "https://trackingnumber.fyi"
const BEGIN = "<!-- generated: supported tracking numbers -->"
const END = "<!-- /generated -->"

const couriers = () =>
  readdirSync(join(ROOT, "couriers"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(ROOT, "couriers", file), "utf8")))
    .sort((one, other) => one.name.localeCompare(other.name))

const rowFor = (courier, definitions) => [
  courier.name,
  definitions.map((definition) => `[${definition.name}](${SITE}/format/${definition.key})`).join(" · "),
]

const table = () => {
  const all = couriers()
  const definitions = build(all)
  const rows = all.map((courier) =>
    rowFor(
      courier,
      definitions.filter((definition) => definition.courier.code === courier.courier_code)
    )
  )
  const lines = [
    "| Carrier | Formats |",
    "| --- | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ]

  return lines.join("\n")
}

const written = () => {
  const readme = readFileSync(README, "utf8")
  const start = readme.indexOf(BEGIN)
  const finish = readme.indexOf(END)

  if (start < 0 || finish < 0) {
    throw new Error(`README.md is missing the ${BEGIN} and ${END} markers the table goes between.`)
  }

  return {
    readme,
    rebuilt: `${readme.slice(0, start + BEGIN.length)}\n\n${table()}\n\n${readme.slice(finish)}`,
  }
}

const { readme, rebuilt } = written()

if (process.argv.includes("--check")) {
  if (readme !== rebuilt) {
    console.error("README.md is out of date with couriers/*.json. Run: node utils/gen_readme.mjs")
    process.exit(1)
  }

  console.log("README.md is up to date.")
} else {
  writeFileSync(README, rebuilt)
  console.log(`Wrote the supported tracking numbers table to ${README}.`)
}
