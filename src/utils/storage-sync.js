export default {
  /**
   * Gets one or more items from storage.
   * @param {string | [string] | object} key object: { key: defaultValue }
   * @returns Promise
   */
  get(key) {
    return new Promise(resolve => {
      chrome.storage.sync.get(key, res => {
        if (typeof key === 'string') {
          resolve(res[key]);
        } else {
          resolve(res);
        }
      });
    });
  },

  /**
   * Sets multiple items.
   * @param {string | object} key object: { key: value }
   * @param {*} value
   * @returns Promise
   */
  set(key, value) {
    return new Promise(resolve => {
      if (typeof key === 'string') {
        chrome.storage.sync.set({ [key]: value }, resolve);
      } else {
        chrome.storage.sync.set(key, resolve);
      }
    });
  },

  /**
   * Removes one or more items from storage.
   * @param {string | [string]} key
   * @returns Promise
   */
  delete(key) {
    return new Promise(resolve => {
      chrome.storage.sync.remove(key, resolve);
    });
  },

  /**
   * Removes all items from storage.
   * @returns Promise
   */
  clear() {
    console.warn('Github Stars Helper Storage Cleared');
    return new Promise(resolve => {
      chrome.storage.sync.clear(resolve);
    });
  },

  /**
   * Fired when one or more items change.
   * @param {function} callback The callback parameter should be a function that looks like this:
   *                            function(object changes, string areaName) {...};
   */
  addListener(callback) {
    chrome.storage.onChanged.addListener(callback);
  },
};
