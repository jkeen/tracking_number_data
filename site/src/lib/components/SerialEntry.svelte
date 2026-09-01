<script>
  import { tick } from "svelte"
  import { normalize } from "$lib/decode.js"

  /** @type {{ serial: string, check: string, boxes: number, longest: number,
   *   outcome?: string, onchange: () => void }} */
  let { serial = $bindable(), check = $bindable(), boxes, longest, outcome = "", onchange } = $props()

  const characters = $derived([...serial])
  const positions = $derived([...Array(boxes).keys()])

  let fields = $state([])

  // Safari restores the caret after the click that focused the box, so select again.
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

  const write = (next) => {
    serial = next.slice(0, longest)
    onchange()
  }

  const replaceAt = (index, character) =>
    write([...characters.slice(0, index), character, ...characters.slice(index + 1)].join(""))

  const pasteFrom = (index, text) => write([...characters.slice(0, index), ...text].join(""))

  const removeAt = (index) => write([...characters.slice(0, index), ...characters.slice(index + 1)].join(""))

  const onCheck = (event) => {
    const added = normalize(event.currentTarget.value)
    check = added.slice(-1)
    event.currentTarget.value = check
    onchange()
  }

  const onInput = (index) => (event) => {
    const field = event.currentTarget
    const added = normalize(field.value)

    if (!added) {
      field.value = characters[index] ?? ""
      return
    }

    if (added.length === 1) replaceAt(index, added)
    else pasteFrom(index, added)

    // The character it is about to hold: writing the old one back makes Svelte skip the update.
    field.value = added[0]
    focusOn(index + added.length)
  }

  const onPaste = (index) => (event) => {
    event.preventDefault()
    const added = normalize(event.clipboardData?.getData("text") ?? "")
    if (!added) return

    pasteFrom(index, added)
    focusOn(index + added.length)
  }

  const MOVES = {
    Backspace: (index) => {
      const target = characters[index] === undefined ? index - 1 : index
      if (target < 0) return

      removeAt(target)
      focusOn(target)
    },
    Delete: (index) => {
      removeAt(index)
      focusOn(index)
    },
    ArrowLeft: (index) => focusOn(index - 1),
    ArrowRight: (index) => focusOn(index + 1),
  }

  const onKeydown = (index) => (event) => {
    if (event.metaKey || event.ctrlKey) return

    const move = MOVES[event.key]
    if (!move) return

    event.preventDefault()
    move(index)
  }
</script>

<div class="ledger-row mod-entry" role="group" aria-label="Serial and check digit">
  {#each positions as index (index)}
    <input
      class="ledger-digit mod-{characters[index] === undefined ? 'spare' : 'serial'}"
      class:is-striped={index % 2 === 1}
      style="grid-column: {index + 1}"
      bind:this={fields[index]}
      value={characters[index] ?? ""}
      maxlength="1"
      inputmode="text"
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
    inputmode="text"
    spellcheck="false"
    autocomplete="off"
    autocapitalize="characters"
    aria-label="Check digit"
    oninput={onCheck}
    onfocus={selectAll}
    onclick={selectAll}
  />
</div>
