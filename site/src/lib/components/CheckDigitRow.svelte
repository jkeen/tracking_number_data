<script>
  import { trace } from "$lib/checksum.js"
  import { rolesIn } from "$lib/ledger.js"
  import Ledger from "$lib/components/Ledger.svelte"

  /** The arithmetic behind a number's check digit, as a row of the table it belongs to.
   * @type {{ match: import("../lib/shapes.js").Match, whose?: string }} */
  let { match, whose = "" } = $props()

  const checksum = $derived(match.definition.spec.validation?.checksum)
  const shown = $derived(checksum ? trace(checksum, match.serialNumber) : null)

  const characters = $derived([...match.number])
  const layout = $derived(rolesIn(match, match.serialNumber, characters.length))
  const columns = $derived(Math.max(characters.length, layout.offset + (shown?.cells?.length ?? 0)))
  const outcome = $derived(match.checksumValid === null ? "" : match.checksumValid ? "is-ok" : "is-bad")
</script>

{#if shown}
  <tr class="mod-verify">
    <td colspan="2">
      {#if whose}<p class="whose">{whose}</p>{/if}
      <Ledger {characters} roles={layout.roles} offset={layout.offset} {shown} {outcome} {columns} />
    </td>
  </tr>
{/if}
