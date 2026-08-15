<script>
  /** @type {{ definition: import("../lib/shapes.js").Definition }} */
  let { definition } = $props()

  const file = $derived(`couriers/${definition.courier.code}.json`)
  const source = $derived(JSON.stringify(definition.spec, null, 2))
</script>

<details class="source">
  <summary>Defined in {file}</summary>

  <pre><code>{source}</code></pre>

  <p class="whose">
    <a href="https://github.com/jkeen/tracking_number_data/blob/main/{file}" rel="noopener">
      View the whole file on GitHub
    </a>
  </p>
</details>

<style>
  .source {
    margin-top: var(--system-space-4);
    font-size: var(--system-text-sm);
  }

  .source summary {
    color: var(--system-color-muted);
    cursor: pointer;
  }

  .source pre {
    margin: var(--system-space-3) 0 0;
    padding: var(--system-space-3);
    border: var(--system-border);
    border-radius: var(--system-radius-md);
    background: var(--system-color-fade);
    overflow-x: auto;
    font-size: var(--system-text-xs);
    line-height: 1.5;
    tab-size: 2;
  }

  .source .whose {
    margin: var(--system-space-2) 0 0;
    font-size: var(--system-text-xs);
  }
</style>
