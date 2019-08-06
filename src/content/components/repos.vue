<template>
  <ul class="repos">
    <template v-if="starredRepoIds.length">
      <li
        :key="repoId"
        class="repos__item"
        v-for="(repoId, index) in repoIds"
      >
        <button
          @click="edit(starredRepos[repoId], index)"
          class="repos__item--edit"
        >编辑</button>
        <a
          :href="starredRepos[repoId].url"
          class="repos__item--name"
          target="_blank"
        >
          <span v-highlight="highlightText">{{ starredRepos[repoId].owner.login }}</span>
          /
          <span
            class="bold"
            v-highlight="highlightText"
          >{{ starredRepos[repoId].name }}</span>
        </a>
        <br />
        <p
          class="repos__item--desc"
          v-highlight="highlightText"
        >{{ starredRepos[repoId].description }}</p>
        <div class="repos__item--attrs">
          <p
            class="repos__item--attrs-language"
            v-if="starredRepos[repoId].primaryLanguage"
          >
            <span
              :style="`background-color: ${ starredRepos[repoId].primaryLanguage.color }`"
              class="language-dot"
            ></span>
            <span>{{ starredRepos[repoId].primaryLanguage.name }}</span>
          </p>
          <p class="repos__item--attrs-stars">
            <svg v-html="require('@img/github-star.svg')" />
            <span>{{ starredRepos[repoId].stargazers.totalCount | formatNumber }}</span>
          </p>
          <p class="repos__item--attrs-forks">
            <svg v-html="require('@img/github-fork.svg')" />
            <span>{{ starredRepos[repoId].forkCount | formatNumber }}</span>
          </p>
          <p class="repos__item--attrs-update">
            <span>Updated {{ starredRepos[repoId].pushedAt | formatUpdate }}</span>
          </p>
        </div>
        <template v-if="tags.repos && tags.repos[repoId]">
          <ul class="repos__item--tags">
            <li
              :key="index"
              class="repos__item--tags-item"
              v-for="(tagId, index) in tags.repos[repoId]"
            >{{ tags.tags[tagId].name }}</li>
          </ul>
        </template>
        <p
          class="repos__item--memos"
          v-highlight="highlightText"
          v-if="$store.getters['remark/store'][repoId] && $store.state.remark.affectedRepo !== repoId"
        >备注: {{ $store.getters['remark/store'][repoId] }}</p>
      </li>
    </template>
  </ul>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import dayjs from 'dayjs';

export default {
  name: 'repos',
  props: {
    repoIds: {
      type: Array,
      default() {
        return [];
      },
    },
    highlightText: {
      type: String,
      default: '',
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
    ...mapState(['starredRepos', 'starredRepoIds']),
  },
  methods: {
    edit(item, index) {
      this.$store.commit('setRepoEdit', item);
      this.$store.commit('dom/OPEN_REPO_EDIT');
    },
  },
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
      font-size: 12px;
      // color: #24292e;
      color: #586069;
      background-color: #eff3f6;
      background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
      border-radius: 3px;
      border-color: rgba(27, 31, 35, 0.35);
      &:hover {
        background-color: #e6ebf1;
        background-image: linear-gradient(-180deg, #f0f3f6, #e6ebf1 90%);
        background-position: -0.5em;
      }
    }
    &--name {
      display: inline-block;
      font-size: 16px;
      color: #0366d6;
      cursor: pointer;
      .bold {
        font-size: 16px;
        font-weight: bold;
      }
      &:hover {
        text-decoration: underline;
      }
    }
    &--desc {
      margin-top: 14px;
      font-size: 12px;
      line-height: 1.5;
      color: #586069;
    }
    &--attrs {
      display: flex;
      align-items: center;
      margin-top: 14px;
      font-size: 12px;
      line-height: 12px;
      color: #586069;
      span {
        display: inline-block;
        vertical-align: middle;
        font-size: 12px;
        line-height: 16px;
      }
      &-language {
        margin-right: 14px;
        .language-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          line-height: 18px;
          border-radius: 100%;
        }
      }
      &-stars {
        cursor: pointer;
        &:hover {
          color: #0366d6;
        }
        svg {
          display: inline-block;
          width: 14px;
          height: 16px;
          vertical-align: middle;
          color: currentColor;
        }
      }
      &-forks {
        margin-left: 14px;
        cursor: pointer;
        &:hover {
          color: #0366d6;
        }
        svg {
          width: 10px;
          height: 16px;
          display: inline-block;
          vertical-align: middle;
          color: currentColor;
        }
      }
      &-update {
        margin-left: 14px;
      }
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