export default class FilterController {
  constructor(groups, tags, remarks) {
    this.groups = groups;
    this.remarks = remarks;
    this.tags = tags;
    this.currentSorter = input => input;
    this.currentFilter = {
      filterByLanguages: input => input,
      filterBySearch: input => input,
      filterByTags: input => input,
    };
  }
  setSorter(sorterName, ...args) {
    const sorterFunction = this[sorterName];
    if (sorterFunction instanceof Function) {
      this.currentSorter = sorterFunction.call(this, ...args);
    } else {
      this.currentSorter = input => input;
    }
  }
  setTagFilter(on, ...args) {
    if (on) {
      this.currentFilter.filterByTags = this.filterByTags.call(this, ...args);
    } else {
      this.currentFilter.filterByTags = input => input;
    }
  }
  setLanguageFilter(on, ...args) {
    if (on) {
      this.currentFilter.filterByLanguages = this.filterByLanguages.call(this, ...args);
    } else {
      this.currentFilter.filterByLanguages = input => input;
    }
  }
  setSearchFilter(on, ...args) {
    if (on) {
      this.currentFilter.filterBySearch = this.filterBySearch.call(this, ...args);
    } else {
      this.currentFilter.filterBySearch = input => input;
    }
  }
  sortByForks() {
    return function(target) {
      return target.sort((aRepo, bRepo) => aRepo.forkCount - bRepo.forkCount);
    };
  }
  sortByStars() {
    return function(target) {
      return target.sort((aRepo, bRepo) => bRepo.stargazers.totalCount - aRepo.stargazers.totalCount);
    };
  }
  sortByUpdate() {
    return function(target) {
      return target.sort((aRepo, bRepo) => new Date(bRepo.pushedAt) - new Date(aRepo.pushedAt));
    };
  }
  sortByOwnerName() {
    return function(target) {
      return target.sort((aRepo, bRepo) => aRepo.nameWithOwner.localeCompare(bRepo.nameWithOwner));
    };
  }
  sortByRepoName() {
    return function(target) {
      return target.sort((aRepo, bRepo) => aRepo.name.localeCompare(bRepo.name));
    };
  }
  filterByLanguages(language) {
    return function(target) {
      return target.filter(({ primaryLanguage }) => primaryLanguage && primaryLanguage.name === language);
    };
  }
  filterByTags(tagId) {
    if (tagId) {
      const tag = this.tags.store.tags[tagId];
      return function(target) {
        return target.filter(repo => tag.repos.includes(String(repo.id)));
      };
    } else {
      const { tags } = this.tags.store;
      return function(target) {
        const repos = [];
        for (const id in tags) {
          if (tags.hasOwnProperty(id)) {
            const tag = tags[id];
            repos.push(...tag.repos);
          }
        }
        return target.filter(repo => !repos.includes(String(repo.id)));
      };
    }
  }
  filterBySearch(searchKey) {
    const searchRegexp = new RegExp(
      `.*${searchKey
        .trim()
        .split(/\ +/g)
        .join('.*')}.*`,
      'i',
    );
    const { remarks } = this;
    return function(target) {
      return target.filter(repo => {
        const repoRemark = remarks.store[repo.id];
        return (
          searchRegexp.test(repo.nameWithOwner) ||
          searchRegexp.test(repo.description) ||
          searchRegexp.test(repo.name) ||
          searchRegexp.test(repoRemark)
        );
      });
    };
  }
}
