import Toast from '@/content/components/toast/index';
import { getStarredRepos } from '@/github/api-v4';
import deepFreeze from '@/utils/deep-freeze';
import { cloneDeep } from 'lodash';

const store = {
  namespaced: true,
  state: {
    repoEdit: null,
    reposBase: [],
    reposBaseID: [],
    reposFiltered: {},
    reposFilteredID: [],
    reposLanguage: [],

    controller: null,
    sortedMethodID: '',
    filteredLanguage: '',
  },
  mutations: {
    UPDATE_REPO_EDIT(state, repo) {
      state.repoEdit = repo;
    },
    RESET_STATE(state) {
      Object.assign(state, originState);
    },
  },
  actions: {
    FILTER_REPOS({ state, dispatch }) {
      const repos = state.controller.run(state.reposBase);

      state.reposFiltered = {};
      state.reposFilteredID = [];
      for (let i = 0, repo; (repo = repos[i++]); ) {
        state.reposFiltered[repo.id] = repo;
        state.reposFilteredID.push(repo.id);
      }
      dispatch('tag/UPDATE_BARS', null, { root: true });
      dispatch('group/UPDATE_BARS', state.reposFilteredID, { root: true });
    },
    STAR_REPO({ state, dispatch, rootState }, repo) {
      if (!rootState.accessToken) return;

      if (!Array.isArray(repo)) {
        repo = [repo];
      }
      const reposBase = repo
        .filter(r => !~state.reposBaseID.indexOf(r.id))
        .map(r => {
          state.reposBaseID.unshift(r.id);
          state.reposLanguage[r.primaryLanguage] && state.reposLanguage[r.primaryLanguage.name]++;
          return r;
        });

      state.reposBase.unshift(...reposBase);
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.starred_repos_id', JSON.stringify(state.reposBaseID));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
      dispatch('FILTER_REPOS');
    },
    UNSTAR_REPO({ state, dispatch, rootState }, repo) {
      if (!rootState.accessToken) return;

      if (!Array.isArray(repo)) {
        repo = [repo];
      }
      for (let i = 0; i < repo.length; i++) {
        const targetIndex = state.reposBase.findIndex(item => item.nameWithOwner === repo[i]);
        if (targetIndex > -1) {
          const target = state.reposBase[targetIndex];
          state.reposBase.splice(targetIndex, 1);
          state.reposBaseID.splice(targetIndex, 1);
          state.reposLanguage[target.primaryLanguage] && state.reposLanguage[target.primaryLanguage.name]--;
        }
      }
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.starred_repos_id', JSON.stringify(state.reposBaseID));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
      dispatch('FILTER_REPOS');
    },
    SET_SORTER_METHOD({ state, dispatch }, sortedMethodID) {
      state.controller.setSorter(sortedMethodID);
      state.sortedMethodID = sortedMethodID;
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
    SET_FILTER_TAG({ state, dispatch, commit, rootState }, tagID) {
      state.controller.setTag(tagID || rootState.tag.ALL_TAGED_ID);
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
        const reposBaseID = JSON.parse(localStorage.getItem('stars_helper.starred_repos_id'));
        const reposLanguage = JSON.parse(localStorage.getItem('stars_helper.languages_count'));
        if (reposBase && reposLanguage) {
          state.reposBase = deepFreeze(reposBase, false);
          state.reposBaseID = reposBaseID;
          state.reposLanguage = reposLanguage;
          dispatch('FILTER_REPOS');
          Toast({ mountPoint: '#stars-helper', text: '使用缓存列表数据' });
          return;
        }
      }

      const repos = await getStarredRepos();
      const reposBase = [];
      const reposBaseID = [];
      const reposLanguage = {};
      for (let i = 0, repo; (repo = repos[i++]); ) {
        repo = repo.node;
        reposBase.push(Object.freeze(repo));
        reposBaseID.push(repo.id);
        if (!repo.primaryLanguage) continue;
        if (reposLanguage[repo.primaryLanguage.name]) {
          reposLanguage[repo.primaryLanguage.name]++;
        } else {
          reposLanguage[repo.primaryLanguage.name] = 1;
        }
      }
      state.reposBase = reposBase;
      state.reposBaseID = reposBaseID;
      state.reposLanguage = reposLanguage;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.starred_repos_id', JSON.stringify(state.reposBaseID));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
      dispatch('FILTER_REPOS');
      return reposBase;
    },
  },
};

const originState = cloneDeep(store.state);

export default store;
