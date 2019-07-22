/**
 * Presents a single upload triggered by user (groups possible many files, that
 * were marked to upload in the same operation). May be floating over the content
 * or an element in the standard list (depending on `floatingMode` value).
 *
 * @module components/upload-presenter/single-upload
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { next, later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

export default Component.extend({
  classNames: ['up-single-upload'],

  /**
   * @virtual
   * @type {Array<Utils.UploadObject>}
   */
  uploadObject: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  minimizeTargetSelector: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isExpanded: false,

  /**
   * @virtual
   * @type {boolean}
   */
  minimizeOnSuccess: true,

  /**
   * @virtual
   * @type {boolean}
   */
  isMinimized: false,

  /**
   * @virtual
   * @type {boolean}
   */
  floatingMode: false,

  /**
   * Callback called when user clicks on expand/collapse
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onToggleExpand: notImplementedIgnore,

  /**
   * Callback called when user clicks on 'send to background'/'make floating'
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onToggleMinimize: notImplementedIgnore,

  /**
   * Callback called when user clicks cancel on file/directory upload
   * @virtual
   * @type {Function}
   * @param {Utils.UploadObject}
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

  /**
   * Property used to trigger files rendering when necessary
   * (to optimize whole component rendering)
   * @type {boolean}
   */
  triggerChildrenRender: false,

  /**
   * @type {any}
   */
  scheduledMinimalization: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCancelled: reads('uploadObject.isCancelled'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  state: reads('uploadObject.state'),

  stateObserver: observer('state', function stateObserver() {
    const {
      state,
      minimizeOnSuccess,
    } = this.getProperties(
      'state',
      'minimizeOnSuccess'
    );
    if (state === 'uploaded' && minimizeOnSuccess) {
      this.scheduleMinimalization();
    }
  }),

  isMinimizedObserver: observer('isMinimized', function isMinimized() {
    this.cancelScheduledMinimalization();
  }),

  didInsertElement() {
    this._super(...arguments);
    if (this.get('floatingMode')) {
      this.send('toggleExpand', true);
    }
  },

  willDestroyElement() {
    try {
      this.cancelScheduledMinimalization();
    } finally {
      this._super(...arguments);
    }
  },

  scheduleMinimalization() {
    const {
      scheduledMinimalization,
      floatingMode,
    } = this.getProperties(
      'scheduledMinimalization',
      'floatingMode',
    );
    if (scheduledMinimalization === undefined) {
      this.set(
        'scheduledMinimalization',
        later(this, 'send', 'toggleMinimize', true, floatingMode ? 3000 : 0)
      );
    }
  },

  cancelScheduledMinimalization() {
    const scheduledMinimalization = this.get('scheduledMinimalization');
    if (scheduledMinimalization !== undefined) {
      cancel(scheduledMinimalization);
      this.set('scheduledMinimalization', undefined);
    }
  },

  actions: {
    toggleExpand(expand) {
      const {
        triggerChildrenRender,
        onToggleExpand,
        isExpanded,
      } = this.getProperties(
        'triggerChildrenRender',
        'onToggleExpand',
        'isExpanded'
      );
      if (expand === undefined) {
        expand = !isExpanded;
      }

      if (expand !== isExpanded) {
        this.set('triggerChildrenRender', true);
        if (!triggerChildrenRender) {
          // wait for children to render
          next(() => safeExec(this, () => {
            onToggleExpand();
          }));
        } else {
          onToggleExpand();
        }
      }
    },
    cancel(uploadObject) {
      this.get('onCancel')(uploadObject);
      if (this.get('uploadObject.isCancelled')) {
        this.scheduleMinimalization();
      }
    },
    toggleMinimize(minimize) {
      const {
        minimizeTargetSelector,
        isMinimized,
        onToggleMinimize,
      } = this.getProperties(
        'minimizeTargetSelector',
        'isMinimized',
        'onToggleMinimize'
      );
      if (minimize === undefined) {
        minimize = !isMinimized;
      }
      if (minimize === isMinimized) {
        return;
      } else {
        if (!isMinimized && minimizeTargetSelector) {
          this.cancelScheduledMinimalization();

          const target = $(minimizeTargetSelector);
          if (target) {
            const {
              top: targetTop,
              left: targetLeft,
            } = target.offset();
            const {
              top: uploadTop,
              left: uploadLeft,
            } = this.$().offset();
            const deltaTop = targetTop + target.outerHeight() / 2 -
              uploadTop - this.$().outerHeight();
            const deltaLeft = targetLeft + target.outerWidth() / 2 -
              uploadLeft - this.$().outerWidth() / 2;
            const component = this;
            this.$().css({
              bottom: -deltaTop,
              left: deltaLeft,
              transform: 'scaleX(0)',
              opacity: 0.2,
            }).animate({
              height: 0,
            }, 550, function afterMinimizeAnimation() {
              $(this).css({ display: 'none' });
              // minimalization state could change in the middle of animation
              if (minimize !== component.get('isMinimized')) {
                safeExec(component, 'onToggleMinimize');
              }
            });
          }
        } else {
          onToggleMinimize();
        }
      }
    },
  },
});
