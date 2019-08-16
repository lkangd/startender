import { getRepo } from '@/github/api-v4';
import { getAccessToken } from '@/github/api-v3';
import $storageSync from '@/utils/storage-sync';
import { createBookmarks } from '@/utils/bookmarks';
import { getAccessCode, isStarsTab } from '@/github/utils';

let needOpenExtension = false;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const { url } = changeInfo;
  if (!url) return;

  const accessCode = getAccessCode(url);
  if (accessCode) {
    try {
      const accessToken = await getAccessToken(accessCode);
      await $storageSync.set('GITHUB_STARS_HELPER_ACCESS_TOKEN', accessToken);
      const githubURL = 'https://github.com/';
      const url = (await $storageSync.get('GITHUB_STARS_HELPER_STARS_URL')) || githubURL;
      chrome.tabs.update(tabId, { url });
    } catch (error) {
      chrome.tabs.sendMessage(tabId, { getAccessTokenFailed: String(error) });
    }
  }

  if (isStarsTab(url) || needOpenExtension) {
    chrome.tabs.sendMessage(tabId, { mountInstance: true });
    needOpenExtension = false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { data, action } = request;
  const githubURL = 'https://github.com/';
  const actions = {
    bookmarks: data => {
      try {
        createBookmarks(data);
        sendResponse({ bookmarkCreated: true });
      } catch (e) {
        sendResponse({ bookmarkCreated: false });
      }
    },
    instantiation: () => {
      chrome.tabs.query({}, tabs => {
        tabs = tabs.filter(tab => tab.url.startsWith(githubURL));
        tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, { instanceID: data.id }));
      });
    },
    reInstantiation: () => {
      const {
        tab: { id },
      } = sender;
      chrome.tabs.sendMessage(id, { reInstantiation: true });
    },
  };
  try {
    actions[action](data);
  } catch (error) {
    console.error('onMessage Error:', error);
  }
});

chrome.browserAction.onClicked.addListener(async tab => {
  const { url, id } = tab;
  const githubURL = 'https://github.com/';
  if (url.startsWith(githubURL)) {
    chrome.tabs.sendMessage(id, { mountInstance: true });
  } else {
    const url = (await $storageSync.get('GITHUB_STARS_HELPER_STARS_URL')) || githubURL;
    chrome.tabs.create({ url });
    needOpenExtension = true;
  }
});

const isStarRepo = response => {
  const { type, method, url } = response;
  const URLRegexp = /^.*github\.com\/(.*)\/star$/;
  const nameWithOwner = url.match(URLRegexp);
  return type.toLowerCase() === 'xmlhttprequest' && method.toLowerCase() === 'post' && URLRegexp.test(url) && nameWithOwner && nameWithOwner[1];
};

const isUnstarRepo = response => {
  const { type, method, url } = response;
  const URLRegexp = /^.*github\.com\/(.*)\/unstar$/;
  const nameWithOwner = url.match(URLRegexp);
  return type.toLowerCase() === 'xmlhttprequest' && method.toLowerCase() === 'post' && URLRegexp.test(url) && nameWithOwner && nameWithOwner[1];
};

const addStarToQueue = async repo => {
  const queue = (await $storageSync.get('GITHUB_STARS_HELPER_STAR_QUEUE')) || {};
  const date = +new Date();
  queue[repo.nameWithOwner] = { date, repo };
  await $storageSync.set('GITHUB_STARS_HELPER_STAR_QUEUE', queue);
};

const addUnstarToQueue = async nameWithOwner => {
  const queue = (await $storageSync.get('GITHUB_STARS_HELPER_UNSTAR_QUEUE')) || {};
  const date = +new Date();
  queue[nameWithOwner] = date;
  await $storageSync.set('GITHUB_STARS_HELPER_UNSTAR_QUEUE', queue);
};

chrome.webRequest.onCompleted.addListener(
  async response => {
    const accessToken = await $storageSync.get('GITHUB_STARS_HELPER_ACCESS_TOKEN');
    if (!accessToken) return;

    const { tabId } = response;
    let nameWithOwner;
    if ((nameWithOwner = isStarRepo(response))) {
      if (accessToken) {
        const {
          data: { repository },
        } = await getRepo(nameWithOwner, accessToken);
        await addStarToQueue(repository);
        chrome.tabs.sendMessage(id, { starRepoInOtherPage: repository });
      }
      return;
    }
    if ((nameWithOwner = isUnstarRepo(response))) {
      await addUnstarToQueue(nameWithOwner);
      chrome.tabs.sendMessage(id, { unstarRepoInOtherPage: repository });
      return;
    }
  },
  { urls: ['<all_urls>'] },
);
