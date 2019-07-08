import Component from '@ember/component';
import { next } from '@ember/runloop';
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
    toggleMinimize() {
      const {
        minimizeTargetSelector,
        isMinimized,
        onToggleMinimize,
      } = this.getProperties(
        'minimizeTargetSelector',
        'isMinimized',
        'onToggleMinimize'
      );
      const that = this;
      if (!isMinimized && minimizeTargetSelector) {
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
          const deltaTop = targetTop + target.outerHeight() / 2 - uploadTop - this.$().outerHeight();
          const deltaLeft = targetLeft + target.outerWidth() / 2 - uploadLeft - this.$().outerWidth() / 2;
          this.$().css({
            bottom: -deltaTop,
            left: deltaLeft,
            transform: 'scaleX(0)',
            opacity: 0.2,
          }).animate({
            height: 0,
          }, 350, function () {
            $(this).css({ display: 'none' });
            safeExec(that, 'onToggleMinimize');
          });
        }
      } else {
        onToggleMinimize();
      }
    },  
  },
});
