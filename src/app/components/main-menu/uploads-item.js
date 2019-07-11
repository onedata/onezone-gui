import MainMenuItem from 'onedata-gui-common/components/main-menu-item';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default MainMenuItem.extend({
  classNames: ['main-menu-uploads-item'],

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
      return htmlSafe(`width: ${this.get('globalProgress') || 50}%`);
    }
  ),
});
