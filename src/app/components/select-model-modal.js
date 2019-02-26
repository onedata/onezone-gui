/**
 * Shows modal, that allows to choose one of provided model records.
 *
 * @module components/select-model-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import _ from 'lodash';
import computedT from 'onedata-gui-common/utils/computed-t';
import { resolve } from 'rsvp';

export default Component.extend(I18n, {
  tagName: '',

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
   * @virtual
   * @type {string}
   */
  recordIcon: undefined,

  /**
   * @virtual
   * @type {string}
   */
  modalClass: undefined,

  /**
   * @virtual
   * @type {string}
   */
  headerText: undefined,

  /**
   * @virtual
   * @type {string}
   */
  messageText: undefined,

  /**
   * @virtual
   * @type {string}
   */
  proceedButtonText: undefined,

  /**
   * @type {string|undefined}
   */
  proceedButtonClass: undefined,

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
   * @type {PromiseArray<Object>}
   */
  records: undefined,

  /**
   * Selected group
   * @type {Object}
   */
  selectedRecord: null,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  recordsForDropdown: reads('records'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  dropdownPlaceholder: computedT('dropdownPlaceholder'),

  /**
   * If true, proceed button is disabled
   * @type {Ember.ComputedProperty<boolean>}
   */
  proceedDisabled: computed(
    'processing',
    'selectedRecord',
    function proceedDisabled() {
      const {
        processing,
        selectedRecord,
      } = this.getProperties('processing', 'selectedRecord');
      return processing || !selectedRecord;
    }
  ),

  openedObserver: observer('opened', function openedObserver() {
    this.set('selectedRecord', null);
    this.loadRecords();
  }),

  /**
   * Loads groups for dropdown
   * @returns {undefined}
   */
  loadRecords() {
    return PromiseArray.create({ promise: resolve([]) });
  },

  actions: {
    proceed() {
      return this.get('proceed')(this.get('selectedRecord'));
    },
    recordMatcher(provider, term) {
      return _.includes(get(provider, 'name'), term) ? 1 : -1;
    },
  },
});
