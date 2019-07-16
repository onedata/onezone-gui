/**
 * A first-level item component for uploads sidebar
 *
 * @module components/sidebar-uploads/upload-item
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { conditional, raw } from 'ember-awesome-macros';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarUploads.uploadItem',

  /**
   * @virtual
   * @type {Models.Provider}
   */
  item: undefined,

  /**
   * @type {Ember.ComputedProperty<Models.Provider>}
   */
  oneprovider: reads('item'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  oneproviderIcon: conditional(
    'oneprovider.isAllOneproviders',
    raw('providers'),
    raw('provider')
  ),
});
