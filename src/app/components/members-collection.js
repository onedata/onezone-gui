/**
 * Renders list of members with additional features specified by `aspect` property.
 * Yields list when there are no items to present.
 *
 * @module components/members-collection
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { observer, get, set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import { getOwner } from '@ember/application';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import _ from 'lodash';

export default Component.extend(I18n, {
  tagName: '',

  privilegeActions: service(),
  privilegeManager: service(),
  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membersCollection',

  /**
   * @virtual
   * @type {GraphSingleModel}
   */
  record: undefined,  

  /**
   * @virtual
   * @type {string}
   */
  griAspect: undefined,

  /**
   * Is calculated by `membersListObserver`
   * @type {Object}
   */
  membersProxyList: Object.freeze([]),

  /**
   * One of: privileges, memberships
   * @type {string}
   */
  aspect: 'privileges',

  /**
   * If true, only direct members of the record will be visible
   * @type {boolean}
   */
  onlyDirect: true,

  /**
   * If true, membership-visualiser component will show path descriptions
   * @type {boolean}
   */
  showMembershipDescription: false,

  /**
   * Type of model, which permissions are processed.
   * @virtual
   * @type {string}
   */
  subjectType: undefined,

  /**
   * If greater than 0, autocollapses list on init if number of records is over
   * `collapseForNumber`. If equal to 0, list is never autocollapsed.
   * @type {number}
   */
  collapseForNumber: 0,

  /**
   * Called after list item selection.
   * @virtual
   * @type {function}
   * @param {Array<PrivilegeRecordProxy>} recordsProxies array of selected records
   * @returns {any}
   */
  recordsSelected: notImplementedWarn,

  /**
   * Header of the records list.
   * @virtual
   * @type {string}
   */
  listHeader: undefined,

  /**
   * 1-level-nested tree with privileges. It should group privileges
   * into categories.
   * @type {Object}
   * @virtual
   */
  groupedPrivilegesFlags: Object.freeze({}),

  /**
   * Path to the translations with privilege groups names.
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations with privileges names.
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * @type {Array<Action>}
   */
  collectionActions: undefined,

  /**
   * @type {Array<Action>}
   */
  itemActions: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordType: reads('record.entityType'),

  /**
   * Direct members
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  directMembersList: computed(
    'record',
    'subjectType',
    function directMembersList() {
      return this.getMembersList(this.get('subjectType') + 'List');
    }
  ),

  /**
   * Effective members
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  effectiveMembersList: computed(
    'record',
    'subjectType',
    function effectiveMembersList() {
      return this.getMembersList(
        'eff' + _.upperFirst(this.get('subjectType')) + 'List'
      );
    }
  ),

  /**
   * One of `directMembersList`, `effectiveMembersList` depending on
   * `onlyDirect` flag
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  membersList: computed(
    'onlyDirect',
    'record',
    'subjectType',
    function membersList() {
      return this.get('onlyDirect') ?
        this.get('directMembersList') : this.get('effectiveMembersList');
    }
  ),

  /**
   * Controls whether save/cancel buttons should be rendered or not
   * @type {Ember.ComputedProperty<boolean>}
   */
  showSaveCancel: computed('aspect', 'onlyDirect', function showSaveCancel() {
    const {
      aspect,
      onlyDirect,
    } = this.getProperties('aspect', 'onlyDirect');
    return aspect === 'privileges' && onlyDirect;
  }),

  membersListObserver: observer(
    'membersList.@each.name',
    'onlyDirect',
    function membersListObserver() {
      const {
        membersList,
        membersProxyList,
        groupedPrivilegesFlags,
        onlyDirect,
        subjectType,
        currentUser,
      } = this.getProperties(
        'membersList',
        'membersProxyList',
        'groupedPrivilegesFlags',
        'onlyDirect',
        'subjectType',
        'currentUser'
      );

      // Create ordered list of members. Records should be sorted by name except
      // current user record - it should be always at the top.
      const currentUserId = get(currentUser, 'userId');
      let orderedMembersList = membersList.sortBy('name');
      let currentUserMember;
      if (subjectType === 'user') {
        currentUserMember = orderedMembersList.findBy('entityId', currentUserId);
        if (currentUserMember) {
          orderedMembersList = [currentUserMember]
            .concat(orderedMembersList.without(currentUserMember));
        }
      }

      // Create list of member proxies reusing already generated ones as much
      // as possible.
      const newMembersProxyList = orderedMembersList.map(member => {
        let proxy = membersProxyList.findBy('member', member);
        // If proxy has not been generated for that member, create new empty proxy.
        if (!proxy) {
          proxy = EmberObject.create({
            id: get(member, 'id'),
            member,
            privilegesProxy: {},
            isYou: member === currentUserMember,
          });
        }
        // If privileges mode is different, generate new privileges object.
        if (get(proxy, 'privilegesProxy.direct') !== onlyDirect) {
          const privilegesGri = this.getPrivilegesGriForMember(member);
          const privilegesProxy = PrivilegeRecordProxy.create(
            getOwner(this).ownerInjection(),
            {
              groupedPrivilegesFlags,
              griArray: [privilegesGri],
              direct: onlyDirect,
              isReadOnly: !onlyDirect,
            }
          );
          set(proxy, 'privilegesProxy', privilegesProxy);
        }
        return proxy;
      });
      this.set('membersProxyList', newMembersProxyList);
    }
  ),

  aspectObserver: observer('aspect', function aspectObserver() {
    // Reset privileges modification state after aspect change
    this.get('membersProxyList').forEach(memberProxy => {
      if (get(memberProxy, 'privilegesProxy.isModified')) {
        get(memberProxy, 'privilegesProxy').resetModifications();
      }
    });
  }),

  init() {
    this._super(...arguments);
    this.membersListObserver();
  },

  /**
   * Loads members from specified list
   * @param {string} listName for example 'userList', 'effGroupList'
   * @returns {PromiseArray<DS.ManyArray<GraphSingleModel>>}
   */
  getMembersList(listName) {
    const record = this.get('record');
    return PromiseArray.create({
      promise: get(record, 'hasViewPrivilege') !== false ?
        get(record, listName).then(sgl =>
          sgl ? get(sgl, 'list') : A()
        ) : reject({ id: 'forbidden' }),
    });
  },

  /**
   * Generates privilege record GRI for given member record
   * @param {GraphSingleModel} member
   * @param {string} type `group` or `user`
   * @returns {string}
   */
  getPrivilegesGriForMember(member) {
    const {
      record,
      recordType,
      griAspect,
      onlyDirect,
    } = this.getProperties('record', 'recordType', 'griAspect', 'onlyDirect');
    let recordId, subjectId;
    try {
      recordId = parseGri(get(record, 'id')).entityId;
      subjectId = parseGri(get(member, 'id')).entityId;
    } catch (error) {
      console.error(
        'component:members-collection: getPrivilegesGriForMember: ' +
        'error parsing GRI: ',
        error
      );
      return '';
    }
    const griAspectPrefix = onlyDirect ? '' : 'eff_';
    return this.get('privilegeManager').generateGri(
      recordType,
      recordId,
      griAspectPrefix + griAspect,
      subjectId
    );
  },

  actions: {
    reset(memberProxy) {
      get(memberProxy, 'privilegesProxy').resetModifications();
    },
    savePrivileges(memberProxy) {
      return this.get('privilegeActions')
        .handleSave(get(memberProxy, 'privilegesProxy').save(true))
        .then(() => memberProxy);
    },
  },
});
