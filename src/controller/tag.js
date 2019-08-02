import Storage from '@/storage';
import shortid from 'shortid';
import Vue from 'vue';

export default class TagController {
  constructor() {
    this.nameMap = {};
    this.store = { tags: {}, repos: {} };
  }
  /**
   *
   *
   * @param {Object} tag { name: string, repoId: string }
   * @memberof TagController
   */
  add({ name, repoId }) {
    const existTag = this.nameMap[name];
    if (existTag) {
      const targetTag = this.store.tags[existTag];
      targetTag.repos.push(String(repoId));
      this.save();
      return existTag;
    }

    const newTagId = shortid.generate();
    this.nameMap[name] = newTagId;
    const repos = [];
    repoId && repos.push(repoId);
    Vue.set(this.store.tags, newTagId, { name, repos });
    this.save();
    return newTagId;
  }
  update({ id, name, repos }) {
    Vue.set(this.store.tags, id, { name, repos });
    this.save();
  }
  /**
   *
   *
   * @param {Object} repo { id: string, tagNames: [string...] }
   * @memberof TagController
   */
  updateRepo({ id, tagNames }) {
    // initialize current repo tags
    const repoCurrentTags = this.store.repos[id];
    if (repoCurrentTags && repoCurrentTags.length) {
      repoCurrentTags.forEach(tagId => {
        const targetTag = this.store.tags[tagId];
        targetTag.repos = targetTag.repos.filter(tagId => tagId !== String(id));
      });
    }
    Vue.set(this.store.repos, id, []);

    tagNames.forEach(tagName => {
      const existTagId = this.nameMap[tagName];
      if (existTagId) {
        !this.store.repos[id].includes(existTagId) && this.store.repos[id].push(existTagId);
        !this.store.tags[existTagId].repos.includes(String(id)) && this.store.tags[existTagId].repos.push(String(id));
      } else {
        const finalTagId = this.add({ name: tagName, repoId: String(id) });
        this.store.repos[id].push(finalTagId);
      }
    });
    this.save();
  }
  /**
   *
   *
   * @param {String} id tagId
   * @memberof TagController
   */
  delete(id) {
    const { repos, name } = this.store.tags[id];
    repos.forEach(repoId => {
      Vue.set(this.store.repos, repoId, this.store.repos[repoId].filter(tagId => tagId !== id));
    });
    this.nameMap[name] = '';
    delete this.nameMap[name];
    Vue.set(this.store.tags, id, '');
    delete this.store.tags[id];
    this.save();
  }
  clear() {
    this.nameMap = {};
    this.store = { tags: {}, repos: {} };
    this.save();
  }
  initNameMap() {
    this.nameMap = {};
    for (const key in this.store.tags) {
      if (this.store.tags.hasOwnProperty(key)) {
        const tag = this.store.tags[key];
        this.nameMap[tag.name] = key;
      }
    }
  }
  clearEmpty() {
    for (const key in this.store.tags) {
      if (this.store.tags.hasOwnProperty(key) && this.store.tags[key].repos.length === 0) {
        this.delete(key);
      }
    }
  }
  async init() {
    const result = await Storage.loadState(this);
    this.clearEmpty();
    this.initNameMap();
    return result;
  }
  async revertStore(backupData) {
    if (typeof backupData !== 'object') {
      return Promise.reject(new Error('Wrong tags data structure!'));
    }
    this.store = { tags: {}, repos: {} };
    for (const tagId in backupData) {
      const tag = backupData[tagId];
      if (backupData.hasOwnProperty(tagId) && typeof tag.name === 'string' && Array.isArray(tag.repos)) {
        this.store.tags[tagId] = tag;
        for (let i = 0; i < tag.repos.length; i++) {
          const repoId = tag.repos[i];
          if (typeof repoId === 'string') {
            if (!this.store.repos[repoId]) {
              this.store.repos[repoId] = [];
            }
            this.store.repos[repoId].push(tagId);
          }
        }
      }
    }
    await this.save();
  }
  save() {
    return Storage.saveState(this);
  }
}
