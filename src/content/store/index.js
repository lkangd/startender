import Vue from 'vue';
import Vuex from 'vuex';

import dom from './modules/dom';
import tag from './modules/tag';
import repo from './modules/repo';
import group from './modules/group';
import remark from './modules/remark';

Vue.use(Vuex);

export default new Vuex.Store({
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
});
