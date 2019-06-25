import Component from '@ember/component';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  classNames: ['up-upload-object'],
  classNameBindings: ['isExpanded:expanded'],

  uploadingManager: service(),

  /**
   * @virtual
   * @type {Utils.UploadingObjectState}
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
