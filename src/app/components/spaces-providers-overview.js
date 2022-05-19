/**
 * A providers view for single space - show supporting providers summary
 *
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2018-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { collect, conditional } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import Component from '@ember/component';

const mixins = [
  I18n,
  GlobalActions,
  ProvidersColors,
];

export default Component.extend(...mixins, {
  classNames: ['spaces-providers-overview'],

  router: service(),
  i18n: service(),
  guiUtils: service(),
  spaceActions: service(),
  globalClipboard: service(),
  media: service(),

  i18nPrefix: 'components.spacesProvidersOverview',

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {<PromiseArray<Models.Providers>}
   */
  providersProxy: undefined,

  /**
   * Oneprovider model passed to cease support modal
   * @type {Models.Provider}
   */
  ceaseModalProvider: null,

  /**
   * @type {boolean}
   */
  ceaseModalOpened: false,

  /**
   * @type {ComputedProperty<Array<Models.Providers>>}
   */
  providers: reads('providersProxy.content'),

  // TODO: it will recompute everything if color changes
  providersData: computed(
    'providers',
    'providersColors',
    function getProvidersData() {
      const providers = this.get('providers');
      if (providers) {
        const providerColors = this.get('providersColors');
        return providers.map(provider => ({
          provider,
          color: providerColors[get(provider, 'entityId')],
        }));
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasRemoveSupportPrivilege: reads('space.privileges.removeSupport'),

  ceaseOneproviderSupportAction: computed(
    'space.privileges.removeSupport',
    function ceaseOneproviderSupportAction() {
      const {
        hasRemoveSupportPrivilege,
        i18n,
      } = this.getProperties('hasRemoveSupportPrivilege', 'i18n');
      return {
        icon: 'leave-space',
        text: this.t('ceaseSupportItem'),
        class: 'cease-oneprovider-support-btn',
        action: (provider) => this.openCeaseModal(provider),
        isDisabled: !hasRemoveSupportPrivilege,
        tip: !hasRemoveSupportPrivilege ? insufficientPrivilegesMessage({
          i18n,
          modelName: 'space',
          privilegeFlag: 'space_remove_support',
        }) : null,
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyProviderIdAction: computed(function copyProviderIdAction() {
    return {
      icon: 'copy',
      text: this.t('copyProviderIdAction'),
      class: 'copy-provider-id-action-trigger',
      action: (provider) => this.get('globalClipboard').copy(
        get(provider, 'entityId'),
        this.t('providerId')
      ),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyProviderDomainAction: computed(function copyProviderDomainAction() {
    return {
      icon: 'copy',
      text: this.t('copyProviderDomainAction'),
      class: 'copy-provider-domain-action-trigger',
      action: (provider) => this.get('globalClipboard').copy(
        get(provider, 'domain'),
        this.t('providerDomain')
      ),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  browseFilesAction: computed(function browseFilesAction() {
    return {
      icon: 'browser-directory',
      text: this.t('browseFilesAction'),
      class: 'visit-provider-action-trigger',
      action: (provider) => this.browseFiles(provider),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  showSettingsAction: computed(function showSettingsAction() {
    return {
      icon: 'settings',
      text: this.t('showSettingsAction'),
      class: 'show-provider-details-action-trigger',
      action: (provider) => this.showSettings(provider),
    };
  }),

  /**
   * @type {ComputedProperty<Array<Action>>}
   */
  providerActions: conditional(
    'media.isMobile',
    collect(
      'browseFilesAction',
      'showSettingsAction',
      'copyProviderIdAction',
      'copyProviderDomainAction',
      'ceaseOneproviderSupportAction'
    ), collect(
      'browseFilesAction',
      'showSettingsAction',
      'ceaseOneproviderSupportAction'
    )
  ),

  browseFiles(provider) {
    const {
      guiUtils,
      router,
      space,
    } = this.getProperties('guiUtils', 'router', 'space');
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'spaces',
      guiUtils.getRoutableIdFor(space),
      'data', {
        queryParams: {
          options: serializeAspectOptions({
            oneproviderId: get(provider, 'entityId'),
          }),
        },
      }
    );
  },

  showSettings(provider) {
    const guiUtils = this.get('guiUtils');
    const providerId = guiUtils.getRoutableIdFor(provider);
    this.oneproviderIdChanged(providerId);
  },

  openCeaseModal(provider) {
    this.setProperties({
      ceaseModalOpened: true,
      ceaseModalProvider: provider,
    });
  },

  actions: {
    openRemoveSpace() {
      const {
        space,
        spaceActions,
      } = this.getProperties('space', 'spaceActions');

      this.set('ceaseModalOpened', false);
      spaceActions.createRemoveSpaceAction({ space }).execute();
    },
  },
});
