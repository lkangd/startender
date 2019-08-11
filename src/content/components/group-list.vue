<template>
  <ul class="group-list">
    <li
      :class="{ 'group--open': group.open }"
      :key="index"
      class="group-list__item group"
      v-for="(group, index) in $store.state.group.bars"
    >
      <div
        @click="$set(group, 'open', !group.open)"
        class="group__bar"
      >
        <h4
          class="group__title"
        >{{ group.name }}({{ group.repos.length }}{{ isFiltered && group.count && `/${group.count}` || '' }})</h4>
        <svg
          class="group__dot"
          v-html="require('@img/group-dot.svg')"
        />
      </div>
      <repos
        :repoIDs="group.repos"
        v-if="group.open"
      />
    </li>
  </ul>
</template>

<script>
/* eslint-disable no-console */
import Repos from '@/content/components/repos';

export default {
  name: 'group-list',
  computed: {
    isFiltered() {
      return !!(
        this.$store.state.dom.highlightText ||
        this.$store.state.repo.filteredLanguage ||
        String(this.$store.state.tag.filteredTagID) !== 'Symbol(ALL_TAGED_ID)'
      );
    },
  },
  components: { Repos },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.group-list {
  flex: 1;
  background-color: #fff;
  border-left: 1px solid #e1e4e8;
  overflow: scroll;
  scroll-behavior: smooth;
  .group {
    &__bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      height: 34px;
      border-bottom: 1px solid #d1d5db !important;
      cursor: pointer;
      user-select: none;
      .stars-helper-linear-gradient();
    }
    &__title {
      flex: 1;
      font-size: 12px;
      font-weight: bold;
      color: #24292e;
    }
    &__dot {
      width: 4px;
      height: 7px;
    }
    &--open {
      .group {
        &__bar {
          position: sticky;
          top: 0;
          z-index: 99;
        }
        &__dot {
          transform: rotateZ(90deg);
        }
      }
    }
  }
}
</style>