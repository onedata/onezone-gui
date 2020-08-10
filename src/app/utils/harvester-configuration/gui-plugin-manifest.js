/**
 * Container object that deals with harvester gui plugin manifest.
 * 
 * @module utils/harvester-configuration/gui-plugin-manifest
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { get, getProperties, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import $ from 'jquery';
import { Promise } from 'rsvp';
import { isNone } from '@ember/utils';
import { isArray } from '@ember/array';

export default PromiseObject.extend({
  /**
   * @virtual
   * @type {PromiseObject<models.Harvester>}
   */
  harvesterProxy: undefined,

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
      return manifestIndices
        .map(index => this.normalizeIndex(index))
        .uniqBy('name');
    } else {
      return [];
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Object|undefined>}
   */
  defaultGuiConfiguration: reads('manifest.onedata.defaultGuiConfiguration'),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  defaultGuiConfigurationStringified: computed(
    'defaultGuiConfiguration',
    function defaultGuiConfigurationStringified() {
      const defaultGuiConfiguration = this.get('defaultGuiConfiguration');
      if (defaultGuiConfiguration !== undefined) {
        return JSON.stringify(defaultGuiConfiguration, null, 2);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.loadManifest();
  },

  /**
   * @returns {Promise<Object>}
   */
  loadManifest() {
    const promise = this.get('harvesterProxy').then(harvester => {
      return new Promise((resolve, reject) => {
        $.ajax({
          dataType: 'json',
          url: get(harvester, 'guiPluginPath') + '/manifest.json',
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

  normalizeIndex(index) {
    const normalizedIndex = index && typeof index === 'object' ? index : {};
    const {
      name,
      schema,
      includeMetadata,
      includeFileDetails,
      includeRejectionReason,
      retryOnRejection,
    } = getProperties(normalizedIndex,
      'name',
      'schema',
      'includeMetadata',
      'includeFileDetails',
      'includeRejectionReason',
      'retryOnRejection'
    );

    if (typeof name !== 'string' || !name) {
      return null;
    }

    let normalizedSchema;
    if (isNone(schema) || schema === '') {
      normalizedSchema = '';
    } else if (typeof schema !== 'string') {
      normalizedSchema = JSON.stringify(schema, null, 2);
    }

    let normalizedIncludeMetadata;
    if (isNone(includeMetadata) || !isArray(includeMetadata)) {
      normalizedIncludeMetadata = ['basic', 'json', 'rdf'];
    } else {
      normalizedIncludeMetadata =
        includeMetadata.filter(metadata => typeof metadata === 'string');
    }

    let normalizedIncludeFileDetails;
    if (isNone(includeFileDetails) || !isArray(includeFileDetails)) {
      normalizedIncludeFileDetails = [
        'fileName',
        'originSpace',
        'metadataExistenceFlags',
      ];
    } else {
      normalizedIncludeFileDetails =
        includeFileDetails.filter(detail => typeof detail === 'string');
    }

    return {
      name,
      schema: normalizedSchema,
      includeMetadata: normalizedIncludeMetadata,
      includeFileDetails: normalizedIncludeFileDetails,
      includeRejectionReason: typeof includeRejectionReason === 'boolean' ?
        includeRejectionReason : true,
      retryOnRejection: typeof retryOnRejection === 'boolean' ? retryOnRejection : true,
    };
  },
});
