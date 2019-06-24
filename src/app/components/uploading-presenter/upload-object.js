import Component from '@ember/component';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  classNames: ['up-upload-object'],
  classNameBindings: ['isExpanded:expanded'],

  /**
   * @virtual
   * @type {Utils.UploadingObjectState}
   */
  objectState: undefined,

  /**
   * Property used to trigger children rendering when necessary
   * (to optimize whole component rendering)
   * @type {boolean}
   */
  triggerChildrenRender: false,

  /**
   * @type {boolean}
   */
  isExpanded: false,

  actions: {
    toggleExpand() {
      const oldTriggerChildrenRender = this.get('triggerChildrenRender');
      this.set('triggerChildrenRender', true);
      if (!oldTriggerChildrenRender) {
        next(() => safeExec(this, () => {
          this.toggleProperty('isExpanded');
        }));
      } else {
        this.toggleProperty('isExpanded');
      }
    },
  },
});
