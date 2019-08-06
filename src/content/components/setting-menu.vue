<script>
/* eslint-disable no-console */
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';

import Storage from '@/storage';
import $storageSync from '@/utils/storage-sync';
import { getStarredRepos } from '@/github/api-v4';
import { starRepo } from '@/github/api-v3';

function isVNode(node) {
  return node !== null && typeof node === 'object' && node.hasOwnProperty('componentOptions');
}

export default {
  name: 'setting-menu',
  data() {
    return {
      menus: [
        [
          {
            name: '刷新数据',
            action() {
              getStarredRepos().then(starredRepos => {
                this.$store.commit('updateStarredReposOrigin', starredRepos);
                this.$store.commit('filterStarredRepos');
                this.$store.commit('updateUnGroupRepoIds');
                this.$toast.success('数据已刷新');
              });
            },
          },
        ],
        [
          {
            name: '标签管理',
            action() {
              this.$store.commit('dom/OPEN_TAG_MANAGE');
            },
          },
          {
            name: '分组管理',
            action() {
              this.$store.commit('dom/OPEN_GROUP_MANAGE');
            },
          },
        ],
        [
          {
            name: '备份数据',
            action() {
              const { tags } = this.$store.state.tag.controller.store;
              const { groups } = this.$store.state.group.controller.store;
              const remarks = this.$store.state.remark.controller.store;
              const data = JSON.stringify({ groups, tags, remarks }, null, 2);
              const file = new File([data], 'github-stars-helper.json', { type: 'text/plain;charset=utf-8' });
              saveAs(file);
              this.$toast.success('备份管理数据成功');
            },
          },
          {
            name: (
              <div class="setting-menu__item">
                <input class="setting-menu__input" type="file" accept="application/json" onChange={this.handleUpload} />
                恢复数据
              </div>
            ),
          },
          {
            name: '清除数据',
            async action() {
              const loading = this.$loading('数据清除中...');
              try {
                await $storageSync.clear();
                localStorage.removeItem('stars_helper.starred_repos');
                loading.update('插件重启中...');
                this.$toast.success('清除管理数据成功');
                window.location.reload();
              } catch (e) {
                loading.update('插件重启中...');
                this.$toast.error('清除管理数据失败');
                window.location.reload();
              }
            },
          },
        ],
        [
          {
            name: '导出分组书签',
            action() {
              const data = {
                name: 'Github Starred Repos Groups',
                children: [],
              };
              // ungroup
              this.unGroupRepoIds.length &&
                data.children.push({
                  name: '未分组',
                  children: this.unGroupRepoIds.map(this._generateBookmarkItem),
                });

              const { groups } = this.$store.state.group.controller.store;
              this._generateBookmarks(data, groups, '分组');
            },
          },
          {
            name: '导出标签书签',
            action() {
              const data = {
                name: 'Github Starred Repos Tags',
                children: [],
              };
              const { tags } = this.$store.state.tag.controller.store;
              this._generateBookmarks(data, tags, '标签');
            },
          },
        ],
        [
          {
            name: '问题反馈',
            action() {
              const href = 'https://github.com/lkangd/github-stars-helper/issues';
              window.open(href, '_blank');
            },
          },
          {
            name: 'Star支持插件',
            hidden: localStorage.getItem('stars_helper.project_starred'),
            async action() {
              try {
                await starRepo('lkangd/github-stars-helper');
                this.$toast('感谢您的支持');
                localStorage.setItem('stars_helper.project_starred', true);
              } catch (e) {
                this.$toast('Star支持插件失败,请重试');
              }
            },
          },
        ],
      ],
    };
  },
  render(h) {
    return (
      <div class="setting-menu" onClick={this.handleClick}>
        <ul class="setting-menu__list">
          {this.menus.map(sublist => (
            <li class="setting-menu__sub-list">
              {sublist.map(item => {
                if (item.hidden) return;
                if (isVNode(item.name)) return item.name;
                return (
                  <div class="setting-menu__item" onClick={this.handleAction.bind(this, item.action)}>
                    {item.name}
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      </div>
    );
  },
  computed: {
    ...mapState(['starredRepos', 'unGroupRepoIds']),
  },
  methods: {
    handleClick(evt) {
      if (evt.target !== evt.currentTarget) return;
      this.$store.commit('dom/CLOSE_SETTING_MENU');
    },
    handleAction(action) {
      typeof action === 'function' && action.call(this);
      this.$store.commit('dom/CLOSE_SETTING_MENU');
    },
    handleUpload(evt) {
      const loading = this.$loading('数据恢复中...');
      const file = evt.target.files[0];
      const reader = new FileReader();

      reader.onload = async evt => {
        const data = JSON.parse(evt.target.result);
        this.$store.commit('dom/CLOSE_SETTING_MENU');
        const restoreData = Storage.data;
        await Storage.setState();
        try {
          await Promise.all([
            this.$store.dispatch('group/REVERT_STORE', data.groups),
            this.$store.dispatch('tag/REVERT_STORE', data.tags),
            this.$store.dispatch('remark/REVERT_STORE', data.remarks),
          ]);
          loading.update('插件重启中...');
          this.$toast.success('恢复管理数据成功');
          window.location.reload();
        } catch (error) {
          console.error('Manage Data Revert Failed :', error);
          loading.update('数据回滚, 插件重启中...');
          this.$toast.error('恢复管理数据失败');
          (async () => {
            await Storage.setState(restoreData);
            window.location.reload();
          })();
        }
      };
      reader.readAsText(file);
    },
    _generateBookmarks(data, sorts, type) {
      for (const key in sorts) {
        if (sorts.hasOwnProperty(key)) {
          const sort = sorts[key];
          sort.repos.length &&
            data.children.push({
              name: sort.name,
              children: sort.repos.map(this._generateBookmarkItem),
            });
        }
      }
      chrome.runtime.sendMessage({ action: 'bookmarks', data }, response => {
        this.$toast.success(`导出${type}书签成功!`);
      });
    },
    _generateBookmarkItem(repoId) {
      if (this.starredRepos[repoId]) {
        return {
          name: this.starredRepos[repoId].nameWithOwner,
          url: this.starredRepos[repoId].url,
        };
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
  &__list {
    position: absolute;
    top: 54px;
    right: 4px;
    z-index: 300;
    padding: 6px 0;
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
  }
  &__sub-list {
    & + & {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #e1e4e8;
    }
  }
  &__item {
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
    user-select: none;
    &:hover {
      background-color: #0366d6;
      color: #fff;
    }
  }
  &__input {
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
</style>