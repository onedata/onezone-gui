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

import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { collect } from 'ember-awesome-macros';

export default Component.extend(I18n, GlobalActions, ProvidersColors, {
  classNames: ['content-spaces-providers'],

  router: service(),
  i18n: service(),
  guiUtils: service(),

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
   * @type {Ember.ComputedProperty<AspectAction>}
   */
  openAddStorageAction: computed(function () {
    return {
      action: () => this.send('openAddStorage'),
      title: this.t('addStorage'),
      class: 'open-add-storage',
      buttonStyle: 'default',
      icon: 'provider-add',
    };
  }),

  globalActions: computed('openAddStorageAction', function getGlobalActions() {
    return [this.get('openAddStorageAction')];
  }),

  ceaseOneproviderSupportAction: computed(
    function ceaseOneproviderSupportAction() {
      return {
        icon: 'leave-space',
        text: this.t('ceaseSupportItem'),
        class: 'cease-oneprovider-support-btn',
        action: (provider) => this.openCeaseModal(provider),
      };
    }
  ),

  providerActions: collect('ceaseOneproviderSupportAction'),

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
    providerClicked(provider) {
      const guiUtils = this.get('guiUtils');
      return this.get('router').transitionTo(
        'onedata.sidebar.content',
        'providers',
        guiUtils.getRoutableIdFor(provider)
      );
    },
  },
});
