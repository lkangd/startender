import { cloneDeep } from 'lodash';

const UN_TAGED_ID = Symbol('UN_TAGED_ID');
const ALL_TAGED_ID = Symbol('ALL_TAGED_ID');

const store = {
  namespaced: true,
  state: {
    bars: [],
    controller: null,
    isInstalled: false,
    filteredTagID: ALL_TAGED_ID,
    UN_TAGED_ID,
    ALL_TAGED_ID,
  },
  mutations: {
    UPDATE_FILTERED_TAG_ID(state, tagID) {
      state.filteredTagID = tagID;
    },
    RESET_STATE(state) {
      Object.assign(state, originState);
    },
  },
  actions: {
    async INSTALL_CONTROLLER({ state }, controller) {
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
    UPDATE_BARS({ state, rootState }) {
      const { tags, repos } = state.controller.store;
      state.bars = [];
      for (const id in tags) {
        if (tags.hasOwnProperty(id)) {
          let { name, repos } = tags[id];
          // filter
          repos = repos.filter(repoId => rootState.repo.reposBaseID.includes(repoId) || state.controller.updateRepo({ id: repoId }));
          state.bars.push({ id, name, repos, count: repos.length });
        }
      }
      state.bars.sort((a, b) => {
        if (b.repos.length === a.repos.length) {
          return a.name.localeCompare(b.name);
        } else {
          return b.repos.length - a.repos.length;
        }
      });

      const allTagCount = rootState.repo.reposBaseID.length;
      const unTagCount = allTagCount - Object.keys(repos).length;
      const allTag = {
        id: ALL_TAGED_ID,
        name: '全部',
        count: allTagCount,
      };
      const unTag = {
        id: UN_TAGED_ID,
        name: '无标签',
        count: unTagCount,
      };
      state.bars.push(unTag);
      state.bars.unshift(allTag);
    },
  },
};

const originState = cloneDeep(store.state);

export default store;
