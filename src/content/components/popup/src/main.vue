<template>
  <transition
    @after-leave="handleAfterLeave"
    name="popup-fade"
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
        <!-- content -->
        <div class="popup__content-wrapper">
          <pre
            class="popup__default-text"
            v-if="text"
          >{{ text }}</pre>
          <!-- slot -->
          <slot v-else></slot>
        </div>
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
const toggleBodyScroll = bool => {
  const { classList } = document.querySelector('body');
  classList[(bool && 'remove') || 'add']('stars-helper-fixed-body');
};

export default {
  name: 'popup',
  data() {
    return {
      closed: false,
    };
  },
  watch: {
    closed(newVal) {
      if (newVal) {
        if (this.$parent) {
          this.$emit('update:visible', false);
        } else {
          this.visible = false;
        }
      }
    },
  },
  mounted() {
    toggleBodyScroll(false);
  },
  beforeDestroy() {
    toggleBodyScroll(true);
  },
  methods: {
    handleAfterLeave() {
      if (this.$parent) {
        this.$emit(this.emitType);
      } else {
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      }
    },
    close() {
      this.closed = true;
    },
    handleConfirm() {
      if (typeof this.handleConfirmResolve === 'function') {
        this.handleConfirmResolve('confirm');
      }
      this.close();
      this.emitType = 'confirm';
    },
    handleCancel() {
      if (typeof this.cancalCallback === 'function') {
        this.cancalCallback();
        return;
      }
      if (typeof this.handleCancelReject === 'function') {
        this.handleCancelReject('cancel');
      }
      this.close();
      this.emitType = 'cancel';
    },
    handleClose() {
      if (typeof this.handleCancelReject === 'function') {
        this.handleCancelReject('close');
      }
      this.close();
      this.emitType = 'close';
    },
  },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

@keyframes slide-down {
  0% {
    transform: translateY(-100px);
  }
  100% {
    transform: translateY(0);
  }
}

.popup {
  .cover-top(fixed, 99);
  background-color: rgba(27, 31, 35, 0.5);
  .transitions(popup-fade, opacity, 0);
  &__panel {
    position: relative;
    margin: 69px auto;
    width: 450px;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #444d56;
    border-radius: 3px;
    box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s -0.1s 1;
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