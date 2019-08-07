<template>
  <div class="repo">
    <div class="repo__panel">
      <h3 class="repo__title">
        <span>编辑星标仓库</span>
        <button @click="close">
          <svg v-html="require('@img/close-con.svg')" />
        </button>
      </h3>
      <div class="repo__wrap">
        <button
          @click="toggleStar"
          class="repo__toggle-star"
        >
          <svg v-html="require('@img/github-star.svg')" />
          <span>{{ unStar ? 'Star' : 'Unstar' }}</span>
        </button>

        <a
          :href="repoEdit.url"
          class="repo__name"
          target="_blank"
        >
          {{ repoEdit.owner && repoEdit.owner.login }} /
          <span class="bold">{{ repoEdit.name }}</span>
        </a>

        <br />
        <p class="repo__desc">{{ repoEdit.description }}</p>
        <div class="repo__attrs">
          <p
            class="repo__attrs-language"
            v-if="repoEdit.primaryLanguage"
          >
            <span
              :style="`background-color: ${ repoEdit.primaryLanguage.color }`"
              class="language-dot"
            ></span>
            <span>{{ repoEdit.primaryLanguage.name }}</span>
          </p>
          <p class="repo__attrs-stars">
            <svg v-html="require('@img/github-star.svg')" />
            <span>{{ repoEdit.stargazers.totalCount | formatNumber }}</span>
          </p>
          <p class="repo__attrs-forks">
            <svg v-html="require('@img/github-fork.svg')" />
            <span>{{ repoEdit.forkCount | formatNumber }}</span>
          </p>
          <p class="repo__attrs-update">
            <span>Updated {{ repoEdit.pushedAt | formatUpdate }}</span>
          </p>
        </div>
        <!-- 标签 -->
        <div
          @click.self="$refs.tagInput.focus()"
          class="repo__tags"
        >
          <svg
            class="repo__tags--label"
            v-html="require('@img/tag-con.svg')"
          />
          <div
            :key="index"
            class="repo__tags--item"
            v-for="(item, index) in tags"
          >
            <span>{{ item.name }}</span>
            <svg
              @click="deleteTag(item, index)"
              v-html="require('@img/close-con.svg')"
            />
          </div>
          <div class="repo__tags--input">
            <input
              :placeholder="tags.length? '输入标签名' : '添加新标签...'"
              @blur="toggleExistTags(false)"
              @focus="toggleExistTags(true)"
              @keydown.delete="!newTag.length && deleteTag(tags[tags.length - 1], tags.length - 1)"
              @keydown.enter="addNewTag(newTag)"
              @keydown.esc="$refs.tagInput.blur(), toggleExistTags(false)"
              ref="tagInput"
              type="text"
              v-model="newTag"
            />
            <ul
              class="repo__tags--suggestion"
              v-show="showExistTags && filtedExistTags.length"
            >
              <li
                :key="index"
                @click="addNewTag(item)"
                v-for="(item, index) in filtedExistTags"
              >{{ item.name }}</li>
            </ul>
          </div>
        </div>
        <!-- 分组 -->
        <div class="repo__group">
          <svg
            class="repo__group--label"
            v-html="require('@img/group-con.svg')"
          />
          <div
            class="repo__group--item"
            v-if="currentGroup.id"
          >
            <span @click.self="toggleExistGroups(true)">{{ currentGroup.name }}</span>
            <svg
              @click="(currentGroup = '')"
              v-html="require('@img/close-con.svg')"
            />
          </div>
          <div class="repo__group--input">
            <input
              @blur="toggleExistGroups(false)"
              @focus="toggleExistGroups(true)"
              @keydown.enter="setGroup(currentGroup)"
              @keydown.esc="$refs.groupInput.blur(), toggleExistGroups(false)"
              placeholder="添加到分组..."
              ref="groupInput"
              type="text"
              v-model="currentGroup"
              v-show="!currentGroup.id"
            />
          </div>
          <ul
            class="repo__group--suggestion"
            v-show="showExistGroups && filtedExistGroups.length"
          >
            <li
              :key="index"
              @click="setGroup(item), toggleExistGroups(false)"
              v-for="(item, index) in filtedExistGroups"
            >{{ item.name }}</li>
          </ul>
        </div>
        <!-- 备注 -->
        <div class="repo__remark">
          <svg
            class="repo__remark--label"
            v-html="require('@img/remark-con.svg')"
          />
          <div class="repo__remark--input">
            <input
              placeholder="添加备注..."
              type="text"
              v-model="remark"
            />
          </div>
        </div>
      </div>
      <div class="repo__operate">
        <button
          @click="save"
          class="repo__operate--btn highlight"
        >保存</button>
        <button
          @click="reset"
          class="repo__operate--btn"
        >重置</button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import { starRepo, unStarRepo } from '@/github/api-v3';

export default {
  name: 'repo',
  data() {
    return {
      // languageColors,
      showExistGroups: false,
      showExistGroupsTimer: null,
      showExistTags: false,
      showExistTagsTimer: null,
      currentGroup: '',
      tags: [],
      newTag: '',
      remark: '',
      unStar: false,
    };
  },
  watch: {
    '$store.state.dom.showRepoEdit': {
      immediate: true,
      handler(newVal) {
        if (this.$store.state.tag.controller.store.repos[this.repoEdit.id]) {
          this.tags = this.$store.state.tag.controller.store.repos[this.repoEdit.id].map(tagId => ({ id: tagId, name: this.$store.state.tag.controller.store.tags[tagId].name }));
        } else {
          this.tags = [];
        }
        this.remark = this.remarks[this.repoEdit.id];

        const currentGroupId = this.$store.state.group.controller.store.repos[this.repoEdit.id];
        if (currentGroupId) {
          this.currentGroup = { id: currentGroupId, name: this.$store.state.group.controller.store.groups[currentGroupId].name };
        } else {
          this.currentGroup = '';
        }
      },
    },
  },
  computed: {
    ...mapState(['repoEdit']),
    remarks() {
      return this.$store.state.remark.controller.store;
    },
    filtedExistTags() {
      const result = [];
      const currentTagIds = this.tags.map(item => item.id);
      if (this.newTag.length) {
        for (const key in this.$store.state.tag.controller.store.tags) {
          if (
            !currentTagIds.includes(key) &&
            this.$store.state.tag.controller.store.tags.hasOwnProperty(key) &&
            this.$store.state.tag.controller.store.tags[key].name.toLowerCase().startsWith(this.newTag.toLowerCase()) &&
            !this.tags.find(tag => tag.name === this.$store.state.tag.controller.store.tags[key].name)
          ) {
            result.push({ id: key, name: this.$store.state.tag.controller.store.tags[key].name });
          }
        }
      } else {
        for (const key in this.$store.state.tag.controller.store.tags) {
          if (
            this.$store.state.tag.controller.store.tags.hasOwnProperty(key) &&
            !currentTagIds.includes(key) &&
            !this.tags.find(tag => tag.name === this.$store.state.tag.controller.store.tags[key].name)
          ) {
            result.push({ id: key, name: this.$store.state.tag.controller.store.tags[key].name });
          }
        }
      }
      return result;
    },
    filtedExistGroups() {
      let groups;
      if (this.currentGroup.id) {
        groups = this.$store.state.group.bars.filter(item => item.id !== this.currentGroup.id);
      } else if (this.currentGroup.length) {
        groups = this.$store.state.group.bars.filter(item => item.name.toLowerCase().startsWith(this.currentGroup.toLowerCase()));
      } else {
        groups = this.$store.state.group.bars;
      }
      return groups.slice(1, -1);
    },
  },
  methods: {
    close() {
      // handle unstar
      this.unStar && this.$store.commit('unstarRepo', this.repoEdit);

      this.$store.commit('dom/CLOSE_REPO_EDIT');
      this.$store.commit('filterStarredRepos');
      this.$store.dispatch('tag/UPDATE_BARS');
      this.$store.dispatch('group/UPDATE_BARS');
    },
    async toggleStar() {
      const loading = this.$loading({ mountPoint: '.repo__panel', text: '提交中...' });
      try {
        if (this.unStar) {
          await starRepo(this.repoEdit.nameWithOwner);
        } else {
          await unStarRepo(this.repoEdit.nameWithOwner);
        }
        this.unStar = !this.unStar;
      } catch (e) {
        console.log('Post star status failed: ' + e);
      } finally {
        loading.close();
      }
    },
    reset() {
      this.currentGroup = '';
      this.tags = [];
      this.remark = '';
    },
    async save() {
      // handle group
      if (this.$store.state.group.controller.store.repos[this.repoEdit.id] && !this.currentGroup) {
        // delete group
        const changedRepo = {
          id: this.repoEdit.id,
          group: {},
        };
        this.$store.dispatch('group/UPDATE_REPO', changedRepo);
      }
      if (this.currentGroup) {
        this.setGroup(this.currentGroup);
        const changedRepo = {
          id: this.repoEdit.id,
          group: {
            id: String(this.currentGroup.id) === 'Symbol(id)' ? '' : this.currentGroup.id,
            name: this.currentGroup.name,
          },
        };
        this.$store.dispatch('group/UPDATE_REPO', changedRepo);
      }
      // handle tag
      if (this.newTag.length) {
        this.addNewTag(this.newTag);
      }
      const changedTag = { id: this.repoEdit.id, tagNames: this.tags.map(item => item.name) };
      this.$store.dispatch('tag/UPDATE_REPO', changedTag);
      // handle remark
      if (this.remark !== this.remarks[this.repoEdit.id]) {
        this.$store.dispatch('remark/UPDATE', { id: this.repoEdit.id, content: this.remark.trim() });
      }
      this.close();
    },
    toggleExistGroups(bool) {
      this.showExistGroupsTimer && clearTimeout(this.showExistGroupsTimer);
      this.showExistGroupsTimer = setTimeout(() => {
        this.showExistGroups = bool;
        if (!bool && this.currentGroup.length && !this.currentGroup.id) {
          this.setGroup(this.currentGroup);
        }
      }, 300);
    },
    setGroup(targetGroup) {
      if (targetGroup.id) {
        this.currentGroup = targetGroup;
      } else if (targetGroup.length) {
        this.currentGroup = {
          id: Symbol('id'),
          name: targetGroup,
        };
      }
    },
    toggleExistTags(bool) {
      this.showExistTagsTimer && clearTimeout(this.showExistTagsTimer);
      this.showExistTagsTimer = setTimeout(() => {
        this.showExistTags = bool;
        if (!bool && this.newTag.length) {
          this.addNewTag(this.newTag);
        }
      }, 300);
    },
    deleteTag(item, index) {
      this.tags.splice(index, 1);
      this.$nextTick(() => this.$refs.tagInput.focus());
    },
    addNewTag(newTag) {
      if (!newTag || (!newTag.id && !newTag.trim()) || this.tags.find(tag => tag.name === newTag || tag.name === newTag.name)) {
        return;
      }
      if (newTag.id) {
        this.tags.push(newTag);
      } else {
        this.tags.push({
          id: '',
          name: this.newTag.trim(),
        });
      }
      this.newTag = '';
      this.$nextTick(() => this.$refs.tagInput && this.$refs.tagInput.focus());
    },
  },
};
</script>

<style scoped lang="less">
.repo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(27, 31, 35, 0.5);
  &__panel {
    position: relative;
    background-clip: padding-box;
    margin: 69px auto;
    width: 450px;
    // min-height: 200px;
    background-color: #fff;
    border: 1px solid #444d56;
    border-radius: 3px;
    box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);
  }
  &__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 16px;
    color: #24292e;
    background-color: #f6f8fa;
    border-radius: 2px 2px 0 0;
    border-bottom: 1px solid #e1e4e8 !important;
    span {
      font-size: 14px;
      font-weight: 600;
    }
    button {
      padding: 0;
      color: #586069;
      background-color: transparent;
      outline: none;
      border: none;
      &:hover {
        color: #0366d6;
      }
    }
    svg {
      width: 12px;
      height: 16px;
    }
  }
  &__wrap {
    position: relative;
    padding: 16px;
  }
  &__toggle-star {
    display: flex;
    align-items: center;
    position: absolute;
    top: 12px;
    right: 16px;
    padding: 3px 7px;
    color: #24292e;
    background-color: #eff3f6;
    background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
    border-radius: 3px;
    border-color: rgba(27, 31, 35, 0.2);
    &:hover {
      background-color: #e6ebf1;
      background-image: linear-gradient(-180deg, #f0f3f6, #e6ebf1 90%);
      background-position: -0.5em;
    }
    span,
    svg {
      display: inline-block;
      // width: 14px;
      height: 16px;
      font-size: 12px;
      line-height: 16px;
      font-weight: bold;
      color: currentColor;
    }
    svg {
      margin-right: 4px;
      width: 14px;
      height: 14px;
    }
  }
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
  &__tags,
  &__group,
  &__remark {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    color: #586069;
    &--label {
      margin-bottom: 4px;
      width: 12px;
      height: 12px;
    }
    &--item {
      display: flex;
      align-items: center;
      margin: 0 0 4px 5px;
      padding: 3px 8px;
      font-size: 12px;
      color: rgba(27, 31, 35, 0.5);
      border-radius: 500px;
      background-color: rgba(27, 31, 35, 0.08);
      svg {
        margin-left: 5px;
        width: 12px;
        height: 12px;
        cursor: pointer;
      }
    }
    &--input {
      position: relative;
      margin: 0 0 4px 5px;
      input {
        width: 70px;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
        color: #586069;
        outline: none;
        border: none;
      }
    }
    &--suggestion {
      position: absolute;
      left: 0;
      top: 20px;
      z-index: 201;
      padding-bottom: 5px;
      padding-top: 5px;
      max-width: 220px;
      max-height: 180px;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid rgba(27, 31, 35, 0.15);
      border-radius: 4px;
      box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
      overflow-y: scroll;
      scroll-behavior: smooth;
      &::-webkit-scrollbar {
        width: 0 !important;
      }
      li {
        padding: 4px 16px;
        display: block;
        font-size: 12px;
        color: #24292e;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        &:hover {
          background-color: #0366d6;
          color: #fff;
          outline: none;
          text-decoration: none;
        }
      }
    }
  }
  &__group {
    position: relative;
    margin-top: 14px;
    color: #586069;
    &--label {
      margin-bottom: 6px;
      width: 11px;
      height: 11px;
    }
    &--item {
      margin-left: 6px;
      border-radius: 2px;
      cursor: pointer;
    }
    &--input {
      margin: 0 0 4px 6px;
    }
    &--suggestion {
      left: 15px;
    }
  }
  &__remark {
    &--label {
      width: 13px;
      height: 13px;
    }
    &--input {
      flex: 1;
      input {
        width: 100%;
      }
    }
  }
  &__operate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    top: -1px;
    z-index: 200;
    padding: 16px;
    border-top: 1px solid #e1e4e8;
    &--btn {
      width: 200px;
      height: 34px;
      font-size: 14px;
      font-weight: 600;
      background-color: #eff3f6;
      background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
      color: #24292e;
      background-position: -1px -1px;
      background-repeat: repeat-x;
      background-size: 110% 110%;
      border: 1px solid rgba(27, 31, 35, 0.2);
      border-radius: 3px;
      &:hover {
        background-color: #e6ebf1;
        background-image: linear-gradient(-180deg, #f0f3f6, #e6ebf1 90%);
        background-position: -0.5em;
        border-color: rgba(27, 31, 35, 0.35);
      }
      &.highlight {
        color: #fff;
        background-color: #28a745;
        background-image: linear-gradient(-180deg, #34d058, #28a745 90%);
        &:hover {
          background-color: #269f42;
          background-image: linear-gradient(-180deg, #2fcb53, #269f42 90%);
          background-position: -0.5em;
          border-color: rgba(27, 31, 35, 0.5);
        }
      }
    }
  }
}
</style>