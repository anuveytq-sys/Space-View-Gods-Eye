/** Map startup helpers */
export function prepareMapContainer(el) {
  if (!el) return null;
  el.style.width = '100%';
  el.style.height = '100%';
  return el;
}
