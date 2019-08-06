import Storage from '@/storage';
import shortid from 'shortid';

export default class GroupController {
  constructor() {
    this.orderBase = 0;
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
  add({ name, repoId }) {
    const existGroup = this.nameMap[name];
    if (existGroup) {
      const targetGroup = this.store.groups[existGroup];
      targetGroup.repos.push(String(repoId));
      this._save();
      return existGroup;
    }

    const newGroupId = shortid.generate();
    this.nameMap[name] = newGroupId;
    const repos = [];
    repoId && repos.push(repoId);
    const order = this.orderBase++;

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
    this.store.groups[id] = { name, order, repos };
    this._save();
  }
  /**
   *
   *
   * @param {Object} repo { id: string, group: { id: string, name: string } }
   * @memberof GroupController
   */
  updateRepo({ id, group }) {
    const repoCurrentGroupId = this.store.repos[id];
    // when input group id equal exist one, do nothing
    if (repoCurrentGroupId && repoCurrentGroupId === group.id) {
      return;
    }
    // delete repo from exist group when input group id not equal exist one
    if (repoCurrentGroupId && repoCurrentGroupId !== group.id) {
      const targetGroup = this.store.groups[repoCurrentGroupId];
      targetGroup.repos = targetGroup.repos.filter(item => item !== String(id));
    }
    this.store.repos[id] = '';

    if (group.id) {
      !this.store.groups[group.id].repos.includes(id) && this.store.groups[group.id].repos.push(String(id));
      this.store.repos[id] = group.id;
    } else if (group.name) {
      this.store.repos[id] = this.add({ name: group.name, repoId: String(id) });
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
    const { repos, name } = this.store.groups[id];
    repos.forEach(repoId => {
      delete this.store.repos[repoId];
    });
    this.nameMap[name] = '';
    delete this.nameMap[name];
    delete this.store.groups[id];
    this._save();
  }
  clear() {
    this.orderBase = 0;
    this.nameMap = {};
    this.store = { groups: {}, repos: {} };
    this._save();
  }
  _initOrder() {
    const orders = [];
    for (const key in this.store.groups) {
      if (this.store.groups.hasOwnProperty(key)) {
        const { order } = this.store.groups[key];
        orders.push(order);
      }
    }
    if (orders.length) {
      const lastOrder = Math.max.apply(null, orders);
      this.orderBase = lastOrder + 1;
    }
  }
  _initNameMap() {
    this.nameMap = {};
    for (const key in this.store.groups) {
      if (this.store.groups.hasOwnProperty(key)) {
        const group = this.store.groups[key];
        this.nameMap[group.name] = key;
      }
    }
  }
  _clearEmpty() {
    for (const key in this.store.groups) {
      if (this.store.groups.hasOwnProperty(key) && this.store.groups[key].repos.length === 0) {
        this.delete(key);
      }
    }
  }
  async init() {
    const result = await Storage.loadState(this);
    this._initNameMap();
    this._initOrder();
    return result;
  }
  _save() {
    return Storage.saveState(this);
  }
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
