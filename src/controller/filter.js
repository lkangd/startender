const SORTER_METHODS = [
  {
    name: '最近标记',
    id: '',
  },
  {
    name: '最近活动',
    id: Symbol('pushedAt'),
    action: (aRepo, bRepo) => new Date(bRepo.pushedAt) - new Date(aRepo.pushedAt),
  },
  {
    name: '最多标记',
    id: Symbol('totalCount'),
    action: (aRepo, bRepo) => bRepo.stargazers.totalCount - aRepo.stargazers.totalCount,
  },
  {
    name: '最多Fork',
    id: Symbol('forkCount'),
    action: (aRepo, bRepo) => bRepo.forkCount - aRepo.forkCount,
  },
  {
    name: '作者名正序',
    id: Symbol('nameWithOwner'),
    action: (aRepo, bRepo) => aRepo.nameWithOwner.localeCompare(bRepo.nameWithOwner),
  },
  {
    name: '仓库名正序',
    id: Symbol('name'),
    action: (aRepo, bRepo) => aRepo.name.localeCompare(bRepo.name),
  },
];
SORTER_METHODS.forEach(item => item.id && (SORTER_METHODS[item.id] = item.action));

export default class FilterController {
  constructor() {
    this.sorterMethods = SORTER_METHODS;
    this.sorterOptions = {
      methodID: null,
    };
    this.filterOptions = {
      language: null,
      search: null,
      tag: null,
    };
  }
  /**
   *
   *
   * @param {*} { groups, tags, remarks }
   * @memberof FilterController
   */
  init({ groups, tags, remarks }) {
    this.remarks = remarks;
    this.groups = groups;
    this.tags = tags;
  }
  /**
   *
   *
   * @param {*} repos
   * @returns
   * @memberof FilterController
   */
  run(repos) {
    const result = [];
    for (let i = 0, repo; (repo = repos[i++]); ) {
      this._verdict(repo) && result.push(repo);
    }
    if (typeof this.sorterMethods[this.sorterOptions.methodID] === 'function') {
      return result.sort(this.sorterMethods[this.sorterOptions.methodID]);
    }
    return result;
  }
  /**
   *
   *
   * @param {*} sorterMethod
   * @memberof FilterController
   */
  setSorter(sorterMethod) {
    this.sorterOptions.methodID = sorterMethod;
  }
  /**
   *
   *
   * @param {*} tagId
   * @memberof FilterController
   */
  setTag(tagId) {
    this.filterOptions.tag = tagId;
  }
  /**
   *
   *
   * @param {*} language
   * @memberof FilterController
   */
  setLanguage(language) {
    this.filterOptions.language = language;
  }
  /**
   *
   *
   * @param {*} search
   * @memberof FilterController
   */
  setSearch(search) {
    this.filterOptions.search = search;
  }
  /**
   *
   *
   * @param {*} repo
   * @returns
   * @memberof FilterController
   */
  _verdict(repo) {
    return this._verdictLanguage(repo) && this._verdictSearch(repo) && this._verdictTag(repo);
  }
  /**
   *
   *
   * @param {*} repo
   * @returns
   * @memberof FilterController
   */
  _verdictTag(repo) {
    if (String(this.filterOptions.tag) === 'Symbol(UN_TAGED_ID)') {
      const { tags } = this.tags.store;
      const repos = [];
      for (const id in tags) {
        if (tags.hasOwnProperty(id)) {
          const tag = tags[id];
          repos.push(...tag.repos);
        }
      }
      if (repos.includes(repo.id)) {
        return false;
      }
    } else if (String(this.filterOptions.tag) === 'Symbol(ALL_TAGED_ID)') {
      return true;
    } else if (this.filterOptions.tag) {
      const tag = this.tags.store.tags[this.filterOptions.tag];
      if (!tag.repos.includes(repo.id)) {
        return false;
      }
    }
    return true;
  }
  /**
   *
   *
   * @param {*} repo
   * @returns
   * @memberof FilterController
   */
  _verdictSearch(repo) {
    if (this.filterOptions.search) {
      const searchRegexp = new RegExp(
        `.*${this.filterOptions.search
          .trim()
          .split(/\ +/g)
          .join('.*')}.*`,
        'i',
      );
      const repoRemark = this.remarks.store[repo.id];
      if (
        !searchRegexp.test(repo.nameWithOwner) &&
        !searchRegexp.test(repo.description) &&
        !searchRegexp.test(repo.name) &&
        !searchRegexp.test(repoRemark)
      ) {
        return false;
      }
    }
    return true;
  }
  /**
   *
   *
   * @param {*} repo
   * @returns
   * @memberof FilterController
   */
  _verdictLanguage(repo) {
    if (this.filterOptions.language) {
      if (!repo.primaryLanguage || repo.primaryLanguage.name !== this.filterOptions.language) {
        return false;
      }
    }
    return true;
  }
}
