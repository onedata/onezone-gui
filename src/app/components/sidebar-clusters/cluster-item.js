/**
 * A first-level item component for clusters sidebar
 *
 * @module components/sidebar-clusters/group-item
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters.clusterItem',

  /**
   * @type {Ember.ComputedProperty<Group>}
   */
  cluster: reads('item'),
});
