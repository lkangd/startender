import Storage from '@/storage';
import shortid from 'shortid';

export default class GroupController {
  constructor() {
    this.nameMap = {};
    this.store = { groups: {}, repos: {} };
  }
  /**
   *
   *
   * @param {Object} group { name: string, repoId?: string }
   * @returns newGroupId
   * @memberof GroupController
   */
  add({ name, repoId, order }) {
    const existGroup = this.nameMap[name];
    if (existGroup) {
      const targetGroup = this.store.groups[existGroup];
      repoId && targetGroup.repos.push(repoId);
      this._save();
      return existGroup;
    }

    const newGroupId = shortid.generate();
    this.nameMap[name] = newGroupId;
    const repos = [];
    repoId && repos.push(repoId);
    order = order === undefined ? Object.keys(this.store.groups).length : order;

    this.store.groups[newGroupId] = { name, repos, order };
    this._save();
    return newGroupId;
  }
  /**
   *
   *
   * @param {Object} group { id: string, name: string, order: number, repos: [string...] }
   * @memberof GroupController
   */
  update({ id, name, order, repos }) {
    if (!id) return;

    this.store.groups[id] = { name, order, repos };
    this._updateNameMap({ id, name });
    this._save();
  }
  /**
   *
   *
   * @param {Object} repo { id: string, group: { id: string, name: string } }
   * @memberof GroupController
   */
  updateRepo({ id, group }) {
    if (!id) return;

    const repoCurrentGroupId = this.store.repos[id];
    // when input group id equal exist one, do nothing
    if (repoCurrentGroupId && repoCurrentGroupId === group.id) {
      return;
    }
    // delete repo from exist group when input group id not equal exist one
    if (repoCurrentGroupId && repoCurrentGroupId !== group.id) {
      const targetGroup = this.store.groups[repoCurrentGroupId];
      targetGroup.repos = targetGroup.repos.filter(item => item !== id);
    }
    this.store.repos[id] = '';

    if (group.id) {
      !this.store.groups[group.id].repos.includes(id) && this.store.groups[group.id].repos.push(id);
      this.store.repos[id] = group.id;
    } else if (group.name) {
      this.store.repos[id] = this.add({ name: group.name, repoId: id });
    }
    this._save();
  }
  /**
   *
   *
   * @param {String} id groupId
   * @memberof GroupController
   */
  delete(id) {
    if (!id) return;

    const { repos, name } = this.store.groups[id];
    repos.forEach(repoId => {
      delete this.store.repos[repoId];
    });
    this.nameMap[name] = '';
    delete this.nameMap[name];
    delete this.store.groups[id];
    this._save();
  }
  /**
   *
   *
   * @memberof GroupController
   */
  clear() {
    this.nameMap = {};
    this.store = { groups: {}, repos: {} };
    this._save();
  }
  /**
   *
   *
   * @param {*} { id, name }
   * @memberof GroupController
   */
  _updateNameMap({ id, name }) {
    if (!id) return;

    for (const key in this.nameMap) {
      if (this.nameMap.hasOwnProperty(key) && this.nameMap[key] === id) {
        delete this.nameMap[key];
        this.nameMap[name] = id;
      }
    }
  }
  /**
   *
   *
   * @memberof GroupController
   */
  _initNameMap() {
    this.nameMap = {};
    for (const key in this.store.groups) {
      if (this.store.groups.hasOwnProperty(key)) {
        const group = this.store.groups[key];
        this.nameMap[group.name] = key;
      }
    }
  }
  /**
   *
   *
   * @memberof GroupController
   */
  _clearEmpty() {
    for (const key in this.store.groups) {
      if (this.store.groups.hasOwnProperty(key) && this.store.groups[key].repos.length === 0) {
        this.delete(key);
      }
    }
  }
  /**
   *
   *
   * @returns
   * @memberof GroupController
   */
  async init() {
    const result = await Storage.loadState(this);
    this._initNameMap();
    return result;
  }
  /**
   *
   *
   * @returns
   * @memberof GroupController
   */
  _save() {
    return Storage.saveState(this);
  }
  /**
   *
   *
   * @param {*} backupData
   * @returns
   * @memberof GroupController
   */
  async revertStore(backupData) {
    if (typeof backupData !== 'object') {
      return Promise.reject(new Error('Wrong groups data structure!'));
    }
    this.store = { groups: {}, repos: {} };
    for (const groupId in backupData) {
      const group = backupData[groupId];
      if (backupData.hasOwnProperty(groupId) && typeof group.name === 'string' && Array.isArray(group.repos) && typeof group.order === 'number') {
        this.store.groups[groupId] = group;
        for (let i = 0; i < group.repos.length; i++) {
          const repoId = group.repos[i];
          if (typeof repoId === 'string') {
            this.store.repos[repoId] = groupId;
          }
        }
      }
    }
    await this._save();
  }
}
