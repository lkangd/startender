<template>
  <div
    :class="{ 'toggle--open': $store.state.dom.showPanel }"
    @click="$store.commit('dom/CLOSE_PANEL')"
    @mouseenter="$store.commit('dom/OPEN_PANEL')"
    class="toggle"
  >
    <svg
      class="toggle__loading"
      v-html="require('@img/puff.svg')"
      v-if="loading"
    />
    <svg
      class="toggle__icon"
      v-else
      v-html="require('@img/arrow-con.svg')"
    />
    <span class="toggle__text">stars-helper</span>
  </div>
</template>

<script>
/* eslint-disable no-console */

export default {
  name: 'toggle',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="less">
.toggle {
  position: absolute;
  left: -30px;
  top: 211px;
  z-index: 98;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px 6px;
  width: 30px;
  height: 116px;
  text-align: center;
  background-color: rgb(242, 245, 247);
  border: 1px solid rgb(224, 228, 231);
  border-right: none;
  border-radius: 4px 0px 0px 4px;
  box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
  cursor: pointer;
  user-select: none;
  &--open {
    .toggle__icon {
      transform: rotateZ(0);
    }
  }
  &__loading {
    width: 18px;
    height: 18px;
  }
  &__icon {
    width: 7px;
    height: 10px;
    transform: rotateZ(180deg);
  }
  &__text {
    flex: 1;
    font-size: 12px;
    color: rgb(15, 46, 71);
    text-align: left;
    transform: rotate(-180deg);
    writing-mode: tb-rl;
  }
}
</style>