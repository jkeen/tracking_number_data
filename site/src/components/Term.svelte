<script>
  /** A word or figure with its meaning on hover, since the tooltip is the only place
   * that meaning is written down.
   * @type {{ meaning: string, class?: string, children: import("svelte").Snippet }} */
  let { meaning, class: extra = "", children } = $props()
</script>

<!-- Focusable on purpose: a keyboard has to be able to reach the meaning too. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span class="term {extra}" tabindex="0" data-term={meaning}>{@render children()}</span>

<style>
  .term {
    position: relative;
    border-bottom: 1px dotted var(--system-color-muted);
    cursor: help;
  }

  .term::after {
    content: attr(data-term);
    position: absolute;
    top: calc(100% + var(--system-space-2));
    left: 0;
    z-index: 2;
    width: max-content;
    max-width: 18rem;
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
    white-space: normal;
    visibility: hidden;
    opacity: 0;
    transition: opacity var(--system-transition-quick);
  }

  .term:hover::after,
  .term:focus-visible::after {
    visibility: visible;
    opacity: 1;
  }
</style>
