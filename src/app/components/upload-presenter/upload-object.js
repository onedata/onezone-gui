/**
 * Represents single upload object (info and children)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import _ from 'lodash';

export default Component.extend({
  classNames: ['up-upload-object'],
  classNameBindings: ['isExpanded:expanded'],

  /**
   * @virtual
   * @type {Utils.UploadObject}
   */
  uploadObject: undefined,

  /**
   * Callback called when "Cancel" button is clicked
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

  /**
   * @type {Function}
   * @param {number} expandedLevels 0 means collapsed
   * @returns {undefined}
   */
  onExpand: notImplementedIgnore,

  /**
   * Property used to trigger children rendering when necessary
   * (to optimize whole component rendering)
   * @type {boolean}
   */
  triggerChildrenRender: false,

  /**
   * @virtual
   * @type {Object}
   */
  nestingStyle: undefined,

  /**
   * @type {boolean}
   */
  isExpanded: false,

  /**
   * Mapping: path: string -> expandedLevel: number
   * @type {Ember.ComputedProperty<Object>}
   */
  childrenLevelsExpanded: computed(() => ({})),

  willDestroyElement() {
    try {
      this.get('onExpand')(0);
    } finally {
      this._super(...arguments);
    }
  },

  toggleExpand() {
    this.toggleProperty('isExpanded');
    this.childrenLevelsExpandedChanged();
  },

  childrenLevelsExpandedChanged() {
    const {
      isExpanded,
      onExpand,
      childrenLevelsExpanded,
    } = this.getProperties('isExpanded', 'onExpand', 'childrenLevelsExpanded');
    let expandedLevels = 0;
    if (isExpanded) {
      expandedLevels = Math.max(0, ..._.values(childrenLevelsExpanded)) + 1;
    }
    onExpand(expandedLevels);
  },

  actions: {
    toggleExpand() {
      const oldTriggerChildrenRender = this.get('triggerChildrenRender');
      this.set('triggerChildrenRender', true);
      if (!oldTriggerChildrenRender) {
        next(() => safeExec(this, () => {
          this.toggleExpand();
        }));
      } else {
        this.toggleExpand();
      }
    },
    childrenExpanded(child, expandedLevels) {
      this.get('childrenLevelsExpanded')[get(child, 'objectPath')] = expandedLevels;
      this.childrenLevelsExpandedChanged();
    },
  },
});
