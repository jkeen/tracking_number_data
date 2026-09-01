<script>
  import { untrack } from "svelte"
  import { goto, replaceState } from "$app/navigation"
  import { page } from "$app/state"
  import { base } from "$app/paths"
  import { inUse, labelFor, stepsFor, usedBy, workedExample } from "$lib/algorithms.js"
  import { describeChecksum } from "$lib/format.js"
  import { isSupported, sameSettings, trace } from "$lib/checksum.js"
  import { decode, normalize } from "$lib/decode.js"
  import { definitionByKey } from "$lib/dataset.js"
  import { pathFor } from "$lib/paths.js"
  import { configFrom, constantsFor, isWeighted, queryFrom } from "$lib/settings.js"
  import Ledger from "$lib/components/Ledger.svelte"
  import SerialEntry from "$lib/components/SerialEntry.svelte"

  /** @type {{ name: string, number?: string, settings?: Record<string, string> }} */
  let { name, number = "", settings = {} } = $props()

  const LONGEST = 30
  const LABELS = { serial: "serial", check: "check digit" }

  const formats = $derived(isSupported(name) ? usedBy(name) : [])
  const choices = inUse().sort((one, other) => labelFor(one).localeCompare(labelFor(other)))
  const example = $derived(isSupported(name) ? workedExample(name) : null)

  const openedWith = (value) => {
    const readings = formats
      .map((definition) => ({ definition, match: decode(definition, value) }))
      .filter(({ match }) => match)

    const read = readings.find(({ match }) => match.valid) ?? readings[0]
    if (!read) return { definition: null, serial: value.slice(0, -1), check: value.slice(-1) }

    return { definition: read.definition, serial: read.match.serialNumber, check: read.match.checkDigit ?? "" }
  }

  const opened = $derived(
    number
      ? openedWith(normalize(number))
      : { definition: example?.definition ?? null, serial: example?.match.serialNumber ?? "", check: example?.match.checkDigit ?? "" }
  )

  const checksumOf = (definition) => ({ ...definition?.spec.validation?.checksum })

  const seed = untrack(() => ({
    serial: normalize(settings.serial ?? opened.serial).slice(0, LONGEST),
    check: normalize(settings.check ?? opened.check).slice(0, 1),
    config: configFrom(settings, checksumOf(opened.definition ?? example?.definition ?? formats[0])),
  }))

  let serial = $state(seed.serial)
  let check = $state(seed.check)
  let config = $state(seed.config)

  const query = $derived(queryFrom(config, { serial, check }))

  const record = () => {
    const asked = new URLSearchParams(query).toString()
    const path = `${page.url.pathname}${asked ? `?${asked}` : ""}`

    if (path !== page.url.pathname + page.url.search) replaceState(path, {})
  }

  const constants = $derived(constantsFor(name))
  const weighted = $derived(isWeighted(name))
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

  const presets = $derived(choices.map((algorithm) => ({ algorithm, definitions: usedBy(algorithm) })))

  const pick = (event) => {
    const definition = definitionByKey(event.currentTarget.value)
    event.currentTarget.value = ""
    if (!definition) return

    const chosen = checksumOf(definition)

    if (chosen.name === name) {
      config = chosen
      record()
    } else {
      goto(pathFor.algorithm(chosen.name, "", queryFrom(chosen, { serial, check })))
    }
  }

  const users = $derived.by(() => {
    const shares = (definition) => sameSettings(definition.spec.validation.checksum, config)

    return [
      { title: "With these constants", formats: formats.filter(shares) },
      { title: "With other constants", formats: formats.filter((definition) => !shares(definition)) },
    ]
  })

  const outcome = $derived(!check || !shown ? "" : shown.expected === check ? "is-ok" : "is-bad")

  const boxes = $derived(Math.min(serial.length + 1, LONGEST))
  const columns = $derived(Math.max(boxes, shown?.cells?.length ?? 0))

  const marks = $derived([
    { role: "serial", start: 0, length: Math.max(serial.length, 1) },
    { role: "check", column: "-2 / -1" },
  ])
</script>

{#if !isSupported(name)}
  <p class="empty">No check digit algorithm called <code>{name}</code>.</p>
{:else}
  <article class="algorithm">
    <h1>Check digit algorithms</h1>
    <p class="deck">
      A check digit is extremely useful for detecting a legitimate tracking number within a block of text, reducing the chances of it being mistaken for something else.
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
      Type a serial number and see the check digit get calculated. Clear the check digit to see what the algorithm gives on its
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
        <SerialEntry bind:serial bind:check {boxes} longest={LONGEST} {outcome} onchange={record} />
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
