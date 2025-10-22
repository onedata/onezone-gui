/**
 * Implementation of ColumnDataModel for column containing single group which is a start
 * point.
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
  constructor(group) {
    this.groupListProxy = this.#createSingleGroupProxy(group);
  }

  /**
   * Returns model for start-point column
   * @returns {PromiseObject<{ list: Array<Group>, length: number }>}
   */
  #createSingleGroupProxy(group) {
    const listModel = {
      list: promiseArray(resolve([group])),
      get length() {
        return 1;
      },
    };
    return promiseObject(resolve(listModel));
  }
}
