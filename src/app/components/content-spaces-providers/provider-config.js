/**
 * Contains a configuration GUI of a specific space support (for given pair space-provider).
 *
 * @author Agnieszka Warchoł, Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { or, not } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

const fallbackSupportParameters = Object.freeze({
  accountingEnabled: false,
  dirStatsServiceEnabled: false,
  dirStatsServiceStatus: 'disabled',
});
const dirStatsServiceStatusClasses = {
  initializing: 'label-warning',
  enabled: 'label-success',
  stopping: 'label-warning',
  disabled: 'label-default',
};

export default Component.extend(I18n, {
  classNames: ['provider-config', 'row', 'content-row', 'no-border'],

  i18n: service(),
  spaceManager: service(),
  globalNotify: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesProviders.providerConfig',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,

  /**
   * @type {ComputedProperty<SpaceSupportParameters>}
   */
  supportParameters: computed(
    'space.supportParametersRegistry',
    'provider.entityId',
    function supportParameters() {
      const providerId = this.get('provider.entityId');
      return (
        providerId &&
        this.get('space.supportParametersRegistry')?.[providerId]
      ) || fallbackSupportParameters;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  accountingEnabled: reads('supportParameters.accountingEnabled'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  dirStatsServiceEnabled: reads('supportParameters.dirStatsServiceEnabled'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  dirStatsServiceStatusTranslation: computed(
    'supportParameters.dirStatsServiceStatus',
    function dirStatsServiceStatusTranslation() {
      const dirStatsServiceStatus = this.get('supportParameters.dirStatsServiceStatus');
      const fallbackTranslation = this.t(
        `dirStatsService.statuses.${fallbackSupportParameters.dirStatsServiceStatus}`
      );
      return this.t(`dirStatsService.statuses.${dirStatsServiceStatus}`, {}, {
        defaultValue: fallbackTranslation,
      });
    }
  ),

  /**
   * @type {ComputedProperties<string>}
   */
  dirStatsServiceStatusClass: computed(
    'supportParameters.dirStatsServiceStatus',
    function dirStatsServiceStatusClass() {
      const dirStatsServiceStatus = this.get('supportParameters.dirStatsServiceStatus');
      if (dirStatsServiceStatus in dirStatsServiceStatusClasses) {
        return dirStatsServiceStatusClasses[dirStatsServiceStatus];
      } else {
        return dirStatsServiceStatusClasses[
          fallbackSupportParameters.dirStatsServiceStatus
        ];
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasEditPrivilege: reads('space.privileges.update'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  insufficientEditPrivilegesMessage: computed(
    function insufficientEditPrivilegesMessage() {
      return insufficientPrivilegesMessage({
        i18n: this.get('i18n'),
        modelName: 'space',
        privilegeFlag: 'space_update',
      });
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  dirStatsToggleDisabled: or(not('hasEditPrivilege'), 'accountingEnabled'),

  /**
   * @type {ComputedProperty<SafeString|undefined>}
   */
  dirStatsToggleLockHint: computed(
    'hasEditPrivilege',
    'accountingEnabled',
    function dirStatsToggleLockHint() {
      const {
        hasEditPrivilege,
        accountingEnabled,
        insufficientEditPrivilegesMessage,
      } = this.getProperties(
        'hasEditPrivilege',
        'accountingEnabled',
        'insufficientEditPrivilegesMessage'
      );

      if (!hasEditPrivilege) {
        return insufficientEditPrivilegesMessage;
      } else if (accountingEnabled) {
        return this.t('dirStatsService.disabledDueToAccounting');
      }
    }
  ),

  actions: {
    /**
     * @param {boolean} dirStatsServiceEnabled
     * @returns {Promise<void>}
     */
    async changeDirStatsServiceEnabled(dirStatsServiceEnabled) {
      const {
        spaceManager,
        globalNotify,
        space,
        provider,
      } = this.getProperties('spaceManager', 'globalNotify', 'space', 'provider');
      const spaceSupportParametersUpdate = {
        dirStatsServiceEnabled,
      };
      const nextDirStatsEnabledValue = dirStatsServiceEnabled ? 'enabled' : 'disabled';

      return this.modalManager.show('toggle-dir-stats-question-modal', {
        nextDirStatsEnabledValue,
        onSubmit: async () => {
          try {
            await spaceManager.modifySupportParameters(
              get(space, 'entityId'),
              get(provider, 'entityId'),
              spaceSupportParametersUpdate
            );
          } catch (error) {
            globalNotify.backendError(
              this.t('dirStatsService.configuringDirStats'),
              error
            );
            throw error;
          }
        },
      });
    },
  },
});
