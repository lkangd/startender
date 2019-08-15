import { cloneDeep } from 'lodash';

const store = {
  namespaced: true,
  state: {
    controller: null,
    affectedRepo: '',
    isInstalled: false,
  },
  getters: {
    store: state => state.controller.store,
  },
  mutations: {
    RESET_STATE(state) {
      Object.assign(state, originState);
    },
  },
  actions: {
    async INSTALL_CONTROLLER({ commit, state }, controller) {
      if (state.isInstalled) return;

      await controller.init();
      state.controller = controller;
      state.isInstalled = true;
    },
    ADD({ state }, remark) {
      state.controller.add(remark);
    },
    UPDATE({ dispatch, state }, remark) {
      state.controller.update(remark);
      dispatch('UPDATE_AFFECTED_REPO', remark.id);
    },
    DELETE({ state }, id) {
      state.controller.delete(id);
    },
    async REVERT_STORE({ state }, store) {
      await state.controller.revertStore(store);
    },
    UPDATE_AFFECTED_REPO({ state }, id) {
      state.affectedRepo = id;
      setTimeout(() => {
        state.affectedRepo = '';
      }, 0);
    },
  },
};

const originState = cloneDeep(store.state);

export default store;
