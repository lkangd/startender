import { getStarredRepos } from '@/github/api-v4';
import deepFreeze from '@/utils/deep-freeze';

export default {
  namespaced: true,
  state: {
    repoEdit: null,
    reposID: [],
    reposBase: [],
    reposFiltered: {},
    reposLanguage: [],

    controller: null,
    sortedMethod: '',
    filteredLanguage: '',
  },
  mutations: {
    UPDATE_REPO_EDIT(state, repo) {
      state.repoEdit = repo;
    },
  },
  actions: {
    FILTER_REPOS({ state, dispatch }) {
      const repos = state.controller.run(state.reposBase);

      state.reposFiltered = {};
      state.reposID = [];
      for (let i = 0, repo; (repo = repos[i++]); ) {
        state.reposFiltered[repo.id] = repo;
        state.reposID.push(repo.id);
      }
      dispatch('tag/UPDATE_BARS', null, { root: true });
      dispatch('group/UPDATE_BARS', state.reposID, { root: true });
    },
    UNSTAR_REPO({ state, dispatch }, repo) {
      state.reposBase.splice(repo.repoIndex, 1);
      state.reposLanguage[repo.primaryLanguage] && state.reposLanguage[repo.primaryLanguage.name]--;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
      dispatch('FILTER_REPOS');
    },
    SET_SORTER({ state, dispatch }, sortedMethod) {
      state.controller.setSorter(sortedMethod);
      state.sortedMethod = sortedMethod;
      dispatch('FILTER_REPOS');
    },
    SET_FILTER_LANGUAGE({ state, dispatch }, language) {
      state.controller.setLanguage(language);
      state.filteredLanguage = language;
      dispatch('FILTER_REPOS');
    },
    SET_FILTER_SEARCH({ state, commit, dispatch }, search) {
      state.controller.setSearch(search);
      dispatch('FILTER_REPOS');
      commit('dom/UPDATE_HEIGHT_TEXT', search, { root: true });
    },
    SET_FILTER_TAG({ state, dispatch, commit }, tagID) {
      state.controller.setTag(tagID);
      dispatch('FILTER_REPOS');
      commit('tag/UPDATE_FILTERED_TAG_ID', tagID, { root: true });
    },
    async INSTALL_CONTROLLER({ state, rootState }, controller) {
      if (state.isInstalled) return;

      await controller.init({
        tags: rootState.tag.controller,
        groups: rootState.group.controller,
        remarks: rootState.remark.controller,
      });
      state.controller = controller;
      state.isInstalled = true;
    },
    async UPDATE_REPOS_BASE({ state, dispatch }, useCache = true) {
      if (useCache) {
        const reposBase = JSON.parse(localStorage.getItem('stars_helper.starred_repos'));
        const reposLanguage = JSON.parse(localStorage.getItem('stars_helper.languages_count'));
        if (reposBase && reposLanguage) {
          state.reposBase = deepFreeze(reposBase, false);
          state.reposLanguage = reposLanguage;
          dispatch('FILTER_REPOS');
          return;
        }
      }

      const repos = await getStarredRepos();
      const reposBase = [];
      state.reposLanguage = {};
      for (let i = 0, repo; (repo = repos[i]); ) {
        repo = repo.node;
        repo.repoIndex = i++;
        reposBase.push(Object.freeze(repo));
        if (!repo.primaryLanguage) continue;
        if (state.reposLanguage[repo.primaryLanguage.name]) {
          state.reposLanguage[repo.primaryLanguage.name]++;
        } else {
          state.reposLanguage[repo.primaryLanguage.name] = 1;
        }
      }
      state.reposBase = reposBase;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
      dispatch('FILTER_REPOS');
    },
  },
};
