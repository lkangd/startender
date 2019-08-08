/**
 *
 *
 * @export
 * @param {*} o
 * @param {boolean} [freezeTop=true]
 * @returns
 */
export default function deepFreeze(o, freezeTop = true) {
  const { hasOwnProperty, getOwnPropertyNames, freeze, isFrozen } = Object;
  const oIsFunction = typeof o === 'function';

  freezeTop && freeze(o);

  getOwnPropertyNames(o).forEach(key => {
    const prop = o[key];
    if (
      hasOwnProperty.call(o, key) &&
      prop !== null &&
      !isFrozen(prop) &&
      (typeof prop === 'object' || typeof prop === 'function') &&
      (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true)
    ) {
      deepFreeze(prop);
    }
  });

  return o;
}
