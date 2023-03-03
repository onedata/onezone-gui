/**
 * A component that aggregates functionality related to harvester configuration.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { or, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration'],

  i18n: service(),
  navigationState: service(),
  router: service(),

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
  activeTab: or('options.tab', raw('general-tab')),

  actions: {
    onTabChange(tab) {
      this.get('router').transitionTo('onedata.sidebar.content.aspect', {
        queryParams: {
          options: 'tab.' + tab,
        },
      });
    },
  },
});
