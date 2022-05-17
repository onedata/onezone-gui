/**
 * A providers view for single space - show supporting providers summary
 *
 * @module components/content-spaces-providers
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { collect, conditional, or, raw } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';

const mixins = [
  I18n,
  GlobalActions,
  ProvidersColors,
];

export default ContentOneproviderContainerBase.extend(...mixins, {
  classNames: ['content-spaces-providers'],

  router: service(),
  i18n: service(),
  guiUtils: service(),
  spaceActions: service(),
  globalClipboard: service(),
  media: service(),

  i18nPrefix: 'components.contentSpacesProviders',

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

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
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function () {
    return this.t('space');
  }),

  // TODO: undefined possible?
  providersProxy: reads('space.providerList.list'),

  /**
   * One of: providerId or string `overview`. Value depends which tab is active 
   * @type {ComputedProperty<String>}
   */
  oneproviderId: or('navigationState.aspectOptions.oneproviderId', raw('overview')),

  // TODO: it will recompute everything if color changes
  providersData: computed(
    'providersProxy.{content.[],isFulfilled}',
    'providersColors',
    function getProvidersData() {
      const providersProxy = this.get('providersProxy');
      if (get(providersProxy, 'isFulfilled')) {
        const providerColors = this.get('providersColors');
        return providersProxy.map(provider => ({
          provider,
          color: providerColors[get(provider, 'entityId')],
        }));
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: reads('space.privileges.addSupport'),

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasRemoveSupportPrivilege: reads('space.privileges.removeSupport'),

  /**
   * @type {Ember.ComputedProperty<AspectAction>}
   */
  openAddStorageAction: computed('hasAddSupportPrivilege', function () {
    const {
      hasAddSupportPrivilege,
      i18n,
    } = this.getProperties('hasAddSupportPrivilege', 'i18n');
    return {
      action: () => this.send('openAddStorage'),
      title: this.t('addStorage'),
      class: 'open-add-storage btn-add-support',
      buttonStyle: 'default',
      icon: 'provider-add',
      disabled: !hasAddSupportPrivilege,
      tip: !hasAddSupportPrivilege ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_add_support',
      }) : null,
    };
  }),

  globalActions: computed('openAddStorageAction', function getGlobalActions() {
    return [this.get('openAddStorageAction')];
  }),

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

  oneproviderIdChanged(oneproviderId, replaceHistory) {
    const navigationState = this.get('navigationState');
    if (oneproviderId === 'overview') {
      navigationState.setRouteAspectOptions(null, replaceHistory);
    } else {
      navigationState.changeRouteAspectOptions({ oneproviderId }, replaceHistory);
    }
  },

  actions: {
    openAddStorage() {
      return this.get('router').transitionTo(
        'onedata.sidebar.content.aspect',
        'support'
      );
    },
    openRemoveSpace() {
      const {
        space,
        spaceActions,
      } = this.getProperties('space', 'spaceActions');

      this.set('ceaseModalOpened', false);
      spaceActions.createRemoveSpaceAction({ space }).execute();
    },

    oneproviderIdChanged(oneproviderId, replaceHistory) {
      return this.oneproviderIdChanged(oneproviderId, replaceHistory);
    },
  },
});
