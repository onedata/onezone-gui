/**
 * Invite target details fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { notEmpty } from 'ember-awesome-macros';
import _ from 'lodash';
import { Promise, resolve } from 'rsvp';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import isRecord from 'onedata-gui-common/utils/is-record';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import SiblingLoadingField from 'onedata-gui-common/utils/form-component/sibling-loading-field';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import { groupedFlags as groupFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { groupedFlags as spaceFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { groupedFlags as harvesterFlags } from 'onedata-gui-websocket-client/utils/harvester-privileges-flags';
import { groupedFlags as clusterFlags } from 'onedata-gui-websocket-client/utils/cluster-privileges-flags';
import { groupedFlags as atmInventoryFlags } from 'onedata-gui-websocket-client/utils/atm-inventory-privileges-flags';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import { tokenInviteTypeOptions } from './common';

const TargetField = DropdownField.extend({
  recordManager: service(),

  /**
   * @override
   */
  name: 'target',

  /**
   * @override
   */
  addColonToLabel: false,

  /**
   * @override
   */
  options: reads('cachedTargetsProxy.content'),

  /**
   * @override
   */
  isVisible: reads('cachedTargetsProxy.isFulfilled'),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedTargetsModelName: reads('parent.cachedTargetsModelName'),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedTargetsProxy: reads('parent.cachedTargetsProxy'),

  /**
   * @override
   */
  placeholder: computed(
    'valuesSource.basic.inviteDetails.inviteType',
    'path',
    function placeholder() {
      const inviteType = this.valuesSource?.basic?.inviteDetails?.inviteType;
      return inviteType && this.t(`${this.path}.placeholder.${inviteType}`);
    }
  ),

  cachedTargetsModelNameObserver: observer(
    'cachedTargetsModelName',
    'value',
    function cachedTargetsModelNameObserver() {
      const currentValueModelName = isRecord(this.value) &&
        this.recordManager.getModelNameForRecord(this.value);
      if (
        this.isInEditMode &&
        currentValueModelName &&
        this.cachedTargetsModelName &&
        currentValueModelName !== this.cachedTargetsModelName
      ) {
        // Reset to default value when target model changes
        this.reset();
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.cachedTargetsModelNameObserver();
  },
});

const privilegesForModels = {
  space: spaceFlags,
  group: groupFlags,
  harvester: harvesterFlags,
  cluster: clusterFlags,
  atmInventory: atmInventoryFlags,
};

const InvitePrivilegesField = PrivilegesField.extend({
  /**
   * @override
   */
  name: 'privileges',

  /**
   * @override
   */
  classes: 'wrap-on-desktop',

  /**
   * @override
   */
  isVisible: reads('cachedPrivilegesPresetProxy.isFulfilled'),

  /**
   * @override
   */
  defaultValue: computed(
    'cachedPrivilegesModelName',
    'cachedPrivilegesPresetProxy.content',
    function () {
      if (this.cachedPrivilegesPresetProxy?.content) {
        return {
          privilegesTarget: this.cachedPrivilegesModelName,
          privileges: this.cachedPrivilegesPresetProxy.content,
        };
      }

      return {
        privilegesTarget: this.cachedPrivilegesModelName,
        privileges: [],
      };
    }
  ),

  /**
   * @override
   */
  privilegesGroups: computed(
    'cachedPrivilegesModelName',
    function privilegesGroups() {
      return privilegesForModels[this.cachedPrivilegesModelName] ?? [];
    }
  ),

  /**
   * @override
   */
  privilegeGroupsTranslationsPath: computed(
    'modelNameForTranslations',
    function privilegeGroupsTranslationsPath() {
      const modelName = _.upperFirst(this.get('modelNameForTranslations'));
      return modelName ?
        `components.content${modelName}Members.privilegeGroups` :
        undefined;
    }
  ),

  /**
   * @override
   */
  privilegesTranslationsPath: computed(
    'modelNameForTranslations',
    function privilegesTranslationsPath() {
      const modelName = _.upperFirst(this.get('modelNameForTranslations'));
      return modelName ?
        `components.content${modelName}Members.privileges` :
        undefined;
    }
  ),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedPrivilegesModelName: reads('parent.parent.cachedPrivilegesModelName'),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  cachedPrivilegesPresetProxy: reads('parent.parent.cachedPrivilegesPresetProxy'),

  /**
   * @type {ComputedProperty<string>}
   */
  modelNameForTranslations: computed(
    'cachedPrivilegesModelName',
    function modelNameForTranslations() {
      return this.cachedPrivilegesModelName === 'atmInventory' ?
        'atmInventories' :
        (this.cachedPrivilegesModelName && `${this.cachedPrivilegesModelName}s`);
    }
  ),

  cachedPrivilegesPresetProxyObserver: observer(
    'cachedPrivilegesPresetProxy.isFulfilled',
    function cachedPrivilegesPresetProxyObserver() {
      if (
        this.get('cachedPrivilegesPresetProxy.isFulfilled') &&
        this.isInEditMode &&
        this.value?.privilegesTarget !== this.cachedPrivilegesModelName
      ) {
        safeExec(this, () => this.reset());
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.cachedPrivilegesPresetProxyObserver();
  },
});

export const InviteTargetDetailsGroup = FormFieldsGroup.extend({
  recordManager: service(),
  privilegeManager: service(),

  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'inviteTargetDetails',

  /**
   * @override
   */
  isVisible: notEmpty('inviteTypeSpec.targetModelName'),

  /**
   * @override
   */
  fields: computed(() => [
    SiblingLoadingField.extend({
      loadingProxy: reads('parent.cachedTargetsProxy'),
      addColonToLabel: false,
    }).create({
      siblingName: 'target',
      name: 'loadingTarget',
    }),
    TargetField.create(),
    FormFieldsGroup.extend({
      isVisible: reads('parent.inviteTypeSpec.hasPrivileges'),
    }).create({
      name: 'invitePrivilegesDetails',
      fields: [
        SiblingLoadingField.extend({
          loadingProxy: reads('parent.parent.cachedPrivilegesPresetProxy'),
        }).create({
          name: 'loadingPrivileges',
          siblingName: 'privileges',
        }),
        InvitePrivilegesField.create(),
      ],
    }),
  ]),

  /**
   * @type {ComputedProperty<{ value: string, targetModelName: string | undefined, icon: string, hasPrivileges: boolean }>}
   */
  inviteTypeSpec: computed(
    'valuesSource.basic.inviteDetails.inviteType',
    function inviteTypeSpec() {
      const inviteType = this.valuesSource?.basic?.inviteDetails?.inviteType;
      return tokenInviteTypeOptions.find(({ value }) => value === inviteType);
    }
  ),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedTargetsModelName: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Array<Object>>>}
   */
  cachedTargetsProxy: PromiseObject.create({
    promise: new Promise(() => {}),
  }),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedPrivilegesModelName: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Array<string>>>}
   */
  cachedPrivilegesPresetProxy: PromiseObject.create({
    promise: new Promise(() => {}),
  }),

  /**
   * @type {ComputedProperty<Object | undefined>}
   */
  currentInviteTarget: reads(
    'valuesSource.basic.inviteDetails.inviteTargetDetails.target'
  ),

  cacheSetter: observer(
    'valuesSource.basic.type',
    'inviteTypeSpec',
    'context.editorMode',
    'currentInviteTarget',
    function cacheSetter() {
      scheduleOnce('actions', this, 'setupCache');
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.cacheSetter();
  },

  setupCache() {
    if (!this.inviteTypeSpec || this.valuesSource?.basic?.type !== 'invite') {
      return;
    }
    const newTargetsModelName = this.inviteTypeSpec.targetModelName;
    const newPrivilegesModelName = this.inviteTypeSpec.hasPrivileges &&
      newTargetsModelName;
    if (this.context.editorMode === 'create') {
      if (
        newTargetsModelName &&
        this.cachedTargetsModelName !== newTargetsModelName
      ) {
        this.setProperties({
          cachedTargetsModelName: newTargetsModelName,
          cachedTargetsProxy: PromiseArray.create({
            promise: this.recordManager.getUserRecordList(newTargetsModelName)
              .then(recordsList => get(recordsList, 'list'))
              .then(records => RecordOptionsArrayProxy.create({ records })),
          }),
        });
      }
      if (
        newPrivilegesModelName &&
        this.cachedPrivilegesModelName !== newPrivilegesModelName
      ) {
        this.setProperties({
          cachedPrivilegesModelName: newPrivilegesModelName,
          cachedPrivilegesPresetProxy: PromiseArray.create({
            promise: this.privilegeManager
              .getPrivilegesPresetForModel(newTargetsModelName)
              .then(result => result['member']),
          }),
        });
      }
    } else {
      if (newTargetsModelName) {
        this.setProperties({
          cachedTargetsModelName: newTargetsModelName,
          cachedTargetsProxy: PromiseArray.create({
            promise: resolve(this.currentInviteTarget ? [
              EmberObject.extend({
                label: reads('value.name'),
              }).create({
                value: this.currentInviteTarget,
                icon: recordIcon(this.currentInviteTarget),
              }),
            ] : []),
          }),
          cachedPrivilegesModelName: newPrivilegesModelName,
          cachedPrivilegesPresetProxy: PromiseArray.create({
            promise: resolve([]),
          }),
        });
      }
    }
  },
});
