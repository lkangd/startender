<template>
  <ul class="repos">
    <template v-if="reposFilteredID.length">
      <li
        :key="repoID"
        class="repos__item"
        v-for="(repoID, index) in repoIDs"
      >
        <button
          @click="edit(reposFiltered[repoID], index)"
          class="repos__item--edit stars-helper-btn"
        >编辑</button>
        <repo-info :repo="reposFiltered[repoID]" />
        <template v-if="tags.repos && tags.repos[repoID]">
          <ul class="repos__item--tags">
            <li
              :key="index"
              class="repos__item--tags-item"
              v-for="(tagID, index) in tags.repos[repoID]"
            >{{ tags.tags[tagID].name }}</li>
          </ul>
        </template>
        <p
          class="repos__item--memos"
          v-highlight="$store.state.dom.highlightText"
          v-if="$store.getters['remark/store'][repoID] && $store.state.remark.affectedRepo !== repoID"
        >备注: {{ $store.getters['remark/store'][repoID] }}</p>
      </li>
    </template>
  </ul>
</template>

<script>
/* eslint-disable no-console */
import RepoInfo from '@/content/components/dom/repo-info';
import { mapState } from 'vuex';
import dayjs from 'dayjs';

export default {
  name: 'repos',
  props: {
    repoIDs: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      tags: {},
    };
  },
  watch: {
    '$store.state.tag.controller.store': {
      immediate: true,
      handler(newVal) {
        this.tags = newVal;
      },
    },
  },
  computed: {
    ...mapState({
      reposFiltered: state => state.repo.reposFiltered,
      reposFilteredID: state => state.repo.reposFilteredID,
    }),
  },
  methods: {
    edit(repo, index) {
      this.$store.commit('repo/UPDATE_REPO_EDIT', repo);
      this.$store.commit('dom/OPEN_REPO_EDIT');
    },
  },
  components: { RepoInfo },
};
</script>

<style scoped lang="less">
.repos {
  @side-padding: 16px;
  &__item {
    position: relative;
    padding: @side-padding;
    border-bottom: 1px solid #d1d5db;
    &:hover {
      .repos__item--edit {
        display: block;
      }
    }
    &--edit {
      display: none;
      position: absolute;
      top: 13px;
      right: @side-padding;
      padding: 3px 7px;
      height: auto;
      font-size: 12px;
      font-weight: 400;
      color: #586069;
    }
    &--tags {
      margin-top: 10px;
      &-item {
        display: inline-block;
        margin: 4px 5px 0 0;
        padding: 3px 8px;
        font-size: 12px;
        color: rgba(27, 31, 35, 0.5);
        border-radius: 500px;
        background-color: rgba(27, 31, 35, 0.08);
      }
    }
    &--memos {
      margin-top: 14px;
      font-size: 12px;
      line-height: 1.33;
      color: #586069;
    }
  }
}
</style>