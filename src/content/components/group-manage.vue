<template>
  <popup
    :visible.sync="visible"
    @close="$store.commit('dom/CLOSE_GROUP_MANAGE')"
    @confirm="save"
    confirmBtnText="保存"
    title="分组管理"
  >
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
  </popup>
</template>

<script>
/* eslint-disable no-console */
import { SlickList, SlickItem } from 'vue-slicksort';
import { cloneDeep } from 'lodash';

export default {
  name: 'group-manage',
  data() {
    return {
      newGroupName: '',
      groups: [],
      willDeleteGroups: [],
      visible: false,
    };
  },
  watch: {
    '$store.state.group.bars': {
      immediate: true,
      handler(newVal) {
        this.groups = cloneDeep(newVal).slice(1, -1);
      },
    },
  },
  mounted() {
    this.visible = true;
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
      id && this.willDeleteGroups.push(id);
      this.groups.splice(index, 1);
    },
    addGroup() {
      if (this.newGroupName === '' || this.newGroupName.trim() === '' || this.groups.find(item => item.name === this.newGroupName.trim())) {
        return;
      }
      const newGroup = { name: this.newGroupName.slice(0, 20).trim(), repos: [] };
      this.groups.unshift(newGroup);
      this.newGroupName = '';
    },
    save() {
      // [important!] must delete first
      this.willDeleteGroups.forEach(groupID => this.$store.dispatch('group/DELETE', groupID));
      // [important!] must seperate UPDATE and ADD to different loop, UPDATE first
      this.groups.forEach(({ id, name, repos }, order) => id && this.$store.dispatch('group/UPDATE', { id, name, repos, order }));
      this.groups.forEach(({ id, name, repos }, order) => !id && name && name.trim() && this.$store.dispatch('group/ADD', { name, order }));

      this.$store.dispatch('group/UPDATE_BARS');
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
@import '~@/assets/less/mixins.less';

.group-manage {
  &__list {
    padding-left: 33px;
    max-height: 340px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    &--item {
      position: relative;
      z-index: 200;
      padding-left: 16px;
      height: 40px;
      line-height: 40px;
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
        top: 0;
        bottom: 0;
        right: 16px;
        margin: auto 0;
        width: 14px;
        height: 14px;
      }
    }
  }
}
</style>