/**
 * Base class for array promise proxies, which contain all known records of user/group type.
 *
 * @module utils/all-known-members-proxy-array-base
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArrayProxy from '@ember/array/proxy';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import { promise } from 'ember-awesome-macros';
import { computed, get, getProperties, observer } from '@ember/object';
import _ from 'lodash';

export default ArrayProxy.extend({
  /**
   * @virtual
   * @type {Service}
   */
  recordManager: undefined,

  /**
   * One of: `user`, `group`
   * @virtual
   * @type {String}
   */
  memberModelName: undefined,

  /**
   * @virtual
   * @type {PromiseArray<GraphSingleModel>}
   */
  allRecordsProxy: undefined,

  allRecordsProxyObserver: observer(
    'allRecordsProxy.[]',
    function allRecordsProxyObserver() {
      const {
        isFulfilled,
        content,
      } = getProperties(this.get('allRecordsProxy'), 'isFulfilled', 'content');

      if (isFulfilled) {
        this.set('content', content);
      }
    }
  ),

  init() {
    this._super(...arguments);

    const memberModelName = this.get('memberModelName');
    const upperFirstMemberModelName = _.upperFirst(memberModelName);

    const toSet = {};
    ['group', 'space'].forEach(modelName => {
      toSet[`${modelName}sProxy`] = promise.array(computed(function proxy() {
        return this.get('recordManager').getUserRecordList(modelName)
          .then(recordList => get(recordList, 'list'));
      }));
      toSet[`${modelName}s${upperFirstMemberModelName}sListsProxy`] = computed(
        `${modelName}sProxy.@each.isReloading`,
        function computedLists() {
          return this.get(`${modelName}sProxy`)
            .then(parents => onlyFulfilledValues(
              parents.mapBy(`eff${upperFirstMemberModelName}List`)
            ))
            .then(effLists => onlyFulfilledValues(effLists.compact().mapBy('list')));
        }
      );
    });

    this.setProperties(toSet);
  },
});
