/**
 * Base class for array promise proxies, which contain all known records of user/group type.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArrayProxy from '@ember/array/proxy';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import {
  computed,
  getProperties,
  observer,
  defineProperty,
} from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { camelize } from '@ember/string';
import BatchRecordsLoader from './batch-records-loader';
import _ from 'lodash';

export default ArrayProxy.extend({
  /**
   * @virtual
   * @type {Service}
   */
  recordManager: undefined,

  /**
   * @virtual
   * @type {BatchRequestRegistryService}
   */
  batchRequestRegistry: undefined,

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

  /**
   * Set in `init`
   * @type {PromiseArray<Models.Group>}
   */
  groupsProxy: undefined,

  /**
   * Set in `init`
   * @type {PromiseArray<Models.Space>}
   */
  spacesProxy: undefined,

  /**
   * Set in `init` (only when `memberModelName` is `user`)
   * @type {PromiseArray<PromiseArray<Models.User>>|undefined}
   */
  groupsUsersListsProxy: undefined,

  /**
   * Set in `init` (only when `memberModelName` is `user`)
   * @type {PromiseArray<PromiseArray<Models.User>>|undefined}
   */
  spacesUsersListsProxy: undefined,

  /**
   * Set in `init` (only when `memberModelName` is `group`)
   * @type {PromiseArray<PromiseArray<Models.Group>>|undefined}
   */
  groupsGroupsListsProxy: undefined,

  /**
   * Set in `init` (only when `memberModelName` is `group`)
   * @type {PromiseArray<PromiseArray<Models.Group>>|undefined}
   */
  spacesGroupsListsProxy: undefined,

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
    for (const dependency of ['batchRequestRegistry', 'recordManager']) {
      if (!this[dependency]) {
        throw new Error(`AllKnownMembersProxyArray: ${dependency} not provided`);
      }
    }

    for (const modelName of ['group', 'space']) {
      defineProperty(
        this,
        `${modelName}sProxy`,
        this.createSubjectsProxyProperty(modelName)
      );
      defineProperty(
        this,
        camelize(`${modelName}s-${this.memberModelName}s-lists-proxy`),
        this.createSubjectsMembersProxyProperty(modelName, this.memberModelName)
      );
    }
  },

  /**
   * @param {'space'|'group'} modelName
   * @returns {ComputedProperty}
   */
  createSubjectsProxyProperty(modelName) {
    return computed(function () {
      const promise = (async () => {
        const recordList = await this.recordManager.getUserRecordList(modelName);
        return recordList.list;
      })();
      return promiseObject(promise);
    });
  },

  /**
   * @param {'space'|'group'} modelName
   * @returns {ComputedProperty}
   */
  createSubjectsMembersProxyProperty(modelName) {
    return computed(`${modelName}sProxy.@each.isReloading`, function () {
      const promise = (async () => {
        const parents = await this[`${modelName}sProxy`];
        // Group model has no data store relationship "effGroupList". It has
        // "effChildList" relationship which is aliased to "effGroupList" property, but
        // this alias cannot be used as a relationship.
        const memberListRelationshipType =
          (modelName === 'group' && this.memberModelName === 'group') ?
          'child' : this.memberModelName;
        const memberListProperty = camelize(`eff-${memberListRelationshipType}-list`);
        const listsGris = parents.map(parent =>
          parent.belongsTo(memberListProperty).id()
        );
        const listsResolver = async () => {
          return await onlyFulfilledValues(
            parents.map(it => it[memberListProperty])
          );
        };
        const listsBatchLoader = new BatchRecordsLoader({
          batchRequestRegistry: this.batchRequestRegistry,
          itemsGris: listsGris,
          listResolver: listsResolver,
        });
        const effLists = (await listsBatchLoader.getPromise()).filter(Boolean);
        const membersGris = _.uniq(
          effLists.map(listRecord => listRecord.hasMany('list').ids()).flat()
        );
        const membersArraysResolver = async () => {
          return await onlyFulfilledValues(
            effLists.filter(Boolean).map(it => it.list)
          );
        };
        const membersArraysBatchLoader = new BatchRecordsLoader({
          batchRequestRegistry: this.batchRequestRegistry,
          itemsGris: membersGris,
          listResolver: membersArraysResolver,
        });
        return await membersArraysBatchLoader.getPromise();
      })();
      return promiseObject(promise);
    });
  },
});
