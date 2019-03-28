import Component from '@ember/component';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-plugin'],

  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {PromiseObject}
   */
  manifestProxy: undefined,

  init() {
    this._super(...arguments);
    this.loadManifest();
  },

  /**
   * @returns {PromiseObject}
   */
  loadManifest() {
    const {
      harvesterManager,
      harvester,
    } = this.getProperties('harvesterManager', 'harvester');
    const proxy = PromiseObject.create({
      promise: harvesterManager.getGuiPluginManifest(get(harvester, 'id'))
        .catch(error => {
          if (get(error, 'status') === 404) {
            return null;
          } else {
            throw error;
          }
        }),
    });
    this.set('manifestProxy', proxy);
    return proxy;
  },

  actions: {

  },
});
