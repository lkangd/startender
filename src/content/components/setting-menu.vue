<template>
  <div
    @click.self="$store.commit('toggleSettingMenu', false)"
    class="setting-menu"
  >
    <div
      @click="handleMenuClick($event)"
      class="setting-menu__panel"
    >
      <div
        @click="fullRefresh"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >刷新数据</div>
      <div class="setting-menu__divider"></div>
      <div
        @click="$store.commit('toggleTagManage', true)"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >标签管理</div>
      <div
        @click="$store.commit('toggleGroupEdit', true)"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >分组管理</div>
      <div class="setting-menu__divider"></div>
      <div
        @click="exportDataToJSON"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >备份数据</div>
      <div
        class="setting-menu__panel--item"
        data-menu-item="true"
      >
        <input
          @change="handleChange"
          accept="application/json"
          class="setting-menu__panel--item-input"
          type="file"
        />
        恢复数据
      </div>
      <div
        @click="clearAllData"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >清除数据</div>
      <div class="setting-menu__divider"></div>
      <div
        @click="exportAllGroupsToBookmark"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >导出分组书签</div>
      <div
        @click="exportAllTagsToBookmark"
        class="setting-menu__panel--item"
        data-menu-item="true"
      >导出标签书签</div>
      <div class="setting-menu__divider"></div>
      <a
        class="setting-menu__panel--item"
        data-menu-item="true"
        href="https://github.com/lkangd/github-stars-helper/issues"
        target="_blank"
      >问题反馈</a>
      <a
        class="setting-menu__panel--item"
        data-menu-item="true"
        href="https://github.com/lkangd/github-stars-helper/issues"
        target="_blank"
      >Star支持插件</a>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import Storage from '@/storage';
import $storageSync from '@/utils/storage-sync';
import { saveAs } from 'file-saver';
import { getStarredRepos } from '@/github/api-v4';

export default {
  name: 'setting-menu',
  computed: {
    ...mapState(['starredRepos', 'unGroupRepoIds']),
  },
  methods: {
    async clearAllData() {
      const loading = this.$loading({ mountPoint: '#stars-helper', text: '数据清除中...' });
      try {
        await $storageSync.clear();
        localStorage.removeItem('stars_helper.starred_repos');
        loading.update('插件重启中...');
        this.$toast.success({ mountPoint: '#stars-helper', text: '清除管理数据成功' });
        window.location.reload();
      } catch (e) {
        loading.update('插件重启中...');
        this.$toast.error({ mountPoint: '#stars-helper', text: '清除管理数据失败' });
        window.location.reload();
      }
    },
    handleChange(evt) {
      const loading = this.$loading({ mountPoint: '#stars-helper', text: '数据恢复中...' });
      const file = evt.target.files[0];
      const reader = new FileReader();
      reader.onload = async evt => {
        const data = JSON.parse(evt.target.result);
        this.$store.commit('toggleSettingMenu', false);
        const tmpWholeData = Storage.data;
        await Storage.clearState();
        try {
          await Promise.all([this.$remarks.revertStore(data.remarks), this.$tags.revertStore(data.tags), this.$groups.revertStore(data.groups)]);
          loading.update('插件重启中...');
          this.$toast.success({ mountPoint: '#stars-helper', text: '恢复管理数据成功' });
          window.location.reload();
        } catch (error) {
          console.log('Manage Data Revert Failed :', error);
          loading.update('数据回滚, 插件重启中...');
          this.$toast.error({ mountPoint: '#stars-helper', text: '恢复管理数据失败' });
          (async () => {
            await Storage.clearState(tmpWholeData);
            window.location.reload();
          })();
        }
      };
      reader.readAsText(file);
    },
    fullRefresh() {
      getStarredRepos().then(starredRepos => {
        this.$store.commit('updateStarredReposOrigin', starredRepos);
        this.$store.commit('filterStarredRepos');
        this.$store.commit('updateUnGroupRepoIds', this.$groups.store.repos);
        this.$toast.success({ mountPoint: '#stars-helper', text: '数据已刷新' });
      });
    },
    exportAllGroupsToBookmark() {
      const data = {
        name: 'Github Starred Repos Groups',
        children: [],
      };
      // ungroup
      this.unGroupRepoIds.length &&
        data.children.push({
          name: '未分组',
          children: this.unGroupRepoIds.map(this._generateChild),
        });

      const { groups } = this.$groups.store;
      this._generateBookmarks(data, groups);
    },
    exportDataToJSON() {
      const { tags } = this.$tags.store;
      const { groups } = this.$groups.store;
      const remarks = this.$remarks.store;
      const data = JSON.stringify({ groups, tags, remarks }, null, 2);
      const file = new File([data], 'github-stars-helper.json', { type: 'text/plain;charset=utf-8' });
      saveAs(file);
      this.$toast.success({ mountPoint: '#stars-helper', text: '备份管理数据成功' });
    },
    exportAllTagsToBookmark() {
      const data = {
        name: 'Github Starred Repos Tags',
        children: [],
      };
      const { tags } = this.$tags.store;
      this._generateBookmarks(data, tags);
    },
    _generateChild(repoId) {
      return {
        name: this.starredRepos[repoId].nameWithOwner,
        url: this.starredRepos[repoId].url,
      };
    },
    _generateBookmarks(data, sorts) {
      for (const key in sorts) {
        if (sorts.hasOwnProperty(key)) {
          const sort = sorts[key];
          sort.repos.length &&
            data.children.push({
              name: sort.name,
              children: sort.repos.map(this._generateChild),
            });
        }
      }
      chrome.runtime.sendMessage({ action: 'bookmarks', data }, response => {
        // console.log(response);
        this.$toast({ mountPoint: '#stars-helper', text: '导出书签成功!' });
      });
    },
    handleMenuClick($event) {
      if ($event.target.dataset.menuItem) {
        this.$store.commit('toggleSettingMenu', false);
      }
    },
  },
};
</script>

<style scoped lang="less">
.setting-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: transparent;
  &__panel {
    position: absolute;
    top: 54px;
    right: 4px;
    z-index: 300;
    padding: 6px 0;
    // width: 150px;
    background-color: #fff;
    border: 1px solid #d1d5da;
    border-radius: 3px;
    box-shadow: 0 1px 15px rgba(27, 31, 35, 0.15);
    &::before {
      content: '';
      display: inline-block;
      position: absolute;
      top: -16px;
      left: auto;
      right: 11px;
      margin-left: 0;
      border: 8px solid transparent;
      border-bottom-color: rgba(27, 31, 35, 0.15);
    }
    &::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: -14px;
      left: auto;
      right: 12px;
      margin-left: 0;
      border: 7px solid transparent;
      border-bottom-color: #fff;
    }
    &--item {
      display: block;
      padding: 4px 16px;
      position: relative;
      font-size: 13px;
      line-height: 1.5;
      color: #24292e;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      &:hover {
        background-color: #0366d6;
        color: #fff;
      }
      &-input {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        z-index: 9999;
        width: 100%;
        height: 100%;
        font-size: 0;
        border: 0;
        outline: none;
        background-color: transparent;
        opacity: 0;
      }
    }
  }
  &__divider {
    border-top: 1px solid #e1e4e8;
    display: block;
    height: 0;
    margin: 6px 0;
  }
}
</style>