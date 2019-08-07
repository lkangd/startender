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
.resize-handler {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4px;
  z-index: 100;
  width: 8px;
  background-color: transparent;
  cursor: col-resize;
  user-select: none;
}
</style>