<template>
  <div
    @click.self="$store.commit('dom/CLOSE_FILTER_MENU')"
    class="filter-menu"
  >
    <div class="filter-menu__panel">
      <ul>
        <li class="filter-menu__title">Sort</li>
        <li
          :class="{ 'filter-menu__item--active': sortingWay === item.id }"
          :key="item.id"
          @click="changeSortingWay(item)"
          class="filter-menu__item"
          v-for="item in sortWays"
        >{{ item.text }}</li>
        <li class="filter-menu__title">Languages</li>
        <li
          :class="{ 'filter-menu__item--active': filterLanguage === '' }"
          @click="changeLanguages('')"
          class="filter-menu__item"
        >所有</li>
        <li
          :class="{ 'filter-menu__item--active': filterLanguage === language }"
          :key="language"
          @click="changeLanguages(language)"
          class="filter-menu__item"
          v-for="(count, language) in languages"
        >{{ `${language} (${count})` }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';

export default {
  name: 'filter-menu',
  data() {
    return {
      sortWays: [
        {
          id: 0,
          text: '最近标记',
          filterName: '',
        },
        {
          id: 1,
          text: '最近活动',
          filterName: 'sortByUpdate',
        },
        {
          id: 2,
          text: '最多标记',
          filterName: 'sortByStars',
        },
        {
          id: 3,
          text: '作者名正序',
          filterName: 'sortByOwnerName',
        },
        {
          id: 4,
          text: '仓库名正序',
          filterName: 'sortByRepoName',
        },
      ],
    };
  },
  computed: {
    ...mapState(['languages', 'filterLanguage', 'sortingWay']),
  },
  methods: {
    changeSortingWay(item) {
      this.$filters.setSorter(item.filterName);
      this.$store.commit('changeSortingWay', item.id);
      this.$store.commit('filterStarredRepos');
      this.$store.dispatch('group/UPDATE_BARS');
      this.$store.commit('dom/CLOSE_FILTER_MENU');
    },
    changeLanguages(key) {
      if (key) {
        this.$filters.setLanguageFilter(true, key);
      } else {
        this.$filters.setLanguageFilter(false);
      }
      this.$store.commit('changeFilterLanguage', key);
      this.$store.commit('filterStarredRepos');
      this.$store.dispatch('group/UPDATE_BARS');
      this.$store.commit('dom/CLOSE_FILTER_MENU');
    },
  },
};
</script>

<style scoped lang="less">
.filter-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: transparent;
  &__panel {
    position: absolute;
    top: 54px;
    right: 20px;
    z-index: 300;
    padding: 6px 16px 8px;
    width: 150px;
    background-color: #fff;
    border: 1px solid #d1d5da;
    border-radius: 3px;
    box-shadow: 0 1px 15px rgba(27, 31, 35, 0.15);
    &::before {
      content: '';
      display: inline-block;
      position: absolute;
      top: -16px;
      left: auto;
      right: 20px;
      margin-left: 0;
      border: 8px solid transparent;
      border-bottom-color: rgba(27, 31, 35, 0.15);
    }
    &::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: -14px;
      left: auto;
      right: 21px;
      margin-left: 0;
      border: 7px solid transparent;
      border-bottom-color: #fff;
    }
    ul {
      max-height: 580px;
      overflow-y: scroll;
      scroll-behavior: smooth;
    }
  }
  &__title {
    margin: 10px 0;
    font-size: 13px;
    font-weight: bold;
    color: #24292e;
  }
  &__item {
    padding-left: 5px;
    font-size: 13px;
    line-height: 2;
    color: #586069;
    border-radius: 3px;
    cursor: pointer;
    &--active {
      color: #fff;
      background-color: #0366d6 !important;
    }
    &:hover {
      background-color: #eaecef;
    }
  }
}
</style>