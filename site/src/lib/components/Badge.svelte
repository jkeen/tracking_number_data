<script>
  /** A pill stating an outcome, with the evidence behind it on hover when there is any.
   * @type {{ tone?: "" | "good" | "bad" | "warn", hint?: string, children: import("svelte").Snippet, evidence?: import("svelte").Snippet }} */
  let { tone = "", hint = "", children, evidence } = $props()

  const hinted = $derived(Boolean(hint || evidence))
</script>

<!-- Focusable on purpose, so the evidence behind the pill is reachable by keyboard. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  class="badge mod-{tone}"
  class:mod-hinted={hinted}
  tabindex={hinted ? 0 : undefined}
  role={hinted ? "button" : undefined}
>
  {@render children()}

  {#if evidence}
    <span class="hint">{@render evidence()}</span>
  {:else if hint}
    <span class="hint">{hint}</span>
  {/if}
</span>

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
    position: relative;
    cursor: help;
  }

  /* A child of the pill, so moving onto the pattern to select it keeps it open. */
  .badge .hint {
    display: none;
    position: absolute;
    top: calc(100% + var(--system-space-2));
    right: 0;
    z-index: 5;
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
    cursor: auto;
  }

  .badge.mod-hinted:hover .hint,
  .badge.mod-hinted:focus .hint,
  .badge.mod-hinted:focus-within .hint {
    display: block;
  }
</style>
