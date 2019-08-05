import '@/assets/less';
import { isStarsTab, saveStarsTabUrl } from '@/github/utils';
import { getAccessToken } from '@/github/api-v3';
import $storageSync from '@/utils/storage-sync';

import { highLight } from '@/utils/vue-directives';
import { formatUpdate, formatNumber } from '@/utils/vue-filters';

import FilterController from '../controller/filter';
import GroupController from '../controller/group';
import RemarkController from '../controller/remark';
import TagController from '../controller/tag';

import store from './store';

import Vue from 'vue';
import Main from './main';

import Loading from '@/content/components/loading/index';
import Toast from '@/content/components/toast/index';
Vue.use(Loading, { mountPoint: '#stars-helper' });
Vue.use(Toast, { mountPoint: '#stars-helper' });

Vue.directive('high-light', highLight);
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
  const GITHUB_STARS_HELPER_ACCESS_TOKEN = await $storageSync.get('GITHUB_STARS_HELPER_ACCESS_TOKEN');
  store.commit('updateAccessToken', GITHUB_STARS_HELPER_ACCESS_TOKEN);

  const groups = new GroupController();
  const tags = new TagController();
  const remarks = new RemarkController();

  await Promise.all([groups.init(), tags.init(), remarks.init()]);

  const filters = new FilterController(groups, tags, remarks);

  Vue.prototype.$groups = groups;
  Vue.prototype.$tags = tags;
  Vue.prototype.$remarks = remarks;
  Vue.prototype.$filters = filters;
  store.commit('installFilterController', filters);

  // only init views in stars page
  isStarsTab() && instantiation();
})();
