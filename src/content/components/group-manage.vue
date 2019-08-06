<template>
  <div class="group-manage">
    <div class="group-manage__panel">
      <h3 class="group-manage__title">
        <span>编辑组</span>
        <button @click="$store.commit('dom/CLOSE_GROUP_MANAGE')">
          <svg v-html="require('@img/close-con.svg')" />
        </button>
      </h3>
      <div class="group-manage__list">
        <div class="group-manage__list--item">
          <svg
            @click="addGroup"
            class="group-manage__list--item-add"
            v-html="require('@img/group-add.svg')"
          />
          <input
            @keyup.enter="addGroup"
            class="group-manage__list--item-input"
            maxlength="20"
            placeholder="输入组名并回车确定..."
            type="text"
            v-model="newGroupName"
          />
        </div>
      </div>
      <SlickList
        :pressDelay="100"
        class="group-manage__list"
        lockAxis="y"
        v-model="groups"
      >
        <SlickItem
          :index="index"
          :key="index"
          class="group-manage__list--item"
          v-for="(group, index) in groups"
        >
          <svg
            @click="deleteGroup(group, index)"
            class="group-manage__list--item-delete"
            v-html="require('@img/group-delete.svg')"
          />
          <input
            :ref="`groupNameInput${index}`"
            @blur="modifyGroupName(group, index)"
            @keyup.enter="modifyGroupName(group, index)"
            class="group-manage__list--item-input"
            maxlength="20"
            placeholder="输入组名并回车确定..."
            type="text"
            v-if="group.editing"
            v-model="group.name"
          />
          <p
            class="group-manage__list--item-title"
            v-else
          >
            <span>{{ `${group.name}(${group.repos.length})` }}</span>
            <svg
              @click="editGroup(group, index)"
              class="group-manage__list--item-edit"
              v-html="require('@img/group-edit.svg')"
            />
          </p>
          <svg
            class="group-manage__list--item-drag"
            v-html="require('@img/drag-con.svg')"
          />
        </SlickItem>
      </SlickList>
      <div class="group-manage__operate">
        <button
          @click="save"
          class="group-manage__operate--btn"
        >保存</button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { SlickList, SlickItem } from 'vue-slicksort';
import { mapState } from 'vuex';
import { cloneDeep } from 'lodash';

export default {
  name: 'group-manage',
  data() {
    return {
      newGroupName: '',
      groups: [],
      deletingGroups: [],
      addingGroups: [],
    };
  },
  watch: {
    '$store.state.group.bars': {
      immediate: true,
      handler(newVal) {
        this.groups = cloneDeep(newVal);
      },
    },
  },
  methods: {
    modifyGroupName(group, index) {
      if (!group.name) {
        this.deleteGroup(group, index);
      }
      this.$set(group, 'editing', false);
    },
    editGroup(item, index) {
      this.$set(item, 'editing', true);
      setTimeout(() => {
        this.$refs[`groupNameInput${index}`][0].focus();
      }, 50);
    },
    deleteGroup({ id }, index) {
      id && this.deletingGroups.push(id);
      this.groups.splice(index, 1);
    },
    addGroup() {
      if (this.newGroupName === '' || this.newGroupName.trim() === '' || this.groups.find(item => item.name === this.newGroupName.trim())) {
        return;
      }
      const newGroup = { name: this.newGroupName.slice(0, 20).trim(), repos: [] };
      this.groups.unshift(newGroup);
      this.addingGroups.push(newGroup);
      this.newGroupName = '';
    },
    save() {
      this.addingGroups.forEach(newGroup => {
        if (newGroup.name === '' || newGroup.name.trim() === '') {
          return;
        }
        this.$store.dispatch('group/ADD', { name: newGroup.name });
      });
      this.deletingGroups.forEach(groupId => this.$store.dispatch('group/DELETE', groupId));
      this.groups.forEach(({ id, name, repos }, order) => this.$store.dispatch('group/UPDATE', { id, name, repos, order }));

      this.$store.dispatch('group/UPDATE_BARS');
      this.$store.commit('updateUnGroupRepoIds');
      this.$store.commit('dom/CLOSE_GROUP_MANAGE');
    },
  },
  components: {
    SlickItem,
    SlickList,
  },
};
</script>

<style scoped lang="less">
.group-manage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(27, 31, 35, 0.5);
  &__panel {
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
    &--item {
      position: relative;
      padding-left: 16px;
      height: 40px;
      line-height: 40px;
      z-index: 200;
      background-color: #fff;
      cursor: pointer;
      &:hover {
        .group-manage__list--item-edit {
          display: inline-block;
        }
      }
      &-add {
        position: absolute;
        left: -16px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        width: 15px;
        height: 15px;
      }
      &-delete {
        position: absolute;
        left: -17px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        width: 17px;
        height: 17px;
      }
      &-title,
      &-input {
        height: 40px;
        line-height: 40px;
        color: #24292e;
        border-bottom: 1px solid #e1e4e8;
        span {
          font-size: 12px;
          font-weight: 600;
        }
      }
      &-input {
        display: block;
        width: 100%;
        font-size: 12px;
        font-weight: 600;
        outline: none;
      }
      &-edit {
        display: none;
        margin-left: 5px;
        width: 12px;
        height: 12px;
        vertical-align: middle;
      }
      &-drag {
        position: absolute;
        right: 16px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        width: 14px;
        height: 14px;
      }
    }
  }
  &__operate {
    position: relative;
    top: -1px;
    z-index: 200;
    padding: 16px;
    border-top: 1px solid #e1e4e8;
    &--btn {
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
}
</style>