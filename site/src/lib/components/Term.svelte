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

  /* Out of the layout rather than merely invisible: a hidden box this wide, on every
     labelled part in a table, is width the page is then obliged to find. */
  .term::after {
    content: attr(data-term);
    display: none;
    position: absolute;
    top: calc(100% + var(--system-space-2));
    left: 0;
    z-index: 2;
    width: max-content;
    /* It opens from the left of the word it belongs to, and a word this deep into a
       narrow screen has less room to its right than the screen is wide. */
    max-width: min(18rem, 100vw - 6rem);
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
  }

  .term:hover::after,
  .term:focus-visible::after {
    display: block;
  }
</style>
