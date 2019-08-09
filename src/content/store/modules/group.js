const UN_GROUPED_ID = Symbol('UN_GROUPED_ID');
const ALL_GROUPED_ID = Symbol('ALL_GROUPED_ID');

export default {
  namespaced: true,
  state: {
    bars: [],
    controller: null,
    isInstalled: false,
    UN_GROUPED_ID,
    ALL_GROUPED_ID,
  },
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
    async REVERT_STORE({ state }, store) {
      await state.controller.revertStore(store);
    },
    UPDATE_BARS({ state, rootState }) {
      const { groups } = state.controller.store;
      const barsOpenStatus = state.bars.reduce((res, bar) => ((res[bar.id] = bar.open), res), {});
      const bars = [];
      for (const id in groups) {
        if (groups.hasOwnProperty(id)) {
          let { name, order, repos, open } = groups[id];
          // sort && filter
          repos = rootState.repo.reposID.filter(repoID => repos.includes(repoID));
          open = repos.length ? barsOpenStatus[id] : false;
          bars[order] = { id, name, repos, order, open };
        }
      }

      state.bars = bars.filter(Boolean);
      const allGroup = {
        id: ALL_GROUPED_ID,
        name: '所有',
        repos: rootState.repo.reposID,
        order: state.bars.length,
        open: barsOpenStatus[ALL_GROUPED_ID],
      };
      const unGroup = {
        id: UN_GROUPED_ID,
        name: '未分组',
        repos: rootState.repo.reposID.filter(id => !state.controller.store.repos[id]),
        order: -1,
        open: barsOpenStatus[UN_GROUPED_ID],
      };
      state.bars.push(allGroup);
      state.bars.unshift(unGroup);
    },
  },
};
