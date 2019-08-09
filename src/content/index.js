import Vue from 'vue';
import Main from './main';
import store from './store';

import '@/assets/less';
import $storageSync from '@/utils/storage-sync';
import { getAccessToken } from '@/github/api-v3';
import { isStarsTab, saveStarsTabUrl } from '@/github/utils';

import TagController from '@/controller/tag';
import GroupController from '@/controller/group';
import RemarkController from '@/controller/remark';
import FilterController from '@/controller/filter';

import { highlight } from '@/utils/vue-directives';
import Toast from '@/content/components/toast/index';
import Loading from '@/content/components/loading/index';
import { formatUpdate, formatNumber } from '@/utils/vue-filters';

Vue.directive('highlight', highlight);
Vue.filter('formatUpdate', formatUpdate);
Vue.filter('formatNumber', formatNumber);
Vue.use(Toast, { mountPoint: '#stars-helper' });
Vue.use(Loading, { mountPoint: '#stars-helper' });

let app = null;
const id = 'stars-helper';
const instantiation = async () => {
  if (app) {
    if (app._isMounted === false) {
      app.$mount(`#${id}`);
    } else {
      store.commit('dom/OPEN_PANEL');
    }
    return;
  }
  // placeholder
  app = {};

  const accessToken = await $storageSync.get('GITHUB_STARS_HELPER_ACCESS_TOKEN');
  store.commit('UPDATE_ACCESS_TOKEN', accessToken);

  await Promise.all([
    store.dispatch('tag/INSTALL_CONTROLLER', new TagController()),
    store.dispatch('group/INSTALL_CONTROLLER', new GroupController()),
    store.dispatch('remark/INSTALL_CONTROLLER', new RemarkController()),
  ]);
  store.dispatch('repo/INSTALL_CONTROLLER', new FilterController());

  if (!$(`#${id}`).length) {
    $(`<div id="${id}"></div>`).appendTo($('body'));
  }
  setTimeout(() => {
    app = new Vue({ store, render: h => h(Main) });
    app.$mount(`#${id}`);
  }, 0);
};
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.accessCode) {
    const accessToken = await getAccessToken(request.accessCode);
    $storageSync.set('GITHUB_STARS_HELPER_ACCESS_TOKEN', accessToken);
    window.location.replace(localStorage.getItem('stars_helper.stars_tab_url'));
  }
  if (request.mountInstance) {
    instantiation();
  }
});

// save user stars tab url to localStorage, after authrized jump to this url
saveStarsTabUrl();
// only init views in stars page
isStarsTab() && instantiation();
