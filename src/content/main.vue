<template>
  <div class="stars-helper-wrapper">
    <div
      :class="{ open: openPanel }"
      :style="`width: ${sidebarWidth}px`"
      class="stars-helper"
      id="stars-helper"
    >
      <authorize />
      <resize-handler @resize="resizeSidebar" />
      <toggle @toggle="togglePannel" />
      <headers :value.sync="searchKey" />
      <main class="stars-helper__wrapper">
        <tags />
        <ul class="stars-helper__repos">
          <!-- 未分组 -->
          <li
            :class="{ open: unGroupOpen.open }"
            class="stars-helper__repos--item"
          >
            <div
              @click="toggleGroup(unGroupOpen)"
              class="group-bar"
            >
              <h4 class="group-bar__title">未分组({{ unGroupRepoIds.length }})</h4>
              <svg
                class="group-bar__dot"
                v-html="require('@img/group-dot.svg')"
              />
            </div>
            <repos
              :high-light-text="searchKey"
              :repoIds="unGroupRepoIds"
              v-if="unGroupOpen.open"
            />
          </li>
          <!-- 分组 -->
          <li
            :class="{ open: group.open }"
            :key="index"
            class="stars-helper__repos--item"
            v-for="(group, index) in groupsBar"
          >
            <div
              @click="toggleGroup(group)"
              class="group-bar"
            >
              <h4 class="group-bar__title">{{ group.name }}({{ group.repos.length }})</h4>
              <svg
                class="group-bar__dot"
                v-html="require('@img/group-dot.svg')"
              />
            </div>
            <repos
              :high-light-text="searchKey"
              :repoIds="group.repos"
              v-if="group.open"
            />
          </li>
          <!-- 所有 -->
          <li
            :class="{ open: allGroupOpen.open }"
            class="stars-helper__repos--item"
          >
            <div
              @click="toggleGroup(allGroupOpen)"
              class="group-bar"
            >
              <h4 class="group-bar__title">所有({{ starredRepoIds.length }})</h4>
              <svg
                class="group-bar__dot"
                v-html="require('@img/group-dot.svg')"
              />
            </div>
            <repos
              :high-light-text="searchKey"
              :repoIds="starredRepoIds"
              v-if="allGroupOpen.open"
            />
          </li>
        </ul>
      </main>
    </div>
    <group v-if="showGroupEdit" />
    <tag-manage v-if="showTagManage" />
    <repo v-if="showRepoEdit" />
    <sort-menu v-if="showFilterMenu" />
    <setting-menu v-if="showSettingMenu" />
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import { debounce } from 'lodash';

import Authorize from './components/authorize';
import Toggle from './components/toggle';
import Headers from './components/headers';
import Tags from './components/tags';
import Repos from './components/repos';
import Group from './components/group';
import TagManage from './components/tag-manage';
import Repo from './components/repo';
import SortMenu from './components/sort-menu';
import SettingMenu from './components/setting-menu';
import ResizeHandler from './components/resize-handler';

import { getAccessCode, isStarsTab } from '@/github/utils';
import { getStarredRepos } from '@/github/api-v4';

const SIDEBAR_MIN_WIDTH = 400;
const TOGGLE_BTN_WIDTH = 30;
const saveSidebarWidth = debounce(function(width) {
  localStorage.setItem('stars_helper.sidebar_width', width);
}, 300);
const hideGlobalScrollBar = () => $('body').addClass('stars-helper-hide-scroll-bar');

export default {
  name: 'stars-helper',
  data() {
    return {
      searchKey: '',
      openPanel: true,
      allGroupOpen: { open: false },
      unGroupOpen: { open: false },
      currentOpenGroupId: '',
      toastIndex: 0,
      sidebarWidth: SIDEBAR_MIN_WIDTH,
    };
  },
  watch: {
    searchKey(newVal) {
      if (!newVal || !newVal.trim().length) {
        this.$filters.setSearchFilter(false);
      } else {
        this.$filters.setSearchFilter(true, newVal.trim());
      }
      this.$store.commit('filterStarredRepos');
      this.$store.commit('updateUnGroupRepoIds', this.$groups.store.repos);
      this.$store.commit('updateGroupsBar', this.$groups.store.groups);
    },
  },
  computed: {
    ...mapState([
      'groupsBar',
      'unGroupRepoIds',
      'starredRepos',
      'starredRepoIds',
      'showGroupEdit',
      'showTagManage',
      'showRepoEdit',
      'showFilterMenu',
      'showSettingMenu',
    ]),
  },
  mounted() {
    hideGlobalScrollBar();
    this.sidebarWidth = localStorage.getItem('stars_helper.sidebar_width') || SIDEBAR_MIN_WIDTH;
    if (localStorage.getItem('stars_helper.starred_repos')) {
      const starredRepos = JSON.parse(localStorage.getItem('stars_helper.starred_repos'));
      const languagesCount = JSON.parse(localStorage.getItem('stars_helper.languages_count'));
      this.$store.commit('updateStarredReposOrigin', { starredRepos, languagesCount, cache: true });
      this.$store.commit('filterStarredRepos');
      this.$store.commit('updateUnGroupRepoIds', this.$groups.store.repos);
    } else {
      const loading = this.$loading({ mountPoint: '#stars-helper' });
      getStarredRepos()
        .then(starredRepos => {
          this.$store.commit('updateStarredReposOrigin', starredRepos);
          this.$store.commit('filterStarredRepos');
          this.$store.commit('updateUnGroupRepoIds', this.$groups.store.repos);
        })
        .finally(() => loading.close());
    }
    this.$store.commit('updateTagsBar', this.$tags.store.tags);
    this.$store.commit('updateGroupsBar', this.$groups.store.groups);
  },
  methods: {
    resizeSidebar(offsetX) {
      const newWidth = +this.sidebarWidth + offsetX;
      if (newWidth + TOGGLE_BTN_WIDTH > document.documentElement.clientWidth) {
        return;
      }
      this.sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, newWidth);
      saveSidebarWidth(this.sidebarWidth);
    },
    togglePannel(bool) {
      this.openPanel = bool;
    },
    toggleGroup(group) {
      this.$set(group, 'open', !group.open);
    },
  },
  components: {
    Authorize,
    Toggle,
    Headers,
    Tags,
    Repos,
    Group,
    TagManage,
    Repo,
    SortMenu,
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
  // width: 400px;
  background-color: #fff;
  box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
  transform: translate3d(100%, 0, 0);
  transition: transform 0.3s;
  &.open {
    transform: translate3d(0, 0, 0);
  }
  .stars-helper {
    &__wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-left: 1px solid #e1e4e8;
    }
    &__repos {
      flex: 1;
      overflow: scroll;
      scroll-behavior: smooth;
      &--item {
        &.open {
          .group-bar {
            position: sticky;
            top: 0;
            z-index: 99;
            &__dot {
              transform: rotateZ(90deg);
            }
          }
        }
        .group-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 @side-padding;
          height: 34px;
          background-color: #eff3f6;
          background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
          border-bottom: 1px solid #d1d5db;
          cursor: pointer;
          user-select: none;
          &:hover {
            background-color: #e6ebf1;
            background-image: linear-gradient(-180deg, #f0f3f6, #e6ebf1 90%);
            background-position: -0.5em;
          }
          &__title {
            flex: 1;
            font-size: 12px;
            font-weight: bold;
            color: #24292e;
          }
          &__menu {
            margin-right: 10px;
            width: 14px;
            height: 14px;
          }
          &__dot {
            width: 4px;
            height: 7px;
          }
        }
      }
    }
  }
}
</style>