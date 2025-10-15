/**
 * FIXME:
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';

/**
 * @implements {GroupsHierarchyColumnDataModel}
 */
export default class SingleGroupColumnDataModel {
  constructor() {
    this.groupsProxy = this.#createEmptyGroupProxy();
  }

  destroy() {}

  /**
   * @returns {PromiseObject<{ list: Array<Group> }>}
   */
  #createEmptyGroupProxy() {
    const emptyModelPromise = (async () => ({
      list: promiseArray(resolve([])),
    }))();
    return promiseObject(emptyModelPromise);
  }
}
