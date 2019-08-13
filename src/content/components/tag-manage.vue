<template>
  <popup
    :visible.sync="visible"
    @close="$store.commit('dom/CLOSE_TAG_MANAGE')"
    @confirm="save"
    confirmBtnText="保存"
    title="标签管理"
  >
    <ul class="tag-manage__list">
      <li class="list-item">
        <svg
          @click="addTag"
          class="list-item__icon"
          v-html="require('@img/group-add.svg')"
        />
        <input
          @keyup.enter="addTag"
          class="list-item__input"
          maxlength="20"
          placeholder="输入组名并回车确定..."
          type="text"
          v-model="newTagName"
        />
      </li>
      <li
        :key="index"
        class="list-item"
        v-for="(tag, index) in tags"
      >
        <svg
          @click="deleteTag(tag, index)"
          class="list-item__icon"
          v-html="require('@img/group-delete.svg')"
        />
        <input
          :ref="`tagNameInput${index}`"
          @blur="modifyTagName(tag, index)"
          @focus="editingName = tag.name"
          @keyup.enter="modifyTagName(tag, index)"
          class="list-item__input"
          maxlength="20"
          placeholder="输入标签名并回车确定..."
          type="text"
          v-if="tag.editing"
          v-model="editingName"
        />
        <div
          class="list-item__name"
          v-else
        >
          <span class="list-item__text">{{ `${tag.name}(${tag.repos.length})` }}</span>
          <svg
            @click="editTag(tag, index)"
            class="list-item__icon list-item__icon--edit"
            v-html="require('@img/group-edit.svg')"
          />
        </div>
      </li>
    </ul>
  </popup>
</template>

<script>
/* eslint-disable no-console */
import { cloneDeep } from 'lodash';

export default {
  name: 'tag-manage',
  data() {
    return {
      newTagName: '',
      editingName: '',
      tags: [],
      willDeleteTags: [],
      visible: false,
    };
  },
  watch: {
    '$store.state.tag.bars': {
      immediate: true,
      handler(newVal) {
        this.tags = cloneDeep(newVal).slice(1, -1);
      },
    },
  },
  mounted() {
    this.visible = true;
  },
  methods: {
    modifyTagName(tag, index) {
      if (!this.editingName) this.deleteTag(tag, index);
      if (!this.tags.find(tag => tag.name == this.editingName)) {
        this.$set(tag, 'name', this.editingName);
      }
      this.$set(tag, 'editing', false);
    },
    deleteTag({ id }, index) {
      id && this.willDeleteTags.push(id);
      this.tags.splice(index, 1);
    },
    editTag(tag, index) {
      setTimeout(() => this.$refs[`tagNameInput${index}`][0].focus(), 50);
      this.$set(tag, 'editing', true);
    },
    addTag() {
      if (this.newTagName === '' || this.newTagName.trim() === '' || this.tags.find(tag => tag.name === this.newTagName.trim())) {
        return;
      }
      const newTag = { name: this.newTagName.slice(0, 20).trim(), repos: [] };
      this.tags.unshift(newTag);
      this.newTagName = '';
    },
    save() {
      // [important!] must delete first
      this.willDeleteTags.forEach(tagID => this.$store.dispatch('tag/DELETE', tagID));
      // [important!] must seperate UPDATE and ADD to different loop, UPDATE first
      this.tags.forEach(({ id, name, repos }) => id && this.$store.dispatch('tag/UPDATE', { id, name, repos }));
      this.tags.forEach(({ id, name, repos }) => !id && name && name.trim() && this.$store.dispatch('tag/ADD', { name }));

      this.$store.dispatch('repo/SET_FILTER_TAG', this.$store.state.tag.ALL_TAGED_ID);
      this.$store.commit('dom/CLOSE_TAG_MANAGE');
    },
  },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.tag-manage {
  &__list {
    padding-left: 33px;
    max-height: 340px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    .list-item {
      position: relative;
      padding-left: 16px;
      height: 40px;
      line-height: 40px;
      z-index: 200;
      background-color: #fff;
      cursor: pointer;
      &:hover {
        .list-item__icon--edit {
          display: inline-block;
        }
      }
      &__icon {
        position: absolute;
        left: -16px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        width: 15px;
        height: 15px;
        &--edit {
          display: none;
          position: static;
          margin-left: 5px;
          width: 12px;
          height: 12px;
          vertical-align: middle;
        }
      }
      &__input,
      &__name {
        height: 40px;
        line-height: 40px;
        color: #24292e;
        border-bottom: 1px solid #e1e4e8;
        user-select: none;
      }
      &__input {
        display: block;
        width: 100%;
        font-size: 12px;
        font-weight: 600;
        outline: none;
      }
      &__text {
        font-size: 12px;
        font-weight: 600;
      }
    }
  }
}
</style>