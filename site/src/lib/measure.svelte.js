import { fitSize } from "./fit.js"

export const REFERENCE = 100
export const SAMPLE = "0000000000"

export const measure = (fitting) => {
  const type = $state({ frame: null, sizer: null, size: null, advance: 0, gap: 0 })

  $effect(() => {
    if (!type.frame || !type.sizer) return

    const fit = () => {
      type.size = fitSize({
        ...fitting(),
        frame: type.frame,
        sizer: type.sizer,
        reference: REFERENCE,
        sample: SAMPLE,
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(type.frame)
    return () => observer.disconnect()
  })

  return type
}
