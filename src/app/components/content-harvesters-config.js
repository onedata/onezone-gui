/**
 * A component that shows harvester configuration
 *
 * @module components/content-harvesters-config
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-config'],

  harvesterManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersConfig',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {string}
   */
  harvesterConfig: undefined,

  /**
   * @type {boolean}
   */
  isHarvesterConfigModified: false,

  /**
   * @type {boolean}
   */
  isHarvesterConfigValid: true,
  
  // /**
  //  * @type {Ember.ComputedProperty<PromiseObject<Model.HarvesterConfiguration>>}
  //  */
  // harvesterConfigRecord: computed('harvester', function () {
  //   const {
  //     harvesterManager,
  //     harvester,
  //   } = this.getProperties('harvesterManager', 'harvester');
  //   return PromiseObject.create({
  //     promise: harvesterManager.getConfig(get(harvester, 'entityId')),
  //   });
  // }),

  // configObserver: observer(
  //   'harvesterConfigRecord.configuration',
  //   function configObserver() {
  //     const isHarvesterConfigModified = this.get('isHarvesterConfigModified');
  //     if (!isHarvesterConfigModified) {
  //       let config = this.get('harvesterConfigRecord.config');
  //       config = JSON.stringify(config || {}, null, 2);
  //       this.set('harvesterConfig', config);
  //     }
  //   }
  // ),

  init() {
    this._super(...arguments);
    // this.configObserver();
  },

  actions: {
    onSave() {
      const {
        harvesterConfig,
        harvesterConfigRecord,
        globalNotify,
      } = this.getProperties(
        'harvesterConfig',
        'harvesterConfigRecord',
        'globalNotify'
      );
      harvesterConfigRecord.set('config', JSON.parse(harvesterConfig));
      return get(harvesterConfigRecord, 'content').save().then(() => {
        globalNotify.success(this.t('saveSuccess'));
        safeExec(this, () => {
          this.set('isHarvesterConfigModified', false);
        });        
      }).catch(error => {
        globalNotify.backendError(this.t('savingConfiguration', error));
      });
    },
  },
});
