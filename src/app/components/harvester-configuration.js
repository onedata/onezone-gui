/**
 * A component that aggregates functionality related to harvester configuration.
 *
 * @module components/harvester-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const tabs = [
  'general',
  'gui-plugin',
];

export default Component.extend(I18n, {
  classNames: ['harvester-configuration'],

  i18n: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration',

  /**
   * @type {Model.Harvester}
   */
  harvester: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  activeTab: 'harv-config-general-tab',

  init() {
    this._super(...arguments);
    const activeTab = this.get('navigationState.queryParams.tab');
    if (tabs.includes(activeTab)) {
      this.set('activeTab', `harv-config-${activeTab}-tab`);
    }
  },
});
