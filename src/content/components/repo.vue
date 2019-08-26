<template>
  <popup
    :visible.sync="visible"
    :cancalCallback="reset"
    @close="close"
    @confirm="save"
    cancelBtnText="重置"
    confirmBtnText="保存"
    title="编辑星标仓库"
  >
    <div class="repo__wrap">
      <button
        @click="toggleStar"
        class="repo__toggle-star stars-helper-btn"
      >
        <svg v-html="require('@img/github-star.svg')" />
        <span>{{ unStar ? 'Star' : 'Unstar' }}</span>
      </button>
      <repo-info :repo="repoEdit" />
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
  </popup>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import { starRepo, unStarRepo } from '@/github/api-v3';
import RepoInfo from '@/content/components/dom/repo-info';

export default {
  name: 'repo',
  data() {
    return {
      showExistGroups: false,
      showExistGroupsTimer: null,
      showExistTags: false,
      showExistTagsTimer: null,
      currentGroup: '',
      tags: [],
      newTag: '',
      remark: '',
      unStar: false,
      visible: false,
    };
  },
  mounted() {
    this.visible = true;
  },
  watch: {
    '$store.state.dom.showRepoEdit': {
      immediate: true,
      handler(newVal) {
        if (this.$store.state.tag.controller.store.repos[this.repoEdit.id]) {
          this.tags = this.$store.state.tag.controller.store.repos[this.repoEdit.id].map(tagID => ({
            id: tagID,
            name: this.$store.state.tag.controller.store.tags[tagID].name,
          }));
        } else {
          this.tags = [];
        }
        this.remark = this.remarks[this.repoEdit.id];

        const currentGroupID = this.$store.state.group.controller.store.repos[this.repoEdit.id];
        if (currentGroupID) {
          this.currentGroup = { id: currentGroupID, name: this.$store.state.group.controller.store.groups[currentGroupID].name };
        } else {
          this.currentGroup = '';
        }
      },
    },
  },
  computed: {
    ...mapState({
      repoEdit: state => state.repo.repoEdit,
    }),
    remarks() {
      return this.$store.state.remark.controller.store;
    },
    filtedExistTags() {
      const result = [];
      const currentTagIDs = this.tags.map(item => item.id);
      if (this.newTag.length) {
        for (const key in this.$store.state.tag.controller.store.tags) {
          if (
            !currentTagIDs.includes(key) &&
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
            !currentTagIDs.includes(key) &&
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
    async close() {
      if (this.unStar) {
        this.save();
      } else {
        this.$store.dispatch('repo/FILTER_REPOS');
        this.$store.commit('dom/CLOSE_REPO_EDIT');
      }
    },
    async toggleStar() {
      const loading = this.$loading({ mountPoint: '.popup__panel', text: '提交中...' });
      try {
        if (this.unStar) {
          await starRepo(this.repoEdit.nameWithOwner);
        } else {
          await unStarRepo(this.repoEdit.nameWithOwner);
        }
        this.unStar = !this.unStar;
      } catch (error) {
        this.$store.commit('dom/CLOSE_REPO_EDIT');
        console.error('Post star status failed: ' + error);
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
      // handle unstar
      if (this.unStar) {
        this.$store.dispatch('repo/UNSTAR_REPO', this.repoEdit.nameWithOwner);
        this.reset();
      }
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
      this.$store.dispatch('repo/FILTER_REPOS');
      this.$store.commit('dom/CLOSE_REPO_EDIT');
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
  components: { RepoInfo },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.repo {
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
    height: auto;
    color: #24292e;
    span {
      height: 16px;
      font-size: 12px;
      line-height: 16px;
      font-weight: bold;
    }
    svg {
      margin-right: 4px;
      width: 14px;
      height: 14px;
      color: currentColor;
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
}
</style>