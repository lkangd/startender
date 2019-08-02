<template>
  <transition
    @after-leave="handleAfterLeave"
    name="toast-fade"
  >
    <div
      :class="[`toast--${type}`]"
      :style="positionStyle"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      class="toast"
      v-show="visible"
    >
      <p class="toast__text">{{ text }}</p>
      <svg
        @click.stop="close"
        class="toast__icon"
        v-html="require('@img/close-con.svg')"
      />
    </div>
  </transition>
</template>

<script>
/* eslint-disable no-console */
const TYPE_MAP = {
  info: 'info',
  error: 'error',
  warning: 'warning',
  success: 'success',
};

export default {
  name: 'toast',
  data() {
    return {
      type: 'info',
      text: '数据刷新成功!',
      closed: false,
      visible: false,
      timer: null,
      duration: 3000,
      verticalOffset: 49,
      onClose: null,
    };
  },
  computed: {
    positionStyle() {
      return {
        top: `${this.verticalOffset}px`,
      };
    },
  },
  watch: {
    closed(newVal) {
      newVal && (this.visible = false);
    },
  },
  mounted() {
    this.startTimer();
  },
  methods: {
    handleAfterLeave() {
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    close() {
      this.closed = true;
      typeof this.onClose === 'function' && this.onClose(this);
    },
    update(text) {
      this.text = text;
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
    },
    clearTimer() {
      clearTimeout(this.timer);
    },
  },
};
</script>

<style scoped lang="less">
.transitions(@name, @tranStyle, @tranArgs, @tranType: all 0.3s ease,) {
  &.@{name}-enter-active {
    transition: @tranType;
  }
  &.@{name}-leave-active {
    transition: @tranType;
  }
  &.@{name}-enter,
  &.@{name}-leave-to {
    @{tranStyle}: @tranArgs;
  }
}

.toast {
  position: absolute;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px 0 12px;
  height: 30px;
  color: rgb(36, 41, 46);
  background-color: #fff;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  border: 1px solid;
  background-clip: padding-box;
  border-right: none;
  box-shadow: 0 2px 7px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  user-select: none;
  .transitions(toast-fade, opacity, 0);
  .transitions(toast-fade, transform, translateX(100%));
  &--info {
    color: rgba(100, 100, 100, 0.8);
    border-color: rgba(100, 100, 100, 0.6);
  }
  &--success {
    color: rgba(40, 167, 69, 0.8);
    border-color: rgba(40, 167, 69, 0.6);
  }
  &--error {
    color: rgba(203, 36, 49, 0.8);
    border-color: rgba(203, 36, 49, 0.6);
  }
  &--warning {
    color: rgba(255, 120, 0, 0.8);
    border-color: rgba(255, 120, 0, 0.6);
  }
  &__text {
    font-size: 12px;
    font-weight: 400;
  }
  &__icon {
    margin-left: 8px;
    width: 12px;
    height: 12px;
    cursor: pointer;
  }
}
</style>