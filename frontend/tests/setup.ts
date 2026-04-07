// Prevent jsdom from trying to load image files from the filesystem.
// In jsdom, src="/icon-check.svg" resolves to file:///icon-check.svg which
// Node.js rejects. Stubbing the setter keeps the component tests focused on
// behaviour, not asset loading.
Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
  set() {},
  get() { return '' },
})
