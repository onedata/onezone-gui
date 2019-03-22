/**
 * Shows modal asking for new space name.
 *
 * @module components/content-harvesters-spaces/create-space-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
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
  i18nPrefix: 'components.contentHarvestersSpaces.createSpaceModal',

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
   * Harvester for which new space will be created
   * @type {Models.Harvester}
   * @virtual
   */
  relatedHarvester: undefined,

  /**
   * New group name.
   * @type {string}
   */
  newSpaceName: '',

  /**
   * If true, proceed button is disabled
   * @type {Ember.ComputedProperty<boolean>}
   */
  proceedDisabled: computed(
    'processing',
    'newSpaceName',
    function proceedDisabled() {
      const {
        processing,
        newSpaceName,
      } = this.getProperties('processing', 'newSpaceName');
      return processing || !newSpaceName;
    }
  ),

  openedObserver: observer('opened', function openedObserver() {
    this.set('newGroupName', '');
  }),

  actions: {
    onShown() {
      $('.create-space-name').focus();
    },
    create() {
      return this.get('proceed')(this.get('newSpaceName'));
    },
    redirectToSubmit() {
      $('.create-space-name .proceed').click();
    },
  },
});
