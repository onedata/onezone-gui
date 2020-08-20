/**
 * Second level sidebar items component base for spaces.
 * 
 * @module component/sidebar-spaces/second-level-items
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SecondLevelItems from 'onedata-gui-common/components/one-sidebar/second-level-items';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-sidebar/second-level-items';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  layout,

  i18n: service(),
  oneiconAlias: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarSpaces.secondLevelItems',

  /**
   * @virtual
   */
  item: undefined,

  /**
   * @type {Ember.ComputedProperty<Models.Space>}
   */
  space: reads('item'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterType: reads('cluster.type'),

  itemIndex: computed(function itemIndex() {
    return {
      id: 'index',
      label: this.t('aspects.index'),
      icon: 'overview',
    };
  }),

  itemData: computed(function itemData() {
    return {
      id: 'data',
      label: this.t('aspects.data'),
      icon: 'browser-directory',
    };
  }),

  itemShares: computed(function itemShares() {
    return {
      id: 'shares',
      label: this.t('aspects.shares'),
      icon: 'share',
    };
  }),

  itemTransfers: computed('space.privileges.viewTransfers', function itemTransfers() {
    const forbidden = this.get('space.privileges.viewTransfers') === false;
    return {
      id: 'transfers',
      label: this.t('aspects.transfers'),
      icon: 'transfers',
      forbidden,
      tip: forbidden ? this.t('insufficientTransferPrivileges') : undefined,
    };
  }),

  itemProviders: computed(function itemProviders() {
    return {
      id: 'providers',
      label: this.t('aspects.providers'),
      icon: 'provider',
    };
  }),

  itemMembers: computed(function itemMembers() {
    return {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    };
  }),

  itemHarvesters: computed(function itemHarvesters() {
    return {
      id: 'harvesters',
      label: this.t('aspects.harvesters'),
      icon: this.get('oneiconAlias').getName('harvester'),
    };
  }),

  spaceSecondLevelItems: collect(
    'itemIndex',
    'itemData',
    'itemShares',
    'itemTransfers',
    'itemProviders',
    'itemMembers',
    'itemHarvesters',
  ),

  init() {
    this._super(...arguments);
    // overwrite injected property
    this.set('internalSecondLevelItems', reads('spaceSecondLevelItems'));
  },
});
