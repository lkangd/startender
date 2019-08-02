import Axios from 'axios';
import GH from '@/github/config';
import Store from '@/content/store';

const $http = (() => {
  const $http = Axios.create({ baseURL: GH.API });

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
      return Promise.reject(response);
    },
  );
  return $http;
})();

export default $http;
