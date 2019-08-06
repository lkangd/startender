import Vue from 'vue';
import Vuex from 'vuex';

import domModule from './modules/dom';
import groupModule from './modules/group';
import tagModule from './modules/tag';
import remarkModule from './modules/remark';

import deepFreeze from '@/utils/deep-freeze';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    dom: domModule,
    group: groupModule,
    tag: tagModule,
    remark: remarkModule,
  },
  state: {
    starredReposOrigin: [],
    starredRepos: [],
    starredRepoIds: [],
    unGroupRepoIds: [],
    repoEdit: {},
    filtedTagId: Infinity,
    accessToken: '',
    filterController: {},
    languages: [],
    filterLanguage: '',
    sortingWay: 0,
  },
  getters: {},
  mutations: {
    unstarRepo(state, repo) {
      state.starredReposOrigin.splice(repo.repoIndex, 1);
      state.languages[repo.primaryLanguage] && state.languages[repo.primaryLanguage.name]--;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.starredReposOrigin));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.languages));
    },
    updateAccessToken(state, token) {
      state.accessToken = token;
    },
    updateStarredReposOrigin(state, repos) {
      if (repos.cache) {
        state.starredReposOrigin = deepFreeze(repos.starredRepos, false);
        state.languages = repos.languagesCount;
        return;
      }
      const starredReposOrigin = [];
      state.languages = {};
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i].node;
        repo.starredAt = repos[i].starredAt;
        repo.repoIndex = i;
        starredReposOrigin.push(Object.freeze(repo));
        if (!repo.primaryLanguage) continue;
        if (state.languages[repo.primaryLanguage.name]) {
          state.languages[repo.primaryLanguage.name]++;
        } else {
          state.languages[repo.primaryLanguage.name] = 1;
        }
      }
      state.starredReposOrigin = starredReposOrigin;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.starredReposOrigin));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.languages));
    },
    filterStarredRepos(state) {
      let repos = state.starredReposOrigin.slice();
      repos = state.filterController.currentSorter(repos);

      for (const key in state.filterController.currentFilter) {
        if (state.filterController.currentFilter.hasOwnProperty(key)) {
          const filter = state.filterController.currentFilter[key];
          repos = filter(repos);
        }
      }

      state.starredRepos = {};
      state.starredRepoIds = [];
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        state.starredRepos[repo.id] = repo;
        state.starredRepoIds.push(String(repo.id));
      }
    },
    updateUnGroupRepoIds(state) {
      state.unGroupRepoIds = state.starredRepoIds.filter(id => !state.group.controller.store.repos[id]);
    },
    setRepoEdit(state, repo) {
      state.repoEdit = repo;
    },
    updateFilteredTagId(state, tagId) {
      state.filtedTagId = tagId;
    },
    installFilterController(state, controller) {
      state.filterController = controller;
    },
    changeSortingWay(state, id) {
      state.sortingWay = id;
    },
    changeFilterLanguage(state, key) {
      state.filterLanguage = key;
    },
  },
  actions: {},
});
