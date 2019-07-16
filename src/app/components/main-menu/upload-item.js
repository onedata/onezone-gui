/**
 * Custom main menu item for uploads
 *
 * @module components/main-menu/upload-item
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import MainMenuItem from 'onedata-gui-common/components/main-menu-item';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default MainMenuItem.extend({
  classNames: ['main-menu-upload-item'],

  uploadingManager: service(),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  globalProgress: reads('uploadingManager.globalProgress'),

  /**
   * @type {Ember.ComputedProperty<HtmlSafe>}
   */
  progressBarWidthStyle: computed(
    'globalProgress',
    function progressBarWidthStyle() {
      return htmlSafe(`width: ${this.get('globalProgress') || 0}%`);
    }
  ),
});
