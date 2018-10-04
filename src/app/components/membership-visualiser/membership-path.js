import Component from '@ember/component';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(RecognizerMixin, {
  recognizers: 'pan',

  /**
   * @virtual
   * @type {function}
   * @param {number} deltaX
   * @returns {undefined}
   */
  onPan: notImplementedThrow,

  /**
   * Redirects to record dedicated page
   * @type {Function}
   * @virtual
   * @param {GraphSingleModel} record
   * @returns {undefined}
   */
  view: notImplementedThrow,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,
  
  /**
   * @type {number}
   */
  lastPanDeltaX: 0,

  panStart() {
    this.set('lastPanDeltaX', 0);
  },

  panMove(event) {
    const panDeltaX = this.get('lastPanDeltaX') - event.originalEvent.gesture.deltaX;
    this.set('lastPanDeltaX', event.originalEvent.gesture.deltaX );
    this.get('onPan')(panDeltaX);
  },
});
