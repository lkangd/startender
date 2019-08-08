import deepFreeze from '@/utils/deep-freeze';

export default {
  namespaced: true,
  state: {
    repoEdit: null,
    reposID: [],
    reposBase: [],
    reposFiltered: [],
    reposLanguage: [],

    filteredTagID: Infinity,
    filteredLanguage: '',
    filterController: {},
    sorteredMethod: 0,
  },
  mutations: {
    UPDATE_REPO_EDIT(state, repo) {
      state.repoEdit = repo;
    },
    UPDATE_REPOS_BASE(state, repos) {
      if (repos.cache) {
        state.reposBase = deepFreeze(repos.reposBase, false);
        state.reposLanguage = repos.reposLanguage;
        return;
      }
      const reposBase = [];
      state.reposLanguage = {};
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i].node;
        repo.starredAt = repos[i].starredAt;
        repo.repoIndex = i;
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
    },
    UNSTAR_REPO(state, repo) {
      state.reposBase.splice(repo.repoIndex, 1);
      state.reposLanguage[repo.primaryLanguage] && state.reposLanguage[repo.primaryLanguage.name]--;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.reposBase));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.reposLanguage));
    },
    FILTER_REPOS(state) {
      let repos = state.reposBase.slice();
      repos = state.filterController.currentSorter(repos);

      for (const key in state.filterController.currentFilter) {
        if (state.filterController.currentFilter.hasOwnProperty(key)) {
          const filter = state.filterController.currentFilter[key];
          repos = filter(repos);
        }
      }

      state.reposFiltered = {};
      state.reposID = [];
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        state.reposFiltered[repo.id] = repo;
        state.reposID.push(String(repo.id));
      }
    },
    UPDATE_FILTERED_TAG_ID(state, tagId) {
      state.filteredTagID = tagId;
    },
    INSTALL_FILTER_CONTROLLER(state, controller) {
      state.filterController = controller;
    },
    UPDATE_SORTERED_METHOD(state, id) {
      state.sorteredMethod = id;
    },
    UPDATE_FILTERED_LANGUAGE(state, language) {
      state.filteredLanguage = language;
    },
  },
  actions: {},
};
