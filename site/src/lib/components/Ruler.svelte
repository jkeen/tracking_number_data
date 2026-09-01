<script>
  /** @type {{ advance?: number, gap?: number }} */
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
    // The ruler, not the container: changing the type size does not resize the container.
    const observer = new ResizeObserver(measure)
    observer.observe(spaced)
    return () => observer.disconnect()
  })
</script>

<span class="rulers" aria-hidden="true">
  <span class="ruler" bind:this={spaced}>{SAMPLE}</span>
  <span class="ruler mod-plain" bind:this={plain}>{SAMPLE}</span>
</span>
