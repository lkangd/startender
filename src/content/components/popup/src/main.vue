<template>
  <transition
    @after-leave="handleAfterLeave"
    name="show"
  >
    <div
      class="popup"
      v-show="visible"
    >
      <div class="popup__panel">
        <!-- title -->
        <h3 class="popup__title">
          <span>{{ title }}</span>
          <button @click="handleClose">
            <svg v-html="require('@img/close-con.svg')" />
          </button>
        </h3>
        <!-- slot -->
        <div
          class="popup__default-text"
          v-if="text"
        >{{ text }}</div>
        <slot v-else></slot>
        <!-- btns -->
        <div class="popup__operations">
          <button
            @click="handleConfirm"
            class="popup__btn stars-helper-btn stars-helper-btn--highlight"
          >{{ confirmBtnText }}</button>
          <button
            @click="handleCancel"
            class="popup__btn stars-helper-btn"
            v-if="cancelBtnText"
          >{{ cancelBtnText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'popup',
  watch: {
    closed(newVal) {
      newVal && (this.visible = false);
    },
  },
  created() {
    // console.log('this.text :', this.text);
  },
  methods: {
    handleAfterLeave() {
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    close() {
      this.closed = true;
    },
    handleConfirm() {
      if (typeof this.handleConfirmResolve === 'function') {
        this.handleConfirmResolve('confirm');
        this.close();
      } else {
        this.$emit('confirm');
      }
    },
    handleCancel() {
      if (typeof this.handleCancelReject === 'function') {
        this.handleCancelReject('cancel');
        this.close();
      } else {
        this.$emit('cancel');
      }
    },
    handleClose() {
      if (typeof this.handleCancelReject === 'function') {
        this.handleCancelReject('close');
        this.close();
      } else {
        this.$emit('close');
      }
    },
  },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.popup {
  .cover-top(fixed, 99);
  background-color: rgba(27, 31, 35, 0.5);
  &__panel {
    position: relative;
    margin: 69px auto;
    width: 450px;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #444d56;
    border-radius: 3px;
    box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);
  }
  &__title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 16px;
    color: #24292e;
    background-color: #f6f8fa;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom: 1px solid #e1e4e8 !important;
    border-width: 0 0 1px;
    > span {
      font-size: 14px;
      font-weight: 600;
    }
    > button {
      padding: 0;
      color: #586069;
      background-color: transparent;
      outline: none;
      border: none;
      &:hover {
        color: #0366d6;
      }
      > svg {
        width: 12px;
        height: 16px;
      }
    }
  }
  &__default-text {
    padding: 30px 20px;
    text-align: center;
    font-size: 13px;
  }
  &__operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    top: -1px;
    z-index: 200;
    padding: 16px;
    border-top: 1px solid #e1e4e8;
  }
  &__btn {
    width: 200px;
  }
}
</style>