/**
 * creates a bookmark or folder under the specified parentId. If url is NULL or missing, it will be a folder.
 * @export
 * @param {Object} tree { name: string, children: [ tree... ] }
 */
export function createBookmarks(tree) {
  chrome.bookmarks.create({ parentId: '1', title: tree.name }, topFolder => {
    tree.children.forEach(group => {
      chrome.bookmarks.create({ parentId: topFolder.id, title: group.name }, groupFolder => {
        group.children.forEach(repo => chrome.bookmarks.create({ parentId: groupFolder.id, title: repo.name, url: repo.url }));
      });
    });
  });
}

/**
 * removes a bookmark or an empty bookmark folder.
 * @export
 * @param {String} id target bookmark id
 * @param {Function} callback
 */
export function removeBookmarks(id, callback = () => {}) {
  chrome.bookmarks.remove(id, callback);
}
