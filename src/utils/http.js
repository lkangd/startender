import Axios from 'axios';
import GH from '@/github/config';
import Store from '@/content/store';
import Toast from '@/content/components/toast/index';

const $http = (() => {
  const $http = Axios.create({ baseURL: GH.API_V3 });

  $http.interceptors.request.use(
    config => {
      if (Store.state.accessToken) {
        config.headers.Authorization = `token ${Store.state.accessToken}`;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  $http.interceptors.response.use(
    response => {
      return response;
    },
    ({ response }) => {
      if (response.status == 401) {
        Store.commit('UPDATE_ACCESS_TOKEN');
        Toast.error({ mountPoint: '#stars-helper', text: '授权失效，请重新授权' });
      } else {
        Toast.error({ mountPoint: '#stars-helper', text: '数据加载失败，请刷新页面后再试' });
      }
      return Promise.reject(response);
    },
  );
  return $http;
})();

export default $http;
