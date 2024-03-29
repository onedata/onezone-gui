import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { setProperties } from '@ember/object';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { suppressRejections } from '../../helpers/suppress-rejections';
import globals from 'onedata-gui-common/utils/globals';

const HarvesterManager = Service.extend({
  getGuiPluginConfig() {},
});

const RouterService = Service.extend({
  isActive() {},
  urlFor() {},
});

const CurrentUserService = Service.extend({
  getCurrentUserRecord() {},
});

describe('Unit | Service | data-discovery-resources', function () {
  setupTest();

  beforeEach(function () {
    registerService(this, 'router', RouterService);
    registerService(this, 'current-user', CurrentUserService);
    registerService(this, 'navigation-state', Service);
    registerService(this, 'harvester-manager', HarvesterManager);
  });

  it('constructs properly structured appProxy object', function () {
    const service = this.owner.lookup('service:data-discovery-resources');

    const appProxy = service.createAppProxyObject();

    [
      'dataRequest',
      'dataCurlCommandRequest',
      'configRequest',
      'viewModeRequest',
      'userRequest',
      'onezoneUrlRequest',
      'fileBrowserUrlRequest',
      'spacesRequest',
    ].forEach(fieldName => expect(appProxy[fieldName]).to.be.a('function'));
  });

  it(
    'injects rejected gui configuration response when harvester is not defined',
    function () {
      const service = this.owner.lookup('service:data-discovery-resources');

      const appProxy = service.createAppProxyObject();

      let errorOccurred = false;
      return appProxy.configRequest()
        .catch(() => errorOccurred = true)
        .then(() => expect(errorOccurred).to.be.true);
    }
  );

  it('injects gui configuration when harvester is defined', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
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
  });

  it('injects info about no signed in user into appProxy', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
    const currentUser = lookupService(this, 'current-user');
    sinon.stub(currentUser, 'getCurrentUserRecord')
      .returns(reject());

    const appProxy = service.createAppProxyObject();

    return appProxy.userRequest().then(value => expect(value).to.be.null);
  });

  it('injects info about signed in user into appProxy', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
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
    const service = this.owner.lookup('service:data-discovery-resources');
    const router = lookupService(this, 'router');
    sinon.stub(router, 'isActive')
      .withArgs('public.harvesters')
      .returns(true);

    const appProxy = service.createAppProxyObject();

    return appProxy.viewModeRequest()
      .then(value => expect(value).to.equal('public'));
  });

  it('injects info about viewMode (private) into appProxy', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
    const router = lookupService(this, 'router');
    sinon.stub(router, 'isActive')
      .withArgs('public.harvesters')
      .returns(false);

    const appProxy = service.createAppProxyObject();

    return appProxy.viewModeRequest()
      .then(value => expect(value).to.equal('private'));
  });

  it('injects info about onezone url into appProxy', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
    globals.mock('location', {
      origin: 'https://abcdef.com',
      pathname: '/ghi',
    });

    const appProxy = service.createAppProxyObject();

    return appProxy.onezoneUrlRequest()
      .then(value => expect(value).to.equal('https://abcdef.com/ghi'));
  });

  it('injects info about how file browser url looks like for specific file',
    async function () {
      const service = this.owner.lookup('service:data-discovery-resources');
      const cdmiObjectId =
        '000000000046600A67756964236532663736356461333239633230636262353930613534656233613731333264233833393832313965633065323236303435636437643836633239383034313061';
      const expectedUrl = `https://example.com/file/${cdmiObjectId}`;

      sinon.stub(service, 'getFileBrowserUrl')
        .withArgs(cdmiObjectId)
        .returns(expectedUrl);

      const appProxy = service.createAppProxyObject();

      const url = await appProxy.fileBrowserUrlRequest(cdmiObjectId);
      expect(url).to.equal(expectedUrl);
    }
  );

  it(
    'injects no info about how file browser url looks like for specific file when passed cdmiObjectId is incorrect',
    function () {
      const cdmiObjectId = null;

      const service = this.owner.lookup('service:data-discovery-resources');
      const appProxy = service.createAppProxyObject();

      return appProxy.fileBrowserUrlRequest(cdmiObjectId)
        .then(url => expect(url).to.equal(''));
    }
  );

  it('injects info about harvester spaces', function () {
    const service = this.owner.lookup('service:data-discovery-resources');
    const navigationState = lookupService(this, 'navigation-state');
    setProperties(navigationState, {
      activeResourceType: 'harvesters',
      activeResource: {
        entityId: 'someId',
        hasViewPrivilege: true,
        getRelation(name) {
          return name === 'spaceList' ? resolve({
            list: promiseArray(resolve([{
              entityId: 'space1Id',
              name: 'space1',
            }, {
              entityId: 'space2Id',
              name: 'space2',
            }])),
          }) : reject();
        },
      },
    });

    const appProxy = service.createAppProxyObject();

    return appProxy.spacesRequest().then(spaces =>
      expect(spaces).to.deep.equal([{
        id: 'space1Id',
        name: 'space1',
      }, {
        id: 'space2Id',
        name: 'space2',
      }])
    );
  });

  it('injects no info about harvester spaces (no harvester specified)', function () {
    const service = this.owner.lookup('service:data-discovery-resources');

    const appProxy = service.createAppProxyObject();

    return appProxy.spacesRequest().then(spaces => expect(spaces).to.have.length(0));
  });

  it('injects no info about harvester spaces (no view privilege)', function () {
    suppressRejections();
    const service = this.owner.lookup('service:data-discovery-resources');
    const navigationState = lookupService(this, 'navigation-state');
    setProperties(navigationState, {
      activeResourceType: 'harvesters',
      activeResource: {
        entityId: 'someId',
        hasViewPrivilege: false,
        getRelation() {
          return reject({ id: 'forbidden ' });
        },
      },
    });

    const appProxy = service.createAppProxyObject();

    return appProxy.spacesRequest().then(spaces => expect(spaces).to.have.length(0));
  });
});
