const highlightTagRegExp = /\<span style\=\"color\: \#e36209\; font\-weight\: inherit\;\"\>(.*?)\<\/span\>/gm;
const highlightedTagRemove = innerHTML => innerHTML.replace(highlightTagRegExp, '$1');
const tagRegExp = /(\<\/?.*?\>)/g;
const _splitInnerHTML = innerHTML => {
  const splitLabel = String(Math.random());
  return innerHTML.replace(tagRegExp, `${splitLabel}$1${splitLabel}`).split(splitLabel);
};

/**
 *
 *
 * @export
 * @param {*} el
 * @param {*} binding
 * @returns
 */
export function highlight(el, binding) {
  const matchRegExp = new RegExp(`(${binding.value.split(/\ +/).join('|')})`, 'ig');
  console.log('matchRegExp :', matchRegExp);
  if (!binding.value || !binding.value.trim().length) {
    el.innerHTML = highlightedTagRemove(el.innerHTML);
    return;
  }
  // const matchRegExp = new RegExp(`(${binding.value.split(/\ +/).join('|')})`, 'ig');
  const innerHTML = _splitInnerHTML(highlightedTagRemove(el.innerHTML));
  el.innerHTML = innerHTML
    .map(text => (tagRegExp.test(text) && text) || text.replace(matchRegExp, `<span style="color: #e36209; font-weight: inherit;">$1</span>`))
    .join('');
}
