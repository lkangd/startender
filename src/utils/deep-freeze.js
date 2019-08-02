export default function(o) {
  const { hasOwnProperty, getOwnPropertyNames, freeze, isFrozen } = Object;
  const oIsFunction = typeof o === 'function';

  freeze(o);

  getOwnPropertyNames(o).forEach(key => {
    const prop = o[key];
    if (
      hasOwnProperty.call(o, prop) &&
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
