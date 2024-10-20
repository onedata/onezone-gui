/**
 * A support page for space
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  i18nPrefix: 'components.contentSpacesSupport',

  /**
   * @type {models/Space}
   */
  space: undefined,

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: reads('space.privileges.addSupport'),
});
