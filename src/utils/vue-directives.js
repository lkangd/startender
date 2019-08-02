const highlightTagRegExp = /\<span style\=\"color\: \#e36209\; font\-weight\: inherit\;\"\>(.*?)\<\/span\>/gm;
const highlightedTagRemove = innerHTML => innerHTML.replace(highlightTagRegExp, '$1');

export function highLight(el, binding) {
  if (!binding.value || !binding.value.trim().length) {
    el.innerHTML = highlightedTagRemove(el.innerHTML);
    return;
  }
  const mathchRegExp = new RegExp(`(${binding.value.split(/\ +/).join('|')})`, 'ig');
  const innerHTML = highlightedTagRemove(el.innerHTML);
  el.innerHTML = innerHTML.replace(mathchRegExp, `<span style="color: #e36209; font-weight: inherit;">$1</span>`);
}
