import { createBookmarks } from '@/utils/bookmarks';
import { getAccessCode, isStarsTab } from '@/github/utils';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { url } = changeInfo;
  if (!url) return;

  const accessCode = getAccessCode(url);
  accessCode && chrome.tabs.sendMessage(tabId, { accessCode });

  isStarsTab(url) && chrome.tabs.sendMessage(tabId, { mountInstance: true });
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
