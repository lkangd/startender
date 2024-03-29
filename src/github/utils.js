import $storageSync from '@/utils/storage-sync';

/**
 *
 *
 * @export
 * @param {*} [url=window.location.href]
 * @returns
 */
export function isStarsTab(url = window.location.href) {
  const regExp = /^https?:\/\/github\.com\/\S+[?|&]tab\=stars/;
  return regExp.test(url);
}

/**
 *
 *
 * @export
 * @param {*} [url=window.location.href]
 */
export function saveStarsTabUrl(url = window.location.href) {
  if (isStarsTab()) {
    $storageSync.set('GITHUB_STARS_HELPER_STARS_URL', url);
    localStorage.setItem('stars_helper.stars_tab_url', url);
  }
}

/**
 *
 *
 * @export
 * @param {*} [url=window.location.href]
 * @returns
 */
export function getAccessCode(url = window.location.href) {
  if (!url.match(/[&?]auth-type\=github\-stars\-helper/)) return false;

  let result = url.match(/[&?]error=([^&]+)/);
  if (result) throw new Error(`Chrome extension 'github-stars-helper' get authorization code fail: ${result[1]}`);

  result = url.match(/[&?]code=([\w\/\-]+)/);
  return (result && result[1]) || false;
}

/**
 *
 *
 * @export
 * @param {*} link
 * @returns
 */
export function getPageCountInLink(link) {
  let pageCount = 1;
  const lastPage = link.match(/\&page\=(\d+)(?=\>\;\ ?rel\=\"last\")/);
  lastPage && (pageCount = lastPage[1]);

  return pageCount;
}
