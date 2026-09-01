<script>
  import { Tooltip } from "melt/builders"

  /** @type {{ meaning: string, class?: string, children: import("svelte").Snippet }} */
  let { meaning, class: extra = "", children } = $props()

  const tooltip = new Tooltip({ openDelay: 0, closeDelay: 0, floatingConfig: { computePosition: { placement: "bottom-start" }, offset: { mainAxis: 8 } } })
</script>

<!-- Focusable on purpose: a keyboard has to be able to reach the meaning too. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span class="term {extra}" tabindex="0" {...tooltip.trigger}>{@render children()}</span>

<span class="meaning" {...tooltip.content}>{meaning}</span>

<style>
  .term {
    border-bottom: 1px dotted var(--system-color-muted);
    cursor: help;
  }

  /* Reset what the browser dresses a popover in before setting our own. */
  .meaning {
    inset: auto;
    margin: 0;
    width: max-content;
    max-width: min(18rem, 100vw - 2rem);
    padding: var(--system-space-2) var(--system-space-3);
    border: var(--system-border);
    border-radius: var(--system-radius-md);
    background: var(--system-color-paper);
    box-shadow: 0 2px 10px oklch(0 0 0 / 0.15);
    color: var(--system-color-muted);
    font-family: var(--system-font-sans);
    font-size: var(--system-text-sm);
    font-weight: 400;
    line-height: 1.4;
    text-align: left;
    letter-spacing: normal;
    text-transform: none;
    white-space: normal;
    overflow: visible;
  }
</style>
