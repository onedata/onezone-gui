/**
 * A providers view for single space - show supporting providers summary 
 * and settings per provider
 *
 * @module components/content-spaces-providers
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { or, raw } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';

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

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: reads('space.privileges.addSupport'),

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

    oneproviderIdChanged(oneproviderId, replaceHistory) {
      return this.oneproviderIdChanged(oneproviderId, replaceHistory);
    },
  },
});
