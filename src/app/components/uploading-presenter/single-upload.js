import Component from '@ember/component';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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
  isExpanded: false,

  /**
   * Callback called when user clicks on expand/collapse
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onToggleExpand: notImplementedIgnore,

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
    cancel() {

    },
  },
});
