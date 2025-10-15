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
 * @implements {GroupHierarchyColumnDataModel}
 */
export default class SingleGroupColumnDataModel {
  constructor(group) {
    this.groupsProxy = this.#createSingleGroupProxy(group);
  }

  destroy() {}

  // FIXME: nie wiem czy trzeba robić reload - w related groups nie robimy
  /**
   * Returns model for start-point column
   * @returns {PromiseObject<{ list: Array<Group> }>}
   */
  #createSingleGroupProxy(group) {
    const singleGroupModelPromise = group.reload()
      .then(() => ({
        list: promiseArray(resolve([group])),
      }));
    return promiseObject(singleGroupModelPromise);
  }
}
