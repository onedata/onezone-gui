/**
 * Show row in table for member for single privileges.
 * This includes such cell like: name privileges, toggle to change direct privilege and
 * status for effective privileges.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';
import I18n from 'onedata-gui-common/mixins/i18n';
import { promise } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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
   * @type {boolean}
   */
  hasUnsavedPrivileges: false,

  /**
   * @virtual
   * @type {boolean}
   */
  arePrivilegesUpToDate: true,

  /**
   * @virtual
   * @type {Array<string>}
   */
  effPrivilegesAffectorGris: undefined,

  /**
   * @virtual
   * @type {PromiseObject}
   */
  effPrivilegesAffectorInfos: undefined,

  /**
   * @virtual
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  directGroupMembers: undefined,

  /**
   * @virtual
   * @type {Group|Space|Cluster|Provider}
   */
  targetRecord: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  highlightMemberships: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isModifiedPriv: false,

  /**
   * @type {boolean}
   */
  effPrivilegeStateCache: undefined,

  /**
   * Input changed action.
   * @type {Function}
   */
  inputChanged: () => {},

  /**
   * Input classes.
   * @type {Ember.ComputedProperty<string>}
   */
  inputClass: computed('privilegesGroupName', function inputClass() {
    return `field-${this.privilegesGroupName} form-control`;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  effPrivilegeState: computed(
    'arePrivilegesUpToDate',
    'directPrivilegeValue',
    'isModifiedPriv',
    'effectivePrivilegeValue',
    'effPrivilegesRealAffectorRecords.content',
    function effPrivilegeState() {
      if (!this.arePrivilegesUpToDate && this.effPrivilegeStateCache !== undefined) {
        return this.effPrivilegeStateCache;
      }
      let state;
      const affectorRecordsCount = this.effPrivilegesRealAffectorRecords?.content?.length;
      if (this.directPrivilegeValue ||
        (!this.isModifiedPriv && this.effectivePrivilegeValue) ||
        (this.isModifiedPriv && this.effectivePrivilegeValue && affectorRecordsCount)
      ) {
        state = true;
      } else if (this.isModifiedPriv && this.effectivePrivilegeValue) {
        state = 2;
      } else {
        state = false;
      }
      this.set('effPrivilegeStateCache', state);
      return state;
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  effPrivilegesRealAffectorRecords: promise.object(computed(
    'directGroupMembers.@each.effectivePrivilegesProxy',
    'effPrivilegesAffectorGris',
    'privilege.name',
    'effPrivilegesAffectorInfos',
    'effectivePrivilegeValue',
    'directPrivilegeValue',
    async function effPrivilegesRealAffectorRecords() {
      const affectorRecords = [];
      let effPrivilegesAffectorInfos;
      try {
        effPrivilegesAffectorInfos = await this.effPrivilegesAffectorInfos;
      } catch (error) {
        effPrivilegesAffectorInfos = [];
      }
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

  hasUnsavedPrivilegesObserver: observer(
    'hasUnsavedPrivileges',
    function hasUnsavedPrivilegesObserver() {
      if (!this.hasUnsavedPrivileges) {
        this.set('isModifiedPriv', false);
      } else if (this.hasUnsavedPrivileges &&
        this.previousDirectPrivilegeValue != this.directPrivilegeValue
      ) {
        this.set('isModifiedPriv', true);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.hasUnsavedPrivilegesObserver();
  },

  actions: {
    /**
     * Notifies about change in input.
     * @param {*} value Changed value.
     */
    inputChanged(value) {
      this.get('inputChanged')(value);
      if (this.get('previousDirectPrivilegeValue') !== value) {
        this.set('isModifiedPriv', true);
      } else {
        this.set('isModifiedPriv', false);
      }
    },
    highlightMemberships() {
      this.get('highlightMemberships')(this.membershipsToHighlight);
    },
    resetHighlights() {
      this.get('highlightMemberships')([]);
    },
  },
});
