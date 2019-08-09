<template>
  <section class="repo-info">
    <a
      :href="repo.url"
      class="repo-info__name"
      target="_blank"
      v-highlight="$store.state.dom.highlightText"
    >
      {{ repo.owner && repo.owner.login }} /
      <span class="bold">{{ repo.name }}</span>
    </a>
    <br />
    <p
      class="repo-info__desc"
      v-highlight="$store.state.dom.highlightText"
    >{{ repo.description }}</p>
    <div class="repo-info__attrs">
      <p
        class="repo-info__attrs-language"
        v-if="repo.primaryLanguage"
      >
        <span
          :style="`background-color: ${ repo.primaryLanguage.color }`"
          class="language-dot"
        />
        <span>{{ repo.primaryLanguage.name }}</span>
      </p>
      <a
        :href="`${repo.url}/stargazers`"
        class="repo-info__attrs-stars"
        target="_blank"
      >
        <svg v-html="require('@img/github-star.svg')" />
        <span>{{ repo.stargazers.totalCount | formatNumber }}</span>
      </a>
      <a
        :href="`${repo.url}/network/members`"
        class="repo-info__attrs-forks"
        target="_blank"
      >
        <svg v-html="require('@img/github-fork.svg')" />
        <span>{{ repo.forkCount | formatNumber }}</span>
      </a>
      <p class="repo-info__attrs-update">
        <span>Updated {{ repo.pushedAt | formatUpdate }}</span>
      </p>
    </div>
  </section>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'repo-info',
  props: {
    repo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<style scoped lang="less">
.repo-info {
  &__name {
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
  &__desc {
    margin-top: 14px;
    font-size: 12px;
    color: #586069;
  }
  &__attrs {
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
      color: #586069;
      text-decoration: none;
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
      color: #586069;
      text-decoration: none;
      cursor: pointer;
      &:hover {
        color: #0366d6;
      }
      svg {
        display: inline-block;
        width: 10px;
        height: 16px;
        vertical-align: middle;
        color: currentColor;
      }
    }
    &-update {
      margin-left: 14px;
    }
  }
}
</style>