<template>
  <ol
    class="stars-helper__tags"
    ref="tags"
  >
    <li
      :class="{ active: filtedTagId === Infinity }"
      @click="toggleTag(Infinity)"
      class="stars-helper__tags--item"
    >全部</li>
    <li
      :class="{ active: filtedTagId === item.id }"
      :key="index"
      @click="toggleTag(item.id)"
      class="stars-helper__tags--item"
      v-for="(item, index) in $store.state.tag.bars"
    >{{ `${item.name}(${item.repos.length})` }}</li>
    <li
      :class="{ active: filtedTagId === -Infinity }"
      @click="toggleTag(-Infinity)"
      class="stars-helper__tags--item"
    >无标签</li>
  </ol>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';

export default {
  name: 'stars-helper__tags',
  computed: {
    ...mapState(['filtedTagId']),
  },
  methods: {
    toggleTag(id) {
      if (id === -Infinity) {
        this.$filters.setTagFilter(true, '');
      } else if (id === Infinity) {
        this.$filters.setTagFilter(false);
      } else {
        this.$filters.setTagFilter(true, id);
      }
      this.$store.commit('filterStarredRepos');
      this.$store.commit('updateFilteredTagId', id);
      this.$store.commit('updateUnGroupRepoIds');
      this.$store.dispatch('group/UPDATE_BARS');
    },
  },
};
</script>

<style scoped lang="less">
.stars-helper__tags {
  @side-padding: 16px;
  padding: 0 @side-padding;
  height: 46px;
  line-height: 56px;
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
  &--item {
    display: inline-block;
    padding: 0 8px;
    height: 20px;
    line-height: 18px;
    font-size: 12px;
    color: #586069;
    border-radius: 500px;
    border: 1px solid transparent;
    list-style: none;
    cursor: pointer;
    overflow: hidden;
    & + & {
      margin-left: 4px;
    }
    &:hover {
      border-color: rgba(27, 31, 35, 0.08);
    }
    &.active {
      // font-weight: 600;
      background-color: rgba(27, 31, 35, 0.08);
      &:hover {
        border-color: transparent;
      }
    }
  }
}
</style>