export default {
  namespaced: true,
  state: {
    showPanel: true,
    showRepoEdit: false,
    showTagManage: false,
    showGroupManage: false,
    showFilterMenu: false,
    showSettingMenu: false,
  },
  mutations: {
    OPEN_PANEL(state) {
      state.showPanel = true;
    },
    CLOSE_PANEL(state) {
      state.showPanel = false;
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
