export const fitSize = ({ frame, sizer, characters, reference, sample, min, max }) => {
  const perCharacter = sizer.getBoundingClientRect().width / sample.length / reference
  const room = frame.clientWidth - parseFloat(getComputedStyle(frame).paddingInline) * 2

  return Math.min(max, Math.max(min, room / (characters * perCharacter)))
}
