export default {
  namespaced: true,
  state: {
    controller: null,
    isInstalled: false,
    bars: [],
  },
  mutations: {},
  actions: {
    async INSTALL_CONTROLLER({ commit, state }, controller) {
      if (state.isInstalled) return;

      await controller.init();
      state.controller = controller;
      state.isInstalled = true;
    },
    ADD({ state }, group) {
      state.controller.add(group);
    },
    UPDATE({ state }, group) {
      state.controller.update(group);
    },
    DELETE({ state }, id) {
      state.controller.delete(id);
    },
    UPDATE_REPO({ state }, repo) {
      state.controller.updateRepo(repo);
    },
    async REVERT_STORE({ dispatch, commit, getters, rootState, state }, store) {
      await state.controller.revertStore(store);
    },
    UPDATE_BARS({ dispatch, commit, getters, rootState, state }) {
      const { groups } = state.controller.store;
      const barsOpenStatus = state.bars.reduce((res, bar) => ((res[bar.id] = bar.open), res), {});
      state.bars = [];
      for (const key in groups) {
        if (groups.hasOwnProperty(key)) {
          let { name, order, repos, open } = groups[key];
          repos = rootState.starredRepoIds.filter(repoId => repos.includes(repoId));
          open = repos.length ? barsOpenStatus[key] : false;
          state.bars[order] = { id: key, name, repos, order, open };
        }
      }
      state.bars = state.bars.filter(Boolean);
    },
  },
};
