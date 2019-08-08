<template>
  <div class="tag-manage">
    <div class="tag-manage__wrapper">
      <h3 class="tag-manage__title">
        <span>管理标签</span>
        <button @click="$store.commit('dom/CLOSE_TAG_MANAGE')">
          <svg v-html="require('@img/close-con.svg')" />
        </button>
      </h3>
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
      <div class="tag-manage__operate">
        <button
          @click="save"
          class="tag-manage__btn"
        >保存</button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import { cloneDeep } from 'lodash';

export default {
  name: 'tag-manage',
  data() {
    return {
      willDeleteTags: [],
      willAddTags: [],
      newTagName: '',
      tags: [],
      editingName: '',
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
      this.willAddTags.push(newTag);
      this.newTagName = '';
    },
    save() {
      this.willAddTags.forEach(({ name }) => {
        if (name === '' || name.trim() === '') return;
        this.$store.dispatch('tag/ADD', { name });
      });
      this.willDeleteTags.forEach(tagID => this.$store.dispatch('tag/DELETE', tagID));
      this.tags.forEach(({ id, name, repos }) => this.$store.dispatch('tag/UPDATE', { id, name, repos }));

      this.$store.dispatch('repo/SET_FILTER_TAG');
      this.$store.commit('dom/CLOSE_TAG_MANAGE');
    },
  },
};
</script>

<style scoped lang="less">
.tag-manage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(27, 31, 35, 0.5);
  &__wrapper {
    background-clip: padding-box;
    margin: 69px auto;
    width: 450px;
    background-color: #fff;
    border: 1px solid #444d56;
    border-radius: 3px;
    box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);
  }
  &__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom: 1px solid #e1e4e8 !important;
    border-width: 0 0 1px;
    margin: 0;
    padding: 16px;
    color: #24292e;
    background-color: #f6f8fa;
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
  &__operate {
    position: relative;
    top: -1px;
    z-index: 200;
    padding: 16px;
    border-top: 1px solid #e1e4e8;
  }
  &__btn {
    display: block;
    margin: 0 auto;
    width: 200px;
    height: 34px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background-position: -1px -1px;
    background-repeat: repeat-x;
    background-size: 110% 110%;
    background-color: #28a745;
    background-image: linear-gradient(-180deg, #34d058, #28a745 90%);
    border: 1px solid rgba(27, 31, 35, 0.2);
    border-radius: 3px;
    &:hover {
      background-color: #269f42;
      background-image: linear-gradient(-180deg, #2fcb53, #269f42 90%);
      background-position: -0.5em;
      border-color: rgba(27, 31, 35, 0.5);
    }
  }
}
</style>