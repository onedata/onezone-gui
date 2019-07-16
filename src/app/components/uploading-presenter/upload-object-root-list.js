/**
 * Top level list of upload objects inside single upload
 *
 * @module components/uploading-presenter/upload-object-root-list
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import _ from 'lodash';
import { scheduleOnce} from '@ember/runloop';

export default Component.extend({
  classNames: ['up-upload-object-root-list'],

  /**
   * @virtual
   * @type {Array<Utils.UploadingObjectState>}
   */
  uploadObjects: undefined,

  /**
   * Callback called when "Cancel" button is clicked
   * @virtual
   * @type {Function}
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

  /**
   * Set by recalculateMaxExpandedLevel method.
   * @type {number}
   */
  maxExpandedLevel: 0,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  childrenLevelsExpanded: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  nestingStyle: computed('maxExpandedLevel', function nestingStyle() {
    const maxExpandedLevel = this.get('maxExpandedLevel');
    return {
      px: 15,
      percent: 50 / Math.max(maxExpandedLevel, 1),
    };
  }),

  recalculateMaxExpandedLevel() {
    this.set(
      'maxExpandedLevel',
      Math.max(0, ..._.values(this.get('childrenLevelsExpanded')))
    );
  },

  actions: {
    childrenExpanded(child, expandedLevels) {
      this.get('childrenLevelsExpanded')[get(child, 'objectPath')] =
        expandedLevels;
      scheduleOnce('afterRender', this, 'recalculateMaxExpandedLevel');
    },
  },
});
