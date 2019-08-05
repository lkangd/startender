import GroupController from '@/controller/group';
import RemarkController from '@/controller/remark';
import TagController from '@/controller/tag';
import $storageSync from '@/utils/storage-sync';

export default {
  data: null,
  async init() {
    if (!this.data) {
      this.data = { tags: { tags: {}, repos: {} }, groups: { groups: {}, repos: {} }, remarks: {} };
    }
    try {
      const { GITHUB_STARS_HELPER_DATA } = await $storageSync.get({ GITHUB_STARS_HELPER_DATA: this.data });
      this.data = GITHUB_STARS_HELPER_DATA;
    } catch (error) {
      console.error('Storage init state error :', error);
    }
    return this.data;
  },
  async saveState(controller) {
    switch (true) {
      case controller instanceof GroupController:
        this.data.groups = controller.store;
        break;
      case controller instanceof RemarkController:
        this.data.remarks = controller.store;
        break;
      case controller instanceof TagController:
        this.data.tags = controller.store;
        break;
      default:
        break;
    }
    try {
      await $storageSync.set('GITHUB_STARS_HELPER_DATA', this.data);
      return true;
    } catch (error) {
      console.error('Storage save state error :', error);
      return false;
    }
  },
  async loadState(controller) {
    try {
      await this.init();
    } catch (error) {
      console.error('Storage load state error :', error);
      return false;
    }
    switch (true) {
      case controller instanceof GroupController:
        controller.store = this.data.groups;
        break;
      case controller instanceof RemarkController:
        controller.store = this.data.remarks;
        break;
      case controller instanceof TagController:
        controller.store = this.data.tags;
        break;
      default:
        break;
    }
    return true;
  },
  async setState(data = { tags: { tags: {}, repos: {} }, groups: { groups: {}, repos: {} }, remarks: {} }) {
    this.data = data;
    await $storageSync.set('GITHUB_STARS_HELPER_DATA', this.data);
    console.warn('Storage clear!');
  },
};
