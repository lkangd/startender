import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    starredReposOrigin: [],
    starredRepos: [],
    starredRepoIds: [],
    unGroupRepoIds: [],
    repoEdit: {},
    tagsBar: [],
    groupsBar: [],
    showRepoEdit: false,
    showFilterMenu: false,
    showGroupEdit: false,
    showTagManage: false,
    showSettingMenu: false,
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
      state.languages[repo.primaryLanguage.name]--;
      localStorage.setItem('stars_helper.starred_repos', JSON.stringify(state.starredReposOrigin));
      localStorage.setItem('stars_helper.languages_count', JSON.stringify(state.languages));
    },
    updateAccessToken(state, token) {
      state.accessToken = token;
    },
    updateStarredReposOrigin(state, repos) {
      if (repos.cache) {
        state.starredReposOrigin = Object.freeze(repos.starredRepos);
        state.languages = repos.languagesCount;
        return;
      }
      const starredReposOrigin = [];
      state.languages = {};
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i].node;
        // repo.cursor = repos[i].cursor;
        repo.starredAt = repos[i].starredAt;
        repo.repoIndex = i;
        starredReposOrigin.push(repo);
        if (!repo.primaryLanguage) continue;
        if (state.languages[repo.primaryLanguage.name]) {
          state.languages[repo.primaryLanguage.name]++;
        } else {
          state.languages[repo.primaryLanguage.name] = 1;
        }
      }
      state.starredReposOrigin = Object.freeze(starredReposOrigin);
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
    updateUnGroupRepoIds(state, groupedRepos) {
      state.unGroupRepoIds = state.starredRepoIds.filter(id => !groupedRepos[id]);
    },
    setRepoEdit(state, repo) {
      state.repoEdit = repo;
    },
    toggleRepoEdit(state, status) {
      state.showRepoEdit = !!status;
    },
    toggleTagManage(state, status) {
      state.showTagManage = !!status;
    },
    toggleGroupEdit(state, status) {
      state.showGroupEdit = !!status;
    },
    toggleFilterMenu(state, status) {
      state.showFilterMenu = !!status;
    },
    toggleSettingMenu(state, status) {
      state.showSettingMenu = !!status;
    },
    updateFilteredTagId(state, tagId) {
      state.filtedTagId = tagId;
    },
    updateTagsBar(state, tags) {
      state.tagsBar = [];
      for (const key in tags) {
        if (tags.hasOwnProperty(key)) {
          const tag = tags[key];
          state.tagsBar.push({ id: key, name: tag.name, repos: tag.repos });
        }
      }
      state.tagsBar.sort((a, b) => {
        if (b.repos.length === a.repos.length) {
          return a.name.localeCompare(b.name);
        } else {
          return b.repos.length - a.repos.length;
        }
      });
    },
    updateGroupsBar(state, groups) {
      const groupsBarOpenStatus = state.groupsBar.reduce((res, group) => ((res[group.id] = group.open), res), {});
      state.groupsBar = [];
      for (const key in groups) {
        if (groups.hasOwnProperty(key)) {
          let { name, order, repos, open } = groups[key];
          repos = state.starredRepoIds.filter(repoId => repos.includes(repoId));
          open = repos.length ? groupsBarOpenStatus[key] : false;
          state.groupsBar[order] = { id: key, name, repos, order, open };
        }
      }
      state.groupsBar = state.groupsBar.filter(Boolean);
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
