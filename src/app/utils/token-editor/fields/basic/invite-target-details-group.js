/**
 * Invite target details fields of the tokens editor.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, observer } from '@ember/object';
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
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
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
  useRecordLabel: true,

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

const infiniteLoadProxy = promiseObject(new Promise(() => {}));

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
    function defaultValue() {
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
  fields: computed(function fields() {
    return [
      SiblingLoadingField.extend({
        /** @override */
        i18nPrefix: 'components.tokenEditor.fields.basic.inviteDetails.inviteTargetDetails.loadingTarget',
        loadingProxy: computed(
          'parent.cachedTargetsProxy',
          function loadingProxy() {
            return this.parent?.cachedTargetsProxy ?? infiniteLoadProxy;
          }
        ),
        loadingText: computed(
          'parent.{cachedTargetsProgressTracker.progressText,cachedTargetsModelName}',
          function loadingText() {
            const tracker = this.parent?.cachedTargetsProgressTracker;
            const targetsModelName = this.parent?.cachedTargetsModelName;
            const modelsNameText = this.t(`loader.modelsName.${targetsModelName}`, {}, {
              default: this.t('loader.modelsName.unknown'),
            });
            return this.t('loader.text', {
              modelsName: modelsNameText,
              percentage: tracker?.progressText || '',
            });
          }
        ),
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
            loadingProxy: computed(
              'parent.parent.cachedPrivilegesPresetProxy',
              function loadingProxy() {
                return this.parent?.parent?.cachedPrivilegesPresetProxy ??
                  infiniteLoadProxy;
              }
            ),
          }).create({
            name: 'loadingPrivileges',
            siblingName: 'privileges',
          }),
          InvitePrivilegesField.create(),
        ],
      }),
    ];
  }),

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
   * @type {ComputedProperty<ProgressTracker|null>}
   */
  cachedTargetsProgressTracker: reads('cachedTargetsLoaderProxy.progressTracker'),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedTargetsModelName: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Array<Object>>>}
   */
  cachedTargetsProxy: undefined,

  /**
   * @type {PromiseObject<ProgressTracker>}
   */
  cachedTargetsLoaderProxy: undefined,

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  cachedPrivilegesModelName: undefined,

  /**
   * @type {ComputedProperty<PromiseObject<Array<string>>>}
   */
  cachedPrivilegesPresetProxy: undefined,

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
    const cachedPrivilegesPresetProxy = promiseObject(resolve());
    const cachedTargetsProxy = promiseObject(resolve());
    this.setProperties({
      cachedPrivilegesPresetProxy,
      cachedTargetsProxy,
    });
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
        const loaderProxy =
          this.recordManager.getUserRecordListLoaderProxy(newTargetsModelName);
        const targetsPromise = (async () => {
          const records = await (await loaderProxy).getPromise();
          return RecordOptionsArrayProxy.create({ records });
        })();
        // Delete last loader cache after its load to refresh the list on new load (eg. a
        // new group has been added).
        targetsPromise.finally(() =>
          this.recordManager.clearUserRecordListLoaderCache(newTargetsModelName)
        );
        this.setProperties({
          cachedTargetsModelName: newTargetsModelName,
          cachedTargetsLoaderProxy: loaderProxy,
          cachedTargetsProxy: promiseArray(targetsPromise),
        });
      }
      if (
        newPrivilegesModelName &&
        this.cachedPrivilegesModelName !== newPrivilegesModelName
      ) {
        this.setProperties({
          cachedPrivilegesModelName: newPrivilegesModelName,
          cachedPrivilegesPresetProxy: promiseArray(this.privilegeManager
            .getPrivilegesPresetForModel(newTargetsModelName)
            .then(result => result['member'])
          ),
        });
      }
    } else {
      if (newTargetsModelName) {
        const targets = this.currentInviteTarget ? [
          EmberObject.extend({
            label: reads('value.name'),
          }).create({
            value: this.currentInviteTarget,
            icon: recordIcon(this.currentInviteTarget),
          }),
        ] : [];
        this.setProperties({
          cachedTargetsModelName: newTargetsModelName,
          cachedTargetsProxy: promiseArray(resolve(targets)),
          cachedTargetsLoaderProxy: null,
          cachedPrivilegesModelName: newPrivilegesModelName,
          cachedPrivilegesPresetProxy: promiseArray(resolve([])),
        });
      }
    }
  },
});
