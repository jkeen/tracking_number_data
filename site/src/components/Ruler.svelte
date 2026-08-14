<script>
  /** Measures the field's type so rules can be positioned by character.
   * @type {{ advance?: number, gap?: number }} */
  let { advance = $bindable(0), gap = $bindable(0) } = $props()

  const SAMPLE = "0000000000"

  let spaced = $state(null)
  let plain = $state(null)

  $effect(() => {
    if (!spaced || !plain) return

    const measure = () => {
      advance = spaced.getBoundingClientRect().width / SAMPLE.length
      gap = advance - plain.getBoundingClientRect().width / SAMPLE.length
    }

    measure()
    // Watching the ruler itself: changing the type size does not resize the container,
    // so without this the advance stays measured at the previous size.
    const observer = new ResizeObserver(measure)
    observer.observe(spaced)
    return () => observer.disconnect()
  })
</script>

<span class="rulers" aria-hidden="true">
  <span class="ruler spaced" bind:this={spaced}>{SAMPLE}</span>
  <span class="ruler plain" bind:this={plain}>{SAMPLE}</span>
</span>
