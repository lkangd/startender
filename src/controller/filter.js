const SORTER_METHODS = {
  name: (aRepo, bRepo) => aRepo.name.localeCompare(bRepo.name),
  forkCount: (aRepo, bRepo) => aRepo.forkCount - bRepo.forkCount,
  pushedAt: (aRepo, bRepo) => new Date(bRepo.pushedAt) - new Date(aRepo.pushedAt),
  nameWithOwner: (aRepo, bRepo) => aRepo.nameWithOwner.localeCompare(bRepo.nameWithOwner),
  totalCount: (aRepo, bRepo) => bRepo.stargazers.totalCount - aRepo.stargazers.totalCount,
};

export default class FilterController {
  constructor() {
    this.sorters = {
      method: null,
    };
    this.filterOptions = {
      language: null,
      search: null,
      tag: null,
    };
  }
  init({ groups, tags, remarks }) {
    this.remarks = remarks;
    this.groups = groups;
    this.tags = tags;
  }
  run(repos) {
    const result = [];
    for (let i = 0, repo; (repo = repos[i++]); ) {
      this._verdict(repo) && result.push(repo);
    }
    if (typeof SORTER_METHODS[this.sorters.method] === 'function') {
      return result.sort(SORTER_METHODS[this.sorters.method]);
    }
    return result;
  }
  setSorter(sorterMethod) {
    this.sorters.method = sorterMethod;
  }
  setTag(tagId) {
    this.filterOptions.tag = tagId;
  }
  setLanguage(language) {
    this.filterOptions.language = language;
  }
  setSearch(search) {
    this.filterOptions.search = search;
  }
  _verdict(repo) {
    return this._verdictLanguage(repo) && this._verdictSearch(repo) && this._verdictTag(repo);
  }
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
  _verdictLanguage(repo) {
    if (this.filterOptions.language) {
      if (!repo.primaryLanguage || repo.primaryLanguage.name !== this.filterOptions.language) {
        return false;
      }
    }
    return true;
  }
}
