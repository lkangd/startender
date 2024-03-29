import Storage from '@/storage';

export default class RemarkController {
  constructor() {
    this.store = {};
  }
  /**
   * Add new remark
   * @param {object} remark { id: string, content: string }
   * @memberof RemarkController
   */
  add({ id, content }) {
    this.store[id] = content;
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
  /**
   *
   *
   * @param {*} backupData
   * @memberof RemarkController
   */
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
