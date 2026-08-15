<script>
  import { theme, toggle } from "$lib/theme.svelte.js"

  const dark = $derived(theme.name === "dark")
</script>

<button
  type="button"
  class="theme"
  aria-pressed={dark}
  aria-label="Dark mode"
  title={dark ? "Switch to light" : "Switch to dark"}
  onclick={toggle}
>
  <!-- Lucide sun and moon, drawn here rather than pulled in as a dependency. -->
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if dark}
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    {:else}
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    {/if}
  </svg>
</button>

<style>
  .theme {
    display: flex;
    align-items: center;
    padding: var(--system-space-2);
    border: var(--system-border);
    border-radius: var(--system-radius-pill);
    background: var(--system-color-fade);
    color: var(--system-color-muted);
    font-size: var(--system-text-md);
    line-height: 1;
    cursor: pointer;
    transition: color var(--system-transition-quick), border-color var(--system-transition-quick);
  }

  .theme:hover {
    border-color: var(--system-color-accent);
    color: var(--system-color-accent);
  }

  .theme .icon {
    width: 1rem;
    height: 1rem;
  }
</style>
