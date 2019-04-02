import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import $ from 'jquery';
import { Promise } from 'rsvp';

export default PromiseObject.extend({
  /**
   * @virtual
   * @type {Promise<models.Harvester>}
   */
  harvester: undefined,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  manifest: reads('content'),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  version: reads('manifest.onedata.version'),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  indices: computed('manifest.onedata.indices', function indices() {
    const manifestIndices = this.get('manifest.onedata.indices');
    if (Array.isArray(manifestIndices)) {
      return manifestIndices.filter(index =>
        index && typeof get(index, 'name') === 'string'
      ).uniqBy('name');
    } else {
      return [];
    }
  }),

  init() {
    this._super(...arguments);
    this.loadManifest();
  },

  /**
   * @returns {Promise<Object>}
   */
  loadManifest() {
    const promise = this.get('harvester').then(harvester => {
      return new Promise((resolve, reject) => {
        $.ajax({
          dataType: 'json',
          url: get(harvester, 'guiPluginHttpLocation') + '/manifest.json',
          success: resolve,
          error: (xhr, type, details) => reject({
            status: get(xhr, 'status'),
            type,
            details,
          }),
        });
      }).catch(error => {
        if (get(error, 'status') === 404) {
          return null;
        } else {
          throw error;
        }
      });
    });
    this.set('promise', promise);
    return promise;
  },
});
