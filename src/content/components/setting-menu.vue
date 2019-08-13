<script>
/* eslint-disable no-console */
import { saveAs } from 'file-saver';

import Storage from '@/storage';
import { starRepo } from '@/github/api-v3';
import $storageSync from '@/utils/storage-sync';

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
            async action() {
              await this.$store.dispatch('repo/UPDATE_REPOS_BASE', false);
              this.$toast.success('数据已刷新');
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
              let backupFileName = 'github-stars-helper';
              const changeBackupFileName = $event => (backupFileName = $event.target.value);
              this.$popup({
                title: `备份管理数据书签`,
                text: (
                  <ul class="setting-menu__popup">
                    <li class="setting-menu__select">
                      <span>备份文件名称:</span>
                      <input type="text" value={backupFileName} placeholder="github-stars-helper.json" onInput={changeBackupFileName}></input>
                    </li>
                  </ul>
                ),
                confirmBtnText: '立即备份',
                cancelBtnText: '取消',
              })
                .then(() => {
                  const { tags } = this.$store.state.tag.controller.store;
                  const { groups } = this.$store.state.group.controller.store;
                  const remarks = this.$store.state.remark.controller.store;
                  const data = JSON.stringify({ groups, tags, remarks }, null, 2);
                  const file = new File([data], `${backupFileName || 'github-stars-helper'}.json`, { type: 'text/plain;charset=utf-8' });
                  saveAs(file);
                  this.$toast.success('备份管理数据成功');
                })
                .catch(() => {});
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
            action() {
              const clearOptions = [
                {
                  name: '授权 Access Token',
                  checked: false,
                  action: () => $storageSync.delete('GITHUB_STARS_HELPER_ACCESS_TOKEN'),
                },
                {
                  name: '标签数据',
                  checked: false,
                  action: () => this.$store.dispatch('tag/REVERT_STORE', {}),
                },
                {
                  name: '分组数据',
                  checked: false,
                  action: () => this.$store.dispatch('group/REVERT_STORE', {}),
                },
                {
                  name: '备注数据',
                  checked: false,
                  action: () => this.$store.dispatch('remark/REVERT_STORE', {}),
                },
                {
                  name: '星标仓库数据',
                  checked: false,
                  action: () => {
                    localStorage.removeItem('stars_helper.starred_repos');
                    localStorage.removeItem('stars_helper.starred_repos_id');
                    localStorage.removeItem('stars_helper.languages_count');
                    localStorage.removeItem('stars_helper.project_starred');
                  },
                },
              ];
              const hanleOptionCheck = (option, $event) => (option.checked = $event.target.checked);
              this.$popup({
                title: '清除管理数据',
                text: (
                  <ul class="setting-menu__popup">
                    <li class="setting-menu__select">
                      <span>选择需要清除的数据:</span>
                    </li>
                    {clearOptions.map((option, index) => (
                      <li class="setting-menu__select">
                        <input type="checkbox" id={`checkbox${index}`} onInput={hanleOptionCheck.bind(null, option)}></input>
                        <label for={`checkbox${index}`}>{option.name}</label>
                      </li>
                    ))}
                    <li class="setting-menu__select">
                      <i>Tip: !!! 请确保已备份重要数据 !!!</i>
                    </li>
                  </ul>
                ),
                confirmBtnText: '立即清除',
                cancelBtnText: '取消',
              })
                .then(async () => {
                  const loading = this.$loading('数据清除中...');
                  try {
                    const actions = clearOptions.filter(option => option.checked).map(async option => await option.action());
                    for (const action of actions) await action;

                    loading.update('插件重启中...');
                    this.$toast.success('清除管理数据成功');
                    window.location.reload();
                  } catch (e) {
                    loading.update('插件重启中...');
                    this.$toast.error('清除管理数据失败');
                    window.location.reload();
                  }
                })
                .catch(() => {});
            },
          },
        ],
        [
          {
            name: '导出分组书签',
            action() {
              const { groups } = this.$store.state.group.controller.store;
              this._generateBookmarks(groups, '分组');
            },
          },
          {
            name: '导出标签书签',
            action() {
              const { tags } = this.$store.state.tag.controller.store;
              this._generateBookmarks(tags, '标签');
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
            this.$store.dispatch('tag/REVERT_STORE', data.tags),
            this.$store.dispatch('group/REVERT_STORE', data.groups),
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
    _generateBookmarks(source, type) {
      const data = { children: [] };
      for (const id in source) {
        if (source.hasOwnProperty(id)) {
          const folder = source[id];
          const bookmark = {
            name: folder.name,
            children: folder.repos.map(this._generateBookmarkItem),
            checked: true,
          };
          if (folder.order === undefined) {
            data.children.push(bookmark);
          } else {
            data.children[folder.order] = bookmark;
          }
        }
      }
      data.children = data.children.filter(folder => folder && folder.children.length);
      if (!data.children.length) {
        this.$toast.warning(`暂无${type}书签数据`);
        return;
      }
      const names = {
        分组: 'Github Starred Repos Groups',
        标签: 'Github Starred Repos Tags',
      };
      let exportingBmFolderName = names[type];
      const changeExportingBmFolderName = $event => (exportingBmFolderName = $event.target.value);
      const hanleBmFolderCheck = (folder, $event) => (folder.checked = $event.target.checked);

      this.$popup({
        title: `根据${type}导出书签`,
        text: (
          <ul class="setting-menu__popup">
            <li class="setting-menu__select">
              <span>书签目录名称:</span>
              <input type="text" value={exportingBmFolderName} placeholder={names[type]} onInput={changeExportingBmFolderName}></input>
            </li>
            {data.children.map((folder, index) => (
              <li class="setting-menu__select select-item">
                <input checked type="checkbox" id={`checkbox${index}`} onInput={hanleBmFolderCheck.bind(null, folder)}></input>
                <label for={`checkbox${index}`}>
                  {folder.name}({folder.children.length})
                </label>
              </li>
            ))}
          </ul>
        ),
        confirmBtnText: '立即导出',
        cancelBtnText: '取消',
      }).then(() => {
        data.name = exportingBmFolderName || names[type];
        data.children = data.children.filter(folder => folder.checked);
        if (!data.children.length) {
          this.$toast.warning(`不能导出空书签数据`);
          return;
        }
        chrome.runtime.sendMessage({ action: 'bookmarks', data }, response => {
          this.$toast.success(`导出${type}书签成功!`);
        });
      });
    },
    _generateBookmarkItem(repoID) {
      if (this.$store.state.repo.reposFiltered[repoID]) {
        const { nameWithOwner, url } = this.$store.state.repo.reposFiltered[repoID];
        return {
          name: nameWithOwner,
          url,
        };
      }
    },
  },
  render(h) {
    return (
      <div class="setting-menu redredred" onClick={this.handleClick}>
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
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.setting-menu {
  .cover-top(fixed, 99);
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
      color: #fff;
      background-color: #0366d6;
    }
  }
  &__input {
    .cover-top(absolute, 9999);
    margin: auto;
    width: 100%;
    height: 100%;
    font-size: 0;
    border: 0;
    outline: none;
    background-color: transparent;
    opacity: 0;
  }
  &__popup {
    padding: 30px 40px;
    max-height: 400px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    text-align: left;
    font-size: 13px;
    list-style: none;
  }
  &__select {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    & + & {
      margin-top: 10px;
    }
    > label {
      flex: 1;
      padding-left: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #24292e;
      user-select: none;
    }
    > input {
      &:not([type='checkbox']) {
        flex: 1;
        margin-left: 10px;
      }
    }
    > i {
      font-size: 12px;
      font-weight: 400;
      color: rgb(88, 96, 105);
    }
  }
}
</style>