import Vue from 'vue';
import Main from './main';
import store from './store';
import shortid from 'shortid';

import '@/assets/less';
import storage from '@/storage';
import $storageSync from '@/utils/storage-sync';
import { isStarsTab, saveStarsTabUrl } from '@/github/utils';

import TagController from '@/controller/tag';
import GroupController from '@/controller/group';
import RemarkController from '@/controller/remark';
import FilterController from '@/controller/filter';

import { highlight } from '@/utils/vue-directives';
import Popup from '@/content/components/Popup/index';
import Toast from '@/content/components/toast/index';
import Loading from '@/content/components/loading/index';
import { formatUpdate, formatNumber } from '@/utils/vue-filters';

Vue.directive('highlight', highlight);
Vue.filter('formatUpdate', formatUpdate);
Vue.filter('formatNumber', formatNumber);
Vue.use(Popup);
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

  await controllerInit();

  if (!$(`#${id}`).length) {
    $(`<div id="${id}"></div>`).appendTo($('body'));
  }
  setTimeout(() => {
    app = new Vue({ store, render: h => h(Main) });
    app.$mount(`#${id}`);
    app.$_instanceID = shortid.generate();
    chrome.runtime.sendMessage({ action: 'instantiation', data: { id: app.$_instanceID } });
  }, 0);
};

const instanceDestroy = () => {
  if (!app) return;

  app.$destroy();
  $(`.${id}-wrapper`).remove();
  app = null;
};

const controllerInit = async () => {
  await Promise.all([
    store.dispatch('tag/INSTALL_CONTROLLER', new TagController()),
    store.dispatch('group/INSTALL_CONTROLLER', new GroupController()),
    store.dispatch('remark/INSTALL_CONTROLLER', new RemarkController()),
  ]);
  await store.dispatch('repo/INSTALL_CONTROLLER', new FilterController());
};

// store.commit('SET_APP_DESTROY_FUN', instanceDestroy);
// save user stars tab url to localStorage, after authrized jump to this url
saveStarsTabUrl();
// only init views in stars page
isStarsTab() && instantiation();

chrome.runtime.onMessage.addListener(async request => {
  if (request.getAccessTokenFailed) {
    Toast.error({ text: 'Github stars helper: 授权失败, 请重试', duration: 10000 });
    instantiation();
  }
  if (request.mountInstance) {
    instantiation();
  }
  if (request.instanceID && app && request.instanceID !== app.$_instanceID) {
    instanceDestroy();
    store.dispatch('RESET_STATE');
    storage.clearState();
  }
  if (request.reInstantiation) {
    instanceDestroy();
    store.dispatch('RESET_STATE');
    storage.clearState();
    setTimeout(() => instantiation(), 0);
  }
});
