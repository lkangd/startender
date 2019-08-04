export default {
  APP_NAME: 'github-stars-helper',
  SCOPE: 'user:email,repo',
  ID: 'b737c78d9d53ed98c465',
  API_V3: 'https://api.github.com',
  API_V4: 'https://api.github.com/graphql',
  SECRET: '6b2ef98bc973dd0348d87b75fd62bd6b28a533d9',
  SITE: 'https://github.com?auth-type=github-stars-helper',
  AUTH_URL_ORIGIN: 'https://github.com/login/oauth/authorize',
  ACCESS_TOKEN_URL: 'https://github.com/login/oauth/access_token',
  get AUTH_URL() {
    return `${this.AUTH_URL_ORIGIN}?client_id=${this.ID}&redirect_uri=${this.SITE}&scope=${this.SCOPE}`;
  },
};
