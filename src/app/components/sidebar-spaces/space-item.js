/**
 * A first-level item component for spaces sidebar
 *
 * @module components/sidebar-spaces/space-item
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import { get } from '@ember/object';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.sidebarSpaces.spaceItem',

  /**
   * Provider item
   * @type {Provider}
   */
  item: undefined,

  /**
   * Just an one-way alias
   * @type {Provider}
   */
  space: computed.reads('item'),

  /**
   * @type {Ember.computed<string>}
   */
  spaceId: computed.reads('space.entityId'),

  /**
   * @type {Ember.Computed<models/ProviderList>}
   */
  _providerList: computed.reads('space.providerList'),

  /**
   * True if we know the list of provider ids (eg. for counting spaces)
   * @type {Ember.Computed<boolean>}
   */
  _providerIdsLoaded: computed(
    '_providerList.isLoaded',
    function _getSpaceIdsLoaded() {
      const _providerList = this.get('_providerList');
      return !!(
        _providerList &&
        get(_providerList, 'isLoaded')
      );
    }
  ),

  _providersCount: computed(
    'space.supportSizes',
    function _getProvidersCount() {
      const supportSizes = this.get('space.supportSizes');
      if (supportSizes) {
        return Object.keys(supportSizes).length;
      }
    }
  ),

  /**
   * Total support size for space
   * @type {Ember.ComputedProperty<number>}
   */
  _totalSupportSize: computed(
    'space.supportSizes',
    function _getTotalSupportSize() {
      const supportSizes = this.get('space.supportSizes');
      if (supportSizes) {
        return _.sum(_.values(supportSizes));
      }
    }),

  _totalSupportSizeHuman: computedPipe(bytesToString, '_totalSupportSize'),
});
