<template>
  <transition
    @after-leave="handleAfterLeave"
    name="loading-fade"
  >
    <div
      class="loading"
      v-show="visible"
    >
      <img
        class="loading__icon"
        src="@img/octocat-spinner-128.gif"
      />
      <p class="loading__text">{{ text }}</p>
    </div>
  </transition>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'loading',
  data() {
    return {
      text: '数据加载中...',
      closed: false,
      visible: false,
    };
  },
  watch: {
    closed(newVal) {
      newVal && (this.visible = false);
    },
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

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.6);
  user-select: none;
  .transitions(loading-fade, opacity, 0);
  &__icon {
    width: 46px;
    height: 46px;
  }
  &__text {
    font-size: 12px;
    color: rgb(36, 41, 46);
    margin-top: 20px;
  }
}
</style>