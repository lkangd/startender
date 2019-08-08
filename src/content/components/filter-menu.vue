<template>
  <div
    @click.self="$store.commit('dom/CLOSE_FILTER_MENU')"
    class="filter-menu"
  >
    <div class="filter-menu__panel">
      <ul>
        <li class="filter-menu__title">Sort</li>
        <li
          :class="{ 'filter-menu__item--active': sortedMethod == item.sortedMethod }"
          :key="index"
          @click="changeSortedMethod(item)"
          class="filter-menu__item"
          v-for="(item, index) in sortWays"
        >{{ item.text }}</li>
        <li class="filter-menu__title">Languages</li>
        <li
          :class="{ 'filter-menu__item--active': filteredLanguage === '' }"
          @click="changeLanguage('')"
          class="filter-menu__item"
        >所有</li>
        <li
          :class="{ 'filter-menu__item--active': filteredLanguage === language }"
          :key="language"
          @click="changeLanguage(language)"
          class="filter-menu__item"
          v-for="(count, language) in reposLanguage"
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
          text: '最近标记',
          sortedMethod: '',
        },
        {
          text: '最近活动',
          sortedMethod: 'pushedAt',
        },
        {
          text: '最多标记',
          sortedMethod: 'totalCount',
        },
        {
          text: '作者名正序',
          sortedMethod: 'nameWithOwner',
        },
        {
          text: '仓库名正序',
          sortedMethod: 'name',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      reposLanguage: state => state.repo.reposLanguage,
      filteredLanguage: state => state.repo.filteredLanguage,
      sortedMethod: state => state.repo.sortedMethod,
    }),
  },
  methods: {
    changeSortedMethod({ sortedMethod }) {
      this.$store.dispatch('repo/SET_SORTER', sortedMethod);
      this.$store.commit('dom/CLOSE_FILTER_MENU');
    },
    changeLanguage(language) {
      this.$store.dispatch('repo/SET_FILTER_LANGUAGE', language);
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