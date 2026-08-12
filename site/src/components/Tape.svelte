<script>
  import Working from "./Working.svelte"

  /** The number in columns, with the arithmetic continuing down from the characters it
   * ran over. Pass `entry` to make those characters editable.
   * @type {{ characters: string[], roles: string[], offset?: number, shown: any,
   *   marks?: {role: string, start: number, length: number}[], labels?: Record<string, string>,
   *   outcome?: string, columns: number, caption?: string, entry?: import("svelte").Snippet }} */
  let {
    characters = [],
    roles = [],
    offset = 0,
    shown,
    marks = [],
    labels = {},
    outcome = "",
    columns,
    caption = "",
    trailing = false,
    entry,
  } = $props()
</script>

<div class="tape" class:mod-trailing={trailing}>
  <div class="tape-grid" style="--columns: {columns}">
    {#if marks.length}
      <div class="tape-row mod-marks">
        {#each marks as span (span.start)}
          <span class="tape-mark" style="grid-column: {span.column ?? `${span.start + 1} / span ${span.length}`}">
            {labels[span.role]}
          </span>
        {/each}
      </div>
    {/if}

    {#if entry}
      {@render entry()}
    {:else}
      <div class="tape-row mod-entry">
        {#each characters as character, index (index)}
          <span
            class="tape-digit mod-{roles[index] ?? 'spare'} {roles[index] === 'check' ? outcome : ''}"
            class:is-striped={index % 2 === 1}
            style="grid-column: {index + 1}"
          >
            {character}
          </span>
        {/each}
      </div>
    {/if}

    <Working {shown} {offset} {outcome} {trailing} />
  </div>
</div>

{#if caption}
  <p class="tape-caption">{caption}</p>
{/if}
