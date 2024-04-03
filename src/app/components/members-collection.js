/**
 * Renders list of members.
 * Yields list when there are no items to present.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  observer,
  get,
  getProperties,
  set,
  computed,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import { getOwner } from '@ember/application';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import _ from 'lodash';
import ItemProxy from 'onezone-gui/utils/members-collection/item-proxy';
import { scheduleOnce } from '@ember/runloop';
import { promise } from 'ember-awesome-macros';
import { htmlSafe } from '@ember/template';
import { formatNumber } from 'onedata-gui-common/helpers/format-number';

const fallbackActionsGenerator = () => [];

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
   * `aspect` part of gri used to generate gri for privileges records.
   * @virtual
   * @type {string}
   */
  griAspect: undefined,

  /**
   * `aspect` part of gri for group used to generate gri for privileges records.
   * @virtual
   * @type {string}
   */
  griGroupAspects: undefined,

  /**
   * Type of model, which permissions are processed.
   * One of: user, group
   * @virtual
   * @type {string}
   */
  subjectType: undefined,

  /**
   * @type {Array<Model.User>}
   */
  owners: undefined,

  /**
   * @virtual
   * @type {string}
   */
  modelTypeTranslation: undefined,

  /**
   * If greater than 0, autocollapses list on init if number of records is over
   * `collapseForNumber`. If equal to 0, list is never autocollapsed.
   * @type {number}
   */
  collapseForNumber: 0,

  /**
   * Called when members are loaded and rendered
   * @type {function}
   * @returns {any}
   */
  membersLoaded: notImplementedIgnore,

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
   * @virtual
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations with privileges names.
   * @type {string}
   * @virtual
   */
  privilegesTranslationsPath: undefined,

  /**
   * If true, only direct members of the record will be visible
   * @type {boolean}
   * @virtual
   */
  onlyDirect: false,

  /**
   * Is calculated by `membersObserver`
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  membersProxyList: Object.freeze([]),

  /**
   * Is calculated by `membersObserver`
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  directGroupsProxyList: Object.freeze([]),

  /**
   * If true, membership-visualiser component will show path descriptions
   * @type {boolean}
   */
  showMembershipDescription: false,

  /**
   * @type {Array<Action>}
   */
  collectionActions: undefined,

  /**
   * @type {Array<string>}
   */
  highlightedMembers: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.User|Models.Group} member
   * @param {ArrayProxy<Models.User|Models.Group>} directMembers
   * @param {ArrayProxy<Models.User|Models.Group>} effectiveMembers
   * @returns {Array<Action>}
   */
  itemActionsGenerator: fallbackActionsGenerator,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.User|Models.Group} member
   * @param {ArrayProxy<Models.User|Models.Group>} directMembers
   * @param {ArrayProxy<Models.User|Models.Group>} effectiveMembers
   * @returns {Array<Action>}
   */
  effectiveItemActionsGenerator: fallbackActionsGenerator,

  /**
   * @type {boolean}
   */
  isListCollapsed: undefined,

  /**
   * @type {SafeString | string}
   */
  effListHeader: computed('listHeader', 'members.length', function effListHeader() {
    if (!this.listHeader) {
      return '';
    }

    const membersCount = formatNumber(this.members?.length ?? 0);
    return htmlSafe(
      `${typeof this.listHeader === 'string' ? _.escape(this.listHeader) : this.listHeader} (${membersCount})`
    );
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordType: reads('record.entityType'),

  /**
   * Direct members
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  directMembers: computed(
    'record',
    'subjectType',
    function directMembers() {
      return this.getMembers(this.get('subjectType') + 'List');
    }
  ),

  /**
   * Direct groups
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  directGroups: computed(
    'record',
    'subjectType',
    function directGroups() {
      if (this.subjectType === 'group') {
        return this.directMembers;
      }
      return this.getMembers('groupList');
    }
  ),

  /**
   * Effective members
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  effectiveMembers: computed(
    'record',
    'subjectType',
    function effectiveMembers() {
      return this.getMembers(
        'eff' + _.upperFirst(this.get('subjectType')) + 'List'
      );
    }
  ),

  /**
   * Promise proxy used to load all members
   * @type {Ember.ComputedProperty<PromiseArray>}
   */
  allMembersLoadingProxy: promise.array(promise.all(
    'directMembers',
    'effectiveMembers',
    'directGroups',
  )),

  /**
   * One of `directMembers`, `effectiveMembers` depending on
   *`onlyDirect` flag
   * @type {Ember.ComputedProperty<PromiseArray<DS.ManyArray<GraphSingleModel>>>}
   */
  members: computed(
    'onlyDirect',
    'record',
    'subjectType',
    function members() {
      return this.get('onlyDirect') ?
        this.get('directMembers') : this.get('effectiveMembers');
    }
  ),

  membersObserver: observer(
    'members.@each.{entityId,name,username}',
    'onlyDirect',
    'directMembers.[]',
    function membersObserver() {
      const {
        owners,
        directMembers,
        effectiveMembers,
        subjectType,
        members,
        membersProxyList,
        groupedPrivilegesFlags,
        currentUser,
        isListCollapsed,
        collapseForNumber,
        itemActionsGenerator,
        effectiveItemActionsGenerator,
        griAspect,
        griGroupAspects,
      } = this.getProperties(
        'owners',
        'directMembers',
        'effectiveMembers',
        'subjectType',
        'members',
        'membersProxyList',
        'groupedPrivilegesFlags',
        'currentUser',
        'isListCollapsed',
        'collapseForNumber',
        'itemActionsGenerator',
        'effectiveItemActionsGenerator',
        'griAspect',
        'griGroupAspects',
      );
      if (isListCollapsed === undefined && collapseForNumber &&
        get(members, 'length') > collapseForNumber) {
        this.set('isListCollapsed', true);
      }
      // Create ordered list of members. Records should be sorted by name except
      // current user record and owners - they should be always at the top.
      const currentUserMember =
        members.findBy('entityId', get(currentUser, 'userId'));
      const membersSortKeys = new Map();
      members.forEach(member => {
        const {
          entityId,
          name,
          username,
        } = getProperties(member, 'entityId', 'name', 'username');
        let key = member === currentUserMember ? '0\n' : '1\n';
        key += (owners || []).includes(member) ? '0\n' : '1\n';
        key += this.directMembers.includes(member) ? '0\n' : '1\n';
        key += `${name}\n`;
        if (subjectType === 'user') {
          key += `${username || '\n'}\n`;
        }
        key += entityId;
        membersSortKeys.set(key, member);
      });
      const orderedMembers = [...membersSortKeys.keys()].sort()
        .map(key => membersSortKeys.get(key));

      // Create list of member proxies reusing already generated ones as much
      // as possible.
      const newMembersProxyList = orderedMembers.map(member => {
        let proxy = membersProxyList.findBy('member', member);
        // If proxy has not been generated for that member, create new empty proxy.
        if (!proxy || proxy.isDirect != directMembers.includes(member)) {
          proxy = ItemProxy.create({
            id: get(member, 'id'),
            member,
            owners,
            directMembers,
            isDirect: directMembers.includes(member),
            privilegesProxy: {},
            effectivePrivilegesProxy: {},
            isYou: member === currentUserMember,
            directMemberActions: itemActionsGenerator(
              member,
              directMembers,
              effectiveMembers
            ),
            effectiveMemberActions: effectiveItemActionsGenerator(
              member,
              directMembers,
              effectiveMembers
            ),
          });
        }
        if (directMembers.includes(member)) {
          const directPrivilegesGri = this.getPrivilegesGriForMember(
            member, true, griAspect
          );
          const privilegesProxy = PrivilegeRecordProxy.create(
            getOwner(this).ownerInjection(), {
              groupedPrivilegesFlags,
              griArray: [directPrivilegesGri],
              direct: true,
              isReadOnly: false,
            }
          );
          set(proxy, 'privilegesProxy', privilegesProxy);
        }
        const effectivePrivilegesGri = this.getPrivilegesGriForMember(
          member, false, griAspect
        );
        const effectivePrivilegesProxy = PrivilegeRecordProxy.create(
          getOwner(this).ownerInjection(), {
            groupedPrivilegesFlags,
            griArray: [effectivePrivilegesGri],
            direct: false,
            isReadOnly: true,
          }
        );
        set(proxy, 'effectivePrivilegesProxy', effectivePrivilegesProxy);
        return proxy;
      });
      this.set('membersProxyList', newMembersProxyList);
      if (griAspect === griGroupAspects) {
        this.set('directGroupsProxyList', newMembersProxyList);
      }
      if (get(members, 'isFulfilled')) {
        scheduleOnce('afterRender', this, 'membersLoaded');
      }
    }
  ),

  groupsObserver: observer(
    'directGroups.@each.{entityId,name,username}',
    function groupsObserver() {
      const {
        directGroups,
        directGroupsProxyList,
        groupedPrivilegesFlags,
        griAspect,
        griGroupAspects,
      } = this.getProperties(
        'directGroups',
        'directGroupsProxyList',
        'groupedPrivilegesFlags',
        'griAspect',
        'griGroupAspects',
      );

      if (griAspect === griGroupAspects) {
        return;
      }

      // Create list of group proxies reusing already generated ones as much
      // as possible.
      const newMembersProxyList = directGroups.map(member => {
        let proxy = directGroupsProxyList.findBy('member', member);
        // If proxy has not been generated for that member, create new empty proxy.
        if (!proxy || !proxy.isDirect) {
          proxy = ItemProxy.create({
            id: get(member, 'id'),
            member,
            isDirect: true,
            effectivePrivilegesProxy: {},
          });
        }
        const effectivePrivilegesGri = this.getPrivilegesGriForMember(
          member, false, griGroupAspects
        );
        const effectivePrivilegesProxy = PrivilegeRecordProxy.create(
          getOwner(this).ownerInjection(), {
            groupedPrivilegesFlags,
            griArray: [effectivePrivilegesGri],
            direct: false,
            isReadOnly: true,
          }
        );
        set(proxy, 'effectivePrivilegesProxy', effectivePrivilegesProxy);
        return proxy;
      });
      this.set('directGroupsProxyList', newMembersProxyList);
    }
  ),

  init() {
    this._super(...arguments);
    this.membersObserver();
    this.groupsObserver();
  },

  /**
   * Loads members from specified list
   * @param {string} listName for example 'userList', 'effGroupList'
   * @returns {PromiseArray<DS.ManyArray<GraphSingleModel>>}
   */
  getMembers(listName) {
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
  getPrivilegesGriForMember(member, isForDirectPrivileges, griAspect) {
    const {
      record,
      recordType,
    } = this.getProperties('record', 'recordType');
    let recordId;
    let subjectId;
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
    const griAspectPrefix = isForDirectPrivileges ? '' : 'eff_';
    return this.get('privilegeManager').generateGri(
      recordType,
      recordId,
      griAspectPrefix + griAspect,
      subjectId
    );
  },

  actions: {
    discardChanges(memberProxy) {
      get(memberProxy, 'privilegesProxy').resetModifications();
    },
    savePrivileges(memberProxy) {
      return this.get('privilegeActions')
        .handleSave(get(memberProxy, 'privilegesProxy').save(true))
        .then(() => memberProxy);
    },
    listCollapsed(isCollapsed) {
      this.set('isListCollapsed', isCollapsed);
    },
    highlightMemberships(groups) {
      this.set('highlightedMembers', groups);
    },
  },
});
