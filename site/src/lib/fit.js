/**
 * The type size at which a number of characters fills the width available. Measured
 * from a sample rendered at a known size, so it holds for whatever font is in use.
 */
export const fitSize = ({ frame, sizer, characters, reference, sample, min, max }) => {
  const perCharacter = sizer.getBoundingClientRect().width / sample.length / reference
  const room = frame.clientWidth - parseFloat(getComputedStyle(frame).paddingInline) * 2

  return Math.min(max, Math.max(min, room / (characters * perCharacter)))
}
