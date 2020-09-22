/**
 * A first-level item component for spaces sidebar
 *
 * @module components/sidebar-spaces/space-item
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),
  spaceActions: service(),
  router: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarSpaces.spaceItem',

  /**
   * Proxy of current user
   * @type {Ember.ComputedProperty<PromiseObject<models/User>>}
   */
  userProxy: reads('sidebar.userProxy'),

  /**
   * Provider item
   * @type {Provider}
   */
  item: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  inSidenav: false,

  /**
   * @type {boolean}
   */
  leaveSpaceModalOpen: false,

  /**
   * @type {boolean}
   */
  isLeaving: false,

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

  /**
   * Number of providers supporting the space
   * @type {Ember.ComputedProperty<number>}
   */
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

  /**
   * Human-readable total support for space (eg. "30 GiB")
   * @type {Ember.ComputedProperty<string>}
   */
  _totalSupportSizeHumanReadable: computedPipe('_totalSupportSize', bytesToString),

  /**
   * @type {Ember.ComputedProperty<Utils.Action>}
   */
  leaveAction: computed(function leaveAction() {
    return {
      action: () => this.send('showLeaveModal'),
      title: this.t('leave'),
      class: 'leave-record-trigger',
      icon: 'leave-space',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Utils.Action>}
   */
  removeAction: computed('space', function removeAction() {
    const {
      spaceActions,
      space,
    } = this.getProperties('spaceActions', 'space');

    return spaceActions.createRemoveSpaceAction({ space });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  itemActions: collect('leaveAction', 'removeAction'),

  actions: {
    showLeaveModal() {
      this.set('leaveSpaceModalOpen', true);
    },
    closeLeaveModal() {
      this.set('leaveSpaceModalOpen', false);
    },
    leave() {
      const {
        space,
        spaceActions,
        navigationState,
      } = this.getProperties('space', 'spaceActions', 'navigationState');
      this.set('isLeaving', true);
      return spaceActions.leaveSpace(space)
        .then(() => navigationState.redirectToCollectionIfResourceNotExist())
        .finally(() =>
          safeExec(this, 'setProperties', {
            isLeaving: false,
            leaveSpaceModalOpen: false,
          })
        );
    },
  },
});
