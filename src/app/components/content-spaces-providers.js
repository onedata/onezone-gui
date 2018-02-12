/**
 * FIXME: jsdoc 
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
import _ from 'lodash';

import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import generateColors from 'onedata-gui-common/utils/generate-colors';

export default Component.extend(I18n, GlobalActions, {
  router: service(),

  i18nPrefix: 'components.contentSpacesProviders',

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

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
      } else {
        return undefined;
      }
    }),

  // TODO: maybe this is not needed - better compute color live in providersData
  /**
   * Global colors for each provider
   * @type {Ember.ComputedProperty<Object>}
   */
  providersColors: computed(
    'providersProxy.{content.@each.id,isFulfilled}',
    function getProvidersColors() {
      const providersProxy = this.get('providersProxy');
      if (get(providersProxy, 'isFulfilled')) {
        const providerIds = get(providersProxy, 'content').mapBy('entityId').sort();
        const colors = generateColors(providerIds.length);
        return _.zipObject(providerIds, colors);
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

  actions: {
    openAddStorage() {
      this.get('router').transitionTo('onedata.sidebar.content.aspect', 'support');
    },
  },
});
