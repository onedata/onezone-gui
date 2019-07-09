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
   * @type {Array<Utils.UploadingObjectState>}
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
   * @param {Utils.UploadingObjectState}
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

  isCancelledObserver: observer('isCancelled', function isCancelledObserver() {
    const {
      isMinimized,
      isCancelled,
    } = this.getProperties('isMinimized', 'isCancelled');
    if (isCancelled && !isMinimized) {
      this.send('toggleMinimize');
    }
  }),

  stateObserver: observer('state', function stateObserver() {
    const {
      state,
      scheduledMinimalization,
      floatingMode,
    } = this.getProperties('state', 'scheduledMinimalization', 'floatingMode');
    if (state === 'uploaded' && scheduledMinimalization === undefined) {
      this.set(
        'scheduledMinimalization',
        later(this, 'send', 'toggleMinimize', true, floatingMode ? 3000 : 0)
      );
    }
  }),

  isMinimizedObserver: observer('isMinimized', function isMinimized() {
    this.cancelScheduledMinimalization();
  }),

  didInsertElement() {
    this._super(...arguments);

    this.send('toggleExpand');
  },

  willDestroyElement() {
    try {
      this.cancelScheduledMinimalization();
    } finally {
      this._super(...arguments);
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
    toggleExpand() {
      const {
        triggerChildrenRender,
        onToggleExpand,
      } = this.getProperties('triggerChildrenRender', 'onToggleExpand');
      this.set('triggerChildrenRender', true);
      if (!triggerChildrenRender) {
        next(() => safeExec(this, () => {
          onToggleExpand();
        }));
      } else {
        onToggleExpand();
      }
    },
    cancel(uploadObject) {
      this.get('onCancel')(uploadObject);
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
            const that = this;
            this.$().css({
              bottom: -deltaTop,
              left: deltaLeft,
              transform: 'scaleX(0)',
              opacity: 0.2,
            }).animate({
              height: 0,
            }, 350, function () {
              $(this).css({ display: 'none' });
              // minimalization state could change in the middle of animation
              if (minimize === that.get('isMinimized')) {
                safeExec(that, 'onToggleMinimize');
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
