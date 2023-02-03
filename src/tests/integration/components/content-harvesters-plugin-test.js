import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { resolve } from 'rsvp';

const DataDiscoveryResourcesService = Service.extend({
  createAppProxyObject() {},
});

function resolvingAjax() {
  return resolve();
}

describe('Integration | Component | content harvesters plugin', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'data-discovery-resources', DataDiscoveryResourcesService);
  });

  it('injects data through appProxy', async function () {
    const dataDiscoveryResources = lookupService(this, 'data-discovery-resources');
    const injectedData = {};
    sinon.stub(dataDiscoveryResources, 'createAppProxyObject')
      .returns(injectedData);
    this.set('resolvingAjax', resolvingAjax);
    await render(hbs `{{content-harvesters-plugin _ajax=resolvingAjax}}`);

    const iframe = find('iframe');
    const loadEvent = new Event('load');
    iframe.dispatchEvent(loadEvent);
    expect(iframe.appProxy).to.equal(injectedData);
  });
});
