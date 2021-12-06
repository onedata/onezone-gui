/**
 * A mocked abstraction layer for Onedata Sync API Websocket connection properties
 * For properties description see non-mocked `services/onedata-connection`
 *
 * @module services/mocks/onedata-connection
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataConnection from 'onedata-gui-websocket-client/services/mocks/onedata-connection';
import EmberObject, { computed } from '@ember/object';

const zoneName = 'Hello world';
const zoneDomain = location.hostname;

export default OnedataConnection.extend({
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
  onezoneRecord: computed(function onezoneRecord() {
    return EmberObject.create({
      name: zoneName,
      domain: zoneDomain,
      serviceType: 'onezone',
    });
  }),
});
