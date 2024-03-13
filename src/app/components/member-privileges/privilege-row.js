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
  effPrivilegesAffectorGris: undefined,

  /**
   * @virtual
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  members: undefined,

  /**
   * @virtual
   * @type {Group|Space|Cluster|Provider}
   */
  targetRecord: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  highlightMemberShips: notImplementedIgnore,

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  dataLoadingProxy: promise.object(promise.all(
    'effPrivilegesAffectorInfos',
    'effPrivilegesRealAffectorRecords',
  )),

  /**
   * Input classes.
   * @type {Ember.ComputedProperty<string>}
   */
  inputClass: computed('privilegesGroupName', function inputClass() {
    return `field-${this.privilegesGroupName} form-control`;
  }),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  effPrivilegesAffectorInfos: promise.object(computed(
    'members',
    'effPrivilegesAffectorGris',
    'privilege.name',
    async function effPrivilegesAffectorInfos() {
      return Promise.all(this.effPrivilegesAffectorGris.map(groupId => {
        const affectorInfo = this.members.find(member => groupId === member.id);
        if (!affectorInfo.effectivePrivilegesProxy.isLoaded) {
          return affectorInfo.effectivePrivilegesProxy.reloadRecords().then(
            () => affectorInfo
          );
        } else {
          return affectorInfo;
        }
      }));
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  effPrivilegesRealAffectorRecords: promise.object(computed(
    'members.@each.effectivePrivilegesProxy',
    'effPrivilegesAffectorGris',
    'privilege.name',
    'effPrivilegesAffectorInfos',
    async function effPrivilegesRealAffectorRecords() {
      const affectorRecords = [];
      const effPrivilegesAffectorInfos = await this.effPrivilegesAffectorInfos;
      for (const member of effPrivilegesAffectorInfos) {
        const privileges =
          member.effectivePrivilegesProxy.persistedPrivilegesSnapshot[0];
        if (privileges && privileges[this.privilegesGroupName][this.privilege.name]) {
          affectorRecords.push({ id: member.id, name: member.member.name });
        }
      }
      return affectorRecords;
    }
  )),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  membershipsToHighlight: computed(
    'effPrivilegesRealAffectorRecords.content',
    'directPrivilegeValue',
    'isDirect',
    'effPrivilegesAffectorGris',
    function membershipsToHighlight() {
      const recordsIds = [];
      const affectorRecords = this.effPrivilegesRealAffectorRecords?.content;
      if (this.isDirect && this.directPrivilegeValue) {
        recordsIds.push(this.targetRecord.gri);
      }
      if (affectorRecords) {
        for (const record of affectorRecords) {
          recordsIds.push(record.id);
        }
      }
      return recordsIds;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  resourceTypeTranslation: computed('targetRecord.entityType',
    function resourceTypeTranslation() {
      return this.i18n.t(`common.modelNames.${this.targetRecord.entityType}`);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  tooltipText: computed(
    'effPrivilegesRealAffectorRecords',
    'directPrivilegeValue',
    function tooltipText() {
      const groupsText = (this.effPrivilegesRealAffectorRecords.content ?? [])
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
      this.get('highlightMemberShips')(this.membershipsToHighlight);
    },
    resetHighlights() {
      this.get('highlightMemberShips')([]);
    },
  },
});
