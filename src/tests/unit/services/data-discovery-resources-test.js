import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { set, setProperties } from '@ember/object';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';

const HarvesterManager = Service.extend({
  getGuiPluginConfig() {},
});

const RouterService = Service.extend({
  isActive() {},
});

const CurrentUserService = Service.extend({
  getCurrentUserRecord() {},
});

describe('Unit | Service | data discovery resources', function () {
  setupTest('service:data-discovery-resources', {});

  beforeEach(function () {
    registerService(this, 'router', RouterService);
    registerService(this, 'current-user', CurrentUserService);
    registerService(this, 'navigation-state', Service);
    registerService(this, 'harvester-manager', HarvesterManager);
  }),

  it('constructs properly structured appProxy object', function () {
    const service = this.subject();

    const appProxy = service.createAppProxyObject();

    [
      'dataRequest',
      'configRequest',
      'viewModeRequest',
      'userRequest',
      'onezoneUrlRequest',
    ].forEach(fieldName => expect(appProxy[fieldName]).to.be.a('function'));
  });

  it(
    'injects rejected gui configuration response when haravester is not defined',
    function () {
      const service = this.subject();

      const appProxy = service.createAppProxyObject();

      let errorOccurred = false;
      return appProxy.configRequest()
        .catch(() => errorOccurred = true)
        .then(() => expect(errorOccurred).to.be.true);
    }
  ),

  it('injects gui configuration when haravester is defined', function () {
    const service = this.subject();
    const navigationState = lookupService(this, 'navigation-state');
    const harvesterManager = lookupService(this, 'harvester-manager');
    setProperties(navigationState, {
      activeResourceType: 'harvesters',
      activeResource: {
        entityId: 'someId',
      },
    });
    const config = { a: 1 };
    sinon.stub(harvesterManager, 'getGuiPluginConfig')
      .returns(resolve({ guiPluginConfig: config }));

    const appProxy = service.createAppProxyObject();

    let errorOccurred = false;
    return appProxy.configRequest()
      .catch(() => errorOccurred = true)
      .then(config => {
        expect(errorOccurred).to.be.false;
        expect(config).to.deep.equal(config);
      });
  }),

  it('injects info about no signed in user into appProxy', function () {
    const service = this.subject();
    const currentUser = lookupService(this, 'current-user');
    sinon.stub(currentUser, 'getCurrentUserRecord')
      .returns(reject());

    const appProxy = service.createAppProxyObject();

    return appProxy.userRequest().then(value => expect(value).to.be.null);
  });

  it('injects info about signed in user into appProxy', function () {
    const service = this.subject();
    const currentUser = lookupService(this, 'current-user');
    const user = Object.freeze({
      entityId: '123', 
      fullName: 'abc',
      username: 'def',
    });
    sinon.stub(currentUser, 'getCurrentUserRecord')
      .returns(resolve(user));

    const appProxy = service.createAppProxyObject();

    return appProxy.userRequest().then(value => expect(value).to.deep.equal({
      id: user.entityId, 
      fullName: user.fullName,
      username: user.username,
    }));
  });

  it('injects info about viewMode (public) into appProxy', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    sinon.stub(router, 'isActive')
      .withArgs('public.harvesters')
      .returns(true);

    const appProxy = service.createAppProxyObject();

    return appProxy.viewModeRequest()
      .then(value => expect(value).to.equal('public'));
  });

  it('injects info about viewMode (internal) into appProxy', function () {
    const service = this.subject();
    const router = lookupService(this, 'router');
    sinon.stub(router, 'isActive')
      .withArgs('public.harvesters')
      .returns(false);

    const appProxy = service.createAppProxyObject();

    return appProxy.viewModeRequest()
      .then(value => expect(value).to.equal('internal'));
  });

  it('injects info about onezone url into appProxy', function () {
    const service = this.subject();
    set(service, '_location', {
      origin: 'https://abcdef.com',
      pathname: '/ghi',
    });

    const appProxy = service.createAppProxyObject();

    return appProxy.onezoneUrlRequest()
      .then(value => expect(value).to.equal('https://abcdef.com/ghi'));
  });
});
