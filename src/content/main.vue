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
import FilterMenu from './components/filter-menu';
import GroupList from './components/group-list';
import GroupManage from './components/group-manage';
import HeaderBar from './components/header-bar';
import Repo from './components/repo';
import ResizeHandler from './components/resize-handler';
import SettingMenu from './components/setting-menu';
import TagBar from './components/tag-bar';
import TagManage from './components/tag-manage';
import Toggle from './components/toggle';

export default {
  name: 'stars-helper',
  mounted() {
    this.$store.commit('dom/OPEN_PANEL');
    this.$store.dispatch('repo/UPDATE_REPOS_BASE');
  },
  components: {
    Authorize,
    FilterMenu,
    GroupList,
    GroupManage,
    HeaderBar,
    Repo,
    ResizeHandler,
    SettingMenu,
    TagBar,
    TagManage,
    Toggle,
  },
};
</script>

<style scoped lang="less">
#stars-helper {
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