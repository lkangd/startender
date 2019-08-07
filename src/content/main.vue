<template>
  <div class="stars-helper-wrapper">
    <div
      :class="{ 'stars-helper--open': $store.state.dom.showPanel }"
      :style="`width: ${$store.state.dom.sidebarWidth}px`"
      class="stars-helper"
      id="stars-helper"
    >
      <toggle />
      <authorize />
      <resize-handler />
      <header-bar />
      <tag-bar />
      <group-list />
    </div>
    <repo v-if="$store.state.dom.showRepoEdit" />
    <tag-manage v-if="$store.state.dom.showTagManage" />
    <filter-menu v-if="$store.state.dom.showFilterMenu" />
    <group-manage v-if="$store.state.dom.showGroupManage" />
    <setting-menu v-if="$store.state.dom.showSettingMenu" />
  </div>
</template>

<script>
/* eslint-disable no-console */
import Authorize from './components/authorize';
import Toggle from './components/toggle';
import HeaderBar from './components/header-bar';
import Repos from './components/repos';
import GroupManage from './components/group-manage';
import GroupList from './components/group-list';
import TagManage from './components/tag-manage';
import TagBar from './components/tag-bar';
import Repo from './components/repo';
import FilterMenu from './components/filter-menu';
import SettingMenu from './components/setting-menu';
import ResizeHandler from './components/resize-handler';

import { getStarredRepos } from '@/github/api-v4';

const hideGlobalScrollBar = () => $('body').addClass('stars-helper-hide-scroll-bar');

export default {
  name: 'stars-helper',
  mounted() {
    hideGlobalScrollBar();
    if (localStorage.getItem('stars_helper.starred_repos')) {
      this.$toast('使用缓存列表数据');
      const starredRepos = JSON.parse(localStorage.getItem('stars_helper.starred_repos'));
      const languagesCount = JSON.parse(localStorage.getItem('stars_helper.languages_count'));
      this.$store.commit('updateStarredReposOrigin', { starredRepos, languagesCount, cache: true });
      this.$store.commit('filterStarredRepos');
    } else {
      getStarredRepos().then(starredRepos => {
        this.$store.commit('updateStarredReposOrigin', starredRepos);
        this.$store.commit('filterStarredRepos');
      });
    }
    this.$store.dispatch('tag/UPDATE_BARS');
    this.$store.dispatch('group/UPDATE_BARS');
  },
  components: {
    Authorize,
    Toggle,
    HeaderBar,
    Repos,
    GroupManage,
    GroupList,
    TagManage,
    TagBar,
    Repo,
    FilterMenu,
    SettingMenu,
    ResizeHandler,
  },
};
</script>

<style scoped lang="less">
#stars-helper {
  @side-padding: 16px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 98;
  background-color: #fff;
  box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
  transform: translate3d(100%, 0, 0);
  transition: transform 0.3s;
  &.stars-helper--open {
    transform: translate3d(0, 0, 0);
  }
}
</style>