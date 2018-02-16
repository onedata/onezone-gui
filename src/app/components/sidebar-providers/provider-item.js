/**
 * A first-level item component for providers sidebar
 *
 * @module components/sidebar-providers/provider-item
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { get } from '@ember/object';

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.sidebarProviders.providerItem',

  /**
   * Provider item
   * @type {Provider}
   */
  item: undefined,

  /**
   * Just an one-way alias
   * @type {Provider}
   */
  provider: reads('item'),

  /**
   * @type {Ember.computed<string>}
   */
  providerId: reads('provider.entityId'),

  /**
   * Icon class based on item status
   * @type {Ember.ComputedProperty<string>}
   */
  iconClass: computed('item.status', function () {
    switch (this.get('item.status')) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      default:
        return 'animated infinite hinge pulse-red-mint';
    }
  }),

  /**
   * @type {Ember.Computed<models/SpaceList>}
   */
  _spaceList: reads('provider.spaceList'),

  /**
   * Spaces supported by provider visible by current user
   * @type {Ember.ComputedProperty<Ember.Array<Space>>}
   */
  _spaces: reads('_spaceList.content.list.content'),

  /**
   * True if we know the list of space ids (eg. for counting spaces)
   * @type {Ember.Computed<boolean>}
   */
  _spaceIdsLoaded: computed(
    '_spaceList.isLoaded',
    function _getSpaceIdsLoaded() {
      const _spaceList = this.get('_spaceList');
      return !!(
        _spaceList &&
        get(_spaceList, 'isLoaded')
      );
    }
  ),

  /**
   * True if information about spaces is loaded (eg. for displaying support sizes)
   * @type {Ember.Computed<boolean>}
   */
  _spacesLoaded: computed(
    '_spaceIdsLoaded',
    '_spaceList.list.isFulfilled',
    function _getSpacesLoaded() {
      const _spaceIdsLoaded = this.get('_spaceIdsLoaded');
      const _spaceList = this.get('_spaceList');
      return !!(
        _spaceIdsLoaded &&
        get(_spaceList, 'list.isFulfilled')
      );
    }),

  /**
   * Total provider support size
   * @type {Ember.ComputedProperty<number>}
   */
  _totalSupportSize: computed(
    '_spaces.@each.supportSizes',
    '_spacesLoaded',
    'providerId',
    function _getTotalSupportSize() {
      const {
        _spaces,
        _spacesLoaded,
        providerId,
      } = this.getProperties('_spaces', '_spacesLoaded', 'providerId');
      if (_spacesLoaded) {
        return _spaces.reduce(
          (sum, space) => sum + get(space, `supportSizes.${providerId}`),
          0
        );
      }
    }),

  _totalSupportSizeHuman: computedPipe(bytesToString, '_totalSupportSize'),
});
