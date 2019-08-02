<template>
  <div class="headers">
    <!-- search -->
    <div class="search">
      <input
        :value="value"
        @input="handleInput($event)"
        class="search__input"
        placeholder="输入仓库名或作者名..."
      />
      <svg
        class="search__icon"
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
  name: 'headers',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      operations: {
        filter: {
          icon: require('@img/filter-con.svg'),
          action() {
            this.$store.commit('toggleFilterMenu', true);
          },
        },
        menus: {
          icon: require('@img/menu-con.svg'),
          action() {
            this.$store.commit('toggleSettingMenu', true);
          },
        },
      },
    };
  },
  watch: {
    sortingWay(newVal) {
      this.$set(this.operations.filter, 'active', !!(this.sortingWay || this.filterLanguage));
    },
    filterLanguage(newVal) {
      this.$set(this.operations.filter, 'active', !!(this.sortingWay || this.filterLanguage));
    },
  },
  computed: {
    ...mapState(['sortingWay', 'filterLanguage']),
  },
  methods: {
    handleAction(action) {
      typeof action === 'function' && action.call(this);
    },
    handleInput: debounce(function($event) {
      this.$emit('update:value', $event.target.value);
    }, 300),
  },
};
</script>

<style scoped lang="less">
.headers {
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