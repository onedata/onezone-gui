/**
 * Shows modal asking for new relative group name.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import $ from 'jquery';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.groupCreateRelativeModal',

  /**
   * If true, modal is opened
   * @type {boolean}
   * @virtual
   */
  opened: false,

  /**
   * If true, modal cannot be closed and proceed button has active spinner
   * @type {boolean}
   * @virtual
   */
  processing: false,

  /**
   * Action called to close modal
   * @type {function}
   * @virtual
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Action called to proceed
   * @type {function}
   * @virtual
   * @returns {*}
   */
  proceed: notImplementedThrow,

  /**
   * Record for which new group will be created
   * @type {GraphSingleModel}
   * @virtual
   */
  relatedRecord: undefined,

  /**
   * New group will be with `group` in relation specified by this field.
   * One of `child`, `parent`.
   * @type {string}
   * @virtual
   */
  relation: 'child',

  /**
   * New group name.
   * @type {string}
   */
  newGroupName: '',

  /**
   * If true, proceed button is disabled
   * @type {Ember.ComputedProperty<boolean>}
   */
  proceedDisabled: computed(
    'processing',
    'newGroupName',
    function proceedDisabled() {
      const {
        processing,
        newGroupName,
      } = this.getProperties('processing', 'newGroupName');
      return processing || !newGroupName;
    }
  ),

  openedObserver: observer('opened', function openedObserver() {
    this.set('newGroupName', '');
  }),

  actions: {
    onShown() {
      $('.create-relative-group-name').focus();
    },
    create() {
      return this.get('proceed')(this.get('newGroupName'));
    },
    redirectToSubmit() {
      $('.group-create-relative-modal .proceed').click();
    },
  },
});
