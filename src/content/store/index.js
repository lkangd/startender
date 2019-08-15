import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep } from 'lodash';

import dom from './modules/dom';
import tag from './modules/tag';
import repo from './modules/repo';
import group from './modules/group';
import remark from './modules/remark';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    dom,
    tag,
    repo,
    group,
    remark,
  },
  state: {
    accessToken: '',
  },
  mutations: {
    UPDATE_ACCESS_TOKEN(state, token) {
      state.accessToken = token;
    },
  },
  actions: {
    RESET_STATE({ state, commit }) {
      Object.assign(state, originState);
      commit('dom/RESET_STATE');
      commit('tag/RESET_STATE');
      commit('group/RESET_STATE');
      commit('remark/RESET_STATE');
    },
  },
});

const originState = cloneDeep(store.state);

export default store;
