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
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import recordIcon from 'onedata-gui-common/utils/record-icon';

export default SecondLevelItems.extend(I18n, {
  layout,

  i18n: service(),

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

  itemData: computed('space.privileges.readData', function itemData() {
    const i18n = this.get('i18n');
    const privileges = this.get('space.privileges');
    const forbidden = privileges.readData === false;
    return {
      id: 'data',
      label: this.t('aspects.data'),
      icon: 'browser-directory',
      forbidden,
      tip: forbidden ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_read_data',
      }) : undefined,
    };
  }),

  itemShares: computed('space.privileges.view', function itemShares() {
    const i18n = this.get('i18n');
    const privileges = this.get('space.privileges');
    const forbidden = privileges.view === false;
    return {
      id: 'shares',
      label: this.t('aspects.shares'),
      icon: 'share',
      forbidden,
      tip: forbidden ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_view',
      }) : undefined,
    };
  }),

  itemTransfers: computed(
    'space.privileges.viewTransfers',
    function itemTransfers() {
      const i18n = this.get('i18n');
      const privileges = this.get('space.privileges');
      const forbidden = privileges.viewTransfers === false;
      return {
        id: 'transfers',
        label: this.t('aspects.transfers'),
        icon: 'transfers',
        forbidden,
        tip: forbidden ? insufficientPrivilegesMessage({
          i18n,
          modelName: 'space',
          privilegeFlag: 'space_view_transfers',
        }) : undefined,
      };
    }
  ),

  itemProviders: computed(function itemProviders() {
    return {
      id: 'providers',
      label: this.t('aspects.providers'),
      icon: 'provider',
    };
  }),

  itemMembers: computed('space.privileges.view', function itemMembers() {
    const i18n = this.get('i18n');
    const privileges = this.get('space.privileges');
    const forbidden = privileges.view === false;
    return {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
      forbidden,
      tip: forbidden ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_view',
      }) : undefined,
    };
  }),

  itemHarvesters: computed('space.privileges.view', function itemHarvesters() {
    const i18n = this.get('i18n');
    const privileges = this.get('space.privileges');
    const forbidden = privileges.view === false;
    return {
      id: 'harvesters',
      label: this.t('aspects.harvesters'),
      icon: recordIcon('harvester'),
      forbidden,
      tip: forbidden ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_view',
      }) : undefined,
    };
  }),

  itemAutomation: computed('space.privileges.view', function itemAutomation() {
    const i18n = this.get('i18n');
    const privileges = this.get('space.privileges');
    const forbidden = privileges.view === false;
    return {
      id: 'automation',
      label: this.t('aspects.automation'),
      icon: recordIcon('atmInventory'),
      forbidden,
      tip: forbidden ? insufficientPrivilegesMessage({
        i18n,
        modelName: 'space',
        privilegeFlag: 'space_view',
      }) : undefined,
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
    'itemAutomation',
  ),

  init() {
    this._super(...arguments);
    // overwrite injected property
    this.set('internalSecondLevelItems', reads('spaceSecondLevelItems'));
  },
});
