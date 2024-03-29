/**
 * A mocked abstraction layer for Onedata Sync API Websocket connection properties
 * For properties description see non-mocked `services/onedata-connection`
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataConnection from 'onedata-gui-websocket-client/services/mocks/onedata-connection';
import EmberObject, { computed } from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';

const zoneName = 'Hello world';
const zoneDomain = globals.location.hostname;

export default OnedataConnection.extend({
  onezoneRecord: undefined,
  zoneName,
  zoneDomain,
  serviceVersion: '19.02.9',
  serviceBuildVersion: 'm-23493894y7238',
  brandSubtitle: 'Isolated zone',
  maxTemporaryTokenTtl: 14 * 24 * 60 * 60,
  defaultHarvestingBackendType: 'elasticsearch_harvesting_backend',
  defaultHarvestingBackendEndpoint: '172.17.0.8:9200',
  defaultAtmResourceSpec: computed(() => ({
    cpuRequested: 0.1,
    cpuLimit: null,
    memoryRequested: 128 * 1024 * 1024,
    memoryLimit: null,
    ephemeralStorageRequested: 0,
    ephemeralStorageLimit: null,
  })),
  defaultAtmInstantFailureExceptionThreshold: 0.1,
  availableSpaceTags: Object.freeze({
    general: [
      'archival',
      'big-data',
      'copyrighted',
      'demo',
      'dynamic',
      'experiment',
      'EU-funded',
      'images',
      'incomplete',
      'multidimensional-data',
      'open-data',
      'open-science',
      'preliminary',
      'raw-data',
      'simulation',
      'spatial-data',
      'static',
      'text-data',
      'training-set',
      'videos',
    ],
    domains: [
      'agriculture',
      'culture',
      'economy',
      'education',
      'energy',
      'environment',
      'finance',
      'fisheries',
      'food',
      'forestry',
      'government',
      'health',
      'international-issues',
      'justice',
      'legal-system',
      'population',
      'public-safety',
      'public-sector',
      'regions-and-cities',
      'science',
      'society',
      'sport',
      'technology',
      'transport',
    ],
  }),
  spaceMarketplaceEnabled: true,
  spaceMarketplaceMinBackoffBetweenReminders: 60 * 60,
  spaceMarketplaceMinBackoffAfterRejection: 60 * 60,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('onezoneRecord', EmberObject.create({
      name: zoneName,
      domain: zoneDomain,
      serviceType: 'onezone',
    }));
  },
});
