import { debounce, cloneDeep } from 'lodash';

const TOGGLE_BTN_WIDTH = 30;
const SIDEBAR_MIN_WIDTH = 400;
const saveSidebarWidth = debounce(function(width) {
  localStorage.setItem('stars_helper.sidebar_width', width);
}, 300);
const toggleGlobalScrollBar = bool => {
  const { classList } = document.querySelector('body');
  classList[(bool && 'add') || 'remove']('stars-helper-hide-scroll-bar');
};

const store = {
  namespaced: true,
  state: {
    showPanel: false,
    showRepoEdit: false,
    showTagManage: false,
    showGroupManage: false,
    showFilterMenu: false,
    showSettingMenu: false,
    sidebarWidth: localStorage.getItem('stars_helper.sidebar_width') || SIDEBAR_MIN_WIDTH,
    highlightText: '',
  },
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, originState);
    },
    UPDATE_HEIGHT_TEXT(state, text) {
      state.highlightText = text;
    },
    UPDATE_SIDEBAR_WIDTH(state, offsetX) {
      const newWidth = +state.sidebarWidth + offsetX;
      if (newWidth + TOGGLE_BTN_WIDTH > document.documentElement.clientWidth) return;

      state.sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, newWidth);
      saveSidebarWidth(state.sidebarWidth);
    },
    OPEN_PANEL(state) {
      state.showPanel = true;
      toggleGlobalScrollBar(true);
    },
    CLOSE_PANEL(state) {
      state.showPanel = false;
      toggleGlobalScrollBar(false);
    },
    OPEN_REPO_EDIT(state) {
      state.showRepoEdit = true;
    },
    CLOSE_REPO_EDIT(state) {
      state.showRepoEdit = false;
    },
    OPEN_TAG_MANAGE(state) {
      state.showTagManage = true;
    },
    CLOSE_TAG_MANAGE(state) {
      state.showTagManage = false;
    },
    OPEN_GROUP_MANAGE(state) {
      state.showGroupManage = true;
    },
    CLOSE_GROUP_MANAGE(state) {
      state.showGroupManage = false;
    },
    OPEN_FILTER_MENU(state) {
      state.showFilterMenu = true;
    },
    CLOSE_FILTER_MENU(state) {
      state.showFilterMenu = false;
    },
    OPEN_SETTING_MENU(state) {
      state.showSettingMenu = true;
    },
    CLOSE_SETTING_MENU(state) {
      state.showSettingMenu = false;
    },
  },
};

const originState = cloneDeep(store.state);

export default store;
