// Rebuilds the supported tracking numbers table in README.md from couriers/*.json.
// Run with --check to fail instead of writing, which is what CI does.

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { namedGroups, patternOf } from "../site/src/lib/definition.js"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const README = join(ROOT, "README.md")
const SITE = "https://trackingnumber.fyi"
const BEGIN = "<!-- generated: supported tracking numbers -->"
const END = "<!-- /generated -->"
const SHOWN = 3

const normalize = (number) => number.replace(/\s+/g, "").toUpperCase()

const couriers = () =>
  readdirSync(join(ROOT, "couriers"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(ROOT, "couriers", file), "utf8")))
    .sort((one, other) => one.name.localeCompare(other.name))

const numbersIn = (spec) => {
  const valid = (spec.test_numbers && spec.test_numbers.valid) || []

  return Array.from(new Set(valid.map(normalize)))
}

const lengthOf = (numbers) => {
  if (!numbers.length) return ""

  const shortest = Math.min(...numbers.map((number) => number.length))
  const longest = Math.max(...numbers.map((number) => number.length))

  return shortest === longest ? `${shortest}` : `${shortest}-${longest}`
}

const linkTo = (number) => `[\`${number}\`](${SITE}/${number})`

const rowsFor = (courier) =>
  courier.tracking_numbers.map((spec, index) => {
    const numbers = numbersIn(spec)

    return [
      index === 0 ? courier.name : "",
      spec.name,
      lengthOf(numbers),
      numbers.slice(0, SHOWN).map(linkTo).join(" "),
      namedGroups(patternOf(spec))
        .map((name) => `\`${name}\``)
        .join(" "),
    ]
  })

const table = () => {
  const rows = couriers().flatMap(rowsFor)
  const lines = [
    "| Carrier | Type | Length | Examples | Data |",
    "| --- | --- | --- | --- | --- |",
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
