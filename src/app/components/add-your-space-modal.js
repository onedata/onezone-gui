/**
 * Shows modal, that allows to choose one of available spaces
 *
 * @module components/add-your-space-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import layout from 'onezone-gui/templates/components/select-model-modal';
import SelectModelModal from 'onezone-gui/components/select-model-modal';
import computedT from 'onedata-gui-common/utils/computed-t';

export default SelectModelModal.extend({
  layout,

  spaceManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.addYourSpaceModal',

  /**
   * @virtual
   * @type {string}
   */
  relation: undefined,

  /**
   * @override
   */
  recordIcon: 'space',

  /**
   * @override
   */
  modalClass: 'add-your-space-modal',

  /**
   * @type {Object}
   */
  relatedRecord: undefined,

  /**
   * @override
   */
  headerText: computedT('addYourSpace'),

  /**
   * @override
   */
  messageText: computed(
    'relatedRecord.{name,entityType}',
    'relation',
    function messageText() {
      const {
        relation,
        relatedRecord,
      } = this.getProperties('relation', 'relatedRecord');
      const {
        name,
        entityType,
      } = getProperties(relatedRecord, 'name', 'entityType');
      return this.t('message', {
        relation: this.t(relation),
        recordType: this.t(entityType),
        recordName: name,
      });
    }
  ),

  /**
   * @override
   */
  proceedButtonText: computedT('add'),

  /**
   * @override
   */
  loadRecords() {
    this.set('records', PromiseArray.create({
      promise: this.get('spaceManager').getSpaces()
        .then(spaceList => get(spaceList, 'list')),
    }));
  },
});
