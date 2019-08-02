<template>
  <div
    class="authorize"
    v-if="!$store.state.accessToken"
  >
    <p class="authorize__text">Github Stars Helper 需要使用您的 Access Token 进行星标仓库加载</p>
    <a
      class="authorize__link"
      href="#"
      target="_blank"
    >查看详细授权说明</a>
    <a
      :href="authURL"
      class="authorize__btn"
    >授权获取星标仓库</a>
  </div>
</template>

<script>
/* eslint-disable no-console */
import GH from '@/github/config';

export default {
  name: 'authorize',
  data() {
    return {
      authURL: GH.AUTH_URL,
    };
  },
};
</script>

<style scoped lang="less">
.authorize {
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
  text-align: center;
  background-color: rgba(255, 255, 255, 0.4);
  &__text {
    padding: 0 70px;
    line-height: 1.7;
  }
  &__link {
    margin: 10px 0 30px;
    font-size: 12px;
    text-decoration: underline;
  }
  &__btn {
    width: 200px;
    height: 34px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 600;
    background-position: -1px -1px;
    background-repeat: repeat-x;
    background-size: 110% 110%;
    border: 1px solid rgba(27, 31, 35, 0.2);
    border-radius: 3px;
    color: #fff;
    background-color: #28a745;
    background-image: linear-gradient(-180deg, #34d058, #28a745 90%);
    text-decoration: none;
    cursor: pointer;
    &:hover {
      background-color: #269f42;
      background-image: linear-gradient(-180deg, #2fcb53, #269f42 90%);
      background-position: -0.5em;
      border-color: rgba(27, 31, 35, 0.5);
    }
  }
}
</style>