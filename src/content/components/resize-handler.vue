<template>
  <div
    @mousedown="handleMousedown"
    class="resize-handler"
  />
</template>

<script>
/* eslint-disable no-console */
let resize = null,
  stopResize = null,
  resizable = false;

export default {
  name: 'resize-handler',
  mounted() {
    resize = this.resize.bind(this);
    stopResize = this.stopResize.bind(this);
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
  },
  methods: {
    resize(evt) {
      if (!resizable) return;
      const { movementX } = evt;
      movementX && this.$store.commit('dom/UPDATE_SIDEBAR_WIDTH', -movementX);
    },
    stopResize() {
      resizable = false;
    },
    handleMousedown() {
      resizable = true;
    },
  },
};
</script>

<style scoped lang="less">
@import '~@/assets/less/mixins.less';

.resize-handler {
  .cover-top(absolute, 100);
  right: unset;
  left: -4px;
  width: 8px;
  background-color: transparent;
  cursor: col-resize;
  user-select: none;
}
</style>