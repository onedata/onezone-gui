/**
 * A popover placed near to the provider-place circle element,
 * visible when clicked. Contains information about provider and its spaces.
 * 
 * @module components/provider-place-drop
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/provider-place/drop';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: 'provider-place-drop',
  classNameBindings: ['provider.status'],
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.providerPlace.drop',

  /**
   * Spaces list sort order
   * @type {Array<string>}
   */
  _spacesSorting: Object.freeze(['isDefault:desc', 'name']),

  /**
   * Error occurred while loading list of spaces.
   * @type {*}
   */
  _spaceListError: null,

    /**
   * True if data for each space of provider is loaded (eg. support info)
   * @type {Ember.Computed<boolean>}
   */
  _spacesLoading: true,

  /**
   * One-way alias to space list record
   * @type {Ember.Computed<models/SpaceList>}
   */
  _spaceList: undefined,

  /**
   * Sorted array of spaces
   * @type {Array<models/Space>}
   */
  _spacesSorted: sort('_spaceList', '_spacesSorting'),

  providerObserver: observer('provider', function () {
    const provider = this.get('provider');
    this.set('_spacesLoading', true);
    provider.get('spaceList.list')
      .then((list) =>
        this.setProperties({
          _spaceList: list,
          _spaceListError: null,
          _spacesLoading: false,
        })
      )
      .catch((error) =>
        this.setProperties({
          _spaceList: null,
          _spaceListError: error,
          _spacesLoading: false,
        })
      );
  }),

  init() {
    this._super(...arguments);
    this.providerObserver();
  },

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t('hostnameCopySuccess'));
    },

    copyError() {
      this.get('globalNotify').info(this.t('hostnameCopyError'));
    }
  }
});
