/** Let a link be an ordinary link — copied, opened in a tab — while routing in place. */
export const follow = (act) => (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey) return

  event.preventDefault()
  act()
}
