/**
 * Show row in table for member for single privileges.
 * This includes such cell like: name privileges, toggle to change direct privilege and
 * status for effective privileges.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { promise } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { Promise } from 'rsvp';

/**
 * @typedef {Object} PrivilegeInfo
 * @property {string} name
 * @property {SafeString} text
 * @property {PrivilegeField} field
 */

/**
 * @typedef {Object} PrivilegeField
 * @property {boolean} allowThreeStateToggle
 * @property {boolean} threeState
 * @property {string} type
 */

export default Component.extend(DisabledPaths, I18n, {
  tagName: 'tr',
  classNames: ['privilege-row'],
  classNameBindings: [
    'isDirect:direct-member-privilege-row:effective-member-privilege-row',
  ],

  groupManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.privilegeRow',

  /**
   * @virtual
   * @type {PrivilegeInfo}
   */
  privilege: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  directPrivilegeValue: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  effectivePrivilegeValue: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  previousDirectPrivilegeValue: undefined,

  /**
   * @virtual
   * @type {string}
   */
  privilegesGroupName: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isDirect: false,

  /**
   * @virtual
   * @type {boolean}
   */
  isBulkEdit: false,

  /**
   * @virtual
   * @type {boolean}
   */
  editionEnabled: true,

  /**
   * @virtual
   * @type {Object}
   */
  form: undefined,

  /**
   * @virtual
   * @type {Array<string>}
   */
  directlyParentsToMember: undefined,

  /**
   * @virtual
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  members: undefined,

  /**
   * @virtual
   * @type {string}
   */
  resourceType: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  highlightMemberShips: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isLoaded: false,

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  dataLoadingProxy: promise.object(promise.all(
    'filteredMembersWithPrivilegesList',
    'highlightedRecordsLoadedList'
  )),

  /**
   * Input classes.
   * @type {Ember.ComputedProperty<string>}
   */
  inputClass: computed('privilegesGroupName', function inputClass() {
    return `field-${this.privilegesGroupName} form-control`;
  }),

  filteredMembersWithPrivilegesList: promise.object(computed(
    'members',
    'directlyParentsToMember',
    'privilege.name',
    async function filteredMembersWithPrivilegesList() {
      return Promise.all(this.directlyParentsToMember.map(groupId => {
        return this.members.filter(member => groupId === member.id)
          .map(member => {
            if (
              !member.effectivePrivilegesProxy.isLoaded &&
              !member.effectivePrivilegesProxy.isLoading
            ) {
              return member.effectivePrivilegesProxy.reloadRecords()
                .then(effectivePrivilegesProxy => effectivePrivilegesProxy);
            }
            return member.effectivePrivilegesProxy;
          });
      }));
    }
  )),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  highlightedMembersList: computed(
    'members.@each.effectivePrivilegesProxy',
    'directlyParentsToMember',
    'privilege.name',
    'filteredMembersWithPrivilegesList',
    'isLoaded.isLoaded',
    function highlightedMembersList() {
      const membersList = [];
      let isLoaded = true;
      for (const groupId of this.directlyParentsToMember) {
        for (const member of this.members) {
          if (groupId === member.id) {
            if (member.effectivePrivilegesProxy.isLoaded) {
              const privileges =
                member.effectivePrivilegesProxy.persistedPrivilegesSnapshot[0];
              if (privileges[this.privilegesGroupName][this.privilege.name]) {
                membersList.push(member);
              }
            } else {
              isLoaded = member.effectivePrivilegesProxy;
            }
          }
        }
      }
      this.set('isLoaded', isLoaded);
      return membersList;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  highlightedRecordsLoadedList: promise.object(computed(
    'highlightedMembersList',
    'directPrivilegeValue',
    async function highlightedRecordsLoadedList() {
      const groups = [];
      let groupRecord;
      for (const group of this.highlightedMembersList) {
        groupRecord = await this.groupManager.getRecord(group.id);
        groups.push(groupRecord);
      }
      return groups;
    }
  )),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  highlightedIdMembersList: computed(
    'highlightedMembersList',
    'directPrivilegeValue',
    'isDirect',
    'directlyParentsToMember',
    function highlightedIdMembersList() {
      const membersId = [];
      if (this.isDirect && this.directPrivilegeValue) {
        membersId.push(this.directlyParentsToMember[0]);
      }
      for (const member of this.highlightedMembersList) {
        membersId.push(member.id);
      }
      return membersId;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  resourceTypeTranslation: computed('resourceType', function resourceTypeTranslation() {
    return this.i18n.t(`common.modelNames.${this.resourceType}`);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  tooltipText: computed(
    'highlightedRecordsLoadedList',
    'directPrivilegeValue',
    function tooltipText() {
      const groupsText = (this.highlightedRecordsLoadedList.content ?? [])
        .map((g) => g.name).join(', ');
      if (this.directPrivilegeValue && groupsText === '') {
        return this.tt('onlyDirectTooltip');
      }
      if (this.directPrivilegeValue && groupsText !== '') {
        return this.tt('directEffectiveTooltip', {
          resourceType: this.resourceTypeTranslation,
          groupsList: groupsText,
        });
      }
      if (groupsText !== '') {
        return this.tt('onlyEffectiveTooltip', {
          resourceType: this.resourceTypeTranslation,
          groupsList: groupsText,
        });
      }
      return '';
    }
  ),

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      if (this.get('value') !== value) {
        this.get('inputChanged')(value);
      }
    },
    highlightMemberShips() {
      this.get('highlightMemberShips')(this.highlightedIdMembersList);
    },
    resetHighlights() {
      this.get('highlightMemberShips')([]);
    },
  },
});
