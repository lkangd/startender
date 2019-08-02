import Storage from '@/storage';
import Vue from 'vue';

export default class RemarkController {
  constructor() {
    this.store = {};
  }
  /**
   * Add new remark
   * @param {object} remark { id: string, content: string }
   * @memberof RemarkController
   */
  add(remark) {
    Vue.set(this.store, remark.id, remark.content);
    this.save();
  }
  /**
   * Update exist remark, if the target remark don't exist, create one
   * @param {object} remark { id: string, content: string }
   * @memberof RemarkController
   */
  update(remark) {
    if (!remark.content || !remark.content.length) {
      this.delete(remark.id);
      return;
    }

    this.add(remark);
  }
  /**
   * Delete a remark form storage
   * @param {string} id starred repo id
   * @memberof RemarkController
   */
  delete(id) {
    Vue.set(this.store, id, '');
    delete this.store[id];
    this.save();
  }
  /**
   * Clear current data
   * @memberof RemarkController
   */
  clear() {
    this.store = {};
    this.save();
  }
  /**
   * Load saved data form global storage
   * @memberof RemarkController
   */
  init() {
    return Storage.loadState(this);
  }
  /**
   * Save current data to global storage
   * @memberof RemarkController
   */
  save() {
    return Storage.saveState(this);
  }
  async revertStore(backupData) {
    this.store = {};
    for (const repoId in backupData) {
      if (backupData.hasOwnProperty(repoId)) {
        const remark = backupData[repoId];
        if (typeof remark === 'string') {
          this.store[repoId] = remark;
        }
      }
    }
    await this.save();
  }
}
