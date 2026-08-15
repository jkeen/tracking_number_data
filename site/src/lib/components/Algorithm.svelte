<script>
  import { tick } from "svelte"
  import { goto, replaceState } from "$app/navigation"
  import { page } from "$app/state"
  import { base } from "$app/paths"
  import { inUse, isAlgorithm, labelFor, stepsFor, usedBy, workedExample } from "$lib/algorithms.js"
  import { describeChecksum } from "$lib/format.js"
  import { sameSettings, trace } from "$lib/checksum.js"
  import { decode, normalize } from "$lib/decode.js"
  import { definitionByKey } from "$lib/dataset.js"
  import { pathFor } from "$lib/paths.js"
  import Ledger from "$lib/components/Ledger.svelte"

  /** @type {{ name: string, number?: string, settings?: Record<string, string> }} */
  let { name, number = "", settings = {} } = $props()

  const LONGEST = 30
  const LABELS = { serial: "serial", check: "check digit" }

  const formats = $derived(isAlgorithm(name) ? usedBy(name) : [])
  // By name, so the row reads as a list to pick from rather than as a ranking.
  const choices = inUse().sort((one, other) => labelFor(one).localeCompare(labelFor(other)))
  const example = $derived(isAlgorithm(name) ? workedExample(name) : null)

  // The format that knows a number sets both how it splits and which constants it is
  // checked against, so the sum on show is the one that number is really checked by.
  // Anything no format claims is taken as a serial with its last character as the check
  // digit, which the two fields then let you correct.
  const openedWith = (value) => {
    for (const definition of formats) {
      const match = decode(definition, value)
      if (match) return { definition, serial: match.serialNumber, check: match.checkDigit ?? "" }
    }

    return { definition: null, serial: value.slice(0, -1), check: value.slice(-1) }
  }

  const opened = $derived(
    number
      ? openedWith(normalize(number))
      : { definition: example?.definition ?? null, serial: example?.match.serialNumber ?? "", check: example?.match.checkDigit ?? "" }
  )

  let serial = $state("")
  let check = $state("")

  $effect(() => {
    serial = normalize(settings.serial ?? opened.serial).slice(0, LONGEST)
    check = normalize(settings.check ?? opened.check).slice(0, 1)
  })

  // Which numbers a format may set, in the order they read on the page.
  const CONSTANTS = {
    mod10: [
      { key: "evens_multiplier", label: "even positions", fallback: 1 },
      { key: "odds_multiplier", label: "odd positions", fallback: 1 },
      { key: "modulo", label: "modulo", fallback: 10 },
    ],
    luhn: [{ key: "modulo", label: "modulo", fallback: 10 }],
    mod7: [{ key: "modulo", label: "modulo", fallback: 7 }],
    s10: [{ key: "modulo", label: "modulo", fallback: 11 }],
    mod_37_36: [{ key: "modulo", label: "modulo", fallback: 36 }],
    sum_product_with_weightings_and_modulo: [
      { key: "modulo1", label: "first modulo", fallback: 10 },
      { key: "modulo2", label: "second modulo", fallback: 10 },
    ],
  }

  const WEIGHTED = ["s10", "sum_product_with_weightings_and_modulo"]

  let config = $state({})

  const constantsFrom = (definition) => ({ ...definition?.spec.validation?.checksum })

  // Query names, so a shared URL reads as the calculator it sets rather than as the JSON.
  const NAMES = {
    evens_multiplier: "evens",
    odds_multiplier: "odds",
    modulo: "modulo",
    modulo1: "modulo1",
    modulo2: "modulo2",
  }

  const numbersIn = (value) => value.split(",").map(Number).filter(Number.isFinite)

  const asked = (base) => {
    const wanted = { ...base }

    for (const [key, query] of Object.entries(NAMES)) {
      if (settings[query] !== undefined) wanted[key] = Number(settings[query])
    }

    if (settings.weights !== undefined) wanted.weightings = numbersIn(settings.weights)

    return wanted
  }

  $effect(() => {
    config = asked(constantsFrom(opened.definition ?? example?.definition ?? formats[0]))
  })

  const queryOf = (constants) => {
    const asQuery = { serial, check }

    for (const [key, name] of Object.entries(NAMES)) {
      if (constants[key] !== undefined) asQuery[name] = String(constants[key])
    }

    if (constants.weightings) asQuery.weights = constants.weightings.join(",")

    return Object.fromEntries(Object.entries(asQuery).filter(([, value]) => value !== ""))
  }

  const query = $derived(queryOf(config))

  // Written when something is changed rather than watched, so that opening a page never
  // writes over the address it was opened with.
  const record = () => {
    const asked = new URLSearchParams(query).toString()
    const path = `${page.url.pathname}${asked ? `?${asked}` : ""}`

    if (path !== page.url.pathname + page.url.search) replaceState(path, {})
  }

  const constants = $derived(CONSTANTS[name] ?? [])
  const weighted = $derived(WEIGHTED.includes(name))
  const weights = $derived(config.weightings ?? [])

  const shown = $derived(config.name ? trace(config, serial) : null)

  const set = (key) => (event) => {
    const value = Number(event.currentTarget.value)
    config = { ...config, [key]: Number.isFinite(value) ? value : undefined }
    record()
  }

  const setWeight = (index) => (event) => {
    const next = [...weights]
    next[index] = Number(event.currentTarget.value) || 0
    config = { ...config, weightings: next }
    record()
  }

  // Every format in the dataset, under the algorithm it uses, so one choice sets both.
  const presets = $derived(choices.map((algorithm) => ({ algorithm, definitions: usedBy(algorithm) })))

  const pick = (event) => {
    const definition = definitionByKey(event.currentTarget.value)
    event.currentTarget.value = ""
    if (!definition) return

    const constants = constantsFrom(definition)

    if (constants.name === name) {
      config = constants
      record()
    } else {
      goto(pathFor.algorithm(constants.name, "", queryOf(constants)))
    }
  }

  // Formats that agree with the calculator, then ones using the algorithm another way.
  const users = $derived.by(() => {
    const settings = (definition) => definition.spec.validation.checksum
    const shares = (definition) => sameSettings(settings(definition), config)

    return [
      { title: "With these constants", formats: formats.filter(shares) },
      { title: "With other constants", formats: formats.filter((definition) => !shares(definition)) },
    ]
  })

  const characters = $derived([...serial])

  // Both ends of the check carry the answer as a colour, rather than a label each.
  const outcome = $derived(!check || !shown ? "" : shown.expected === check ? "is-ok" : "is-bad")

  const boxes = $derived(Math.min(characters.length + 1, LONGEST))
  const positions = $derived([...Array(boxes).keys()])
  const columns = $derived(Math.max(boxes, shown?.cells?.length ?? 0))

  // The check digit waits at the far end, past everything the algorithm has to say.
  const marks = $derived([
    { role: "serial", start: 0, length: Math.max(characters.length, 1) },
    { role: "check", column: "-2 / -1" },
  ])

  let fields = $state([])

  const clean = (text) => text.replace(/\s+/g, "").toUpperCase()

  // Safari puts the caret back after the click that focused the box, so the selection
  // has to be made again once the click has finished.
  const selectAll = (event) => {
    const field = event.currentTarget
    field.select()
    setTimeout(() => field.select())
  }

  const focusOn = async (index) => {
    await tick()
    const field = fields[Math.min(Math.max(index, 0), boxes - 1)]
    field?.focus()
    field?.select()
  }

  const replaceAt = (index, character) => {
    serial = [...characters.slice(0, index), character, ...characters.slice(index + 1)].join("").slice(0, LONGEST)
    record()
  }

  const pasteFrom = (index, text) => {
    serial = [...characters.slice(0, index), ...text].join("").slice(0, LONGEST)
    record()
  }

  const removeAt = (index) => {
    serial = [...characters.slice(0, index), ...characters.slice(index + 1)].join("")
    record()
  }

  const onCheck = (event) => {
    const added = clean(event.currentTarget.value)
    check = added.slice(-1)
    event.currentTarget.value = check
    record()
  }

  const onInput = (index) => (event) => {
    const field = event.currentTarget
    const added = clean(field.value)

    if (!added) {
      field.value = characters[index] ?? ""
      return
    }

    if (added.length === 1) replaceAt(index, added)
    else pasteFrom(index, added)

    // The character it is about to hold, not the one it held: writing the old one back
    // leaves Safari agreeing with what Svelte is about to render, which then skips it.
    field.value = added[0]
    focusOn(index + added.length)
  }

  const onPaste = (index) => (event) => {
    event.preventDefault()
    const added = clean(event.clipboardData?.getData("text") ?? "")
    if (!added) return

    pasteFrom(index, added)
    focusOn(index + added.length)
  }

  const onKeydown = (index) => (event) => {
    if (event.metaKey || event.ctrlKey) return

    if (event.key === "Backspace") {
      event.preventDefault()
      const target = characters[index] === undefined ? index - 1 : index
      if (target < 0) return

      removeAt(target)
      focusOn(target)
    } else if (event.key === "Delete") {
      event.preventDefault()
      removeAt(index)
      focusOn(index)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      focusOn(index - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      focusOn(index + 1)
    }
  }

  // The constants can differ per format, so they belong beside the format that sets them.
</script>

{#if !isAlgorithm(name)}
  <p class="empty">No check digit algorithm called <code>{name}</code>.</p>
{:else}
  <article class="algorithm">
    <h1>Check digit algorithms</h1>
    <p class="deck">
      A check digit is the number checking itself. The formats without one just hope you typed it right.
    </p>
    <div class="choices" role="group" aria-label="Check digit algorithm">
      {#each choices as other (other)}
        <a
          class="choice"
          class:is-current={other === name}
          href={pathFor.algorithm(other, "", query)}
        >
          {labelFor(other)}
        </a>
      {/each}

      <select class="choice mod-preset" aria-label="Load a format's constants" onchange={pick}>
        <option value="">Load a format</option>
        {#each presets as { algorithm, definitions } (algorithm)}
          <optgroup label={labelFor(algorithm)}>
            {#each definitions as definition (definition.key)}
              <option value={definition.key}>{definition.name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </div>

    <div class="settings">
      {#each constants as constant (constant.key)}
        <label class="setting">
          <span class="setting-name">{constant.label}</span>
          <input
            type="number"
            class="setting-value"
            value={config[constant.key] ?? constant.fallback}
            oninput={set(constant.key)}
          />
        </label>
      {/each}

      {#if weighted}
        <div class="setting mod-weights">
          <span class="setting-name">weightings</span>
          <div class="weights">
            {#each weights as weight, index (index)}
              <input
                type="number"
                class="setting-value"
                value={weight}
                aria-label="Weighting {index + 1}"
                oninput={setWeight(index)}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>



    <p class="lede">
      Type a serial and watch the sum run. Clear the check digit to see what the algorithm gives on its
      own, or fill it in to check a number against it.
    </p>

    <Ledger
      {shown}
      {marks}
      {outcome}
      {columns}
      labels={LABELS}
      trailing
    >
      {#snippet entry()}
        <div class="ledger-row mod-entry" role="group" aria-label="Serial and check digit">
          {#each positions as index (index)}
            <input
              class="ledger-digit mod-{characters[index] === undefined ? 'spare' : 'serial'}"
              class:is-striped={index % 2 === 1}
              style="grid-column: {index + 1}"
              bind:this={fields[index]}
              value={characters[index] ?? ""}
              maxlength="1"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="characters"
              aria-label="Serial character {index + 1}"
              oninput={onInput(index)}
              onpaste={onPaste(index)}
              onkeydown={onKeydown(index)}
              onfocus={selectAll}
              onclick={selectAll}
            />
          {/each}

          <input
            class="ledger-digit mod-check {outcome}"
            style="grid-column: -2 / -1"
            value={check}
            maxlength="1"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="characters"
            aria-label="Check digit"
            oninput={onCheck}
            onfocus={selectAll}
            onclick={selectAll}
          />
        </div>
      {/snippet}
    </Ledger>

    {#if shown}
      <p class="verdict {outcome}">
        {#if !check}
          The arithmetic asks for {shown.expected}.
        {:else if shown.expected === check}
          The arithmetic asks for {shown.expected}, and the check digit is {check}. It checks out.
        {:else}
          The arithmetic asks for {shown.expected}, but the check digit is {check}. It does not check out.
        {/if}
      </p>
    {/if}

    <h2>How {labelFor(name)} works</h2>
    <ol class="steps">
      {#each stepsFor(name) as step}
        <li>{step}</li>
      {/each}
    </ol>

    <h2>Used by</h2>
    <table class="parts-list">
      <tbody>
        {#each users as group (group.title)}
          <tr class="section"><th colspan="2">{group.title}</th></tr>

          {#each group.formats as definition (definition.key)}
            <tr>
              <th>
                <a href={pathFor.format(definition.key)}>{definition.name}</a>
              </th>
              <td class="meaning">{describeChecksum(definition.spec.validation.checksum)}</td>
            </tr>
          {/each}

          {#if !group.formats.length}
            <tr><td class="meaning" colspan="2">None that we know of.</td></tr>
          {/if}
        {/each}
      </tbody>
    </table>

    <p class="algorithm-aside">
      Working the other way round? <a href="{base}/analyze">Analyze numbers</a> of a format nobody has
      written down.
    </p>
  </article>
{/if}
