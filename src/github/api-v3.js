import qs from 'qs';

import { getPageCountInLink } from '@/github/utils';
import $http from '@/utils/http';
import GH from '@/github/config';

/**
 * get OAuth access token by access code from github
 * @export
 * @param {String} code
 * @returns accessToken
 */
export async function getAccessToken(code) {
  let accessToken;
  try {
    let res = await $http.post(GH.ACCESS_TOKEN_URL, {
      client_id: GH.ID,
      client_secret: GH.SECRET,
      code,
    });
    res = qs.parse(res.data);
    accessToken = res.access_token || 'Error';
  } catch (error) {
    accessToken = 'Error';
  }
  return accessToken;
}

/**
 * get current authorized user info from github
 * @export
 * @returns userInfo: {}
 */
export async function getUserInfo() {
  let userInfo;
  try {
    const { data } = await $http.get(`/user`);
    userInfo = data;
  } catch (error) {
    throw error;
  }
  return userInfo;
}

/**
 * get all starred repos from github
 * @export
 * @returns starredRepos: [repo...]
 */
export async function getStarredRepos() {
  const starredRepos = [];
  const getData = (page = 1) => $http.get(`/user/starred?per_page=100&page=${page}`);
  try {
    // get first page
    const res = await getData(1);
    starredRepos.push(...res.data);

    const { link } = res.headers;
    const pageCount = getPageCountInLink(link);
    if (pageCount === 1) return starredRepos;

    // get all page
    const queryList = Array(pageCount - 1)
      .fill('placeholder')
      .map(async (p, i) => await getData(i + 2));

    for (const query of queryList) {
      const res = await query;
      starredRepos.push(...res.data);
    }
  } catch (error) {
    throw error;
  }
  return starredRepos;
}

/**
 * star a repo by fullRepoName
 * @export
 * @param {String} fullRepoName
 * @returns
 */
export function starRepo(fullRepoName) {
  return $http.put(`/user/starred/${fullRepoName}`);
}

/**
 * unstar a repo by fullRepoName
 * @export
 * @param {String} fullRepoName
 * @returns
 */
export function unStarRepo(fullRepoName) {
  return $http.delete(`/user/starred/${fullRepoName}`);
}
