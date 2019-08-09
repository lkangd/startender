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
      class="authorize__btn stars-helper-btn stars-helper-btn--highlight"
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
@import '~@/assets/less/mixins.less';

.authorize {
  .cover-top();
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
    line-height: 32px;
    font-weight: 600;
    text-decoration: none;
  }
}
</style>