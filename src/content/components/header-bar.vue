<template>
  <div class="header-bar">
    <!-- search -->
    <div class="search">
      <input
        @input="handleInput($event)"
        class="search__input"
        placeholder="输入仓库名/作者名/描述/备注..."
        v-model="value"
      />
      <svg
        @click="(value = ''), $store.dispatch('repo/SET_FILTER_SEARCH', '')"
        class="search__icon search__icon--clear"
        v-html="require('@img/input-clear-con.svg')"
        v-if="value.length"
      />
      <svg
        class="search__icon"
        v-else
        v-html="require('@img/search-key-slash.svg')"
      />
    </div>
    <!-- operations -->
    <ul class="operations">
      <li
        :class="{ 'operations__item--active': operation.active }"
        :key="key"
        @click="handleAction(operation.action)"
        class="operations__item"
        v-for="(operation, key) in operations"
      >
        <svg v-html="operation.icon" />
      </li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from 'vuex';
import { debounce } from 'lodash';

export default {
  name: 'header-bar',
  data() {
    return {
      value: '',
      operations: {
        filter: {
          icon: require('@img/filter-con.svg'),
          action() {
            this.$store.commit('dom/OPEN_FILTER_MENU');
          },
        },
        menus: {
          icon: require('@img/menu-con.svg'),
          action() {
            this.$store.commit('dom/OPEN_SETTING_MENU');
          },
        },
      },
    };
  },
  watch: {
    sortedMethodID(newVal) {
      this.$set(this.operations.filter, 'active', !!(this.sortedMethodID || this.filteredLanguage));
    },
    filteredLanguage(newVal) {
      this.$set(this.operations.filter, 'active', !!(this.sortedMethodID || this.filteredLanguage));
    },
  },
  computed: {
    ...mapState({
      sortedMethodID: state => state.repo.sortedMethodID,
      filteredLanguage: state => state.repo.filteredLanguage,
    }),
  },
  methods: {
    handleAction(action) {
      typeof action === 'function' && action.call(this);
    },
    handleInput: debounce(function($event = { target: { value: '' } }) {
      const { value } = $event.target;
      this.$store.dispatch('repo/SET_FILTER_SEARCH', value.trim());
    }, 300),
  },
};
</script>

<style scoped lang="less">
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 16px;
  height: 64px;
  line-height: 1.5;
  font-size: 14px;
  background-color: #24292e;
  border-left: 1px solid rgba(255, 255, 255, 0.125);
  .search {
    display: flex;
    align-items: center;
    margin-right: 10px;
    width: 305px;
    border-radius: 3px;
    background-color: #3e4447;
    &__input {
      flex: 1;
      padding: 0 8px;
      height: 28px;
      font-size: 14px;
      line-height: 28px;
      color: #fff;
      background-color: transparent;
      outline: none;
      border: none;
      &::placeholder {
        font-weight: 300;
        color: rgba(255, 255, 255, 0.75);
      }
    }
    &__icon {
      margin: 0 8px;
      width: 19px;
      height: 20px;
      &--clear {
        width: 12px;
        height: 12px;
        cursor: pointer;
      }
    }
  }
  .operations {
    display: flex;
    justify-content: space-around;
    align-items: center;
    &__item {
      position: relative;
      margin-left: 10px;
      width: 16px;
      height: 16px;
      color: #fff;
      &:hover {
        color: rgba(255, 255, 255, 0.7);
      }
      &--active {
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 6px;
          z-index: 2;
          width: 10px;
          height: 10px;
          color: #fff;
          background-clip: padding-box;
          background-image: linear-gradient(#54a3ff, #006eed);
          border: 2px solid #24292e;
          border-radius: 50%;
        }
      }
      > svg {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
    }
  }
}
</style>