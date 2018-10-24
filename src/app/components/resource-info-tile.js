/**
 * Shows basic information about given record. It is a tile component ready
 * to place in overview page.
 *
 * @module components/resource-info-tile
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, set, get, getProperties } from '@ember/object';
import moment from 'moment';
import { reject } from 'rsvp';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.resourceInfoTile',

  /**
   * @virtual
   * @type {GraphSingleModel}
   */
  record: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  creatorIcon: computed('record.info.creatorType', function creatorIcon() {
    switch (this.get('record.info.creatorType')) {
      case 'null':
      case 'nobody':
        return null;
      case 'root':
      case 'user':
        return 'user';
      case 'provider':
        return 'provider';
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  creatorName: computed(
    'record.info.{creatorName,creatorType}',
    function creatorName() {
      const {
        creatorName: name,
        creatorType: type,
      } = getProperties(this.get('record.info'), 'creatorName', 'creatorType');
      switch (type) {
        case 'null':
        case 'nobody':
          return this.t('unknown');
        case 'root':
          return this.t('administrator');
        default:
          return name || this.t('unknown');
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isSpecialCreator: computed(
    'record.info.{creatorName,creatorType}',
    function creatorName() {
      const {
        creatorName: name,
        creatorType: type,
      } = getProperties(this.get('record.info'), 'creatorName', 'creatorType');
      return ['null', 'nobody', 'root'].includes(type) || !name;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  creationTime: computed('record.info.creationTime', function creationTime() {
    const timestamp = this.get('record.info.creationTime');
    return moment.unix(timestamp).format('D MMM YYYY H:mm:ss');
  }),

  actions: {
    saveName(name) {
      const record = this.get('record');
      if (!name || !name.length) {
        return reject();
      }
      const oldName = get(record, 'name');
      set(record, 'name', name);
      return record.save().catch(error => {
        this.get('globalNotify').backendError(this.t('changingName'), error);
        set(record, 'name', oldName);
        throw error;
      });
    },
  },
});
