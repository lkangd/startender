import Vue from 'vue';
import Main from './main';
import store from './store';

import FilterController from '@/controller/filter';
import RemarkController from '@/controller/remark';
import GroupController from '@/controller/group';
import TagController from '@/controller/tag';

import '@/assets/less';
import $storageSync from '@/utils/storage-sync';
import { getAccessToken } from '@/github/api-v3';
import { isStarsTab, saveStarsTabUrl } from '@/github/utils';

import Toast from '@/content/components/toast/index';
import Loading from '@/content/components/loading/index';
import { formatUpdate, formatNumber } from '@/utils/vue-filters';
import { highlight } from '@/utils/vue-directives';

Vue.use(Toast, { mountPoint: '#stars-helper' });
Vue.use(Loading, { mountPoint: '#stars-helper' });
Vue.directive('highlight', highlight);
Vue.filter('formatUpdate', formatUpdate);
Vue.filter('formatNumber', formatNumber);

saveStarsTabUrl();

let app = null;
const instantiation = () => {
  const id = 'stars-helper';
  $(`<div id="${id}"></div>`).appendTo($('body'));
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
  if (request.mountInstance && !app) {
    instantiation();
  }
});

(async () => {
  const accessToken = await $storageSync.get('GITHUB_STARS_HELPER_ACCESS_TOKEN');
  store.commit('UPDATE_ACCESS_TOKEN', accessToken);

  await Promise.all([
    store.dispatch('group/INSTALL_CONTROLLER', new GroupController()),
    store.dispatch('tag/INSTALL_CONTROLLER', new TagController()),
    store.dispatch('remark/INSTALL_CONTROLLER', new RemarkController()),
  ]);

  store.dispatch('repo/INSTALL_CONTROLLER', new FilterController())

  // only init views in stars page
  isStarsTab() && instantiation();
})();
