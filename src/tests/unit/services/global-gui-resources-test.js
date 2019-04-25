import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { resolve, reject } from 'rsvp';

const RouterService = Service.extend({
  urlFor(routeName) {
    if (routeName === 'login') {
      return '#/login';
    }
  },
});

const CurrentUserService = Service.extend({
  currentUser: reject(),
  getCurrentUserRecord() {
    return this.get('currentUser');
  },
});

const DataDiscoveryResourcesService = Service.extend({
  esRequest() {
    this.set('esRequestCalled', true);
  },
  configRequest() {
    this.set('configRequestCalled', true);
  },
});

function setupService(service) {
  setProperties(service, {
    _window: {},
    _location: {
      origin: 'https://abcdef.com',
      pathname: '/ghi',
    },
  });
}

describe('Unit | Service | global gui resources', function () {
  setupTest('service:global-gui-resources', {});

  beforeEach(function () {
    registerService(this, 'router', RouterService);
    registerService(this, 'current-user', CurrentUserService);
    registerService(this, 'data-discovery-resources', DataDiscoveryResourcesService);
  }),

  it('injects esRequest into data-discovery scope', function () {
    const service = this.subject();
    setupService(service);
    service.initializeGlobalObject();
    const esRequest =
      get(service, '_window.onezoneGuiResources.dataDiscovery.esRequest');
    esRequest();

    const dataDiscoveryResources =
      lookupService(this, 'data-discovery-resources');
    expect(get(dataDiscoveryResources, 'esRequestCalled')).to.be.true;
  });

  it('injects configRequest into data-discovery scope', function () {
    const service = this.subject();
    setupService(service);
    service.initializeGlobalObject();
    const configRequest =
      get(service, '_window.onezoneGuiResources.dataDiscovery.configRequest');
    configRequest();

    const dataDiscoveryResources =
      lookupService(this, 'data-discovery-resources');
    expect(get(dataDiscoveryResources, 'configRequestCalled')).to.be.true;
  });

  it(
    'injects info about no logged in user into data-discovery scope',
    function () {
      const service = this.subject();
      setupService(service);
      service.initializeGlobalObject();
      const userRequest =
        get(service, '_window.onezoneGuiResources.dataDiscovery.userRequest');
      expect(userRequest).to.exist;
      return userRequest().then(value => expect(value).to.be.null);
    }
  );

  it(
    'injects info about logged in user into data-discovery scope',
    function () {
      const currentUser = lookupService(this, 'current-user');
      set(currentUser, 'currentUser', resolve({
        entityId: '123', 
        name: 'abc',
        alias: 'def',
      }));

      const service = this.subject();
      setupService(service);
      service.initializeGlobalObject();
      const userRequest =
        get(service, '_window.onezoneGuiResources.dataDiscovery.userRequest');
      expect(userRequest).to.exist;
      return userRequest().then(value => expect(value).to.deep.equal({
        id: '123', 
        name: 'abc',
        alias: 'def',
      }));
    }
  );

  it('injects info about login url into data-discovery scope', function () {
    const service = this.subject();
    setupService(service);
    service.initializeGlobalObject();
    const loginUrlRequest =
      get(service, '_window.onezoneGuiResources.dataDiscovery.loginUrlRequest');
    expect(loginUrlRequest).to.exist;
    return loginUrlRequest()
      .then(value => expect(value).to.equal('https://abcdef.com/ghi#/login'));
  });
});
