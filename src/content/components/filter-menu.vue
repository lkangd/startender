<template>
  <div
    @click.self="$store.commit('dom/CLOSE_FILTER_MENU')"
    class="filter-menu"
  >
    <div class="filter-menu__panel">
      <ul>
        <li
          @click="clear"
          class="filter-menu__item filter-menu__item--clear"
          v-if="showClear"
        >
          <svg v-html="require('@img/close-con.svg')" />
          <span>清除过滤排序</span>
        </li>
        <li class="filter-menu__title">Sort</li>
        <li
          :class="{ 'filter-menu__item--active': sortedMethodID == item.id }"
          :key="index"
          @click="changeSortedMethod(item)"
          class="filter-menu__item"
          v-for="(item, index) in sorterMethods"
        >{{ item.name }}</li>
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
      showClear: false,
    };
  },
  created() {
    this.showClear = !!(this.sortedMethodID || this.filteredLanguage);
  },
  computed: {
    ...mapState({
      reposLanguage: state => state.repo.reposLanguage,
      filteredLanguage: state => state.repo.filteredLanguage,
      sortedMethodID: state => state.repo.sortedMethodID,
      sorterMethods: state => state.repo.controller.sorterMethods,
    }),
  },
  methods: {
    changeSortedMethod({ id }) {
      this.$store.dispatch('repo/SET_SORTER_METHOD', id);
      this.$store.commit('dom/CLOSE_FILTER_MENU');
    },
    changeLanguage(language) {
      this.$store.dispatch('repo/SET_FILTER_LANGUAGE', language);
      this.$store.commit('dom/CLOSE_FILTER_MENU');
    },
    clear() {
      this.$store.dispatch('repo/SET_SORTER_METHOD', '');
      this.$store.dispatch('repo/SET_FILTER_LANGUAGE', '');
      this.showClear = false;
    },
  },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.filter-menu {
  .cover-top(fixed, 99);
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
    .menu-triangle(20px);
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
    &--active,
    &--clear {
      color: #fff;
      background-color: #0366d6 !important;
    }
    &--clear {
      > svg {
        width: 11px;
        height: 11px;
      }
    }
    &:hover {
      background-color: #eaecef;
    }
  }
}
</style>