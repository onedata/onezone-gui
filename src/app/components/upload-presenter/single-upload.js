/**
 * Presents a single upload triggered by user (groups possible many files, that
 * were marked to upload in the same operation). May be floating over the content
 * or an element in the standard list (depending on `floatingMode` value).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { next, later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

const minimizeAfterFinishDelay = 10000;

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
   * @type {(() => void) | null}
   */
  mouseEnterHandler: null,

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

    if (!this.element) {
      return;
    }

    this.set('mouseEnterHandler', () => {
      if (this.get('state') === 'uploaded') {
        const {
          isMinimized,
          minimizeTargetSelector,
        } = this.getProperties('isMinimized', 'minimizeTargetSelector');
        if (!isMinimized && minimizeTargetSelector) {
          this.cancelScheduledMinimalization();
        }
      }
    });
    this.element.addEventListener('mouseenter', this.mouseEnterHandler);
  },

  willDestroyElement() {
    try {
      this.cancelScheduledMinimalization();
      if (this.mouseEnterHandler) {
        this.element?.removeEventListener('mouseenter', this.mouseEnterHandler);
      }
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
        later(
          this,
          'send',
          'toggleMinimize',
          true,
          floatingMode ? minimizeAfterFinishDelay : 0
        )
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
      const normalizedExpand = expand ?? !isExpanded;

      if (normalizedExpand !== isExpanded) {
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
        'onToggleMinimize',
      );

      const normalizedMinimize = minimize ?? !isMinimized;
      if (normalizedMinimize === isMinimized) {
        return;
      } else {
        if (!isMinimized && minimizeTargetSelector) {
          this.cancelScheduledMinimalization();

          const target = globals.document.querySelector(minimizeTargetSelector);
          if (this.element && target) {
            const {
              top: targetTop,
              left: targetLeft,
            } = dom.offset(target);
            const {
              top: uploadTop,
              left: uploadLeft,
            } = dom.offset(this.element);
            const deltaTop = targetTop + dom.height(target) / 2 -
              uploadTop - dom.height(this.element);
            const deltaLeft = targetLeft + dom.width(target) / 2 -
              uploadLeft - dom.width(this.element) / 2;
            const component = this;
            dom.setStyles(this.element, {
              bottom: `${-deltaTop}px`,
              left: `${deltaLeft}px`,
              transform: 'scaleX(0)',
              opacity: '0.2',
            });
            $(this.element).animate({
              height: 0,
            }, 550, function afterMinimizeAnimation() {
              dom.setStyle(this, 'display', 'none');
              // minimalization state could change in the middle of animation
              if (normalizedMinimize !== component.get('isMinimized')) {
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
