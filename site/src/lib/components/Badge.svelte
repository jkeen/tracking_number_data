<script>
  import { Tooltip } from "melt/builders"

  /** @type {{ tone?: "" | "good" | "bad" | "warn", hint?: string, children: import("svelte").Snippet, evidence?: import("svelte").Snippet }} */
  let { tone = "", hint = "", children, evidence } = $props()

  const hinted = $derived(Boolean(hint || evidence))
  const tooltip = new Tooltip({ openDelay: 0, closeDelay: 0, floatingConfig: { computePosition: { placement: "bottom-start" }, offset: { mainAxis: 8 } } })
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  class="badge mod-{tone}"
  class:mod-hinted={hinted}
  tabindex={hinted ? 0 : undefined}
  {...hinted ? tooltip.trigger : {}}
>
  {@render children()}
</span>

{#if hinted}
  <span class="hint" {...tooltip.content}>
    {#if evidence}{@render evidence()}{:else}{hint}{/if}
  </span>
{/if}

<style>
  .badge {
    padding: var(--system-space-1) var(--system-space-2);
    border-radius: var(--system-radius-pill);
    background: var(--system-color-fade);
    color: var(--system-color-muted);
    font-size: var(--system-text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .badge.mod-good {
    background: var(--system-color-good);
    color: var(--system-color-on-solid);
  }

  .badge.mod-bad {
    background: var(--system-color-bad);
    color: var(--system-color-on-solid);
  }

  .badge.mod-warn {
    background: var(--system-color-warn);
    color: var(--system-color-on-solid);
  }

  .badge.mod-hinted {
    cursor: help;
  }

  .hint {
    inset: auto;
    margin: 0;
    width: max-content;
    max-width: min(44rem, 80vw);
    padding: var(--system-space-3);
    border: var(--system-border);
    border-radius: var(--system-radius-md);
    background: var(--system-color-paper);
    box-shadow: 0 4px 16px oklch(0 0 0 / 0.12);
    color: var(--system-color-ink);
    font-size: var(--system-text-xs);
    letter-spacing: normal;
    text-transform: none;
    text-align: left;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    overflow: visible;
  }
</style>
