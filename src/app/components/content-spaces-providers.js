/**
 * A providers view for single space - show supporting providers summary
 *
 * @module components/content-spaces-providers
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { collect } from 'ember-awesome-macros';

export default Component.extend(I18n, GlobalActions, ProvidersColors, {
  classNames: ['content-spaces-providers'],

  router: service(),
  i18n: service(),
  guiUtils: service(),
  spaceActions: service(),
  globalClipboard: service(),

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
    }),

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: computed(
    'space.currentUserEffPrivileges',
    function hasAddSupportPrivilege() {
      return this.get('space.currentUserEffPrivileges').includes('space_add_support');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<AspectAction>}
   */
  openAddStorageAction: computed(function () {
    const disabled = !this.get('hasAddSupportPrivilege');
    return {
      action: () => this.send('openAddStorage'),
      title: this.t('addStorage'),
      class: 'open-add-storage btn-add-support',
      buttonStyle: 'default',
      icon: 'provider-add',
      disabled,
      tip: disabled ? this.t('requireAddSupportTip') : null,
    };
  }),

  globalActions: computed('openAddStorageAction', function getGlobalActions() {
    return [this.get('openAddStorageAction')];
  }),

  ceaseOneproviderSupportAction: computed(
    'space.currentUserEffPrivileges',
    function ceaseOneproviderSupportAction() {
      const isDisabled = !this.get('space.currentUserEffPrivileges').includes('space_remove_support');
      return {
        icon: 'leave-space',
        text: this.t('ceaseSupportItem'),
        class: 'cease-oneprovider-support-btn',
        action: (provider) => this.openCeaseModal(provider),
        isDisabled,
        tip: isDisabled ? this.t('requireRemoveSupportTip') : null,
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
  showDetailsAction: computed(function showDetailsAction() {
    return {
      icon: 'provider',
      text: this.t('showDetailsAction'),
      class: 'show-provider-details-action-trigger',
      action: (provider) => this.showDetails(provider),
    };
  }),

  /**
   * @type {ComputedProperty<Array<Action>>}
   */
  providerActions: collect(
    'browseFilesAction',
    'showDetailsAction',
    'copyProviderIdAction',
    'copyProviderDomainAction',
    'ceaseOneproviderSupportAction'
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

  showDetails(provider) {
    const {
      guiUtils,
      router,
    } = this.getProperties('guiUtils', 'router');
    return router.transitionTo(
      'onedata.sidebar.content',
      'providers',
      guiUtils.getRoutableIdFor(provider),
    );
  },

  openCeaseModal(provider) {
    this.setProperties({
      ceaseModalOpened: true,
      ceaseModalProvider: provider,
    });
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
  },
});
