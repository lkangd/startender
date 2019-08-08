<template>
  <ol class="tag-bar">
    <li
      :class="{ 'tag-bar__item--active': $store.state.tag.filteredTagID === item.id }"
      :key="index"
      @click="handleClick(item.id)"
      class="tag-bar__item"
      v-for="(item, index) in $store.state.tag.bars"
    >{{ `${item.name}(${ item.count || item.repos.length})` }}</li>
  </ol>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'tag-bar',
  methods: {
    handleClick(tagID) {
      this.$store.dispatch('repo/SET_FILTER_TAG', tagID);
    },
  },
};
</script>

<style scoped lang="less">
.tag-bar {
  @side-padding: 16px;
  padding: 0 @side-padding;
  height: 46px;
  line-height: 56px;
  border-left: 1px solid #e1e4e8;
  border-bottom: 1px solid #d1d5db;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  scroll-behavior: smooth;
  user-select: none;
  &::-webkit-scrollbar {
    background: transparent;
    width: 0;
    height: 0;
  }
  &__item {
    display: inline-block;
    padding: 0 8px;
    height: 20px;
    line-height: 18px;
    font-size: 12px;
    color: #586069;
    border-radius: 500px;
    border: 1px solid transparent;
    list-style: none;
    overflow: hidden;
    cursor: pointer;
    & + & {
      margin-left: 4px;
    }
    &:hover {
      border-color: rgba(27, 31, 35, 0.08);
    }
    &--active {
      background-color: rgba(27, 31, 35, 0.08);
      &:hover {
        border-color: transparent;
      }
    }
  }
}
</style>