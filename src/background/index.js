import $storageSync from '@/utils/storage-sync';
import { createBookmarks } from '@/utils/bookmarks';
import { getAccessCode, isStarsTab } from '@/github/utils';

let needOpenExtension = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { url } = changeInfo;
  if (!url) return;

  const accessCode = getAccessCode(url);
  accessCode && chrome.tabs.sendMessage(tabId, { accessCode });

  if (isStarsTab(url) || needOpenExtension) {
    chrome.tabs.sendMessage(tabId, { mountInstance: true });
    needOpenExtension = false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const actions = { bookmarks: createBookmarks };
  const { data, action } = request;
  try {
    actions[action](data);
    sendResponse({ bookmarkCreated: 'Bookmarks created success!' });
  } catch (e) {
    sendResponse({ bookmarkCreated: 'Bookmarks created fail!' });
  }
});

chrome.browserAction.onClicked.addListener(async tab => {
  const { url, id } = tab;
  const githubURL = 'https://github.com/';
  if (url.startsWith(githubURL)) {
    chrome.tabs.sendMessage(id, { mountInstance: true });
  } else {
    const starsTabURL = (await $storageSync.get('GITHUB_STARS_HELPER_STARS_URL')) || githubURL;
    chrome.tabs.create({ url: starsTabURL });
    needOpenExtension = true;
  }
});
