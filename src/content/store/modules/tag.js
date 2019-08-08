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
    ADD({ state }, tag) {
      state.controller.add(tag);
    },
    UPDATE({ state }, tag) {
      state.controller.update(tag);
    },
    DELETE({ state }, id) {
      state.controller.delete(id);
    },
    UPDATE_REPO({ state }, repo) {
      state.controller.updateRepo(repo);
    },
    async REVERT_STORE({ state }, store) {
      await state.controller.revertStore(store);
    },
    UPDATE_BARS({ state }) {
      const { tags } = state.controller.store;
      state.bars = [];
      for (const id in tags) {
        if (tags.hasOwnProperty(id)) {
          const { name, repos } = tags[id];
          state.bars.push({ id, name, repos });
        }
      }
      state.bars.sort((a, b) => {
        if (b.repos.length === a.repos.length) {
          return a.name.localeCompare(b.name);
        } else {
          return b.repos.length - a.repos.length;
        }
      });
    },
  },
};
