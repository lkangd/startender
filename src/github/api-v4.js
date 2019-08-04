import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import GH from '@/github/config';
import Store from '@/content/store';
import Toast from '@/content/components/toast/index';
import Loading from '@/content/components/loading/index';

const link = createHttpLink({ uri: GH.API_V4 });
const cache = new InMemoryCache();
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const client = new ApolloClient({ link, cache, defaultOptions });

/**
 * get all starred repos from github
 * @export
 * @returns starredRepos: [repo...]
 */
export function getStarredRepos() {
  if (!Store.state.accessToken) return Promise.reject(new Error('Without Github Authorization!'));

  return new Promise(resolve => {
    let result = [];
    const $loading = Loading({ mountPoint: '#stars-helper', text: '数据加载中...' });
    const query = startCursor =>
      client
        .query({
          context: {
            headers: {
              Authorization: `token ${Store.state.accessToken}`,
            },
          },
          query: gql`
          {
            viewer {
              # login
              # email
              # name
              # url
              ${
                startCursor
                  ? 'starredRepositories(orderBy: {field: STARRED_AT, direction: DESC}, first: 100, after: "' + startCursor + '") {'
                  : 'starredRepositories(orderBy: {field: STARRED_AT, direction: DESC}, first: 100) {'
              }
                edges {
                  starredAt
                  # cursor
                  node {
                    id
                    name
                    owner {
                      login
                    }
                    nameWithOwner
                    primaryLanguage {
                      color
                      name
                    }
                    pushedAt
                    description
                    forkCount
                    url
                    stargazers {
                      totalCount
                    }
                  }
                }
                pageInfo {
                  endCursor
                  hasNextPage
                  hasPreviousPage
                  startCursor
                }
                totalCount
              }
            }
            rateLimit {
              limit
              cost
              remaining
              resetAt
            }
          }
        `,
        })
        .then(({ data }) => {
          const { rateLimit, viewer } = data;
          const { starredRepositories } = viewer;
          const { edges, pageInfo, totalCount } = starredRepositories;
          result = result.concat(edges);
          $loading.update(`数据加载中(${result.length}/${totalCount})...`);
          if (pageInfo.hasNextPage) {
            query(pageInfo.endCursor);
          } else {
            $loading.close();
            resolve(result);
          }
        })
        .catch(error => {
          console.error(error);
          $loading.close();
          Toast.error({ mountPoint: '#stars-helper', text: '数据加载失败，请刷新页面后再试' });
        });
    query();
  });
}
