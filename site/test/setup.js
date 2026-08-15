// jsdom has no ResizeObserver, and it reports zero-width boxes, so the breakdown
// measures nothing under test. Its placement maths is covered by segments.test.js.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
