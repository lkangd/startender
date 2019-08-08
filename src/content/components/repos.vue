<template>
  <ul class="repos">
    <template v-if="reposID.length">
      <li
        :key="repoID"
        class="repos__item"
        v-for="(repoID, index) in repoIDs"
      >
        <button
          @click="edit(reposFiltered[repoID], index)"
          class="repos__item--edit"
        >编辑</button>
        <a
          :href="reposFiltered[repoID].url"
          class="repos__item--name"
          target="_blank"
        >
          <span v-highlight="$store.state.dom.highlightText">{{ reposFiltered[repoID].owner.login }}</span>
          /
          <span
            class="bold"
            v-highlight="$store.state.dom.highlightText"
          >{{ reposFiltered[repoID].name }}</span>
        </a>
        <br />
        <p
          class="repos__item--desc"
          v-highlight="$store.state.dom.highlightText"
        >{{ reposFiltered[repoID].description }}</p>
        <div class="repos__item--attrs">
          <p
            class="repos__item--attrs-language"
            v-if="reposFiltered[repoID].primaryLanguage"
          >
            <span
              :style="`background-color: ${ reposFiltered[repoID].primaryLanguage.color }`"
              class="language-dot"
            ></span>
            <span>{{ reposFiltered[repoID].primaryLanguage.name }}</span>
          </p>
          <p class="repos__item--attrs-stars">
            <svg v-html="require('@img/github-star.svg')" />
            <span>{{ reposFiltered[repoID].stargazers.totalCount | formatNumber }}</span>
          </p>
          <p class="repos__item--attrs-forks">
            <svg v-html="require('@img/github-fork.svg')" />
            <span>{{ reposFiltered[repoID].forkCount | formatNumber }}</span>
          </p>
          <p class="repos__item--attrs-update">
            <span>Updated {{ reposFiltered[repoID].pushedAt | formatUpdate }}</span>
          </p>
        </div>
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
      reposID: state => state.repo.reposID,
    }),
  },
  methods: {
    edit(repo, index) {
      this.$store.commit('repo/UPDATE_REPO_EDIT', repo);
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